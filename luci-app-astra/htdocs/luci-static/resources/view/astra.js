'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('astra'), {}).then(function (res) {
		let running = false, pid = null;
		try {
			const insts = res['astra']['instances'] || {};
			for (const k in insts) {
				if (insts[k].running) {
					running = true;
					pid = insts[k].pid;
					break;
				}
			}
		} catch (e) { }
		return { running: running, pid: pid };
	});
}

function renderStatus(st, port) {
	const tpl = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';

	if (!st.running)
		return tpl.format('red', _('Astra'), _('NOT RUNNING'));

	const url = '//' + window.location.hostname + ':' + port + '/';
	const btn = String.format(
		'&#160;<a class="btn cbi-button" href="%s" target="_blank" rel="noreferrer noopener">%s</a>',
		url, _('Open Web Interface'));

	return tpl.format('green', _('Astra'), _('RUNNING')) +
		(st.pid ? ' <small>(PID %d)</small>'.format(st.pid) : '') + btn;
}

return view.extend({
	load() {
		return uci.load('astra');
	},

	render() {
		let m, s, o;
		const port = uci.get('astra', 'main', 'port') || '8000';

		m = new form.Map('astra', _('Astra'),
			_('Astra DVB/IPTV streaming panel. Channels, adapters and users are managed in the panel\'s own web interface; this page only controls the service.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		let pollStarted = false;
		s.render = function () {
			/* 每次 Save & Apply 都会重渲染，poll 只注册一次，避免重复轮询 */
			if (!pollStarted) {
				pollStarted = true;
				poll.add(function () {
					return getServiceStatus().then(function (st) {
						const el = document.getElementById('astra_status');
						if (el)
							el.innerHTML = renderStatus(st, uci.get('astra', 'main', 'port') || port);
					});
				});
			}

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
				E('p', { id: 'astra_status' }, _('Collecting data…'))
			]);
		};

		s = m.section(form.NamedSection, 'main', 'astra');
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', _('Enable'),
			_('The DVB frontend is exclusive: disable this before using TVHeadend or MuMuDVB on the same adapter.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.option(form.Value, 'port', _('Web port'),
			_('Listening port of the Astra web interface.'));
		o.datatype = 'port';
		o.placeholder = '8000';
		o.default = '8000';
		o.rmempty = false;

		return m.render();
	}
});
