'use strict';
'require view';
'require poll';
'require ui';
'require astra.lib as lib';

/*
 * Overview: service health, live adapter signal cards (same numbers as the
 * original Astra panel) and a stream status table.
 */

return view.extend({
	load: function() {
		return Promise.all([
			lib.status(),
			L.resolveDefault(lib.loadConfig(), null),
			L.resolveDefault(lib.dvbList(), { driver: false, nodes: [] }),
			L.resolveDefault(lib.state(-1), {})
		]);
	},

	render: function(data) {
		const self = this;

		self.status = data[0];
		self.cfg = data[1];
		self.dvb = data[2];
		self.live = data[3];
		self.cards = {};
		self.rows = {};
		self.tick = 0;

		self.statusBox = E('div', { 'class': 'cbi-section' });
		self.adapterBox = E('div', { 'class': 'astra-cards' });
		self.deviceBox = E('div', {});
		self.streamBox = E('div', {});

		self.drawStatus();
		self.drawAdapters();
		self.drawDevices();
		self.drawStreams();
		self.update();

		poll.add(function() {
			self.tick++;

			return Promise.all([
				lib.state(-1),
				(self.tick % 3 == 0) ? lib.status() : Promise.resolve(null)
			]).then(function(r) {
				self.live = r[0];

				if (r[1]) {
					self.status = r[1];
					self.drawStatus();
				}

				self.update();
			});
		}, 2);

		return E([
			lib.css(),
			E('h2', {}, _('Astra')),
			self.statusBox,
			E('div', { 'class': 'cbi-section' }, [ E('h3', {}, _('Adapters')), self.adapterBox, self.deviceBox ]),
			E('div', { 'class': 'cbi-section' }, [ E('h3', {}, _('Streams')), self.streamBox ])
		]);
	},

	badge: function(text, cls) {
		return E('span', { 'class': 'astra-badge ' + (cls || '') }, lib.txt(text));
	},

	drawStatus: function() {
		const self = this, s = self.status;
		const mon = s.monitor;
		let monText, monCls = 'astra-bad';

		if (!mon)
			monText = _('not running');
		else if (!mon.connected)
			monText = lib.errorText(mon.error) || _('disconnected');
		else if (mon.age > 10)
			monText = _('stale (%ds)').format(mon.age);
		else {
			monText = _('connected');
			monCls = 'astra-ok';
		}

		const act = function(a) {
			return E('button', {
				'class': 'cbi-button cbi-button-' + (a == 'stop' ? 'negative' : 'action'),
				click: function() {
					return lib.serviceAction(a).then(function() {
						return new Promise(function(r) { window.setTimeout(r, 2500); });
					}).then(function() {
						return lib.status();
					}).then(function(st) {
						self.status = st;
						self.drawStatus();
					}).catch(lib.fail);
				}
			}, { start: _('Start'), stop: _('Stop'), restart: _('Restart') }[a]);
		};

		const rows = [
			[ _('Service'), s.running ? self.badge(_('running'), 'astra-ok') : self.badge(_('stopped'), 'astra-bad'),
				s.running ? _('PID %d').format(s.pid) : '' ],
			[ _('Version'), s.version ? 'Astra ' + s.version : '–', '' ],
			[ _('Control API'), s.api ? (s.api.ok ? self.badge(_('ok'), 'astra-ok') : self.badge(lib.errorText(s.api.error), 'astra-bad'))
				: (s.has_key ? '–' : self.badge(lib.errorText('no-key'), 'astra-warn')), _('port %d').format(s.port) ],
			[ _('Event monitor'), self.badge(monText, monCls), '' ]
		];

		L.dom.content(self.statusBox, [
			E('table', { 'class': 'table' }, rows.map(function(r) {
				return E('tr', { 'class': 'tr' }, [
					E('td', { 'class': 'td left', width: '25%' }, E('strong', {}, r[0])),
					E('td', { 'class': 'td left' }, [ r[1], ' ', r[2] ])
				]);
			})),
			E('div', { 'class': 'cbi-page-actions', style: 'text-align:left' }, [ act('start'), ' ', act('restart'), ' ', act('stop') ])
		]);
	},

	adapterTitle: function(a) {
		return a.name || a.id;
	},

	drawAdapters: function() {
		const self = this, list = (self.cfg && self.cfg.dvb_tune) || [];

		self.cards = {};

		if (!self.cfg) {
			L.dom.content(self.adapterBox, E('em', {}, _('The configuration cannot be read (is Astra running?).')));
			return;
		}

		if (!list.length) {
			L.dom.content(self.adapterBox, E('em', {}, _('No adapters configured yet. Add one under “Adapters”.')));
			return;
		}

		L.dom.content(self.adapterBox, list.map(function(a) {
			const c = {
				cfg: a,
				sBar: E('span', { style: 'width:0%' }), qBar: E('span', { style: 'width:0%' }),
				sTxt: E('span', {}, '–'), qTxt: E('span', {}, '–'),
				flags: E('span', { 'class': 'astra-flags' }, '_____'),
				berunc: E('span', {}, ''), bitrate: E('span', {}, '')
			};

			c.node = E('div', { 'class': 'astra-card' + (a.enable === false ? ' astra-off' : '') }, [
				E('h4', {}, [ lib.txt(self.adapterTitle(a)), self.badge(a.type || '?') ]),
				E('div', { 'class': 'astra-kv' }, [
					E('span', {}, _('Device')),
					lib.txt('adapter%d / frontend%d'.format(a.adapter || 0, a.device || 0))
				]),
				E('div', { 'class': 'astra-kv' }, [
					E('span', {}, _('Frequency')),
					lib.txt(a.frequency ? a.frequency + ' MHz' : '–')
				]),
				E('div', { 'class': 'astra-meter' }, [ E('label', {}, 'S'), E('div', { 'class': 'astra-bar' }, c.sBar), c.sTxt ]),
				E('div', { 'class': 'astra-meter' }, [ E('label', {}, 'Q'), E('div', { 'class': 'astra-bar astra-q' }, c.qBar), c.qTxt ]),
				E('div', { 'class': 'astra-kv' }, [ E('span', {}, _('Lock')), c.flags ]),
				E('div', { 'class': 'astra-kv' }, [ E('span', {}, 'BER / UNC'), c.berunc ]),
				E('div', { 'class': 'astra-kv' }, [ E('span', {}, _('Bitrate')), c.bitrate ])
			]);

			self.cards[a.id] = c;

			return c.node;
		}));
	},

	drawDevices: function() {
		const self = this, nodes = (self.dvb && self.dvb.nodes) || [];

		if (!nodes.length) {
			L.dom.content(self.deviceBox, E('p', {}, [
				E('em', {}, self.dvb && self.dvb.driver
					? _('The DVB driver is loaded but no frontend device exists. Is the tuner connected?')
					: _('No DVB driver is loaded (no /dev/dvb devices).'))
			]));
			return;
		}

		const cfg = (self.cfg && self.cfg.dvb_tune) || [];

		L.dom.content(self.deviceBox, [
			E('h4', {}, _('Detected tuners')),
			E('table', { 'class': 'table' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Device')), E('th', { 'class': 'th' }, _('Name')),
					E('th', { 'class': 'th' }, _('Used by Astra')), E('th', { 'class': 'th' }, _('Configured'))
				])
			].concat(nodes.map(function(n) {
				const used = cfg.some(function(a) { return (a.adapter || 0) == n.adapter && (a.device || 0) == n.device; });

				return E('tr', { 'class': 'tr' }, [
					E('td', { 'class': 'td' }, lib.txt('adapter%d / frontend%d'.format(n.adapter, n.device))),
					E('td', { 'class': 'td' }, lib.txt((n.name || '–') + (n.usb_id ? ' (' + n.usb_id + ')' : ''))),
					E('td', { 'class': 'td' }, n.in_use ? _('yes') : _('no')),
					E('td', { 'class': 'td' }, used ? _('yes') : _('no'))
				]);
			})))
		]);
	},

	drawStreams: function() {
		const self = this, list = (self.cfg && self.cfg.make_stream) || [];

		self.rows = {};

		if (!list.length) {
			L.dom.content(self.streamBox, E('em', {}, _('No streams configured yet.')));
			return;
		}

		const head = E('tr', { 'class': 'tr table-titles' }, [
			_('Name'), _('State'), _('Bitrate'), 'CC', 'PES', _('Inputs'), _('Outputs')
		].map(function(t, i) { return E('th', { 'class': 'th' + (i == 6 ? ' astra-left' : '') }, t); }));

		L.dom.content(self.streamBox, E('table', { 'class': 'table astra-streams' }, [ head ].concat(list.map(function(s) {
			const r = {
				state: E('td', { 'class': 'td' }), bitrate: E('td', { 'class': 'td' }),
				cc: E('td', { 'class': 'td' }), pes: E('td', { 'class': 'td' }), inputs: E('td', { 'class': 'td' })
			};

			self.rows[s.id] = r;
			r.cfg = s;

			return E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td' }, lib.txt(s.name || s.id)),
				r.state, r.bitrate, r.cc, r.pes, r.inputs,
				E('td', { 'class': 'td astra-url astra-left' }, lib.outputLinks(s.output))
			]);
		}))));
	},

	/* refresh live numbers without rebuilding the DOM (no flicker) */
	update: function() {
		const self = this, live = self.live || {};

		/*
		 * "now" on the router: the state file's own timestamp plus the age the
		 * backend computed when answering. If the monitor stops, age grows and
		 * the numbers go stale instead of looking fresh forever.
		 */
		const ref = (live.ts !== undefined && live.age !== undefined)
			? live.ts + live.age : Math.floor(Date.now() / 1000);

		for (const id in self.cards) {
			const c = self.cards[id], v = lib.signalView((live.adapters || {})[id], c.cfg.raw_signal, ref);

			c.sBar.style.width = (c.cfg.raw_signal ? 0 : v.svalue) + '%';
			c.qBar.style.width = (c.cfg.raw_signal ? 0 : v.qvalue) + '%';
			c.sBar.parentNode.classList.toggle('astra-warn', v.fresh && !v.lock);
			c.sTxt.textContent = v.fresh ? (c.cfg.raw_signal ? v.svalue + ' dBm' : v.svalue + '%') : '–';
			c.qTxt.textContent = v.fresh ? (c.cfg.raw_signal ? v.qvalue + ' dB' : v.qvalue + '%') : '–';
			c.flags.textContent = v.flags;
			c.berunc.textContent = v.fresh ? v.ber + ' / ' + v.unc : '–';
			c.bitrate.textContent = v.fresh ? lib.fmtBitrate(v.bitrate) : '–';
		}

		for (const id in self.rows) {
			const r = self.rows[id], sv = lib.streamView((live.streams || {})[id], ref);
			let state = _('offline'), cls = 'astra-bad';

			if (r.cfg.enable === false) {
				state = _('disabled');
				cls = '';
			}
			else if (sv.state == 'onair') {
				state = _('on air');
				cls = 'astra-ok';
			}
			else if (sv.state == 'waiting') {
				state = _('waiting for data');
				cls = 'astra-warn';
			}

			L.dom.content(r.state, [ self.badge(state, cls), sv.scrambled ? [ ' ', self.badge(_('scrambled'), 'astra-warn') ] : '' ]);
			r.bitrate.textContent = sv.state == 'onair' ? lib.fmtBitrate(sv.bitrate) : '';
			r.cc.textContent = sv.state == 'onair' ? sv.cc : '';
			r.pes.textContent = sv.state == 'onair' ? sv.pes : '';

			const keys = Object.keys(sv.inputs).sort();
			r.inputs.textContent = keys.length
				? keys.map(function(k) { return '#' + k + (sv.inputs[k].onair ? '✔' : '✘'); }).join(' ')
				: '';
		}
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
