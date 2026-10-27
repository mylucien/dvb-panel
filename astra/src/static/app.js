/*
 * Astra: Web Interface
 * https://cesbo.com/astra/
 *
 * Copyright (C) 2017, Andrey Dyldin <and@cesbo.com>
 */

/* pony.js */

/*
 * PonyJS
 * (c) 2016-2017 Andrey Dyldin <and@cesbo.com>
 * License: MIT
 */

(function() {
"use strict";

window.$ = function(selector) {
	return document.querySelectorAll(selector);
};

$.isMobile = function() {
	var x = /iPhone|iPad|iPod|Android|Windows Phone/i.test(navigator.userAgent);
	$.isMobile = function() { return x };
	return x;
};

if(window.CustomEvent == undefined) {
	var customEvent = function(event, params) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var e = document.createEvent("CustomEvent");
		e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return e
	};
	customEvent.prototype = window.Event.prototype;
	window.CustomEvent = customEvent;
}

String.prototype.toUpperCaseFirst = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

if(!String.prototype.format) String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) {
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
};

Array.prototype.find = function(fn) {
	for(var i = 0, l = this.length; i < l; ++i) {
		var x = this[i];
		if(fn(x)) return x;
	}
	return undefined
};

Array.prototype.move = function(src, dst) {
	var e = this.splice(src, 1)[0];
	this.splice(dst, 0, e);
};

Element.prototype.remove = function() {
	this.parentNode.removeChild(this)
};

Element.prototype.empty = function() {
	while(this.firstChild) this.removeChild(this.firstChild);
	return this
};

Element.prototype.addClass = function() {
	for(var i = 0; i < arguments.length; ++i) {
		var n = arguments[i];
		if(!n) continue;
		n = n.split(/[\t ]+/);
		while(n.length) {
			var c = n.shift();
			if(c != "") this.classList.add(c);
		}
	}
	return this
};

Element.prototype.removeClass = function() {
	for(var i = 0; i < arguments.length; ++i) {
		var n = arguments[i];
		if(!n) continue;
		n = n.split(/[\t ]+/);
		while(n.length) {
			var c = n.shift();
			if(c != "") this.classList.remove(c);
		}
	}
	return this
};

Element.prototype.hasClass = function(c) {
	return this.classList.contains(c)
};

Element.prototype.addAttr = function(key, value) {
	if(value == undefined) value = "";
	this.setAttribute(key, value);
	return this
};

Element.prototype.removeAttr = function(key) {
	this.removeAttribute(key);
	return this
};

Element.prototype.setValue = function(value) {
	if(value) this.addAttr("value", value)
	else this.removeAttr("value");
	return this
};

Element.prototype.setText = function(text) {
	this.textContent = text;
	return this
};

Element.prototype.setHtml = function(html) {
	this.innerHTML = html;
	return this
};

Element.prototype.setReadonly = function(value) {
	return this[(!!value) ? "addAttr" : "removeAttr"]("readonly")
};

Element.prototype.setDisabled = function(value) {
	return this[(!!value) ? "addAttr" : "removeAttr"]("disabled")
};

Element.prototype.setRequired = function(value) {
	return this[(!!value) ? "addAttr" : "removeAttr"]("required")
};

Element.prototype.setError = function(value) {
	return this[(!!value) ? "addClass" : "removeClass"]("error")
};

Element.prototype.setStyle = function(key, value) {
	var x = key.split("-");
	key = x.shift();
	while(x.length) key += x.shift().toUpperCaseFirst();
	this.style[key] = value;
	return this
};

Element.prototype.addValidator = function(fn) {
	if(this.$validate == undefined) this.$validate = [];
	this.$validate.push(fn);
	return this
};

Element.prototype.addChild = function() {
	for(var i = 0; i < arguments.length; ++i) {
		var child = arguments[i];
		if(child) {
			if(child.nodeName == undefined) child = document.createTextNode(child);
			this.appendChild(child);
		}
	}
	return this
};

Element.prototype.insertChild = function(child, before) {
	if(child) {
		if(child.nodeName == undefined) child = document.createTextNode(child);
		this.insertBefore(child, before || this.firstChild);
	}
	return this
};

Element.prototype.dataBind = function(key) {
	if(key) this.addAttr("data-bind", key);
	return this
};

Element.prototype.dataRender = function(key) {
	if(key) this.addAttr("data-render", key);
	return this
};

var setEventOn = function(object, event, fn) {
	if(!object.eventBind) object.eventBind = {};
	var eb = object.eventBind[event];
	if(!eb) {
		object.eventBind[event] = eb = {
			list: [],
			fn: function() {
				for(var i = 0; i < eb.list.length; i++)
					eb.list[i].apply(this, arguments);
			},
		};
		object.addEventListener(event, eb.fn);
	}
	eb.list.push(fn);
};

var setEventOff = function(object, event, fn) {
	if(!object.eventBind) return;
	var eb = object.eventBind[event];
	if(!eb) return;
	if(!!fn) {
		var x = eb.list.indexOf(fn);
		if(x != -1) eb.list.splice(x, 1);
		if(!eb.list.length) fn = undefined;
	}
	if(!fn) {
		object.removeEventListener(event, eb.fn);
		delete(object.eventBind[event])
	}
};

Element.prototype.on = function(event, fn) { setEventOn(this, event, fn); return this };
Element.prototype.off = function(event, fn) { setEventOff(this, event, fn); return this };
window.on = function(event, fn) { setEventOn(this, event, fn); return this };
window.off = function(event, fn) { setEventOff(this, event, fn); return this };
document.on = function(event, fn) { setEventOn(this, event, fn); return this };
document.off = function(event, fn) { setEventOff(this, event, fn); return this };

$.html = document.querySelector("html");
$.head = document.querySelector("head");
$.body = document.querySelector("body");

$.nop = function() {};

$.element = function(t) {
	return document.createElement(t || "div")
};

$.element.button = function(text) {
	return $.element("button")
		.addAttr("type", "button")
		.addClass("button")
		.setText(text || "");
};

$.element.a = function(href, text) {
	return $.element("a")
		.addAttr("href", href)
		.setText(text || "");
};

$.element.input = function(placeholder, type) {
	return $.element("input")
		.addAttr("type", type || "text")
		.addClass("input")
		.addAttr("placeholder", placeholder);
};

$.element.select = function(items) {
	var x = $.element("select").addClass("input");
	var makeItems = function(p, x) {
		for(var i = 0; i < x.length; i++) {
			var e, o = x[i];
			if(o.hide) continue;
			if(o.group) {
				if(!o.items.length) continue;
				e = $.element("optgroup")
					.addAttr("label", o.group);
				makeItems(e, o.items);
			} else {
				e = $.element("option")
					.addAttr("value", o.value)
					.setText(o.label || o.value);
			}
			if(o.disabled) e.setDisabled(true);
			p.addChild(e);
		}
	};
	makeItems(x, items);
	return x;
};

$.element.checkbox = function(label) {
	var x = $.element("input")
		.addAttr("type", "checkbox");
	var z = $.element("label")
		.addClass("checkbox")
		.addChild(x)
		.addChild($.element("span")
			.addClass("inner"))
		.addChild($.element("span")
			.addClass("text")
			.setHtml(label || ""));
	z.checkbox = x;
	return z;
};

$.isArray = function(v) {
	return Array.isArray(v) && v.length != undefined;
};

$.isObject = function(v) {
	return v === Object(v) && $.isArray(v) == false;
};

$.isObjectEmpty = function(v) {
	for(var k in v) { if(v.hasOwnProperty(k)) return false; }
	return true;
};

$.clone = function(v) {
	if($.isArray(v)) return v.slice();
	if($.isObject(v)) return JSON.parse(JSON.stringify(v));
	return v;
};

$.forEach = function(v, fn) {
	if(!v) {
		//
	} else if($.isArray(v)) {
		for(var k = 0, l = v.length; k < l; k++) {
			var x = fn(v[k], k);
			if(x != undefined) return x;
		}
	} else if($.isObject(v)) {
		for(var k in v) {
			var x = fn(v[k], k);
			if(x != undefined) return x;
		}
	}
};

