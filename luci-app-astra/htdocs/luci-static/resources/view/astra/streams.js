'use strict';
'require view';
'require poll';
'require ui';
'require astra.lib as lib';

/*
 * Streams (astra "make_stream"). Inputs/outputs are URL lists; disabled
 * entries live in the parallel "_input" / "_output" lists exactly like the
 * original panel stores them. Anything the form does not manage (groups,
 * PID maps, CAS, MPTS configuration, ...) is editable as JSON and always
 * preserved on save.
 */

/* keys the form manages itself; everything else goes to the JSON box */
const MANAGED = [
	'enable', 'name', 'id', 'type', 'input', 'output', '_input', '_output', 'http_keep_active',
	'service_type', 'service_provider', 'service_name', 'textcode', 'hbbtv_url'
];

const CODEPAGES = [['', _('Default: Latin (ISO 6937)')], ['1', 'ISO 8859-1'], ['2', 'ISO 8859-2'], ['3', 'ISO 8859-3'],
	['4', 'ISO 8859-4'], ['5', 'ISO 8859-5 (Cyrillic)'], ['6', 'ISO 8859-6 (Arabic)'], ['7', 'ISO 8859-7 (Greek)'],
	['8', 'ISO 8859-8 (Hebrew)'], ['9', 'ISO 8859-9 (Turkish)'], ['10', 'ISO 8859-10'], ['11', 'ISO 8859-11 (Thai)'],
	['13', 'ISO 8859-13'], ['15', 'ISO 8859-15'], ['21', 'UTF-8']];

const CI_TOKEN = '__ci__';

function pick(o, keys) {
	const r = {};

	keys.forEach(function(k) { if (o[k] !== undefined) r[k] = o[k]; });

	return r;
}

function without(o, keys) {
	const r = {};

	Object.keys(o).forEach(function(k) { if (keys.indexOf(k) < 0) r[k] = o[k]; });

	return r;
}

/* ---- per-format wizard definitions ---- */

