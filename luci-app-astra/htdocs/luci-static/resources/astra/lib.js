'use strict';
'require baseclass';
'require fs';
'require rpc';
'require ui';

/*
 * luci-app-astra shared library: RPC wrappers for the luci.astra backend,
 * configuration helpers (ids, URLs), signal conversions and a small form
 * builder. The data model mirrors the original Astra panel so existing
 * astra.json files keep working unchanged.
 */

const callStatus = rpc.declare({ object: 'luci.astra', method: 'getStatus', expect: { '': {} } });
const callState = rpc.declare({ object: 'luci.astra', method: 'getState', params: ['log_since'], expect: { '': {} } });
const callControl = rpc.declare({ object: 'luci.astra', method: 'control', params: ['cmd', 'args'], expect: { '': {} } });
const callQuery = rpc.declare({ object: 'luci.astra', method: 'query', params: ['cmd', 'args'], expect: { '': {} } });

/* commands that only read; they use the read-only ubus method */
const READ_CMDS = { status: true, version: true, load: true, log: true, sessions: true };
const callDvbList = rpc.declare({ object: 'luci.astra', method: 'getDvbList', expect: { '': {} } });

const DEFAULT_GID = 466560;

/* adapter types -> family (decides which tuning fields apply) */
const TYPE_FAMILY = {
	'S': 'S', 'S2': 'S', 'T': 'T', 'T2': 'T', 'ATSC': 'ATSC', 'ISDBT': 'ISDBT',
	'C': 'C', 'C/A': 'C', 'C/B': 'C', 'C/C': 'C'
};

const URL_FORMATS_IN = ['dvb', 'http', 'udp', 'rtp', 'rtsp', 'file'];
const URL_FORMATS_OUT = ['http', 'udp', 'rtp', 'resi', 'np', 'file'];

/*
 * LuCI's E() writes a lone string child with innerHTML, but turns array items
 * into text nodes. Everything that can come from outside (client names, log
 * lines, USB product strings, astra error texts, names in a config) goes
 * through this helper so it can never be interpreted as markup.
 */
function txt(v) {
	return [ String((v === undefined || v === null) ? '' : v) ];
}

function clone(o) {
	return (o === undefined) ? undefined : JSON.parse(JSON.stringify(o));
}

function isObject(o) {
	return o !== null && typeof o === 'object' && !Array.isArray(o);
}

/* ---- URL <-> object (port of the original panel's parseUrl/makeUrl) ---- */

const parseUrlFormat = {};

parseUrlFormat.udp = function(r) {
	let b = r.addr.indexOf('/');

	if (b != -1)
		r.addr = r.addr.substring(0, b);

	b = r.addr.indexOf('@');

	if (b != -1) {
		if (b > 0)
			r.localaddr = r.addr.substring(0, b);

		r.addr = r.addr.substring(b + 1);
	}

	b = r.addr.indexOf(':');

	if (b != -1) {
		r.port = Number(r.addr.substring(b + 1));

		if (isNaN(r.port) || r.port < 1 || r.port > 65535)
			return false;

		r.addr = r.addr.substring(0, b);
	}
	else {
		r.port = 1234;
	}

	if (!r.addr.length)
		return false;

	const a = r.addr.split('.');

	if (a.length > 4)
		return false;

	while (a.length) {
		const o = Number(a.shift());

		if (isNaN(o) || o < 0 || o > 255)
			return false;
	}

	return true;
};
parseUrlFormat.rtp = parseUrlFormat.udp;

