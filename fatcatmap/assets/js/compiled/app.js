(function() {
var async = {}, CallbackMap;
var routes = {"/":function(a) {
  this.app.page = "page.map";
  this.app.$broadcast("page.map", this.graph.construct());
  return null;
}, "/login":function(a) {
}, "/settings":function(a) {
}, "/404":function(a) {
}, "/<key>":function(a) {
  var b = this;
  b.data.get(a.args.key, {success:function(a) {
    b.app.$broadcast("detail", a);
  }, error:function(c) {
    a.error = c;
    b.router.route("/404", a);
  }});
  return null;
}, "/<key1>/and/<key2>":function(a) {
}};
var toArray = function(a) {
  var b = [], c;
  for (c = 0;c < a.length;b.push(a[c++])) {
  }
  return b;
}, $ = function(a, b) {
  if (a && a.querySelector) {
    return a;
  }
  b = b || document;
  if ("string" === typeof a) {
    return "#" === a.charAt(0) ? document.getElementById(a.slice(1)) : toArray(b.querySelectorAll(a));
  }
  throw new TypeError("Invalid document query string.");
};
var config = {context:JSON.parse($("#js-context").textContent || "{}"), data:JSON.parse($("#js-data").textContent || "{}")};
var services = {}, Client = function(a) {
  if (a) {
    for (var b in a) {
      a.hasOwnProperty(b) && (this[b] = a[b]);
    }
  }
};
Client.prototype = services;
Object.defineProperty(Function.prototype, "client", {value:function(a) {
  var b = this;
  return function() {
    return b.apply(new Client(a), arguments);
  };
}});
Object.defineProperty(Function.prototype, "service", {value:function(a, b) {
  Client.prototype[a] = this.client(b);
  return Client.prototype[a];
}});
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
  for (var c, d, e = 0;e < a.length;e++) {
    c = a[e].split("="), d = unescape(c[1]), b[c[0]] = "true" === d || "false" === d ? Boolean(d) : /^\d*$/.test(d) ? +d : d;
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
var Diff, DIFF;
Diff = function() {
  this._diff = {};
};
Diff.prototype.add = function(a, b) {
  var c, d;
  if (this._diff[a]) {
    d = this._diff[a];
    for (c in b) {
      b.hasOwnProperty(c) && (d[c] = b[c]);
    }
    this._diff[a] = d;
  } else {
    this._diff[a] = b;
  }
};
Diff.prototype.commit = function() {
  var a = this._diff;
  this._diff = !1;
  this.add = function() {
    throw Error("Cannot add to committed diff.");
  };
  return a;
};
services.data = {init:function(a) {
  DIFF = new Diff;
  this._watchers = {};
}, normalize:function(a) {
  if ("string" === typeof a) {
    try {
      a = JSON.parse(a);
    } catch (b) {
      a = {};
    }
  }
  return a;
}, watch:function(a, b, c) {
  if (!a) {
    throw Error("services.data.watch() requires a string key.");
  }
  if (!c) {
    if ("function" !== typeof b) {
      throw Error("services.data.watch() requires a watcher function.");
    }
    c = b;
    b = null;
  }
  this._watchers[a] || (this._watchers[a] = []);
  this._watchers[a].push(b ? c.bind(b) : function(a) {
    c.call(a, a);
  });
}, unwatch:function(a, b) {
  var c, d;
  if (this._watchers[a]) {
    c = this._watchers[a];
    if (b) {
      for (d = 0;d < c.length;d++) {
        if (b === c[d]) {
          c.splice(d, 1);
          break;
        }
      }
    } else {
      c = [];
    }
    this._watchers[a] = c;
  }
}}.service("data");
var _cache, _index, GRAPH;
_cache = {};
_index = {adjacency:{}, nodesByKey:{}, edgesByKey:{}, nativesByKey:{}, object_natives:{}};
services.graph = {init:function(a) {
  return GRAPH = this.graph.construct(this.data.normalize(a));
}, construct:function(a) {
  var b, c, d, e, f, g;
  if (!a) {
    return GRAPH;
  }
  b = a.graph;
  a = a.data;
  GRAPH = {nodes:[], edges:[], natives:[], origin:b.origin};
  a.keys.forEach(function(b, c) {
    _cache[b] = a.objects[c];
  });
  b.natives.forEach(function(d) {
    d = b.edges + 1 + d;
    var e = a.keys[c];
    _index.nativesByKey[e] || (_index.nativesByKey[e] = GRAPH.natives.push({key:e, data:a.objects[d]}) - 1);
  });
  c = -1;
  for (g = function(b, d) {
    return function(e) {
      var f;
      !_index.adjacency[b] && _index.adjacency[b][e] && (f = GRAPH.edges.push({edge:{key:d, data:a.objects[c]}, native:_cache[a.objects[c].native], source:_index.nodesByKey[b], target:_index.nodesByKey[e]}) - 1, _index.edgesByKey[d].push(f), _index.adjacency[b] = {}, _index.adjacency[b][e] = f);
    };
  };c++ < a.keys.length;) {
    d = a.keys[c], c <= b.nodes ? _index.nodesByKey[d] || (_index.nodesByKey[d] = GRAPH.nodes.push({node:{key:d, data:_cache[d]}, native:{key:a.objects[c].native, data:_cache[a.objects[c].native]}})) : c <= b.edges && (_index.edgesByKey[d] || (_index.edgesByKey[d] = []), e = a.objects[c].node.slice(), f = e.shift(), e.forEach(g(f, d)));
  }
  return GRAPH;
}}.service("graph");
var Request, Response, _prepareRequest, _dispatch, _parseResponse;
_prepareRequest = function(a, b, c) {
  var d = new XMLHttpRequest, e;
  e = b.params ? urlutil.addParams(b.url, b.params) : b.url;
  d.open(a.toUpperCase(), e, !!c);
  if (b.headers) {
    a = b.headers;
    for (var f in a) {
      a.hasOwnProperty(f) && d.setRequestHeader(f, a[f]);
    }
  }
  d.data = b.data;
  c ? (d.onerror = c.error, d.onloadend = function() {
    d.responseJSON = _parseResponse(d);
    c.success(d.responseJSON);
  }) : (d.onerror = function(a) {
    d.error = a;
  }, d.onloadend = function() {
    d.responseJSON = _parseResponse(d);
  });
  return d;
};
_dispatch = function(a, b, c) {
  var d = "object" === typeof b.data ? JSON.stringify(b.data) : "string" === typeof b.data ? b.data : null == b.data ? null : "" + b.data;
  a = _prepareRequest(a, b, c);
  a.send(d);
  return a;
};
_parseResponse = function(a) {
  var b = {}, c = a.getAllResponseHeaders().split("\n");
  try {
    b.data = JSON.parse(a.responseText);
  } catch (d) {
    b.data = a.responseText || "";
  }
  b.headers = {};
  for (var e = 0;e < c.length;e++) {
    c[e] && (a = c[e].split(/^([^:]+):\s*/), b.headers[a[1]] = a[2]);
  }
  return b;
};
services.http = {get:function(a, b) {
  return _dispatch("GET", a, b);
}, delete:function(a, b) {
  return _dispatch("DELETE", a, b);
}, head:function(a, b) {
  return _dispatch("HEAD", a, b);
}, post:function(a, b) {
  return _dispatch("POST", a, b);
}, put:function(a, b) {
  return _dispatch("PUT", a, b);
}, patch:function(a, b) {
  return _dispatch("PATCH", a, b);
}, options:function(a, b) {
  return _dispatch("OPTIONS", a, b);
}}.service("http");
var ROUTES = {resolved:[], dynamic:[]}, _routeEvents = {route:[], routed:[], error:[]}, _findRoute, Route, router;
_findRoute = function(a, b, c) {
  for (var d = 0, e, f, g, h = function(a, c) {
    b.args[e.keys[c]] = a;
  };(e = c[d++]) && e.id <= a;) {
    if (e.matcher.test(a)) {
      f = !0;
      a = a.match(e.matcher).slice(1);
      a.forEach(h);
      g = e.handler.call(new Client, b);
      break;
    }
  }
  return{matched:f, response:g};
};
Route = function(a, b) {
  var c = this;
  c.keys = [];
  c.id = a.replace(/\/<(\w+)>/, function(a, b, f) {
    c.keys.push(f);
    return "/(\\w+)";
  });
  c.matcher = new RegExp("^" + c.id + "$");
  c.handler = b;
  c.resolved = 0 === c.keys.length;
};
services.router = {register:function(a, b) {
  var c = !1, d, e, f, g;
  d = new Route(a, b);
  f = d.resolved ? ROUTES.resolved : ROUTES.dynamic;
  if (f.length) {
    for (g = 0;g < f.length;g++) {
      if (e = f[g], !(e.id < d.id)) {
        f.splice(g, 0, d);
        c = !0;
        break;
      }
    }
    !1 === c && f.push(d);
  } else {
    f.push(d);
  }
}, route:function(a, b) {
  var c, d, e;
  b = b || {};
  b.args = {};
  b.params = b.params || {};
  c = urlutil.parseParams(a);
  for (d in c) {
    c.hasOwnProperty(d) && (b.params[d] = c[d]);
  }
  _routeEvents.route.forEach(function(c) {
    c(a, b);
  });
  e = _findRoute(a, b, ROUTES.resolved);
  if (e.matched) {
    return e = e.response, _routeEvents.routed.forEach(function(c) {
      c(a, b, e);
    }), e;
  }
  e = _findRoute(a, b, ROUTES.dynamic);
  if (e.matched) {
    return e = e.response, _routeEvents.routed.forEach(function(c) {
      c(a, b, e);
    }), e;
  }
  e = {status:404};
  _routeEvents.error.forEach(function(c) {
    c(a, b, e);
  });
  return e;
}, on:function(a, b) {
  _routeEvents[a] || (_routeEvents[a] = []);
  _routeEvents[a].push(b);
}, off:function(a, b) {
  var c;
  b ? (c = _routeEvents[a].indexOf(b), -1 < c && _routeEvents[a].splice(c, 1)) : _routeEvents[a] = [];
}, init:function(a, b) {
  for (var c in a) {
    a.hasOwnProperty(c) && "function" === typeof a[c] && this.router.register(c, a[c]);
  }
  b && b(window.location.pathname.split("?").shift());
}}.service("router");
services.history = {push:supports.history.html5 ? function(a, b) {
  window.history.pushState(b, "", a);
} : function(a, b) {
}, init:function() {
  var a = this;
  a.router.on("routed", function(a, c, d) {
    "history" !== c.source && services.history.push(a, c.state);
  });
  supports.history.html5 && (window.onpopstate = function(b) {
    a.router.route(window.location.pathname, {source:"history", state:b.state || {}});
  });
  a.init = function() {
    throw Error("History already started");
  };
}}.service("history");
var _baseURL = "/_rpc/v1/", RPCAPI;
RPCAPI = function(a, b, c) {
  var d = this;
  d.name = a;
  d.config = c;
  b.forEach(function(a) {
    var b = urlutil.join(_baseURL, d.name + "." + a);
    d[a] = function(a, c) {
      var d = {url:b, data:a.data || {}, params:a.params || {}, headers:a.headers || {}};
      d.headers.Accept = "application/json";
      d.headers["Content-Type"] = "application/json";
      return this.http.post(d, c);
    }.client();
  });
};
services.rpc = {factory:function(a) {
  var b = a[0];
  services.rpc[b] = new RPCAPI(b, a[1], a[2]);
}, init:function(a) {
  a.forEach(services.rpc.factory);
}}.service("rpc");
var TEMPLATES = {};
services.template = {put:function(a, b) {
  "string" === typeof a && "string" === typeof b && (TEMPLATES[a] = b);
}, get:function(a, b) {
  if ("string" !== typeof a || "function" !== typeof b.success || "function" !== typeof b.error) {
    throw new TypeError("template.get() requires a filename and CallbackMap.");
  }
  return TEMPLATES[a] ? b.success({data:TEMPLATES[a]}) : this.rpc.content.template({data:{path:a}}, b);
}, has:function(a) {
  return!!TEMPLATES[a];
}, init:function(a) {
  for (var b in a) {
    a.hasOwnProperty(b) && "string" === typeof a[b] && services.template.put(b, a[b]);
  }
}}.service("template");
var VIEWS = {}, getSelfAndChildren = function(a, b) {
  var c = a.replace(".", "/") + ".html";
  services.template.get(c, {success:function(d) {
    var e = [], f, g;
    if ("string" !== typeof d.data) {
      return b(!1, d);
    }
    f = d.data.replace(/v-component=("|')(\w+)\1/g, function(a, b, c) {
      e.push(c);
      return a;
    });
    g = e.length;
    VIEWS[a] && (VIEWS[a].options.template = f);
    services.template.put(c, f);
    if (0 === g) {
      return b();
    }
    e.forEach(function(a) {
      getSelfAndChildren(a, function() {
        g -= 1;
        0 === g && b(f);
      });
    });
  }, error:function(a) {
    b(!1, a);
  }});
};
services.view = {put:function(a, b) {
  if ("string" !== typeof a || "function" !== typeof b) {
    throw new TypeError("services.view.put() takes a string name and constructor.");
  }
  return VIEWS[a] = b;
}, get:function(a) {
  if ("string" !== typeof a) {
    throw new TypeError("services.view.get() takes a string name.");
  }
  return VIEWS[a];
}, init:function(a, b) {
  var c = services.view.get(a);
  if (!c) {
    throw Error("view.init() cannot be called with unregistered view " + a);
  }
  getSelfAndChildren(a, function(d) {
    document.body.innerHTML = "";
    d && (c.options.template = d);
    services.view.put(a, c);
    d = new c({ready:b, el:"body"});
    window.__ROOTVIEW = d;
  });
}}.service("view");
window.__VIEWS = VIEWS;
var View = Vue.extend({});
View.extend = function(a) {
  var b = a.viewname.toLowerCase(), c;
  if (!b || "string" !== typeof b) {
    throw Error('AppView.extend() requires a "viewname" option to be passed.');
  }
  a.ready && (c = a.ready);
  a.ready = function() {
    this.$options.handler && this.$on(this.$options.viewname, this.$options.handler.bind(this));
    c && c.call(this);
  };
  a = Vue.extend(a);
  services.view.put(b, a);
  Vue.component(b, a);
  return a;
};
var views = {};
views.Detail = View.extend({viewname:"detail", replace:!0, data:{view:"", selected:null}, handler:function(a) {
  this.$set("view", a.kind.toLowerCase());
  this.$set("selected", a);
}});
views.Header = View.extend({viewname:"header", replace:!0});
views.Modal = View.extend({viewname:"modal", data:{active:!1, message:""}});
views.Stage = View.extend({viewname:"stage", replace:!0, data:{active:!0}});
views.Map = View.extend({viewname:"page.map", selectors:{map:"#map", edge:".edge", node:".node"}, data:{active:!0, graph:{root:null, force:null, edge:null, line:null, node:null, circle:null}, config:{width:0, height:0, force:{alpha:.75, strength:1, friction:.9, theta:.7, gravity:.1, charge:-700, distance:180}, origin:{snap:!0, dynamic:!0, position:null}, node:{radius:20, classes:["node"]}, labels:{enable:!1, distance:0}, edge:{width:2, stroke:"#999", classes:["link"]}, sprite:{width:60, height:60}}}, 
methods:{toggleSelected:function(a) {
}, addSelected:function(a) {
}, browseTo:function(a) {
}, draw:function(a) {
  var b, c, d, e, f, g, h, k, l;
  this.graph.root ? (this.graph.root = null, $(this.$options.selectors.map).innerHTML = "", this.draw(a)) : (b = this.config, c = this.$options.selectors, d3.scale.category20(), d = this.graph.force = d3.layout.force().size(b.width, b.height).linkDistance(b.force.distance).charge(b.force.charge).linkStrength(b.force.strength).friction(b.force.friction).theta(b.force.theta).gravity(b.force.gravity).alpha(b.force.alpha), e = this.graph.root = d3.select(c.map), f = e.selectAll(c.edge).data(a.edges).enter(), 
  f = this.graph.edge = f.append("svg:svg").attr("id", function(a) {
    return "edge-" + a.edge.key;
  }), g = this.graph.line = f.append("svg:line").attr("stroke", b.edge.stroke).attr("class", b.edge.classes).style("stroke-width", b.edge.width), c = e.selectAll(c.node).data(a.nodes).enter(), h = c.append("svg:svg").attr("id", function(a) {
    return "group-" + a.node.key;
  }).attr("width", b.sprite.width).attr("height", b.sprite.height).call(d.drag), c = this.graph.node = h.append("svg:g").attr("width", b.sprite.width).attr("height", b.sprite.height).attr("class", function(a, b) {
    var c = [];
    a.native.data.govtrack_id ? (c.push("legislator"), c.push("M" === a.native.data.gender ? "male" : "female"), c.push(Math.ceil(100 * Math.random()) % 2 ? "democrat" : "republican")) : (c.push("contributor"), c.push("C" == a.native.data.contributor_type ? "corporate" : "individual"));
    return c.join(" ");
  }), this.graph.circle = c.append("svg:circle").attr("r", b.node.radius).attr("cx", b.sprite.width / 2).attr("cy", b.sprite.height / 2).attr("class", b.node.classes), k = function(c, d, e, f) {
    return b.origin.snap && e[c].index === a.origin ? Math.floor(b.origin.position(d)) : Math.floor(e[c][d] + b.node.radius / 2);
  }, l = function(c, d, e) {
    return b.origin.snap && e === a.origin ? Math.floor(b.origin.position[c] - b.sprite["x" === c ? "width" : "height"] / 2) : Math.floor(d[c] - b.node.radius);
  }, d.on("tick", function(a) {
    var c;
    a = b.width / 2;
    c = b.height / 2;
    b.origin.dynamic && b.origin.snap && (this.config.origin.position = {x:a + b.sprite.width / 2, y:c + b.sprite.height / 2});
    ["x", "y"].forEach(function(a) {
      h.attr(a, function(b, c) {
        l(a, b, c);
      });
    });
    ["x1", "y1", "x2", "y2"].forEach(function(a) {
      g.attr(a, function(b, c) {
        k("1" === a[1] ? "source" : "target", a[0], b, c);
      });
    });
  }), d.nodes(a.nodes).links(a.edges).start());
}}, ready:function() {
  var a = this, b = this.$el.offsetWidth, c = this.$el.offsetHeight;
  this.config.width = b;
  this.config.height = c;
  this.config.origin.position = {x:b - 30, y:c - 30};
  window.addEventListener("resize", function(b) {
    b = document.body.clientWidth;
    var c = document.body.clientHeight;
    a.config.graph.width = b;
    a.config.graph.height = c;
    a.graph.root && a.graph.root.attr("width", b).attr("height", c);
    a.graph.force && a.graph.force.size([b, c]).resume();
  });
}, handler:function(a) {
  this.draw(a);
}});
views.Page = Vue.extend({data:{page:{name:"page.map"}, active:!1, modal:null}, methods:{route:function(a) {
  if (a.target.hasAttribute("data-route")) {
    var b = a.target.getAttribute("href");
    a.preventDefault();
    a.stopPropagation();
    services.router.route(b);
  }
}}});
services.view.put("page", views.Page);
var _ready, _go, catnip;
_ready = [];
_go = function() {
  var a = _ready;
  _ready = null;
  a.forEach(function(a) {
    a();
  });
};
catnip = function(a, b, c) {
  var d = this;
  d._context = a;
  d.session = null;
  a.session && a.session.established && (d.session = a.session.payload);
  a.services && a.protocol.rpc.enabled && d.rpc.init(a.services);
  a.template.manifest && d.template.init(a.template.manifest);
  d.view.init("page", function() {
    this.$set("active", !0);
    Client.prototype.app = this;
    _go();
  });
  d.router.init(c, function(a) {
    d.ready(function() {
      d.history.init();
      if (a) {
        return d.router.route(a);
      }
    });
  });
  return this;
}.client({ready:function(a) {
  if (a) {
    if (!_ready) {
      return a();
    }
    _ready.push(a);
  }
}});
var init = {};
window.catnip_beta = catnip(config.context, config.data, routes);

})();

//# sourceMappingURL=../../../../.develop/maps/fatcatmap/assets/js/app.js.map