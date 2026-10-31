'use strict';
'require view';
'require poll';
'require ui';
'require astra.lib as lib';

/*
 * DVB adapters (astra "dvb_tune"): list with live signal, full editor.
 * Field set and ranges follow the original panel; unknown keys already in
 * astra.json are preserved when an adapter is saved.
 */

const FAMILY = lib.TYPE_FAMILY;

const MODULATIONS = [
	['', _('Default: Auto')], ['QPSK', 'QPSK'], ['QAM16', '16-QAM'], ['QAM32', '32-QAM'],
	['QAM64', '64-QAM'], ['QAM128', '128-QAM'], ['QAM256', '256-QAM'], ['VSB8', 'VSB8'],
	['VSB16', 'VSB16'], ['PSK8', '8PSK'], ['APSK16', 'APSK16'], ['APSK32', 'APSK32'], ['DQPSK', 'DQPSK']
];

const FEC = [['', _('Default: Auto')]].concat(
	['NONE', '1/2', '2/3', '3/4', '4/5', '5/6', '6/7', '7/8', '8/9', '3/5', '9/10'].map(function(x) { return [x, x]; }));

function range(lo, hi, unit) {
	return function(v) {
		return (!isNaN(v) && v >= lo && v <= hi) || _('Expected %s..%s %s').format(lo, hi, unit);
	};
}