function wizardDefs(kind, format, ctx) {
	const pnr = { name: 'pnr', type: 'number', label: 'PNR', min: 1, max: 65535, hint: _('Program number') };
	const ddci = { name: 'ddci', type: 'number', label: 'DD-CI CAM', min: 0 };
	const softcam = {
		name: 'cam', type: 'select', label: _('CAM / SoftCAM'),
		options: [['', _('None')]].concat(format == 'dvb' ? [[CI_TOKEN, _('DVB-CI CAM')]] : [])
			.concat(ctx.softcams.map(function(c) { return [c.id, c.name || c.id]; }))
	};
	const ifaces = [['', _('Default: use system routes')]].concat(Object.keys(ctx.ifaces).map(function(n) {
		return [n, n + ' (' + ctx.ifaces[n] + ')'];
	}));

	if (kind == 'input') {
		switch (format) {
		case 'dvb':
			return [
				{ name: 'addr', type: 'select', label: _('Adapter'), required: true,
					options: [['', '']].concat(ctx.adapters.map(function(a) { return [a.id, a.name || a.id]; })) },
				{ name: 't2mi', type: 'number', label: 'T2-MI', min: 0 }, pnr, ddci, softcam,
				{ name: 'biss', type: 'text', label: _('BISS key'), hint: _('16 hex digits'),
					validate: function(v) { return /^[0-9a-fA-F]{16}$/.test(v) || _('Expected 16 hexadecimal digits'); } }
			];
		case 'http':
			return [
				{ name: 'address', type: 'text', label: _('HTTP address'), required: true, placeholder: 'http://…' },
				{ name: 'ua', type: 'text', label: 'User-Agent', hint: _('Default: Astra') },
				{ name: 'buffer_time', type: 'number', label: _('Buffer time'), hint: _('Seconds. Default: 2') },
				{ name: 'timeout', type: 'number', label: _('Timeout'), hint: _('Seconds. Default: 10') },
				{ name: 'sctp', type: 'bool', label: _('Use SCTP instead of TCP') }, pnr, ddci, softcam
			];
		case 'udp':
		case 'rtp':
			return [
				{ name: 'localaddr', type: 'select', label: _('Local interface'), options: ifaces },
				{ name: 'addr', type: 'text', label: _('Address'), required: true, hint: _('Source address, e.g. 239.1.1.1') },
				{ name: 'port', type: 'number', label: _('Port'), min: 1, max: 65535, hint: _('Default: 1234') },
				{ name: 'renew', type: 'number', label: _('Renew'), hint: _('Refresh multicast group membership') },
				{ name: 'socket_size', type: 'number', label: _('Socket size') }, pnr, ddci, softcam
			];
		case 'rtsp':
			return [
				{ name: 'address', type: 'text', label: _('RTSP address'), required: true, placeholder: 'rtsp://…' },
				{ name: 'tcp', type: 'bool', label: _('Interleaved mode (data over TCP)') }
			];
		case 'file':
			return [
				{ name: 'filename', type: 'text', label: _('File'), required: true, hint: _('Full path to the MPEG-TS file') },
				{ name: 'loop', type: 'bool', label: _('Repeat file') }, pnr
			];
		}
	}
	else {
		switch (format) {
		case 'http':
			return [
				{ name: 'host', type: 'select', label: _('Local interface'),
					options: [['0', _('Default: any interface')]].concat(Object.keys(ctx.ifaces).map(function(n) { return [ctx.ifaces[n], n + ' (' + ctx.ifaces[n] + ')']; })) },
				{ name: 'port', type: 'number', label: _('Port'), required: true, min: 1, max: 65535 },
				{ name: 'path', type: 'text', label: _('Path'), required: true, hint: _('Unique path of the stream, starts with /'),
					validate: function(v) { return v[0] == '/' || _('Must start with /'); } }
			];
		case 'udp':
		case 'rtp':
			return [
				{ name: 'localaddr', type: 'select', label: _('Local interface'), options: ifaces },
				{ name: 'addr', type: 'text', label: _('Address'), required: true, hint: _('Destination address') },
				{ name: 'port', type: 'number', label: _('Port'), min: 1, max: 65535, hint: _('Default: 1234') }
			];
		case 'resi':
			return [
				{ name: 'adapter', type: 'number', label: _('Adapter'), required: true, min: 0 },
				{ name: 'device', type: 'number', label: _('Device'), required: true, min: 0 },
				{ name: 'frequency', type: 'number', label: _('Frequency (MHz)'), required: true, hint: '114..858, step 8',
					validate: function(v) { return (v > 113 && v < 858 && ((v - 114) % 8) == 0) || _('114..858 MHz in steps of 8'); } },
				{ name: 'modulation', type: 'select', label: _('Modulation'), options: [['', _('Default: 64-QAM')],
					['QAM16', '16-QAM'], ['QAM32', '32-QAM'], ['QAM128', '128-QAM'], ['QAM256', '256-QAM']] },
				{ name: 'symbolrate', type: 'number', label: _('Symbol rate'), min: 1000, max: 7100 },
				{ name: 'attenuator', type: 'number', label: _('Attenuator'), min: 0, max: 31 }
			];
		case 'np':
			return [ { name: 'address', type: 'text', label: _('Address'), required: true, placeholder: 'np://…' } ];
		case 'file':
			return [ { name: 'filename', type: 'text', label: _('File'), required: true, hint: _('Full path to the MPEG-TS file') } ];
		}
	}

	return [];
}

const ADDRESS_KEYS = ['format', 'login', 'password', 'host', 'port', 'path'];

/* parsed URL -> initial wizard values */
function wizardInitial(format, p) {
	const v = {};

	if (!p)
		return v;

	Object.keys(p).forEach(function(k) { v[k] = p[k]; });

	if (format == 'http' || format == 'rtsp' || format == 'np') {
		const base = lib.makeUrl(pick(p, ADDRESS_KEYS));

		v.address = base.split('#')[0];
	}

	if (v.cam === true)
		v.cam = CI_TOKEN;

	if (v.sctp === 'true') v.sctp = true;

	return v;
}

