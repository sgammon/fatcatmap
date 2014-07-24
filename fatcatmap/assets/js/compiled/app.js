(function() {
var async = {}, CallbackMap;
var toArray = function(b) {
  var a = [], c;
  for (c = 0;c < b.length;a.push(b[c++])) {
  }
  return a;
}, $ = function(b) {
  if (b && b.querySelector) {
    return b;
  }
  if ("string" === typeof b) {
    return "#" === b.charAt(0) ? document.getElementById(b.slice(1)) : toArray(document.querySelectorAll(b));
  }
  throw new TypeError("Invalid document query string.");
};
var mapper = {};
var supports = {cookies:navigator.cookieEnabled, retina:2 == window.devicePixelRatio, workers:!!window.Worker, sharedWorkers:!!window.SharedWorker, sockets:!!window.WebSocket, sse:!!window.EventSource, geo:!!navigator.geolocation, touch:0 < navigator.maxTouchPoints, history:{html5:!!window.history.pushState, hash:!!window.onhashchange}, storage:{local:!!window.localStorage, session:!!window.sessionStorage, indexed:!!window.IDBFactory}};
var urlutil = {encode:encodeURIComponent, addParams:function(b, a) {
  -1 === b.indexOf("?") && (b += "?");
  for (var c in a) {
    a.hasOwnProperty(c) && (b += "&" + this.encode(c) + "=" + this.encode(a[c]));
  }
  return b;
}, parseParams:function(b) {
  for (var a = {}, c = b.split("?").pop().split("&"), d, e, f = 0;f < c.length;f++) {
    d = c[f].split("="), e = unescape(d[1]), a[d[0]] = "true" === e || "false" === e ? Boolean(e) : /^[0-9]+$/.test(b) ? +e : e;
  }
  return a;
}, parse:function(b) {
  var a = {}, c;
  a.url = b;
  a.params = this.parseParams(b);
  c = b.split("//");
  if (2 === c.length) {
    a.protocol = c.shift();
  } else {
    if (1 === c.length) {
      a.protocol = "";
    } else {
      throw Error("Can't parse malformed URL: " + b);
    }
  }
  c = c.shift().split("/");
  "/" === c[0].charAt(0) ? a.hostname = a.port = "" : (c.shift().split(":"), a.hostname = c[0], a.port = c[1] || "");
  a.path = c.join("/").split("?").shift();
  return a;
}};
var service = {}, Request, Response, splitter, prepareRequest, dispatch, parseResponse;
splitter = /^([^:]+):\s*/;
prepareRequest = function(b, a, c) {
  var d = new XMLHttpRequest, e;
  e = a.params ? urlutil.addParams(a.url, a.params) : "string" !== typeof a ? a.url : a;
  d.open(b.toUpperCase(), e, !!c);
  if (a.headers) {
    b = a.headers;
    for (var f in b) {
      b.hasOwnProperty(f) && d.setRequestHeader(f, b[f]);
    }
  }
  c ? (d.onerror = c.error, d.onloadend = function() {
    this.responseJSON = parseResponse(this);
    c.success(this.responseJSON);
  }) : (d.onerror = function(a) {
    this.error = a;
  }, d.onloadend = function() {
    this.responseJSON = parseResponse(this);
  });
  return d;
};
dispatch = function(b, a, c) {
  var d = "object" === typeof a.data ? JSON.stringify(a.data) : "string" === typeof a.data ? a.data : null == a.data ? null : "" + a.data;
  a = prepareRequest(b, a, c);
  a.send(d);
  return a;
};
parseResponse = function(b) {
  var a = {}, c = b.getAllResponseHeaders().split("\n");
  try {
    a.data = JSON.parse(b.responseText);
  } catch (d) {
    a.data = b.responseText || "";
  }
  a.headers = {};
  for (var e = 0;e < c.length;e++) {
    c[e] && (b = c[e].split(splitter), a.headers[b[1]] = b[2]);
  }
  return a;
};
service.http = {get:function(b, a) {
  return dispatch("GET", b, a);
}, delete:function(b, a) {
  return dispatch("DELETE", b, a);
}, head:function(b, a) {
  return dispatch("HEAD", b, a);
}, post:function(b, a) {
  return dispatch("POST", b, a);
}, put:function(b, a) {
  return dispatch("PUT", b, a);
}, patch:function(b, a) {
  return dispatch("PATCH", b, a);
}, options:function(b, a) {
  return dispatch("OPTIONS", b, a);
}};
service.socket = {};
service.sse = {};
service.storage = {};
var StringStore;
StringStore = function() {
  var b = /^[0-9]+$/, a, c;
  a = function(a) {
    return "string" === typeof a ? a : null == a ? "" : "object" === typeof a ? JSON.stringify(a) : String(a);
  };
  c = function(a) {
    var c = a.charAt(0);
    return "{" === c || "[" === c ? JSON.parse(a) : a ? "true" === a || "false" === a ? Boolean(a) : b.test(a) ? +a : a : null;
  };
  return function(b) {
    this.get = function(a) {
      return c(b.getItem(a));
    };
    this.put = function(c, f) {
      b.setItem(c, a(f));
    };
    this.del = function(a) {
      b.removeItem(a);
    };
  };
}();
service.storage.local = supports.storage.local ? new StringStore(window.localStorage) : null;
service.storage.session = supports.storage.session ? new StringStore(window.sessionStorage) : null;
var Client = function() {
};
Client.prototype = service;
Function.prototype.client = function() {
  var b = this;
  return function() {
    return b.apply(new Client, arguments);
  };
};
Function.prototype.service = function(b) {
  Client.prototype[b] = this.client();
  return Client.prototype[b];
};
var graph = function() {
}.service("graph");
var catnip = function() {
  this.graph();
  return{};
}.client();
var init = {};
window.catnip = catnip();

})();
