'use strict';
'require view';
'require form';
'require ui';
'require astra.lib as lib';

/*
 * Settings:
 *  - Service (UCI /etc/config/astra): enable at boot, control port
 *  - Astra general settings  (set-settings)
 *  - HLS                     (set-config hls)
 * The last two are astra's own configuration, applied through its control API.
 */

const DEFAULT_HEADERS = {
	m3u8: ['Access-Control-Allow-Origin: *', 'Access-Control-Allow-Methods: GET',
		'Access-Control-Allow-Credentials: true', 'Content-Type: application/vnd.apple.mpegURL'],
	ts: ['Access-Control-Allow-Origin: *', 'Access-Control-Allow-Methods: GET',
		'Access-Control-Allow-Credentials: true', 'Content-Type: video/MP2T']
};

function applyButton(label, handler) {
	return E('div', { 'class': 'cbi-page-actions', style: 'text-align:left' },
		E('button', { 'class': 'cbi-button cbi-button-save', click: handler }, label));
}

return view.extend({
	load: function() {
		return L.resolveDefault(lib.loadConfig(), null);
	},

	generalCard: function(cfg) {
		const s = cfg.settings || {};
		const keep = s.http_keep_active;

		const f = lib.buildForm([
			{ name: 'event_request', type: 'text', label: _('Monitoring URL'),
				hint: _('Export telemetry and events to this external server. Leave empty to keep everything local.') },
			{ name: '$sessions', type: 'bool', label: _('Track HTTP sessions'), default: true },
			{ name: '$ondemand', type: 'bool', label: _('Start streams on demand'), default: true },
			{ name: 'http_keep_active', type: 'number', label: _('HTTP keep active (s)'), min: 0,
				hint: _('Delay before a stream stops when nobody is connected. Default: 0 (stop immediately)'),
				depends: function(v) { return !!v.$ondemand; } },
			{ name: 'backup_start_delay', type: 'number', label: _('Backup start delay (s)'), min: 0, hint: _('Delay before starting the next input. Default: 0') },
			{ name: 'backup_return_delay', type: 'number', label: _('Backup return delay (s)'), min: 0, hint: _('Delay before returning to the previous input. Default: 0') },
			{ name: 'http_buffer', type: 'number', label: _('HTTP output buffer (KB)'), min: 0, hint: _('Per-client buffer. Default: 1024') },
			{ name: 'http_congestion', type: 'text', label: _('TCP congestion control') },
			{ name: 'cc_limit', type: 'number', label: _('CC limit'), min: 0, hint: _('Default: 0 (not limited)') }
		], Object.assign({}, s, {
			$sessions: !s.http_disable_sessions,
			$ondemand: keep !== -1,
			http_keep_active: (keep === -1) ? undefined : keep
		}));

		return E('div', { 'class': 'cbi-section' }, [
			E('h3', {}, _('Astra settings')),
			f.node,
			applyButton(_('Apply'), function() {
				const r = f.collect();

				if (!r.ok)
					return;

				const out = {};

				Object.keys(r.values).forEach(function(k) {
					if (k[0] != '$')
						out[k] = r.values[k];
				});

				if (r.values.$sessions === false)
					out.http_disable_sessions = true;

				if (r.values.$ondemand === false)
					out.http_keep_active = -1;

				/* astra aborts if "settings" is missing; an empty object clears them */
				return lib.api('set-settings', { settings: out }).then(function() {
					lib.notify(_('Settings saved'), 'info');
				}).catch(lib.fail);
			})
		]);
	},

	hlsCard: function(cfg) {
		const h = cfg.hls || {};
		const f = lib.buildForm([
			{ name: 'duration', type: 'number', label: _('Segment duration (s)'), min: 1, hint: _('Default: 10') },
			{ name: 'quantity', type: 'number', label: _('Segment count'), min: 1, hint: _('Default: 3') },
			{ name: 'naming', type: 'select', label: _('Segment naming'), options: [['', _('Default: PCR hash')], ['seq', _('Sequence')]] },
			{ name: 'round_duration', type: 'bool', label: _('Round duration value') },
			{ name: 'expires_header', type: 'bool', label: _('Use Expires header') },
			{ name: '$def_m3u8', type: 'bool', label: _('Default headers for .m3u8'), default: true },
			{ name: '$m3u8', type: 'textarea', label: _('.m3u8 headers'), rows: 5, hint: _('One header per line'),
				depends: function(v) { return !v.$def_m3u8; } },
			{ name: '$def_ts', type: 'bool', label: _('Default headers for .ts'), default: true },
			{ name: '$ts', type: 'textarea', label: _('.ts headers'), rows: 5, hint: _('One header per line'),
				depends: function(v) { return !v.$def_ts; } }
		], Object.assign({}, h, {
			$def_m3u8: !Array.isArray(h.m3u8_headers),
			$m3u8: (h.m3u8_headers || DEFAULT_HEADERS.m3u8).join('\n'),
			$def_ts: !Array.isArray(h.ts_headers),
			$ts: (h.ts_headers || DEFAULT_HEADERS.ts).join('\n')
		}));

		return E('div', { 'class': 'cbi-section' }, [
			E('h3', {}, _('HTTP Live Streaming (HLS)')),
			f.node,
			applyButton(_('Apply'), function() {
				const r = f.collect();

				if (!r.ok)
					return;

				const out = {}, v = r.values;

				[ 'duration', 'quantity', 'naming', 'round_duration', 'expires_header' ].forEach(function(k) {
					if (v[k] !== undefined && v[k] !== false)
						out[k] = v[k];
				});

				[ 'm3u8', 'ts' ].forEach(function(t) {
					if (v['$def_' + t] === false) {
						const lines = String(v['$' + t] || '').split('\n').map(function(x) { return x.trim(); }).filter(Boolean);

						if (lines.length)
							out[t + '_headers'] = lines;
					}
				});

				return lib.api('set-config', { key: 'hls', data: out }).then(function() {
					lib.notify(_('HLS settings saved'), 'info');
				}).catch(lib.fail);
			})
		]);
	},

	render: function(cfg) {
		const self = this;
		const m = new form.Map('astra', _('Astra – Settings'));
		const s = m.section(form.NamedSection, 'main', 'astra', _('Service'));
		let o;

		o = s.option(form.Flag, 'enabled', _('Start at boot'),
			_('A DVB frontend can only be used by one program at a time. Switch this off before using TVHeadend or MuMuDVB.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Control port'),
			_('Port of the local control interface used by this page. It requires authentication but listens on all interfaces; restrict it with the firewall if the router is reachable from untrusted networks.'));
		o.datatype = 'port';
		o.default = '8000';
		o.rmempty = false;

		return m.render().then(function(mapNode) {
			return E([
				lib.css(),
				mapNode,
				cfg
					? [ self.generalCard(cfg), self.hlsCard(cfg) ]
					: E('div', { 'class': 'alert-message warning' },
						_('Astra is not reachable, so its own settings cannot be shown. Start the service first.'))
			]);
		});
	}
});
