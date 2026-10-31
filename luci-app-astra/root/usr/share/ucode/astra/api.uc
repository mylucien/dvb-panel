// SPDX-License-Identifier: Apache-2.0
// Shared helpers for luci-app-astra: local HTTP client for the astra control
// API (POST /control/, HTTP Basic auth) and small file/state utilities.
// Used by the rpcd plugin (luci.astra) and by the event monitor.

'use strict';

import { readfile, writefile, rename, unlink, mkdir, lsdir, chmod } from 'fs';
import * as socket from 'socket';

export const KEY_FILE   = '/etc/astra/api.key';
export const CONF_FILE  = '/etc/astra/astra.json';
export const STATE_DIR  = '/var/run/astra';
export const STATE_FILE = '/var/run/astra/state.json';
export const DEFAULT_PORT = 8000;

/*
 * Wait up to `timeout` ms for the socket to become readable (data, EOF or
 * error). NB: socket.poll() does NOT return an empty list on timeout, it
 * returns [[sock, 0]] -- the event bits have to be checked.
 */
export function readable(sock, timeout) {
	let ev = socket.poll(timeout, sock);

	return length(ev) > 0 && ev[0][1] != 0;
}

/* milliseconds on the monotonic clock */
export function now_ms() {
	let t = clock(true);
	return t[0] * 1000 + int(t[1] / 1000000);
}

/* "user:password" from the key file (root-only, created by astra-provision) */
export function read_key(path) {
	let t = trim(readfile(path ?? KEY_FILE) ?? '');
	let i = index(t, ':');

	return (i > 0) ? { user: substr(t, 0, i), pass: substr(t, i + 1) } : null;
}

export function auth_header(key) {
	return 'Authorization: Basic ' + b64enc(key.user + ':' + key.pass) + '\r\n';
}

/* parse JSON, never throws */
export function parse_json(text) {
	if (type(text) != 'string' || text == '')
		return null;

	try {
		return json(text);
	}
	catch (e) {
		return null;
	}
}

/* atomic JSON write: tmp file in the same directory, then rename */
export function write_json(path, obj, mode) {
	let tmp = path + '.tmp';

	if (!writefile(tmp, sprintf('%J', obj) + '\n'))
		return false;

	if (mode)
		chmod(tmp, mode);

	return rename(tmp, path) ? true : (unlink(tmp), false);
}

/*
 * Minimal HTTP/1.1 client for 127.0.0.1. Always "Connection: close".
 * Returns { status, body } or { error }.
 */
export function http(port, method, path, body, key, timeout) {
	timeout ??= 3000;

	let s = socket.connect('127.0.0.1', port, { family: socket.AF_INET }, timeout);

	if (!s)
		return { error: 'connect failed (astra not running?)' };

	let req = sprintf('%s %s HTTP/1.1\r\nHost: 127.0.0.1:%d\r\nConnection: close\r\n', method, path, port);

	if (key)
		req += auth_header(key);

	if (body != null)
		req += sprintf('Content-Type: application/json\r\nContent-Length: %d\r\n', length(body));

	req += '\r\n' + (body ?? '');

	if (s.send(req) == null) {
		let e = socket.error();
		s.close();
		return { error: 'send: ' + e };
	}

	let data = '', hdr_len = -1, clen = -1, status = 0;
	let deadline = now_ms() + timeout;

	for (;;) {
		let left = deadline - now_ms();

		if (left <= 0) {
			s.close();
			return { error: 'timeout' };
		}

		if (!readable(s, left))
			continue;

		let chunk = s.recv(65536);

		if (chunk == null) {
			let e = socket.error();
			s.close();
			return { error: 'recv: ' + e };
		}

		if (chunk == '')
			break;				/* peer closed */

		data += chunk;

		if (hdr_len < 0) {
			let p = index(data, '\r\n\r\n');

			if (p < 0)
				continue;

			hdr_len = p + 4;

			let m = match(data, /^HTTP\/1\.[01] ([0-9]+)/);
			status = m ? +m[1] : 0;

			m = match(substr(data, 0, hdr_len), /[Cc]ontent-[Ll]ength: *([0-9]+)/);
			clen = m ? +m[1] : -1;
		}

		if (clen >= 0 && length(data) - hdr_len >= clen)
			break;
	}

	s.close();

	if (hdr_len < 0)
		return { error: 'bad response' };

	return { status: status, body: substr(data, hdr_len) };
}

/*
 * Call an astra control command.
 * Returns { ok: true, data } or { ok: false, error, status? }.
 * astra reports command failures as HTTP 200 + { error: "..." }.
 */
export function control(port, cmd, args, key, timeout) {
	if (key == null)
		return { ok: false, error: 'no-key' };

	let payload = { cmd: cmd };

	for (let k, v in (args ?? {}))
		payload[k] = v;

	let r = http(port, 'POST', '/control/', sprintf('%J', payload), key, timeout);

	if (r.error)
		return { ok: false, error: r.error };

	if (r.status == 401 || r.status == 403)
		return { ok: false, error: 'auth', status: r.status };

	if (r.status != 200)
		return { ok: false, error: 'http ' + r.status, status: r.status };

	let d = parse_json(r.body);

	if (type(d) == 'object' && d.error != null)
		return { ok: false, error: '' + d.error };

	return { ok: true, data: d };
}

/* pid of the running astra binary (not astra-run, not this helper) */
export function find_pid() {
	for (let ent in (lsdir('/proc') ?? [])) {
		if (!match(ent, /^[0-9]+$/))
			continue;

		let cl = readfile('/proc/' + ent + '/cmdline');

		if (cl && index(cl, '/usr/lib/astra/bin/astra') == 0)
			return +ent;
	}

	return null;
}
