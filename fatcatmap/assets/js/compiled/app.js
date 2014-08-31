(function() {
var async = {}, CallbackMap;
Object.defineProperty(Function.prototype, "throttle", {value:function(a) {
  var b = this, c, d, e;
  return function() {
    d = arguments;
    e = this;
    c || setTimeout(function() {
      c = null;
      b.apply(e, d);
    }, a);
  };
}});
var routes = {"/":function(a) {
  this.app.$set("page", {active:!0});
  this.app.$set("modal", null);
  setTimeout(function() {
    this.app.$.stage.$.map.$set("map.detail", null);
    this.app.$.stage.$.map.$set("map.compare", null);
    this.app.$broadcast("page.map", this.graph.construct());
  }.bind(this), 20);
  return null;
}, "/login":function(a) {
  this.app.$set("modal", {viewname:"page.login", data:{session:null}});
  this.app.$set("page", null);
}, "/settings":function(a) {
}, "/404":function(a) {
}, "/<key>":function(a) {
  var b = this, c = a.args.key, d = !b.app.page;
  b.app.$set("page", {active:!0});
  b.app.$set("modal", null);
  setTimeout(function() {
    var a = b.app.$.stage.$.map;
    "detail" === (a.getComponentNameByKey(c) || "detail") ? (a.$set("map.compare", null), a.$set("map.detail", c)) : (a.$set("map.detail", null), a.$set("map.compare", c));
    b.app.$broadcast("page.map", d ? b.graph.construct() : null);
  }, 20);
  return null;
}, "/<key1>/and/<key2>":function(a) {
  var b = this, c = a.args.key1, d = a.args.key2, e = !b.app.page;
  b.app.$set("page", {active:!0});
  b.app.$set("modal", null);
  setTimeout(function() {
    var a = b.app.$.stage.$.map, g = a.getComponentNameByKey(c), h = a.getComponentNameByKey(d);
    g || h || (g = "detail", h = "compare");
    g || (g = "detail" === h ? "compare" : "detail");
    h || (h = "detail" === g ? "compare" : "detail");
    a.$set("map." + g, c);
    a.$set("map." + h, d);
    b.app.$broadcast("page.map", e ? b.graph.construct() : null);
  }, 20);
  return null;
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
services.service._register = function(a, b) {
  services[a] = b;
};
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
var _dataCache, watchers, _resolveAndSet;
_dataCache = {};
watchers = {};
_resolveAndSet = function(a, b) {
  for (var c = a.split("."), d = _dataCache;1 < c.length;) {
    a = c.shift(), d = d[a] || (d[a] = {}, d[a]);
  }
  d[c.shift()] = b;
};
services.data = {init:function(a, b) {
  var c = this.data.normalize(a), d = c.data.keys, e = c.data.objects, f;
  for (f = 0;d && f < d.length;f++) {
    _dataCache[d[f]] = e[f];
  }
  b(c);
}, normalize:function(a) {
  if ("string" === typeof a) {
    try {
      a = JSON.parse(a);
    } catch (b) {
      console.warn("[service.data] Couldn't parse raw data: "), console.warn(a), a = {};
    }
  }
  return a;
}, get:function(a, b) {
  var c = _dataCache[a], d = {success:function(a) {
    this.data.set(e, a);
    b.success(a);
  }.bind(this), error:b.error}, e;
  if (c) {
    return c.native && "string" === typeof c.native ? (e = c.native, this.watch(e, function(b) {
      this.data.set(a + ".native", b);
    }.bind(this)), this.data.get(e, d)) : b.success(c);
  }
  debugger;
}, set:function(a, b) {
  _resolveAndSet(a, b);
  watchers[a].length && watchers[a].forEach(function(a) {
    a(b);
  });
}, watch:function(a, b) {
  watchers[a] || (watchers[a] = []);
  watchers[a].push(b);
}, unwatch:function(a, b) {
  var c = b;
  b && "function" === typeof b ? watchers[a] = watchers[a].filter(function(a) {
    return a === b;
  }) : (c = watchers[a], watchers[a] = []);
  return c;
}}.service("data");
var _graphCache, _graphIndex, GRAPH;
_graphCache = {};
_graphIndex = {adjacency:{}, nodesByKey:{}, edgesByKey:{}};
services.graph = {init:function(a) {
  return GRAPH = this.graph.construct(a.graph, a.data);
}, construct:function(a, b) {
  if (!a) {
    return GRAPH;
  }
  GRAPH = {nodes:[], edges:[], natives:[], origin:a.origin, origin_key:b.keys[a.origin]};
  return this.graph.add(a, b);
}, add:function(a, b) {
  var c, d, e, f, g, h;
  c = function(a, b) {
    return function(c) {
      var d;
      if (!_graphIndex.adjacency[a] || !_graphIndex.adjacency[a][c]) {
        if (null == _graphIndex.nodesByKey[a] || null == _graphIndex.nodesByKey[c]) {
          debugger;
        }
        d = GRAPH.edges.push({key:b, source:_graphIndex.nodesByKey[a], target:_graphIndex.nodesByKey[c]}) - 1;
        _graphIndex.edgesByKey[b].push(d);
        _graphIndex.adjacency[a] = {};
        _graphIndex.adjacency[a][c] = d;
      }
    };
  };
  d = 0;
  for (e = b.keys;d < e.length;) {
    f = e[d], d <= a.nodes ? _graphIndex.nodesByKey[f] || (g = {key:f, classes:["node"]}, h = b.objects[d].native, h = b.objects[e.indexOf(h)], h.govtrack_id ? (g.classes.push("legislator"), g.classes.push("M" === h.gender ? "male" : "female"), g.classes.push(Math.ceil(100 * Math.random()) % 2 ? "democrat" : "republican"), .1869 > Math.random() && g.classes.push("senate")) : (g.classes.push("contributor"), g.classes.push("C" == h.contributor_type ? "corporate" : "individual")), _graphIndex.nodesByKey[f] = 
    GRAPH.nodes.push(g) - 1) : d <= a.edges && (_graphIndex.edgesByKey[f] || (_graphIndex.edgesByKey[f] = []), g = b.objects[d].node.slice(), h = g.shift(), g.forEach(c(h, f))), d++;
  }
  return this.graph.get();
}, get:function() {
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
  c.id = a.replace(/\/<(\w+)>/g, function(a, b) {
    c.keys.push(b);
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
  a.router.back = function() {
    window.history.back();
  };
  a.router.forward = function() {
    window.history.forward();
  };
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
    f = d.data.replace(/v-component=("|')([\w\.\-]+)\1/g, function(a, b, c) {
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
  VIEWS[a] = b;
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
    var e, f;
    document.body.innerHTML = "";
    d && (c.options.template = d);
    services.view.put(a, c);
    d = new c({ready:b, el:"body"});
    window.__ROOTVIEW = d;
    for (e in VIEWS) {
      VIEWS.hasOwnProperty(e) && (f = VIEWS[e], f.options.template || getSelfAndChildren(e, function(a) {
        a && (f.options.template = a);
        services.view.put(e, f);
      }));
    }
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
views.Detail = View.extend({viewname:"detail", replace:!0, data:{kind:""}, methods:{close:function(a) {
  a && (a.preventDefault(), a.stopPropagation());
  services.router.back();
}}, handler:function(a) {
  a && a.kind && (this.$set("data", a), this.$set("kind", "detail." + a.kind.toLowerCase()));
}});
views.Compare = View.extend({viewname:"compare", replace:!0, data:{kind:""}, methods:{close:function(a) {
  a && (a.preventDefault(), a.stopPropagation());
  services.router.back();
}}, handler:function(a) {
  a && a.kind && (this.$set("data", a), this.$set("kind", "detail." + a.kind.toLowerCase()));
}});
views.Header = View.extend({viewname:"header", replace:!0});
views.Modal = View.extend({viewname:"modal", methods:{close:function(a) {
  a && (a.preventDefault(), a.stopPropagation());
  services.router.back();
}}});
views.Stage = View.extend({viewname:"stage", replace:!0});
views.Login = View.extend({viewname:"page.login", replace:!0, methods:{login:function(a) {
  a.preventDefault();
  a.stopPropagation();
}}, data:{session:null}});
views.Map = View.extend({viewname:"page.map", replace:!0, selectors:{map:"#map", edge:".edge", node:".node", selected:".selected"}, data:{map:{}, config:{width:0, height:0, force:{alpha:.75, strength:1, friction:.9, theta:.7, gravity:.1, charge:-600, distance:180}, origin:{snap:!1, dynamic:!1, position:null}, node:{radius:25, scaleFactor:1.6, classes:["node"]}, labels:{enable:!1, distance:0}, edge:{width:2, stroke:"#999", classes:["link"]}, sprite:{width:60, height:60}}, dragging:!1, selected:!1, 
compare:!1}, methods:{isNode:function(a) {
  return a.classList.contains("node");
}, isEdge:function(a) {
  return a.classList.contains("link");
}, select:function(a) {
  var b, c, d, e, f;
  this.dragging || (b = a.target, c = b.id.split("-").pop(), d = this.$options.selectors.selected.slice(1), e = this.map.detail, f = this.map.compare, this.isNode(b) && (a.preventDefault(), a.stopPropagation(), c = b.classList.contains(d) ? e === c ? f : f === c ? e : e + "/and/" + f : e ? !f && a.shiftKey ? e + "/and/" + c : e + "/and/" + f : c, this.$root.route("/" + c)));
}, getComponentNameByKey:function(a) {
  return this.map.detail === a ? "detail" : this.map.compare === a ? "compare" : null;
}, browseTo:function(a) {
  console.log("map.browseTo()");
}, startDrag:function(a) {
  this.dragging = !0;
}, endDrag:function(a) {
  this.dragging = !1;
}, draw:function(a) {
  var b = this, c, d, e, f, g, h, k, l;
  if (a && !b.map.root) {
    c = b.config, d = b.$options.selectors, e = d3.select(d.map).attr("width", c.width).attr("height", c.height), f = e.selectAll(d.node), g = e.selectAll(d.edge), h = function() {
      b.config.origin.snap ? (a.nodes[a.origin].x = b.config.origin.position.x, a.nodes[a.origin].y = b.config.origin.position.y) : b.config.origin.position = {x:a.nodes[a.origin].x, y:a.nodes[a.origin].y};
      g.attr("x1", function(a) {
        return a.source.x - b.config.node.radius;
      }).attr("y1", function(a) {
        return a.source.y - b.config.node.radius;
      }).attr("x2", function(a) {
        return a.target.x - b.config.node.radius;
      }).attr("y2", function(a) {
        return a.target.y - b.config.node.radius;
      });
      f.attr("cx", function(a) {
        return a.x - b.config.node.radius;
      }).attr("cy", function(a) {
        return a.y - b.config.node.radius;
      });
      b.map.changed && (f.filter(d.selected).filter(function(a) {
        return b.map.detail !== a.key && b.map.compare !== a.key;
      }).classed({selected:!1}).transition().duration(150).ease("cubic").attr("r", c.node.radius), f.filter(function(a) {
        return b.map.detail === a.key || b.map.compare === a.key;
      }).classed({selected:!0}).transition().duration(150).ease("cubic").attr("r", c.node.radius * c.node.scaleFactor), b.map.changed = !1);
    }, k = d3.layout.force().size([c.width, c.height]).linkDistance(c.force.distance).linkStrength(c.force.strength).friction(c.force.friction).theta(c.force.theta).gravity(c.force.gravity).alpha(c.force.alpha).charge(function(a) {
      return b.map.detail === a.key || b.map.compare === a.key ? c.force.charge * Math.pow(c.node.scaleFactor, 2) : c.force.charge;
    }).on("tick", h), l = function() {
      var d = a.nodes, e = a.edges;
      k.nodes(d).links(e).start();
      g = g.data(e, function(a) {
        return a.key;
      });
      g.exit().remove();
      g.enter().insert("line", ".node").attr("id", function(a) {
        return "edge-" + a.key;
      }).attr("x1", function(a) {
        return a.source.x;
      }).attr("y1", function(a) {
        return a.source.y;
      }).attr("x2", function(a) {
        return a.target.x;
      }).attr("y2", function(a) {
        return a.target.y;
      }).attr("stroke-width", c.edge.width).attr("stroke", c.edge.stroke).attr("class", c.edge.classes);
      f = f.data(d, function(a) {
        return a.key;
      });
      f.exit().remove();
      f.enter().append("svg:circle").attr("id", function(a) {
        return "node-" + a.key;
      }).attr("cx", function(a) {
        return a.x;
      }).attr("cy", function(a) {
        return a.y;
      }).attr("r", c.node.radius).attr("width", c.sprite.width).attr("height", c.sprite.height).attr("class", function(a, c) {
        var d = a.classes.slice();
        if (b.map.detail === a.key || b.map.compare === a.key) {
          b.map.changed = !0;
        }
        return d.join(" ");
      }).call(k.drag);
      f.filter(function(b, c) {
        return b.key === a.origin_key;
      });
      b.map.changed && k.start();
    }, b.map.root = e, b.map.force = k, setTimeout(function() {
      l();
    }, 0);
  } else {
    return b.map.root = null, $(b.$options.selectors.map).innerHTML = "", b.draw(a);
  }
}, resize:function(a) {
  a = this.$el.clientWidth;
  var b = this.$el.clientHeight;
  this.config.width = a;
  this.config.height = b;
  this.map.root && this.map.root.attr("width", a).attr("height", b);
  this.config.origin.snap && (this.config.origin.position = {x:a / 2, y:b / 2});
  this.map.force && this.map.force.size([a, b]).resume();
}}, ready:function() {
  window.addEventListener("resize", this.resize);
}, beforeDestroy:function() {
  window.removeEventListener("resize", this.resize);
}, handler:function(a) {
  var b = this.$el.clientWidth, c = this.$el.clientHeight;
  this.config.width = b;
  this.config.height = c;
  this.config.origin.snap && (this.config.origin.position = this.config.origin.position || {}, this.config.origin.position = {x:b / 2, y:c / 2});
  a ? (this.draw(a), $(this.$options.selectors.map).classList.remove("transparent")) : (this.map.changed = !0, this.map.force.start());
}});
views.Page = Vue.extend({data:{page:{active:!1}, modal:null}, methods:{route:function(a) {
  var b;
  a.target && a.target.hasAttribute("data-route") ? (b = a.target.getAttribute("href"), a.preventDefault(), a.stopPropagation()) : b = a;
  this.$emit("route", b);
}}, ready:function() {
  this.$on("route", function(a) {
    services.router.route(a);
  });
}});
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
  d.data.init(b, function(a) {
    d.graph.init(a);
  });
  d.router.init(c, function(a) {
    d.ready(function() {
      d.history.init();
      if (a) {
        return d.router.route(a);
      }
    });
  });
  d.view.init("page", function() {
    this.$set("active", !0);
    this.$.stage.$set("active", !0);
    services.service._register("app", this);
    window._page = this;
    _go();
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