parseUrlFormat.http = function(r) {
	let b = r.addr.indexOf('/');

	if (b != -1) {
		r.path = r.addr.substring(b);
		r.addr = r.addr.substring(0, b);
	}
	else {
		r.path = '/';
	}

	b = r.addr.indexOf('@');

	if (b != -1) {
		if (b > 0) {
			const a = r.addr.substring(0, b).split(':');

			if (a.length == 2) {
				r.login = a[0];
				r.password = a[1];
			}
		}

		r.addr = r.addr.substring(b + 1);
	}

	b = r.addr.indexOf(':');

	if (b != -1) {
		r.port = Number(r.addr.substring(b + 1));

		if (isNaN(r.port) || r.port < 1 || r.port > 65535)
			return false;

		r.host = r.addr.substring(0, b);
	}
	else {
		switch (r.format) {
		case 'https': r.port = 443; break;
		case 'rtsp': r.port = 554; break;
		default: r.port = 80; break;
		}

		r.host = r.addr;
	}

	delete r.addr;

	return r.host.length > 0;
};
parseUrlFormat.https = parseUrlFormat.http;
parseUrlFormat.rtsp = parseUrlFormat.http;
parseUrlFormat.np = parseUrlFormat.http;

parseUrlFormat.file = function(r) {
	r.filename = r.addr;
	delete r.addr;

	return true;
};

function parseUrl(url) {
	if (!url)
		return null;

	let b = url.indexOf('://');

	if (b == -1 || url.length <= b + 3)
		return null;

	const r = {};

	r.format = url.substring(0, b);
	url = url.substring(b + 3);
	b = url.indexOf('#');

	if (b == -1) {
		r.addr = url;
	}
	else {
		r.addr = url.substring(0, b);

		const parts = url.substring(b + 1).split('&');

		for (let i = 0; i < parts.length; ++i) {
			const o = parts[i].split('=');

			r[o[0]] = (o.length == 2) ? o[1] : true;
		}
	}

	if (parseUrlFormat.hasOwnProperty(r.format) && !parseUrlFormat[r.format](r))
		return null;

	return r;
}

const makeUrlFormat = {};

makeUrlFormat.udp = function(d) {
	if (d.localaddr) {
		d.addr = d.localaddr + '@' + d.addr;
		delete d.localaddr;
	}

	if (d.port) {
		d.addr += ':' + d.port;
		delete d.port;
	}
};
makeUrlFormat.rtp = makeUrlFormat.udp;

makeUrlFormat.http = function(d) {
	d.addr = '';

	if (d.login) {
		d.addr += d.login;
		delete d.login;

		if (d.password) {
			d.addr += ':' + d.password;
			delete d.password;
		}

		d.addr += '@';
	}

	if (d.host) {
		d.addr += (d.host != '0.0.0.0') ? d.host : '0';
		delete d.host;
	}

	if (d.port) {
		d.addr += ':' + d.port;
		delete d.port;
	}

	if (d.path) {
		d.addr += d.path;
		delete d.path;
	}
};
makeUrlFormat.https = makeUrlFormat.http;
makeUrlFormat.rtsp = makeUrlFormat.http;
makeUrlFormat.np = makeUrlFormat.http;

makeUrlFormat.file = function(d) {
	d.addr = d.filename;
	delete d.filename;
};

function makeUrl(data) {
	const d = clone(data);

	if (makeUrlFormat.hasOwnProperty(d.format))
		makeUrlFormat[d.format](d);

	let r = d.format + '://' + (d.addr || '');
	const o = [];

	delete d.format;
	delete d.addr;

	for (const k in d) {
		const v = d[k];

		if (!v)
			continue;
		else if (v === true)
			o.push(k);
		else
			o.push(k + '=' + v);
	}

	if (o.length)
		r += '#' + o.join('&');

	return r;
}

/*
 * Output addresses for display. astra stores the listening side as host "0"
 * (any interface), which is useless as a link, so the host the page was
 * loaded from is substituted in - clicking then plays the stream directly.
 */
