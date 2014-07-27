(function() {
var ROUTES = {"/":function(a) {
}, "/login":function(a) {
}, "/settings":function(a) {
}, "/dev":function(a) {
}, "/404":function(a) {
}, "/<key>":function(a) {
}, "/<key1>/and/<key2>":function(a) {
}};
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
var config = {context:JSON.parse($("#js-context").textContent || "{}"), data:JSON.parse($("#js-data").textContent || "{}")};
var supports = {cookies:navigator.cookieEnabled, retina:2 == window.devicePixelRatio, workers:!!window.Worker, sharedWorkers:!!window.SharedWorker, sockets:!!window.WebSocket, sse:!!window.EventSource, geo:!!navigator.geolocation, touch:0 < navigator.maxTouchPoints, history:{html5:!!window.history.pushState, hash:!!window.onhashchange}, storage:{local:!!window.localStorage, session:!!window.sessionStorage, indexed:!!window.IDBFactory}};
var urlutil = {addParams:function(a, b) {
  var c = !0;
  -1 === a.indexOf("?") && (a += "?", c = !1);
  for (var d in b) {
    b.hasOwnProperty(d) && (!0 === c ? a += "&" : c = !0, a += encodeURIComponent(d) + "=" + encodeURIComponent(b[d]));
  }
  return a;
}, parseParams:function(a) {
  var b = {};
  a = a.split("?").pop().split("&");
  for (var c, d, f = 0;f < a.length;f++) {
    c = a[f].split("="), d = unescape(c[1]), b[c[0]] = "true" === d || "false" === d ? Boolean(d) : /^\d*$/.test(d) ? +d : d;
  }
  return b;
}, parse:function(a) {
  var b = {}, c;
  b.url = a;
  b.params = urlutil.parseParams(a);
  c = a.split("//");
  if (2 === c.length) {
    b.protocol = c.shift().slice(0, -1);
  } else {
    if (1 === c.length) {
      b.protocol = "";
    } else {
      throw Error("Can't parse malformed URL: " + a);
    }
  }
  c = c.shift().split("/");
  a = c[0];
  "/" === a.charAt(0) ? b.hostname = b.port = "" : (a = c.shift().split("?").shift().split(":"), b.hostname = a[0], b.port = a[1] || "");
  b.path = c.join("/").split("?").shift();
  return b;
}, join:function(a) {
  var b = Array.prototype.slice.call(arguments), c = b.shift(), d = [];
  if (!b.length) {
    return c;
  }
  "/" === c.charAt(c.length - 1) && (c = c.slice(0, -1));
  for (d.push(c);b.length;) {
    if (c = b.shift()) {
      "/" === c.charAt(0) && (c = c.slice(1)), "/" === c.charAt(c.length - 1) && (c = c.slice(0, -1)), d.push(c);
    }
  }
  return d.join("/");
}};
var services = {}, Request, Response, splitter, prepareRequest, dispatch, parseResponse;
splitter = /^([^:]+):\s*/;
prepareRequest = function(a, b, c) {
  var d = new XMLHttpRequest, f;
  f = b.params ? urlutil.addParams(b.url, b.params) : b.url;
  d.open(a.toUpperCase(), f, !!c);
  if (b.headers) {
    a = b.headers;
    for (var e in a) {
      a.hasOwnProperty(e) && d.setRequestHeader(e, a[e]);
    }
  }
  d.data = b.data;
  c ? (d.onerror = c.error, d.onloadend = function() {
    d.responseJSON = parseResponse(d);
    c.success(d.responseJSON);
  }) : (d.onerror = function(a) {
    d.error = a;
  }, d.onloadend = function() {
    d.responseJSON = parseResponse(d);
  });
  return d;
};
dispatch = function(a, b, c) {
  var d = "object" === typeof b.data ? JSON.stringify(b.data) : "string" === typeof b.data ? b.data : null == b.data ? null : "" + b.data;
  a = prepareRequest(a, b, c);
  a.send(d);
  return a;
};
parseResponse = function(a) {
  var b = {}, c = a.getAllResponseHeaders().split("\n");
  try {
    b.data = JSON.parse(a.responseText);
  } catch (d) {
    b.data = a.responseText || "";
  }
  b.headers = {};
  for (var f = 0;f < c.length;f++) {
    c[f] && (a = c[f].split(splitter), b.headers[a[1]] = a[2]);
  }
  return b;
};
services.http = {get:function(a, b) {
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
var baseURL = "/_rpc/v1/", RPCAPI;
RPCAPI = function(a, b, c) {
  var d = this;
  d.name = a;
  d.config = c;
  b.forEach(function(a) {
    var b = urlutil.join(baseURL, d.name + "." + a);
    d[a] = function(a, c) {
      var d = {url:b, data:a.data || {}, params:a.params || {}, headers:a.headers || {}};
      d.headers.Accept = "application/json";
      d.headers["Content-Type"] = "application/json";
      return services.http.post(d, c);
    };
  });
};
services.rpc = {factory:function(a) {
  var b = a[0];
  services.rpc[b] = new RPCAPI(b, a[1], a[2]);
}, init:function(a) {
  a.forEach(services.rpc.factory);
}};
var StringStore, digitMatcher = /^[0-9]+$/, serialize = function(a) {
  return "string" === typeof a ? a : null == a ? "" : "object" === typeof a ? JSON.stringify(a) : String(a);
}, deserialize = function(a) {
  var b = a.charAt(0);
  return "{" === b || "[" === b ? JSON.parse(a) : a ? "true" === a || "false" === a ? Boolean(a) : digitMatcher.test(a) ? +a : a : "" === a ? a : null;
};
StringStore = function(a) {
  this.get = function(b) {
    return deserialize(a.getItem(b) || "");
  };
  this.put = function(b, c) {
    a.setItem(b, serialize(c));
  };
  this.del = function(b) {
    a.removeItem(b);
  };
};
services.storage = {local:supports.storage.local ? new StringStore(window.localStorage) : null, session:supports.storage.session ? new StringStore(window.sessionStorage) : null};
var Client = function() {
};
Client.prototype = services;
Function.prototype.client = function() {
  var a = this;
  return function() {
    return a.apply(new Client, arguments);
  };
};
Function.prototype.service = function(a) {
  Client.prototype[a] = this.client();
  return Client.prototype[a];
};
Object.defineProperty(Object.prototype, "service", {value:function(a) {
  var b;
  if (!a || "string" !== typeof a) {
    throw new TypeError("service() requires a string name.");
  }
  if (this.constructor !== Object) {
    throw Error("service() can only be invoked on native objects.");
  }
  for (var c in this) {
    this.hasOwnProperty(c) && (b = this[c], b instanceof Function && (this[c] = b.client()));
  }
  Client.prototype[a] = this;
  return Client.prototype[a];
}});
services.data = {};
var data = {normalize:function(a) {
}}.service("data");
services.graph = {};
var graph = {init:function(a) {
  return graph.construct(data.normalize(a));
}, construct:function(a) {
  return{};
}}.service("graph");
services.map = {};
var map = {draw:function() {
}}.service("map");
services.template = {};
var _templates = {}, template = {put:function(a, b) {
  "string" === typeof a && "string" === typeof b && (_templates[a] = b);
}, get:function(a, b) {
  if ("string" !== typeof a || "function" !== typeof b.success || "function" !== typeof b.error) {
    throw new TypeError("template.get() requires a filename and CallbackMap.");
  }
  return _templates[a] ? b.success({data:_templates[a]}) : this.rpc.content.template({data:{path:a}}, b);
}, init:function(a) {
  for (var b in a) {
    a.hasOwnProperty(b) && "string" === typeof a[b] && template.put(b, a[b]);
  }
}}.service("template");
services.router = {};
var keyMatcher = /\/<(\w+)>/, routes = {resolved:[], dynamic:[]}, queues = {route:[], routed:[], error:[]}, Route, router;
Route = function(a, b) {
  var c = this;
  c.keys = [];
  c.id = a.replace(keyMatcher, function(a, b, e) {
    c.keys.push(e);
    return "/(\\w+)";
  });
  c.matcher = new RegExp(c.id);
  c.handler = b;
  c.resolved = 0 === c.keys.length;
};
router = {register:function(a, b) {
  var c = !1, d, f, e, k;
  d = new Route(a, b);
  e = d.resolved ? routes.resolved : routes.dynamic;
  if (e.length) {
    for (k = 0;k < e.length;k++) {
      if (f = e[k], !(f.id < d.id)) {
        e.splice(k, 0, d);
        c = !0;
        break;
      }
    }
    !1 === c && e.push(d);
  } else {
    e.push(d);
  }
}, route:function(a, b) {
  var c = !1, d, f, e;
  b = b || {};
  b.params = b.params || {};
  queues.route.forEach(function(c) {
    c(a, b);
  });
  d = function() {
    for (var d = 0, e = function(a, c) {
      b.params[g.keys[c]] = a;
    }, l = function(c) {
      c(a, b, h);
    }, g, h;(g = f[d++]) && g.id < a;) {
      if (g.matcher.test(a)) {
        return c = !0, d = a.match(g.matcher).slice(1), d.forEach(e), h = g.handler(b), queues.routed.forEach(l), 404 === h.status ? (h.path = a, router.route("/404", h)) : h;
      }
    }
  };
  f = routes.resolved;
  e = d();
  if (c) {
    return e;
  }
  f = routes.dynamic;
  e = d();
  if (c) {
    return e;
  }
  e = {status:404};
  queues.error.forEach(function(c) {
    c(a, b, e);
  });
  return e;
}, on:function(a, b) {
  queues[a] || (queues[a] = []);
  queues[a].push(b);
}, off:function(a, b) {
  var c;
  b ? (c = queues[a].indexOf(b), -1 < c && queues[a].splice(c, 1)) : queues[a] = [];
}, init:function(a) {
  for (var b in a) {
    a.hasOwnProperty(b) && "function" === typeof a[b] && router.register(b, a[b]);
  }
}}.service("router");
services.history = {};
var history = {push:supports.history.html5 ? function(a, b) {
  window.history.pushState(b, "", a);
} : function(a, b) {
}, start:function() {
  var a = this;
  a.router.on("routed", function(b, c, d) {
    "history" !== c.source && a.push(b, c.state);
  });
  supports.history.html5 && (window.onpopstate = function(b) {
    a.router.route(window.location.pathname, {source:"history", state:b.state || {}});
  });
  a.start = function() {
    throw Error("History already started");
  };
}}.service("history");
var catnip = function(a, b) {
  this._context = a;
  this.session = null;
  a.session && a.session.established && (this.session = a.session.payload);
  a.services && a.protocol.rpc.enabled && this.rpc.init(a.services);
  a.template.manifest && this.template.init(a.template.manifest);
  this.router.init(ROUTES);
  this.history.start();
  this.graph.init(b);
  return this;
}.client();
var init = {};
window.catnip_beta = catnip(config.context, config.data);

})();