$.http = function(config, onLoad, onError) {
	var u = config.url,
		m = config.method || "GET";

	if(u.match(/^\/\//)) u = location.protocol + u;

	var x = new XMLHttpRequest();
	if(!u.match(/^[a-z]+:\/\//)) {
		x.open(m, u);
	} else if("withCredentials" in x) {
		x.open(m, u, true);
	} else if("XDomainRequest" in window) {
		x = new XDomainRequest();
		x.open(m, u);
	} else {
		throw new Error("CORS not supported");
	}

	$.forEach(config.headers, function(v, k) {
		x.setRequestHeader(k, v)
	});

	var response = function() {
		var fn = (x.status == 200) ? onLoad : onError;
		if(fn) fn({
			text: x.responseText,
			status: x.status,
			statusText: x.statusText
		})
	};

	x.addEventListener("load", response);
	x.addEventListener("error", response);

	x.send(config.data);
};

function Cookie() {
	var data = {};

	$.forEach(document.cookie.split(/; +/), function(kv) {
		if(kv != "") {
			kv = kv.split("=");
			data[kv[0]] = decodeURIComponent(kv[1]);
		}
	});

	this.get = function(key) {
		return data[key] || undefined;
	};

	this.set = function(key, value, expires) {
		var x = key + "=";
		if(value != undefined) {
			data[key] = value;
			x += encodeURIComponent(value);
		} else {
			delete(data[key]);
			expires = -1;
		}
		if(expires != undefined) x += "; expires=" + (new Date((expires == -1) ? (946684801000) : (Date.now() + Math.round(expires * 86400000)))).toUTCString();
		document.cookie = x;
	};

	this.getObject = function(key) {
		var x = this.get(key);
		if(x) x = JSON.parse(x);
		return x;
	};

	this.setObject = function(key, value) {
		if(value) value = JSON.stringify(value);
		this.set(key, value);
	};
}

$.cookie = new Cookie();

var msgFloat = null;

$.msg = function(config) {
	if(!msgFloat) {
		msgFloat = $.element("div").addClass("alert-float");
		$.body.addChild(msgFloat);
	}
	if(typeof(config) == "string") config = { text: config };
	var c, t,
		x = $.element("div").addClass("alert alert-" + (config.type || "info")),
		d = config.delay || 3;
	if(config.title) x.addChild($.element("strong").addClass("alert-title").setText(config.title));
	if(config.text) x.addChild(c = $.element("p").addClass("alert-text").setText(config.text.format(d)));
	x.remove = function() {
		if(t) clearInterval(t);
		Element.prototype.remove.call(this);
		x.dispatchEvent(new CustomEvent("remove"));
	};
	if(d > 0) {
		t = setInterval(function() {
			d--;
			if(!d) x.remove();
			else if(c) c.setText(config.text.format(d));
		}, 1000);
	}

	msgFloat.addChild(x);
	return x;
};

$.err = function(config) {
	if(typeof(config) == "string") config = { text: config };
	config.type = "error";
	return $.msg(config);
};

var modalStack = [];

$.modal = function() {
	if(!modalStack.length) {
		var backdrop = $.element("div").addClass("modal-backdrop");
		backdrop.removeOnEsc = function(event) {
			if(event.keyCode == 27) modalStack[modalStack.length - 1].firstChild.remove();
		};
		$.body.on("keydown", backdrop.removeOnEsc);
		$.body.addChild(backdrop);
		$.body.addClass("modal-open");
		modalStack.push(backdrop);
	}

	var m = $.element("div")
		.addClass("modal")
		.on("click", function(event) {
			event.stopPropagation()
		});

	var w = $.element("div")
		.addClass("modal-wrap")
		.addChild(m)
		.on("click", function() { m.remove() });

	if(modalStack.length > 1) modalStack[modalStack.length - 1].addClass("hide");
	modalStack.push(w);

	$.body.addChild(w);

	var remove = function(e) {
		modalStack.splice(modalStack.length - 1, 1);
		var n = modalStack[modalStack.length - 1];
		if(modalStack.length > 1) {
			n.removeClass("hide");
		} else {
			$.body.off("keydown", n.removeOnEsc);
			$.body.removeClass("modal-open");
			n.remove();
			modalStack.splice(0, 1);
		}
		m.parentNode.remove();
		m.dispatchEvent(new CustomEvent(e));
	};

	m.set = function(k, v) {
		if(v == undefined) delete(m[k]);
		else m[k] = v;
		return m;
	};

	m.remove = function() {
		remove("remove");
	};

	m.submit = function() {
		remove("submit");
	};

	return m
};

Element.prototype.bindScope = function(data) {
	var self = this;

	if(self.scope) self.scope.destroy();

	var dataErrors = {};

	var dataValidate = function() {
		var e = this,
			r = false;
		$.forEach(e.$validate, function(fn) {
			if(!fn.call(e, e.value)) r = true;
		});
		if(e.$error != r) {
			e.setError(r);
			e.$error = r;
			if(r) dataErrors[e.dataset.bind] = true;
			else delete(dataErrors[e.dataset.bind]);
		}
	};

	var setDataBind = function(e, t) {
		var key = e.dataset.bind;
		if(!self.scope.map[key]) self.scope.map[key] = [];
		self.scope.map[key].push(e);
		e.scope = self.scope;

		e.addAttr("name", e.dataset.bind);

		switch(t) {
			case "text":
			case "password":
			case "textarea":
			case "number":
				e.bindEvent = "input";
				e.bindSetValue = function(val) { this.value = (val !== undefined) ? val : "" };
				e.bindGetValue = function() { return (this.value !== "") ? this.value : undefined };
				break;
			case "hidden":
				e.bindSetValue = function(val) { this.value = (val !== undefined) ? val : "" };
				break;
			case "select":
				e.bindEvent = "change";
				e.bindSetValue = function(val) { this.value = (val !== undefined) ? val : "" };
				e.bindGetValue = function() { return (this.value !== "") ? this.value : undefined };
				break;
			case "checkbox":
				var x = function(v) {
					var s = v.toString();
					if(!e.dataset.hasOwnProperty(s)) return v;
					v = e.dataset[s];
					switch(v)
					{
						case "true": return true;
						case "false": return false;
						case "undefined": return undefined;
						default: return v;
					}
				};
				e.value_map = {};
				e.value_map[true] = x(true);
				e.value_map[false] = x(false);

				e.bindEvent = "change";
				e.bindSetValue = function(val) { this.checked = this.value_map[true] === val };
				e.bindGetValue = function() { return this.value_map[this.checked] };
				break;
			case "radio":
				e.bindEvent = "change";
				e.bindSetValue = function(val) { this.checked = (this.value === val) };
				e.bindGetValue = function() { return this.value };
				break;
		}
		e.bindSetValue(self.scope.get(key));
		if(e.bindEvent) {
			e.on(e.bindEvent, function() {
				var x = this.bindSetValue;
				this.bindSetValue = $.nop;
				self.scope.set(this.dataset.bind, this.bindGetValue());
				this.bindSetValue = x;
				if(this.$validate) dataValidate.call(this);
			});
			var x = e.eventBind[e.bindEvent].list;
			if(x.length > 1) x.move(x.length - 1, 0);
		}
		if(e.$validate) dataValidate.call(e);
	};

	var setDataValue = function(e) {
		var key = e.dataset.bind;
		if(!self.scope.map[key]) self.scope.map[key] = [];
		self.scope.map[key].push(e);
		e.scope = self;

		e.bindSetValue = function(val) { this.textContent = (val !== undefined) ? val : "" };
		e.bindSetValue(self.scope.get(key));
	};

	var bind = function() {
		var el = self.querySelectorAll("*[data-bind]");
		for(var i = 0; i < el.length; ++i) {
			var e = el[i];
			switch(e.tagName) {
				case "INPUT":
					setDataBind(e, e.type);
					break;
				case "TEXTAREA":
					setDataBind(e, "textarea");
					break;
				case "SELECT":
					setDataBind(e, "select");
					break;
				default:
					setDataValue(e);
					break;
			}
		}
	};

	var render = function(node) {
		var el = (node || self).querySelectorAll("*[data-render]");
		for(var i = 0; i < el.length; ++i) {
			var e = el[i],
				dst = window,
				key = e.dataset.render.split(".");
			while(key.length > 1) dst = dst[key.shift()];
			key = key[0];
			if(!dst[key]) throw "render callback not found [" + e.dataset.render + "]";
			dst[key].call(self, e);
			render(e);
		}
	};

	self.scope = {};

	var scopeClear = function() {
		self.scope.map = {};
		self.scope.events = {};
		var renderList = self.querySelectorAll("*[data-render]");
		for(var i = renderList.length - 1; i != -1; --i) renderList[i].empty();
	};

	var scopeEvent = function(event) {
		self.dispatchEvent(new CustomEvent(event));
		self.off(event);
	};

	self.scope.reset = function(scopeData) {
		if(scopeData) data = scopeData;
		scopeClear();
		render();
		bind();
		scopeEvent("ready");
	};

	self.scope.destroy = function() {
		scopeEvent("destroy");
		scopeClear();
		delete(self.scope);
	};

	self.scope.set = function(key, value) {
		var dst = data;
		var k = key.match(/(\\\.|[^\.])+/g);
		while(k.length > 1) {
			var sk = k.shift().replace(/\\\./g, ".");
			if(dst[sk] == undefined) dst[sk] = {};
			dst = dst[sk];
		}
		k = k[0].replace(/\\\./g, ".");
		if(value != undefined) {
			dst[k] = value;
		} else {
			value = "";
			delete(dst[k]);
		}

		/* syncScope */
		$.forEach(self.scope.map[key], function(e) {
			e.bindSetValue(value);
			if(e.dataset.validate) validateAction.call(e);
		});
	};

	self.scope.get = function(key) {
		var src = data;
		var k = key.match(/(\\\.|[^\.])+/g);
		while(k.length > 1) {
			var sk = k.shift().replace(/\\\./g, ".");
			src = src[sk];
			if(src == undefined) return undefined;
		}
		k = k[0].replace(/\\\./g, ".");
		return src[k];
	};

	self.scope.validate = function() {
		return $.isObjectEmpty(dataErrors);
	};

	self.scope.serialize = function() {
		var x = $.clone(data);
		$.forEach(x, function(v, k) {
			if(k.charAt(0) == "$") delete(x[k]);
		});
		return x;
	};

	setTimeout(function() { self.scope.reset() });
	return self
};

$.onStart = function(fn) {
	var x = function() {
		document.removeEventListener("DOMContentLoaded", x, false);
		fn();
	};
	document.addEventListener("DOMContentLoaded", x);
};

$.onRoute = function(fn) {
	window.addEventListener("hashchange", fn)
};

$.route = function(l) {
	location.href = l;
};

/* TABLE */

Element.prototype.dataOrder = function(fn, def) {
	this.addAttr("data-order", (def) ? 1 : 0);
	this.$order = fn;
	return this
};

$.tableInit = function(table) {
	var i,
		thead = table.querySelector("thead").firstChild,
		tbody = table.querySelector("tbody");

	table.$orderId = -1;

	var reorder = function() {
		var x = thead.cells[table.$orderId];
		var a = new Array();
		for(i = 0; i < tbody.rows.length; ++i) a[i] = tbody.rows[i];
		a.sort(function(a, b) {
			return x.$order(a.cells[table.$orderId], b.cells[table.$orderId]) * x.dataset.order;
		});
		while(a.length) tbody.appendChild(a.shift());
	};

	for(i = 0; i < thead.cells.length; ++i) {
		var e = thead.cells[i];
		if(e.dataset.order != undefined) {
			if(table.$orderId == -1 || e.dataset.order != 0) table.$orderId = i;
			e.$orderId = i;
			e.on("click", function() {
				if(table.$orderId == this.$orderId) {
					thead.cells[table.$orderId].dataset.order *= -1;
				} else {
					thead.cells[table.$orderId].dataset.order = 0;
					table.$orderId = this.$orderId;
					thead.cells[table.$orderId].dataset.order = 1;
				}
				reorder();
			});
		}
	}

	reorder();
};

$.tableSortInsert = function(table, row) {
	var thead = table.querySelector("thead").firstChild;
	var tbody = table.querySelector("tbody");

	var x = thead.cells[table.$orderId];
	var r = row.cells[table.$orderId];

	var l = 0, m = tbody.rows.length;
	while(l < m) {
		var mid = (l + m) >>> 1;
		if(x.$order(tbody.rows[mid].cells[table.$orderId], r) * x.dataset.order == -1) l = mid + 1;
		else m = mid;
	}

	if(l == tbody.rows.length) tbody.appendChild(row);
	else tbody.insertBefore(row, tbody.rows[l]);
};

$.tableFilter = function(table, filter) {
	for(var i = 0; i < table.rows.length; ++i) {
		var row = table.rows[i];
		row.removeClass("hide");
		if(filter) {
			var hide = true;
			for(var j = 0; j < row.cells.length; ++j) {
				var cell = row.cells[j].innerHTML;
				if(cell.toLowerCase().indexOf(filter) != -1) {
					hide = false;
					break;
				}
			}
			if(hide) row.addClass("hide");
		}
	}
};

/* BASE64 */

var utf8 = {
	encode: function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for(var i = 0; i < string.length; i++) {
			var c = string.charCodeAt(i);
			if(c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
	decode: function (utftext) {
		var string = "";
		for(var i = 0; i < utftext.length; ) {
			var c = utftext.charCodeAt(i);
			if(c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				string += String.fromCharCode(((c & 31) << 6) |
					(utftext.charCodeAt(i+1) & 63));
				i += 2;
			} else {
				string += String.fromCharCode(((c & 15) << 12) |
					((utftext.charCodeAt(i+1) & 63) << 6) |
					(utftext.charCodeAt(i+2) & 63));
				i += 3;
			}
		}
		return string;
	},
}

$.base64Decode = function(text) {
	return utf8.decode(atob(text))
};

$.base64Encode = function(text) {
	return btoa(utf8.encode(text))
};

})();

/* app.js */

app = {
	scope: null,
	hosts: {},
	modules: [],
	menu: [],
	settings: [],

	themes: [
		{ value: "", label: "Default: Light" },
		{ value: "dark", label: "Dark" },
	],
};

monthMap = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

codepages = [
	{ value: "", label: "Default: Latin (ISO 6937)" },
	{ value: "1", label: "West European (ISO 8859-1)" },
	{ value: "2", label: "East European  (ISO 8859-2)" },
	{ value: "3", label: "South European (ISO 8859-3)" },
	{ value: "4", label: "North European (ISO 8859-4)" },
	{ value: "5", label: "Cyrillic (ISO 8859-5)" },
	{ value: "6", label: "Arabic (ISO 8859-6)" },
	{ value: "7", label: "Greek (ISO 8859-7)" },
	{ value: "8", label: "Hebrew (ISO 8859-8)" },
	{ value: "9", label: "Turkish (ISO 8859-9)" },
	{ value: "10", label: "Nordic (ISO 8859-10)" },
	{ value: "11", label: "Thai (ISO 8859-11)" },
	{ value: "13", label: "Baltic (ISO 8859-13)" },
	{ value: "15", label: "West European (ISO 8859-15)" },
	{ value: "21", label: "UTF-8" },
];

dvbPolarization = [
	{ value: "" },
	{ value: "V", label: "Vertical" },
	{ value: "H", label: "Horizontal" },
	{ value: "-", label: "----", disabled: true },
	{ value: "R", label: "Right" },
	{ value: "L", label: "Left" },
];

dvbFec = [
	{ value: "", label: "Default: Auto" },
	{ value: "NONE" },
	{ value: "1/2" },
	{ value: "2/3" },
	{ value: "3/4" },
	{ value: "4/5" },
	{ value: "5/6" },
	{ value: "6/7" },
	{ value: "7/8" },
	{ value: "8/9" },
	{ value: "3/5" },
	{ value: "9/10" },
];

dvbsModulation = [
	{ value: "", label: "Default: not set" },
	{ value: "QPSK" },
	{ value: "PSK8", label: "8PSK" },
	{ value: "QAM16", label: "16-QAM" },
];

dvbcModulation = [
	{ value: "", label: "Default: not set" },
	{ value: "QAM16", label: "16-QAM" },
	{ value: "QAM32", label: "32-QAM" },
	{ value: "QAM64", label: "64-QAM" },
	{ value: "QAM128", label: "128-QAM" },
	{ value: "QAM256", label: "256-QAM" },
];

validateId = function(value) {
	if(value == undefined || value == "") return true;
	return (/^[^\\\/&%\.+]*$/).test(value);
};

validatePort = function(value) {
	if(value == undefined || value == "") return true;
	value = Number(value);
	return (!isNaN(value) && value > 0 && value <= 0xFFFF);
};

validatePid = function(value) {
	if(value == undefined || value == "") return true;
	value = Number(value);
	return (!isNaN(value) && value > 20 && value <= 0x1FFF);
};

validatePnr = function(value) {
	if(value == undefined || value == "") return true;
	value = Number(value);
	return (!isNaN(value) && value > 0 && value <= 0xFFFF);
};

validateBiss = function(value) {
	if(value == undefined || value == "") return true;
	return (/^[0-9A-Fa-f]{16}$/).test(value);
};

validateUrl = function(value) {
	if(value == undefined || value == "") return true;
	return (!!parseUrl(value));
};

validateHex = function(value) {
	if(value == undefined || value == "") return true;
	return (value.length % 2) == 0 && (/^[0-9A-Fa-f]*$/).test(value);
};

Array.prototype.sortedIndex = function(v, fn) {
	if(!this.length) return 0;
	var l = 0, h = this.length;
	while(l < h) {
		var mid = (l + h) >>> 1;
		if(fn(this[mid], v) == -1) l = mid + 1;
		else h = mid;
	}
	return l;
};

Array.prototype.indexOfID = function(id) {
	for(var i = 0; i < this.length; ++i) {
		if(this[i].id == id) return i;
	}
	return -1;
};

Array.prototype.uniq = function() {
	var i = 1
	while(i < this.length) {
		if(this[i - 1] == this[i]) this.splice(i, 1);
		else ++i;
	}
};

Number.prototype.format = function(c, d, t) {
	var n = this,
		c = isNaN(c = Math.abs(c)) ? 2 : c,
		d = d == undefined ? " " : d,
		t = t == undefined ? "." : t,
		s = n < 0 ? "-" : "",
		i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;

	return s
		+ (j ? i.substr(0, j) + d : "")
		+ i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + d)
		+ (c ? t + Math.abs(n - i).toFixed(c).slice(2) : "");
};

Number.prototype.toHex = function(p,u) {
	var n = this,
		p = p == undefined ? 2 : p,
		h = n.toString(16);
	if(u) h = h.toUpperCase();
	while(h.length < p) h = "0" + h;
	return "0x" + h;
};

function ip2num(x) {
	if(!x) return 0;
	x = x.split(".");
	while(x.length != 4) x.splice(-1, 0, 0);
	return ((((((+x[0])*256)+(+x[1]))*256)+(+x[2]))*256)+(+x[3]);
}

/*
ooooo  oooo oooooooooo  ooooo
 888    88   888    888  888
 888    88   888oooo88   888
 888    88   888  88o    888      o
  888oo88   o888o  88o8 o888ooooo88
*/

parseUrlFormat = {};

parseUrlFormat["udp"] = function(r) {
	var b = r.addr.indexOf("/");
	if(b != -1) r.addr = r.addr.substring(0, b);
	b = r.addr.indexOf("@");
	if(b != -1) {
		if(b > 0) r.localaddr = r.addr.substring(0, b);
		r.addr = r.addr.substring(b + 1);
	}
	b = r.addr.indexOf(":");
	if(b != -1) {
		r.port = Number(r.addr.substring(b + 1));
		if(isNaN(r.port) || r.port < 1 || r.port > 65535) return false;
		r.addr = r.addr.substring(0, b);
	} else {
		r.port = 1234;
	}
	if(!r.addr.length) return false;
	var a = r.addr.split(".");
	if(a.length > 4) return false;
	while(a.length) {
		var o = Number(a.shift());
		if(isNaN(o) || o < 0 || o > 255) return false;
	}
	return true;
};
parseUrlFormat["rtp"] = parseUrlFormat["udp"];

parseUrlFormat["http"] = function(r) {
	var b = r.addr.indexOf("/");
	if(b != -1) {
		r.path = r.addr.substring(b);
		r.addr = r.addr.substring(0, b);
	} else {
		r.path = "/";
	}
	b = r.addr.indexOf("@");
	if(b != -1) {
		if(b > 0) {
			var a = r.addr.substring(0, b).split(":");
			if(a.length == 2) {
				r.login = a[0];
				r.password = a[1];
			}
		}
		r.addr = r.addr.substring(b + 1);
	}
	b = r.addr.indexOf(":");
	if(b != -1) {
		r.port = Number(r.addr.substring(b + 1));
		if(isNaN(r.port) || r.port < 1 || r.port > 65535) return false;
		r.host = r.addr.substring(0, b);
	} else {
		switch(r.format) {
			case "http": r.port = 80; break;
			case "https": r.port = 443; break;
			case "rtsp": r.port = 554; break;
			default: r.port = 80; break;
		}
		r.host = r.addr;
	}
	delete(r.addr);
	if(!r.host.length) return false;
	return true;
};
parseUrlFormat["https"] = parseUrlFormat["http"];
parseUrlFormat["rtsp"] = parseUrlFormat["http"];
parseUrlFormat["np"] = parseUrlFormat["http"];

parseUrlFormat["file"] = function(r) {
	r.filename = r.addr;
	delete(r.addr);
	return true;
};

function parseUrl(url) {
	if(!url) return null;
	var b = url.indexOf("://");
	if(b == -1 || url.length <= b + 3) return null;
	var r = {};
	r.format = url.substring(0, b);
	url = url.substring(b + 3);
	b = url.indexOf("#");
	if(b == -1) {
		r.addr = url;
	} else {
		r.addr = url.substring(0, b);
		url = url.substring(b + 1).split("&");
		for(var i = 0; i < url.length; ++i) {
			var o = url[i].split("="),
				k = o[0],
				v = (o.length == 2) ? o[1] : true;
			r[k] = v;
		}
	}

	if(parseUrlFormat.hasOwnProperty(r.format) && !parseUrlFormat[r.format](r)) return null;
	return r
}

makeUrlFormat = {};

makeUrlFormat["udp"] = function(d) {
	if(d.localaddr) { d.addr = d.localaddr + "@" + d.addr; delete(d.localaddr) }
	if(d.port) { d.addr += ":" + d.port; delete(d.port) }
};
makeUrlFormat["rtp"] = makeUrlFormat["udp"];

makeUrlFormat["http"] = function(d) {
	d.addr = "";
	if(d.login) {
		d.addr += d.login;
		delete(d.login);
		if(d.password) {
			d.addr += ":" + d.password;
			delete(d.password);
		}
		d.addr += "@";
	}
	if(d.host) { d.addr += (d.host != "0.0.0.0") ? d.host : "0"; delete(d.host) }
	if(d.port) { d.addr += ":" + d.port; delete(d.port) }
	if(d.path) { d.addr += d.path; delete(d.path) }
};
makeUrlFormat["https"] = makeUrlFormat["http"];
makeUrlFormat["rtsp"] = makeUrlFormat["http"];
makeUrlFormat["np"] = makeUrlFormat["http"];

makeUrlFormat["file"] = function(d) {
	d.addr = d.filename;
	delete(d.filename);
};

function makeUrl(data) {
	var d = $.clone(data);
	if(makeUrlFormat.hasOwnProperty(d.format)) makeUrlFormat[d.format](d);
	var r = d.format + "://" + (d.addr || "")
	delete(d.format);
	delete(d.addr);
	var o = [];
	for(k in d) {
		var v = d[k];
		if(!v) {
			continue;
		} else if(v === true) {
			o.push(k);
		} else {
			o.push(k + "=" + v);
		}
	}
	if(o.length) r += "#" + o.join("&");
	return r
};

/*
oooo     oooo ooooooooooo oooo   oooo ooooo  oooo
 8888o   888   888    88   8888o  88   888    88
 88 888o8 88   888ooo8     88 888o88   888    88
 88  888  88   888    oo   88   8888   888    88
o88o  8  o88o o888ooo8888 o88o    88    888oo88
*/

function renderModalInfo() {
	var modal = $.modal();
	var sysinfo = app.hosts[location.host].sysinfo;
	var version = "Astra " + sysinfo.version;
	if(sysinfo.commit) {
		var x = sysinfo.commit.split(" ");
		version += " [commit:" + x[0] + " date:" + x[1] + "]";
	}

	modal
		.addChild($.element("span")
			.addClass("form-group-header")
			.setText(version))
		.addChild($.element("pre")
			.setText(sysinfo.license || "-"));

	modal
		.addChild($.element("hr"))
		.addChild($.element()
			.addClass("text-center")
			.addChild($.element.button("Ok")
				.addClass("submit")
				.on("click", function() { modal.remove() })));
}

function renderModalMenu(module) {
	var modal = $.modal()
		.addClass("main-menu");

	modal.addChild($.element.a("#", "Astra " + app.hosts[location.host].sysinfo.version)
		.on("click", function(event) {
			event.preventDefault();
			renderModalInfo();
		}));

	var makeItem = function(item) {
		modal.addChild($.element.a(item.link || "#", item.label)
			.on("click", function(event) {
				modal.remove();

				if(item.click) {
					event.preventDefault();
					item.click(event);
				}
			}));
	};

	modal.addChild($.element("hr"));
	$.forEach(app.menu, makeItem);
	if(module.menu) {
		modal.addChild($.element("hr"));
		$.forEach(module.menu, makeItem);
	}
}

function renderMenu(module) {
	var object = app.mainMenu;
	app.mainMenu.empty();

	object.addChild($.element.a("#", "Astra " + app.hosts[location.host].sysinfo.version)
		.addClass("hide-mobile")
		.on("click", function(event) {
			event.preventDefault();
			renderModalInfo();
		}));

	var makeItem = function(item) {
		object.addChild($.element.a(item.link || "#", item.label)
			.addClass("hide-mobile", item.hide ? "hide" : null)
			.on("click", function(event) {
				if(item.click) {
					event.preventDefault();
					item.click(event);
				}
			}));
	};

	$.forEach(app.menu, makeItem);

	if(!module.search) {
		object.addChild($.element()
			.addClass("search"));
	} else {
		object.addChild($.element.input("Search")
			.addClass("search")
			.addAttr("autocomplete", "off")
			.dataBind("search")
			.on("input", function() {
				app.search(this.value)
			})
			.on("keydown", function(event) {
				if(event.keyCode == 27) {
					this.value = "";
					app.search("");
				}
			}));
	}

	$.forEach(module.menu, makeItem);

	object.addChild($.element.a("#", "Menu")
		.addClass("hide-desktop")
		.on("click", function(event) {
			event.preventDefault();
			renderModalMenu(module);
		}));
}

/*
ooooooooooo  ooooooo  oooooooooo  oooo     oooo
 888    88 o888   888o 888    888  8888o   888
 888ooo8   888     888 888oooo88   88 888o8 88
 888       888o   o888 888  88o    88  888  88
o888o        88ooo88  o888o  88o8 o88o  8  o88o
*/

function Form(scope, parent) {
	var form = $.element("form")
		.addClass("form")
		.addAttr("novalidate")
		.addAttr("autocomplete", "off")
		.on("keydown", function(event) {
			if(event.which == 13) {
				switch(event.target.tagName) {
					case "TEXTAREA":
					case "BUTTON":
						break;
					default:
						event.preventDefault();
						break;
				}
			}
		});

	this.node = form;
	this.scope = scope;
	if(parent) parent.addChild(form);

	this.loading = function() {
		var x = $.element().addClass("loading");
		for(var i = 0; i < 4; ++i) x.addChild($.element().addClass("bullet"));
		form.addChild(x);
		return x
	};

	this.group = function() {
		var g = $.element()
			.addClass("form-group");
		form.addChild(g);
		return g
	};

	this.header = function(title, action, click) {
		var g = $.element()
			.addClass("form-group-header")
			.addChild(title || "");
		if(action && click) g.addChild($.element.a("#", action)
			.addClass("form-group-action")
			.on("click", function(event) {
				event.preventDefault();
				click();
			}));
		form.addChild(g);

		return g
	};

	this.hr = function() {
		var x = $.element("hr");
		form.addChild(x);

		return x
	};

	this.tab = function(tabId, options) {
		var g = this.group(),
			c = scope.get(tabId),
			l = $.element().addClass("tab");
		if(c == undefined) c = options[0].id;
		$.forEach(options, function(v) {
			l.addChild((c == v.id) ?
				$.element("span")
					.setText(v.label) :
				$.element.a(v.link || "#", v.label)
					.on("click", function(event) {
						event.preventDefault();
						scope.set(tabId, v.id);
						scope.reset();
					}));
		});
		g.addChild(l);

		return l
	};

	this.checkbox = function(title, bind) {
		var g = this.group();
		var x = $.element.checkbox(title || "");
		x.checkbox
			.dataBind(bind)
			.addAttr("data-false", "undefined");

		x.checkbox.setDisabled = function(value) {
			var f = (!!value) ? "addAttr" : "removeAttr";
			var a = "disabled";
			x.checkbox[f](a);
			x[f](a);
			return x.checkbox;
		};

		x.checkbox.setDanger = function() {
			x.addClass("danger");
			return x.checkbox;
		};

		x.checkbox.awaiting = function(value) {
			x.checkbox.setDisabled(value);
			var f = (!!value) ? "addClass" : "removeClass";
			x[f]("awaiting");
		};

		g.addChild(x);

		return x.checkbox;
	};

	this.input = function(title, bind, placeholder) {
		var x = $.element.input().dataBind(bind);
		if(placeholder) x.addAttr("placeholder", placeholder);

		var g = this.group(title)
			.addAttr("data-label", title)
			.addChild(x);

		x.on("mousewheel", function() { this.blur() });

		x.setRequired = function() {
			x.addAttr("required");
			x.addValidator(function(value) { return (value != undefined && value != "") });
			return x;
		};

		x.setError = function(value) {
			if(value) {
				g.addClass("error");
				x.addClass("error");
			} else {
				g.removeClass("error");
				x.removeClass("error");
			}
		};

		x.addButton = function(button) {
			if(!x.buttonWrap) {
				x.buttonWrap = $.element()
					.addClass("button-wrap");
				g
					.addClass("io-wizard")
					.addChild(x.buttonWrap);
			}
			x.buttonWrap.addChild(button);
			return x;
		};

		return x
	};

	this.password = function(title, bind, placeholder) {
		var x = this.input(title, null, placeholder);
		var m = function(p) { x.value = (!p) ? "" : ((new Array(p.length + 1)).join("*")) };
		m(scope.get(bind));
		x
			.on("focus", function() {
				x.value = scope.get(bind) || "";
			})
			.on("blur", function() {
				scope.set(bind, x.value);
				m(x.value);
			});

		return x;
	};

	this.number = function(title, bind, placeholder) {
		var x = this.input(title, bind, placeholder);
		x.addAttr("type", "number");
		return x
	};

	this.choice = function(title, bind, options) {
		var x = $.element.select(options).dataBind(bind);

		var g = this.group(title)
			.addAttr("data-label", title)
			.addChild(x);

		x.setRequired = function() {
			x.addAttr("required");
			x.addValidator(function(value) { return (value != undefined && value != "") });
			return x
		};

		x.setError = function(value) {
			if(value) {
				g.addClass("error");
				x.addClass("error");
			} else {
				g.removeClass("error");
				x.removeClass("error");
			}
		};

		return x
	};

	this.hidden = function(bind) {
		var x = $.element("input")
			.addAttr("type", "hidden")
			.dataBind(bind);
		form.addChild(x);
		return x
	};

	this.submit = function(btn) {
		var x = $.element().addClass("form-submit");
		form.addChild(x);
		return x
	};
}

/*
ooooo ooooo  ooooooo    oooooooo8 ooooooooooo
 888   888 o888   888o 888        88  888  88
 888ooo888 888     888  888oooooo     888
 888   888 888o   o888         888    888
o888o o888o  88ooo88   o88oooo888    o888o
*/

function Host(hostConfig, callback) {
	var self = this,
		host = hostConfig.host,
		token = null;

	if(hostConfig.port) host += ":" + hostConfig.port;
	if(hostConfig.user) {
		token = hostConfig.user;
		if(hostConfig.pass) token += ":" + hostConfig.pass;
	}

	self.name = hostConfig.name || host;
	self.sysinfo = null;
	self.config = null;

	self.makeUid = function(type) {
		var arr = self.config[type];
		do {
			self.config.gid = self.config.gid + 1;
			var r = (self.config.gid).toString(36);
			if(!arr || arr.indexOfID(r) == -1) return r;
		} while(true);
	};

/* WebSocket */

	var ws, wsError;
	var connect = function() {
		ws = new WebSocket("ws://" + host + "/control/event/");
		ws.onopen = function() {
			ws.send(JSON.stringify({ scope: "auth", auth: token }))
		};

		ws.onclose = function() {
			app.removeHost(hostConfig);
			if(host == location.host) {
				app.mainMenu.empty();
				$.body.scope.destroy();
			}

			wsError = $.err({
				title: self.name,
				text:  "Connection closed. Retrying in {0}...",
				delay: 4,
			})
				.on("remove", function() {
					app.addHost(hostConfig);
				});
		};

		ws.onmessage = function(event) {
			var data;
			try {
				data = JSON.parse(event.data);
				if(!data.scope) throw "event scope not defined";
			} catch(e) {
				console.error(e); return;
			}
			app.event(data.scope, {
				host: host,
				data: data,
			});
		};
	};

/* Control API */

	var headers = { "Content-Type": "application/json" };

	self.request = function(data, onLoad, onError) {
		$.http({
			method: "POST",
			url: "http://" + host + "/control/",
			data: JSON.stringify(data),
			headers: headers,
		}, function(response) {
			if(onLoad) {
				response.data = JSON.parse(response.text);
				onLoad(response);
			}
		}, function(response) {
			if(onError) {
				onError(response);
			}
		});
	};

	self.restart = function() {
		self.request({ cmd: "restart" });
	};

	self.upload = function(fn) {
		self.request({
			cmd: "upload",
			config: self.config
		}, function() {
			if(fn) fn(true);
			self.restart();
		}, function() {
			$.err({
				title: self.name,
				text: "Upload failed"
			});
			if(fn) fn(false);
		})
	};

	var authForm = null;
	var authFormInit = function() {
		if(authForm) {
			authForm.setDisabled(false);
			return;
		}

		var u = $.element.input("Login");
		var p = $.element.input("Password", "password");
		var r = $.element.checkbox("Remember me");
		var s = $.element.button("Sign In")
			.addAttr("type", "submit")
			.addClass("submit");

		authForm = $.element("form")
			.addClass("auth")
			.addChild(u, p, r, s)
			.on("submit", function(event) {
				event.preventDefault();
				authForm.setDisabled(true);
				app.login = u.value;
				token = u.value + ":" + p.value;
				$.cookie.set("auth", (r.checkbox.checked) ? token : undefined);
				p.value = "";
				load();
			});
		authForm.setDisabled = function(value) { s.setDisabled(value) };

		$.body.addChild(authForm);
		u.focus();
	};

	var loadError = null;
	var load = function() {
		if(token) headers["Authorization"] = "Basic " + $.base64Encode(token);

		if(loadError) {
			loadError.remove();
			loadError = null;
		}

		self.request({
			cmd: "status"
		}, function(response) {
			var data = response.data;

			if(authForm) {
				authForm.remove();
				authForm = null;
			}

			if(!data.upload) {
				$.err({
					title: "Configuration file not found",
					delay: -1
				});
				return;
			}

			if(data.if_list) {
				data.if_list.sort();
				var ifList = [];
				var ipList = data.ip_list || {};
				$.forEach(data.if_list, function(i) {
					var n = { value: i, label: i };
					if(data.ip_list && data.ip_list[i]) {
						n.ip = data.ip_list[i];
						n.label += ": " + n.ip;
					}
					ifList.push(n);
				});
				data.if_list = ifList;
			}

			if(data.observer) {
				SettingsModule.hide = true;
				app.observer = true;
			}

			self.sysinfo = data;

			self.request({
				cmd: "load"
			}, function(response) {
				var data = response.data;
				self.config = $.isObject(data) ? data : {};
				if(!self.config.gid) self.config.gid = 466560;

				connect();
				callback.call(self);
			}, function() {
				loadError = $.err({
					title: "Configuration file has wrong format",
					delay: -1
				});
			});
		}, function(response) {
			if(response.status == 403) {
				var text = "Authentication failed.";
				if(location.host == host) {
					authFormInit();
					if(!token) return;
				} else {
					var idx = app.hosts[location.host].config.servers.indexOf(hostConfig);
					text += "<br/><a href=\"#/settings-servers/" + idx + "\">Check streamer configuration</a>";
				}
				loadError = $.err({
					title: self.name,
					text: text,
					delay: -1
				});
			} else {
				loadError = $.err({
					title: self.name,
					text:  "Connection failed. Retrying in {0}...",
					delay: 10,
				})
					.on("remove", function() {
						loadError = null;
						load();
					});
			}
		});
	};

	load();

	self.destroy = function() {
		if(loadError) {
			loadError.remove();
			loadError = null;
		}
		if(wsError) {
			wsError.remove();
			wsError = null;
		}
		if(ws) {
			ws.onclose = null;
			if(ws.readyState == WebSocket.OPEN) ws.close();
			ws = null;
		}
	};
}

app.addHost = function(config, fn) {
	var host = config.host;
	if(config.port) host += ":" + config.port;

	app.hosts[host] = new Host(config, function() {
		if(fn) fn.call(this);
		$.forEach(app.modules, function(m) {
			if(m.addHost) m.addHost(host);
		});

		app.route();
	});
};

app.removeHost = function(config) {
	var host = config.host;
	if(config.port) host += ":" + config.port;

	if(app.hosts[host]) {
		$.forEach(app.modules, function(m) {
			if(m.removeHost) m.removeHost(host);
		});

		app.hosts[host].destroy();
		delete(app.hosts[host]);
	}
};

app.selectHost = function(link, id) {
	id = (id) ? ("/" + id) : "";
	if(Object.keys(app.hosts).length == 1) {
		$.route(link + "/" + location.host + id);
		return;
	}

	var modal = $.modal().addClass("main-menu");
	$.forEach(app.hosts, function(appHost, hostId) {
		if(appHost.config) {
			modal.addChild($.element.a(link + "/" + hostId + id, appHost.name)
				.on("click", function() { modal.remove() }));
		}
	});
	modal.addChild($.element("hr"));
	modal.addChild($.element.a("#", "Cancel")
		.addClass("text-center")
		.on("click", function(event) {
			event.preventDefault();
			modal.remove();
		}));
};

/*
 oooooooo8    oooooooo8     o      oooo   oooo
888         o888     88    888      8888o  88
 888oooooo  888           8  88     88 888o88
        888 888o     oo  8oooo88    88   8888
o88oooo888   888oooo88 o88o  o888o o88o    88
*/

function Scan(hostId, config, fn) {
	var scanId = null,
		scanTimer = null,
		tsid = -1,
		scanData = [],
		psiCache = [],
		appHost = app.hosts[hostId],
		changed = false;

	var getScanItem = function(pnr) {
		var i,x;
		for(i = 0; i < scanData.length; ++i) {
			x = scanData[i];
			if(x.pnr == pnr) return x;
		}
		x = { pnr: pnr, name: "Unknown" };
		i = scanData.sortedIndex(x, function(a,b) {
			return (a.pnr > b.pnr) ? 1 : -1;
		});
		scanData.splice(i, 0, x);
		return x;
	};

	var scanCheckPsi = function(psi) {
		if(tsid == -1 && psi.psi != "pat") {
			psiCache.push(psi);
		} else if(scanCheckPsi[psi.psi] != undefined) {
			scanCheckPsi[psi.psi](psi);
		}
	};

	scanCheckPsi.pat = function(pat) {
		tsid = pat.tsid;

		$.forEach(psiCache, scanCheckPsi);
		psiCache = [];
		changed = true;
	};

	scanCheckPsi.nit = function(nit) {
		var data = getScanItem(0);

		$.forEach(nit.descriptors, function(d) {
			if(d.type_id == 64) data.name = d.network_name;
		});
		$.forEach(nit.streams, function(s) {
			if(s.tsid != tsid) return;
			$.forEach(s.descriptors, function(d) {
				switch(d.type_id) {
					case 67: {
						data.system = d;
						data.name = ((d.s2) ? "DVB-S2" : "DVB-S") + " : " + data.name;
						break;
					}
					case 68: {
						data.system = d;
						data.name = "DVB-C : " + data.name;
						break;
					}
					case 90: {
						data.system = d;
						data.name = "DVB-T : " + data.name;
						break;
					}
				}
			});
		});
		changed = true;
	};

	scanCheckPsi.pmt = function(pmt) {
		var data = getScanItem(pmt.pnr);
		data.streams = [];
		data.cas = [];
		$.forEach(pmt.descriptors, function(d) {
			if(d.type_id == 9) data.cas.push(d.caid.toHex(4));
		});
		$.forEach(pmt.streams, function(x) {
			if(["VIDEO","AUDIO"].indexOf(x.type_name) == -1) return;
			var r = x.type_name.charAt(0) + "PID:" + x.pid;
			var e = null;
			var l = null;
			if(x.type_id == 0x1B) e = "MPEG-4";
			$.forEach(x.descriptors, function(d) {
				switch(d.type_id) {
					case 0x09: data.cas.push(d.caid.toHex(4)); break;
					case 0x0A: l = d.lang; break;
					case 0x6A: e = "AC-3"; break;
				}
			});
			if(e) r = r + " " + e;
			if(l) r = r + " " + l;
			data.streams.push(r);
		});
		data.cas.sort();
		data.cas.uniq();
		changed = true;
	};

	scanCheckPsi.sdt = function(sdt) {
		$.forEach(sdt.services, function(x) {
			var data = getScanItem(x.sid);
			$.forEach(x.descriptors, function(d) {
				if(d.type_id == 72 || d.type_id == 93) {
					data.name = d.service_name || "Unknown";
					data.provider = d.service_provider;
				} 
			});
		});
		changed = true;
	};

	var scanCheck = function() {
		appHost.request({
			cmd: "scan-check",
			id: scanId
		}, function(response) {
			var data = response.data;
			if(scanData) {
				$.forEach(data.scan, scanCheckPsi);
				if(changed) {
					fn(scanData);
					changed = false;
				}
			}
		});
	};

	appHost.request({
		cmd: "scan-init",
		scan: config
	}, function(response) {
		if(!scanData) return;
		var data = response.data;

		scanId = data.id;
		scanTimer = setInterval(scanCheck, 2000);
	}, function() {
		$.err({
			title: appHost.name,
			text: "Failed to scan stream"
		})
	});

	this.destroy = function() {
		if(scanTimer) clearInterval(scanTimer), scanTimer = null;
		if(scanData) scanData = null;
		if(scanId) {
			appHost.request({
				cmd: "scan-kill",
				id: scanId
			}, function() {
				scanId = null;
			});
		}
	};
}

/*
     o      oooooooooo oooooooooo
    888      888    888 888    888
   8  88     888oooo88  888oooo88
  8oooo88    888        888
o88o  o888o o888o      o888o
*/

app.setTheme = function(value) {
	var e = $.html;
	if(e.theme) e.removeClass(e.theme);
	if(value) e.addClass(value);
	e.theme = value;
	$.cookie.set("theme", value, 7);
};

app.getTheme = function() {
	return $.cookie.get("theme");
};

app.menu.push = function(item) {
	var i = Array.prototype.sortedIndex.call(this, item, function(a, b) {
		var ao = (a.order != undefined) ? a.order : 1000;
		var bo = (b.order != undefined) ? b.order : 1000;
		return (ao > bo) ? 1 : -1;
	});
	Array.prototype.splice.call(this, i, 0, item);
};

app.settings.push = function(item) {
	var i = Array.prototype.sortedIndex.call(this, item, function(a, b) {
		var ao = (a.order != undefined) ? a.order : 1000;
		var bo = (b.order != undefined) ? b.order : 1000;
		return (ao > bo) ? 1 : -1;
	});
	Array.prototype.splice.call(this, i, 0, item);
};

app.route = function() {
	var m = null,
		route = location.hash.match(/^(#\/[a-z-]*)\/*/);

	if(route) for(var i = 0; i < app.modules.length; ++i) {
		m = app.modules[i];
		if(m.link == route[1]) break;
		m = null;
	}

	if(!m) {
		$.route(app.modules[0].link);
		return;
	}

	app.search = $.nop;
	renderMenu(m);
	if(m.init) m.init();
};

app.eventBind = {};

app.on = function(event, fn) {
	var eb = app.eventBind[event];
	if(!eb) app.eventBind[event] = eb = [];
	eb.push(fn);
};

app.off = function(event, fn) {
	var eb = app.eventBind[event];
	eb.splice(eb.indexOf(fn), 1)
	if(!eb.length) delete(app.eventBind[event]);
};

app.event = function(event) {
	var eb = app.eventBind[event];
	if(!eb) return;
	for(var i = 0; i < eb.length; i++) eb[i].apply(this, Array.prototype.slice.call(arguments, 1));
};

app.scope = {
	on: function(event, fn) {
		console.log("Deprecated Web-API for event:" + event);
		app.on(event, fn);
	},
	off: function(event, fn) {
		app.off(event, fn);
	},
}

$.onStart(function() {
	$.onRoute(app.route);

	/* .card resize */
	var s = $.element("style").addAttr("type", "text/css").setHtml(".card { width: 210px; }");
	$.head.addChild(s);

	var cardCss;
	for(var i = 0; i < s.sheet.cssRules.length; ++i) {
		var r = s.sheet.cssRules[i];
		if(r.selectorText == ".card") { cardCss = r; break }
	}

	var resize = function() {
		var w = $.body.clientWidth - 20,
			b = (w > 390) ? 210 : 160;
		if(w > b) {
			var c = Math.round(w / b),
				m = 6 * c - 6,
				l = Math.floor((w - m) / c);
			cardCss.style.width = "" + l + "px";
		} else {
			cardCss.style.width = "100%";
		}
	};
	window.addEventListener("resize", resize);
	resize();

	app.setTheme(app.getTheme());

	var token = $.cookie.get("auth");
	if(token) app.login = token.split(":")[0];

	app.addHost({
		host: location.hostname,
		port: location.port,
		user: token,
	}, function() {
		app.mainMenu = $.element()
			.addClass("main-menu fixed");

		$.body
			.addChild(app.mainMenu)
			.addChild($.element()
				.addClass("main-content")
				.dataRender("renderContent"));

		$.forEach(app.modules, function(m) {
			if(m.run) m.run()
		});

		$.forEach(this.config.servers, function(s) {
			if(s.type == "streamer") app.addHost(s);
		});
	});
});

/* dashboard.js */

(function() {
"use strict";

window.MainModule = {
	label: "Dashboard",
	link: "#/",
	order: 0,
	streams: {},
	adapters: {},
	search: true,
	menu: [
		{ label: "View", click: function() {
			var modalData = $.cookie.getObject("streams-view") || {};
			$.modal()
				.addChild($.element("div")
					.dataRender("MainModule.renderModalView"))
				.bindScope(modalData);
		}},
		{ label: "New Adapter", hide: (app.observer == true), click: function() {
			app.selectHost(AdaptersModule.link, "-")
		}},
		{ label: "New Stream", hide: (app.observer == true), click: function() {
			app.selectHost(StreamsModule.link, "-")
		}},
	],
};

MainModule.addAdapter = function(a) {
	a.type = "adapter";
	MainModule.adapters[a.host + "/" + a.config.id] = a;
	app.event("addAdapter", { adapter: a });
};

MainModule.removeAdapter = function(id) {
	app.event("removeAdapter", { adapter: MainModule.adapters[id] });
	delete(MainModule.adapters[id]);
};

MainModule.addStream = function(s) {
	s.type = "stream";

	// TODO: rename to keep_active
	if(s.config.http_keep_active != -1) {
		var r = true;
		$.forEach(s.config.output, function(u) {
			u = parseUrl(u);
			if(u && (u.format != "http" || u.keep_active == true)) r = false;
		});
		if(r) s.keepActive = true;
	}
	s.status = { input: [], total: null };
	MainModule.streams[s.host + "/" + s.config.id] = s;
	app.event("addStream", { stream: s });
};

MainModule.removeStream = function(id) {
	app.event("removeStream", { stream: MainModule.streams[id] });
	delete(MainModule.streams[id]);
};

MainModule.setDvbList = function(hostId) {
	var appHost = app.hosts[hostId],
		gAvail = { group: "Available", items: [] },
		gTaken = { group: "Taken", items: [] },
		gError = { group: "Error", items: [] },
		dvbList = [{ value: "", label: "" }, gAvail, gTaken, gError],
		dl = appHost.sysinfo.dvb_list;

	if(dl) dl.sort(function(a, b) {
		if(a.error === b.error) {
			if(a.busy === b.busy) {
				if(a.adapter === b.adapter) {
					if(a.device === b.device) {
						return 0;
					}
					return (a.device < b.device) ? -1 : 1;
				}
				return (a.adapter < b.adapter) ? -1 : 1;
			}
			return (a.busy != true) ? -1 : 1;
		}
		return (a.error == undefined) ? -1 : 1;
	});

	$.forEach(dl, function(a, i) {
		a.value = String(i);
		var d = a.adapter + "." + a.device + " : ";
		if(a.error) {
			a.label = d + a.error;
			gError.items.push(a);
		} else {
			a.label = d + a.frontend;
			if(!!a.mac)  a.label += " [" + a.mac + "]"
			var g = (a.busy) ? gTaken : gAvail;
			g.items.push(a);
		}
	});

	if(!MainModule.dvbList) MainModule.dvbList = {};
	MainModule.dvbList[hostId] = dvbList;
};

MainModule.dvbLevel = function(t, r) {
	var x = $.element("div").addClass("dvb-status row monospace");
	var x1 = $.element("div").addClass("text").setText(t);

	if(r) {
		var x2 = $.element("div").addClass("text col-expand");

		x.addChild(x1, x2);
		if(t == "S") x.setLevel = function(v) { x2.setText("-" + v + " dBm") };
		else x.setLevel = function(v) { x2.setText(v + " dB") };
	} else {
		var x2 = $.element("div").addClass("progress signal-level col-expand");
		var b = $.element("div").addClass("progress-level");
		var o = $.element("div").addClass("progress-overlay");
		x2.addChild(b, o);
		var x3 = $.element("div").addClass("text");

		x.addChild(x1, x2, x3);
		x.setLevel = function(v) {
			v = v + "%"
			b.style.width = v;
			x3.setText((" " + v).slice(-3));
		};
	}

	x.setLevel(0);

	return x
};

MainModule.run = function() {
	app.on("set-adapter", function(event) {
		var hostId = event.host,
			data = event.data,
			appHost = app.hosts[hostId];

		if(data.gid) appHost.config.gid = data.gid;

		var al = appHost.config.dvb_tune;
		var idx = (al == undefined) ? -1 : al.indexOfID(data.adapter.id);
		if(data.adapter.remove && !data.adapter.up) {
			$.msg({ title: "Adapter \"{0}\" removed".format(al[idx].name) })
		}
		if(idx != -1) {
			MainModule.removeAdapter(hostId + "/" + data.adapter.id);
			al.splice(idx, 1);
			if(!al.length) delete(appHost.config.dvb_tune);
		}
		if(!data.adapter.remove) {
			if(!al) appHost.config.dvb_tune = al = [];
			al.push(data.adapter);
			MainModule.addAdapter({ host: hostId, config: data.adapter });
			$.msg({ title: "Adapter \"{0}\" saved".format(data.adapter.name) });
		}
	});

	// TODO: rename to event-adapter
	app.on("adapter_event", function(event) {
		var hostId = event.host,
			data = event.data,
			a = MainModule.adapters[hostId + "/" + data.dvb_id];

		if(!a) return;

		a.status = {
			timeout: Date.now() + 3000,
			bitrate: data.bitrate,
			ber_value: (data.ber > 99) ? "99+" : data.ber,
			unc_value: (data.unc > 99) ? "99+" : data.unc,
			signal: (data.status & 0x01) !== 0,
			carrier: (data.status & 0x02) !== 0,
			viterbi: (data.status & 0x04) !== 0,
			sync: (data.status & 0x08) !== 0,
			lock: (data.status & 0x10) !== 0,
		};

		if(a.config.raw_signal) {
			a.status.svalue = data.signal;
			a.status.qvalue = Number(data.snr / 10).format(1);
		} else {
			a.status.svalue = Math.floor((data.signal * 99) / 65535);
			a.status.qvalue = Math.floor((data.snr * 99) / 65535);
		}
	});

	app.on("set-stream", function(event) {
		var hostId = event.host,
			appHost = app.hosts[hostId],
			data = event.data;

		if(data.gid) appHost.config.gid = data.gid;

		var sl = appHost.config.make_stream;
		var idx = (sl == undefined) ? -1 : sl.indexOfID(data.stream.id);
		if(data.stream.remove && !data.stream.up) {
			$.msg({ title: "Stream \"{0}\" removed".format(sl[idx].name) })
		}
		if(idx != -1) {
			MainModule.removeStream(hostId + "/" + data.stream.id);
			sl.splice(idx, 1);
			if(!sl.length) delete(appHost.config.make_stream);
		}
		if(!data.stream.remove) {
			if(!sl) appHost.config.make_stream = sl = [];
			sl.push(data.stream);
			MainModule.addStream({ host: hostId, config: data.stream });
			$.msg({ title: "Stream \"{0}\" saved".format(data.stream.name) });
		}
	});

	// TODO: rename to event-stream
	app.on("stream_event", function(event) {
		var hostId = event.host,
			data = event.data,
			s = MainModule.streams[hostId + "/" + data.channel_id];
		if(!s) return;
		data.timeout = Date.now() + 3000;
		if(data.input_id) s.status.input[data.input_id - 1] = data;
		else s.status.total = data;
	});
}

MainModule.addHost = function(hostId) {
	var appHost = app.hosts[hostId];
	if(!appHost.config)
		return;

	MainModule.setDvbList(hostId);
	$.forEach(appHost.config.dvb_tune, function(s) {
		MainModule.addAdapter({ host: hostId, config: s });
	});
	$.forEach(appHost.config.make_stream, function(s) {
		MainModule.addStream({ host: hostId, config: s });
	})
};

MainModule.removeHost = function(hostId) {
	$.forEach(MainModule.adapters, function(s, i) {
		if(s.host == hostId) MainModule.removeAdapter(i);
	});

	$.forEach(MainModule.streams, function(s, i) {
		if(s.host == hostId) MainModule.removeStream(i);
	});
};

/*_____          _____  _____   _____
 / ____|   /\   |  __ \|  __ \ / ____|
| |       /  \  | |__) | |  | | (___
| |      / /\ \ |  _  /| |  | |\___ \
| |____ / ____ \| | \ \| |__| |____) |
 \_____/_/    \_\_|  \_\_____/|____*/

function Cards(parent) {
	var self = this,
		stackList = [];

	self.getStackName = function(item) {
		return "";
	};

	var getStack = function(item) {
		var name = self.getStackName(item);

		for(var i = 0; i < stackList.length; ++i) {
			if(stackList[i].name == name) return stackList[i];
		}

		var snode = $.element().addClass("card-stack");
		var stack = { name: name, order: [], node: snode };

		if(name) snode.addChild($.element().addClass("group-header").setText(name));

		var cmpStack = function(a, b) {
			return (b.name) ? a.name.localeCompare(b.name) : 1;
		};

		var i = (!stackList.length) ? 0 : stackList.sortedIndex(stack, cmpStack);
		if(i == stackList.length) {
			parent.addChild(snode);
			stackList.push(stack);
		} else {
			var o = stackList[i];
			parent.insertChild(snode, o.node)
			stackList.splice(i, 0, stack);
		}
		return stack;
	};

	self.cmpCards = function(a, b) {
		return 0;
	};

	self.reorder = function(item) {
		var stack = getStack(item);
		var i = 0;
		if(stack.order.length != 0) {
			i = stack.order.indexOf(item);
			if(i != -1) stack.order.splice(i, 1);
			i = stack.order.sortedIndex(item, self.cmpCards);
		}
		if(i == stack.order.length) {
			stack.node.addChild(item.node)
			stack.order.push(item);
		} else {
			var o = stack.order[i];
			stack.node.insertChild(item.node, o.node);
			stack.order.splice(i, 0, item);
		}
	};

	self.renderCard = function(item) {
		var node = $.element("a")
			.addClass("card")
			.addAttr("href");

		item.node = node;
	};

	self.addCard = function(item) {
		if(!item.node) self.renderCard(item);
		self.reorder(item);
	};

	self.removeCard = function(item) {
		if(item.node) {
			item.node.remove();
			var stack = getStack(item);
			stack.order.splice(stack.order.indexOf(item), 1);
			if(!stack.order.length) {
				stack.node.remove()
				delete(stack.node);
				stackList.splice(stackList.indexOf(stack), 1);
			}
			delete(item.node);
		}
	};

	self.filterCard = function(item, value) {
		return 0
	};

	self.filter = function(value) {
		$.forEach(stackList, function(stack) {
			stack.node.removeClass("hide");
			var sh = true;
			$.forEach(stack.order, function(item) {
				item.node.removeClass("hide");
				if(self.filterCard(item, value)) item.node.addClass("hide");
				else sh = false;
			});
			if(sh) stack.node.addClass("hide");
		});
	};

	self.reset = function() {
		parent.empty();
		stackList = [];
	};
}

MainModule.renderCards = function(object) {
	var self = this,
		cards = new Cards(object),
		view = $.cookie.getObject("streams-view") || {};

	if(view.arrange == undefined) {
		cards.getStackName = function(item) {
			return ""
		}
	} else if(view.arrange == "$type") {
		cards.getStackName = function(item) {
			return item.type + "s"
		}
	} else if(view.arrange == "$host") {
		cards.getStackName = function(item) {
			return app.hosts[item.host].name
		}
	} else if(view.arrange == "$dvb") {
		cards.getStackName = function(item) {
			if(item.type == "adapter") {
				return item.config.name
			} else {
				var n = $.forEach(item.config.input, function(i) {
					i = parseUrl(i);
					if(i && i.format == "dvb") {
						var a = MainModule.adapters[item.host + "/" + i.addr];
						if(a) return a.config.name;
					}
				});
				return n || "";
			}
		}
	} else {
		cards.getStackName = function(item) {
			var x = item.config.groups || {};
			return x[view.arrange] || ""
		}
	}

	cards.filterCard = function(item, value) {
		return (!!value && item.config.name.toLowerCase().indexOf(value) == -1)
	};

	if(view.order == "1") {
		cards.cmpCards = function(a, b) {
			if(a.type === b.type) {
				if(a.config.enable === b.config.enable)
					return a.config.name.localeCompare(b.config.name);
				return (a.config.enable === true) ? -1 : 1;
			}
			return (a.type === "adapter") ? -1 : 1;
		};
	} else {
		cards.cmpCards = function(a, b) {
			if(a.type === b.type) {
				if(a.config.enable === b.config.enable) {
					if(a.onair === b.onair)
						return a.config.name.localeCompare(b.config.name);
					return (a.onair > b.onair) ? 1 : -1;
				}
				return (a.config.enable === true) ? -1 : 1;
			}
			return (a.type === "adapter") ? -1 : 1;
		};
	}

	var renderCard = {};

	renderCard.stream = function(item) {
		item.onair = 1000;

		var node = $.element("a")
			.addClass("card", "stream-" + (item.config.type || "unknown"))
			.addAttr("href", "#/stream/" + item.host + "/" + item.config.id);
		if(item.up) node.addClass("updated");

		node.input = [];
		node.total = null;

		node.addChild($.element("div")
			.addClass("card-name")
			.setText(item.config.name)
			.addAttr("title", item.config.name));

		node.addChild($.element.select([
				{ value: "" },
				{ value: 3, label: "Toggle Input", hide: (!item.config.enable || (item.config.backup_type != "passive" && item.config.backup_type != "disable")) },
				{ value: 1, label: (!item.config.enable) ? "Enable" : "Disable" },
				{ value: 2, label: "Remove" }
			])
			.removeClass("input")
			.addClass("card-action button icon icon-more small")
			.on("change", function() {
				var appHost = app.hosts[item.host], req = { id: item.config.id };
				switch(this.value) {
					case "1": {
						req.cmd = "set-stream";
						req.stream = $.clone(item.config);
						req.stream.enable = !item.config.enable;
						break;
					}
					case "2": {
						if(!confirm("Remove stream \"" + item.config.name + "\"?")) {
							this.value = "";
							return;
						}
						req.cmd = "set-stream";
						req.stream = { remove: true };
						break;
					}
					case "3": {
						req.cmd = "set-stream-input";
						break;
					}
				}

				appHost.request(req, $.nop, function() {
					$.err({ title: "Failed to save stream" });
				});
				this.value = "";
			})
			.on("click", function(event) {
				event.preventDefault();
			}));

		node.image = $.element("div").addClass("card-image");
		node.addChild(node.image);

		$.forEach(item.config.input, function(v) {
			var ic = $.element("span")
				.addClass("text")
				.setText("Inactive");
			var ir = $.element("div")
				.addClass("card-status")
				.addAttr("title", v)
				.addChild(ic);
			node.addChild(ir);
			node.input.push(ic);
		});

		if(item.config.type == "mpts") {
			var tc = $.element("span")
				.addClass("text")
				.setText("Inactive");
			var tr = $.element("div")
				.addClass("card-status card-footer")
				.addChild(tc);
			node.addChild(tr);
			node.total = tc;

			var sm = {};
			$.forEach(item.config.sdt, function(v) {
				sm[v.pnr] = v.name;
			});

			$.forEach(item.config.input, function(v, i) {
				var ac = parseUrl(v);
				var pnr = ac.set_pnr || ac.pnr || 0;
				if(pnr != 0) {
					var n = sm[pnr];
					if(n) node.input[i].addAttr("data-name", "[" + n + "]");
				}
			});
		}

		item.node = node;
	};

	renderCard.adapter = function(item) {
		item.onair = 1000;

		var node = $.element("a")
			.addClass("card")
			.addAttr("href", "#/adapter/" + item.host + "/" + item.config.id);
		if(item.up) node.addClass("updated");

		node.addChild($.element("div")
			.addClass("card-name")
			.setText(item.config.name)
			.addAttr("title", item.config.name));

		node.addChild($.element("select")
			.addClass("card-action button icon icon-more small")
			.addChild(
				$.element("option"),
				$.element("option")
					.setValue("-3")
					.setText("Restart"),
				$.element("option")
					.setValue("-1")
					.setText((item.config.enable == false) ? "Enable" : "Disable"),
				$.element("option")
					.setValue("-2")
					.setText("Remove"))
			.on("change", function() {
				var appHost = app.hosts[item.host];
				var restartAdapter = function() {
					appHost.request({
						cmd: "restart-adapter",
						id: item.config.id
					}, function() {
						//
					}, function() {
						$.err({ title: "Failed to restart adapter" });
					});
				};
				var setAdapter = function(config) {
					appHost.request({
						cmd: "set-adapter",
						id: item.config.id,
						adapter: config
					}, function() {
						//
					}, function() {
						$.err({ title: "Failed to save adapter" });
					});
				};
				switch(this.value) {
					case "-3": {
						restartAdapter();
						break;
					}
					case "-2": {
						if(confirm("Remove adapter \"{0}\" and all related streams?".format(item.config.name))) setAdapter({ remove: true });
						break;
					}
					case "-1": {
						var config = $.clone(item.config);
						config.enable = !config.enable;
						setAdapter(config);
						break;
					}
				}
				this.value = "";
			}).on("click", function(event) {
			event.preventDefault();
		}));

		var sS = MainModule.dvbLevel("S", item.config.raw_signal).addClass("card-status");
		var sQ = MainModule.dvbLevel("Q", item.config.raw_signal).addClass("card-status");
		node.addChild(sS, sQ);

		var eT = $.element("span").addClass("text");
		node.addChild($.element("div")
			.addClass("card-status monospace")
			.addChild(eT));

		node.setStatus = function(s) {
			sS.setLevel(s.svalue);
			sQ.setLevel(s.qvalue);
			eT.setText("ber:" + s.ber_value + " unc:" + s.unc_value);
		};
		node.resetStatus = function() {
			node.setStatus({ lock: false, svalue: 0, qvalue: 0, ber_value: 0, unc_value: 0 })
		};
		node.resetStatus();

		item.node = node;
	};

	cards.renderCard = function(item) {
		renderCard[item.type](item);
	};

	var refresh = function() {
		var ctime = Date.now();

		$.forEach(MainModule.adapters, function(a) {
			var lock = 0;
			if(a.status) {
				if(ctime > a.status.timeout) {
					a.node.resetStatus();
					delete(a.status);
				} else {
					a.node.setStatus(a.status);
					if(a.status.lock) lock = 2;
				}
			}

			if(a.lock != lock) {
				if(a.cardClass) a.node.removeClass(a.cardClass);
				a.cardClass = "card-" + a.config.enable.toString() + "-" + lock;
				a.node.addClass(a.cardClass);
				a.lock = lock;
				cards.reorder(a);
			}
		});

		var setStatus = function(n, s) {
			if(!n) return;
			var t = "Inactive", c = "text";
			if(s) {
				t = "" + s.bitrate + "Kbit/s";
				if(s.onair == true) {
					c += " onair";
				} else if(s.scrambled) {
					t += " Scrambled";
					c += " scrambled";
				} else {
					if(s.pes_error > 0) t += " PES:" + ((s.pes_error > 99) ? "99+" : s.pes_error);
					c += " error";
				}
				if(s.cc_error > 0) {
					t += " CC:" + ((s.cc_error > 99) ? "99+" : s.cc_error);
					c += " cc";
				}
			}
			n.setText(t);
			if(n.className != c) n.className = c;
		}

		$.forEach(MainModule.streams, function(s) {
			if(s.status.total) {
				if(ctime > s.status.total.timeout) s.status.total = null;
				setStatus(s.node.total, s.status.total);
			}

			var onair = 0;
			if(s.config.enable) {
				if(s.keepActive) onair = 3;
				for(var i = 0; i < s.status.input.length; ++i) {
					var ii = s.status.input[i];
					if(ii) {
						if(ctime > ii.timeout) {
							s.status.input[i] = null;
						} else if(s.config.type == "mpts") {
							onair = 2;
						} else if(ii.onair) {
							if(s.config.backup_type == "passive") {
								onair = 2;
							} else {
								if(i == 0) onair = 2;
								else if(onair == 0) onair = 1;
							}
						} else if(ii.onair == false) {
							onair = 0;
						}
						setStatus(s.node.input[i], s.status.input[i]);
					}
				}
			}

			if(s.onair != onair) {
				if(s.cardClass) s.node.removeClass(s.cardClass);
				s.cardClass = "card-" + s.config.enable.toString() + "-" + onair;
				s.node.addClass(s.cardClass);
				s.onair = onair;
				cards.reorder(s);
			}
		});
	};

	$.forEach(MainModule.adapters, cards.addCard);
	$.forEach(MainModule.streams, cards.addCard);
	refresh();

	app.search = function(value) {
		cards.filter(value.toLowerCase())
	};

	var setImage = function(event) {
		var hostId = event.host,
			data = event.data,
			s = MainModule.streams[hostId + "/" + data.channel_id];
		if(!s) return;

		var i = new Image();
		i.onload = function() { s.node.image.setStyle("background-image", "url('" + i.src + "')").setStyle("display", "block") };
		i.src = data.src;
	};
	app.on("stream_image", setImage);

	var addAdapter = function(event) {
		event.adapter.onair = null;
		cards.addCard(event.adapter);
	};
	app.on("addAdapter", addAdapter);

	var removeAdapter = function(event) {
		cards.removeCard(event.adapter);
	};
	app.on("removeAdapter", removeAdapter);

	var addStream = function(event) {
		event.stream.onair = null;
		cards.addCard(event.stream);
	};
	app.on("addStream", addStream);

	var removeStream = function(event) {
		cards.removeCard(event.stream);
	};
	app.on("removeStream", removeStream);

	var refreshInterval = setInterval(refresh, 2000);
	self.on("destroy", function() {
		app.off("stream_image", setImage);

		app.off("addAdapter", addAdapter);
		app.off("removeAdapter", removeAdapter);

		app.off("addStream", addStream);
		app.off("removeStream", removeStream);

		$.forEach(MainModule.adapters, function(item) {
			delete(item.cardClass);
			delete(item.lock);
			cards.removeCard(item);
		});

		$.forEach(MainModule.streams, function(item) {
			delete(item.cardClass);
			delete(item.onair);
			cards.removeCard(item);
		});

		clearInterval(refreshInterval);
	});

	if(!$.isMobile()) self.on("ready", function() {
		document.querySelector(".search").focus();
	});
};

/*___           _____ ______
|  _ \   /\    / ____|  ____|
| |_) | /  \  | (___ | |__
|  _ < / /\ \  \___ \|  __|
| |_) / ____ \ ____) | |____
|____/_/    \_\_____/|_____*/

MainModule.renderModalView = function(object) {
	var modal = this,
		form = new Form(modal.scope, object),
		masterHost = app.hosts[location.host];

	var arrangeList = [
		{ value: "", label: "Default: None" },
		{ value: "-", label: "---", disabled: true },
		{ value: "$type", label: "Type" },
		{ value: "$host", label: "Servers" },
		{ value: "$dvb", label: "Adapter" },
		{ value: "-", label: "---", disabled: true },
	];

	$.forEach(masterHost.config.categories, function(c) { arrangeList.push({ value: c.name }) });
	form.choice("Arrange By", "arrange", arrangeList);

	form.choice("Order By", "order", [
		{ value: "", label: "Default: Enabled > Status > Name" },
		{ value: "1", label: "Enabled > Name" },
	]);

	form.hr();

	var btnOk = $.element.button("Ok")
		.addClass("submit")
		.on("click", function() {
			modal.remove();

			var x = modal.scope.serialize();
			if($.isObjectEmpty(x)) x = undefined;
			$.cookie.setObject("streams-view", x);
			$.body.scope.reset();
		});

	form.submit().addChild(btnOk);
};

MainModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	window.renderContent = MainModule.renderCards;

	$.body
		.bindScope({})
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(MainModule);
app.menu.push(MainModule);
})();

/* stream.js */

(function() {
"use strict";

window.StreamsModule = {
	link: "#/stream",
};

StreamsModule.makeUrl = function(x) {
	var a = x.format + "://";
	if(x.login) {
		a += x.login;
		if(x.password) a += ":" + x.password;
		a += "@";
	}
	if(x.host) a += x.host;
	if(x.port) a += ":" + x.port;
	if(x.path) a += x.path;
	return a
};

var renderSoftcam = function(form, appHost) {
	var softcamList = [
		{ value: "", label: "None" },
		{ value: "", label: "---", disabled: true }
	];
	var softcamSortedList = [];
	$.forEach(appHost.config.softcam, function(i) {
		softcamSortedList.push({ value: i.id, label: i.name });
	});
	softcamSortedList.sort(function(a,b) { return a.label.localeCompare(b.label) });
	softcamList = softcamList.concat(softcamSortedList);
	form.choice("SoftCAM", "cam", softcamList);

	form.input("BISS Key", "biss").addValidator(validateBiss);
};

StreamsModule.renderModal_input = function(object) {
	var modal = this,
		hostId = modal.scope.get("$hostId"),
		appHost = app.hosts[hostId],
		form = new Form(modal.scope, object),
		format = modal.scope.get("format");

	form.checkbox("Enable", "$enable")
		.addAttr("data-false", "false");

	form.choice("Input Type", "format", [
		{ value: "", label: "" },
		{ value: "dvb", label: "DVB" },
		{ value: "http", label: "HTTP/HLS" },
		{ value: "udp", label: "UDP" },
		{ value: "rtp", label: "RTP" },
		{ value: "rtsp", label: "RTSP" },
		{ value: "file", label: "MPEG-TS Files" },
	])
		.setRequired()
		.on("change", function() {
			modal.scope.reset({
				$hostId: hostId,
				$enable: modal.scope.get("$enable"),
				format: this.value
			});
		});

	if(!!format) form.hr();

	if(format == "dvb") {

		var aList = [{ value: "", label: "" }];
		$.forEach(MainModule.adapters, function(a) {
			if(a.host == hostId) aList.push({ value: a.config.id, label: a.config.name })
		});
		form.choice("Adapter", "addr", aList)
			.setRequired();
		form.checkbox("DVB-CI CAM", "cam");
		form.number("T2-MI", "t2mi");
		form.number("PNR", "pnr", "Program Number").addValidator(validatePnr);
		form.number("DD-CI CAM", "ddci");
		renderSoftcam(form, appHost);

	} else if(format == "http") {

		var a = modal.scope.serialize();
		modal.scope.set("$addr", makeUrl(a).split("#")[0]);

		form.input("HTTP Address", "$addr", "http://...")
			.setRequired()
			.addValidator(validateUrl)
			.on("input", function() {
				$.forEach(parseUrl(this.value), function(v, k) {
					if(a[k] != v) {
						a[k] = v;
						modal.scope.set(k, v);
					}
				});
			});

		form.input("User-Agent", "ua", "Custom HTTP User-Agent. Default: Astra");

		if(modal.scope.get("$advanced")) {
			form.hr();
			form.number("Buffer Time", "buffer_time", "Receiving buffer in seconds. Default: 2");
			form.number("Timeout", "timeout", "Connection timeout in seconds. Default: 10");
			form.checkbox("Use SCTP instead of TCP", "sctp");
		}

		form.hr();
		form.number("PNR", "pnr", "Program Number").addValidator(validatePnr);
		form.number("DD-CI CAM", "ddci");
		renderSoftcam(form, appHost);

		form.checkbox("Advanced Options", "$advanced")
			.on("change", function() {
				modal.scope.reset();
			});

	} else if(format == "udp" || format == "rtp") {

		var ifList = [{ value: "", label: "Default: Use system routes"}];
		$.forEach(appHost.sysinfo.if_list, function(v) { ifList.push(v) });

		form.choice("Local Interface", "localaddr", ifList);
		form.input("Address", "addr", "Source Address").setRequired();
		form.number("Port", "port", "Source Port. Default: 1234").addValidator(validatePort);

		if(modal.scope.get("$advanced")) {
			form.hr();
			form.number("Renew", "renew", "Refresh multicast group membership");
			form.number("Socket Size", "socket_size", "Redefine system socket size");
		}

		form.hr();
		form.number("PNR", "pnr", "Program Number").addValidator(validatePnr);
		form.number("DD-CI CAM", "ddci");
		renderSoftcam(form, appHost);

		form.checkbox("Advanced Options", "$advanced")
			.on("change", function() {
				modal.scope.reset();
			});

	} else if(format == "rtsp") {

		var a = modal.scope.serialize();
		modal.scope.set("$addr", makeUrl(a).split("#")[0]);

		form.input("RTSP Address", "$addr", "rtsp://...")
			.setRequired()
			.addValidator(validateUrl)
			.on("input", function() {
				$.forEach(parseUrl(this.value), function(v, k) {
					if(a[k] != v) {
						a[k] = v;
						modal.scope.set(k, v);
					}
				});
			});
		form.checkbox("Interleaved mode. Send data over TCP", "tcp");

	} else if(format == "file") {

		form.input("File", "filename", "Full path to the MPEG-TS file").setRequired();
		form.checkbox("Repeat File", "loop");

		form.number("PNR", "pnr", "Program Number").addValidator(validatePnr);

	}

	form.hr();

	var btnOk = $.element.button("Ok")
		.addClass("submit")
		.on("click", function() { modal.submit() });

	var btnCancel = $.element.button("Cancel")
		.on("click", function() { modal.remove() });

	form.checkbox("Remove", "$remove")
		.setDanger()
		.on("change", function() {
			if(this.checked)
				btnOk.removeClass("submit").addClass("danger");
			else
				btnOk.removeClass("danger").addClass("submit");
		});

	form.submit().addChild(btnOk, btnCancel);
};

StreamsModule.renderModal_output = function(object) {
	var modal = this,
		hostId = modal.scope.get("$hostId"),
		appHost = app.hosts[hostId],
		form = new Form(modal.scope, object),
		format = modal.scope.get("format");

	form.checkbox("Enable", "$enable")
		.addAttr("data-false", "false");

	form.choice("Output Type", "format", [
		{ value: "", label: "" },
		{ value: "http", label: "HTTP/HLS" },
		{ value: "udp", label: "UDP" },
		{ value: "rtp", label: "RTP" },
		{ value: "resi", label: "RESI Modulator" },
		{ value: "np", label: "NetworkPush" },
		{ value: "file", label: "MPEG-TS Files" },
	])
		.setRequired()
		.on("change", function() {
			modal.scope.reset({
				$hostId: hostId,
				$enable: modal.scope.get("$enable"),
				format: this.value
			});
		});

	if(!!format) form.hr();

	if(format == "http") {

		if(!modal.scope.get("host")) modal.scope.set("host", "0");

		var ifList = [{ value: "0", label: "Default: Any Interface"}];
		$.forEach(appHost.sysinfo.if_list, function(v) {
			if(v.ip) ifList.push({ value: v.ip, label: v.label });
		});

		form.choice("Local Interface", "host", ifList);
		form.number("Port", "port", "HTTP Server port").setRequired().addValidator(validatePort);
		form.input("Path", "path", "Unique path for stream")
			.setRequired()
			.addValidator(function(value) {
				return (value[0] == "/");
			});

	} else if(format == "udp" || format == "rtp") {

		var ifList = [{ value: "", label: "Default: Use system routes"}];
		$.forEach(appHost.sysinfo.if_list, function(v) { ifList.push(v) });

		form.choice("Local Interface", "localaddr", ifList);
		form.input("Address", "addr", "Destination Address").setRequired();
		form.number("Port", "port", "Destination Port. Default: 1234").addValidator(validatePort);

	} else if(format == "resi") {

		form.number("Adapter", "adapter").setRequired();
		form.number("Device", "device")
			.setRequired();
		form.number("Frequency", "frequency", "114..858 MHz")
			.setRequired()
			.addValidator(function(value) {
				value = Number(value);
				return (!isNaN(value) && value > 113 && value < 858 && ((value - 114) % 8) == 0)
			});
		form.choice("Modulation", "modulation", [
			{ value: "", label: "Default: 64-QAM" },
			{ value: "QAM16", label: "16-QAM" },
			{ value: "QAM32", label: "32-QAM" },
			{ value: "QAM128", label: "128-QAM" },
			{ value: "QAM256", label: "256-QAM" },
		]);
		form.number("Symbol Rate", "symbolrate", "1000...7100")
			.addValidator(function(value) {
				if(value == undefined || value == "") return true;
				value = Number(value);
				return (!isNaN(value) && value >= 1000 && value <= 7100)
			});
		form.number("Attenuator", "attenuator", "0...31")
			.addValidator(function(value) {
				if(value == undefined || value == "") return true;
				value = Number(value);
				return (!isNaN(value) && value >= 0 && value <= 31)
			});

	} else if(format == "np") {

		var a = modal.scope.serialize();
		modal.scope.set("$addr", makeUrl(a).split("#")[0]);

		form.input("Address", "$addr", "np://...")
			.setRequired()
			.addValidator(validateUrl)
			.on("input", function() {
				$.forEach(parseUrl(this.value), function(v, k) {
					if(a[k] != v) {
						a[k] = v;
						modal.scope.set(k, v);
					}
				});
			});

	} else if(format == "file") {

		form.input("File", "filename", "Full path to the MPEG-TS file").setRequired();

	}

	form.hr();

	var btnOk = $.element.button("Ok")
		.addClass("submit")
		.on("click", function() { if(modal.scope.validate()) modal.submit() });

	var btnCancel = $.element.button("Cancel")
		.on("click", function() { modal.remove() });

	form.checkbox("Remove", "$remove")
		.setDanger()
		.on("change", function() {
			if(this.checked)
				btnOk.removeClass("submit").addClass("danger");
			else
				btnOk.removeClass("danger").addClass("submit");
		});

	form.submit().addChild(btnOk, btnCancel);
};

var ioList = function(self, form, ioType) {
	form.hr();
	var lE = self.scope.get(ioType),
		lD = self.scope.get("_" + ioType);
	if(!lE) { lE = [""]; self.scope.set(ioType, lE); }
	if(!lD) { lD = []; self.scope.set("_" + ioType, lD); }

	var renderIoList = function(ioEnable) {
		var l = (ioEnable) ? lE : lD;

		$.forEach(l, function(v, i) {
			var x = (ioEnable) ?
				form.input("#" + (i + 1), ioType + "." + i) :
				form.input("", "_" + ioType + "." + i);

			x.addValidator(validateUrl);

			var s = $.element("select")
				.addClass("button icon icon-move")
				.on("change", function() {
					if(this.value == "-2") {
						l.splice(i, 1);
						if(!lE.length) lE.push("");
					} else if(this.value == "-1") {
						lD.push(lE.splice(i, 1)[0]);
						if(!lE.length) lE.push("");
					} else {
						var _i = i;
						if(!ioEnable) { _i = lE.length; lE.push(lD.splice(i, 1)[0]); }
						lE.move(_i, Number(this.value));
					}
					self.scope.reset();
				});
			for(var j = 0; j < lE.length; ++j) {
				s.addChild($.element("option")
					.setValue(j.toString())
					.setText(j + 1));
			}
			if(!ioEnable) {
				s.addChild($.element("option")
					.setValue(lE.length.toString())
					.setText(lE.length + 1));
			}
			s.addChild(
				$.element("option")
					.setDisabled(true)
					.setText("---"),
				$.element("option")
					.setValue("-1")
					.setText("Disable"),
				$.element("option")
					.setValue("-2")
					.setText("Remove"));
			s.value = (ioEnable) ? i.toString() : "-1";

			x.addButton(s);
			x.addButton($.element.button()
				.addClass("icon icon-settings")
				.on("click", function() {
					var modalData = parseUrl(x.value) || {};
					modalData.$hostId = self.scope.get("$hostId");
					modalData.$enable = ioEnable;
					$.modal()
						.addChild($.element("div")
							.dataRender("StreamsModule.renderModal_" + ioType))
						.bindScope(modalData)
						.on("submit", function() {
							l.splice(i, 1);
							if(!this.scope.get("$remove")) {
								var lM = (this.scope.get("$enable")) ? lE : lD;
								lM.push(makeUrl(this.scope.serialize()));
								if(lM == l) l.move(l.length - 1, i);
							}
							if(!lE.length) lE.push("");
							var x = window.scrollTop;
							self.scope.reset();
							window.scrollTop = x;
						});
				}));
		});
	}

	form.header(ioType + " list", "new " + ioType, function() {
		lE.push("");
		self.scope.reset();
		document.querySelector("[name=\"" + ioType + "." + (lE.length - 1) + "\"]").focus();
	});
	renderIoList(true);

	if(!lD.length) return;
	form.header("Disabled " + ioType + "'s");
	renderIoList(false);
};

var tabGeneral = function(self, form, streamId, hostId) {
	form.checkbox("Enable", "enable")
		.addAttr("data-false", "false");
	form.input("Name", "name").setRequired();

	var x = form.input("ID", "id")
		.addValidator(validateId);
	if(streamId != "-") x.setRequired();

	form.choice("Type", "type", [
		{ value: "spts", label: "Single Program Stream" },
		{ value: "mpts", label: "Multi Program Stream" },
	])
		.setRequired()
		.on("change", function() {
			self.scope.reset({
				$tab: self.scope.get("$tab"),
				$streamId: streamId,
				$hostId: hostId,
				enable: self.scope.get("enable"),
				id: self.scope.get("id"),
				type: this.value,
				name: self.scope.get("name"),
				groups: self.scope.get("groups"),
				input: self.scope.get("input"),
				output: self.scope.get("output"),
			});
		});
};

var tabGroups = function(self, form) {
	var masterHost = app.hosts[location.host];

	if(!masterHost.config.categories) {
		form.group()
			.addClass("text-center")
			.setHtml("Create new group in <a href=\"#/settings-groups\">Settings &gt; Groups</a>");
	} else $.forEach(masterHost.config.categories, function(c) {
		var gl = [{ value: "", test: "" }];
		$.forEach(c.groups, function(g) {
			gl.push({ value: g.name, label: g.name });
		});
		form.choice(c.name, "groups." + c.name.replace(/\./g, "\\."), gl);
	});
};

var tabSpts = function(self, form, streamId, hostId) {
	tabGeneral(self, form, streamId, hostId);

	form.checkbox("Start stream on demand", "http_keep_active")
		.addAttr("data-true", "undefined")
		.addAttr("data-false", "-1")
		.on("change", function() {
			self.scope.reset();
		});

	if(self.scope.get("http_keep_active") != -1)
		form.number("Keep Active", "http_keep_active", "Delay before stop stream if no active connections. Default: 0 (turn off immediately)");

	ioList(self, form, "input");
	ioList(self, form, "output");
};

var tabSptsSdt = function(self, form, streamId, hostId) {
	form.choice("Service Type", "service_type", [
		{ value: "", label: "Default: original service type" },
		{ value: "1", label: "Video" },
		{ value: "2", label: "Radio" },
		{ value: "3", label: "Teletext" },
	]);
	form.input("Service Provider", "service_provider");
	form.input("Service Name", "service_name");
	form.choice("Codepage", "textcode", codepages);
	form.hr();

	form.input("HbbTV URL", "hbbtv_url");
	form.hr();

	var casChannelList = self.scope.get("cas_list");
	form.header("Conditional Access", "New CAS", function() {
		if(!casChannelList) {
			casChannelList = [];
			self.scope.set("cas_list", casChannelList);
		}
		casChannelList.push({});
		self.scope.reset();
	});

	var casGlobalList = [
		{ value: "", label: "None" },
		{ value: "", label: "---", disabled: true }
	];
	var casSortedList = [];
	$.forEach(app.hosts[hostId].config.cas, function(i) {
		casSortedList.push({ value: i.id, label: i.name + " [" + i.super_cas_id + "]" });
	});
	casSortedList.sort(function(a,b) { return a.label.localeCompare(b.label) });
	casGlobalList = casGlobalList.concat(casSortedList);

	$.forEach(casChannelList, function(cas, x) {
		if(x != 0) form.hr();

		form.choice("CAS #" + (x + 1), "cas_list." + x + ".cas_id", casGlobalList)
			.setRequired()
			.on("change", function() {
				self.scope.reset();
			});

		form.number("ECM PID", "cas_list." + x + ".ecm_pid")
			.setRequired()
			.addValidator(validatePid);
		form.input("ECM Private Data (hex)", "cas_list." + x + ".ecm_data")
			.addValidator(validateHex)
			.addAttr("maxlength", "512");
		form.input("Access Criteria (hex)", "cas_list." + x + ".ac")
			.addValidator(validateHex)
			.addAttr("maxlength", "512");

		form.group()
			.addClass("text-right")
			.addChild($.element.button("Remove CAS")
				.addClass("link danger")
				.on("click", function() {
					casChannelList.splice(x, 1);
					if(!casChannelList.length) self.scope.set("cas_list");
					self.scope.reset();
				}));
	});
};

var tabSptsRemap = function(self, form) {
	form.input("Map PID's", "map", "Example: pmt=100, video=101, audio=102, 1003=103");
	form.input("Filter PID's", "filter~", "Keep only defined pids. Example: 101, 102, 103");
	form.number("Change PNR", "set_pnr").addValidator(validatePnr);
	form.number("Change TSID", "set_tsid");
};

var tabSptsBackup = function(self, form) {
	form.choice("Backup Type", "backup_type", [
		{ value: "", label: "Default: Active Backup" },
		{ value: "stop", label: "Active Backup and Stop streaming if all inputs are inactive" },
		{ value: "passive", label: "Passive Backup" },
		{ value: "disable", label: "Disable" },
	])
		.on("change", function() {
			self.scope.reset();
		});

	var backup_type = self.scope.get("backup_type");
	if(backup_type != "disable")
	{
		form.number("Start Delay", "backup_start_delay", "Delay before start next input. Default: 0");
		if(backup_type != "passive")
		{
			form.number("Return Delay", "backup_return_delay", "Delay before return to previous input. Default: 0");
			form.checkbox("Force return if all inputs are inactive", "backup_force_return");
		}
	}
};

var tabSptsEpg = function(self, form) {
	form.header("EPG Export");
	form.choice("Format", "epg_export_format", [
		{ value: "", label: "Default: XMLTV" },
		{ value: "json", label: "JSON" },
	]);
	form.input("Destination", "epg_export", "Destination address: file:// or http://");
	var x = form.choice("Codepage", "epg_export_codepage", codepages);
	x.firstChild.setText("Default: Auto");
};

var tabMpts = function(self, form, streamId, hostId) {
	tabGeneral(self, form, streamId, hostId);

	form.input("Country", "country", "Country Code ISO 3166-1 alpha-3")
		.setRequired()
		.addValidator(function(value) { return (!!value && value.length == 3) });
	form.input("UTC Offset", "offset", "Offset time from UTC in the range between -720 minutes and +780 minutes");
	form.number("Network ID", "network_id", "Default: 1");
	form.input("Network Name", "network_name");
	form.input("Provider Name", "provider");
	form.choice("Codepage", "textcode", codepages);
	form.number("TSID", "tsid", "Transport Stream ID. Default: 1")
		.addAttr("maxlength", "5");
	form.number("ONID", "onid", "Original Network ID. Default: 1");

	ioList(self, form, "input");
	ioList(self, form, "output");
};

var tabMptsSdt = function(self, form) {
	var sl = self.scope.get("sdt");
	$.forEach(sl, function(v, k) {
		var s = $.element("select")
			.addClass("button icon icon-move")
			.setStyle("float", "right")
			.on("change", function() {
				if(this.value == "-1") {
					sl.splice(k, 1);
				} else {
					sl.move(k, Number(this.value));
				}
				self.scope.reset();
			});
		for(var i = 0; i < sl.length; i++) {
			s.addChild($.element("option")
				.setValue(i.toString())
				.setText(i + 1));
		}
		s.addChild(
			$.element("option")
				.setDisabled(true)
				.setText("---"),
			$.element("option")
				.setValue("-1")
				.setText("Remove"));
		s.value = k;

		form.header("Service #" + (k + 1))
			.addChild(s);

		form.choice("Service Type", "sdt." + k + ".type", [
			{ value: "1", label: "Video" },
			{ value: "2", label: "Radio" },
			{ value: "3", label: "Teletext" },
		]);

		form.input("Service Name", "sdt." + k + ".name")
			.setRequired();

		form.number("PNR", "sdt." + k + ".pnr", "Program Number")
			.setRequired()
			.addValidator(validatePnr);

		form.checkbox("Scrambled channel", "sdt." + k + ".ca")
			.on("change", function() {
				self.scope.reset();
			});

		form.number("LCN", "sdt." + k + ".lcn", "Logical Channel Number")
			.addValidator(function(value) {
				if(value == undefined || value == "") return true;
				value = Number(value);
				return (!isNaN(value) && value >= 0 && value < 1000)
			});

		form.hr();
	});

	form.header("New Service")
		.addChild($.element.button()
			.addClass("icon  icon-add")
			.setStyle("float", "right")
			.on("click", function(event) {
				event.preventDefault();
				if(sl == undefined) { sl = []; self.scope.set("sdt", sl) }
				sl.push({ type: "1" });
				self.scope.reset();
				window.scrollTo(0, $.body.scrollHeight);
				document.querySelector("[name=\"sdt." + (sl.length - 1) + ".name\"]").focus();
			}));
};

var tabMptsNit = function(self, form, streamId, hostId) {
	form.choice("Type", "nit_actual.type", [
		{ value: "", label: "Default: not defined" },
		{ value: "S", label: "DVB-S" },
		{ value: "C", label: "DVB-C" },
	])
		.on("change", function() {
			self.scope.set("nit_actual", { type: this.value });
			self.scope.set("nit_other", undefined);
			self.scope.reset()
		});

	var sType = self.scope.get("nit_actual.type");
	if(!sType) {
		//
	} else if(sType == "S") {

		form.number("Frequency", "nit_actual.frequency", "950..13250 MHz")
			.setRequired()
			.addValidator(function(value) {
				value = Number(value);
				return (!isNaN(value) && value >= 950 && value < 13250)
			});
		form.choice("Polarization", "nit_actual.polarization", dvbPolarization)
			.setRequired();
		form.number("Symbolrate", "nit_actual.symbolrate", "1000..50000 Kbaud")
			.setRequired()
			.addValidator(function(value) {
				value = Number(value);
				return (!isNaN(value) && value > 1000 && value < 50000)
			});
		form.input("Orbital Position", "nit_actual.position", "Orbital Position (Example: 0.8W, 36.0E)")
			.setRequired()
			.addValidator(function(value) {
				// TODO: orbital posisition
				return true;
			});
		form.choice("FEC", "nit_actual.fec", dvbFec);
		form.choice("Modulation", "nit_actual.modulation", dvbsModulation);

	} else if(sType == "C") {

		form.number("Frequency", "nit_actual.frequency", "80..1000 MHz")
			.setRequired()
			.addValidator(function(value) {
				value = Number(value);
				return (!isNaN(value) && value >= 80 && value < 1000)
			});
		form.number("Symbolrate", "nit_actual.symbolrate", "1000..10000 Kbaud")
			.setRequired()
			.addValidator(function(value) {
				value = Number(value);
				return (!isNaN(value) && value > 1000 && value < 10000)
			});
		form.choice("FEC", "nit_actual.fec", dvbFec);
		form.choice("Modulation", "nit_actual.modulation", dvbcModulation);

	}

	form.header("Network Search");
	var nitOther = self.scope.get("nit_other");
	if(!nitOther) nitOther = [], self.scope.set("nit_other", nitOther);
	var mptsList = [];
	$.forEach(app.hosts[hostId].config.make_stream, function(c) {
		if(c.id && c.id != streamId && c.type == "mpts") mptsList.push({ id: c.id, name: c.name, tsid: c.tsid });
	});
	$.forEach(mptsList, function(c) {
		var x = form.checkbox(c.name, "")
			.on("change", function() {
				if(this.checked) {
					nitOther.push(c.id);
				} else {
					var i = nitOther.indexOf(c.id);
					if(i != -1) nitOther.splice(i, 1);
				}
			});
		x.checked = (nitOther.indexOf(c.id) != -1);
	});
};

var tabMptsAdvanced = function(self, form) {
	form.number("SI Packets Interval", "si_interval", "Interval in milliseconds to send stream information. Default: 500");
};

StreamsModule.tabs = {
	spts: [
		{ label: "General", id: "", render: tabSpts },
		{ label: "Groups", id: "groups", render: tabGroups },
		{ label: "Service", id: "sdt", render: tabSptsSdt },
		{ label: "Remap", id: "remap", render: tabSptsRemap },
		{ label: "Backup", id: "backup", render: tabSptsBackup },
		{ label: "EPG", id: "epg", render: tabSptsEpg },
	],
	mpts: [
		{ label: "General", id: "", render: tabMpts },
		{ label: "Groups", id: "groups", render: tabGroups },
		{ label: "Service", id: "sdt", render: tabMptsSdt },
		{ label: "Delivery", id: "nit", render: tabMptsNit },
		{ label: "Advanced", id: "advanced", render: tabMptsAdvanced },
	],
};

StreamsModule.render = function(object) {
	var x, self = this,
		streamId = self.scope.get("$streamId"),
		hostId = self.scope.get("$hostId"),
		appHost = app.hosts[hostId],
		tabId = self.scope.get("$tab") || "",
		form = new Form(self.scope, object),
		type = self.scope.get("type"),
		tabRender;

	x = [];
	$.forEach(StreamsModule.tabs[type], function(v) {
		x.push(v);
		if(tabId == v.id) tabRender = v.render;
	});
	form.tab("$tab", x);
	tabRender(self, form, streamId, hostId);

	var serialize = function() {
		if(self.scope.get("$remove")) return { remove: true };

		var data = self.scope.serialize();
		if(data.id == undefined) data.id = appHost.makeUid("make_stream");

		var ioClean = function(obj) {
			var a = data[obj];
			if(a == undefined) return;
			for(var i = 0; i < a.length; ) {
				if(!a[i]) a.splice(i, 1);
				else ++i;
			}
			if(!a.length) delete(data[obj]);
		}

		ioClean("input");
		ioClean("_input");
		ioClean("output");
		ioClean("_output");

		if(!data.input) data.enable = false;

		if(data.nit_actual) {
			if(!data.nit_actual.type) {
				delete(data.nit_actual);
				delete(data.nit_other);
			} else {
				$.forEach(data.nit_actual, function(v, k) {
					if(!v) delete(data.nit_actual[k]);
				});

				if(data.nit_other) {
					for(var i = 0; i < data.nit_other.length; ) {
						if(data.nit_other[i]) ++i;
						else data.nit_other.splice(i, 1);
					}
					if(!data.nit_other.length) delete(data.nit_other);
				}
			}
		}

		$.forEach(data.groups, function(v, k) {
			if(!v) delete(data.groups[k]);
		});

		return data;
	}

	form.hr();

	var btnApply = $.element.button("Apply")
		.addClass(self.scope.get("$remove") ? "danger" : "submit")
		.on("click", function() {
			if(!self.scope.get("$remove") && !self.scope.validate()) {
				$.err({ title: "Form has errors" });
				return;
			}
			appHost.request({
				cmd: "set-stream",
				gid: appHost.config.gid,
				id: streamId,
				stream: serialize(),
			}, function() {
				$.route(MainModule.link);
			}, function() {
				$.err({ title: "Failed to save stream" });
			});
		});

	var btnClone = $.element.button("Clone")
		.on("click", function() {
			var data = serialize();
			data.name = (data.name || "") + " (clone)";
			if(data.id != undefined) delete(data.id);
			StreamsModule.streamClone = data;
			app.selectHost(StreamsModule.link, "-");
		});

	if(streamId != "-") {
		if(tabId == "") {
			form.checkbox("Remove", "$remove")
				.setDanger()
				.on("change", function() {
					if(this.checked)
						btnApply.removeClass("submit").addClass("danger");
					else
						btnApply.removeClass("danger").addClass("submit");
				});
		}
	} else {
		btnClone.setDisabled(true);
	}

	form.submit().addChild(btnApply, btnClone);
};

StreamsModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var scope;

	var x = location.hash.slice(StreamsModule.link.length + 1).split("/"),
		streamId = x.pop(),
		hostId = x.pop();

	if(!hostId || !app.hosts[hostId]) { $.route(MainModule.link); return }

	if(streamId == "-") {
		if(StreamsModule.streamClone) {
			scope = StreamsModule.streamClone;
			delete(StreamsModule.streamClone);
		} else {
			scope = { "enable": true, "type": "spts" };
		}
	} else {
		var s = MainModule.streams[hostId + "/" + streamId];
		if(!s) { $.route(MainModule.link); return }
		scope = $.clone(s.config);
	}

	scope.$hostId = hostId;
	scope.$streamId = streamId;
	window.renderContent = StreamsModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(StreamsModule);
})();

/* adapter.js */

(function() {
"use strict";

window.AdaptersModule = {
	link: "#/adapter",
};

AdaptersModule.renderScan = function(object) {
	var modal = this,
		hostId = modal.scope.get("$hostId"),
		appHost = app.hosts[hostId];

	var dvbStatus = function() {
		var i = function(t) { return $.element("span").addAttr("title", t) };
		var x = $.element("div")
			.addClass("info-status")
			.addChild(i("SIGNAL"), i("CARRIER"), i("FEC"), i("SYNC"), i("LOCK"), i("BER"), i("UNC"), i("BITRATE"));
		var xl = x.childNodes;
		x.setStatus = function(s) {
			xl[0].className = (s.signal) ? "ok" : "er";
			xl[1].className = (s.carrier) ? "ok" : "er";
			xl[2].className = (s.viterbi) ? "ok" : "er";
			xl[3].className = (s.sync) ? "ok" : "er";
			xl[4].className = (s.lock) ? "ok" : "er";
			xl[5].setText("BER:" + s.ber_value);
			xl[6].setText("UNC:" + s.unc_value);
			xl[7].setText(s.bitrate + " Kbit/s");
		};
		return x
	};

	var sI = dvbStatus();
	var sS = MainModule.dvbLevel("S", modal.scope.get("raw_signal"));
	var sQ = MainModule.dvbLevel("Q", modal.scope.get("raw_signal"));

	var form = new Form(modal.scope, object);
	form.submit().addChild(sI, sS, sQ);

	modal.setStatus = function(s) {
		sS.setLevel(s.svalue);
		sQ.setLevel(s.qvalue);
		sI.setStatus(s);
		modal.status = s;
	};
	modal.setStatus(modal.status || { lock: false, svalue: 0, qvalue: 0, ber_value: 0, unc_value: 0, bitrate: 0 });

	form.hr();

	var renderNit = function(v) {
		form.input("Provider").addAttr("readonly").setValue(v.name);
		var s = v.system || {};
		switch(s.type_id) {
			case 67: { /* DVB-S */
				form.input("Position").addAttr("readonly").setValue(s.orbital_position);
				form.input("Frequency").addAttr("readonly").setValue(s.frequency);
				form.input("Polarization").addAttr("readonly").setValue(s.polarization);
				form.input("Symbolrate").addAttr("readonly").setValue(s.symbolrate);
				form.input("Modulation").addAttr("readonly").setValue(s.modulation);
				form.input("FEC").addAttr("readonly").setValue(s.fec);
				break;
			}
			case 68: { /* DVB-C */
				form.input("Frequency").addAttr("readonly").setValue(s.frequency);
				form.input("Symbolrate").addAttr("readonly").setValue(s.symbolrate);
				form.input("Modulation").addAttr("readonly").setValue(s.modulation);
				form.input("FEC").addAttr("readonly").setValue(s.fec);
				break;
			}
			case 90: { /* DVB-T */
				form.input("Frequency").addAttr("readonly").setValue(s.frequency);
				form.input("Bandwidth").addAttr("readonly").setValue(s.bandwidth);
				form.input("Guard Interval").addAttr("readonly").setValue(s.guard_interval);
				form.input("Transmit Mode").addAttr("readonly").setValue(s.transmitmode);
				form.input("Hierarchy").addAttr("readonly").setValue(s.hierarchy);
				form.input("Modulation").addAttr("readonly").setValue(s.modulation);
				break;
			}
		}
		form.hr();
	};

	var renderItem = function(v, i) {
		if(v.pnr == 0) {
			renderNit(v);
		} else {
			var text = "PNR:" + v.pnr + "&nbsp;<strong>" + v.name + "</strong>";
			if(v.cas && v.cas.length) text += "<br/>CAS:" + v.cas.join(",&nbsp;");
			var s = (!!v.streams && v.streams.length);
			if(s) text += "<br/>" + v.streams.join("<br/>");
			form.checkbox(text, "streams." + i + ".select").setDisabled(!s);
		}
	};

	var streams = modal.scope.get("streams");
	if(!streams || !streams.length) {
		form.loading();
	} else {
		$.forEach(streams, renderItem);

		form.hr();

		form.checkbox("Set DVB-CI CAM for selected channels", "cam");

		var softcamList = [
			{ value: "", label: "None" },
			{ value: "", label: "---", disabled: true }
		];
		var softcamSortedList = [];
		$.forEach(appHost.config.softcam, function(i) {
			softcamSortedList.push({ value: i.id, label: i.name });
		});
		softcamSortedList.sort(function(a,b) { return a.label.localeCompare(b.label) });
		softcamList = softcamList.concat(softcamSortedList);
		form.choice("Set SoftCAM for selected channels", "cam", softcamList);
	}

	form.hr();

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() { modal.submit() });

	var btnCancel = $.element.button("Cancel")
		.on("click", function() { modal.remove() });

	object.addChild($.element("div")
		.addClass("text-center")
		.addChild(btnApply, btnCancel));
};

AdaptersModule.startScan = function(self, fn) {
	var scan, modal,
		hostId = self.scope.get("$hostId"),
		config = self.scope.serialize();

	config.format = "dvb";
	if(config.id == undefined) config.id = "-";

	var onScan = function(scanData) {
		modal.scope.set("streams", $.clone(scanData));
		modal.scope.reset();
	};

	var onEvent = function(event) {
		var data = event.data;
		if(event.host != hostId || data.dvb_id != config.id) return;

		var status = {
			bitrate: data.bitrate,
			ber_value: (data.ber > 99) ? "99+" : data.ber,
			unc_value: (data.unc > 99) ? "99+" : data.unc,
			signal: (data.status & 0x01) !== 0,
			carrier: (data.status & 0x02) !== 0,
			viterbi: (data.status & 0x04) !== 0,
			sync: (data.status & 0x08) !== 0,
			lock: (data.status & 0x10) !== 0,
		};

		if(config.raw_signal) {
			status.svalue = data.signal;
			status.qvalue = Number(data.snr / 10).format(1);
		} else {
			status.svalue = Math.floor((data.signal * 99) / 65535);
			status.qvalue = Math.floor((data.snr * 99) / 65535);
		}

		modal.setStatus(status);
	};

	var onModalRemove = function() {
		app.off("adapter_event", onEvent);
		scan.destroy();
		modal.scope.destroy();
	};

	modal = $.modal()
		.addChild($.element("div")
			.addClass("dvb-scan")
			.dataRender("AdaptersModule.renderScan"))
		.bindScope({
			$hostId: hostId,
			raw_signal: config.raw_signal
		})
		.on("remove", function() {
			onModalRemove();
		})
		.on("submit", function() {
			var streams = [],
				cam = modal.scope.get("cam");
			$.forEach(modal.scope.get("streams"), function(s) {
				if(s.select) streams.push({ name: s.name, pnr: s.pnr });
			});

			onModalRemove();
			if(streams.length) fn(streams, cam);
		});

	app.on("adapter_event", onEvent);
	scan = new Scan(hostId, config, onScan);
};

AdaptersModule.renderPlsCals = function(object) {
	var modal = this,
		form = new Form(modal.scope, object);

	form.choice("PLS Mode", "mode", [
		{ label: "Root", value: 0 },
		{ label: "Gold", value: 1 },
		{ label: "Combo", value: 2 },
	])
		.setRequired();

	form.number("PLS Code", "code", "0 - 262143")
		.setRequired()
		.addValidator(function(value) {
			value = Number(value);
			return (!isNaN(value) && value >= 0 && value <= 262143);
		});

	form.number("Stream", "id", "0 - 255")
		.setRequired()
		.addValidator(function(value) {
			value = Number(value);
			return (!isNaN(value) && value >= 0 && value <= 255);
		});

	form.hr();

	var btnOk = $.element.button("Ok")
		.addClass("submit")
		.on("click", function() {
			if(modal.scope.validate()) modal.submit();
		});

	var btnCancel = $.element.button("Cancel")
		.on("click", function() {
			modal.remove();
		});

	form.submit().addChild(btnOk, btnCancel);
};

AdaptersModule.render = function(object) {
	var x, self = this,
		adapterId = self.scope.get("$adapterId"),
		hostId = self.scope.get("$hostId"),
		appHost = app.hosts[hostId],
		tabId = self.scope.get("$tab") || "",
		dvbList = MainModule.dvbList[hostId],
		form = new Form(self.scope, object),
		adapterType = self.scope.get("type"),
		adapterTypeMap = {
			"S": "S", "S2": "S",
			"T": "T", "T2": "T",
			"C": "C", "C/A": "C", "C/B": "C", "C/C": "C",
			"ATSC": "ATSC",
			"ISDBT": "ISDBT",
		},
		adapterTypeBase = adapterTypeMap[adapterType];

	switch(adapterTypeBase) {
		case "S":
			form.tab("$tab", [
				{ label: "General", id: "" },
				{ label: "LNB", id: "lnb" },
				{ label: "DiSEqC", id: "diseqc" },
				{ label: "Unicable", id: "unicable" },
				{ label: "Advanced", id: "advanced" },
			]);
			break;
		case "T":
		case "C":
		case "ATSC":
		case "ISDBT":
			form.tab("$tab", [
				{ label: "General", id: "" },
				{ label: "Advanced", id: "advanced" },
			]);
			break;
		default:
			form.tab("$tab", [
				{ label: "General", id: "" },
			]);
			break;
	}

	if(tabId == "") {
		form.checkbox("Enable", "enable")
			.addAttr("data-false", "false");
		form.input("Name", "name", "Adapter Name").setRequired();

		x = form.input("ID", "id")
			.addValidator(validateId);
		if(adapterId != "-") x.setRequired();

		if(self.scope.get("$adapter") == undefined) {
			var a = Number(self.scope.get("adapter"));
			var d = Number(self.scope.get("device") || 0);
			var m = self.scope.get("mac");
			if(!isNaN(a) && !isNaN(d)) {
				self.scope.set("$adapter", $.forEach(appHost.sysinfo.dvb_list, function(v, k) {
					if(v.adapter == a && v.device == d) return k;
				}));
			} else if(m) {
				self.scope.set("$adapter", $.forEach(appHost.sysinfo.dvb_list, function(v, k) {
					if(v.mac == m) return k;
				}));
			}
		}

		form.choice("Adapter", "$adapter", dvbList)
			.setRequired()
			.on("change", function() {
				var adapter = appHost.sysinfo.dvb_list[this.value];
				self.scope.set("adapter", adapter.adapter);
				self.scope.set("device", adapter.device);
			});

		form.choice("Type", "type", [
			{ value: "" },
			{ group: "Satellite", items: [
				{ label: "DVB-S", value: "S" },
				{ label: "DVB-S2", value: "S2" },
			]},
			{ group: "Terrestrial", items: [
				{ label: "DVB-T", value: "T" },
				{ label: "DVB-T2", value: "T2" },
				{ label: "ATSC", value: "ATSC" },
				{ label: "ISDB-T", value: "ISDBT" },
			]},
			{ group: "Cable", items: [
				{ label: "DVB-C", value: "C" },
				{ label: "DVB-C (Annex A)", value: "C/A" },
				{ label: "DVB-C (Annex B)", value: "C/B" },
				{ label: "DVB-C (Annex C)", value: "C/C" },
			]},
		])
			.setRequired()
			.on("change", function() {
				if(adapterTypeMap[this.value] != adapterTypeBase) {
					self.scope.reset({
						$tab: tabId,
						$adapterId: adapterId,
						$hostId: hostId,
						adapter: self.scope.get("adapter"),
						device: self.scope.get("device"),
						enable: self.scope.get("enable"),
						id: self.scope.get("id"),
						type: this.value,
						name: self.scope.get("name"),
					});
				} else {
					self.scope.reset();
				}
			});
	}

	if(adapterType && tabId == "advanced") {
		form.choice("Modulation", "modulation", [
			{ value: "", label: "Default: Auto" },
			{ value: "QPSK" },
			{ value: "QAM16", label: "16-QAM" },
			{ value: "QAM32", label: "32-QAM" },
			{ value: "QAM64", label: "64-QAM" },
			{ value: "QAM128", label: "128-QAM" },
			{ value: "QAM256", label: "256-QAM" },
			{ value: "VSB8" },
			{ value: "VSB16" },
			{ value: "PSK8", label: "8PSK" },
			{ value: "APSK16" },
			{ value: "APSK32" },
			{ value: "DQPSK" },
		]);
	}

	if(adapterTypeBase == "S") {
		if(tabId == "") {
			form.header("Transponder");
			form.number("Frequency", "frequency", "950..13250 MHz")
				.setRequired()
				.addValidator(function(value) {
					value = Number(value);
					return (!isNaN(value) && value >= 950 && value < 13250)
				});
			form.choice("Polarization", "polarization", dvbPolarization)
				.setRequired();
			form.number("Symbolrate", "symbolrate", "1000..50000 Kbaud")
				.setRequired()
				.addValidator(function(value) {
					value = Number(value);
					return (!isNaN(value) && value > 1000 && value < 50000)
				});
		}

		if(tabId == "advanced") {
			form.choice("FEC", "fec", dvbFec);
			if(adapterType == "S2") {
				form.choice("Roll-off", "rolloff", [
					{ value: "", label: "Default: 35" },
					{ value: "25" }, { value: "20" }, { value: "AUTO" }
				]);
			}

			form.number("Stream ID", "stream_id", "Multistream filtering")
				.addButton($.element.button()
					.addClass("icon icon-settings")
					.on("click", function() {
						$.modal()
							.addChild($.element("div")
								.dataRender("AdaptersModule.renderPlsCals"))
							.bindScope({ mode: 0 })
							.on("submit", function() {
								var data = this.scope.serialize();
								var streamId = (Number(data.mode) << 26) + (Number(data.code) << 8) + Number(data.id);
								self.scope.set("stream_id", streamId);
							});
					}));
		}

		if(tabId == "lnb") {
			form.number("LOF1", "lof1", "Low sub-band");
			form.number("LOF2", "lof2", "High sub-band");
			form.number("SLOF", "slof", "Sub-band range");
			form.checkbox("LNB Sharing. Disable LNB voltage supply and tone signal", "lnb_sharing");
			form.checkbox("Force Tone", "tone");
		}

		if(tabId == "unicable") {
			var uniChId = [{ value: "", label: "Default: unicable disabled" }];
			var uniPos, uniFreq;
			for(var i = 1; i < 10; ++i) { uniChId.push({ value: i }) }
			form.choice("Unicable Slot", "uni_scr", uniChId)
				.on("change", function() {
					if(!this.value) {
						self.scope.set("uni_pos", "");
						self.scope.set("uni_frequency", "");
						uniPos.setDisabled(true);
						uniFreq.setDisabled(true);
					} else {
						uniPos.setDisabled(false);
						uniFreq.setDisabled(false);
					}
				});
			var isUnicableSlot = self.scope.get("uni_scr") != undefined;
			uniPos = form.choice("Slot Position", "uni_pos", [{ value: "" }, { value: "A" }, { value: "B" }])
				.setDisabled(!isUnicableSlot);
			uniFreq = form.number("Slot Frequency", "uni_frequency", "950..2150 MHz")
				.setDisabled(!isUnicableSlot)
				.addValidator(function(value) {
					if(value == undefined || value == "") return true;
					value = Number(value);
					return (!isNaN(value) && value >= 950 && value < 2150)
				});
		}

		if(tabId == "diseqc") {
			form.choice("DiSEqC Mode", "diseqc_mode", [
				{ value: "", label: "Default: DiSEqC 1.0" },
				{ value: "1.1", label: "DiSEqC: 1.1" },
				{ value: "toneburst", label: "Tone Burst" },
				{ value: "cmd", label: "DiSEqC Command" }
			]).on("change", function() {
				self.scope.reset();
			});

			switch(self.scope.get("diseqc_mode")) {
				case "1.1":
					var x = [{ value: "" }];
					for(var i = 1; i <= 16; i++) x.push({ value: i });
					form.choice("DiSEqC 1.1", "diseqc", x);
					break;
				case "toneburst":
					form.choice("Tone Burst", "diseqc", [
						{ value: "" }, { value: "A" }, { value: "B" }
					]);
					break;
				case "cmd":
					form.input("DiSEqC Command", "diseqc");
					break;
				case "1.0":
				default:
					var x = [{ value: "" }];
					for(var i = 1; i <= 4; i++) x.push({ value: i });
					form.choice("DiSEqC 1.0", "diseqc", x);
					break;
			}
		}
	} else if(adapterTypeBase == "T") {
		if(tabId == "") {
			form.number("Frequency", "frequency", "1..1000 MHz")
				.setRequired()
				.addValidator(function(value) {
					value = Number(value);
					return (!isNaN(value) &&
						((value > 0 && value < 1000) || (value > 1000000 && value < 1000000000)))
				});
		}

		if(tabId == "advanced") {
			form.number("PLP ID", "stream_id", "Multistream filtering");

			form.choice("Bandwidth", "bandwidth", [
				{ value: "", label: "Default: Auto" },
				{ value: "6MHz" }, { value: "7MHz" }, { value: "8MHz" }
			]);

			form.choice("Guard", "guardinterval", [
				{ value: "", label: "Default: Auto" },
				{ value: "1/32" }, { value: "1/16" },
				{ value: "1/8" }, { value: "1/4" },
				{ value: "1/128" }, { value: "19/128" }, { value: "19/256" },
			]);

			form.choice("Transmit", "transmitmode", [
				{ value: "", label: "Default: Auto" },
				{ value: "1K" }, { value: "2K" }, { value: "4K" },
				{ value: "8K" }, { value: "16K" }, { value: "32K" }
			]);

			form.choice("Hierarchy", "hierarchy", [
				{ value: "", label: "Default: Auto" },
				{ value: "NONE" }, { value: "1" },
				{ value: "2" }, { value: "4" },
			]);
		}

	} else if(adapterTypeBase == "C") {
		if(tabId == "") {
			form.number("Frequency", "frequency", "80..1000 MHz")
				.setRequired()
				.addValidator(function(value) {
					value = Number(value);
					return (!isNaN(value) &&
						((value >= 80 && value < 1000) || (value >= 80000000 && value < 1000000000)))
				});
			form.number("Symbolrate", "symbolrate", "1000..10000 Kbaud")
				.setRequired()
				.addValidator(function(value) {
					value = Number(value);
					return (!isNaN(value) && value > 1000 && value < 10000)
				});
		}

		if(tabId == "advanced") {
			form.choice("FEC", "fec", dvbFec)
		}
	} else if(adapterTypeBase == "ATSC") {
		if(tabId == "") {
			form.number("Frequency", "frequency", "0..1000 MHz")
				.setRequired()
				.addValidator(function(value) {
					value = Number(value);
					return (!isNaN(value) &&
						((value > 0 && value < 1000) || (value > 1000000 && value < 1000000000)))
				});
		}

	} else if(adapterTypeBase == "ISDBT") {
		if(tabId == "") {
			form.number("Frequency", "frequency", "0..1000 MHz")
				.setRequired()
				.addValidator(function(value) {
					value = Number(value);
					return (!isNaN(value) &&
						((value > 0 && value < 1000) || (value > 1000000 && value < 1000000000)))
				});
		}

		if(tabId == "advanced") {
			form.choice("Bandwidth", "bandwidth", [
				{ value: "", label: "Default: Auto" },
				{ value: "6MHz" }, { value: "7MHz" }, { value: "8MHz" }
			])
		}
	}

	if(adapterType && tabId == "advanced") {
		form.input("Timeout", "timeout", "Delay in seconds before check DVR errors. Default: 2sec");
		form.input("DDCI", "ddci", "Bind adapter to the DigitalDevices CI");
		form.checkbox("Budget Mode. Disable hardware PID filtering", "budget");
		form.checkbox("Signal in dBm", "raw_signal");
		form.input("CA Delay", "ca_pmt_delay", "Delay before initialize CA module. Default: 3")
		form.number("DVR Buffer Size", "buffer_size", "DVR Buffer Size 1..200. Default: not set")
			.addValidator(function(value) {
				if(value == undefined || value == "") return true;
				value = Number(value);
				return (!isNaN(value) && value >= 1 && value < 200)
			})
	}

	var serialize = function() {
		if(self.scope.get("$remove")) return { remove: true };

		var data = self.scope.serialize();
		if(!data.id) data.id = appHost.makeUid("dvb_tune");
		if(!data.diseqc) delete(data["diseqc_mode"]);

		return data;
	};

	var apply = function(streams, cam) {
		var data = serialize();
		$.forEach(streams, function(s) {
			s.enable = true;
			s.type = "spts";
			s.id = appHost.makeUid("make_stream");
			var x = "dvb://" + data.id + "#pnr=" + s.pnr;
			if(cam) x += (cam == true) ? ("&cam") : ("&cam=" + cam);
			s.input = [x];
			delete(s.pnr);
		});
		appHost.request({
			cmd: "set-adapter",
			gid: appHost.config.gid,
			id: adapterId,
			adapter: data,
			scan: streams
		}, function() {
			$.route(MainModule.link);
		}, function() {
			$.err({ title: "Failed to save adapter" });
		});
	};

	form.hr();

	var btnApply = $.element.button("Apply")
		.addClass(self.scope.get("$remove") ? "danger" : "submit")
		.on("click", function() {
			if(!self.scope.get("$remove") && !self.scope.validate())
				$.err({ title: "Form has errors" });
			else
				apply();
		});

	var btnScan = $.element.button("Scan")
		.on("click", function() {
			if(!self.scope.validate())
				$.err({ title: "Form has errors" });
			else
				AdaptersModule.startScan(self, apply);
		});

	if(adapterId != "-" && tabId == "") {
		form.checkbox("Remove", "$remove")
			.setDanger()
			.on("change", function() {
				if(this.checked)
					btnApply.removeClass("submit").addClass("danger");
				else
					btnApply.removeClass("danger").addClass("submit");
			});
	}

	form.submit().addChild(btnApply, btnScan);
};

AdaptersModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var scope;

	var x = location.hash.slice(AdaptersModule.link.length + 1).split("/"),
		adapterId = x.pop(),
		hostId = x.pop();

	if(!hostId || !app.hosts[hostId]) { $.route(MainModule.link); return }

	if(adapterId == "-") {
		scope = { "enable": true };
	} else {
		var a = MainModule.adapters[hostId + "/" + adapterId];
		if(!a) { $.route(MainModule.link); return }
		scope = $.clone(a.config);
	}

	scope.$adapterId = adapterId;
	scope.$hostId = hostId;
	window.renderContent = AdaptersModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(AdaptersModule);
})();

/* sessions.js */

(function() {
"use strict";

window.SessionsModule = {
	label: "Sessions",
	link: "#/sessions",
	order: 5,
};

SessionsModule.run = function() {
	SessionsModule.sessions = {};
	SessionsModule.hide = (app.hosts[location.host].config.settings || {}).http_disable_sessions;

	// TODO: rename to event-session
	app.on("session_event", function(event) {
		var hostId = event.host,
			data = event.data,
			cdate = Date.now();

		$.forEach(data.sessions, function(e) {
			var sessionsId = hostId + "/" + e.client_id;

			if(e.hasOwnProperty("channel_id")) {
				e.host = hostId;
				e.sdate = new Date(cdate - e.uptime * 1000);
				if(SessionsModule.addSession) SessionsModule.addSession(e);
				SessionsModule.sessions[sessionsId] = e;
			} else {
				if(SessionsModule.removeSession) SessionsModule.removeSession(sessionsId);
				delete(SessionsModule.sessions[sessionsId]);
			}
		});
	});
};

SessionsModule.addHost = function(hostId) {
	var appHost = app.hosts[hostId];
	appHost.request({
		cmd: "sessions"
	}, function(response) {
		var cdate = Date.now();
		$.forEach(response.data.sessions, function(e) {
			var sessionsId = hostId + "/" + e.client_id;

			e.host = hostId;
			e.sdate = new Date(cdate - e.uptime * 1000);

			SessionsModule.sessions[sessionsId] = e;
			if(SessionsModule.addSession) SessionsModule.addSession(e);
		});
	});
};

SessionsModule.removeHost = function(hostId) {
	$.forEach(SessionsModule.sessions, function(s, i) {
		if(s.host == hostId) {
			if(SessionsModule.removeSession) SessionsModule.removeSession(i);
			delete(SessionsModule.sessions[i]);
		}
	})
};

SessionsModule.render = function(object) {
	var orderString = function(a, b) {
		var ca = a.textContent;
		var cb = b.textContent;
		return ca.localeCompare(cb);
	};

	var orderNumber = function(a, b) {
		var ca = Number(a.dataset.value);
		var cb = Number(b.dataset.value);
		return (ca == cb) ? 0 : ((ca > cb) ? 1 : -1);
	};

	var header = $.element("thead")
		.addChild($.element("tr")
			.addChild(
				$.element("th")
					.setText("Server")
					.setStyle("width", "200px")
					.dataOrder(orderString),
				$.element("th")
					.setText("Stream")
					.dataOrder(orderString, true),
				$.element("th")
					.setText("IP")
					.setStyle("width", "150px")
					.dataOrder(orderNumber),
				$.element("th")
					.setText("Login")
					.setStyle("width", "150px")
					.dataOrder(orderString),
				$.element("th")
					.setText("Uptime (min)")
					.setStyle("width", "150px")
					.dataOrder(orderNumber),
				$.element("th")
					.setStyle("width", "32px")));

	var sessionsTotalValue = 0;
	var sessionsTotal = $.element("span");
	var footer = $.element("tfoot")
		.addChild($.element("tr")
			.addChild(
				$.element("th")
					.addChild("Sessions: ", sessionsTotal)));

	var content = $.element("tbody");
	content.nodes = {};

	var table = $.element("table")
		.addClass("table hover")
		.addChild(header, content, footer);
	object.addChild(table);

	$.tableInit(table);

	SessionsModule.addSession = function(s) {
		sessionsTotal.setText(++ sessionsTotalValue);
		var uptime = $.element("td")
			.addAttr("data-value", s.uptime);

		var hostName = app.hosts[s.host].name;

		var row = $.element("tr")
			.addChild(
				$.element("td")
					.addAttr("data-value", hostName)
					.setText(hostName),
				$.element("td")
					.setText(s.channel_name),
				$.element("td")
					.addAttr("data-value", ip2num(s.addr))
					.setText(s.addr),
				$.element("td")
					.addChild((s.login != undefined) ? $.element("a")
						.setText(s.login)
						.on("click", function(event) {
							event.preventDefault();
							SettingsUsersModule.openConfig(s.login);
						}) : ""),
				uptime,
				$.element("td")
					.addClass("action")
					.addChild($.element.button()
						.addClass("icon icon-close")
						.on("click", function() {
							app.hosts[s.host].request({ cmd: "close-session", id: s.client_id });
						})));

		row.refreshUptime = function() {
			var c = Date.now(),
				u = c - s.sdate,
				d = Math.round(u / 60000),
				m = d % 60,
				h = Math.floor(d / 60);
			if(m < 10) m = "0" + m;
			uptime
				.addAttr("data-value", u)
				.setText(h + ":" + m);
		};

		row.refreshUptime();

		content.nodes[s.host + "/" + s.client_id] = row;
		$.tableSortInsert(table, row);
	};

	SessionsModule.removeSession = function(id) {
		sessionsTotal.setText(-- sessionsTotalValue);
		if(content.nodes[id]) {
			content.nodes[id].remove();
			delete(content.nodes[id]);
		}
	};

	$.forEach(SessionsModule.sessions, function(e) {
		SessionsModule.addSession(e)
	});

	var refresh = setInterval(function() {
		$.forEach(content.nodes, function(r) {
			r.refreshUptime();
		});
	}, 10000);

	self.on("destroy", function() {
		clearInterval(refresh);

		content.empty();
		content.nodes = {};

		delete(SessionsModule.addSession);
		delete(SessionsModule.removeSession);
	});
};

/*___           _____ ______
|  _ \   /\    / ____|  ____|
| |_) | /  \  | (___ | |__
|  _ < / /\ \  \___ \|  __|
| |_) / ____ \ ____) | |____
|____/_/    \_\_____/|_____*/

SessionsModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	window.renderContent = SessionsModule.render;

	$.body
		.bindScope({})
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SessionsModule);
app.menu.push(SessionsModule);
})();

/* settings.js */

(function() {
"use strict";

window.SettingsModule = {
	label: "Settings",
	link: "#/",
	order: 8,
};

SettingsModule.click = function() {
	var modal = $.modal();
	modal.addClass("main-menu");

	var makeItem = function(item) {
		modal.addChild($.element("a")
			.setText(item.label)
			.addAttr("href", item.link || "#")
			.on("click", function(event) {
				modal.remove();

				if(item.click) {
					event.preventDefault();
					item.click(event);
				}
			}));
	};

	var makeItems = function(items) {
		if(items) {
			$.forEach(items, makeItem);
			modal.addChild($.element("hr"));
		}
	};

	makeItems(app.settings);

	modal.addChild($.element("a")
		.setText("Cancel")
		.addClass("text-center")
		.addAttr("href", "#/")
		.on("click", function(event) {
			event.preventDefault();
			modal.remove();
		}));
};

app.modules.push(SettingsModule);
app.menu.push(SettingsModule);
})();

/* settings-general.js */

(function() {
"use strict";

var SettingsGeneralModule = {
	label: "General",
	link: "#/settings-general",
	order: 1,
};

SettingsGeneralModule.run = function() {
	app.on("set-settings", function(event) {
		var hostId = event.host,
			data = event.data,
			appHost = app.hosts[hostId];

		if(data.gid) appHost.config.gid = data.gid;
		if(data.settings) appHost.config.settings = data.settings;
		else delete(appHost.config.settings);

		$.msg({ title: "Settings saved" });
	});

	app.on("set-config", function(event) {
		var hostId = event.host,
			data = event.data,
			appHost = app.hosts[hostId];

		if(data.data) appHost.config[data.key] = data.data;
		else delete(appHost.config[data.key]);

		$.msg({ title: "Settings saved" });
	});
};

SettingsGeneralModule.render = function(object) {
	var self = this,
		masterHost = app.hosts[location.host],
		form = new Form(self.scope, object);

	form.input("Monitoring", "event_request", "Export telemetry and events to the external server");

	form.checkbox("HTTP Sessions", "http_disable_sessions")
		.addAttr("data-true", "undefined")
		.addAttr("data-false", "true");

	form.header("Default Stream Options");

	form.checkbox("Start stream on demand", "http_keep_active")
		.addAttr("data-true", "undefined")
		.addAttr("data-false", "-1")
		.on("change", function() {
			self.scope.reset();
		});

	if(self.scope.get("http_keep_active") != -1)
		form.number("HTTP Keep Active", "$http_keep_active", "Delay before stop stream if no active connections. Default: 0 (turn off immediately)");

	form.number("Backup Start Delay", "backup_start_delay", "Delay before start next input. Default: 0");
	form.number("Backup Return Delay", "backup_return_delay", "Delay before return to previous input. Default: 0");

	form.number("HTTP Output Buffer", "http_buffer", "Size in Kb of the buffer for each client. Default: 1024");

	form.input("TCP Congestion Control", "http_congestion");
	form.number("CC Limit", "cc_limit", "Default: 0 (not limited)");

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() {
			masterHost.request({
				cmd: "set-settings",
				settings: self.scope.serialize(),
			}, function(data) {
				//
			}, function() {
				$.err({ title: "Failed to save settings" });
			});
		});

	form.submit().addChild(btnApply);
};

SettingsGeneralModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	window.renderContent = SettingsGeneralModule.render;

	var masterHost = app.hosts[location.host];
	var scope = $.clone(masterHost.config.settings) || {};

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsGeneralModule);
app.settings.push(SettingsGeneralModule);
})();

