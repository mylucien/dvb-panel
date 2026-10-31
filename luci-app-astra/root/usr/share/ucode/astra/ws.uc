// SPDX-License-Identifier: Apache-2.0
// Minimal RFC 6455 WebSocket client (text frames only) for astra's
// /control/event/ endpoint. Blocking sockets, driven by poll().

'use strict';

import { open } from 'fs';
import * as socket from 'socket';
import { now_ms, readable } from 'astra.api';

const MAX_FRAME = 1048576;

function rand_bytes(n) {
	let f = open('/dev/urandom', 'r');
	let r = f ? f.read(n) : null;

	if (f)
		f.close();

	if (length(r) != n) {
		r = '';
		for (let i = 0; i < n; i++)
			r += chr(int(time() * 7919 + i * 104729) & 255);
	}

	return r;
}

function send_frame(ws, op, payload) {
	let n = length(payload), hdr;

	if (n < 126)
		hdr = chr(0x80 | op, 0x80 | n);
	else if (n < 65536)
		hdr = chr(0x80 | op, 0x80 | 126, n >> 8, n & 255);
	else
		return false;

	let mask = rand_bytes(4), bytes = [];

	for (let i = 0; i < n; i++)
		push(bytes, ord(payload, i) ^ ord(mask, i % 4));

	return ws.sock.send(hdr + mask + (n ? chr(...bytes) : '')) != null;
}

/*
 * Open the event stream and authenticate.
 * Returns { sock, buf, closed } or { error }.
 */
export function ws_connect(port, key, timeout) {
	timeout ??= 3000;

	let s = socket.connect('127.0.0.1', port, { family: socket.AF_INET }, timeout);

	if (!s)
		return { error: 'connect failed' };

	let req = sprintf('GET /control/event/ HTTP/1.1\r\nHost: 127.0.0.1:%d\r\n' +
		'Upgrade: websocket\r\nConnection: Upgrade\r\n' +
		'Sec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n',
		port, b64enc(rand_bytes(16)));

	if (s.send(req) == null) {
		s.close();
		return { error: 'send failed' };
	}

	let data = '', deadline = now_ms() + timeout;

	while (index(data, '\r\n\r\n') < 0) {
		let left = deadline - now_ms();

		if (left <= 0 || !readable(s, left)) {
			s.close();
			return { error: 'handshake timeout' };
		}

		let c = s.recv(4096);

		if (c == null || c == '') {
			s.close();
			return { error: 'handshake closed' };
		}

		data += c;
	}

	if (!match(data, /^HTTP\/1\.1 101/)) {
		s.close();
		return { error: 'handshake refused' };
	}

	let p = index(data, '\r\n\r\n') + 4;
	let ws = { sock: s, buf: substr(data, p), closed: false, frag: null };

	/* astra expects the credentials as the first text frame */
	let a = sprintf('%J', { scope: 'auth', auth: key.user + ':' + key.pass });

	if (!send_frame(ws, 1, a)) {
		s.close();
		return { error: 'auth send failed' };
	}

	return ws;
}

/* extract all complete frames from ws.buf; returns array of text messages */
function parse_frames(ws) {
	let out = [];

	for (;;) {
		let b = ws.buf, n = length(b);

		if (n < 2)
			break;

		let b0 = ord(b, 0), b1 = ord(b, 1);
		let fin = !!(b0 & 0x80), op = b0 & 0x0f;
		let masked = !!(b1 & 0x80), len = b1 & 0x7f, off = 2;

		if (len == 126) {
			if (n < 4)
				break;
			len = (ord(b, 2) << 8) | ord(b, 3);
			off = 4;
		}
		else if (len == 127) {
			if (n < 10)
				break;
			len = 0;
			for (let i = 2; i < 10; i++)
				len = len * 256 + ord(b, i);
			off = 10;
		}

		if (len > MAX_FRAME) {
			ws.closed = true;
			break;
		}

		let mask = null;

		if (masked) {
			if (n < off + 4)
				break;
			mask = substr(b, off, 4);
			off += 4;
		}

		if (n < off + len)
			break;

		let payload = substr(b, off, len);

		if (mask) {
			let bytes = [];
			for (let i = 0; i < len; i++)
				push(bytes, ord(payload, i) ^ ord(mask, i % 4));
			payload = len ? chr(...bytes) : '';
		}

		ws.buf = substr(b, off + len);

		switch (op) {
		case 0:				/* continuation */
			if (ws.frag != null)
				ws.frag += payload;
			if (fin && ws.frag != null) {
				push(out, ws.frag);
				ws.frag = null;
			}
			break;

		case 1:				/* text */
			if (fin)
				push(out, payload);
			else
				ws.frag = payload;
			break;

		case 8:				/* close */
			ws.closed = true;
			break;

		case 9:				/* ping -> pong */
			send_frame(ws, 10, payload);
			break;
		}
	}

	return out;
}

/*
 * Wait up to `timeout` ms for data. Returns an array of received text
 * messages (empty on timeout). Sets ws.closed on EOF / error.
 */
export function ws_poll(ws, timeout) {
	if (ws.closed)
		return [];

	/* frames may already be buffered from the handshake read */
	if (length(ws.buf)) {
		let m = parse_frames(ws);

		if (length(m) || ws.closed)
			return m;
	}

	if (!readable(ws.sock, timeout))
		return [];

	let c = ws.sock.recv(65536);

	if (c == null || c == '') {
		ws.closed = true;
		return [];
	}

	ws.buf += c;

	return parse_frames(ws);
}

export function ws_close(ws) {
	if (ws.sock) {
		if (!ws.closed)
			send_frame(ws, 8, '');
		ws.sock.close();
		ws.sock = null;
	}

	ws.closed = true;
}
