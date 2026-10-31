'use strict';
'require view';
'require poll';
'require ui';
'require astra.lib as lib';

/*
 * Live log. The event monitor keeps the last lines in a ring; this page
 * fetches only what is new (log_since), so it stays cheap on slow routers.
 */

const KEEP = 1000;

function stamp(t) {
	const d = new Date((Number(t) || 0) * 1000), p = function(n) { return n < 10 ? '0' + n : String(n); };

	return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

return view.extend({
	load: function() {
		return Promise.all([ lib.state(0), L.resolveDefault(lib.api('log'), {}) ]);
	},

	render: function(data) {
		const self = this;

		self.seq = data[0].seq || 0;
		self.lines = (data[0].log || []).slice();
		self.paused = false;
		self.level = data[1] || {};
		self.view = E('div', { 'class': 'astra-log' });

		const flag = function(key, title) {
			const cb = E('input', { type: 'checkbox', 'class': 'cbi-input-checkbox' });

			cb.checked = !!self.level[key];
			cb.addEventListener('change', function() {
				const set = {};

				set[key] = cb.checked;

				return lib.api('set-log', { set: set }).catch(function(e) {
					cb.checked = !cb.checked;
					lib.fail(e);
				});
			});

			return E('label', {}, [ cb, ' ', title ]);
		};

		const pause = E('input', { type: 'checkbox', 'class': 'cbi-input-checkbox' });

		pause.addEventListener('change', function() {
			self.paused = pause.checked;

			if (!self.paused)
				self.draw();
		});

		self.draw();

		poll.add(function() {
			return lib.state(self.seq).then(function(s) {
				if (s.seq !== undefined && s.seq < self.seq) {
					/* monitor restarted */
					self.lines = [];
					self.seq = 0;
				}

				(s.log || []).forEach(function(l) {
					self.lines.push(l);
					self.seq = Math.max(self.seq, l.seq);
				});

				if (self.lines.length > KEEP)
					self.lines.splice(0, self.lines.length - KEEP);

				if (!self.paused && (s.log || []).length)
					self.draw();
			});
		}, 2);

		return E([
			lib.css(),
			E('h2', {}, _('Log')),
			E('div', { 'class': 'cbi-section' }, [
				E('div', { style: 'display:flex;flex-wrap:wrap;align-items:center;gap:1.2em' }, [
					flag('info', _('Info')),
					flag('debug', _('Debug')),
					E('label', {}, [ pause, ' ', _('Pause') ]),
					E('button', { 'class': 'cbi-button', click: function() { self.lines = []; self.draw(); } }, _('Clear'))
				])
			]),
			self.view
		]);
	},

	draw: function() {
		const atBottom = this.view.scrollTop + this.view.clientHeight >= this.view.scrollHeight - 8;

		L.dom.content(this.view, this.lines.map(function(l) {
			return E('div', { 'class': 'l' + (l.type | 0) }, lib.txt(stamp(l.time) + '  ' + (l.text || '')));
		}));

		if (atBottom)
			this.view.scrollTop = this.view.scrollHeight;
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