/* settings-users.js */

(function() {
"use strict";

window.SettingsUsersModule = {
	label: "Users",
	link: "#/settings-users",
	order: 5,
	search: true,
	menu: [
		{ label: "New User", click: function() {
			SettingsUsersModule.openConfig();
		}},
	],
};

SettingsUsersModule.typeMap = {
	"3": "User" ,
	"2": "Observer",
	"1": "Administrator" ,
};

SettingsUsersModule.modules = [];

SettingsUsersModule.run = function() {
	app.on("set-user", function(event) {
		var hostId = event.host,
			data = event.data,
			appHost = app.hosts[hostId];

		if(data.id == app.login) {
			location.reload(false);
			return;
		}

		if(data.user.remove) {
			$.msg({ title: "User \"{0}\" removed".format(data.id) });
			delete(appHost.config.users[data.id])
			if(SettingsUsersModule.removeUser) {
				SettingsUsersModule.removeUser(data.id);
			}
		} else {
			appHost.config.users[data.id] = data.user;
			$.msg({ title: "User \"{0}\" saved".format(data.id) });
			if(SettingsUsersModule.addUser) {
				SettingsUsersModule.removeUser(data.id);
				SettingsUsersModule.addUser(data.id, data.user);
			}
		}
	});
};

SettingsUsersModule.renderConfig = function(object) {
	var modal = this,
		form = new Form(modal.scope, object),
		login = modal.scope.get("login"),
		appHost = app.hosts[location.host];

	if(app.login != login) {
		form.checkbox("Enable", "user.enable").addAttr("data-false", "false");
	}

	var inputLogin = form.input("Login", "login");
	var inputPass = form.password("Password", "user.password");

	if(login) {
		inputLogin
			.setDisabled(true);
	} else {
		inputLogin
			.setRequired()
			.addValidator(function(value) {
				if(value == login) return true;
				return appHost.config.users[value] == undefined;
			});
		inputPass.setRequired();
	}

	form.input("Comment", "user.comment");

	if(app.login != login) {
		var typeMap = [];
		$.forEach(SettingsUsersModule.typeMap, function(label, value) {
			typeMap.push({ value: value, label: label })
		});
		typeMap.sort(function(a,b) { return a.label.localeCompare(b.label) });
		form.choice("Type", "user.type", typeMap);
	}

	$.forEach(SettingsUsersModule.modules, function(module) {
		form.hr();
		module.renderSettings.call(modal, form);
	});

	form.hr();

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() { if(modal.scope.validate()) modal.submit() });

	var btnCancel = $.element.button("Cancel")
		.on("click", function() { modal.remove() });

	if(login && app.login != login)
		form.checkbox("Remove user", "user.remove")
			.setDanger()
			.on("change", function() {
				if(this.checked)
					btnApply.removeClass("submit").addClass("danger");
				else
					btnApply.removeClass("danger").addClass("submit");
			});

	form.submit().addChild(btnApply, btnCancel);
};

SettingsUsersModule.openConfig = function(login) {
	var modalData = {};
	if(login == undefined) {
		modalData.login = "";
		modalData.user = { enable: true, type: 3 };
	} else {
		modalData.login = login;
		modalData.user = $.clone(app.hosts[location.host].config.users[login]);
	}

	$.modal()
		.addChild($.element("div")
			.dataRender("SettingsUsersModule.renderConfig"))
		.bindScope(modalData)
		.on("submit", function() {
			var data = this.scope.serialize();
			if(data.user.remove) data.user = { remove: true };

			var appHost = app.hosts[location.host];
			appHost.request({
				cmd: "set-user",
				id: data.login,
				user: data.user
			}, function() {
				//
			}, function() {
				$.err({ title: "Failed to save user" });
			});
		});
};

SettingsUsersModule.render = function(object) {
	var self = this;

	var orderString = function(a, b) {
		var ca = a.innerHTML;
		var cb = b.innerHTML;
		return ca.localeCompare(cb);
	};

	var orderNumber = function(a, b) {
		var ca = Number(a.dataset.value);
		var cb = Number(b.dataset.value);
		return (ca == cb) ? 0 : ((ca > cb) ? 1 : -1);
	};

	var header = $.element("thead")
		.addChild($.element("tr")
			.addChild(
				$.element("th")
					.setText("Login")
					.setStyle("width", "200px")
					.dataOrder(orderString, true),
				$.element("th")
					.setText("Comment")
					.addClass("expand")
					.dataOrder(orderString),
				$.element("th")
					.setText("Type")
					.setStyle("width", "150px")
					.dataOrder(orderNumber),
				$.element("th")
					.setText("Created")
					.setStyle("width", "150px")
					.dataOrder(orderNumber)));

	$.forEach(SettingsUsersModule.modules, function(module) {
		if(module.renderHeader) module.renderHeader(header.firstChild);
	});

	var content = $.element("tbody");
	content.nodes = {};

	var table = $.element("table")
		.addClass("table hover")
		.addChild(header, content);
	object.addChild(table);

	$.tableInit(table);

	SettingsUsersModule.addUser = function(login, u) {
		var d = new Date(u.created * 1000);
		var dd = ("0" + d.getDate()).slice(-2);
		var dm = monthMap[d.getMonth()];
		var dy = d.getFullYear();

		var row = $.element("tr")
			.addChild(
				$.element("td")
					.setText(login),
				$.element("td")
					.setText(u.comment || ""),
				$.element("td")
					.addAttr("data-value", u.type)
					.setText(SettingsUsersModule.typeMap[u.type]),
				$.element("td")
					.addAttr("data-value", u.created)
					.setText(dd + " " + dm + " " + dy))
			.on("click", function() {
				SettingsUsersModule.openConfig(login);
			});

		$.forEach(SettingsUsersModule.modules, function(module) {
			if(module.renderItem) module.renderItem(row, u);
		});

		if(u.enable == undefined) u.enable = true;
		if(!u.enable) row.addClass("text-delete text-gray");

		content.nodes[login] = row;
		$.tableSortInsert(table, row);
	};

	SettingsUsersModule.removeUser = function(id) {
		if(content.nodes[id]) {
			content.nodes[id].remove();
			delete(content.nodes[id]);
		}
	};

	var appHost = app.hosts[location.host];
	$.forEach(appHost.config.users, function(data, login) {
		SettingsUsersModule.addUser(login, data);
	});

	app.search = function(value) {
		$.tableFilter(content, value.toLowerCase());
	};

	self.on("destroy", function() {
		content.empty();
		content.nodes = {};

		delete(SettingsUsersModule.addUser);
		delete(SettingsUsersModule.removeUser);
	});

	self.on("ready", function() {
		document.querySelector(".search").focus()
	});
};

SettingsUsersModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	window.renderContent = SettingsUsersModule.render;

	$.body
		.bindScope({})
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsUsersModule);
app.settings.push(SettingsUsersModule);
})();