function outputLinks(list) {
	const out = [];

	for (const u of (list || [])) {
		if (!u)
			continue;

		const m = /^(https?):\/\/([^\/?#]*)(.*)$/i.exec(u);

		if (!m) {
			out.push(E('div', {}, txt(u)));
			continue;
		}

		const parts = m[2].split(':');
		const host = (parts[0] == '0' || parts[0] == '0.0.0.0')
			? window.location.hostname + (parts[1] ? ':' + parts[1] : '')
			: m[2];
		const href = m[1] + '://' + host + (m[3] || '/');

		/* the text is the URL that actually works from this browser; the
		 * configured value (host "0") stays available as the tooltip */
		out.push(E('div', {}, E('a', {
			'href': href,
			'title': u,
			'target': '_blank',
			'rel': 'noopener noreferrer'
		}, txt(href))));
	}

	return out.length ? out : '–';
}

/* null if the URL is acceptable, else a message */
function urlError(url, formats) {
	if (url == null || url === '')
		return _('Address is empty');

	const p = parseUrl(url);

	if (!p)
		return _('Invalid address');

	if (formats && formats.indexOf(p.format) < 0)
		return _('Unsupported type "%s"').format(p.format);

	return null;
}

/* ---- ids ---- */

function makeUid(cfg, type) {
	const arr = cfg[type] || [];

	if (!cfg.gid)
		cfg.gid = DEFAULT_GID;

	for (;;) {
		cfg.gid = cfg.gid + 1;

		const r = cfg.gid.toString(36);

		if (!arr.some(function(x) { return x.id == r; }))
			return r;
	}
}

/* ---- live signal, same math as the original panel ---- */

function signalView(ev, rawSignal, now) {
	const res = {
		fresh: false, lock: false, flags: '_____', svalue: 0, qvalue: 0,
		ber: 0, unc: 0, bitrate: 0, raw: !!rawSignal
	};

	if (!ev || (now - ev.ts) > 3)
		return res;

	const st = ev.status | 0, letters = 'SCVYL';

	res.fresh = true;
	res.lock = (st & 0x10) !== 0;
	res.flags = '';

	for (let i = 0; i < 5; i++)
		res.flags += (st & (1 << i)) ? letters[i] : '_';

	res.bitrate = ev.bitrate || 0;

	/* -1 means "not reported by this demodulator" */
	const err = function(x) {
		return (x === undefined || x === null || x < 0) ? '–' : ((x > 99) ? '99+' : x);
	};

	res.ber = err(ev.ber);
	res.unc = err(ev.unc);

	if (rawSignal) {
		res.svalue = ev.signal;
		res.qvalue = (ev.snr / 10).toFixed(1);
	}
	else {
		res.svalue = Math.floor(((ev.signal || 0) * 99) / 65535);
		res.qvalue = Math.floor(((ev.snr || 0) * 99) / 65535);
	}

	return res;
}

/*
 * Stream state. astra emits two kinds of stream_event: per input (input_id
 * set) and per channel (no input_id). This build sends only the per-input
 * ones, so the channel level "total" object usually does not exist - the
 * state has to be derived from the inputs as well, otherwise every stream
 * would read "offline" forever.
 *
 *   onair   - at least one input is on air (or the channel-level event says so)
 *   waiting - the stream exists and reports fresh input events, but no input
 *             has data yet (tuner locked without TS, source unreachable, ...)
 *   offline - nothing reported: the stream is not running right now
 */
function streamView(entry, now) {
	const res = {
		state: 'offline', bitrate: 0, cc: 0, pes: 0, scrambled: false,
		inputs: {}, fresh: false
	};

	if (!entry)
		return res;

	const t = entry.total, totalFresh = !!t && (now - t.ts) <= 3;
	let anyFresh = false, anyOnair = false, sum = 0;

	if (totalFresh) {
		res.bitrate = t.bitrate || 0;
		res.cc = t.cc_error || 0;
		res.pes = t.pes_error || 0;
		res.scrambled = !!t.scrambled;
	}

	for (const k in (entry.input || {})) {
		const i = entry.input[k];

		if ((now - i.ts) > 3)
			continue;

		anyFresh = true;
		anyOnair = anyOnair || !!i.onair;
		sum += i.bitrate || 0;

		res.inputs[k] = {
			onair: !!i.onair, bitrate: i.bitrate || 0,
			cc: i.cc_error || 0, pes: i.pes_error || 0, scrambled: !!i.scrambled
		};
	}

	if (totalFresh ? (t.onair || anyOnair) : anyOnair) {
		res.state = 'onair';
	}
	else if (anyFresh || totalFresh) {
		res.state = 'waiting';
	}

	if (res.state != 'onair')
		res.bitrate = 0;
	else if (!res.bitrate)
		res.bitrate = sum;

	if (res.state == 'onair' && !totalFresh) {
		res.cc = 0;
		res.pes = 0;

		for (const k in res.inputs) {
			res.cc += res.inputs[k].cc;
			res.pes += res.inputs[k].pes;
			res.scrambled = res.scrambled || res.inputs[k].scrambled;
		}
	}

	res.fresh = totalFresh || anyFresh;

	return res;
}

function fmtBitrate(kbit) {
	kbit = Number(kbit) || 0;

	return (kbit >= 1000) ? (kbit / 1000).toFixed(2) + ' Mbit/s' : kbit + ' kbit/s';
}

function fmtUptime(seconds) {
	let m = Math.floor((Number(seconds) || 0) / 60);
	const h = Math.floor(m / 60);

	m = m % 60;

	return h + ':' + (m < 10 ? '0' + m : m);
}

/* ---- error texts ---- */

function errorText(e) {
	const s = String((e && e.message) || e || '');

	if (s == 'auth')
		return _('Authentication to astra failed. Restart the Astra service so it can re-provision its API key.');
	if (s == 'no-key')
		return _('The API key does not exist yet. Start the Astra service once to create it.');
	if (s.indexOf('connect failed') == 0)
		return _('Astra is not running.');
	if (s == 'timeout')
		return _('Astra did not answer in time.');
	if (s == 'adapter not configured')
		return _('This adapter is not in the configuration.');

	return s;
}

/* ---- form builder ---- */

/*
 * fields: [{ name, label, type, options, required, hint, placeholder,
 *            min, max, depends(values), validate(value, values) }]
 * type: text | number | password | select | bool | textarea | header
 * Returns { node, collect() } where collect() -> { ok, values }.
 */
function buildForm(fields, initial) {
	const rows = {}, inputs = {}, errors = {};
	const root = E('div', { 'class': 'astra-form' });

	function read(f) {
		const el = inputs[f.name];

		if (!el)
			return undefined;

		switch (f.type) {
		case 'bool':
			return el.checked;
		case 'number':
			return (el.value.trim() === '') ? undefined : Number(el.value);
		case 'select':
			return (el.value === '') ? undefined : el.value;
		default:
			return (el.value.trim() === '') ? undefined : el.value.trim();
		}
	}

	function current() {
		const v = {};

		fields.forEach(function(f) {
			if (f.type != 'header')
				v[f.name] = read(f);
		});

		return v;
	}

	function visible(f, vals) {
		return typeof f.depends != 'function' || !!f.depends(vals);
	}

	function refresh() {
		const vals = current();

		fields.forEach(function(f) {
			if (rows[f.name])
				rows[f.name].style.display = visible(f, vals) ? '' : 'none';
		});
	}

	fields.forEach(function(f) {
		let input, init = initial ? initial[f.name] : undefined;

		if (f.type == 'header') {
			rows[f.name] = E('h4', { 'class': 'astra-form-header' }, txt(f.label));
			root.appendChild(rows[f.name]);
			return;
		}

		switch (f.type) {
		case 'bool':
			input = E('input', { type: 'checkbox', 'class': 'cbi-input-checkbox' });
			input.checked = (init === undefined) ? !!f.default : !!init;
			break;

		case 'select': {
			const opts = (f.options || []).slice();
			let want = (init === undefined || init === null) ? f.default : init;

			/* nothing given: behave like a browser and take the first option */
			if (want === undefined || want === null)
				want = opts.length ? opts[0][0] : '';

			want = String(want);

			/* a stored value that is not offered (e.g. a hand-written address) must not vanish */
			if (!opts.some(function(o) { return String(o[0]) === want; }))
				opts.push([want, want]);

			input = E('select', { 'class': 'cbi-input-select' },
				opts.map(function(o) { return E('option', { value: String(o[0]) }, txt(o[1])); }));
			input.value = want;
			break;
		}

		case 'textarea':
			input = E('textarea', { 'class': 'cbi-input-textarea', rows: f.rows || 4, style: 'width:100%' });
			input.value = (init === undefined) ? (f.default ?? '') : init;
			break;

		default:
			input = E('input', {
				type: (f.type == 'number') ? 'number' : (f.type == 'password' ? 'password' : 'text'),
				'class': 'cbi-input-text',
				placeholder: f.placeholder || ''
			});
			if (f.type == 'number') {
				if (f.min !== undefined) input.min = f.min;
				if (f.max !== undefined) input.max = f.max;
				input.step = 'any';
			}
			input.value = (init === undefined || init === null) ? (f.default ?? '') : init;
			break;
		}

		if (f.readonly)
			input.disabled = true;

		input.addEventListener('change', refresh);
		input.addEventListener('input', function() {
			if (errors[f.name]) {
				errors[f.name].textContent = '';
				input.classList.remove('astra-invalid');
			}
		});

		inputs[f.name] = input;
		errors[f.name] = E('div', { 'class': 'astra-error' });

		rows[f.name] = E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ f.label, f.required ? E('span', { 'class': 'astra-req' }, ' *') : '' ]),
			E('div', { 'class': 'cbi-value-field' }, [
				input,
				f.hint ? E('div', { 'class': 'cbi-value-description' }, txt(f.hint)) : '',
				errors[f.name]
			])
		]);

		root.appendChild(rows[f.name]);
	});

	refresh();

	return {
		node: root,
		set: function(name, value) {
			const el = inputs[name];

			if (!el)
				return;

			if (el.type == 'checkbox')
				el.checked = !!value;
			else
				el.value = (value === undefined || value === null) ? '' : value;

			refresh();
		},
		get: function(name) {
			return current()[name];
		},
		collect: function() {
			const vals = current(), out = {};
			let ok = true;

			fields.forEach(function(f) {
				if (f.type == 'header')
					return;

				errors[f.name].textContent = '';
				inputs[f.name].classList.remove('astra-invalid');

				if (!visible(f, vals))
					return;

				let v = vals[f.name], msg = null;

				if (f.required && (v === undefined || v === ''))
					msg = _('This field is required');
				else if (v !== undefined && f.type == 'number' && isNaN(v))
					msg = _('Not a number');
				else if (v !== undefined && f.type == 'number' && f.min !== undefined && v < f.min)
					msg = _('Minimum is %s').format(f.min);
				else if (v !== undefined && f.type == 'number' && f.max !== undefined && v > f.max)
					msg = _('Maximum is %s').format(f.max);
				else if (v !== undefined && typeof f.validate == 'function') {
					const r = f.validate(v, vals);

					if (r !== true && r !== undefined && r !== null)
						msg = (typeof r == 'string') ? r : _('Invalid value');
				}

				if (msg) {
					ok = false;
					errors[f.name].textContent = msg;
					inputs[f.name].classList.add('astra-invalid');
				}

				if (v !== undefined)
					out[f.name] = v;
			});

			return { ok: ok, values: out };
		}
	};
}

