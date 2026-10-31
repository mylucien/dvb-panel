'use strict';
'require view';
'require poll';
'require ui';
'require astra.lib as lib';

/* Active HTTP clients ("sessions"); the list refreshes itself. */

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(lib.api('sessions'), []),
			L.resolveDefault(lib.loadConfig(), {})
		]);
	},

	normalize: function(d) {
		const list = Array.isArray(d) ? d : ((d && d.sessions) || []);

		return list.filter(function(s) { return s && s.client_id !== undefined; });
	},

	render: function(data) {
		const self = this;

		self.disabled = !!((data[1].settings || {}).http_disable_sessions);
		self.body = E('div', {});
		self.sessions = self.normalize(data[0]);
		self.draw();

		poll.add(function() {
			return lib.api('sessions').then(function(d) {
				self.sessions = self.normalize(d);
				self.draw();
			}).catch(function() {});
		}, 3);

		/* E([...]) treats every string in the array as a tag name: only nodes go in */
		const page = [
			E('h2', {}, _('Sessions')),
			E('div', { 'class': 'cbi-map-descr' }, _('Clients currently watching a stream over HTTP.'))
		];

		if (self.disabled)
			page.push(E('div', { 'class': 'alert-message warning' },
				_('Session tracking is switched off in the Astra settings, so this list stays empty.')));

		page.push(self.body);

		return E(page);
	},

	draw: function() {
		const self = this, list = self.sessions;

		if (!list.length) {
			L.dom.content(self.body, E('p', {}, E('em', {}, _('No active sessions.'))));
			return;
		}

		const head = E('tr', { 'class': 'tr table-titles' }, [
			_('Stream'), _('Address'), _('User'), _('Uptime'), ''
		].map(function(t) { return E('th', { 'class': 'th' }, t); }));

		L.dom.content(self.body, [
			E('table', { 'class': 'table' }, [ head ].concat(list.map(function(s) {
				return E('tr', { 'class': 'tr' }, [
					E('td', { 'class': 'td' }, lib.txt(s.channel_name || s.channel_id)),
					E('td', { 'class': 'td' }, lib.txt(s.addr)),
					E('td', { 'class': 'td' }, lib.txt(s.login)),
					E('td', { 'class': 'td' }, lib.txt(lib.fmtUptime(s.uptime))),
					E('td', { 'class': 'td' }, E('button', {
						'class': 'cbi-button cbi-button-negative',
						click: function() {
							return lib.api('close-session', { id: s.client_id }).then(function() {
								self.sessions = self.sessions.filter(function(x) { return x.client_id !== s.client_id; });
								self.draw();
							}).catch(lib.fail);
						}
					}, _('Disconnect')))
				]);
			}))),
			E('p', {}, _('%d session(s)').format(list.length))
		]);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