/* settings-hls.js */

(function() {
"use strict";

var SettingsHlsModule = {
	label: "HLS",
	link: "#/settings-hls",
	order: 6,
};

SettingsHlsModule.click = function() {
	app.selectHost(SettingsHlsModule.link)
};

SettingsHlsModule.render = function(object) {
	var self = this,
		appHost = app.hosts[self.hostId],
		form = new Form(self.scope, object);

	form.input("Duration", "duration", "Segments duration in seconds. Default: 10");
	form.input("Quantity", "quantity", "Number of segments. Default: 3");

	form.choice("Segments naming", "naming", [
		{ value: "", label: "Default: PCR hash" },
		{ value: "seq", label: "Sequence"},
	]);

	form.checkbox("Round duration value", "round_duration");
	form.checkbox("Use Expires header", "expires_header");

	var defaultHeaders = {
		m3u8: [
			"Access-Control-Allow-Origin: *",
			"Access-Control-Allow-Methods: GET",
			"Access-Control-Allow-Credentials: true",
			"Content-Type: application/vnd.apple.mpegURL",
		],
		ts: [
			"Access-Control-Allow-Origin: *",
			"Access-Control-Allow-Methods: GET",
			"Access-Control-Allow-Credentials: true",
			"Content-Type: video/MP2T",
		],
	};

	var makeHeader = function(v) {
		var l = self.scope.get(v + "_headers");
		self.scope.set("$default_" + v + "_headers", !l);
		form.checkbox("Use default headers for ." + v, "$default_" + v + "_headers")
			.on("change", function() {
				var x = (this.checked) ? undefined : defaultHeaders[v];
				self.scope.set(v + "_headers", x);
				self.scope.reset();
			});
		if(!!l) {
			form.header(v + " Headers", "New Header", function() {
				l.push("");
				self.scope.reset();
				document.querySelector("[name=\"" + v + "_headers." + (l.length - 1) + "\"]").focus();
			});
			$.forEach(l, function(lv, k) {
				form.input("", v + "_headers." + k);
			});
		}
	};

	form.hr();
	makeHeader("m3u8");
	form.hr();
	makeHeader("ts");

	form.hr();

	var serialize = function() {
		var data = self.scope.serialize();
		$.forEach(["m3u8_headers", "ts_headers"], function(v) {
			var a = data[v];
			if(a) {
				for(var i = 0; i < a.length; ) {
					if(!a[i]) a.splice(i, 1);
					else i++;
				}
				if(!a.length) delete(data[v]);
			}
		});
		return data;
	};

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() {
			appHost.request({
				cmd: "set-config",
				key: "hls",
				data: serialize(),
			}, function(data) {
				//
			}, function() {
				$.err({ title: "Failed to save settings" });
			});
		});

	form.submit().addChild(btnApply);
};

SettingsHlsModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var hostId = location.hash.slice(SettingsHlsModule.link.length + 1).split("/");
	if(!hostId || !app.hosts[hostId]) { $.route(StreamsModule.link); return }
	var scope = $.clone(app.hosts[hostId].config.hls) || {};
	$.body.hostId = hostId;

	window.renderContent = SettingsHlsModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete($.body.hostId);
			delete(window.renderContent);
		});
};

