(function() {
var async = {}, CallbackMap;
Object.defineProperty(Function.prototype, "throttle", {value:function($interval$$) {
  var $fn$$ = this, $timerID$$, $args$$, $that$$;
  return function() {
    $args$$ = arguments;
    $that$$ = this;
    $timerID$$ || setTimeout(function() {
      $timerID$$ = null;
      $fn$$.apply($that$$, $args$$);
    }, $interval$$);
  };
}});
var routes = {"/":function($request_state$$) {
  $request_state$$ = $request_state$$.state || {};
  var $app$$ = this.app, $graph$$ = $app$$.$.stage && $app$$.$.stage.$.map.active ? null : this.graph.construct();
  $request_state$$.page = $request_state$$.page || {active:!0};
  $request_state$$.modal = $request_state$$.modal || null;
  $app$$.$set("page", $request_state$$.page);
  $app$$.$set("modal", $request_state$$.modal);
  $app$$.nextTick(function() {
    $app$$.$broadcast("page.map", $graph$$);
    $app$$.$broadcast("detail");
  });
  return $request_state$$;
}, "/login":function($request$$1_state$$) {
  $request$$1_state$$ = $request$$1_state$$.state || {};
  $request$$1_state$$.page = null;
  $request$$1_state$$.modal = $request$$1_state$$.modal || {viewname:"page.login", data:{session:this.catnip.session}};
  this.app.$set("modal", $request$$1_state$$.modal);
  this.app.$set("page", $request$$1_state$$.page);
  this.app.$.stage && (this.app.$.stage.$.map.active = !1);
  return $request$$1_state$$;
}, "/settings":function($request$$) {
}, "/404":function($request$$) {
}, "/<key>":function($request$$4_state$$) {
  var $data$$0$$ = this.data, $app$$ = this.app, $key$$ = $request$$4_state$$.args.key;
  $request$$4_state$$ = $request$$4_state$$.state || {};
  var $graph$$ = $app$$.$.stage && $app$$.$.stage.$.map.active ? null : this.graph.construct();
  $request$$4_state$$.page = $request$$4_state$$.page || {active:!0};
  $request$$4_state$$.modal = $request$$4_state$$.modal || null;
  $app$$.$set("page", $request$$4_state$$.page);
  $app$$.$set("modal", $request$$4_state$$.modal);
  $app$$.nextTick(function() {
    $app$$.$broadcast("page.map", $graph$$);
    $data$$0$$.get($key$$, {success:function($data$$) {
      $app$$.$broadcast("detail", [$data$$]);
    }, error:function($e$$) {
      $app$$.$emit("route", "/404", {error:$e$$});
    }});
  });
  return $request$$4_state$$;
}, "/<key1>/and/<key2>":function($request$$5_state$$) {
  var $data$$0$$ = this.data, $app$$ = this.app, $key1$$ = $request$$5_state$$.args.key1, $key2$$ = $request$$5_state$$.args.key2;
  $request$$5_state$$ = $request$$5_state$$.state || {};
  var $graph$$ = $app$$.$.stage && $app$$.$.stage.$.map.active ? null : this.graph.construct();
  $request$$5_state$$.page = $request$$5_state$$.page || {active:!0};
  $request$$5_state$$.modal = $request$$5_state$$.modal || null;
  $app$$.$set("page", $request$$5_state$$.page);
  $app$$.$set("modal", $request$$5_state$$.modal);
  $app$$.nextTick(function() {
    $app$$.$broadcast("page.map", $graph$$);
    $data$$0$$.getAll([$key1$$, $key2$$], {success:function($data$$) {
      $app$$.$broadcast("detail", $data$$);
    }, error:function($e$$) {
      $app$$.$emit("route", "/404", {error:$e$$});
    }});
  });
  return $request$$5_state$$;
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
var services = {}, ServiceContext, Service;
ServiceContext = function $ServiceContext$() {
};
ServiceContext.prototype = {};
ServiceContext.register = function $ServiceContext$register$($name$$, $service$$) {
  return ServiceContext.prototype[$name$$] = $service$$;
};
Service = function $Service$($name$$, $methods$$) {
  if ("string" !== typeof $name$$) {
    throw new TypeError("Service() requires a service name to register.");
  }
  if ($methods$$) {
    for (var $k$$ in $methods$$) {
      $methods$$.hasOwnProperty($k$$) && $methods$$[$k$$] instanceof Function && (this[$k$$] = $methods$$[$k$$].__injected__ ? $methods$$[$k$$] : $methods$$[$k$$].inject());
    }
  }
  ServiceContext.register($name$$, this);
};
Service.prototype = new ServiceContext;
Object.defineProperty(Function.prototype, "inject", {value:function($_services_injector$$) {
  var $fn$$ = this, $inject$$, $injected$$;
  if ($fn$$.__injected__) {
    return $fn$$;
  }
  $_services_injector$$ || ($_services_injector$$ = []);
  if ($_services_injector$$ && !Array.isArray($_services_injector$$)) {
    if ("string" !== typeof $_services_injector$$) {
      throw new TypeError("inject() requires a service name or list of names.");
    }
    $_services_injector$$ = [$_services_injector$$];
  }
  $_services_injector$$.forEach(function($serviceName$$) {
    $inject$$ || ($inject$$ = {});
    $inject$$[$serviceName$$] = ServiceContext.prototype[$serviceName$$];
  });
  $injected$$ = function $$injected$$$() {
  };
  $injected$$.prototype = $inject$$ || new ServiceContext;
  $_services_injector$$ = function $$_services_injector$$$() {
    return $fn$$.apply(new $injected$$, arguments);
  };
  $_services_injector$$.__injected__ = services.length ? services : !0;
  return $_services_injector$$;
}});
Object.defineProperty(Function.prototype, "service", {value:function($name$$) {
  return ServiceContext.register($name$$, this.inject());
}});
Object.defineProperty(Object.prototype, "service", {value:function($name$$) {
  return new Service($name$$, this);
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
var _dataCache, watchers, _resolveAndSet;
_dataCache = {};
watchers = {};
_resolveAndSet = function $_resolveAndSet$($key$$, $data$$) {
  for (var $keys$$ = $key$$.split("."), $obj$$ = _dataCache;1 < $keys$$.length;) {
    $key$$ = $keys$$.shift(), $obj$$ = $obj$$[$key$$] || ($obj$$[$key$$] = {}, $obj$$[$key$$]);
  }
  $obj$$[$keys$$.shift()] = $data$$;
};
services.data = {init:function($raw$$, $cb$$) {
  var $data$$ = this.data.normalize($raw$$), $keys$$ = $data$$.data.keys, $objects$$ = $data$$.data.objects, $key$$, $object$$, $i$$;
  for ($i$$ = 0;$keys$$ && $i$$ < $keys$$.length;$i$$++) {
    $key$$ = $keys$$[$i$$], $object$$ = $objects$$[$i$$], $object$$.key || ($object$$.key = $key$$), $object$$.native || ($object$$.kind = $object$$.govtrack_id ? "legislator" : "contributor"), _dataCache[$key$$] = $object$$;
  }
  window.DATACACHE = _dataCache;
  $cb$$($data$$);
}, normalize:function($raw$$) {
  if ("string" === typeof $raw$$) {
    try {
      $raw$$ = JSON.parse($raw$$);
    } catch ($e$$) {
      console.warn("[service.data] Couldn't parse raw data: "), console.warn($raw$$), $raw$$ = {};
    }
  }
  return $raw$$;
}, get:function($key$$, $cbs$$) {
  var $item$$, $nativeKey$$;
  if (Array.isArray($key$$)) {
    return this.data.getAll($key$$, $cbs$$);
  }
  if ($item$$ = _dataCache[$key$$]) {
    return($nativeKey$$ = $item$$.native) && "string" === typeof $nativeKey$$ && (_dataCache[$nativeKey$$] ? (_dataCache[$nativeKey$$].node_key = $key$$, this.data.set($key$$ + ".native", _dataCache[$nativeKey$$])) : this.data.get($nativeKey$$, {success:function($data$$) {
      $data$$.node_key = $key$$;
      services.data.set($key$$ + ".native", $data$$);
      services.data.set($nativeKey$$, $data$$);
    }, error:function($e$$) {
    }})), $cbs$$.success($item$$);
  }
  debugger;
}, getAll:function($keys$$, $cbs$$) {
  var $items$$ = [], $shouldErr$$ = !0;
  $keys$$.forEach(function($key$$, $i$$) {
    services.data.get($key$$, {success:function($data$$) {
      $items$$[$i$$] = $data$$;
      $items$$.length === $keys$$.length && $cbs$$.success($items$$);
    }, error:function($e$$) {
      $shouldErr$$ && ($shouldErr$$ = !1, $cbs$$.error($e$$));
    }});
  });
}, set:function($key$$, $data$$) {
  var $_watchers$$ = watchers[$key$$];
  _resolveAndSet($key$$, $data$$);
  $_watchers$$ && $_watchers$$.length && $_watchers$$.forEach(function($watcher$$) {
    $watcher$$($data$$);
  });
}, watch:function($key$$, $watcher$$) {
  watchers[$key$$] || (watchers[$key$$] = []);
  watchers[$key$$].push($watcher$$);
}, unwatch:function($key$$, $watcher$$) {
  var $_watchers$$ = $watcher$$;
  $watcher$$ && "function" === typeof $watcher$$ ? watchers[$key$$] = watchers[$key$$].filter(function($w$$) {
    return $w$$ === $watcher$$;
  }) : ($_watchers$$ = watchers[$key$$], watchers[$key$$] = []);
  return $_watchers$$;
}}.service("data");
var _graphCache, _graphIndex, GRAPH;
_graphCache = {};
_graphIndex = {adjacency:{}, nodesByKey:{}, edgesByKey:{}};
services.graph = {init:function($data$$) {
  return GRAPH = this.graph.construct($data$$.graph, $data$$.data);
}, construct:function($graph$$, $data$$) {
  if (!$graph$$) {
    return GRAPH;
  }
  GRAPH = {nodes:[], edges:[], natives:[], origin:$graph$$.origin, origin_key:$data$$.keys[$graph$$.origin]};
  return this.graph.add($graph$$, $data$$);
}, add:function($graph$$, $data$$) {
  var $makeEdge$$, $i$$, $keys$$, $key$$0$$, $node$$, $native_nativeKey$$1_source$$;
  $makeEdge$$ = function $$makeEdge$$$($source$$, $key$$) {
    return function($target$$) {
      var $_i$$;
      if (!_graphIndex.adjacency[$source$$] || !_graphIndex.adjacency[$source$$][$target$$]) {
        if (null == _graphIndex.nodesByKey[$source$$] || null == _graphIndex.nodesByKey[$target$$]) {
          debugger;
        }
        $_i$$ = GRAPH.edges.push({key:$key$$, source:_graphIndex.nodesByKey[$source$$], target:_graphIndex.nodesByKey[$target$$]}) - 1;
        _graphIndex.edgesByKey[$key$$].push($_i$$);
        _graphIndex.adjacency[$source$$] = {};
        _graphIndex.adjacency[$source$$][$target$$] = $_i$$;
      }
    };
  };
  $i$$ = 0;
  for ($keys$$ = $data$$.keys;$i$$ < $keys$$.length;) {
    $key$$0$$ = $keys$$[$i$$], $i$$ <= $graph$$.nodes ? _graphIndex.nodesByKey[$key$$0$$] || ($node$$ = {key:$key$$0$$, classes:["node"]}, $native_nativeKey$$1_source$$ = $data$$.objects[$i$$].native, $native_nativeKey$$1_source$$ = $data$$.objects[$keys$$.indexOf($native_nativeKey$$1_source$$)], $native_nativeKey$$1_source$$.govtrack_id ? ($node$$.classes.push("legislator"), $node$$.classes.push("M" === $native_nativeKey$$1_source$$.gender ? "male" : "female"), $node$$.classes.push(Math.ceil(100 * 
    Math.random()) % 2 ? "democrat" : "republican"), .1869 > Math.random() && $node$$.classes.push("senate")) : ($node$$.classes.push("contributor"), $node$$.classes.push("C" == $native_nativeKey$$1_source$$.contributor_type ? "corporate" : "individual")), _graphIndex.nodesByKey[$key$$0$$] = GRAPH.nodes.push($node$$) - 1) : $i$$ <= $graph$$.edges && (_graphIndex.edgesByKey[$key$$0$$] || (_graphIndex.edgesByKey[$key$$0$$] = []), $node$$ = $data$$.objects[$i$$].node.slice(), $native_nativeKey$$1_source$$ = 
    $node$$.shift(), $node$$.forEach($makeEdge$$($native_nativeKey$$1_source$$, $key$$0$$))), $i$$++;
  }
  return this.graph.get();
}, get:function() {
  return GRAPH;
}}.service("graph");
var Request, Response, _prepareRequest, _dispatchRequest, _parseResponse;
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
_dispatchRequest = function $_dispatchRequest$($method$$, $request$$, $handlers$$) {
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
  return _dispatchRequest("GET", $request$$, $handlers$$);
}, delete:function($request$$, $handlers$$) {
  return _dispatchRequest("DELETE", $request$$, $handlers$$);
}, head:function($request$$, $handlers$$) {
  return _dispatchRequest("HEAD", $request$$, $handlers$$);
}, post:function($request$$, $handlers$$) {
  return _dispatchRequest("POST", $request$$, $handlers$$);
}, put:function($request$$, $handlers$$) {
  return _dispatchRequest("PUT", $request$$, $handlers$$);
}, patch:function($request$$, $handlers$$) {
  return _dispatchRequest("PATCH", $request$$, $handlers$$);
}, options:function($request$$, $handlers$$) {
  return _dispatchRequest("OPTIONS", $request$$, $handlers$$);
}}.service("http");
var ROUTES = {resolved:[], dynamic:[]}, ROUTE_EVENTS = {route:[], routed:[], error:[]}, _dispatchRoute, Route, router;
_dispatchRoute = function $_dispatchRoute$($match_path$$, $request$$, $_routes$$) {
  for (var $i$$0$$ = 0, $route$$, $matched$$, $response$$, $setArg$$ = function $$setArg$$$($key$$, $i$$) {
    $request$$.args[$route$$.keys[$i$$]] = $key$$;
  };($route$$ = $_routes$$[$i$$0$$++]) && $route$$.id <= $match_path$$;) {
    if ($route$$.matcher.test($match_path$$)) {
      $matched$$ = !0;
      $match_path$$ = $match_path$$.match($route$$.matcher).slice(1);
      $match_path$$.forEach($setArg$$);
      $response$$ = $route$$.handler.call(new ServiceContext, $request$$);
      break;
    }
  }
  return{matched:$matched$$, response:$response$$};
};
Route = function $Route$($path$$, $handler$$) {
  var $rt$$ = this;
  $rt$$.keys = [];
  $rt$$.id = $path$$.replace(/\/<(\w+)>/g, function($_$$, $key$$) {
    $rt$$.keys.push($key$$);
    return "/(\\w+)";
  });
  $rt$$.matcher = new RegExp("^" + $rt$$.id + "$");
  $rt$$.handler = $handler$$;
  $rt$$.resolved = 0 === $rt$$.keys.length;
};
services.router = {register:function($path$$, $handler$$) {
  var $route$$, $routes$$, $i$$;
  $route$$ = new Route($path$$, $handler$$);
  $routes$$ = $route$$.resolved ? ROUTES.resolved : ROUTES.dynamic;
  for ($i$$ = 0;$i$$ < $routes$$.length;$i$$++) {
    if ($routes$$[$i$$].id > $route$$.id) {
      $routes$$.splice($i$$, 0, $route$$);
      return;
    }
  }
  $routes$$.push($route$$);
}, route:function($path$$, $request$$) {
  var $params$$, $param$$, $response$$;
  $request$$ = $request$$ || {};
  $request$$.args = {};
  $request$$.params = $request$$.params || {};
  $params$$ = urlutil.parseParams($path$$);
  for ($param$$ in $params$$) {
    $params$$.hasOwnProperty($param$$) && ($request$$.params[$param$$] = $params$$[$param$$]);
  }
  ROUTE_EVENTS.route.forEach(function($fn$$) {
    $fn$$($path$$, $request$$);
  });
  $response$$ = _dispatchRoute($path$$, $request$$, ROUTES.resolved);
  $response$$.matched || ($response$$ = _dispatchRoute($path$$, $request$$, ROUTES.dynamic));
  $response$$.matched ? ($response$$ = $response$$.response, ROUTE_EVENTS.routed.forEach(function($fn$$) {
    $fn$$($path$$, $request$$, $response$$);
  })) : ($response$$ = {status:404}, ROUTE_EVENTS.error.forEach(function($fn$$) {
    $fn$$($path$$, $request$$, $response$$);
  }));
  return $response$$;
}, on:function($event$$, $callback$$) {
  ROUTE_EVENTS[$event$$] || (ROUTE_EVENTS[$event$$] = []);
  ROUTE_EVENTS[$event$$].push($callback$$);
}, off:function($event$$, $callback$$) {
  var $i$$;
  $callback$$ ? ($i$$ = ROUTE_EVENTS[$event$$].indexOf($callback$$), -1 < $i$$ && ROUTE_EVENTS[$event$$].splice($i$$, 1)) : ROUTE_EVENTS[$event$$] = [];
}, init:function($routes$$, $handleInitial$$) {
  for (var $k$$ in $routes$$) {
    $routes$$.hasOwnProperty($k$$) && "function" === typeof $routes$$[$k$$] && this.router.register($k$$, $routes$$[$k$$]);
  }
  $handleInitial$$ && $handleInitial$$(window.location.pathname);
}}.service("router");
services.history = {push:function($url$$, $state$$) {
  supports.history.html5 && window.history.pushState($state$$, "", $url$$);
}, init:function() {
  var $hist$$ = this;
  $hist$$.router.on("routed", function($url$$, $request$$, $response$$) {
    "history" !== $request$$.source && services.history.push($url$$, $response$$.state);
  });
  $hist$$.router.back = function $$hist$$$router$back$() {
    window.history.back();
  };
  $hist$$.router.forward = function $$hist$$$router$forward$() {
    window.history.forward();
  };
  supports.history.html5 && (window.onpopstate = function $window$onpopstate$($event$$) {
    $hist$$.router.route(window.location.pathname, {source:"history", state:$event$$.state || {}});
  });
  $hist$$.init = function $$hist$$$init$() {
    throw Error("History already started");
  };
}}.service("history");
var _baseRPCURL = "/_rpc/v1/", RPCAPI;
RPCAPI = function $RPCAPI$($name$$, $methods$$, $config$$) {
  var $api$$ = this;
  $api$$.name = $name$$;
  $api$$.config = $config$$;
  $methods$$.forEach(function($method$$) {
    var $endpoint$$ = urlutil.join(_baseRPCURL, $api$$.name + "." + $method$$);
    $api$$[$method$$] = function($request$$, $handlers$$) {
      var $req$$ = {url:$endpoint$$, data:$request$$.data || {}, params:$request$$.params || {}, headers:$request$$.headers || {}};
      $req$$.headers.Accept = "application/json";
      $req$$.headers["Content-Type"] = "application/json";
      return this.http.post($req$$, $handlers$$);
    }.inject("http");
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
    $source$$ = $resp$$.data.replace(/v-component=("|')([\w\.\-]+)\1/g, function($_$$, $__$$, $childname$$) {
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
  VIEWS[$viewname$$] = $viewclass$$;
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
    var $viewname$$, $view$$;
    document.body.innerHTML = "";
    $rootview_template$$ && ($V$$.options.template = $rootview_template$$);
    services.view.put($rootname$$, $V$$);
    $rootview_template$$ = new $V$$({ready:$cb$$, el:"body"});
    window.__ROOTVIEW = $rootview_template$$;
    for ($viewname$$ in VIEWS) {
      VIEWS.hasOwnProperty($viewname$$) && ($view$$ = VIEWS[$viewname$$], $view$$.options.template || getSelfAndChildren($viewname$$, function($template$$) {
        $template$$ && ($view$$.options.template = $template$$);
        services.view.put($viewname$$, $view$$);
      }));
    }
  });
}}.service("view");
window.__VIEWS = VIEWS;
var View = Vue.extend({});
View.extend = function $View$extend$($options$$5_view$$) {
  var $viewname$$ = $options$$5_view$$.viewname.toLowerCase(), $ready$$ = $options$$5_view$$.ready;
  if (!$viewname$$ || "string" !== typeof $viewname$$) {
    throw Error('View.extend() requires a "viewname" option to be passed.');
  }
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
views.Detail = View.extend({viewname:"detail", replace:!0, data:{left:null, right:null, leftview:"", rightview:""}, methods:{close:function($e$$23_keys$$) {
  var $parent$$ = $e$$23_keys$$.target.parentNode, $key$$;
  $parent$$.classList.contains("close") && ($e$$23_keys$$.preventDefault(), $e$$23_keys$$.stopPropagation(), $key$$ = this[$parent$$.parentNode.getAttribute("id").split("_").pop()].key, $e$$23_keys$$ = this.keys(), $key$$ = $e$$23_keys$$.indexOf($key$$), -1 < $key$$ && ($key$$ = Math.abs($key$$ - 1), $e$$23_keys$$ = $e$$23_keys$$[$key$$] ? [$e$$23_keys$$[$key$$]] : []), $parent$$.classList.add("transparent"), this.$root.$emit("route", "/" + (1 < $e$$23_keys$$.length ? $e$$23_keys$$.join("/and/") : 
  $e$$23_keys$$[0] || "")));
}, keys:function() {
  var $keys$$ = [];
  this.left && $keys$$.push(this.left.key);
  this.right && $keys$$.push(this.right.key);
  return $keys$$;
}, select:function($keys$$) {
  var $detail$$ = this, $left$$, $right$$;
  $keys$$ && $keys$$.length && (2 < $keys$$.length && ($keys$$ = $keys$$.slice(0, 2)), $keys$$.forEach(function($node$$) {
    $detail$$.left && $detail$$.left.key === $node$$.key ? $left$$ = $node$$ : $detail$$.right && $detail$$.right.key === $node$$.key ? $right$$ = $node$$ : $left$$ ? $right$$ = $node$$ : $left$$ = $node$$;
  }));
  $keys$$ = [];
  $left$$ && ($detail$$.$set("leftview", "detail." + $left$$.native.kind.toLowerCase()), $keys$$.push($left$$.key));
  $right$$ && ($detail$$.$set("rightview", "detail." + $right$$.native.kind.toLowerCase()), $keys$$.push($right$$.key));
  $detail$$.$set("left", $left$$);
  $detail$$.$set("right", $right$$);
  $detail$$.$parent.$set("map.selected", $keys$$);
  $detail$$.$parent.$set("map.changed", !0);
}}, handler:function($nodes$$) {
  this.select($nodes$$);
}});
views.Modal = View.extend({viewname:"modal", methods:{close:function($e$$) {
  $e$$ && ($e$$.preventDefault(), $e$$.stopPropagation());
  services.router.back();
}}});
views.detail = {};
views.detail.Legislator = View.extend({viewname:"detail.legislator", replace:!0, data:{key:null, kind:null, fec_id:"", bioguideid:"", govtrack_id:"", thomas_id:"", osid:"", lismemberid:null, icpsrid:null, fbid:null, twitterid:null, metavidid:null, pvsid:null, firstname:"", lastname:"", gender:"", birthday:"", lastnameenc:"", lastnamealt:null, namemod:null, nickname:null, religion:null}, attached:function() {
  var $el$$ = this.$el, $parent$$ = $el$$.parentNode, $transitionListener$$ = function $$transitionListener$$$($e$$) {
    $parent$$.removeEventListener("transitionend", $transitionListener$$);
    $parent$$.removeEventListener("webkitTransitionEnd", $transitionListener$$);
    $el$$.classList.remove("v-enter");
  };
  $parent$$.addEventListener("webkitTransitionEnd", $transitionListener$$);
  $parent$$.addEventListener("transitionend", $transitionListener$$);
  $el$$.classList.add("v-enter");
}});
views.Header = View.extend({viewname:"layout.header", replace:!0});
views.Stage = View.extend({viewname:"layout.stage", replace:!0});
views.Login = View.extend({viewname:"page.login", replace:!0, methods:{login:function($e$$) {
  $e$$.preventDefault();
  $e$$.stopPropagation();
}}, data:{session:null}});
views.Map = View.extend({viewname:"page.map", replace:!0, selectors:{map:"#map", edge:".edge", node:".node", selected:".selected"}, data:{map:{selected:[], changed:!1}, config:{width:0, height:0, force:{alpha:.75, strength:1, friction:.9, theta:.7, gravity:.1, charge:-600, distance:180}, origin:{snap:!1, dynamic:!1, position:null}, node:{radius:25, scaleFactor:1.6, classes:["node"]}, labels:{enable:!1, distance:0}, edge:{width:2, stroke:"#999", classes:["link"]}, sprite:{width:60, height:60}}, dragging:!1, 
active:!1}, methods:{isNode:function($element$$) {
  return $element$$.classList.contains("node");
}, isEdge:function($element$$) {
  return $element$$.classList.contains("link");
}, viewDetail:function($e$$) {
  var $target$$, $key$$, $selected$$;
  this.dragging || ($target$$ = $e$$.target, $key$$ = $target$$.id.split("-").pop(), this.isNode($target$$) && ($e$$.preventDefault(), $e$$.stopPropagation(), $selected$$ = this.$.detail.keys(), $target$$.classList.contains(this.$options.selectors.selected.slice(1)) ? ($e$$ = $selected$$.indexOf($key$$), -1 < $e$$ && $selected$$.splice($e$$, 1)) : 2 > $selected$$.length && ($e$$.shiftKey ? $selected$$.push($key$$) : $selected$$ = [$key$$]), this.map.selected = $selected$$, this.map.changed = !0, 
  this.$root.$emit("route", "/" + (1 < $selected$$.length ? $selected$$.join("/and/") : $selected$$[0] || ""))));
}, browseTo:function($e$$) {
  console.log("map.browseTo()");
}, startDrag:function($e$$) {
  this.dragging = !0;
}, endDrag:function($e$$) {
  this.dragging = !1;
}, draw:function($graph$$) {
  var $view$$ = this, $config$$, $selectors$$, $root$$, $node$$, $edge$$, $tick$$, $force$$, $update$$;
  if ($graph$$ && !$view$$.map.root) {
    $config$$ = $view$$.config, $selectors$$ = $view$$.$options.selectors, $root$$ = d3.select($selectors$$.map).attr("width", $config$$.width).attr("height", $config$$.height), $node$$ = $root$$.selectAll($selectors$$.node), $edge$$ = $root$$.selectAll($selectors$$.edge), $tick$$ = function $$tick$$$() {
      $view$$.config.origin.snap ? ($graph$$.nodes[$graph$$.origin].x = $view$$.config.origin.position.x, $graph$$.nodes[$graph$$.origin].y = $view$$.config.origin.position.y) : $view$$.config.origin.position = {x:$graph$$.nodes[$graph$$.origin].x, y:$graph$$.nodes[$graph$$.origin].y};
      $edge$$.attr("x1", function($e$$) {
        return $e$$.source.x - $view$$.config.node.radius;
      }).attr("y1", function($e$$) {
        return $e$$.source.y - $view$$.config.node.radius;
      }).attr("x2", function($e$$) {
        return $e$$.target.x - $view$$.config.node.radius;
      }).attr("y2", function($e$$) {
        return $e$$.target.y - $view$$.config.node.radius;
      });
      $node$$.attr("cx", function($n$$) {
        return $n$$.x - $view$$.config.node.radius;
      }).attr("cy", function($n$$) {
        return $n$$.y - $view$$.config.node.radius;
      });
      $view$$.map.changed && ($node$$.filter($selectors$$.selected).filter(function($n$$) {
        return-1 === $view$$.map.selected.indexOf($n$$.key);
      }).classed({selected:!1}).transition().duration(150).ease("cubic").attr("r", $config$$.node.radius), $node$$.filter(function($n$$) {
        return-1 < $view$$.map.selected.indexOf($n$$.key);
      }).classed({selected:!0}).transition().duration(150).ease("cubic").attr("r", $config$$.node.radius * $config$$.node.scaleFactor), $view$$.map.changed = !1, $view$$.map.force.start());
    }, $force$$ = d3.layout.force().size([$config$$.width, $config$$.height]).linkDistance($config$$.force.distance).linkStrength($config$$.force.strength).friction($config$$.force.friction).theta($config$$.force.theta).gravity($config$$.force.gravity).alpha($config$$.force.alpha).charge(function($n$$) {
      return-1 < $view$$.map.selected.indexOf($n$$.key) ? $config$$.force.charge * Math.pow($config$$.node.scaleFactor, 2) : $config$$.force.charge;
    }).on("tick", $tick$$), $update$$ = function $$update$$$() {
      var $nodes$$ = $graph$$.nodes, $edges$$ = $graph$$.edges;
      $force$$.nodes($nodes$$).links($edges$$).start();
      $edge$$ = $edge$$.data($edges$$, function($e$$) {
        return $e$$.key;
      });
      $edge$$.exit().remove();
      $edge$$.enter().insert("line", ".node").attr("id", function($e$$) {
        return "edge-" + $e$$.key;
      }).attr("x1", function($e$$) {
        return $e$$.source.x;
      }).attr("y1", function($e$$) {
        return $e$$.source.y;
      }).attr("x2", function($e$$) {
        return $e$$.target.x;
      }).attr("y2", function($e$$) {
        return $e$$.target.y;
      }).attr("stroke-width", $config$$.edge.width).attr("stroke", $config$$.edge.stroke).attr("class", $config$$.edge.classes);
      $node$$ = $node$$.data($nodes$$, function($n$$) {
        return $n$$.key;
      });
      $node$$.exit().remove();
      $node$$.enter().append("svg:circle").attr("id", function($n$$) {
        return "node-" + $n$$.key;
      }).attr("cx", function($n$$) {
        return $n$$.x;
      }).attr("cy", function($n$$) {
        return $n$$.y;
      }).attr("r", $config$$.node.radius).attr("width", $config$$.sprite.width).attr("height", $config$$.sprite.height).attr("class", function($n$$, $i$$) {
        -1 < $view$$.map.selected.indexOf($n$$.key) && ($view$$.map.changed = !0);
        return $n$$.classes.join(" ");
      }).call($force$$.drag);
      $node$$.filter(function($n$$, $i$$) {
        return $n$$.key === $graph$$.origin_key;
      });
      $view$$.map.changed && $force$$.start();
    }, $view$$.map.root = $root$$, $view$$.map.force = $force$$, this.$root.nextTick(function() {
      $update$$();
    });
  } else {
    return $view$$.map.root = null, $($view$$.$options.selectors.map).innerHTML = "", $view$$.draw($graph$$);
  }
}, resize:function($e$$41_width$$) {
  $e$$41_width$$ = this.$el.clientWidth;
  var $height$$ = this.$el.clientHeight;
  this.config.width = $e$$41_width$$;
  this.config.height = $height$$;
  this.map.root && this.map.root.attr("width", $e$$41_width$$).attr("height", $height$$);
  this.config.origin.snap && (this.config.origin.position = {x:$e$$41_width$$ / 2, y:$height$$ / 2});
  this.map.force.size([$e$$41_width$$, $height$$]).resume();
}}, ready:function() {
  var $mapSelector$$ = this.$options.selectors.map;
  this.$watch("active", function($active$$) {
    $active$$ && $($mapSelector$$).classList.remove("transparent");
  });
  this.resize = this.resize.bind(this);
  window.addEventListener("resize", this.resize);
}, beforeDestroy:function() {
  window.removeEventListener("resize", this.resize);
}, handler:function($graph$$) {
  var $width$$ = this.$el.clientWidth, $height$$ = this.$el.clientHeight;
  this.config.width = $width$$;
  this.config.height = $height$$;
  this.config.origin.snap && (this.config.origin.position = this.config.origin.position || {}, this.config.origin.position = {x:$width$$ / 2, y:$height$$ / 2});
  $graph$$ ? (this.active = !0, this.draw($graph$$)) : (this.map.changed = !0, this.map.force && this.map.force.start());
}});
views.App = Vue.extend({data:{page:{active:!1}, modal:null}, methods:{route:function($e$$) {
  var $route$$;
  $e$$.target && $e$$.target.hasAttribute("data-route") && ($route$$ = $e$$.target.getAttribute("href"), $e$$.preventDefault(), $e$$.stopPropagation());
  $route$$ && this.$emit("route", $route$$);
}, nextTick:function($cb$$) {
  return Vue.nextTick($cb$$);
}}, ready:function() {
  this.$on("route", function($route$$, $request$$) {
    services.router.route($route$$, $request$$);
  });
}});
services.view.put("app", views.App);
var READY, GO, catnip;
READY = [];
GO = function $GO$() {
  var $cbs$$ = READY;
  READY = null;
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
  $fcm$$.data.init($data$$, function($_data$$) {
    $fcm$$.graph.init($_data$$);
  });
  $fcm$$.router.init($routes$$, function($initialRoute$$) {
    catnip.ready(function() {
      $fcm$$.history.init();
      if ($initialRoute$$) {
        return $fcm$$.router.route($initialRoute$$);
      }
    });
  });
  $fcm$$.view.init("app", function() {
    this.$set("active", !0);
    this.$.stage.$set("active", !0);
    ServiceContext.register("app", this);
    GO();
  });
  return this;
}.service("catnip");
catnip.ready = function $catnip$ready$($cb$$) {
  if (!($cb$$ instanceof Function)) {
    throw new TypeError("catnip.ready() expects a function.");
  }
  if (!READY) {
    return $cb$$();
  }
  READY.push($cb$$);
};
var init = {};
window.catnip_beta = catnip(config.context, config.data, routes);

})();

//# sourceMappingURL=../../../../.develop/maps/fatcatmap/assets/js/app.debug.js.map