/* wizard values + previous parse -> URL */
function wizardUrl(kind, format, vals, previous, defs) {
	const names = defs.map(function(d) { return d.name; });
	/* parameters the wizard knows nothing about stay exactly as they were */
	const extra = previous ? without(previous, names.concat(ADDRESS_KEYS, ['addr', 'format', 'filename', 'localaddr'])) : {};
	let obj = { format: format };

	if ((format == 'http' || format == 'rtsp' || format == 'np') && vals.address) {
		const p = lib.parseUrl(vals.address);

		if (!p)
			return null;

		obj = pick(p, ADDRESS_KEYS);
		obj.format = format;
	}

	Object.keys(vals).forEach(function(k) {
		if (k == 'address')
			return;

		let v = vals[k];

		if (k == 'cam')
			v = (v === CI_TOKEN) ? true : v;

		obj[k] = v;
	});

	return lib.makeUrl(Object.assign({}, obj, extra));
}

/* ---- the input/output list editor ---- */

function ioEditor(kind, enabled, disabled, ctx) {
	const formats = (kind == 'input') ? lib.URL_FORMATS_IN : lib.URL_FORMATS_OUT;
	const listNode = E('div', {});
	const rows = [];
	const example = (kind == 'input') ? 'udp://239.1.1.1:1234' : 'udp://239.2.2.2:5000';

	function move(row, delta) {
		const i = rows.indexOf(row), j = i + delta;

		if (j < 0 || j >= rows.length)
			return;

		rows.splice(i, 1);
		rows.splice(j, 0, row);
		redraw();
	}

	function redraw() {
		L.dom.content(listNode, rows.map(function(r) { return r.node; }));
	}

	function openWizard(row) {
		const cur = lib.parseUrl(row.url.value.trim());
		let format = cur && formats.indexOf(cur.format) >= 0 ? cur.format : formats[0];
		const holder = E('div', {});
		let form = null, defs = [];

		function build() {
			defs = wizardDefs(kind, format, ctx);
			form = lib.buildForm(defs, wizardInitial(format, (cur && cur.format == format) ? cur : null));

			const sel = E('select', { 'class': 'cbi-input-select' }, formats.map(function(f) {
				return E('option', { value: f, selected: (f == format) ? true : null }, lib.txt(f));
			}));

			sel.addEventListener('change', function() {
				format = sel.value;
				build();
			});

			L.dom.content(holder, [
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title' }, kind == 'input' ? _('Input type') : _('Output type')),
					E('div', { 'class': 'cbi-value-field' }, sel)
				]),
				form.node,
				E('div', { 'class': 'right' }, [
					E('button', { 'class': 'cbi-button', click: function() { row.panel.style.display = 'none'; } }, _('Close')),
					' ',
					E('button', { 'class': 'cbi-button cbi-button-action', click: function() {
						const r = form.collect();

						if (!r.ok)
							return;

						const u = wizardUrl(kind, format, r.values, (cur && cur.format == format) ? cur : null, defs);

						if (!u) {
							lib.notify(_('The address is invalid'), 'danger');
							return;
						}

						row.url.value = u;
						row.err.textContent = '';
						row.panel.style.display = 'none';
					} }, _('Apply'))
				])
			]);
		}

		build();
		L.dom.content(row.panel, holder);
		row.panel.style.display = (row.panel.style.display == 'none') ? '' : 'none';
	}

	function addRow(url, isEnabled) {
		const row = {};

		row.en = E('input', { type: 'checkbox', 'class': 'cbi-input-checkbox', title: _('Enabled') });
		row.en.checked = isEnabled;
		row.url = E('input', { type: 'text', 'class': 'cbi-input-text', placeholder: example });
		row.url.value = url || '';
		row.err = E('div', { 'class': 'astra-error' });
		row.panel = E('div', { style: 'display:none;margin:.3em 0 .6em 1.6em;padding:.4em;border-left:3px solid rgba(128,128,128,.4)' });
		row.node = E('div', {}, [
			E('div', { 'class': 'astra-io' }, [
				row.en, row.url,
				E('button', { 'class': 'cbi-button', title: _('Parameters'), click: function() { openWizard(row); } }, '⚙'),
				E('button', { 'class': 'cbi-button', title: _('Move up'), click: function() { move(row, -1); } }, '↑'),
				E('button', { 'class': 'cbi-button', title: _('Move down'), click: function() { move(row, 1); } }, '↓'),
				E('button', { 'class': 'cbi-button cbi-button-negative', title: _('Remove'), click: function() {
					rows.splice(rows.indexOf(row), 1);
					redraw();
				} }, '✕')
			]),
			row.err, row.panel
		]);

		rows.push(row);
	}

	enabled.forEach(function(u) { addRow(u, true); });
	disabled.forEach(function(u) { addRow(u, false); });
	redraw();

	return {
		node: E('div', {}, [
			listNode,
			E('button', { 'class': 'cbi-button cbi-button-add', click: function() { addRow('', true); redraw(); } },
				kind == 'input' ? _('Add input') : _('Add output'))
		]),
		collect: function() {
			const res = { ok: true, on: [], off: [] };

			rows.forEach(function(r) {
				const u = r.url.value.trim();

				r.err.textContent = '';

				if (u === '')
					return;

				const e = lib.urlError(u, formats);

				if (e) {
					r.err.textContent = e;
					res.ok = false;
					return;
				}

				(r.en.checked ? res.on : res.off).push(u);
			});

			return res;
		}
	};
}