app.modules.push(SettingsHlsModule);
app.settings.push(SettingsHlsModule);
})();

/* settings-http-play.js */

(function() {
"use strict";

var SettingsHttpPlayModule = {
	label: "HTTP Play",
	link: "#/settings-http-play",
	order: 7,
};

SettingsHttpPlayModule.render = function(object) {
	var self = this,
		masterHost = app.hosts[location.host],
		form = new Form(self.scope, object);

	form.checkbox("Allow HTTP access to all streams", "http_play_stream");
	//form.checkbox("Allow HLS access to all streams", "http_play_hls");
	form.group().setHtml("<a href=\"/playlist.m3u\" target=\"_blank\">playlist.m3u</a>");

	form.hr();

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() {
			masterHost.request({
				cmd: "set-settings",
				settings: self.scope.serialize(),
			}, function(data) {
				//
			}, function() {
				$.err({ title: "Failed to save settings" });
			});
		});

	form.submit().addChild(btnApply);
};

SettingsHttpPlayModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	window.renderContent = SettingsHttpPlayModule.render;

	var masterHost = app.hosts[location.host];
	var scope = $.clone(masterHost.config.settings) || {};

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsHttpPlayModule);
app.settings.push(SettingsHttpPlayModule);
})();

/* settings-softcam.js */

