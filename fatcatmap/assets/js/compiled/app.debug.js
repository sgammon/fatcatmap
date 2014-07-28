(function() {
var routes = {"/":function($request$$) {
}, "/login":function($request$$) {
}, "/settings":function($request$$) {
}, "/dev":function($request$$) {
}, "/404":function($request$$) {
}, "/<key>":function($request$$) {
}, "/<key1>/and/<key2>":function($request$$) {
}};
var async = {}, CallbackMap;
var toArray = function $toArray$($list$$) {
  var $arr$$ = [], $i$$;
  for ($i$$ = 0;$i$$ < $list$$.length;$arr$$.push($list$$[$i$$++])) {
  }
  return $arr$$;
}, $ = function $$$($query$$) {
  if ($query$$ && $query$$.querySelector) {
    return $query$$;
  }
  if ("string" === typeof $query$$) {
    return "#" === $query$$.charAt(0) ? document.getElementById($query$$.slice(1)) : toArray(document.querySelectorAll($query$$));
  }
  throw new TypeError("Invalid document query string.");
};
var config = {context:JSON.parse($("#js-context").textContent || "{}"), data:JSON.parse($("#js-data").textContent || "{}")};
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
var services = {}, Request, Response, _prepareRequest, _dispatch, _parseResponse;
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
services.http = {get:function $services$http$get$($request$$, $handlers$$) {
  return _dispatch("GET", $request$$, $handlers$$);
}, delete:function $services$http$delete$($request$$, $handlers$$) {
  return _dispatch("DELETE", $request$$, $handlers$$);
}, head:function $services$http$head$($request$$, $handlers$$) {
  return _dispatch("HEAD", $request$$, $handlers$$);
}, post:function $services$http$post$($request$$, $handlers$$) {
  return _dispatch("POST", $request$$, $handlers$$);
}, put:function $services$http$put$($request$$, $handlers$$) {
  return _dispatch("PUT", $request$$, $handlers$$);
}, patch:function $services$http$patch$($request$$, $handlers$$) {
  return _dispatch("PATCH", $request$$, $handlers$$);
}, options:function $services$http$options$($request$$, $handlers$$) {
  return _dispatch("OPTIONS", $request$$, $handlers$$);
}};
var _baseURL = "/_rpc/v1/", RPCAPI;
RPCAPI = function $RPCAPI$($name$$, $methods$$, $config$$) {
  var $api$$ = this;
  $api$$.name = $name$$;
  $api$$.config = $config$$;
  $methods$$.forEach(function($method$$) {
    var $endpoint$$ = urlutil.join(_baseURL, $api$$.name + "." + $method$$);
    $api$$[$method$$] = function $$api$$$$method$$$($request$$, $handlers$$) {
      var $req$$ = {url:$endpoint$$, data:$request$$.data || {}, params:$request$$.params || {}, headers:$request$$.headers || {}};
      $req$$.headers.Accept = "application/json";
      $req$$.headers["Content-Type"] = "application/json";
      return services.http.post($req$$, $handlers$$);
    };
  });
};
services.rpc = {factory:function $services$rpc$factory$($manifest$$) {
  var $name$$ = $manifest$$[0];
  services.rpc[$name$$] = new RPCAPI($name$$, $manifest$$[1], $manifest$$[2]);
}, init:function $services$rpc$init$($manifests$$) {
  $manifests$$.forEach(services.rpc.factory);
}};
var StringStore, _serialize, _deserialize;
_serialize = function $_serialize$($item$$) {
  return "string" === typeof $item$$ ? $item$$ : null == $item$$ ? "" : "object" === typeof $item$$ ? JSON.stringify($item$$) : String($item$$);
};
_deserialize = function $_deserialize$($item$$) {
  var $char1$$ = $item$$.charAt(0);
  return "{" === $char1$$ || "[" === $char1$$ ? JSON.parse($item$$) : $item$$ ? "true" === $item$$ || "false" === $item$$ ? Boolean($item$$) : /^[0-9]+$/.test($item$$) ? +$item$$ : $item$$ : "" === $item$$ ? $item$$ : null;
};
StringStore = function $StringStore$($backend$$) {
  this.get = function $this$get$($key$$) {
    return _deserialize($backend$$.getItem($key$$) || "");
  };
  this.put = function $this$put$($key$$, $value$$) {
    $backend$$.setItem($key$$, _serialize($value$$));
  };
  this.del = function $this$del$($key$$) {
    $backend$$.removeItem($key$$);
  };
};
services.storage = {local:supports.storage.local ? new StringStore(window.localStorage) : null, session:supports.storage.session ? new StringStore(window.sessionStorage) : null};
var Client = function $Client$($methods$$) {
  if ($methods$$) {
    for (var $k$$ in $methods$$) {
      $methods$$.hasOwnProperty($k$$) && (this[$k$$] = $methods$$[$k$$]);
    }
  }
};
Client.prototype = services;
Function.prototype.client = function $Function$$client$($methods$$) {
  var $fn$$ = this;
  return function() {
    return $fn$$.apply(new Client($methods$$), arguments);
  };
};
Function.prototype.service = function $Function$$service$($name$$) {
  Client.prototype[$name$$] = this.client();
  return Client.prototype[$name$$];
};
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
services.data = {normalize:function($raw$$) {
}}.service("data");
services.graph = {init:function($raw$$) {
  return this.graph.construct(this.data.normalize($raw$$));
}, construct:function($data$$) {
  return{};
}}.service("graph");
services.map = {draw:function() {
}}.service("map");
var TEMPLATES = {};
services.template = {put:function($filename$$, $source$$) {
  "string" === typeof $filename$$ && "string" === typeof $source$$ && (TEMPLATES[$filename$$] = $source$$);
}, get:function($filename$$, $callbacks$$) {
  if ("string" !== typeof $filename$$ || "function" !== typeof $callbacks$$.success || "function" !== typeof $callbacks$$.error) {
    throw new TypeError("template.get() requires a filename and CallbackMap.");
  }
  return TEMPLATES[$filename$$] ? $callbacks$$.success({data:TEMPLATES[$filename$$]}) : this.rpc.content.template({data:{path:$filename$$}}, $callbacks$$);
}, init:function($manifest$$) {
  for (var $k$$ in $manifest$$) {
    $manifest$$.hasOwnProperty($k$$) && "string" === typeof $manifest$$[$k$$] && services.template.put($k$$, $manifest$$[$k$$]);
  }
}}.service("template");
var VIEWS = {};
services.view = {register:function($viewname$$, $viewclass$$) {
  if ("string" !== typeof $viewname$$ || "function" !== typeof $viewclass$$) {
    throw new TypeError("services.view.register() takes a string name and constructor.");
  }
  return VIEWS[$viewname$$] = $viewclass$$;
}, get:function($viewname$$) {
  if ("string" !== typeof $viewname$$) {
    throw new TypeError("services.view.get() takes a string name.");
  }
  return VIEWS[$viewname$$];
}, init:function($rootname$$) {
}}.service("view");
var views = {};
views.AppView = Vue.extend({});
views.AppView.extend = function $views$AppView$extend$($options$$) {
  var $viewname$$ = $options$$.viewname;
  if (!$viewname$$ || "string" !== typeof $viewname$$) {
    throw Error('AppView.extend() requires a "viewname" option to be passed.');
  }
  return services.view.register($viewname$$, Vue.component($viewname$$, Vue.extend($options$$)));
};
views.Container = views.AppView.extend({viewname:"container"});
var ROUTES = {resolved:[], dynamic:[]}, _routeEvents = {route:[], routed:[], error:[]}, _findRoute, Route, router;
_findRoute = function $_findRoute$($match_path$$, $request$$, $_routes$$) {
  for (var $i$$0$$ = 0, $route$$, $matched$$, $response$$, $setParam$$ = function $$setParam$$$($key$$, $i$$) {
    $request$$.params[$route$$.keys[$i$$]] = $key$$;
  };($route$$ = $_routes$$[$i$$0$$++]) && $route$$.id <= $match_path$$;) {
    if ($route$$.matcher.test($match_path$$)) {
      $matched$$ = !0;
      $match_path$$ = $match_path$$.match($route$$.matcher).slice(1);
      $match_path$$.forEach($setParam$$);
      $response$$ = $route$$.handler($request$$);
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
  var $response$$;
  $request$$ = $request$$ || {};
  $request$$.params = $request$$.params || {};
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
    $_routes$$.hasOwnProperty($k$$) && "function" === typeof $_routes$$[$k$$] && router.register($k$$, $_routes$$[$k$$]);
  }
  $handleInitial$$ && $handleInitial$$(window.location.pathname.split("?").shift());
}}.service("router");
services.history = {push:supports.history.html5 ? function($url$$, $state$$) {
  window.history.pushState($state$$, "", $url$$);
} : function($url$$, $state$$) {
}, start:function() {
  var $hist$$ = this;
  $hist$$.router.on("routed", function($url$$, $request$$, $response$$) {
    "history" !== $request$$.source && services.history.push($url$$, $request$$.state);
  });
  supports.history.html5 && (window.onpopstate = function $window$onpopstate$($event$$) {
    $hist$$.router.route(window.location.pathname, {source:"history", state:$event$$.state || {}});
  });
  $hist$$.start = function $$hist$$$start$() {
    throw Error("History already started");
  };
}}.service("history");
var _ready, _go, catnip;
_ready = [];
_go = function $_go$() {
  var $cbs$$ = _ready;
  _ready = null;
  $cbs$$.forEach(function($fn$$) {
    $fn$$();
  });
};
catnip = function($context$$, $data$$) {
  var $fcm$$ = this;
  $fcm$$._context = $context$$;
  $fcm$$.session = null;
  $context$$.session && $context$$.session.established && ($fcm$$.session = $context$$.session.payload);
  $context$$.services && $context$$.protocol.rpc.enabled && $fcm$$.rpc.init($context$$.services);
  $context$$.template.manifest && $fcm$$.template.init($context$$.template.manifest);
  $fcm$$.view.init("container", function() {
    _go();
  });
  $fcm$$.router.init(routes, function($initialRoute$$) {
    $fcm$$.ready(function() {
      $fcm$$.history.start();
    });
  });
  $fcm$$.graph.init($data$$);
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
window.catnip_beta = catnip(config.context, config.data);

})();