return view.extend({
	load: function() {
		return Promise.all([
			lib.loadConfig(),
			L.resolveDefault(lib.state(-1), {}),
			L.resolveDefault(lib.status(), {})
		]);
	},

	render: function(data) {
		const self = this;

		self.cfg = data[0];
		self.live = data[1];
		self.service = data[2];
		self.cells = {};

		self.box = E('div', {});
		self.hint = E('div', { 'class': 'astra-hint' });
		self.draw();

		poll.add(function() {
			return lib.state(-1).then(function(s) {
				self.live = s;
				self.updateLive();
			});
		}, 2);

		return E([
			lib.css(),
			E('h2', {}, _('Streams')),
			E('div', { 'class': 'cbi-map-descr' }, _('Each stream takes one or more inputs and publishes them on its outputs. Disabled inputs and outputs are kept but ignored.')),
			self.hint,
			self.box
		]);
	},

	context: function() {
		return {
			adapters: this.cfg.dvb_tune,
			softcams: Array.isArray(this.cfg.softcam) ? this.cfg.softcam : [],
			ifaces: (this.service && this.service.ip_list) || {}
		};
	},

	draw: function() {
		const self = this, list = self.cfg.make_stream;

		self.cells = {};

		const head = E('tr', { 'class': 'tr table-titles' }, [
			_('Name'), _('Type'), _('Enabled'), _('Inputs'), _('Outputs'), _('State'), _('Bitrate'), ''
		].map(function(t) { return E('th', { 'class': 'th' }, t); }));

		const rows = list.map(function(s) {
			const c = { state: E('td', { 'class': 'td' }), bitrate: E('td', { 'class': 'td astra-num' }), cfg: s };

			self.cells[s.id] = c;

			return E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td' }, lib.txt(s.name || s.id)),
				E('td', { 'class': 'td astra-nowrap' }, lib.txt((s.type || 'spts').toUpperCase())),
				E('td', { 'class': 'td astra-nowrap' }, s.enable === false ? _('no') : _('yes')),
				E('td', { 'class': 'td astra-num' }, String((s.input || []).filter(Boolean).length)),
				E('td', { 'class': 'td astra-num' }, String((s.output || []).filter(Boolean).length)),
				c.state, c.bitrate,
				E('td', { 'class': 'td astra-nowrap' }, [
					E('button', { 'class': 'cbi-button cbi-button-action', click: function() { self.edit(s); } }, _('Edit')),
					' ',
					E('button', { 'class': 'cbi-button', disabled: (s.enable === false) ? true : null, click: function() { self.restart(s); } }, _('Restart')),
					' ',
					E('button', { 'class': 'cbi-button cbi-button-negative', click: function() { self.remove(s); } }, _('Delete'))
				])
			]);
		});

		L.dom.content(self.box, [
			list.length ? E('table', { 'class': 'table' }, [ head ].concat(rows)) : E('p', {}, E('em', {}, _('No streams configured yet.'))),
			E('div', { 'class': 'cbi-page-actions', style: 'text-align:left' }, [
				E('button', { 'class': 'cbi-button cbi-button-add', click: function() { self.edit(null); } }, _('Add stream'))
			])
		]);

		self.updateLive();
	},

	updateLive: function() {
		const live = this.live || {};
		const ref = (live.ts !== undefined && live.age !== undefined) ? live.ts + live.age : Math.floor(Date.now() / 1000);
		let waiting = 0, onair = 0;

		for (const id in this.cells) {
			const c = this.cells[id], v = lib.streamView((live.streams || {})[id], ref);
			let text = _('offline'), cls = 'astra-bad';

			if (c.cfg.enable === false) { text = _('disabled'); cls = ''; }
			else if (v.state == 'onair') { text = _('on air'); cls = 'astra-ok'; onair++; }
			else if (v.state == 'waiting') { text = _('waiting for data'); cls = 'astra-warn'; waiting++; }

			L.dom.content(c.state, E('span', { 'class': 'astra-badge ' + cls }, lib.txt(text)));
			c.bitrate.textContent = (v.state == 'onair') ? lib.fmtBitrate(v.bitrate) : '';
		}

		L.dom.content(this.hint, '');

		if (waiting && !onair) {
			const adapters = live.adapters || {};
			let locked = null, busy = false;

			for (const id in adapters) {
				if ((ref - adapters[id].ts) > 3)
					continue;

				if (adapters[id].bitrate > 0)
					busy = true;

				if (locked === null && ((adapters[id].status | 0) & 0x10))
					locked = id;
			}

			if (!busy && locked)
				L.dom.content(this.hint, _('Adapter %s reports a lock but carries no data, so the streams stay idle. Check the antenna, the power feed and the tuned frequency.').format(locked));
		}
	},

	reload: function() {
		const self = this;

		return lib.loadConfig().then(function(cfg) {
			self.cfg = cfg;
			self.draw();
		});
	},

	edit: function(existing) {
		const self = this, isNew = !existing, ctx = self.context();
		const cur = existing ? lib.clone(existing) : { enable: true, type: 'spts', input: [], output: [] };
		const keepActive = cur.http_keep_active;

		/*
		 * astra's set-stream dispatches on the type name; only spts exists as
		 * a handler, so offering mpts here would PANIC the daemon. Keep an
		 * existing non-spts value visible but do not let it be picked.
		 */
		const types = [['spts', _('Single program stream')]];

		if (cur.type && cur.type != 'spts')
			types.push([cur.type, cur.type]);

		const general = lib.buildForm([
			{ name: 'enable', type: 'bool', label: _('Enabled'), default: true },
			{ name: 'name', type: 'text', label: _('Name'), required: true },
			{ name: 'id', type: 'text', label: _('ID'), readonly: true, depends: function() { return !isNew; } },
			{ name: 'type', type: 'select', label: _('Type'), required: true, options: types },
			{ name: '$ondemand', type: 'bool', label: _('Start stream on demand') },
			{ name: 'http_keep_active', type: 'number', label: _('Keep active (s)'), min: 0,
				hint: _('Delay before stopping when nobody is connected. Default: 0'),
				depends: function(v) { return !!v.$ondemand; } }
		], Object.assign({}, cur, { $ondemand: keepActive !== -1, http_keep_active: keepActive === -1 ? undefined : keepActive }));

		const sdt = lib.buildForm([
			{ name: 'service_type', type: 'select', label: _('Service type'),
				options: [['', _('Default: original service type')], ['1', _('Video')], ['2', _('Radio')], ['3', _('Teletext')]] },
			{ name: 'service_provider', type: 'text', label: _('Service provider') },
			{ name: 'service_name', type: 'text', label: _('Service name') },
			{ name: 'textcode', type: 'select', label: _('Codepage'), options: CODEPAGES },
			{ name: 'hbbtv_url', type: 'text', label: _('HbbTV URL') }
		], cur);

		const inputs = ioEditor('input', (cur.input || []).filter(Boolean), (cur._input || []).filter(Boolean), ctx);
		const outputs = ioEditor('output', (cur.output || []).filter(Boolean), (cur._output || []).filter(Boolean), ctx);

		const rest = without(cur, MANAGED);
		const jsonBox = E('textarea', { 'class': 'cbi-input-textarea', rows: 8, style: 'width:100%;font-family:monospace' });
		const jsonErr = E('div', { 'class': 'astra-error' });

		jsonBox.value = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';

		const ok = function() {
			const g = general.collect(), s = sdt.collect(), i = inputs.collect(), o = outputs.collect();
			let extra = {};

			jsonErr.textContent = '';

			if (jsonBox.value.trim() !== '') {
				try {
					extra = JSON.parse(jsonBox.value);

					if (!lib.isObject(extra))
						throw new Error('not an object');
				}
				catch (e) {
					jsonErr.textContent = _('Invalid JSON: %s').format(e.message);
					return;
				}
			}

			if (!g.ok || !s.ok || !i.ok || !o.ok)
				return;

			/*
			 * Every key that is not form-managed was shown in the JSON box, so
			 * the box content replaces it wholesale; managed keys are rebuilt below.
			 */
			const out = Object.assign({}, extra);

			out.enable = g.values.enable !== false;
			out.name = g.values.name;
			out.type = g.values.type;
			out.id = existing ? existing.id : lib.makeUid(self.cfg, 'make_stream');

			if (!g.values.$ondemand)
				out.http_keep_active = -1;
			else if (g.values.http_keep_active !== undefined)
				out.http_keep_active = g.values.http_keep_active;

			Object.keys(s.values).forEach(function(k) { out[k] = s.values[k]; });
			/* like the original panel: empty lists are not stored at all */
			if (i.on.length) out.input = i.on;
			if (o.on.length) out.output = o.on;
			if (i.off.length) out._input = i.off;
			if (o.off.length) out._output = o.off;

			ui.hideModal();

			return lib.api('set-stream', { id: out.id, gid: self.cfg.gid, stream: out }).then(function() {
				return self.reload();
			}).then(function() {
				lib.notify(_('Stream "%s" saved').format(out.name), 'info');
			}).catch(lib.fail);
		};

		ui.showModal(isNew ? _('Add stream') : _('Edit stream'), [
			general.node,
			E('h4', { 'class': 'astra-form-header' }, _('Inputs')), inputs.node,
			E('h4', { 'class': 'astra-form-header' }, _('Outputs')), outputs.node,
			E('details', {}, [ E('summary', {}, _('Service information (SDT)')), sdt.node ]),
			E('details', {}, [
				E('summary', {}, _('Advanced (JSON)')),
				E('div', { 'class': 'cbi-value-description' }, _('All other stream properties (groups, PID maps, CAS, MPTS configuration, …).')),
				jsonBox, jsonErr
			]),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'cbi-button', click: ui.hideModal }, _('Cancel')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-positive important', click: ok }, _('Save'))
			])
		], 'astra-modal');
	},

	restart: function(s) {
		return lib.api('restart-stream', { id: s.id }).then(function() {
			lib.notify(_('Stream "%s" restarted').format(s.name || s.id), 'info');
		}).catch(lib.fail);
	},

	remove: function(s) {
		const self = this;

		if (!window.confirm(_('Delete stream "%s"?').format(s.name || s.id)))
			return;

		return lib.api('set-stream', { id: s.id, stream: { remove: true } }).then(function() {
			return self.reload();
		}).catch(lib.fail);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