(function() {
"use strict";

window.SettingsSoftcamModule = {
	label: "Softcam",
	link: "#/settings-softcam",
	order: 10,
};

SettingsSoftcamModule.click = function() {
	app.selectHost(SettingsSoftcamModule.link, "-")
};

SettingsSoftcamModule.run = function() {
	app.on("set-softcam", function(event) {
		var hostId = event.host,
			appHost = app.hosts[hostId],
			data = event.data;

		if(data.gid) appHost.config.gid = data.gid;
		var sl = appHost.config.softcam;
		var idx = (sl == undefined) ? -1 : sl.indexOfID(data.softcam.id);
		if(data.softcam.remove && !data.softcam.up) {
			$.msg({ title: "Softcam \"{0}\" removed".format(sl[idx].name) })
		}
		if(idx != -1) {
			sl.splice(idx, 1);
			if(!sl.length) delete(appHost.config.softcam);
		}
		if(!data.softcam.remove) {
			if(!sl) appHost.config.softcam = sl = [];
			sl.push(data.softcam);
			$.msg({ title: "Softcam \"{0}\" saved".format(data.softcam.name) });
		}
	});
};

SettingsSoftcamModule.renderTest = function(object) {
	var modal = this,
		form = new Form(modal.scope, object);

	form.input("CaID", "caid", "Testing...").addAttr("readonly");
	if(modal.scope.get("caid") != undefined) {
		form.input("AU", "au").addAttr("readonly");
		form.input("UA", "ua").addAttr("readonly");
		var idents = modal.scope.get("idents");
		if(idents) {
			form.header("Idents");
			$.forEach(idents, function(v, k) {
				form.input(v.id, "idents." + k + ".sa").addAttr("readonly")
			});
		}
	}

	var btnOk = $.element.button("Ok")
		.on("click", function() { modal.remove() });

	form.hr();
	form.submit().addChild(btnOk);
};

SettingsSoftcamModule.renderStreams = function(object) {
	var modal = this,
		softcamId = modal.scope.get("$softcamId"),
		hostId = modal.scope.get("$hostId"),
		appHost = app.hosts[hostId],
		form = new Form(modal.scope, object);

	var streams = [], allowedInputs = ["dvb","udp","rtp","http"];
	$.forEach(appHost.config.make_stream, function(s) {
		$.forEach(s.input, function(i, k) {
			i = parseUrl(i);
			if(allowedInputs.indexOf(i.format) != -1) streams.push({
				id: hostId + "/" + s.id,
				inputId: k,
				name: s.name + " #" + (k + 1),
				cam: (softcamId === i.cam),
			});
		})
	});

	streams.sort(function(a,b) { return a.name.localeCompare(b.name) });
	$.forEach(streams, function(v) {
		var x = form.checkbox(v.name, "")
			.on("change", function() {
				var s = $.clone(MainModule.streams[v.id].config),
					i = parseUrl(s.input[v.inputId]);
				if(this.checked) i.cam = softcamId;
				else delete(i.cam);
				s.input[v.inputId] = makeUrl(i);
				var id = v.id.split("/"),
					streamId = id.pop(),
					hostId = id.pop();
				app.hosts[hostId].request({
					cmd: "set-stream",
					id: streamId,
					stream: s,
				}, function() {
					//
				}, function() {
					$.err({ title: "Failed to save stream" });
				});
			});
		if(v.cam) x.checked = true;
	});

	var btnOk = $.element.button("Ok")
		.addClass("submit")
		.on("click", function() { modal.remove() });

	form.hr();
	form.submit().addChild(btnOk);
}

SettingsSoftcamModule.render = function(object) {
	var self = this,
		softcamId = self.scope.get("$softcamId"),
		hostId = self.scope.get("$hostId"),
		appHost = app.hosts[hostId],
		tabId = self.scope.get("$tab") || "",
		form = new Form(self.scope, object),
		type = self.scope.get("type");

	var softcamList = [
		{ value: "-", label: "New Softcam" },
		{ value: "", label: "---", disabled: true }
	];
	var softcamSortedList = [];
	$.forEach(appHost.config.softcam, function(i) {
		softcamSortedList.push({ value: i.id, label: i.name });
	});
	softcamSortedList.sort(function(a,b) { return a.label.localeCompare(b.label) });
	softcamList = softcamList.concat(softcamSortedList);
	form.choice("Softcam", "$softcamId", softcamList)
		.on("change", function() {
			if(this.value == "-") app.selectHost(SettingsSoftcamModule.link, "-");
			else $.route(SettingsSoftcamModule.link + "/" + hostId + "/" + this.value);
		});
	form.hr();

	form.tab("$tab", [
		{ label: "General", id: "" },
		{ label: "Advanced", id: "advanced" },
	]);

	if(tabId == "") {
		form.input("Name", "name", "SoftCAM Name").setRequired();
		var x = form.input("ID", "id", "Unique softcam identifier").addValidator(validateId);
		if(softcamId != "-") x.setRequired();
		form.choice("Protocol", "type", [{ value: "newcamd", label: "NewCAMd" }]);

		if(type == "newcamd") {
			form.input("Address", "host", "Domain or IP Address").setRequired();
			form.number("Port", "port", "Port").setRequired().addValidator(validatePort);

			form.input("Login", "user").setRequired();
			form.password("Password", "pass").setRequired();
		}
	}

	if(tabId == "advanced") {
		if(type == "newcamd") {
			form.input("DES Key", "key", "Default: 0102030405060708091011121314");
			form.input("CaID", "caid", "Change server CaID. Example: 06B0");
			form.number("Timeout", "timeout", "Default: 8 sec.");
		}

		form.checkbox("Make new connection for each input", "split_cam");

		form.checkbox("Allow EMM if allowed by the server", "disable_emm")
			.addAttr("data-true", "undefined")
			.addAttr("data-false", "true");

		form.checkbox("Use ECM response with valid checksum only", "ignore_cw")
			.addAttr("data-true", "undefined")
			.addAttr("data-false", "true");

		form.number("Skip ECM", "skip_ecm", "Ignore first ECM packets");
	}

	var serialize = function() {
		if(self.scope.get("$remove")) return { remove: true };

		var data = self.scope.serialize();
		if(!data.id) data.id = appHost.makeUid("softcam");

		return data;
	}

	form.hr();

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() {
			if(!self.scope.get("$remove") && !self.scope.validate()) {
				$.err({ title: "Form has errors" });
				return;
			}
			var softcam = serialize();
			appHost.request({
				cmd: "set-softcam",
				gid: appHost.config.gid,
				id: softcamId,
				softcam: softcam,
			}, function() {
				if(softcam.remove) {
					app.selectHost(SettingsSoftcamModule.link, "-");
				} else if(softcamId != softcam.id) {
					$.route(SettingsSoftcamModule.link + "/" + hostId + "/" + softcam.id);
				} else {
					self.scope.reset();
				}
			}, function() {
				$.err({ title: "Failed to save softcam" });
			});
		});

	var btnTest = $.element.button("Test")
		.on("click", function() {
			if(!self.scope.validate()) {
				$.err({ title: "Form has errors" });
				return;
			}
			var modal = $.modal()
				.addChild($.element("div")
					.dataRender("SettingsSoftcamModule.renderTest"))
				.bindScope({});
			appHost.request({
				cmd: "test-softcam",
				config: serialize(),
			}, function(response) {
				var data = response.data;

				if(data.error) {
					modal.remove();
					$.err({ title: "Softcam test failed", text: data.error });
				} else {
					data.info.caid = data.info.caid.toHex(4);
					data.info.au = (data.info.au) ? "YES" : "NO";
					modal.scope.reset(data.info);
				}
			}, function() {
				modal.remove();
				$.err({ title: "Softcam test failed" });
			});
		});

	var btnClone = $.element.button("Clone")
		.on("click", function() {
			var data = self.scope.serialize();
			data.name = (data.name || "") + " (clone)";
			if(data.id != undefined) delete(data.id);
			SettingsSoftcamModule.softcamClone = data;
			app.selectHost(SettingsSoftcamModule.link, "-");
		});

	var btnStreams = $.element.button("Streams")
		.on("click", function() {
			$.modal()
				.addChild($.element("div")
					.dataRender("SettingsSoftcamModule.renderStreams"))
				.bindScope({
					$softcamId: softcamId,
					$hostId: hostId,
				});
		});

	if(softcamId != "-") {
		if(tabId == "") {
			form.checkbox("Remove Softcam", "$remove")
				.setDanger()
				.on("change", function() {
					if(this.checked)
						btnApply.removeClass("submit").addClass("danger");
					else
						btnApply.removeClass("danger").addClass("submit");
				});
		}
	} else {
		btnClone.setDisabled(true);
		btnStreams.setDisabled(true);
	}

	form.submit().addChild(btnApply, btnTest, btnClone, btnStreams);
};

SettingsSoftcamModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var scope,
		x = location.hash.slice(SettingsSoftcamModule.link.length + 1).split("/"),
		softcamId = x.pop(),
		hostId = x.pop(),
		appHost = app.hosts[hostId];

	if(!appHost) { $.route(StreamsModule.link); return }

	if(softcamId == "-") {
		if(SettingsSoftcamModule.softcamClone) {
			scope = SettingsSoftcamModule.softcamClone;
			delete(SettingsSoftcamModule.softcamClone);
		} else {
			scope = { "name": "", "type": "newcamd" };
		}
	} else {
		var idx = (appHost.config.softcam) ? appHost.config.softcam.indexOfID(softcamId) : -1;
		if(idx == -1) { $.route(SettingsSoftcamModule.link); return }
		scope = $.clone(appHost.config.softcam[idx]);
	}

	scope.$softcamId = softcamId;
	scope.$hostId = hostId;

	window.renderContent = SettingsSoftcamModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsSoftcamModule);