function fields(isNew, detected) {
	const fam = function(v) { return FAMILY[v.type]; };
	const is = function() {
		const want = Array.prototype.slice.call(arguments);

		return function(v) { return want.indexOf(fam(v)) >= 0; };
	};
	const hasType = function(v) { return !!v.type; };

	return [
		{ name: 'enable', type: 'bool', label: _('Enabled'), default: true },
		{ name: 'name', type: 'text', label: _('Name'), required: true, placeholder: _('Adapter name') },
		{ name: 'id', type: 'text', label: _('ID'), readonly: true, depends: function() { return !isNew; } },

		{ name: 'adapter', type: 'number', label: _('Adapter'), min: 0, max: 31, required: true, default: 0,
			hint: detected },
		{ name: 'device', type: 'number', label: _('Device'), min: 0, max: 31, required: true, default: 0 },
		{ name: 'type', type: 'select', label: _('Type'), required: true, options: [
			['', ''], ['S', 'DVB-S'], ['S2', 'DVB-S2'], ['T', 'DVB-T'], ['T2', 'DVB-T2'], ['ATSC', 'ATSC'],
			['ISDBT', 'ISDB-T'], ['C', 'DVB-C'], ['C/A', 'DVB-C (Annex A)'], ['C/B', 'DVB-C (Annex B)'], ['C/C', 'DVB-C (Annex C)']
		] },

		{ name: '$h_tp', type: 'header', label: _('Transponder'), depends: hasType },
		{ name: 'frequency', type: 'number', label: _('Frequency (MHz)'), required: true, depends: hasType,
			validate: function(v, vals) {
				switch (fam(vals)) {
				case 'S': return range(950, 13249, 'MHz')(v);
				case 'T': return range(1, 1000, 'MHz')(v);
				case 'C': return range(80, 1000, 'MHz')(v);
				default: return range(0, 1000, 'MHz')(v);
				}
			} },
		{ name: 'polarization', type: 'select', label: _('Polarization'), required: true, depends: is('S'),
			options: [['', ''], ['V', _('Vertical')], ['H', _('Horizontal')], ['R', _('Right')], ['L', _('Left')]] },
		{ name: 'symbolrate', type: 'number', label: _('Symbol rate (kBd)'), required: true, depends: is('S', 'C'),
			validate: function(v, vals) { return (fam(vals) == 'S') ? range(1001, 49999, 'kBd')(v) : range(1001, 9999, 'kBd')(v); } },

		{ name: '$h_adv', type: 'header', label: _('Advanced'), depends: hasType },
		{ name: 'modulation', type: 'select', label: _('Modulation'), options: MODULATIONS, depends: hasType },
		{ name: 'fec', type: 'select', label: _('FEC'), options: FEC, depends: is('S', 'C') },
		{ name: 'rolloff', type: 'select', label: _('Roll-off'), depends: function(v) { return v.type == 'S2'; },
			options: [['', _('Default: 35')], ['25', '25'], ['20', '20'], ['AUTO', 'AUTO']] },
		{ name: 'stream_id', type: 'number', label: _('Stream ID / PLP ID'), min: 0, hint: _('Multistream filtering'),
			depends: function(v) { return v.type == 'S2' || fam(v) == 'T'; } },
		{ name: 'bandwidth', type: 'select', label: _('Bandwidth'), depends: is('T', 'ISDBT'),
			options: [['', _('Default: Auto')], ['6MHz', '6MHz'], ['7MHz', '7MHz'], ['8MHz', '8MHz']] },
		{ name: 'guardinterval', type: 'select', label: _('Guard interval'), depends: is('T'),
			options: [['', _('Default: Auto')]].concat(['1/32', '1/16', '1/8', '1/4', '1/128', '19/128', '19/256'].map(function(x) { return [x, x]; })) },
		{ name: 'transmitmode', type: 'select', label: _('Transmission mode'), depends: is('T'),
			options: [['', _('Default: Auto')]].concat(['1K', '2K', '4K', '8K', '16K', '32K'].map(function(x) { return [x, x]; })) },
		{ name: 'hierarchy', type: 'select', label: _('Hierarchy'), depends: is('T'),
			options: [['', _('Default: Auto')]].concat(['NONE', '1', '2', '4'].map(function(x) { return [x, x]; })) },

		{ name: '$h_lnb', type: 'header', label: _('LNB'), depends: is('S') },
		{ name: 'lof1', type: 'number', label: 'LOF1', hint: _('Low sub-band'), depends: is('S') },
		{ name: 'lof2', type: 'number', label: 'LOF2', hint: _('High sub-band'), depends: is('S') },
		{ name: 'slof', type: 'number', label: 'SLOF', hint: _('Sub-band range'), depends: is('S') },
		{ name: 'lnb_sharing', type: 'bool', label: _('LNB sharing'), hint: _('Disable LNB voltage supply and tone signal'), depends: is('S') },
		{ name: 'tone', type: 'bool', label: _('Force tone'), depends: is('S') },

		{ name: '$h_diseqc', type: 'header', label: 'DiSEqC', depends: is('S') },
		{ name: 'diseqc_mode', type: 'select', label: _('DiSEqC mode'), depends: is('S'),
			options: [['', _('Default: DiSEqC 1.0')], ['1.1', 'DiSEqC 1.1'], ['toneburst', _('Tone burst')], ['cmd', _('DiSEqC command')]] },
		{ name: 'diseqc', type: 'text', label: _('DiSEqC value'), depends: is('S'),
			hint: _('1..4 (DiSEqC 1.0), 1..16 (1.1), A/B (tone burst), or a raw command'),
			validate: function(v, vals) {
				switch (vals.diseqc_mode) {
				case '1.1': return range(1, 16, '')(Number(v));
				case 'toneburst': return (v == 'A' || v == 'B') || _('Expected A or B');
				case 'cmd': return true;
				default: return range(1, 4, '')(Number(v));
				}
			} },

		{ name: '$h_uni', type: 'header', label: 'Unicable', depends: is('S') },
		{ name: 'uni_scr', type: 'select', label: _('Unicable slot'), depends: is('S'),
			options: [['', _('Default: unicable disabled')]].concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(x) { return [x, x]; })) },
		{ name: 'uni_pos', type: 'select', label: _('Slot position'), depends: function(v) { return is('S')(v) && !!v.uni_scr; },
			options: [['', ''], ['A', 'A'], ['B', 'B']] },
		{ name: 'uni_frequency', type: 'number', label: _('Slot frequency (MHz)'), depends: function(v) { return is('S')(v) && !!v.uni_scr; },
			validate: range(950, 2149, 'MHz') },

		{ name: '$h_misc', type: 'header', label: _('Miscellaneous'), depends: hasType },
		{ name: 'timeout', type: 'text', label: _('Timeout'), hint: _('Seconds before checking DVR errors. Default: 2'), depends: hasType },
		{ name: 'ddci', type: 'text', label: 'DDCI', hint: _('Bind adapter to the DigitalDevices CI'), depends: hasType },
		{ name: 'budget', type: 'bool', label: _('Budget mode'), hint: _('Disable hardware PID filtering'), depends: hasType },
		{ name: 'raw_signal', type: 'bool', label: _('Signal in dBm'), depends: hasType },
		{ name: 'ca_pmt_delay', type: 'text', label: _('CA delay'), hint: _('Delay before initialising the CA module. Default: 3'), depends: hasType },
		{ name: 'buffer_size', type: 'number', label: _('DVR buffer size'), hint: _('1..200. Default: not set'), depends: hasType,
			validate: range(1, 199, 'MB') }
	];
}

