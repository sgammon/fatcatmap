(function() {
var async = {}, CallbackMap;
var Request, http = function() {
  var $encode$$, $parseData$$, $appendParams$$, $prepareRequest$$;
  $encode$$ = encodeURIComponent;
  $parseData$$ = function $$parseData$$$($response$$) {
    var $data$$ = {};
    try {
      $data$$.data = JSON.parse($response$$);
    } catch ($e$$) {
      $data$$.data = $response$$ || "";
    }
    return $data$$;
  };
  $appendParams$$ = function $$appendParams$$$($url$$, $params$$) {
    $url$$ = $url$$.slice();
    -1 === $url$$.indexOf("?") && ($url$$ += "?");
    for (var $k$$ in $params$$) {
      $params$$.hasOwnProperty($k$$) && ($url$$ += "&" + $encode$$($k$$) + "=" + $encode$$($params$$[$k$$]));
    }
    return $url$$;
  };
  $prepareRequest$$ = function $$prepareRequest$$$($headers_method$$, $request$$, $handlers$$) {
    var $xhr$$ = new XMLHttpRequest, $url$$;
    $url$$ = $request$$.params ? $appendParams$$($request$$.url, $request$$.params) : $request$$.url;
    $xhr$$.open($headers_method$$.toUpperCase(), $url$$, !!$handlers$$);
    if ($request$$.headers) {
      $headers_method$$ = $request$$.headers;
      for (var $k$$ in $headers_method$$) {
        $headers_method$$.hasOwnProperty($k$$) && $xhr$$.setRequestHeader($k$$, $headers_method$$[$k$$]);
      }
    }
    $handlers$$ && ($xhr$$.onerror = $handlers$$.error, $xhr$$.onload = function $$xhr$$$onload$() {
      $handlers$$.success($parseData$$(this.responseText));
    });
    return $xhr$$;
  };
  return{get:function($request$$, $handlers$$) {
    var $xhr$$ = $prepareRequest$$("GET", $request$$, $handlers$$);
    $xhr$$.send();
    return $handlers$$ ? $xhr$$ : $parseData$$($xhr$$.responseText);
  }, del:function($request$$, $handlers$$) {
    var $xhr$$ = $prepareRequest$$("DELETE", $request$$, $handlers$$);
    $xhr$$.send();
    return $handlers$$ ? $xhr$$ : $parseData$$($xhr$$.responseText);
  }, post:function($request$$, $handlers$$) {
    var $xhr$$ = $prepareRequest$$("POST", $request$$, $handlers$$), $data$$ = "string" !== typeof $request$$.data ? JSON.stringify($request$$.data) : $request$$.data;
    $xhr$$.send($data$$);
    return $handlers$$ ? $xhr$$ : $parseData$$($xhr$$.responseText);
  }, put:function($request$$, $handlers$$) {
    var $xhr$$ = $prepareRequest$$("PUT", $request$$, $handlers$$), $data$$ = "string" !== typeof $request$$.data ? JSON.stringify($request$$.data) : $request$$.data;
    $xhr$$.send($data$$);
    return $handlers$$ ? $xhr$$ : $parseData$$($xhr$$.responseText);
  }, patch:function($request$$, $handlers$$) {
    var $xhr$$ = $prepareRequest$$("PATCH", $request$$, $handlers$$), $data$$ = "string" !== typeof $request$$.data ? JSON.stringify($request$$.data) : $request$$.data;
    $xhr$$.send($data$$);
    return $handlers$$ ? $xhr$$ : $parseData$$($xhr$$.responseText);
  }};
}();
var $ = function $$$($query$$) {
  if ($query$$ && $query$$.querySelector) {
    return $query$$;
  }
  if ("string" === typeof $query$$) {
    return "#" === $query$$.charAt(0) ? document.querySelector($query$$) : document.querySelectorAll($query$$);
  }
  throw new TypeError("Invalid document query string.");
};
var mapper = {};
var socket = {};
var supports = {ua:navigator.userAgent, cookies:navigator.cookieEnabled, retina:2 == window.devicePixelRatio, worker:!!window.Worker, sharedWorker:!!window.SharedWorker, socket:!!window.WebSocket, sse:!!window.EventSource, geo:!!navigator.geolocation, touch:0 < navigator.maxTouchPoints, history:!!window.history.pushState, storage:{local:!!window.localStorage, session:!!window.sessionStorage, indexed:!!window.IDBFactory}};
var history = {};
var catnip = {};
var storage = {local:{}, session:{}};
var data = {};
var app = window.catnip = catnip;

})();