app.settings.push(SettingsSoftcamModule);
})();

/* settings-cas.js */

(function() {
"use strict";

window.SettingsCasModule = {
	label: "CAS",
	link: "#/settings-cas",
	order: 11,
};

SettingsCasModule.click = function() {
	app.selectHost(SettingsCasModule.link, "-")
};

SettingsCasModule.run = function() {
	app.on("set-cas", function(event) {
		var hostId = event.host,
			appHost = app.hosts[hostId],
			data = event.data;

		if(data.gid) appHost.config.gid = data.gid;
		var sl = appHost.config.cas;
		var idx = (sl == undefined) ? -1 : sl.indexOfID(data.cas.id);
		if(data.cas.remove && !data.cas.up) {
			$.msg({ title: "CAS \"{0}\" removed".format(sl[idx].name) })
		}
		if(idx != -1) {
			sl.splice(idx, 1);
			if(!sl.length) delete(appHost.config.cas);
		}
		if(!data.cas.remove) {
			if(!sl) appHost.config.cas = sl = [];
			sl.push(data.cas);
			$.msg({ title: "CAS \"{0}\" saved".format(data.cas.name) });
		}
	});
};

SettingsCasModule.render = function(object) {
	var self = this,
		casId = self.scope.get("$casId"),
		hostId = self.scope.get("$hostId"),
		appHost = app.hosts[hostId],
		form = new Form(self.scope, object),
		advanced = self.scope.get("$advanced") == true;

	var casList = [
		{ value: "-", label: "New CAS" },
		{ value: "", label: "---", disabled: true }
	];
	var casSortedList = [];
	$.forEach(appHost.config.cas, function(i) {
		casSortedList.push({ value: i.id, label: i.name });
	});
	casSortedList.sort(function(a,b) { return a.label.localeCompare(b.label) });
	casList = casList.concat(casSortedList);
	form.choice("CAS", "$casId", casList)
		.on("change", function() {
			if(this.value == "-") app.selectHost(SettingsCasModule.link, "-");
			else $.route(SettingsCasModule.link + "/" + hostId + "/" + this.value);
		});
	form.hr();

	form.input("Name", "name", "CAS Name").setRequired();
	form.input("Super CAS ID (hex)", "super_cas_id", "00000000")
		.setRequired()
		.addValidator(validateHex)
		.addValidator(function(value) {
			return (!value || value.length == 8);
		});

	form.hr();

	form.input("ECMG Channel ID", "ecmg_channel_id")
		.setRequired()
		.addValidator(validatePort);
	form.input("ECMG Address", "ecmg_host")
		.setRequired();
	form.input("ECMG Port", "ecmg_port")
		.setRequired()
		.addValidator(validatePort);
	form.input("Crypto Period", "ecmg_cp")
		.setRequired();

	form.hr();

	form.choice("EMMG Protocol", "emmg_protocol", [
		{ value: "", label: "Default: TCP" },
		{ value: "udp", label: "UDP", disabled: true }
	]);
	form.number("EMMG Port", "emmg_port")
		.addValidator(validatePort);
	form.number("EMM PID", "emm_pid")
		.setRequired()
		.addValidator(validatePid);
	form.input("EMM Private Data (hex)", "emm_data")
		.addValidator(validateHex);

	form.hr();

	var serialize = function() {
		if(self.scope.get("$remove")) return { remove: true };

		var data = self.scope.serialize();
		if(!data.id) data.id = appHost.makeUid("cas");

		return data;
	}

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() {
			if(!self.scope.get("$remove") && !self.scope.validate()) {
				$.err({ title: "Form has errors" });
				return;
			}
			var cas = serialize();
			appHost.request({
				cmd: "set-cas",
				gid: appHost.config.gid,
				id: casId,
				cas: cas,
			}, function() {
				if(cas.remove) {
					app.selectHost(SettingsCasModule.link, "-");
				} else if(casId != cas.id) {
					$.route(SettingsCasModule.link + "/" + hostId + "/" + cas.id);
				} else {
					self.scope.reset();
				}
			}, function() {
				$.err({ title: "Failed to save CAS" });
			});
		});

	if(casId != "-") {
		form.checkbox("Remove", "$remove")
			.setDanger()
			.on("change", function() {
				if(this.checked)
					btnApply.removeClass("submit").addClass("danger");
				else
					btnApply.removeClass("danger").addClass("submit");
			});
	}

	form.submit().addChild(btnApply);
};

/*___           _____ ______
|  _ \   /\    / ____|  ____|
| |_) | /  \  | (___ | |__
|  _ < / /\ \  \___ \|  __|
| |_) / ____ \ ____) | |____
|____/_/    \_\_____/|_____*/

SettingsCasModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var scope,
		x = location.hash.slice(SettingsCasModule.link.length + 1).split("/"),
		casId = x.pop(),
		hostId = x.pop(),
		appHost = app.hosts[hostId];

	if(!appHost) { $.route(StreamsModule.link); return }

	if(casId == "-") {
		scope = { "name": "" };
	} else {
		var idx = (appHost.config.cas) ? appHost.config.cas.indexOfID(casId) : -1;
		if(idx == -1) { $.route(SettingsCasModule.link); return }
		scope = $.clone(appHost.config.cas[idx]);
	}

	scope.$casId = casId;
	scope.$hostId = hostId;
	window.renderContent = SettingsCasModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsCasModule);
app.settings.push(SettingsCasModule);
})();

/* settings-groups.js */