/* ---- styles ---- */

function css() {
	return E('style', {}, [
		/* --- 适配器卡片 --- */
		/* --- 适配器卡片：居中排列，超出宽度自动换行 --- */
		'.astra-cards{display:flex;flex-wrap:wrap;justify-content:center;gap:.7em;margin:.4em 0}',
		'.astra-card{display:block;flex:0 1 21em;min-width:18em;max-width:26em;box-sizing:border-box;border:1px solid rgba(128,128,128,.35);border-radius:6px;padding:.7em .9em}',
		'.astra-cards>em{flex:1 1 100%;text-align:center}',
		/* --- 弹窗宽度（主题默认太窄） --- */
		'.modal.astra-modal{width:min(58em,94vw);max-width:none}',
		'.astra-card h4{margin:0 0 .5em;font-size:1em;display:flex;justify-content:space-between;align-items:center;gap:.5em}',
		'.astra-card.astra-off{opacity:.55}',
		'.astra-kv{display:flex;justify-content:space-between;gap:1em;font-size:.9em;line-height:1.55}',
		'.astra-kv>span:first-child{opacity:.7}',
		'.astra-kv>span:last-child{font-variant-numeric:tabular-nums}',
		'.astra-meter{display:flex;align-items:center;gap:.5em;margin:.2em 0}',
		'.astra-meter>label{width:1em;flex:none;opacity:.7;font-size:.9em}',
		'.astra-meter>.astra-bar{flex:1 1 auto;margin:0}',
		'.astra-meter>span{width:3.4em;flex:none;text-align:right;font-size:.85em;font-variant-numeric:tabular-nums}',
		'.astra-bar{height:.7em;background:rgba(128,128,128,.25);border-radius:3px;overflow:hidden;margin:.15em 0}',
		'.astra-bar>span{display:block;height:100%;width:0;background:#5cb85c;transition:width .3s}',
		'.astra-bar.astra-q>span{background:#5bc0de}',
		'.astra-bar.astra-warn>span{background:#f0ad4e}',
		'.astra-row{display:flex;justify-content:space-between;font-size:.85em}',
		'.astra-flags{font-family:monospace;letter-spacing:.15em}',
		'.astra-badge{display:inline-block;border-radius:3px;padding:0 .5em;font-size:.85em;color:#fff;background:#888;white-space:nowrap}',
		'.astra-badge.astra-ok{background:#5cb85c}.astra-badge.astra-bad{background:#d9534f}.astra-badge.astra-warn{background:#f0ad4e}',
		/* --- 表格 --- */
		'.astra-num{white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}',
		'.astra-nowrap{white-space:nowrap}',
		'.astra-url{font-size:.9em;line-height:1.6;word-break:break-all}',
		'.astra-left{text-align:left !important}',
		/* 流表格：固定列宽，列间距均匀，最后一列（输出）刚好贴到卡片右边缘 */
		'.astra-streams{table-layout:fixed}',
		'.astra-streams tr>:nth-child(1){width:16%}',
		'.astra-streams tr>:nth-child(2){width:14%}',
		'.astra-streams tr>:nth-child(3){width:17%}',
		'.astra-streams tr>:nth-child(4){width:10%}',
		'.astra-streams tr>:nth-child(5){width:10%}',
		'.astra-streams tr>:nth-child(6){width:12%}',
		'.astra-streams tr>:nth-child(7){width:21%}',
		/* --- 表单：标签列宽与主题原生 cbi-value 一致（bootstrap/argon 都是 flex:0 0 180px） --- */
		'.astra-form .cbi-value{display:flex;align-items:flex-start;gap:0;margin:.35em 0}',
		'.astra-form .cbi-value-title{flex:0 0 180px;max-width:180px;text-align:right;padding-top:.45em;font-weight:400;line-height:1.3;word-break:break-word}',
		'.astra-form .cbi-value-field{flex:1 1 auto;min-width:0}',
		'.astra-form .cbi-value-field input[type=text],.astra-form .cbi-value-field input[type=number],.astra-form .cbi-value-field input[type=password],.astra-form .cbi-value-field select{width:100%;max-width:34em;box-sizing:border-box}',
		/* --- 弹窗内：标签收窄成固定宽度，输入框撑满，宽弹窗才不会左右各留一大片空白 --- */
		'.modal.astra-modal .cbi-value{gap:.8em}',
		'.modal.astra-modal .astra-form .cbi-value-title{flex:0 0 11em;max-width:11em}',
		'.modal.astra-modal .astra-form .cbi-value-field input[type=text],.modal.astra-modal .astra-form .cbi-value-field input[type=number],.modal.astra-modal .astra-form .cbi-value-field select{max-width:none}',
		'.astra-form .cbi-value-field input[type=checkbox]{margin-top:.35em}',
		'.astra-form .cbi-value-description{font-size:.9em;opacity:.7;margin-top:.25em;line-height:1.35}',
		'.astra-error{color:#d9534f;font-size:.85em}',
		'.astra-hint{color:#b8860b;font-size:.9em;margin:.3em 0}',
		'.astra-hint:empty{display:none}',
		'.astra-invalid{border-color:#d9534f !important}',
		'.astra-req{color:#d9534f}',
		'.astra-form-header{margin:1.1em 0 .4em;padding-bottom:.25em;border-bottom:1px solid rgba(128,128,128,.3);font-weight:600}',
		/* --- 日志 --- */
		'.astra-log{font-family:monospace;font-size:.85em;white-space:pre-wrap;word-break:break-word;min-height:14em;max-height:32em;overflow:auto;border:1px solid rgba(128,128,128,.35);padding:.4em}',
		'.astra-log .l0{color:#5cb85c}.astra-log .l1{color:#d9534f}.astra-log .l2{color:#f0ad4e}.astra-log .l3{opacity:.6}',
		/* --- 输入/输出地址行 --- */
		'.astra-io{display:flex;gap:.3em;margin:.2em 0;align-items:center}.astra-io input[type=text]{flex:1 1 auto;min-width:0}',
		'.astra-io .cbi-button{flex:none;min-width:2.2em}'
	].join('\n'));
}

