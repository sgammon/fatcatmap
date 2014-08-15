(function() {
var async = {}, CallbackMap;
var routes = {"/":function($request$$) {
  this.app.page = "page.map";
  this.app.$broadcast("page.map", this.graph.construct());
  return null;
}, "/login":function($request$$) {
}, "/settings":function($request$$) {
}, "/404":function($request$$) {
}, "/<key>":function($request$$) {
  var $_this$$ = this;
  $_this$$.data.get($request$$.args.key, {success:function($data$$) {
    $_this$$.app.$broadcast("detail", $data$$);
  }, error:function($e$$) {
    $request$$.error = $e$$;
    $_this$$.router.route("/404", $request$$);
  }});
  return null;
}, "/<key1>/and/<key2>":function($request$$) {
}};
var toArray = function $toArray$($list$$) {
  var $arr$$ = [], $i$$;
  for ($i$$ = 0;$i$$ < $list$$.length;$arr$$.push($list$$[$i$$++])) {
  }
  return $arr$$;
}, $ = function $$$($query$$, $bound$$) {
  if ($query$$ && $query$$.querySelector) {
    return $query$$;
  }
  $bound$$ = $bound$$ || document;
  if ("string" === typeof $query$$) {
    return "#" === $query$$.charAt(0) ? document.getElementById($query$$.slice(1)) : toArray($bound$$.querySelectorAll($query$$));
  }
  throw new TypeError("Invalid document query string.");
};
var config = {context:JSON.parse($("#js-context").textContent || "{}"), data:JSON.parse($("#js-data").textContent || "{}")};
var services = {}, Client = function $Client$($methods$$) {
  if ($methods$$) {
    for (var $k$$ in $methods$$) {
      $methods$$.hasOwnProperty($k$$) && (this[$k$$] = $methods$$[$k$$]);
    }
  }
};
Client.prototype = services;
Object.defineProperty(Function.prototype, "client", {value:function($methods$$) {
  var $fn$$ = this;
  return function() {
    return $fn$$.apply(new Client($methods$$), arguments);
  };
}});
Object.defineProperty(Function.prototype, "service", {value:function($name$$, $methods$$) {
  Client.prototype[$name$$] = this.client($methods$$);
  return Client.prototype[$name$$];
}});
Object.defineProperty(Object.prototype, "service", {value:function($name$$) {
  var $method$$;
  if (!$name$$ || "string" !== typeof $name$$) {
    throw new TypeError("service() requires a string name.");
  }
  if (this.constructor !== Object) {
    throw Error("service() can only be invoked on native objects.");
  }
  for (var $prop$$ in this) {
    this.hasOwnProperty($prop$$) && ($method$$ = this[$prop$$], $method$$ instanceof Function && (this[$prop$$] = $method$$.client()));
  }
  Client.prototype[$name$$] = this;
  return Client.prototype[$name$$];
}});
var supports = {cookies:navigator.cookieEnabled, retina:2 == window.devicePixelRatio, workers:!!window.Worker, sharedWorkers:!!window.SharedWorker, sockets:!!window.WebSocket, sse:!!window.EventSource, geo:!!navigator.geolocation, touch:0 < navigator.maxTouchPoints, history:{html5:!!window.history.pushState, hash:!!window.onhashchange}, storage:{local:!!window.localStorage, session:!!window.sessionStorage, indexed:!!window.IDBFactory}};
var urlutil = {addParams:function($url$$, $params$$) {
  var $needsAmp$$ = !0;
  -1 === $url$$.indexOf("?") && ($url$$ += "?", $needsAmp$$ = !1);
  for (var $k$$ in $params$$) {
    $params$$.hasOwnProperty($k$$) && (!0 === $needsAmp$$ ? $url$$ += "&" : $needsAmp$$ = !0, $url$$ += encodeURIComponent($k$$) + "=" + encodeURIComponent($params$$[$k$$]));
  }
  return $url$$;
}, parseParams:function($tuples_url$$) {
  var $params$$ = {};
  $tuples_url$$ = $tuples_url$$.split("?").pop().split("&");
  for (var $tuple$$, $v$$, $i$$ = 0;$i$$ < $tuples_url$$.length;$i$$++) {
    $tuple$$ = $tuples_url$$[$i$$].split("="), $v$$ = unescape($tuple$$[1]), $params$$[$tuple$$[0]] = "true" === $v$$ || "false" === $v$$ ? Boolean($v$$) : /^\d*$/.test($v$$) ? +$v$$ : $v$$;
  }
  return $params$$;
}, parse:function($host_url$$) {
  var $parsed$$ = {}, $chunks$$;
  $parsed$$.url = $host_url$$;
  $parsed$$.params = urlutil.parseParams($host_url$$);
  $chunks$$ = $host_url$$.split("//");
  if (2 === $chunks$$.length) {
    $parsed$$.protocol = $chunks$$.shift().slice(0, -1);
  } else {
    if (1 === $chunks$$.length) {
      $parsed$$.protocol = "";
    } else {
      throw Error("Can't parse malformed URL: " + $host_url$$);
    }
  }
  $chunks$$ = $chunks$$.shift().split("/");
  $host_url$$ = $chunks$$[0];
  "/" === $host_url$$.charAt(0) ? $parsed$$.hostname = $parsed$$.port = "" : ($host_url$$ = $chunks$$.shift().split("?").shift().split(":"), $parsed$$.hostname = $host_url$$[0], $parsed$$.port = $host_url$$[1] || "");
  $parsed$$.path = $chunks$$.join("/").split("?").shift();
  return $parsed$$;
}, join:function($var_args$$) {
  var $paths$$ = Array.prototype.slice.call(arguments), $base$$1_path$$ = $paths$$.shift(), $parts$$ = [];
  if (!$paths$$.length) {
    return $base$$1_path$$;
  }
  "/" === $base$$1_path$$.charAt($base$$1_path$$.length - 1) && ($base$$1_path$$ = $base$$1_path$$.slice(0, -1));
  for ($parts$$.push($base$$1_path$$);$paths$$.length;) {
    if ($base$$1_path$$ = $paths$$.shift()) {
      "/" === $base$$1_path$$.charAt(0) && ($base$$1_path$$ = $base$$1_path$$.slice(1)), "/" === $base$$1_path$$.charAt($base$$1_path$$.length - 1) && ($base$$1_path$$ = $base$$1_path$$.slice(0, -1)), $parts$$.push($base$$1_path$$);
    }
  }
  return $parts$$.join("/");
}};
var Diff, DIFF;
Diff = function $Diff$() {
  this._diff = {};
};
Diff.prototype.add = function $Diff$$add$($key$$, $diff$$) {
  var $k$$, $obj$$;
  if (this._diff[$key$$]) {
    $obj$$ = this._diff[$key$$];
    for ($k$$ in $diff$$) {
      $diff$$.hasOwnProperty($k$$) && ($obj$$[$k$$] = $diff$$[$k$$]);
    }
    this._diff[$key$$] = $obj$$;
  } else {
    this._diff[$key$$] = $diff$$;
  }
};
Diff.prototype.commit = function $Diff$$commit$() {
  var $diff$$ = this._diff;
  this._diff = !1;
  this.add = function $this$add$() {
    throw Error("Cannot add to committed diff.");
  };
  return $diff$$;
};
services.data = {init:function($raw$$) {
  DIFF = new Diff;
  this._watchers = {};
}, normalize:function($raw$$) {
  if ("string" === typeof $raw$$) {
    try {
      $raw$$ = JSON.parse($raw$$);
    } catch ($e$$) {
      $raw$$ = {};
    }
  }
  return $raw$$;
}, watch:function($key$$, $target$$, $fn$$) {
  if (!$key$$) {
    throw Error("services.data.watch() requires a string key.");
  }
  if (!$fn$$) {
    if ("function" !== typeof $target$$) {
      throw Error("services.data.watch() requires a watcher function.");
    }
    $fn$$ = $target$$;
    $target$$ = null;
  }
  this._watchers[$key$$] || (this._watchers[$key$$] = []);
  this._watchers[$key$$].push($target$$ ? $fn$$.bind($target$$) : function($obj$$) {
    $fn$$.call($obj$$, $obj$$);
  });
}, unwatch:function($key$$, $fn$$) {
  var $watchers$$, $i$$;
  if (this._watchers[$key$$]) {
    $watchers$$ = this._watchers[$key$$];
    if ($fn$$) {
      for ($i$$ = 0;$i$$ < $watchers$$.length;$i$$++) {
        if ($fn$$ === $watchers$$[$i$$]) {
          $watchers$$.splice($i$$, 1);
          break;
        }
      }
    } else {
      $watchers$$ = [];
    }
    this._watchers[$key$$] = $watchers$$;
  }
}}.service("data");
var _cache, _index, GRAPH;
_cache = {};
_index = {adjacency:{}, nodesByKey:{}, edgesByKey:{}, nativesByKey:{}, object_natives:{}};
services.graph = {init:function($raw$$) {
  return GRAPH = this.graph.construct(this.data.normalize($raw$$));
}, construct:function($data$$) {
  var $graph$$, $i$$, $key$$0$$, $targets$$, $source$$0$$, $makeEdge$$;
  if (!$data$$) {
    return GRAPH;
  }
  $graph$$ = $data$$.graph;
  $data$$ = $data$$.data;
  GRAPH = {nodes:[], edges:[], natives:[], origin:$graph$$.origin};
  $data$$.keys.forEach(function($key$$, $key_i$$) {
    _cache[$key$$] = $data$$.objects[$key_i$$];
  });
  $graph$$.natives.forEach(function($j_offset$$) {
    $j_offset$$ = $graph$$.edges + 1 + $j_offset$$;
    var $k$$ = $data$$.keys[$i$$];
    _index.nativesByKey[$k$$] || (_index.nativesByKey[$k$$] = GRAPH.natives.push({key:$k$$, data:$data$$.objects[$j_offset$$]}) - 1);
  });
  $i$$ = -1;
  for ($makeEdge$$ = function $$makeEdge$$$($source$$, $key$$) {
    return function($target$$) {
      var $_i$$;
      !_index.adjacency[$source$$] && _index.adjacency[$source$$][$target$$] && ($_i$$ = GRAPH.edges.push({edge:{key:$key$$, data:$data$$.objects[$i$$]}, native:_cache[$data$$.objects[$i$$].native], source:_index.nodesByKey[$source$$], target:_index.nodesByKey[$target$$]}) - 1, _index.edgesByKey[$key$$].push($_i$$), _index.adjacency[$source$$] = {}, _index.adjacency[$source$$][$target$$] = $_i$$);
    };
  };$i$$++ < $data$$.keys.length;) {
    $key$$0$$ = $data$$.keys[$i$$], $i$$ <= $graph$$.nodes ? _index.nodesByKey[$key$$0$$] || (_index.nodesByKey[$key$$0$$] = GRAPH.nodes.push({node:{key:$key$$0$$, data:_cache[$key$$0$$]}, native:{key:$data$$.objects[$i$$].native, data:_cache[$data$$.objects[$i$$].native]}})) : $i$$ <= $graph$$.edges && (_index.edgesByKey[$key$$0$$] || (_index.edgesByKey[$key$$0$$] = []), $targets$$ = $data$$.objects[$i$$].node.slice(), $source$$0$$ = $targets$$.shift(), $targets$$.forEach($makeEdge$$($source$$0$$, 
    $key$$0$$)));
  }
  return GRAPH;
}}.service("graph");
var Request, Response, _prepareRequest, _dispatch, _parseResponse;
_prepareRequest = function $_prepareRequest$($headers_method$$, $request$$, $handlers$$) {
  var $xhr$$ = new XMLHttpRequest, $url$$;
  $url$$ = $request$$.params ? urlutil.addParams($request$$.url, $request$$.params) : $request$$.url;
  $xhr$$.open($headers_method$$.toUpperCase(), $url$$, !!$handlers$$);
  if ($request$$.headers) {
    $headers_method$$ = $request$$.headers;
    for (var $k$$ in $headers_method$$) {
      $headers_method$$.hasOwnProperty($k$$) && $xhr$$.setRequestHeader($k$$, $headers_method$$[$k$$]);
    }
  }
  $xhr$$.data = $request$$.data;
  $handlers$$ ? ($xhr$$.onerror = $handlers$$.error, $xhr$$.onloadend = function $$xhr$$$onloadend$() {
    $xhr$$.responseJSON = _parseResponse($xhr$$);
    $handlers$$.success($xhr$$.responseJSON);
  }) : ($xhr$$.onerror = function $$xhr$$$onerror$($e$$) {
    $xhr$$.error = $e$$;
  }, $xhr$$.onloadend = function $$xhr$$$onloadend$() {
    $xhr$$.responseJSON = _parseResponse($xhr$$);
  });
  return $xhr$$;
};
_dispatch = function $_dispatch$($method$$, $request$$, $handlers$$) {
  var $data$$ = "object" === typeof $request$$.data ? JSON.stringify($request$$.data) : "string" === typeof $request$$.data ? $request$$.data : null == $request$$.data ? null : "" + $request$$.data;
  $method$$ = _prepareRequest($method$$, $request$$, $handlers$$);
  $method$$.send($data$$);
  return $method$$;
};
_parseResponse = function $_parseResponse$($chunks$$) {
  var $resp$$ = {}, $headers$$ = $chunks$$.getAllResponseHeaders().split("\n");
  try {
    $resp$$.data = JSON.parse($chunks$$.responseText);
  } catch ($e$$) {
    $resp$$.data = $chunks$$.responseText || "";
  }
  $resp$$.headers = {};
  for (var $i$$ = 0;$i$$ < $headers$$.length;$i$$++) {
    $headers$$[$i$$] && ($chunks$$ = $headers$$[$i$$].split(/^([^:]+):\s*/), $resp$$.headers[$chunks$$[1]] = $chunks$$[2]);
  }
  return $resp$$;
};
services.http = {get:function($request$$, $handlers$$) {
  return _dispatch("GET", $request$$, $handlers$$);
}, delete:function($request$$, $handlers$$) {
  return _dispatch("DELETE", $request$$, $handlers$$);
}, head:function($request$$, $handlers$$) {
  return _dispatch("HEAD", $request$$, $handlers$$);
}, post:function($request$$, $handlers$$) {
  return _dispatch("POST", $request$$, $handlers$$);
}, put:function($request$$, $handlers$$) {
  return _dispatch("PUT", $request$$, $handlers$$);
}, patch:function($request$$, $handlers$$) {
  return _dispatch("PATCH", $request$$, $handlers$$);
}, options:function($request$$, $handlers$$) {
  return _dispatch("OPTIONS", $request$$, $handlers$$);
}}.service("http");
var ROUTES = {resolved:[], dynamic:[]}, _routeEvents = {route:[], routed:[], error:[]}, _findRoute, Route, router;
_findRoute = function $_findRoute$($match_path$$, $request$$, $_routes$$) {
  for (var $i$$0$$ = 0, $route$$, $matched$$, $response$$, $setArg$$ = function $$setArg$$$($key$$, $i$$) {
    $request$$.args[$route$$.keys[$i$$]] = $key$$;
  };($route$$ = $_routes$$[$i$$0$$++]) && $route$$.id <= $match_path$$;) {
    if ($route$$.matcher.test($match_path$$)) {
      $matched$$ = !0;
      $match_path$$ = $match_path$$.match($route$$.matcher).slice(1);
      $match_path$$.forEach($setArg$$);
      $response$$ = $route$$.handler.call(new Client, $request$$);
      break;
    }
  }
  return{matched:$matched$$, response:$response$$};
};
Route = function $Route$($path$$, $handler$$) {
  var $rt$$ = this;
  $rt$$.keys = [];
  $rt$$.id = $path$$.replace(/\/<(\w+)>/, function($_$$, $leading$$, $key$$) {
    $rt$$.keys.push($key$$);
    return "/(\\w+)";
  });
  $rt$$.matcher = new RegExp("^" + $rt$$.id + "$");
  $rt$$.handler = $handler$$;
  $rt$$.resolved = 0 === $rt$$.keys.length;
};
services.router = {register:function($path$$, $handler$$) {
  var $inserted$$ = !1, $route$$, $_route$$, $_routes$$, $i$$;
  $route$$ = new Route($path$$, $handler$$);
  $_routes$$ = $route$$.resolved ? ROUTES.resolved : ROUTES.dynamic;
  if ($_routes$$.length) {
    for ($i$$ = 0;$i$$ < $_routes$$.length;$i$$++) {
      if ($_route$$ = $_routes$$[$i$$], !($_route$$.id < $route$$.id)) {
        $_routes$$.splice($i$$, 0, $route$$);
        $inserted$$ = !0;
        break;
      }
    }
    !1 === $inserted$$ && $_routes$$.push($route$$);
  } else {
    $_routes$$.push($route$$);
  }
}, route:function($path$$, $request$$) {
  var $params$$, $param$$, $response$$;
  $request$$ = $request$$ || {};
  $request$$.args = {};
  $request$$.params = $request$$.params || {};
  $params$$ = urlutil.parseParams($path$$);
  for ($param$$ in $params$$) {
    $params$$.hasOwnProperty($param$$) && ($request$$.params[$param$$] = $params$$[$param$$]);
  }
  _routeEvents.route.forEach(function($fn$$) {
    $fn$$($path$$, $request$$);
  });
  $response$$ = _findRoute($path$$, $request$$, ROUTES.resolved);
  if ($response$$.matched) {
    return $response$$ = $response$$.response, _routeEvents.routed.forEach(function($fn$$) {
      $fn$$($path$$, $request$$, $response$$);
    }), $response$$;
  }
  $response$$ = _findRoute($path$$, $request$$, ROUTES.dynamic);
  if ($response$$.matched) {
    return $response$$ = $response$$.response, _routeEvents.routed.forEach(function($fn$$) {
      $fn$$($path$$, $request$$, $response$$);
    }), $response$$;
  }
  $response$$ = {status:404};
  _routeEvents.error.forEach(function($fn$$) {
    $fn$$($path$$, $request$$, $response$$);
  });
  return $response$$;
}, on:function($event$$, $callback$$) {
  _routeEvents[$event$$] || (_routeEvents[$event$$] = []);
  _routeEvents[$event$$].push($callback$$);
}, off:function($event$$, $callback$$) {
  var $i$$;
  $callback$$ ? ($i$$ = _routeEvents[$event$$].indexOf($callback$$), -1 < $i$$ && _routeEvents[$event$$].splice($i$$, 1)) : _routeEvents[$event$$] = [];
}, init:function($_routes$$, $handleInitial$$) {
  for (var $k$$ in $_routes$$) {
    $_routes$$.hasOwnProperty($k$$) && "function" === typeof $_routes$$[$k$$] && this.router.register($k$$, $_routes$$[$k$$]);
  }
  $handleInitial$$ && $handleInitial$$(window.location.pathname.split("?").shift());
}}.service("router");
services.history = {push:supports.history.html5 ? function($url$$, $state$$) {
  window.history.pushState($state$$, "", $url$$);
} : function($url$$, $state$$) {
}, init:function() {
  var $hist$$ = this;
  $hist$$.router.on("routed", function($url$$, $request$$, $response$$) {
    "history" !== $request$$.source && services.history.push($url$$, $request$$.state);
  });
  supports.history.html5 && (window.onpopstate = function $window$onpopstate$($event$$) {
    $hist$$.router.route(window.location.pathname, {source:"history", state:$event$$.state || {}});
  });
  $hist$$.init = function $$hist$$$init$() {
    throw Error("History already started");
  };
}}.service("history");
var _baseURL = "/_rpc/v1/", RPCAPI;
RPCAPI = function $RPCAPI$($name$$, $methods$$, $config$$) {
  var $api$$ = this;
  $api$$.name = $name$$;
  $api$$.config = $config$$;
  $methods$$.forEach(function($method$$) {
    var $endpoint$$ = urlutil.join(_baseURL, $api$$.name + "." + $method$$);
    $api$$[$method$$] = function($request$$, $handlers$$) {
      var $req$$ = {url:$endpoint$$, data:$request$$.data || {}, params:$request$$.params || {}, headers:$request$$.headers || {}};
      $req$$.headers.Accept = "application/json";
      $req$$.headers["Content-Type"] = "application/json";
      return this.http.post($req$$, $handlers$$);
    }.client();
  });
};
services.rpc = {factory:function($manifest$$) {
  var $name$$ = $manifest$$[0];
  services.rpc[$name$$] = new RPCAPI($name$$, $manifest$$[1], $manifest$$[2]);
}, init:function($manifests$$) {
  $manifests$$.forEach(services.rpc.factory);
}}.service("rpc");
var TEMPLATES = {};
services.template = {put:function($filename$$, $source$$) {
  "string" === typeof $filename$$ && "string" === typeof $source$$ && (TEMPLATES[$filename$$] = $source$$);
}, get:function($filename$$, $callbacks$$) {
  if ("string" !== typeof $filename$$ || "function" !== typeof $callbacks$$.success || "function" !== typeof $callbacks$$.error) {
    throw new TypeError("template.get() requires a filename and CallbackMap.");
  }
  return TEMPLATES[$filename$$] ? $callbacks$$.success({data:TEMPLATES[$filename$$]}) : this.rpc.content.template({data:{path:$filename$$}}, $callbacks$$);
}, has:function($filename$$) {
  return!!TEMPLATES[$filename$$];
}, init:function($manifest$$) {
  for (var $k$$ in $manifest$$) {
    $manifest$$.hasOwnProperty($k$$) && "string" === typeof $manifest$$[$k$$] && services.template.put($k$$, $manifest$$[$k$$]);
  }
}}.service("template");
var VIEWS = {}, getSelfAndChildren = function $getSelfAndChildren$($viewname$$, $cb$$) {
  var $filename$$ = $viewname$$.replace(".", "/") + ".html";
  services.template.get($filename$$, {success:function($resp$$) {
    var $children$$ = [], $source$$, $count$$;
    if ("string" !== typeof $resp$$.data) {
      return $cb$$(!1, $resp$$);
    }
    $source$$ = $resp$$.data.replace(/v-component=("|')(\w+)\1/g, function($_$$, $__$$, $childname$$) {
      $children$$.push($childname$$);
      return $_$$;
    });
    $count$$ = $children$$.length;
    VIEWS[$viewname$$] && (VIEWS[$viewname$$].options.template = $source$$);
    services.template.put($filename$$, $source$$);
    if (0 === $count$$) {
      return $cb$$();
    }
    $children$$.forEach(function($childname$$) {
      getSelfAndChildren($childname$$, function() {
        $count$$ -= 1;
        0 === $count$$ && $cb$$($source$$);
      });
    });
  }, error:function($err$$) {
    $cb$$(!1, $err$$);
  }});
};
services.view = {put:function($viewname$$, $viewclass$$) {
  if ("string" !== typeof $viewname$$ || "function" !== typeof $viewclass$$) {
    throw new TypeError("services.view.put() takes a string name and constructor.");
  }
  return VIEWS[$viewname$$] = $viewclass$$;
}, get:function($viewname$$) {
  if ("string" !== typeof $viewname$$) {
    throw new TypeError("services.view.get() takes a string name.");
  }
  return VIEWS[$viewname$$];
}, init:function($rootname$$, $cb$$) {
  var $V$$ = services.view.get($rootname$$);
  if (!$V$$) {
    throw Error("view.init() cannot be called with unregistered view " + $rootname$$);
  }
  getSelfAndChildren($rootname$$, function($rootview_template$$) {
    document.body.innerHTML = "";
    $rootview_template$$ && ($V$$.options.template = $rootview_template$$);
    services.view.put($rootname$$, $V$$);
    $rootview_template$$ = new $V$$({ready:$cb$$, el:"body"});
    window.__ROOTVIEW = $rootview_template$$;
  });
}}.service("view");
window.__VIEWS = VIEWS;
var View = Vue.extend({});
View.extend = function $View$extend$($options$$5_view$$) {
  var $viewname$$ = $options$$5_view$$.viewname.toLowerCase(), $ready$$;
  if (!$viewname$$ || "string" !== typeof $viewname$$) {
    throw Error('AppView.extend() requires a "viewname" option to be passed.');
  }
  $options$$5_view$$.ready && ($ready$$ = $options$$5_view$$.ready);
  $options$$5_view$$.ready = function $$options$$5_view$$$ready$() {
    this.$options.handler && this.$on(this.$options.viewname, this.$options.handler.bind(this));
    $ready$$ && $ready$$.call(this);
  };
  $options$$5_view$$ = Vue.extend($options$$5_view$$);
  services.view.put($viewname$$, $options$$5_view$$);
  Vue.component($viewname$$, $options$$5_view$$);
  return $options$$5_view$$;
};
var views = {};
views.Detail = View.extend({viewname:"detail", replace:!0, data:{view:"", selected:null}, handler:function($data$$) {
  this.$set("view", $data$$.kind.toLowerCase());
  this.$set("selected", $data$$);
}});
views.Header = View.extend({viewname:"header", replace:!0});
views.Modal = View.extend({viewname:"modal", data:{active:!1, message:""}});
views.Stage = View.extend({viewname:"stage", replace:!0, data:{active:!0}});
views.Map = View.extend({viewname:"page.map", selectors:{map:"#map", edge:".edge", node:".node"}, data:{active:!0, graph:{root:null, force:null, edge:null, line:null, node:null, circle:null}, config:{width:0, height:0, force:{alpha:.75, strength:1, friction:.9, theta:.7, gravity:.1, charge:-700, distance:180}, origin:{snap:!0, dynamic:!0, position:null}, node:{radius:20, classes:["node"]}, labels:{enable:!1, distance:0}, edge:{width:2, stroke:"#999", classes:["link"]}, sprite:{width:60, height:60}}}, 
methods:{toggleSelected:function($e$$) {
}, addSelected:function($e$$) {
}, browseTo:function($e$$) {
}, draw:function($graph$$) {
  var $config$$, $node$$5_nodeWrap_selectors$$, $force$$, $root$$, $edge_edgeWrap$$, $line$$, $container$$, $lineTick$$, $nodeTick$$;
  this.graph.root ? (this.graph.root = null, $(this.$options.selectors.map).innerHTML = "", this.draw($graph$$)) : ($config$$ = this.config, $node$$5_nodeWrap_selectors$$ = this.$options.selectors, d3.scale.category20(), $force$$ = this.graph.force = d3.layout.force().size($config$$.width, $config$$.height).linkDistance($config$$.force.distance).charge($config$$.force.charge).linkStrength($config$$.force.strength).friction($config$$.force.friction).theta($config$$.force.theta).gravity($config$$.force.gravity).alpha($config$$.force.alpha), 
  $root$$ = this.graph.root = d3.select($node$$5_nodeWrap_selectors$$.map), $edge_edgeWrap$$ = $root$$.selectAll($node$$5_nodeWrap_selectors$$.edge).data($graph$$.edges).enter(), $edge_edgeWrap$$ = this.graph.edge = $edge_edgeWrap$$.append("svg:svg").attr("id", function($e$$) {
    return "edge-" + $e$$.edge.key;
  }), $line$$ = this.graph.line = $edge_edgeWrap$$.append("svg:line").attr("stroke", $config$$.edge.stroke).attr("class", $config$$.edge.classes).style("stroke-width", $config$$.edge.width), $node$$5_nodeWrap_selectors$$ = $root$$.selectAll($node$$5_nodeWrap_selectors$$.node).data($graph$$.nodes).enter(), $container$$ = $node$$5_nodeWrap_selectors$$.append("svg:svg").attr("id", function($n$$) {
    return "group-" + $n$$.node.key;
  }).attr("width", $config$$.sprite.width).attr("height", $config$$.sprite.height).call($force$$.drag), $node$$5_nodeWrap_selectors$$ = this.graph.node = $container$$.append("svg:g").attr("width", $config$$.sprite.width).attr("height", $config$$.sprite.height).attr("class", function($d$$, $i$$) {
    var $classes$$ = [];
    $d$$.native.data.govtrack_id ? ($classes$$.push("legislator"), $classes$$.push("M" === $d$$.native.data.gender ? "male" : "female"), $classes$$.push(Math.ceil(100 * Math.random()) % 2 ? "democrat" : "republican")) : ($classes$$.push("contributor"), $classes$$.push("C" == $d$$.native.data.contributor_type ? "corporate" : "individual"));
    return $classes$$.join(" ");
  }), this.graph.circle = $node$$5_nodeWrap_selectors$$.append("svg:circle").attr("r", $config$$.node.radius).attr("cx", $config$$.sprite.width / 2).attr("cy", $config$$.sprite.height / 2).attr("class", $config$$.node.classes), $lineTick$$ = function $$lineTick$$$($direction$$, $pt$$, $edge_d$$, $edge_i$$) {
    return $config$$.origin.snap && $edge_d$$[$direction$$].index === $graph$$.origin ? Math.floor($config$$.origin.position($pt$$)) : Math.floor($edge_d$$[$direction$$][$pt$$] + $config$$.node.radius / 2);
  }, $nodeTick$$ = function $$nodeTick$$$($pt$$, $node_d$$, $node_i$$) {
    return $config$$.origin.snap && $node_i$$ === $graph$$.origin ? Math.floor($config$$.origin.position[$pt$$] - $config$$.sprite["x" === $pt$$ ? "width" : "height"] / 2) : Math.floor($node_d$$[$pt$$] - $config$$.node.radius);
  }, $force$$.on("tick", function($centerX_f$$) {
    var $centerY$$;
    $centerX_f$$ = $config$$.width / 2;
    $centerY$$ = $config$$.height / 2;
    $config$$.origin.dynamic && $config$$.origin.snap && (this.config.origin.position = {x:$centerX_f$$ + $config$$.sprite.width / 2, y:$centerY$$ + $config$$.sprite.height / 2});
    ["x", "y"].forEach(function($pt$$) {
      $container$$.attr($pt$$, function($d$$, $i$$) {
        $nodeTick$$($pt$$, $d$$, $i$$);
      });
    });
    ["x1", "y1", "x2", "y2"].forEach(function($pt$$) {
      $line$$.attr($pt$$, function($d$$, $i$$) {
        $lineTick$$("1" === $pt$$[1] ? "source" : "target", $pt$$[0], $d$$, $i$$);
      });
    });
  }), $force$$.nodes($graph$$.nodes).links($graph$$.edges).start());
}}, ready:function() {
  var $view$$ = this, $width$$ = this.$el.offsetWidth, $height$$0$$ = this.$el.offsetHeight;
  this.config.width = $width$$;
  this.config.height = $height$$0$$;
  this.config.origin.position = {x:$width$$ - 30, y:$height$$0$$ - 30};
  window.addEventListener("resize", function($e$$24_width$$) {
    $e$$24_width$$ = document.body.clientWidth;
    var $height$$ = document.body.clientHeight;
    $view$$.config.graph.width = $e$$24_width$$;
    $view$$.config.graph.height = $height$$;
    $view$$.graph.root && $view$$.graph.root.attr("width", $e$$24_width$$).attr("height", $height$$);
    $view$$.graph.force && $view$$.graph.force.size([$e$$24_width$$, $height$$]).resume();
  });
}, handler:function($graph$$) {
  this.draw($graph$$);
}});
views.Page = Vue.extend({data:{page:{name:"page.map"}, active:!1, modal:null}, methods:{route:function($e$$) {
  if ($e$$.target.hasAttribute("data-route")) {
    var $route$$ = $e$$.target.getAttribute("href");
    $e$$.preventDefault();
    $e$$.stopPropagation();
    services.router.route($route$$);
  }
}}});
services.view.put("page", views.Page);
var _ready, _go, catnip;
_ready = [];
_go = function $_go$() {
  var $cbs$$ = _ready;
  _ready = null;
  $cbs$$.forEach(function($fn$$) {
    $fn$$();
  });
};
catnip = function($context$$, $data$$, $routes$$) {
  var $fcm$$ = this;
  $fcm$$._context = $context$$;
  $fcm$$.session = null;
  $context$$.session && $context$$.session.established && ($fcm$$.session = $context$$.session.payload);
  $context$$.services && $context$$.protocol.rpc.enabled && $fcm$$.rpc.init($context$$.services);
  $context$$.template.manifest && $fcm$$.template.init($context$$.template.manifest);
  $fcm$$.view.init("page", function() {
    this.$set("active", !0);
    Client.prototype.app = this;
    _go();
  });
  $fcm$$.router.init($routes$$, function($initialRoute$$) {
    $fcm$$.ready(function() {
      $fcm$$.history.init();
      if ($initialRoute$$) {
        return $fcm$$.router.route($initialRoute$$);
      }
    });
  });
  return this;
}.client({ready:function($cb$$) {
  if ($cb$$) {
    if (!_ready) {
      return $cb$$();
    }
    _ready.push($cb$$);
  }
}});
var init = {};
window.catnip_beta = catnip(config.context, config.data, routes);

})();

//# sourceMappingURL=../../../../.develop/maps/fatcatmap/assets/js/app.debug.js.map