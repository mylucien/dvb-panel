'use strict';
'require view';
'require ui';
'require astra.lib as lib';

/*
 * Configuration: export / import / full JSON editor.
 *   Export   download the current astra.json
 *   Import   convert an Astra script or JSON (astra's own "import") and merge it
 *   Editor   replace the whole configuration (power users)
 * Passwords of panel users are stored as hashes ("cipher") in the file.
 */

const LIMIT = 60000;	/* ubus / uhttpd request size is limited; larger files must be copied by hand */

function download(name, text) {
	const a = E('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name });

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

return view.extend({
	load: function() {
		return L.resolveDefault(lib.api('load'), null);
	},

	render: function(cfg) {
		const self = this;

		self.original = cfg;

		const editor = E('textarea', { 'class': 'cbi-input-textarea', rows: 20, style: 'width:100%;margin-top:.6em;font-family:monospace' });
		const editorErr = E('div', { 'class': 'astra-error' });
		const importBox = E('textarea', { 'class': 'cbi-input-textarea', rows: 8, style: 'width:100%;margin-top:.6em;font-family:monospace',
			placeholder: _('Paste an Astra script or JSON export here') });
		const importErr = E('div', { 'class': 'astra-error' });
		const fileIn = E('input', { type: 'file', accept: '.json,.lua,.txt,application/json' });

		editor.value = cfg ? JSON.stringify(cfg, null, 2) : '';

		fileIn.addEventListener('change', function() {
			if (fileIn.files && fileIn.files[0])
				fileIn.files[0].text().then(function(t) { importBox.value = t; });
		});

		const reload = function() {
			return lib.api('load').then(function(c) {
				self.original = c;
				editor.value = JSON.stringify(c, null, 2);
			});
		};

		/* upload the whole configuration, then let astra reload it */
		const push = function(config) {
			const size = JSON.stringify(config).length;

			if (size > LIMIT)
				return Promise.reject(new Error(_('The configuration is %d bytes; the web interface can transfer at most %d. Copy /etc/astra/astra.json to the router instead.').format(size, LIMIT)));

			return lib.api('upload', { config: config }).then(function() {
				return lib.api('restart');
			});
		};

		const doImport = function() {
			importErr.textContent = '';

			if (importBox.value.trim() === '')
				return;

			return lib.loadConfig().then(function(current) {
				return lib.api('import', { gid: current.gid, data: importBox.value }).then(function(r) {
					if (r && r.error)
						throw new Error(r.error);

					/* astra returns the imported objects with fresh ids; add them to what exists */
					[ 'dvb_tune', 'make_stream', 'softcam', 'mpts' ].forEach(function(k) {
						if (Array.isArray(r[k]) && r[k].length)
							current[k] = (current[k] || []).concat(r[k]);
					});

					if (r.gid)
						current.gid = r.gid;

					const added = [ 'dvb_tune', 'make_stream', 'softcam', 'mpts' ].reduce(function(n, k) {
						return n + (Array.isArray(r[k]) ? r[k].length : 0);
					}, 0);

					if (!added)
						throw new Error(_('Nothing to import was found.'));

					if (!window.confirm(_('Import %d object(s) and reload Astra?').format(added)))
						return;

					return push(current).then(function() {
						importBox.value = '';
						lib.notify(_('Imported %d object(s)').format(added), 'info');

						return reload();
					});
				});
			}).catch(function(e) {
				importErr.textContent = lib.errorText(e);
			});
		};

		const doReplace = function() {
			editorErr.textContent = '';

			let parsed;

			try {
				parsed = JSON.parse(editor.value);

				if (!lib.isObject(parsed))
					throw new Error(_('The top level must be an object'));
			}
			catch (e) {
				editorErr.textContent = _('Invalid JSON: %s').format(e.message);
				return;
			}

			if (!window.confirm(_('Replace the whole configuration and reload Astra?')))
				return;

			return push(parsed).then(function() {
				lib.notify(_('Configuration applied'), 'info');

				return reload();
			}).catch(function(e) {
				editorErr.textContent = lib.errorText(e);
			});
		};

		return E([
			lib.css(),
			E('h2', {}, _('Configuration')),
			cfg ? E('span') : E('div', { 'class': 'alert-message warning' }, _('Astra is not reachable; the configuration cannot be loaded.')),

			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Export')),
				E('p', {}, _('Download the current configuration. It contains the password hashes of panel users.')),
				E('button', { 'class': 'cbi-button cbi-button-action', disabled: cfg ? null : true, click: function() {
					download('astra-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(self.original, null, 2));
				} }, _('Download'))
			]),

			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Import')),
				E('p', {}, _('Imports channels and adapters from an Astra script or a JSON export and adds them to the current configuration.')),
				fileIn, importBox, importErr,
				E('button', { 'class': 'cbi-button cbi-button-add', click: doImport }, _('Import'))
			]),

			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Edit as JSON')),
				E('p', {}, _('Direct access to everything, including features without a form (CAS, SoftCAM, categories, users). A mistake here can stop Astra from starting.')),
				editor, editorErr,
				E('button', { 'class': 'cbi-button', click: function() { return reload().catch(lib.fail); } }, _('Reload')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-negative', disabled: cfg ? null : true, click: doReplace }, _('Apply'))
			])
		]);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
