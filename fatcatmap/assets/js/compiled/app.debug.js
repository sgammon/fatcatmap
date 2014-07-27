(function() {
var ROUTES = {"/":function($request$$) {
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
var services = {}, Request, Response, splitter, prepareRequest, dispatch, parseResponse;
splitter = /^([^:]+):\s*/;
prepareRequest = function $prepareRequest$($headers_method$$, $request$$, $handlers$$) {
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
    $xhr$$.responseJSON = parseResponse($xhr$$);
    $handlers$$.success($xhr$$.responseJSON);
  }) : ($xhr$$.onerror = function $$xhr$$$onerror$($e$$) {
    $xhr$$.error = $e$$;
  }, $xhr$$.onloadend = function $$xhr$$$onloadend$() {
    $xhr$$.responseJSON = parseResponse($xhr$$);
  });
  return $xhr$$;
};
dispatch = function $dispatch$($method$$, $request$$, $handlers$$) {
  var $data$$ = "object" === typeof $request$$.data ? JSON.stringify($request$$.data) : "string" === typeof $request$$.data ? $request$$.data : null == $request$$.data ? null : "" + $request$$.data;
  $method$$ = prepareRequest($method$$, $request$$, $handlers$$);
  $method$$.send($data$$);
  return $method$$;
};
parseResponse = function $parseResponse$($chunks$$) {
  var $resp$$ = {}, $headers$$ = $chunks$$.getAllResponseHeaders().split("\n");
  try {
    $resp$$.data = JSON.parse($chunks$$.responseText);
  } catch ($e$$) {
    $resp$$.data = $chunks$$.responseText || "";
  }
  $resp$$.headers = {};
  for (var $i$$ = 0;$i$$ < $headers$$.length;$i$$++) {
    $headers$$[$i$$] && ($chunks$$ = $headers$$[$i$$].split(splitter), $resp$$.headers[$chunks$$[1]] = $chunks$$[2]);
  }
  return $resp$$;
};
services.http = {get:function $services$http$get$($request$$, $handlers$$) {
  return dispatch("GET", $request$$, $handlers$$);
}, delete:function $services$http$delete$($request$$, $handlers$$) {
  return dispatch("DELETE", $request$$, $handlers$$);
}, head:function $services$http$head$($request$$, $handlers$$) {
  return dispatch("HEAD", $request$$, $handlers$$);
}, post:function $services$http$post$($request$$, $handlers$$) {
  return dispatch("POST", $request$$, $handlers$$);
}, put:function $services$http$put$($request$$, $handlers$$) {
  return dispatch("PUT", $request$$, $handlers$$);
}, patch:function $services$http$patch$($request$$, $handlers$$) {
  return dispatch("PATCH", $request$$, $handlers$$);
}, options:function $services$http$options$($request$$, $handlers$$) {
  return dispatch("OPTIONS", $request$$, $handlers$$);
}};
var baseURL = "/_rpc/v1/", RPCAPI;
RPCAPI = function $RPCAPI$($name$$, $methods$$, $config$$) {
  var $api$$ = this;
  $api$$.name = $name$$;
  $api$$.config = $config$$;
  $methods$$.forEach(function($method$$) {
    var $endpoint$$ = urlutil.join(baseURL, $api$$.name + "." + $method$$);
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
var StringStore, digitMatcher = /^[0-9]+$/, serialize = function $serialize$($item$$) {
  return "string" === typeof $item$$ ? $item$$ : null == $item$$ ? "" : "object" === typeof $item$$ ? JSON.stringify($item$$) : String($item$$);
}, deserialize = function $deserialize$($item$$) {
  var $char1$$ = $item$$.charAt(0);
  return "{" === $char1$$ || "[" === $char1$$ ? JSON.parse($item$$) : $item$$ ? "true" === $item$$ || "false" === $item$$ ? Boolean($item$$) : digitMatcher.test($item$$) ? +$item$$ : $item$$ : "" === $item$$ ? $item$$ : null;
};
StringStore = function $StringStore$($backend$$) {
  this.get = function $this$get$($key$$) {
    return deserialize($backend$$.getItem($key$$) || "");
  };
  this.put = function $this$put$($key$$, $value$$) {
    $backend$$.setItem($key$$, serialize($value$$));
  };
  this.del = function $this$del$($key$$) {
    $backend$$.removeItem($key$$);
  };
};
services.storage = {local:supports.storage.local ? new StringStore(window.localStorage) : null, session:supports.storage.session ? new StringStore(window.sessionStorage) : null};
var Client = function $Client$() {
};
Client.prototype = services;
Function.prototype.client = function $Function$$client$() {
  var $fn$$ = this;
  return function() {
    return $fn$$.apply(new Client, arguments);
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
services.data = {};
var data = {normalize:function($raw$$) {
}}.service("data");
services.graph = {};
var graph = {init:function($raw$$) {
  return graph.construct(data.normalize($raw$$));
}, construct:function($data$$) {
  return{};
}}.service("graph");
services.map = {};
var map = {draw:function() {
}}.service("map");
services.template = {};
var _templates = {}, template = {put:function($filename$$, $source$$) {
  "string" === typeof $filename$$ && "string" === typeof $source$$ && (_templates[$filename$$] = $source$$);
}, get:function($filename$$, $callbacks$$) {
  if ("string" !== typeof $filename$$ || "function" !== typeof $callbacks$$.success || "function" !== typeof $callbacks$$.error) {
    throw new TypeError("template.get() requires a filename and CallbackMap.");
  }
  return _templates[$filename$$] ? $callbacks$$.success({data:_templates[$filename$$]}) : this.rpc.content.template({data:{path:$filename$$}}, $callbacks$$);
}, init:function($manifest$$) {
  for (var $k$$ in $manifest$$) {
    $manifest$$.hasOwnProperty($k$$) && "string" === typeof $manifest$$[$k$$] && template.put($k$$, $manifest$$[$k$$]);
  }
}}.service("template");
services.router = {};
var keyMatcher = /\/<(\w+)>/, routes = {resolved:[], dynamic:[]}, queues = {route:[], routed:[], error:[]}, Route, router;
Route = function $Route$($path$$, $handler$$) {
  var $rt$$ = this;
  $rt$$.keys = [];
  $rt$$.id = $path$$.replace(keyMatcher, function($_$$, $leading$$, $key$$) {
    $rt$$.keys.push($key$$);
    return "/(\\w+)";
  });
  $rt$$.matcher = new RegExp($rt$$.id);
  $rt$$.handler = $handler$$;
  $rt$$.resolved = 0 === $rt$$.keys.length;
};
router = {register:function($path$$, $handler$$) {
  var $inserted$$ = !1, $route$$, $_route$$, $_routes$$, $i$$;
  $route$$ = new Route($path$$, $handler$$);
  $_routes$$ = $route$$.resolved ? routes.resolved : routes.dynamic;
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
  var $matched$$ = !1, $findRoute$$, $_routes$$, $response$$0$$;
  $request$$ = $request$$ || {};
  $request$$.params = $request$$.params || {};
  queues.route.forEach(function($fn$$) {
    $fn$$($path$$, $request$$);
  });
  $findRoute$$ = function $$findRoute$$$() {
    for (var $i$$0$$ = 0, $setParam$$ = function $$setParam$$$($key$$, $i$$) {
      $request$$.params[$route$$.keys[$i$$]] = $key$$;
    }, $triggerRouted$$ = function $$triggerRouted$$$($fn$$) {
      $fn$$($path$$, $request$$, $response$$);
    }, $route$$, $response$$;($route$$ = $_routes$$[$i$$0$$++]) && $route$$.id < $path$$;) {
      if ($route$$.matcher.test($path$$)) {
        return $matched$$ = !0, $i$$0$$ = $path$$.match($route$$.matcher).slice(1), $i$$0$$.forEach($setParam$$), $response$$ = $route$$.handler($request$$), queues.routed.forEach($triggerRouted$$), 404 === $response$$.status ? ($response$$.path = $path$$, router.route("/404", $response$$)) : $response$$;
      }
    }
  };
  $_routes$$ = routes.resolved;
  $response$$0$$ = $findRoute$$();
  if ($matched$$) {
    return $response$$0$$;
  }
  $_routes$$ = routes.dynamic;
  $response$$0$$ = $findRoute$$();
  if ($matched$$) {
    return $response$$0$$;
  }
  $response$$0$$ = {status:404};
  queues.error.forEach(function($fn$$) {
    $fn$$($path$$, $request$$, $response$$0$$);
  });
  return $response$$0$$;
}, on:function($event$$, $callback$$) {
  queues[$event$$] || (queues[$event$$] = []);
  queues[$event$$].push($callback$$);
}, off:function($event$$, $callback$$) {
  var $i$$;
  $callback$$ ? ($i$$ = queues[$event$$].indexOf($callback$$), -1 < $i$$ && queues[$event$$].splice($i$$, 1)) : queues[$event$$] = [];
}, init:function($routes$$) {
  for (var $k$$ in $routes$$) {
    $routes$$.hasOwnProperty($k$$) && "function" === typeof $routes$$[$k$$] && router.register($k$$, $routes$$[$k$$]);
  }
}}.service("router");
services.history = {};
var history = {push:supports.history.html5 ? function($url$$, $state$$) {
  window.history.pushState($state$$, "", $url$$);
} : function($url$$, $state$$) {
}, start:function() {
  var $hist$$ = this;
  $hist$$.router.on("routed", function($url$$, $request$$, $response$$) {
    "history" !== $request$$.source && $hist$$.push($url$$, $request$$.state);
  });
  supports.history.html5 && (window.onpopstate = function $window$onpopstate$($event$$) {
    $hist$$.router.route(window.location.pathname, {source:"history", state:$event$$.state || {}});
  });
  $hist$$.start = function $$hist$$$start$() {
    throw Error("History already started");
  };
}}.service("history");
var catnip = function($context$$, $data$$) {
  this._context = $context$$;
  this.session = null;
  $context$$.session && $context$$.session.established && (this.session = $context$$.session.payload);
  $context$$.services && $context$$.protocol.rpc.enabled && this.rpc.init($context$$.services);
  $context$$.template.manifest && this.template.init($context$$.template.manifest);
  this.router.init(ROUTES);
  this.history.start();
  this.graph.init($data$$);
  return this;
}.client();
var init = {};
window.catnip_beta = catnip(config.context, config.data);

})();