return baseclass.extend({
	DEFAULT_GID: DEFAULT_GID,
	TYPE_FAMILY: TYPE_FAMILY,
	URL_FORMATS_IN: URL_FORMATS_IN,
	URL_FORMATS_OUT: URL_FORMATS_OUT,

	clone: clone,
	isObject: isObject,
	parseUrl: parseUrl,
	makeUrl: makeUrl,
	outputLinks: outputLinks,
	urlError: urlError,
	makeUid: makeUid,
	signalView: signalView,
	streamView: streamView,
	fmtBitrate: fmtBitrate,
	fmtUptime: fmtUptime,
	errorText: errorText,
	txt: txt,
	buildForm: buildForm,
	css: css,

	status: function() { return callStatus(); },
	state: function(since) { return callState(since || 0); },
	dvbList: function() { return callDvbList(); },

	/* start/stop/restart the service; this LuCI has no luci.setInitAction */
	serviceAction: function(action) {
		return fs.exec('/etc/init.d/astra', [ action ]);
	},

	/* run a control command; resolves with the data or rejects with a readable error */
	api: function(cmd, args) {
		return (READ_CMDS[cmd] ? callQuery : callControl)(cmd, args || {}).then(function(r) {
			if (r && r.ok)
				return r.data;

			throw new Error(errorText(r ? r.error : 'no response'));
		});
	},

	/* the astra.json document, normalised so views never see undefined lists */
	loadConfig: function() {
		return this.api('load').then(function(cfg) {
			cfg = isObject(cfg) ? cfg : {};

			if (!Array.isArray(cfg.dvb_tune)) cfg.dvb_tune = [];
			if (!Array.isArray(cfg.make_stream)) cfg.make_stream = [];
			if (!cfg.gid) cfg.gid = DEFAULT_GID;

			return cfg;
		});
	},

	notify: function(msg, level) {
		ui.addNotification(null, E('p', {}, txt(msg)), level || 'info');
	},

	fail: function(err) {
		ui.addNotification(null, E('p', {}, txt(errorText(err))), 'danger');
	}
});