return view.extend({
	load: function() {
		return Promise.all([
			lib.loadConfig(),
			L.resolveDefault(lib.dvbList(), { driver: false, nodes: [] }),
			L.resolveDefault(lib.state(-1), {}),
			L.resolveDefault(lib.status(), {})
		]);
	},

	render: function(data) {
		const self = this;

		self.cfg = data[0];
		self.dvb = data[1];
		self.live = data[2];
		self.service = data[3];
		self.cells = {};

		self.box = E('div', {});
		self.draw();

		poll.add(function() {
			return lib.state(-1).then(function(s) {
				self.live = s;
				self.updateLive();
			});
		}, 2);

		return E([
			lib.css(),
			E('h2', {}, _('Adapters')),
			E('div', { 'class': 'cbi-map-descr' }, _('DVB tuners used as stream inputs. A stream refers to an adapter by its ID (dvb://<id>).')),
			self.box
		]);
	},

	detectedHint: function() {
		const nodes = (this.dvb && this.dvb.nodes) || [];

		if (!nodes.length)
			return _('No DVB device was found in /dev/dvb.');

		return _('Detected: %s').format(nodes.map(function(n) {
			return 'adapter%d/device%d%s'.format(n.adapter, n.device, n.name ? ' (' + n.name + ')' : '');
		}).join(', '));
	},

	draw: function() {
		const self = this, list = self.cfg.dvb_tune;

		self.cells = {};

		const head = E('tr', { 'class': 'tr table-titles' }, [
			_('Name'), _('Type'), _('Device'), _('Frequency'), _('Enabled'), 'S', 'Q', _('Lock'), _('Bitrate'), ''
		].map(function(t) { return E('th', { 'class': 'th' }, t); }));

		const rows = list.map(function(a) {
			const c = {
				s: E('td', { 'class': 'td astra-num' }), q: E('td', { 'class': 'td astra-num' }),
				flags: E('td', { 'class': 'td astra-flags' }), bitrate: E('td', { 'class': 'td astra-num' }), cfg: a
			};

			self.cells[a.id] = c;

			return E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td' }, lib.txt(a.name || a.id)),
				E('td', { 'class': 'td' }, lib.txt(a.type)),
				E('td', { 'class': 'td' }, lib.txt('adapter%d/device%d'.format(a.adapter || 0, a.device || 0))),
				E('td', { 'class': 'td' }, lib.txt(a.frequency ? a.frequency + ' MHz' : '')),
				E('td', { 'class': 'td' }, lib.txt(a.enable === false ? _('no') : _('yes'))),
				c.s, c.q, c.flags, c.bitrate,
				E('td', { 'class': 'td nowrap' }, [
					E('button', { 'class': 'cbi-button cbi-button-action', click: function() { self.edit(a); } }, _('Edit')),
					' ',
					E('button', {
						'class': 'cbi-button', disabled: (a.enable === false) ? true : null,
						click: function() { self.restart(a); }
					}, _('Restart')),
					' ',
					E('button', { 'class': 'cbi-button cbi-button-negative', click: function() { self.remove(a); } }, _('Delete'))
				])
			]);
		});

		L.dom.content(self.box, [
			list.length
				? E('table', { 'class': 'table' }, [ head ].concat(rows))
				: E('p', {}, E('em', {}, _('No adapters configured yet.'))),
			E('div', { 'class': 'cbi-page-actions', style: 'text-align:left' }, [
				E('button', { 'class': 'cbi-button cbi-button-add', click: function() { self.edit(null); } }, _('Add adapter'))
			])
		]);

		self.updateLive();
	},

	updateLive: function() {
		const live = this.live || {};
		const ref = (live.ts !== undefined && live.age !== undefined) ? live.ts + live.age : Math.floor(Date.now() / 1000);

		for (const id in this.cells) {
			const c = this.cells[id], v = lib.signalView((live.adapters || {})[id], c.cfg.raw_signal, ref);

			c.s.textContent = v.fresh ? (c.cfg.raw_signal ? v.svalue + ' dBm' : v.svalue + '%') : '–';
			c.q.textContent = v.fresh ? (c.cfg.raw_signal ? v.qvalue + ' dB' : v.qvalue + '%') : '–';
			c.flags.textContent = v.flags;
			c.bitrate.textContent = v.fresh ? lib.fmtBitrate(v.bitrate) : '';
		}
	},

	/* is another adapter already bound to this adapter/device pair? */
	clash: function(vals, selfId) {
		return this.cfg.dvb_tune.find(function(a) {
			return a.id != selfId && (a.adapter || 0) == vals.adapter && (a.device || 0) == vals.device;
		});
	},

	save: function(adapter) {
		const self = this;

		return lib.api('set-adapter', { id: adapter.id, gid: self.cfg.gid, adapter: adapter }).then(function() {
			return lib.loadConfig();
		}).then(function(cfg) {
			self.cfg = cfg;
			self.draw();
		});
	},

	edit: function(existing) {
		const self = this, isNew = !existing;
		const defs = fields(isNew, self.detectedHint());
		const init = existing ? lib.clone(existing) : { enable: true, adapter: 0, device: 0 };
		const nodes = (self.dvb && self.dvb.nodes) || [];

		if (isNew && nodes.length == 1) {
			init.adapter = nodes[0].adapter;
			init.device = nodes[0].device;
		}

		if (existing && existing.diseqc_mode === undefined && existing.diseqc !== undefined)
			init.diseqc_mode = '';

		const form = lib.buildForm(defs, init);

		const ok = function() {
			const r = form.collect();

			if (!r.ok)
				return;

			const out = existing ? lib.clone(existing) : {};

			/* drop every managed key, then set what the form returned (hidden fields vanish) */
			defs.forEach(function(d) {
				if (d.type != 'header' && d.name != 'id')
					delete out[d.name];
			});

			Object.keys(r.values).forEach(function(k) {
				if (k != 'id')
					out[k] = r.values[k];
			});

			if (!out.diseqc)
				delete out.diseqc_mode;

			if (!out.id)
				out.id = lib.makeUid(self.cfg, 'dvb_tune');

			const other = self.clash(r.values, out.id);

			if (other && !window.confirm(_('Adapter %d / device %d is already used by "%s". Save anyway?').format(
					r.values.adapter, r.values.device, other.name || other.id)))
				return;

			ui.hideModal();

			return self.save(out).then(function() {
				lib.notify(_('Adapter "%s" saved').format(out.name), 'info');
			}).catch(lib.fail);
		};

		ui.showModal(isNew ? _('Add adapter') : _('Edit adapter'), [
			form.node,
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'cbi-button', click: ui.hideModal }, _('Cancel')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-positive important', click: ok }, _('Save'))
			])
		], 'astra-modal');
	},

	restart: function(a) {
		return lib.api('restart-adapter', { id: a.id }).then(function() {
			lib.notify(_('Adapter "%s" restarted').format(a.name || a.id), 'info');
		}).catch(lib.fail);
	},

	remove: function(a) {
		const self = this;
		const used = self.cfg.make_stream.filter(function(s) {
			return (s.input || []).concat(s._input || []).some(function(u) {
				const p = lib.parseUrl(u);

				return p && p.format == 'dvb' && p.addr == a.id;
			});
		});

		let msg = _('Delete adapter "%s"?').format(a.name || a.id);

		if (used.length)
			msg += '\n\n' + _('It is used as an input by: %s').format(used.map(function(s) { return s.name || s.id; }).join(', '));

		if (!window.confirm(msg))
			return;

		return lib.api('set-adapter', { id: a.id, adapter: { remove: true } }).then(function() {
			return lib.loadConfig();
		}).then(function(cfg) {
			self.cfg = cfg;
			self.draw();
		}).catch(lib.fail);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
