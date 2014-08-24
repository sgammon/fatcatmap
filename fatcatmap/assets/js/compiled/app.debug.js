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
var routes = {"/":function($request$$) {
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
services.service._register = function $services$service$_register$($name$$, $service$$) {
  services[$name$$] = $service$$;
};
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
    $obj$$ = $obj$$[$keys$$.shift()] || {};
  }
  $obj$$[$keys$$.shift()] = $data$$;
};
services.data = {init:function($raw$$, $cb$$) {
  var $data$$ = this.data.normalize($raw$$), $keys$$ = $data$$.data.keys, $objects$$ = $data$$.data.objects, $i$$;
  for ($i$$ = 0;$keys$$ && $i$$ < $keys$$.length;$i$$++) {
    _dataCache[$keys$$[$i$$]] = $objects$$[$i$$];
  }
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
  var $item$$ = _dataCache[$key$$], $_cbs$$ = {success:function($data$$) {
    this.data.set($nativeKey$$, $data$$);
    $cbs$$.success($data$$);
  }.bind(this), error:$cbs$$.error}, $nativeKey$$;
  if ($item$$) {
    return $item$$.native && "string" === typeof $item$$.native ? ($nativeKey$$ = $item$$.native, this.watch($nativeKey$$, function($data$$) {
      this.data.set($key$$ + ".native", $data$$);
    }.bind(this)), this.data.get($nativeKey$$, $_cbs$$)) : $cbs$$.success($item$$);
  }
  debugger;
}, set:function($key$$, $data$$) {
  _resolveAndSet($key$$, $data$$);
  watchers[$key$$].length && watchers[$key$$].forEach(function($watcher$$) {
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
views.Stage = View.extend({viewname:"stage", replace:!0});
views.Map = View.extend({viewname:"page.map", replace:!0, selectors:{map:"#map", edge:".edge", node:".node", selected:".selected"}, data:{map:{}, config:{width:0, height:0, force:{alpha:.75, strength:1, friction:.9, theta:.7, gravity:.1, charge:-600, distance:180}, origin:{snap:!0, dynamic:!1, position:null}, node:{radius:25, scaleFactor:1.6, classes:["node"]}, labels:{enable:!1, distance:0}, edge:{width:2, stroke:"#999", classes:["link"]}, sprite:{width:60, height:60}}}, methods:{isNode:function($element$$) {
  return $element$$.classList.contains("node");
}, isEdge:function($element$$) {
  return $element$$.classList.contains("link");
}, select:function($e$$) {
  var $target$$ = $e$$.target, $key$$ = $target$$.id.split("-").pop(), $className$$ = this.$options.selectors.selected.slice(1);
  this.map.selected || (this.map.selected = []);
  this.isNode($target$$) && ($e$$.preventDefault(), $e$$.stopPropagation(), $target$$.classList.contains($className$$) ? ($e$$ = this.map.selected.indexOf($key$$), -1 < $e$$ && this.map.selected.splice($e$$, 1)) : ($e$$.shiftKey || (this.map.selected = []), this.map.selected.push($key$$)));
  this.map.selected.changed = !0;
  this.map.force.start();
}, browseTo:function($e$$) {
  console.log("map.browseTo()");
}, draw:function($graph$$) {
  var $view$$ = this, $config$$, $selectors$$, $root$$, $node$$, $edge$$, $tick$$, $force$$, $update$$;
  if ($graph$$ && !$view$$.map.root) {
    $config$$ = $view$$.config, $selectors$$ = $view$$.$options.selectors, $root$$ = d3.select($selectors$$.map).attr("width", $config$$.width).attr("height", $config$$.height), $node$$ = $root$$.selectAll($selectors$$.node), $edge$$ = $root$$.selectAll($selectors$$.edge), $tick$$ = function $$tick$$$() {
      $view$$.config.origin.snap && ($graph$$.nodes[$graph$$.origin].x = $view$$.config.origin.position.x, $graph$$.nodes[$graph$$.origin].y = $view$$.config.origin.position.y);
      $edge$$.attr("x1", function($e$$) {
        return $e$$.source.x;
      }).attr("y1", function($e$$) {
        return $e$$.source.y;
      }).attr("x2", function($e$$) {
        return $e$$.target.x;
      }).attr("y2", function($e$$) {
        return $e$$.target.y;
      });
      $node$$.attr("cx", function($n$$) {
        return $n$$.x;
      }).attr("cy", function($n$$) {
        return $n$$.y;
      });
      $view$$.map.selected && $view$$.map.selected.changed && ($node$$.filter($selectors$$.selected).filter(function($n$$) {
        return-1 === $view$$.map.selected.indexOf($n$$.key);
      }).classed({selected:!1}).transition().duration(200).ease("cubic").attr("r", $config$$.node.radius), $node$$.filter(function($n$$) {
        return-1 < $view$$.map.selected.indexOf($n$$.key);
      }).classed({selected:!0}).transition().duration(200).ease("cubic").attr("r", $config$$.node.radius * $config$$.node.scaleFactor), $view$$.map.selected.changed = !1);
    }, $force$$ = d3.layout.force().size([$config$$.width, $config$$.height]).linkDistance($config$$.force.distance).linkStrength($config$$.force.strength).friction($config$$.force.friction).theta($config$$.force.theta).gravity($config$$.force.gravity).alpha($config$$.force.alpha).charge(function($n$$) {
      return $view$$.map.selected && -1 < $view$$.map.selected.indexOf($n$$.key) ? $config$$.force.charge * $config$$.node.scaleFactor : $config$$.force.charge;
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
        return $n$$.classes.join(" ");
      }).call($force$$.drag);
      $node$$.filter(function($n$$, $i$$) {
        return $n$$.key === $graph$$.origin_key;
      });
    }, $view$$.map.root = $root$$, $view$$.map.force = $force$$, setTimeout(function() {
      $update$$();
    }, 0);
  } else {
    return $view$$.map.root = null, $($view$$.$options.selectors.map).innerHTML = "", $view$$.draw($graph$$);
  }
}}, ready:function() {
  var $view$$ = this;
  window.addEventListener("resize", function($e$$32_width$$) {
    $e$$32_width$$ = $view$$.$el.clientWidth;
    var $height$$ = $view$$.$el.clientHeight;
    $view$$.config.width = $e$$32_width$$;
    $view$$.config.height = $height$$;
    $view$$.map.root && $view$$.map.root.attr("width", $e$$32_width$$).attr("height", $height$$);
    $view$$.config.origin.snap && ($view$$.config.origin.position.x = $e$$32_width$$ / 2, $view$$.config.origin.position.y = $height$$ / 2);
    $view$$.map.force && $view$$.map.force.size([$e$$32_width$$, $height$$]).resume();
  });
}, handler:function($graph$$) {
  var $width$$ = this.$el.clientWidth, $height$$ = this.$el.clientHeight;
  this.config.width = $width$$;
  this.config.height = $height$$;
  this.config.origin.snap && (this.config.origin.position = this.config.origin.position || {}, this.config.origin.position.x = $width$$ / 2, this.config.origin.position.y = $height$$ / 2);
  this.draw($graph$$);
  $(this.$options.selectors.map).classList.remove("transparent");
}});
views.Page = Vue.extend({data:{page:{active:!1}, modal:null}, methods:{route:function($e$$) {
  if ($e$$.target.hasAttribute("data-route")) {
    var $route$$ = $e$$.target.getAttribute("href");
    $e$$.preventDefault();
    $e$$.stopPropagation();
    services.router.route($route$$);
  }
}}, ready:function() {
  this.$on("route", function($route$$) {
    services.router.route($route$$);
  });
}});
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
  $fcm$$.data.init($data$$, function($d$$) {
    $fcm$$.graph.init($d$$);
  });
  $fcm$$.router.init($routes$$, function($initialRoute$$) {
    $fcm$$.ready(function() {
      $fcm$$.history.init();
      if ($initialRoute$$) {
        return $fcm$$.router.route($initialRoute$$);
      }
    });
  });
  $fcm$$.view.init("page", function() {
    this.$set("active", !0);
    this.$.stage.$set("active", !0);
    services.service._register("app", this);
    _go();
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