(function() {
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
var mapper = {};
var supports = {cookies:navigator.cookieEnabled, retina:2 == window.devicePixelRatio, workers:!!window.Worker, sharedWorkers:!!window.SharedWorker, sockets:!!window.WebSocket, sse:!!window.EventSource, geo:!!navigator.geolocation, touch:0 < navigator.maxTouchPoints, history:{html5:!!window.history.pushState, hash:!!window.onhashchange}, storage:{local:!!window.localStorage, session:!!window.sessionStorage, indexed:!!window.IDBFactory}}, Stub = function $Stub$($feature$$) {
  return function() {
    throw Error($feature$$ + " is not supported");
  };
};
var urlutil = {encode:encodeURIComponent, addParams:function($url$$, $params$$) {
  -1 === $url$$.indexOf("?") && ($url$$ += "?");
  for (var $k$$ in $params$$) {
    $params$$.hasOwnProperty($k$$) && ($url$$ += "&" + this.encode($k$$) + "=" + this.encode($params$$[$k$$]));
  }
  return $url$$;
}, parseParams:function($url$$) {
  for (var $params$$ = {}, $tuples$$ = $url$$.split("?").pop().split("&"), $tuple$$, $v$$, $i$$ = 0;$i$$ < $tuples$$.length;$i$$++) {
    $tuple$$ = $tuples$$[$i$$].split("="), $v$$ = $tuple$$[1], $params$$[$tuple$$[0]] = "true" === $v$$ || "false" === $v$$ ? Boolean($v$$) : /^[0-9]+$/.test($url$$) ? +$v$$ : $v$$;
  }
  return $params$$;
}, parse:function($url$$) {
  var $parsed$$ = {}, $chunks$$;
  $parsed$$.url = $url$$;
  $parsed$$.params = this.parseParams($url$$);
  $chunks$$ = $url$$.split("//");
  if (2 === $chunks$$.length) {
    $parsed$$.protocol = $chunks$$.shift();
  } else {
    if (1 === $chunks$$.length) {
      $parsed$$.protocol = "";
    } else {
      throw new SyntaxError("Malformed URL: " + $url$$);
    }
  }
  $chunks$$ = $chunks$$.shift().split("/");
  "/" === $chunks$$[0].charAt(0) ? $parsed$$.hostname = $parsed$$.port = "" : ($chunks$$.shift().split(":"), $parsed$$.hostname = $chunks$$[0], $parsed$$.port = $chunks$$[1] || "");
  $parsed$$.path = $chunks$$.join("/").split("?").shift();
  return $parsed$$;
}};
var service = {}, Request, Response, splitter, prepareRequest, dispatch, parseResponse;
splitter = /^([^:]+):\s*/;
prepareRequest = function $prepareRequest$($headers_method$$, $request$$, $handlers$$) {
  var $xhr$$ = new XMLHttpRequest, $url$$;
  $url$$ = $request$$.params ? urlutil.addParams($request$$.url, $request$$.params) : "string" !== typeof $request$$ ? $request$$.url : $request$$;
  $xhr$$.open($headers_method$$.toUpperCase(), $url$$, !!$handlers$$);
  if ($request$$.headers) {
    $headers_method$$ = $request$$.headers;
    for (var $k$$ in $headers_method$$) {
      $headers_method$$.hasOwnProperty($k$$) && $xhr$$.setRequestHeader($k$$, $headers_method$$[$k$$]);
    }
  }
  $handlers$$ ? ($xhr$$.onerror = $handlers$$.error, $xhr$$.onloadend = function $$xhr$$$onloadend$() {
    this.responseJSON = parseResponse(this);
    $handlers$$.success(this.responseJSON);
  }) : ($xhr$$.onerror = function $$xhr$$$onerror$($e$$) {
    this.error = $e$$;
  }, $xhr$$.onloadend = function $$xhr$$$onloadend$() {
    this.responseJSON = parseResponse(this);
  });
  return $xhr$$;
};
dispatch = function $dispatch$($method$$, $request$$, $handlers$$) {
  var $data$$ = "object" === typeof $request$$.data ? JSON.stringify($request$$.data) : "string" === typeof $request$$.data ? $request$$.data : null == $request$$.data ? null : "" + $request$$.data;
  $request$$ = prepareRequest($method$$, $request$$, $handlers$$);
  $request$$.send($data$$);
  return $request$$;
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
service.http = {get:function $service$http$get$($request$$, $handlers$$) {
  return dispatch("GET", $request$$, $handlers$$);
}, delete:function $service$http$delete$($request$$, $handlers$$) {
  return dispatch("DELETE", $request$$, $handlers$$);
}, head:function $service$http$head$($request$$, $handlers$$) {
  return dispatch("HEAD", $request$$, $handlers$$);
}, post:function $service$http$post$($request$$, $handlers$$) {
  return dispatch("POST", $request$$, $handlers$$);
}, put:function $service$http$put$($request$$, $handlers$$) {
  return dispatch("PUT", $request$$, $handlers$$);
}, patch:function $service$http$patch$($request$$, $handlers$$) {
  return dispatch("PATCH", $request$$, $handlers$$);
}, options:function $service$http$options$($request$$, $handlers$$) {
  return dispatch("OPTIONS", $request$$, $handlers$$);
}};
service.socket = {};
service.sse = {};
service.storage = {};
var StringStore;
StringStore = function() {
  var $serialize$$, $deserialize$$;
  $serialize$$ = function $$serialize$$$($item$$) {
    return "string" === typeof $item$$ ? $item$$ : null == $item$$ ? "" : "object" === typeof $item$$ ? JSON.stringify($item$$) : String($item$$);
  };
  $deserialize$$ = function $$deserialize$$$($item$$) {
    var $char1$$ = $item$$.charAt(0);
    return "{" === $char1$$ || "[" === $char1$$ ? JSON.parse($item$$) : $item$$ ? "true" === $item$$ || "false" === $item$$ ? Boolean($item$$) : /^[0-9]+$/.test($item$$) ? +$item$$ : $item$$ : null;
  };
  return function StringStore($backend$$) {
    this.get = function $this$get$($key$$) {
      return $deserialize$$($backend$$.getItem($key$$));
    };
    this.put = function $this$put$($key$$, $value$$) {
      $backend$$.setItem($key$$, $serialize$$($value$$));
    };
    this.del = function $this$del$($key$$) {
      $backend$$.removeItem($key$$);
    };
  };
}();
service.storage.local = supports.storage.local ? new StringStore(window.localStorage) : null;
service.storage.session = supports.storage.session ? new StringStore(window.sessionStorage) : null;
Function.prototype.client = function $Function$$client$() {
  var $fn$$ = this;
  return function() {
    return $fn$$.apply(service, arguments);
  };
};
Function.prototype.service = function $Function$$service$($name$$) {
  service[$name$$] = this.client();
  return service[$name$$];
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