(function() {
"use strict";

window.SettingsGroupsModule = {
	label: "Groups",
	link: "#/settings-groups",
	order: 20,
};

SettingsGroupsModule.run = function() {
	app.on("set-category", function(event) {
		var masterHost = app.hosts[location.host],
			data = event.data;

		if(data.category.remove) {
			var n = masterHost.config.categories[data.id].name;
			$.msg({ title: "Category \"{0}\" removed".format(n) });
			masterHost.config.categories.splice(data.id, 1);
			if(!masterHost.config.categories.length) delete(masterHost.config.categories);
		} else {
			if(data.id != undefined) {
				masterHost.config.categories[data.id] = data.category;
			}else {
				if(!masterHost.config.categories) masterHost.config.categories = [];
				masterHost.config.categories.push(data.category);
			}
			$.msg({ title: "Category \"{0}\" saved".format(data.category.name) });
		}
	});
};

/*_____ _______ _____  ______          __  __  _____
 / ____|__   __|  __ \|  ____|   /\   |  \/  |/ ____|
| (___    | |  | |__) | |__     /  \  | \  / | (___
 \___ \   | |  |  _  /|  __|   / /\ \ | |\/| |\___ \
 ____) |  | |  | | \ \| |____ / ____ \| |  | |____) |
|_____/   |_|  |_|  \_\______/_/    \_\_|  |_|____*/

SettingsGroupsModule.renderStreams = function(object) {
	var modal = this,
		form = new Form(modal.scope, object),
		category = modal.scope.get("category"),
		group = modal.scope.get("group");

	if(group == "") group = undefined;

	form.header(category);
	form.choice("", "group", modal.scope.get("groups"))
		.on("change", function() {
			modal.scope.reset();
		});
	form.hr();

	var streams = [];
	$.forEach(MainModule.streams, function(v, k) {
		var g;
		if(v.config.groups) g = v.config.groups[category];
		streams.push({ id: k, name: v.config.name, group: g == group });
	});
	streams.sort(function(a,b) { return a.name.localeCompare(b.name) });
	$.forEach(streams, function(v) {
		var x = form.checkbox(v.name, "");
		if(v.group) x.checked = true;
		x.on("change", function() {
			var s = $.clone(MainModule.streams[v.id].config)
			if(this.checked == false) {
				if(!group) {
					this.checked = true;
					return;
				} else {
					delete(s.groups[category]);
					if($.isObjectEmpty(s.groups)) delete(s.groups);
				}
			} else {
				if(!group) {
					delete(s.groups[category]);
					if($.isObjectEmpty(s.groups)) delete(s.groups);
				} else {
					if(!s.groups) s.groups = {};
					s.groups[category] = group;
				}
			}
			var id = v.id.split("/"),
				streamId = id.pop(),
				hostId = id.pop(),
				appHost = app.hosts[hostId];
			appHost.request({
				cmd: "set-stream",
				id: streamId,
				stream: s,
			}, function() {
				//
			}, function() {
				$.err({ title: "Failed to save stream" });
			});
		});
	});

	var btnOk = $.element.button("Ok")
		.addClass("submit")
		.on("click", function() { modal.remove() });

	form.hr();
	form.submit().addChild(btnOk);
}

/*_____ ____  _   _ ______
 / ____/ __ \| \ | |  ____|
| |   | |  | |  \| | |__
| |   | |  | | . ` |  __|
| |___| |__| | |\  | |
 \_____\____/|_| \_|*/

SettingsGroupsModule.render = function(object) {
	var self = this,
		categoryId = self.scope.get("$categoryId"),
		masterHost = app.hosts[location.host],
		form = new Form(self.scope, object);

	var categoriesList = [
		{ value: "-", label: "New Category" },
		{ value: "", label: "---", disabled: true }
	];
	var categoriesSortedList = [];
	$.forEach(masterHost.config.categories, function(i,k) {
		categoriesSortedList.push({ value: k, label: i.name });
	});
	categoriesSortedList.sort(function(a,b) { return a.label.localeCompare(b.label) });
	categoriesList = categoriesList.concat(categoriesSortedList);
	form.choice("Category", "$categoryId", categoriesList)
		.on("change", function() {
			$.route(SettingsGroupsModule.link + "/" + this.value);
		});
	form.hr();

	form.input("Name", "name", "Category Name").setRequired();

	form.header("Groups", "Add Group", function() {
		var groups = self.scope.get("groups");
		if(!groups) {
			groups = [];
			self.scope.set("groups", groups);
		}
		groups.push({ name: "" });
		self.scope.reset();
	});

	$.forEach(self.scope.get("groups"), function(v, k) {
		if(v.name != undefined) form.input("", "groups." + k + ".name", "Group Name");
	});

/*    _____ _    _ ____  __  __ _____ _______
     / ____| |  | |  _ \|  \/  |_   _|__   __|
    | (___ | |  | | |_) | \  / | | |    | |
     \___ \| |  | |  _ <| |\/| | | |    | |
     ____) | |__| | |_) | |  | |_| |_   | |
    |_____/ \____/|____/|_|  |_|_____|  |*/

	form.hr();

	var serialize = function() {
		if(self.scope.get("$remove")) return { remove: true };

		var data = self.scope.serialize();

		$.forEach(data.groups, function(g) {
			if(!g.name) {
				g.remove = true;
				delete(g.name);
			}
		});

		// TODO: clean groups

		return data;
	}

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() {
			var category = serialize();
			masterHost.request({
				cmd: "set-category",
				id: (categoryId != "-") ? categoryId : undefined,
				category: category,
			}, function(data) {
				if(category.remove) {
					$.route(SettingsGroupsModule.link);
				} else if(categoryId == "-") {
					var i = masterHost.config.categories.length - 1;
					$.route(SettingsGroupsModule.link + "/" + i);
				} else {
					self.scope.reset();
				}
			}, function() {
				$.err({ title: "Failed to save category" });
			});
		});

	var btnStreams = $.element.button("Streams")
		.setDisabled(true)
		.on("click", function() {
			var category = masterHost.config.categories[categoryId];
			var modalData = { category: category.name, groups: [{ value: "", label: "No Group" }, { value: "", label: "---", disabled: true }] };
			$.forEach(category.groups, function(v) { modalData.groups.push({ value: v.name }) });
			$.modal()
				.addChild($.element("div")
					.dataRender("SettingsGroupsModule.renderStreams"))
				.bindScope(modalData);
		});

	if(categoryId != "-") {
		btnStreams.setDisabled(false);

		form.checkbox("Remove Category", "$remove")
			.setDanger()
			.on("change", function() {
				if(this.checked)
					btnApply.removeClass("submit").addClass("danger");
				else
					btnApply.removeClass("danger").addClass("submit");
			});
	}

	form.submit().addChild(btnApply, btnStreams);
};

/*___           _____ ______
|  _ \   /\    / ____|  ____|
| |_) | /  \  | (___ | |__
|  _ < / /\ \  \___ \|  __|
| |_) / ____ \ ____) | |____
|____/_/    \_\_____/|_____*/

SettingsGroupsModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var scope,
		categoryId = location.hash.slice(SettingsGroupsModule.link.length + 1);

	if(!categoryId) { $.route(SettingsGroupsModule.link + "/-"); return }

	if(categoryId == "-") {
		scope = { "name": "", "groups": [{ name: "" }] };
	} else {
		var masterHost = app.hosts[location.host];
		categoryId = Number(categoryId);
		scope = $.clone(masterHost.config.categories[categoryId]);
		if(!scope) { $.route(SettingsGroupsModule.link); return }
		if(!scope.groups || !scope.groups.length) scope.groups = [{ name: "" }];
	}

	scope.$categoryId = categoryId;
	window.renderContent = SettingsGroupsModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsGroupsModule);
app.settings.push(SettingsGroupsModule);
})();

/* settings-servers.js */

(function() {
"use strict";

window.SettingsServersModule = {
	label: "Servers",
	link: "#/settings-servers",
	order: 15,
};

SettingsServersModule.run = function() {
	app.on("set-server", function(event) {
		var masterHost = app.hosts[location.host],
			data = event.data;

		if(data.server.remove) {
			var s = masterHost.config.servers[data.id];
			app.removeHost(s);
			$.msg({ title: "Server \"{0}\" removed".format(s.name) });
			masterHost.config.servers.splice(data.id, 1);
			if(!masterHost.config.servers.length) delete(masterHost.config.servers);
		} else {
			if(data.id != undefined) {
				app.removeHost(masterHost.config.servers[data.id]);
				masterHost.config.servers[data.id] = data.server;
			}else {
				if(!masterHost.config.servers) masterHost.config.servers = [];
				masterHost.config.servers.push(data.server);
			}
			app.addHost(data.server);
			$.msg({ title: "Server \"{0}\" saved".format(data.server.name) });
		}
	});
};

/*______ ______  _____ _______
|__   __|  ____|/ ____|__   __|
   | |  | |__  | (___    | |
   | |  |  __|  \___ \   | |
   | |  | |____ ____) |  | |
   |_|  |______|_____/   |*/

SettingsServersModule.renderTest = function(object) {
	var modal = this,
		form = new Form(modal.scope, object);

	form.input("Version", "version", "Testing...").addAttr("readonly");

	var btnOk = $.element.button("Ok")
		.on("click", function() { modal.remove() });

	form.hr();
	form.submit().addChild(btnOk);
};

/*_____ ____  _   _ ______
 / ____/ __ \| \ | |  ____|
| |   | |  | |  \| | |__
| |   | |  | | . ` |  __|
| |___| |__| | |\  | |
 \_____\____/|_| \_|*/

SettingsServersModule.render = function(object) {
	var self = this,
		serverId = self.scope.get("$serverId"),
		masterHost = app.hosts[location.host],
		form = new Form(self.scope, object);

	var serversList = [
		{ value: "-", label: "New Server" },
		{ value: "", label: "---", disabled: true }
	];
	var sortedList = { streamer: [], transcoder: [], relay: [] };
	$.forEach(masterHost.config.servers, function(s, i) {
		sortedList[s.type].push({ value: i, label: s.name })
	});
	$.forEach(sortedList, function(sl) {
		sl.sort(function(a,b) { return a.label.localeCompare(b.label) })
	});
	if(sortedList.streamer.length) serversList.push({ group: "Streamers", items: sortedList.streamer });
	if(sortedList.transcoder.length) serversList.push({ group: "Transcoders", items: sortedList.transcoder });
	if(sortedList.relay.length) serversList.push({ group: "Relays", items: sortedList.relay });
	form.choice("Server", "$serverId", serversList)
		.on("change", function() {
			$.route(SettingsServersModule.link + "/" + this.value);
		});
	form.hr();

	form.input("Name", "name", "Server Name").setRequired();
	form.choice("Type", "type", [
		{ value: "streamer", label: "Streamer" },
		{ value: "transcoder", label: "Transcoder", disabled: true },
		{ value: "relay", label: "Relay", disabled: true },
	]);

	form.input("Address", "host", "Domain or IP Address").setRequired();
	form.number("Port", "port", "Port").setRequired().addValidator(validatePort);

	var maskPass = function(p) {
		var pm = (!p) ? "" : ((new Array(p.length + 1)).join("*"));
		self.scope.set("$maskPass", pm);
	};
	maskPass(self.scope.get("pass"));

	form.input("Login", "user");
	form.input("Password", "$maskPass")
		.on("focus", function() {
			self.scope.set("$maskPass", self.scope.get("pass") || "");
		})
		.on("blur", function() {
			self.scope.set("pass", this.value);
			maskPass(this.value);
		});

/*    _____ _    _ ____  __  __ _____ _______
     / ____| |  | |  _ \|  \/  |_   _|__   __|
    | (___ | |  | | |_) | \  / | | |    | |
     \___ \| |  | |  _ <| |\/| | | |    | |
     ____) | |__| | |_) | |  | |_| |_   | |
    |_____/ \____/|____/|_|  |_|_____|  |*/

	form.hr();

	var serialize = function() {
		if(self.scope.get("$remove")) return { remove: true };
		else return self.scope.serialize();
	}

	var btnApply = $.element.button("Apply")
		.addClass("submit")
		.on("click", function() {
			if(!self.scope.get("$remove") && !self.scope.validate()) {
				$.err({ title: "Form has errors" });
				return;
			}
			var server = serialize();
			masterHost.request({
				cmd: "set-server",
				id: (serverId != "-") ? serverId : undefined,
				server: server,
			}, function(data) {
				if(server.remove) {
					$.route(SettingsServersModule.link);
				} else if(serverId == "-") {
					var i = masterHost.config.servers.length - 1;
					$.route(SettingsServersModule.link + "/" + i);
				} else {
					self.scope.reset();
				}
			}, function() {
				$.err({ title: "Failed to save server" });
			});
		});

	var btnTest = $.element.button("Test")
		.on("click", function() {
			if(!self.scope.validate()) {
				$.err({ title: "Form has errors" });
				return;
			}
			var modal = $.modal()
				.addChild($.element("div")
					.dataRender("SettingsServersModule.renderTest"))
				.bindScope({});

			var data = self.scope.serialize();
			var headers = {};
			if(data.user) {
				var token = data.user;
				if(data.pass) token += ":" + data.pass;
				headers["Authorization"] = "Basic " + $.base64Encode(token);
			}

			$.http({
				method: "POST",
				url: "http://" + data.host + ":" + data.port + "/control/",
				data: JSON.stringify({ cmd: "version" }),
				headers: headers,
			}, function(response) {
				var data = JSON.parse(response.text);
				data.version = "Astra " + data.version;
				modal.scope.reset(data);
			}, function(response) {
				modal.remove();
				$.err({ title: "Failed to test server" });
			});
		});

	if(serverId != "-") {
		form.checkbox("Remove Server", "$remove")
			.setDanger()
			.on("change", function() {
				if(this.checked)
					btnApply.removeClass("submit").addClass("danger");
				else
					btnApply.removeClass("danger").addClass("submit");
			});
	}

	form.submit().addChild(btnApply, btnTest);
};

/*___           _____ ______
|  _ \   /\    / ____|  ____|
| |_) | /  \  | (___ | |__
|  _ < / /\ \  \___ \|  __|
| |_) / ____ \ ____) | |____
|____/_/    \_\_____/|_____*/

SettingsServersModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var scope,
		serverId = location.hash.slice(SettingsServersModule.link.length + 1);

	if(!serverId) { $.route(SettingsServersModule.link + "/-"); return }

	if(serverId == "-") {
		scope = { "name": "", "type": "streamer" };
	} else {
		var masterHost = app.hosts[location.host];
		serverId = Number(serverId);
		scope = $.clone(masterHost.config.servers[serverId]);
		if(!scope) { $.route(SettingsServersModule.link); return }
	}

	scope.$serverId = serverId;
	window.renderContent = SettingsServersModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsServersModule);
app.settings.push(SettingsServersModule);
})();

/* settings-theme.js */

(function() {
"use strict";

var SettingsThemeModule = {
	label: "Theme",
	order: 80,
};

SettingsThemeModule.click = function() {
	var modal = $.modal();
	var theme = app.getTheme() || "";
	modal.addClass("main-menu");
	$.forEach(app.themes, function(item) {
		var x = $.element("a")
			.setText(item.label)
			.addAttr("href", "#");
		if(theme == item.value) x.addClass("active");
		x.on("click", function(event) {
			event.preventDefault();
			modal.remove();
			app.setTheme(item.value)
		});
		modal.addChild(x);
	})
	modal.addChild($.element("hr"));
	modal.addChild($.element("a")
		.setText("Cancel")
		.addClass("text-center")
		.addAttr("href", "#/")
		.on("click", function(event) {
			event.preventDefault();
			modal.remove();
		}));
};

app.modules.push(SettingsThemeModule);
app.settings.push(SettingsThemeModule);
})();

/* settings-import.js */

(function() {
"use strict";

var SettingsImportModule = {
	label: "Import",
	link: "#/settings-import",
	order: 90,
};

SettingsImportModule.click = function() {
	app.selectHost(SettingsImportModule.link)
};

SettingsImportModule.render = function(object) {
	var self = this,
		hostId = self.scope.get("$hostId"),
		appHost = app.hosts[hostId];

	var wrap = $.element("div")
		.addClass("settings-edit");
	object.addChild(wrap);

	var text = $.element("textarea")
		.addClass("input monospace")
		.addAttr("placeholder", "Paste here Astra Script (any version) or JSON configuration")
		.addAttr("tabindex", "0")
		.on("keydown", function(event) {
			switch(event.keyCode) {
				case 9:
					event.preventDefault();
					document.execCommand("insertText", false, "    ");
					break;
				// case 13:
				// 	event.preventDefault();
				// 	document.execCommand("insertText", false, "\n");
				// 	break;
			}
		});

	var btnImport = $.element.button("Import")
		.addClass("submit")
		.on("click", function() {
			appHost.request({
				cmd: "import",
				gid: appHost.config.gid,
				data: text.value,
			}, function(response) {
				var data = response.data;

				if(data.error) {
					$.err({ title: "Import failed", text: data.error, delay: 5 });
					return;
				}

				var c = appHost.config;
				c.gid = data.gid;

				if(data.dvb_tune) {
					if(!c.dvb_tune) c.dvb_tune = [];
					c.dvb_tune = c.dvb_tune.concat(data.dvb_tune);
				}

				if(data.softcam) {
					if(!c.softcam) c.softcam = [];
					c.softcam = c.softcam.concat(data.softcam);
				}

				if(data.make_stream) {
					if(!c.make_stream) c.make_stream = [];
					c.make_stream = c.make_stream.concat(data.make_stream);
				}

				MainModule.removeHost(hostId);
				MainModule.addHost(hostId);

				var x = $.msg({
					title: appHost.name,
					text: "Press \"Apply & Restart\" button to complete import or Reload page to discard changes",
					delay: -1
				});
				x.addChild($.element()
					.addClass("row")
					.addChild($.element.button("Apply & Restart")
						.addClass("col-4")
						.on("click", function(event) {
							event.target.setDisabled(true);
							appHost.upload(function(success) {
								if(success) x.remove();
								else event.target.setDisabled(false);
							});
						})));
			}, function() {
				$.err({ title: "Failed to import settings" });
			});
		});

	var submit = $.element("div")
		.addClass("form-submit")
		.addChild(btnImport);

	wrap.addChild(text, submit);

	self.on("ready", function() {
		text.focus();
	});
};

SettingsImportModule.init = function() {
	if($.body.scope) $.body.scope.destroy();


	var hostId = location.hash.slice(SettingsImportModule.link.length + 1);

	if(!app.hosts[hostId]) { $.route(SettingsModule.link); return }

	var scope = {};
	scope.$hostId = hostId;
	window.renderContent = SettingsImportModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsImportModule);
app.settings.push(SettingsImportModule);
})();

/* settings-edit.js */

(function() {
"use strict";

var SettingsEditModule = {
	label: "Edit Config",
	link: "#/settings-edit",
	order: 91,
};

SettingsEditModule.click = function() {
	app.selectHost(SettingsEditModule.link)
};

SettingsEditModule.render = function(object) {
	var self = this,
		hostId = self.scope.get("$hostId"),
		appHost = app.hosts[hostId];

	var wrap = $.element("div")
		.addClass("settings-edit");
	object.addChild(wrap);

	var text = $.element("textarea")
		.addClass("input monospace")
		.addAttr("tabindex", "0")
		.on("keydown", function(event) {
			switch(event.keyCode) {
				case 9:
					event.preventDefault();
					document.execCommand("insertText", false, "    ");
					break;
				// case 13:
				// 	event.preventDefault();
				// 	document.execCommand("insertText", false, "\n");
				// 	break;
			}
		});

	var btnSave = $.element.button("Save")
		.addClass("danger")
		.on("click", function() {
			appHost.request({
				cmd: "import",
				gid: appHost.config.gid,
				data: text.value,
			}, function() {
				try {
					var r = JSON.parse(text.value || "{}");
					appHost.config = r;
				} catch(e) {
					$.err({ title: "Error", text: e.toString() });
					return;
				}

				MainModule.removeHost(hostId);
				MainModule.addHost(hostId);

				var x = $.msg({
					title: appHost.name,
					text: "Press \"Apply & Restart\" button to complete export or Reload page to discard changes",
					delay: -1,
				});
				x.addChild($.element()
					.addClass("row")
					.addChild($.element.button("Apply & Restart")
						.addClass("col-4")
						.on("click", function(event) {
							event.target.setDisabled(true);
							appHost.upload(function(success) {
								if(success) x.remove();
								else event.target.setDisabled(false);
							});
						})));
			}, function() {
				$.err({ title: "Failed to save settings" });
			});
		});

	var submit = $.element("div")
		.addClass("form-submit")
		.addChild(btnSave);

	wrap.addChild(text, submit);

	self.on("ready", function() {
		text.textContent = JSON.stringify($.clone(appHost.config), null, 4);
		text.setSelectionRange(0, 0);
		text.focus();
	});
};

SettingsEditModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var hostId = location.hash.slice(SettingsEditModule.link.length + 1),
		appHost = app.hosts[hostId];

	if(!appHost) { $.route(SettingsModule.link); return }

	var scope = {
		$hostId: hostId,
	};
	window.renderContent = SettingsEditModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(SettingsEditModule);
app.settings.push(SettingsEditModule);
})();

/* settings-restart.js */

(function() {
"use strict";

var SettingsRestartModule = {
	label: "Restart",
	order: 99,
};

SettingsRestartModule.click = function() {
	var modal = $.modal();
	modal.addClass("main-menu");
	$.forEach(app.hosts, function(appHost, hostId) {
		var x = $.element("a")
			.setText(appHost.name)
			.addAttr("href", "#");
		x.on("click", function(event) {
			event.preventDefault();
			modal.remove();
			appHost.restart();
		});
		modal.addChild(x);
	})
	modal.addChild($.element("hr"));
	modal.addChild($.element("a")
		.setText("Cancel")
		.addClass("text-center")
		.addAttr("href", "#/")
		.on("click", function(event) {
			event.preventDefault();
			modal.remove();
		}));
};

app.modules.push(SettingsRestartModule);
app.settings.push(SettingsRestartModule);
})();

/* log.js */

(function() {
"use strict";

window.LogModule = {
	label: "Log",
	link: "#/log",
	order: 9,
	search: true,
};

LogModule.run = function() {
	LogModule.inner = $.element("div").addClass("log monospace");

	LogModule.log = [];
	LogModule.logSkip = 0;
	LogModule.isReady = false;

	var appHost = app.hosts[location.host]; // TODO: all streamers

	appHost.request({
		cmd: "log"
	}, function(response) {
		var data = response.data;

		if(data.log) {
			var logData = [];
			Array.prototype.push.apply(logData, data.log);
			Array.prototype.push.apply(logData, LogModule.log);
			if(logData.length > 2000) logData.splice(0, logData.length - 2000);
			LogModule.log = logData;
			LogModule.logSkip = 0;
		}
		LogModule.isReady = true;
	});

	app.on("log_event", function(event) {
		if(event.data.log) {
			Array.prototype.push.apply(LogModule.log, event.data.log);
			if(LogModule.log.length > 2000) {
				var drop = LogModule.log.length - 2000;
				LogModule.log.splice(0, drop);
				LogModule.logSkip = Math.max(0, LogModule.logSkip - drop);
			}
		}
		if(event.data.set) {
			appHost.sysinfo.log = event.data.set;
			// TODO: setLogLevel
		}
	});
};

LogModule.render = function(object) {
	var self = this,
		appHost = app.hosts[location.host];

	var levelCheckbox = function(title, bind) {
		return $.element("label")
			.addClass("checkbox")
			.addChild($.element("input")
				.addAttr("type", "checkbox")
				.dataBind(bind)
				.on("change", function(event) {
					var v = event.target.checked,
						s = {};
					s[bind] = v;
					appHost.request({
						cmd: "set-log",
						set: s
					}, function(response) {
						appHost.sysinfo.log[bind] = response.data[bind];
					}, function() {
						self.set(bind, !v);
					});
				}))
			.addChild($.element("span").addClass("inner"))
			.addChild(title);
	};

	var logClear = function() {
		LogModule.inner.empty();
		LogModule.log = [];
		LogModule.logSkip = 0;
	}

	object
		.addChild(LogModule.inner)
		.addChild($.element("div")
			.addClass("log-footer row")
			.addChild(levelCheckbox("Debug", "debug"))
			.addChild(levelCheckbox("Info", "info"))
			.addChild($.element("div").addClass("col-expand"))
			.addChild($.element.button("Clear").on("click", logClear)));

	var search = "";
	var autoScroll = true;

	var logGrep = function(tail) {
		var il = LogModule.inner.childNodes,
			l = il.length,
			i = (!tail) ? 0 : l - tail;
		for(; i < l; ++i) {
			var e = il[i].removeClass("hide");
			if(search && e.lastChild.textContent.toLowerCase().indexOf(search) == -1) e.addClass("hide");
		}
		if(autoScroll) window.scrollTo(0, $.body.scrollHeight);
	};

	var logLimit = 2000;
	var stepLimit = 100;

	var dateFormat = function(d) {
		d = new Date(d);
		var dd = ("0" + d.getDate()).slice(-2);
		var dm = monthMap[d.getMonth()];
		var th = ("0" + d.getHours()).slice(-2);
		var tm = ("0" + d.getMinutes()).slice(-2);
		var ts = ("0" + d.getSeconds()).slice(-2);
		return dm + " " + dd + " " + th + ":" + tm + ":" + ts;
	};

	var makeItem = function(e) {
		var li = $.element("div").addClass("log-item log-" + e.type);
		var ld = $.element("div").addClass("log-time").setText(dateFormat(e.time * 1000));
		var lt = $.element("div").addClass("log-text").setText(e.text);
		li.addChild(ld).addChild(lt);
		LogModule.inner.addChild(li);
		if(LogModule.inner.childNodes.length > logLimit) LogModule.inner.firstChild.remove();
	};

	var cacheTimeout = null;

	var cacheUpdate = function() {
		if(!LogModule.isReady) {
			cacheTimeout = setTimeout(cacheUpdate, 200);
			return;
		}

		if(LogModule.logSkip == LogModule.log.length) {
			cacheTimeout = setTimeout(cacheUpdate, 1000);
			return;
		}

		var ds = Math.min(LogModule.log.length - LogModule.logSkip, stepLimit);
		var dc = LogModule.logSkip + ds;
		for(var i = LogModule.logSkip; i < dc; ++i) makeItem(LogModule.log[i]);
		LogModule.logSkip += ds;
		logGrep(ds);

		cacheTimeout = setTimeout(cacheUpdate, 50);
	};
	cacheUpdate();
	logGrep();

	app.search = function(value) {
		search = value || "";
		search = search.toLowerCase();
		if(!search) autoScroll = true;
		logGrep();
	};

	var autoScrollCheck = function() {
		autoScroll = (window.innerHeight + window.scrollY >= $.body.offsetHeight);
	};

	window.addEventListener("scroll", autoScrollCheck);
	self.on("destroy", function() {
		window.removeEventListener("scroll", autoScrollCheck);
		clearTimeout(cacheTimeout);
	});

	self.on("ready", function() {
		document.querySelector(".search").focus()
	});
};

LogModule.init = function() {
	if($.body.scope) $.body.scope.destroy();

	var appHost = app.hosts[location.host];
	var scope = {
		debug: appHost.sysinfo.log.debug,
		info: appHost.sysinfo.log.info,
	};

	window.renderContent = LogModule.render;

	$.body
		.bindScope(scope)
		.on("destroy", function() {
			delete(window.renderContent);
		});
};

app.modules.push(LogModule);
app.menu.push(LogModule);
})();

