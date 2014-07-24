(function() {
var async = {}, CallbackMap;
var toArray = function(a) {
  var b = [], c;
  for (c = 0;c < a.length;b.push(a[c++])) {
  }
  return b;
}, $ = function(a) {
  if (a && a.querySelector) {
    return a;
  }
  if ("string" === typeof a) {
    return "#" === a.charAt(0) ? document.getElementById(a.slice(1)) : toArray(document.querySelectorAll(a));
  }
  throw new TypeError("Invalid document query string.");
};
var mapper = {};
var supports = {cookies:navigator.cookieEnabled, retina:2 == window.devicePixelRatio, workers:!!window.Worker, sharedWorkers:!!window.SharedWorker, sockets:!!window.WebSocket, sse:!!window.EventSource, geo:!!navigator.geolocation, touch:0 < navigator.maxTouchPoints, history:{html5:!!window.history.pushState, hash:!!window.onhashchange}, storage:{local:!!window.localStorage, session:!!window.sessionStorage, indexed:!!window.IDBFactory}}, Stub = function(a) {
  return function() {
    throw Error(a + " is not supported");
  };
};
var urlutil = {encode:encodeURIComponent, addParams:function(a, b) {
  -1 === a.indexOf("?") && (a += "?");
  for (var c in b) {
    b.hasOwnProperty(c) && (a += "&" + this.encode(c) + "=" + this.encode(b[c]));
  }
  return a;
}, parseParams:function(a) {
  for (var b = {}, c = a.split("?").pop().split("&"), e, d, f = 0;f < c.length;f++) {
    e = c[f].split("="), d = e[1], b[e[0]] = "true" === d || "false" === d ? Boolean(d) : /^[0-9]+$/.test(a) ? +d : d;
  }
  return b;
}, parse:function(a) {
  var b = {}, c;
  b.url = a;
  b.params = this.parseParams(a);
  c = a.split("//");
  if (2 === c.length) {
    b.protocol = c.shift();
  } else {
    if (1 === c.length) {
      b.protocol = "";
    } else {
      throw new SyntaxError("Malformed URL: " + a);
    }
  }
  c = c.shift().split("/");
  "/" === c[0].charAt(0) ? b.hostname = b.port = "" : (c.shift().split(":"), b.hostname = c[0], b.port = c[1] || "");
  b.path = c.join("/").split("?").shift();
  return b;
}};
var service = {}, Request, Response, splitter, prepareRequest, dispatch, parseResponse;
splitter = /^([^:]+):\s*/;
prepareRequest = function(a, b, c) {
  var e = new XMLHttpRequest, d;
  d = b.params ? urlutil.addParams(b.url, b.params) : "string" !== typeof b ? b.url : b;
  e.open(a.toUpperCase(), d, !!c);
  if (b.headers) {
    a = b.headers;
    for (var f in a) {
      a.hasOwnProperty(f) && e.setRequestHeader(f, a[f]);
    }
  }
  c ? (e.onerror = c.error, e.onloadend = function() {
    this.responseJSON = parseResponse(this);
    c.success(this.responseJSON);
  }) : (e.onerror = function(a) {
    this.error = a;
  }, e.onloadend = function() {
    this.responseJSON = parseResponse(this);
  });
  return e;
};
dispatch = function(a, b, c) {
  var e = "object" === typeof b.data ? JSON.stringify(b.data) : "string" === typeof b.data ? b.data : null == b.data ? null : "" + b.data;
  b = prepareRequest(a, b, c);
  b.send(e);
  return b;
};
parseResponse = function(a) {
  var b = {}, c = a.getAllResponseHeaders().split("\n");
  try {
    b.data = JSON.parse(a.responseText);
  } catch (e) {
    b.data = a.responseText || "";
  }
  b.headers = {};
  for (var d = 0;d < c.length;d++) {
    c[d] && (a = c[d].split(splitter), b.headers[a[1]] = a[2]);
  }
  return b;
};
service.http = {get:function(a, b) {
  return dispatch("GET", a, b);
}, delete:function(a, b) {
  return dispatch("DELETE", a, b);
}, head:function(a, b) {
  return dispatch("HEAD", a, b);
}, post:function(a, b) {
  return dispatch("POST", a, b);
}, put:function(a, b) {
  return dispatch("PUT", a, b);
}, patch:function(a, b) {
  return dispatch("PATCH", a, b);
}, options:function(a, b) {
  return dispatch("OPTIONS", a, b);
}};
service.socket = {};
service.sse = {};
service.storage = {};
var StringStore;
StringStore = function() {
  var a, b;
  a = function(a) {
    return "string" === typeof a ? a : null == a ? "" : "object" === typeof a ? JSON.stringify(a) : String(a);
  };
  b = function(a) {
    var b = a.charAt(0);
    return "{" === b || "[" === b ? JSON.parse(a) : a ? "true" === a || "false" === a ? Boolean(a) : /^[0-9]+$/.test(a) ? +a : a : null;
  };
  return function(c) {
    this.get = function(a) {
      return b(c.getItem(a));
    };
    this.put = function(b, d) {
      c.setItem(b, a(d));
    };
    this.del = function(a) {
      c.removeItem(a);
    };
  };
}();
service.storage.local = supports.storage.local ? new StringStore(window.localStorage) : null;
service.storage.session = supports.storage.session ? new StringStore(window.sessionStorage) : null;
Function.prototype.client = function() {
  var a = this;
  return function() {
    return a.apply(service, arguments);
  };
};
Function.prototype.service = function(a) {
  service[a] = this.client();
  return service[a];
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
