var toArray=function(a){var b=[],c;for(c=0;c<a.length;b.push(a[c++]));return b},$=function(a,b){if(a&&a.querySelector)return a;b=b||document;if("string"===typeof a)return"#"===a.charAt(0)?document.getElementById(a.slice(1)):toArray(b.querySelectorAll(a));throw new TypeError("Invalid document query string.");};var supports={cookies:navigator.cookieEnabled,retina:2==window.devicePixelRatio,workers:!!window.Worker,sharedWorkers:!!window.SharedWorker,socket:!!window.WebSocket,sse:!!window.EventSource,geo:!!navigator.geolocation,touch:0<navigator.maxTouchPoints,history:{html5:!!window.history.pushState,hash:!!window.onhashchange},storage:{local:!!window.localStorage,session:!!window.sessionStorage,indexed:!!window.IDBFactory}};var validation={},VALIDATIONS={email:function(a){return/[\w\-\+\.]+@[a-z0-9\-]+\.[a-z]{2,}(?:\.[a-z]{2,3})*/.test(a)},number:function(a){return"number"===typeof a||/^\d*$/.test(a)},alpha:function(a){return/^[a-z]*$/i.test(a)},alphanum:function(a){return/^[a-z\d]*$/i.test(a)},length:function(a,b){return VALIDATIONS.number(a)?b.length===+a:(console.warn("validation.length requires a length to be passed"),!0)}},_validations={},_validateInput=function(a){a=a.target;var b=_validations[a.__validate],c;
if(b&&b.length)for(c=0;c<b.length;c++)if(!b[c](a.value))return a.classList.add("invalid");a.classList.add("valid")},_removeValidation=function(a){a.target.classList.remove("valid");a.target.classList.remove("invalid")};
Vue.directive("validate",{isLiteral:!0,bind:function(a){a=this.arg?this.arg:this.key;var b=this.arg?this.key:this.arg,c=VALIDATIONS[a],d=_validations[this.el.__validate]||[];c&&(b&&(c=c.bind(null,b)),d.push(c));this.el.__validate||(this.el.__validate=this.el.tagName+a+Date.now(),this.el.addEventListener("blur",_validateInput),this.el.addEventListener("focus",_removeValidation));_validations[this.el.__validate]=d},unbind:function(a){this.el.removeEventListener("blur",_validateInput);this.el.removeEventListener("focus",
_removeValidation);_validations[this.el.__validate]=null}});var async={decorators:{}};Object.defineProperty(Function.prototype,"async",{value:function(a){"number"!==typeof a&&(a=0);return setTimeout(this,a)}});Object.defineProperty(Function.prototype,"throttle",{value:function(a){var b=this,c,d,e;return function(){d=arguments;e=this;c||(c=setTimeout(function(){c=null;b.apply(e,d)},a))}}});async.future={};var Future=function(){this.status="PENDING";this._waiting=[];this._result=null};Future.prototype.fulfill=function(a,b){var c;if(a instanceof Future&&"FULFILLED"!==a.status)return a.then(this);"PENDING"!==this.status&&(a=!1,b=Error("Can't fulfill already-fulfilled future."),b.source=this);c=this._waiting;this.status=b?"FAILED":"FULFILLED";this._waiting=null;this._result=[a,b];c.forEach.bind(c,function(c){c instanceof Future?c.fulfill(a,b):c.call(null,a,b)}).async();return this};
Future.prototype.then=function(a){var b=new Future,c;a instanceof Future?(a.then(b),this._waiting?this._waiting.push(a):a.fulfill.apply(a,this._result)):(c=function(c,e){if(e)return b.fulfill(!1,e);try{b.fulfill(a(c,e))}catch(f){b.fulfill(!1,f)}},this._waiting?this._waiting.push(c):c.apply(null,this._result));return b};
Object.defineProperty(Function.prototype,"pipe",{value:function(a,b){var c=this,d=new Future,e=function(a,e){if(b)return d.fulfill(!1,b);if(e)return d.fulfill(!1,e);try{d.fulfill(c(a))}catch(h){d.fulfill(!1,h)}};a&&a.then&&"function"===typeof a.then?a.then(e):e.bind(null,a).async();return d}});async.task={};var Tasklet,TaskSpec,Task;TaskSpec=function(a){this.then=function(b){a._steps.push(b);return this};this.done=function(b){b&&(a._complete=b);return a}};Task=function(a){Future.call(this);this.resume=this.resume.bind(this);this.done=!1;this.error=null;this._args=[];this._steps=[];this._complete=null;this._step=0;this._finishing=!1;if("function"===typeof a)return this.first(a)};Task.prototype=new Future;Task.prototype.fulfill=function(){return this};
Task.prototype.reset=function(){this.error=null;this._args=[];this._waiting=[];this._step=0;this._finishing=!1;this._complete&&this._complete.__task__&&(this._complete=this._complete.__orig__);return this};Task.prototype.first=function(a){if(this._steps.length)throw Error("Task.first() can only be called once.");return(new TaskSpec(this)).then(a)};Task.prototype.args=function(a){this._args=a?arguments[1]?Array.prototype.slice.call(arguments):Array.isArray(a)?a:[a]:this._args};
Task.prototype.run=function(a){var b=this,c=new Future,d=b._complete;a&&b._args.push.apply(b._args,arguments);d&&d.__task__||(b._complete=function(){"function"===typeof d&&d.apply(b,b._args);if(b.error)return c.fulfill(!1,b.error);c.fulfill(b._args)},b._complete.__task__=this,b._complete.__orig__=d);b.resume.async();return c};
Task.prototype.finish=function(){var a,b,c;!0===this._finishing?(a=this._args,b=this.error,c=this._waiting,this._finishing=!1,this._complete.apply(this,a),c.forEach.bind(c,function(c){c instanceof Future?c.fulfill(a,b):c instanceof Task?(c.error=b,c.args(a),c.run()):c.call(null,a,b)}).async()):(this._finishing=!0,this.resume())};Task.prototype.next=function(){var a=this,b=a._steps[a._step++];return b?function(){return b.apply(a,a._args)}:b};
Task.prototype.resume=function(){var a=this,b=a.next(),c=0,d=function(b,c){a.error=c;if(a.error)return a.finish();a.args(b);a.resume()},e;if(!b)return a._finishing=!0,a.finish();try{e=b()}catch(f){d(e,f)}e instanceof Task?e.run().then(d):e instanceof Future?e.then(d):(Array.isArray(e)||(e=[e]),e.forEach(function(a,b){var f=function(a,f){e[b]=a;0===--c&&d(e,f)};a instanceof Task?(c+=1,a.run().then(f)):a instanceof Future&&(c+=1,a.then(f))}),0===c&&(!0===this._finishing?d(e):d.bind(null,e).async()))};var services={sse:{}};var util={object:{isObject:function(a){return/Object/.test(Object.prototype.toString.call(a))},resolve:function(a,b){for(var c=b.split(".");1<c.length;)if(a=a[c.shift()],!util.object.isObject(a))return a;return a[c.shift()]},resolveAndSet:function(a,b,c){for(var d=b.split(".");1<d.length;)b=d.shift(),a=a[b]||(a[b]={},a[b]);a[d.shift()]=c}}};var ServiceContext,Service;ServiceContext=function(){};ServiceContext.prototype={};ServiceContext.register=function(a,b){util.object.resolveAndSet(ServiceContext.prototype,a,b);return b};Service=function(a,b){if("string"!==typeof a)throw new TypeError("Service() requires a service name to register.");if(b)for(var c in b)b.hasOwnProperty(c)&&b[c]instanceof Function&&(this[c]=b[c]);ServiceContext.register(a,this)};Service.prototype=new ServiceContext;
Object.defineProperty(Function.prototype,"inject",{value:function(a){var b=this,c,d;if(b.__injected__)return b;a||(a=[]);if(a&&!Array.isArray(a)){if("string"!==typeof a)throw new TypeError("inject() requires a service name or list of names.");a=[a]}a.forEach(function(a){c||(c={});util.object.resolveAndSet(c,a,util.object.resolve(ServiceContext.prototype,a))});d=function(){};d.prototype=c||new ServiceContext;a=function(){return b.apply(new d,arguments)};a.__injected__=services.length?services:!0;return a}});
Object.defineProperty(Function.prototype,"service",{value:function(a){return ServiceContext.register(a,this.inject())}});Object.defineProperty(Object.prototype,"service",{value:function(a){return new Service(a,this)}});var Store=function(a,b,c){this.ns=(b||"store"+Store.storeCount++)+"::";this._backend=a;"string"===typeof c&&ServiceContext.register(c,this)};
Store.prototype={serialize:function(a){return"string"===typeof a?a:null==a?"":"object"===typeof a?JSON.stringify(a):String(a)},deserialize:function(a){var b=a.charAt(0);return"{"===b||"["===b?JSON.parse(a):a?"true"===a||"false"===a?Boolean(a):/^[0-9]+$/.test(a)?+a:a:""===a?a:null},get:function(a){return this.deserialize(this._backend.getItem(this.ns+a))},put:function(a,b){this._backend.setItem(this.ns+a,this.serialize(b))},del:function(a){this._backend.removeItem(this.ns+a)}};Store.storeCount=0;
services.storage={};supports.storage.local&&(services.storage.local=new Store(window.localStorage,"service","storage.local"));supports.storage.session&&(services.storage.session=new Store(window.sessionStorage,"service","storage.session"));var _dataCache,_dataStore,watchers;_dataCache={};supports.storage.local&&(_dataStore=new Store(window.localStorage,"data","storage.data"));watchers={};
services.data={init:function(a,b){var c=this.data.normalize(a),d=c.data.keys,e=c.data.objects,f,g,h;for(h=0;d&&h<d.length;h++)f=d[h],g=e[h],g.key||(g.key=f),g.native||(g.kind=g.govtrack_id?"legislator":"contributor"),_dataCache[f]=g;b(c)},normalize:function(a){if("string"===typeof a)try{a=JSON.parse(a)}catch(b){console.warn("[service.data] Couldn't parse raw data: "),console.warn(a),a={}}return a},get:function(a){var b;if(Array.isArray(a))return this.data.getAll(a);b=_dataCache[a];a=new Future;b&&
a.fulfill(b);return a},getAll:function(a){var b=new Future,c=[],d;a.forEach(function(e,f){services.data.get(e).then(function(e,h){h?d&&(d=!1,b.fulfill(!1,h)):(c[f]=e,c.length===a.length&&b.fulfill(c))})});return b},set:function(a,b){var c=watchers[a];util.object.resolveAndSet(_dataCache,a,b);c&&c.length&&c.forEach(function(a){a(b)})},watch:function(a,b){watchers[a]||(watchers[a]=[]);watchers[a].push(b)},unwatch:function(a,b){var c=b;b&&"function"===typeof b?watchers[a]=watchers[a].filter(function(a){return a===
b}):(c=watchers[a],watchers[a]=[]);return c}}.service("data");var _graphCache,_graphStore,_graphIndex,GRAPH;_graphCache={};supports.storage.local&&(_graphStore=new Store(window.localStorage,"graph","storage.graph"));_graphIndex={adjacency:{},nodesByKey:{},edgesByKey:{}};
services.graph={init:function(a){return GRAPH=this.graph.construct(a.graph,a.data)},construct:function(a,b){if(!a)return GRAPH;GRAPH={nodes:[],edges:[],natives:[],origin:a.origin,origin_key:b.keys[a.origin]};return this.graph.add(a,b)},add:function(a,b){var c,d,e,f,g,h;c=function(a,b){return function(c){var d;_graphIndex.adjacency[a]&&_graphIndex.adjacency[a][c]||(null==_graphIndex.nodesByKey[a]&&console.warn("Making edge with unencountered source "+a),null==_graphIndex.nodesByKey[c]&&console.warn("Making edge with unencountered target "+
c),d=GRAPH.edges.push({key:b,source:_graphIndex.nodesByKey[a],target:_graphIndex.nodesByKey[c]})-1,_graphIndex.edgesByKey[b].push(d),_graphIndex.adjacency[a]={},_graphIndex.adjacency[a][c]=d)}};d=0;for(e=b.keys;d<e.length;)f=e[d],d<=a.nodes?_graphIndex.nodesByKey[f]||(g={key:f,classes:["node"]},h=b.objects[d].native,h=b.objects[e.indexOf(h)],h.govtrack_id?(g.classes.push("legislator"),g.classes.push("M"===h.gender?"male":"female"),g.classes.push(Math.ceil(100*Math.random())%2?"democrat":"republican"),
.1869>Math.random()&&g.classes.push("senate")):(g.classes.push("contributor"),g.classes.push("C"==h.contributor_type?"corporate":"individual")),_graphIndex.nodesByKey[f]=GRAPH.nodes.push(g)-1):d<=a.edges&&(_graphIndex.edgesByKey[f]||(_graphIndex.edgesByKey[f]=[]),g=b.objects[d].node.slice(),h=g.shift(),g.forEach(c(h,f))),d++;return this.graph.get()},get:function(){return GRAPH}}.service("graph");services.indexer={}.service("indexer");util.structs={};util.structs.ListItem=function(a,b,c){this.data=a;this.previous=b||null;this.next=c||null;this.previous&&(this.previous.next=this);this.next&&(this.next.previous=this)};var BiLinkedList=function(a,b){this.tail=this.head=null;this.length=0;this.limit=b||Infinity;a&&Array.isArray(a)&&this.rpushAll(a)};BiLinkedList.prototype._increment=function(){for(this.length+=1;this.length>this.limit;)this.tail=this.tail.previous,this.tail.next=null,this.length-=1};
BiLinkedList.prototype.lpush=function(a){this.head=new util.structs.ListItem(a,null,this.head);this.tail||(this.tail=this.head);this._increment()};BiLinkedList.prototype.rpush=function(a){this.tail=new util.structs.ListItem(a,this.tail);this.head||(this.head=this.tail);this._increment()};BiLinkedList.prototype.lpushAll=function(a){var b=0;a=a||[];for(b;b<a.length;b++)this.lpush(a[b])};BiLinkedList.prototype.rpushAll=function(a){var b=0;a=a||[];for(b;b<a.length;b++)this.rpush(a[b])};
BiLinkedList.prototype.lpop=function(){var a;if(this.head)return a=this.head,this.head=this.head.next,this.length-=1,a.data};BiLinkedList.prototype.rpop=function(){var a;if(this.tail)return a=this.tail,this.tail=this.tail.previous,this.length-=1,a.data};util.structs.BiLinkedList=BiLinkedList;util.url={addParams:function(a,b){var c=!0;-1===a.indexOf("?")&&(a+="?",c=!1);for(var d in b)b.hasOwnProperty(d)&&(!0===c?a+="&":c=!0,a+=encodeURIComponent(d)+"="+encodeURIComponent(b[d]));return a},parseParams:function(a){var b={};a=a.split("?").pop().split("&");for(var c,d,e=0;e<a.length;e++)c=a[e].split("="),d=unescape(c[1]),b[c[0]]="true"===d||"false"===d?Boolean(d):/^\d*$/.test(d)?+d:d;return b},parse:function(a){var b={},c;b.url=a;b.params=util.url.parseParams(a);c=a.split("//");if(2===c.length)b.protocol=
c.shift().slice(0,-1);else if(1===c.length)b.protocol="";else throw Error("Can't parse malformed URL: "+a);c=c.shift().split("/");a=c[0];"/"===a.charAt(0)?b.hostname=b.port="":(a=c.shift().split(":"),b.hostname=a[0].split("?").shift(),b.port=+a[1]||("http"===b.protocol?80:"https"===b.protocol?443:""));b.path=c.join("/").split("?").shift();return b},join:function(a){var b=Array.prototype.slice.call(arguments),c=b.shift(),d=[],e;if(!b.length)return c;"/"===c.charAt(c.length-1)&&(c=c.slice(0,-1));for(d.push(c);b.length;)if(c=
b.shift())e=c.indexOf("/"),"."===c.charAt(0)&&-1<e&&("."===c.charAt(1)&&d.pop(),c=c.slice(e+1)),"/"!==c.charAt(0)&&("/"===c.charAt(c.length-1)&&(c=c.slice(0,-1)),d.push(c));return d.join("/")}};var _prepareRequest,_dispatchRequest,_parseResponse;_prepareRequest=function(a,b,c,d){var e=new XMLHttpRequest,f;f=b.params?util.url.addParams(b.url,b.params):b.url;e.open(a.toUpperCase(),f,d);if(b.headers){a=b.headers;for(var g in a)a.hasOwnProperty(g)&&e.setRequestHeader(g,a[g])}e.data=b.data;e.onerror=function(a){e.error=a;c.fulfill(!1,a)};e.onloadend=function(){e.responseJSON=_parseResponse(e);c.fulfill(e.responseJSON)};return e};
_dispatchRequest=function(a,b,c){var d=new Future,e="object"===typeof b.data?JSON.stringify(b.data):"string"===typeof b.data?b.data:null==b.data?null:""+b.data;b=_prepareRequest(a,b,d,!!c);c?(b.send.bind(b,e).async(),d=c.pipe(d)):(b.send(e),d=b.responseJSON);return d};
_parseResponse=function(a){var b={},c=a.getAllResponseHeaders().split("\n");try{b.data=JSON.parse(a.responseText)}catch(d){b.data=a.responseText||""}b.headers={};for(var e=0;e<c.length;e++)c[e]&&(a=c[e].split(/^([^:]+):\s*/),b.headers[a[1]]=a[2]);return b};
services.http={get:function(a,b){return _dispatchRequest("GET",a,b)},delete:function(a,b){return _dispatchRequest("DELETE",a,b)},head:function(a,b){return _dispatchRequest("HEAD",a,b)},post:function(a,b){return _dispatchRequest("POST",a,b)},put:function(a,b){return _dispatchRequest("PUT",a,b)},patch:function(a,b){return _dispatchRequest("PATCH",a,b)},options:function(a,b){return _dispatchRequest("OPTIONS",a,b)}}.service("http");var ROUTES={resolved:[],dynamic:[]},ROUTE_EVENTS={route:[],routed:[],error:[]},ROUTE_HISTORY={back:new util.structs.BiLinkedList(null,10),forward:new util.structs.BiLinkedList(null,10),current:null},_dispatchRoute,Route,router;_dispatchRoute=function(a,b,c){for(var d=0,e,f,g,h=function(a,c){b.args[e.keys[c]]=a};(e=c[d++])&&e.id<=a;)if(e.matcher.test(a)){f=!0;a=a.match(e.matcher).slice(1);a.forEach(h);g=e.handler.call(new ServiceContext,b);break}return{matched:f,response:g}};
Route=function(a,b){var c=this;c.keys=[];c.id=a.replace(/\/<(\w+)>/g,function(a,b){c.keys.push(b);return"/(\\w+)"});c.matcher=new RegExp("^"+c.id+"$");c.handler=b;c.resolved=0===c.keys.length};
services.router={register:function(a,b){var c,d,e;c=new Route(a,b);d=c.resolved?ROUTES.resolved:ROUTES.dynamic;for(e=0;e<d.length;e++)if(d[e].id>c.id){d.splice(e,0,c);return}d.push(c)},route:function(a,b){var c,d,e;b=b||{};b.args={};b.params=b.params||{};c=util.url.parseParams(a);for(d in c)c.hasOwnProperty(d)&&(b.params[d]=c[d]);ROUTE_EVENTS.route.forEach(function(c){c(a,b)});e=_dispatchRoute(a,b,ROUTES.resolved);e.matched||(e=_dispatchRoute(a,b,ROUTES.dynamic));e.matched?(e=e.response,ROUTE_EVENTS.routed.forEach(function(c){c(a,
b,e)})):(e={status:404},ROUTE_EVENTS.error.forEach(function(c){c(a,b,e)}));return e},back:function(){var a=ROUTE_HISTORY.back.rpop();a?(ROUTE_HISTORY.current&&ROUTE_HISTORY.forward.lpush(ROUTE_HISTORY.current),ROUTE_HISTORY.current=null,this.router.route(a.path,a.request)):this.router.route("/")},forward:function(){var a=ROUTE_HISTORY.forward.lpop();a?this.router.route(a.path,a.request):this.router.route("/")},on:function(a,b){ROUTE_EVENTS[a]||(ROUTE_EVENTS[a]=[]);ROUTE_EVENTS[a].push(b)},off:function(a,
b){var c;b?(c=ROUTE_EVENTS[a].indexOf(b),-1<c&&ROUTE_EVENTS[a].splice(c,1)):ROUTE_EVENTS[a]=[]},init:function(a,b){for(var c in a)a.hasOwnProperty(c)&&"function"===typeof a[c]&&this.router.register(c,a[c]);this.router.on("routed",function(a,b,c){ROUTE_HISTORY.current&&ROUTE_HISTORY.back.rpush(ROUTE_HISTORY.current);c.path=a;c.request=b;ROUTE_HISTORY.current=c});b&&b(window.location.pathname)}}.service("router");services.history={push:function(a,b){supports.history.html5&&window.history.pushState(b,"",a)},init:function(){var a=this;a.router.on("routed",function(a,c,d){"history"!==c.source&&services.history.push(a,d)});supports.history.html5&&(window.onpopstate=function(b){a.router.route(window.location.pathname,{source:"history",state:b.state||{}})});a.init=function(){throw Error("History already started");}}}.service("history");var _baseRPCURL="/_rpc/v1/",RPCAPI;RPCAPI=function(a,b,c){var d=this;d.name=a;d.config=c;b.forEach(function(a){var b=util.url.join(_baseRPCURL,d.name+"."+a);d[a]=function(a,c){a={url:b,data:a.data||{},params:a.params||{},headers:a.headers||{}};a.headers.Accept="application/json";a.headers["Content-Type"]="application/json";return this.http.post(a,c)}.inject("http")})};services.rpc={factory:function(a){var b=a[0];"string"===typeof b&&(services.rpc[b]=new RPCAPI(b,a[1],a[2]))},init:function(a){a.forEach(services.rpc.factory)}}.service("rpc");var TEMPLATES={};
services.template={put:function(a,b){"string"===typeof a&&"string"===typeof b&&(TEMPLATES[a]=b)},get:function(a){var b=new Future;if("string"!==typeof a)throw new TypeError("template.get() requires a string filename.");TEMPLATES[a]?b.fulfill(TEMPLATES[a]):this.rpc.content.template({data:{path:a}},function(a,d){if(d)return b.fulfill(!1,d);b.fulfill(a)});return b},has:function(a){return!!TEMPLATES[a]},init:function(a){for(var b in a)a.hasOwnProperty(b)&&"string"===typeof a[b]&&services.template.put(b,a[b])}}.service("template");var VIEWS={},getSelfAndChildren=function(a,b){var c=a.replace(".","/")+".html";services.template.get(c).then(function(d,e){var f,g,h;if(e)return b(!1,e);if("string"!==typeof d.data)return b(!1,d);f=[];g=d.data.replace(/v-component=("|')([\w\.\-]+)\1/g,function(a,b,c){f.push(c);return a});h=f.length;VIEWS[a]&&(VIEWS[a].options.template=g);services.template.put(c,g);if(0===h)return b(g);f.forEach(function(a){getSelfAndChildren(a,function(){h-=1;0===h&&b(g)})})})};
services.view={put:function(a,b){if("string"!==typeof a||"function"!==typeof b)throw new TypeError("services.view.put() takes a string name and constructor.");VIEWS[a]=b},get:function(a){if("string"!==typeof a)throw new TypeError("services.view.get() takes a string name.");return VIEWS[a]},init:function(a,b){var c=services.view.get(a);if(!c)throw Error("view.init() cannot be called with unregistered view "+a);getSelfAndChildren(a,function(d){var e,f;document.body.innerHTML="";d&&(c.options.template=
d);services.view.put(a,c);for(e in VIEWS)VIEWS.hasOwnProperty(e)&&(f=VIEWS[e],f.options.template||getSelfAndChildren(e,function(a){a&&(f.options.template=a);services.view.put(e,f)}));return new c({ready:b,el:"body"})})}}.service("view");var View=Vue.extend({});View.extend=function(a){var b=a.viewname.toLowerCase(),c=a.ready;if(!b||"string"!==typeof b)throw Error('View.extend() requires a "viewname" option to be passed.');a.ready=function(){this.$options.handler&&this.$on(this.$options.viewname,this.$options.handler.bind(this));c&&c.call(this)};a=Vue.extend(a);services.view.put(b,a);Vue.component(b,a);return a};var views={};
views.Detail=View.extend({viewname:"detail",replace:!0,data:{left:null,right:null,leftview:"",rightview:""},methods:{close:function(a){var b=a.target.parentNode,c;b.classList.contains("close")&&(a.preventDefault(),a.stopPropagation(),c=this[b.parentNode.getAttribute("id").split("_").pop()].key,a=this.keys(),c=a.indexOf(c),-1<c&&(c=Math.abs(c-1),a=a[c]?[a[c]]:[]),b.classList.add("transparent"),this.$root.$emit("route","/"+(1<a.length?a.join("/and/"):a[0]||"")))},keys:function(){var a=[];this.left&&
a.push(this.left.key);this.right&&a.push(this.right.key);return a},select:function(a){var b=this,c,d;a&&a.length&&(2<a.length&&(a=a.slice(0,2)),a.forEach(function(a){b.left&&b.left.key===a.key?c=a:b.right&&b.right.key===a.key?d=a:c?d=a:c=a}));a=[];c&&(b.$set("leftview","detail."+c.native.kind.toLowerCase()),a.push(c.key));d&&(b.$set("rightview","detail."+d.native.kind.toLowerCase()),a.push(d.key));b.$set("left",c);b.$set("right",d);b.$parent.$set("map.selected",a);b.$parent.$set("map.changed",!0)}},
handler:function(a){this.select(a)}});views.Modal=View.extend({viewname:"modal",methods:{close:function(a){a&&(a.preventDefault(),a.stopPropagation());services.router.back()}}});var Socket,SOCKETS;Socket=function(a,b){};services.socket=supports.socket?{spawn:function(a,b){var c=new Socket(a,b);return SOCKETS[c.url]=c}}.service("socket"):null;var SUPPORTED_TRANSPORTS={rpc:services.rpc,http:services.http,socket:services.socket},TRANSPORTS={},_transportExtending=!1,Transport,RPCTransport,HTTPTransport,SocketTransport,Channel;Transport=function(a){if(this.constructor===Transport)_transportExtending||console.warn("Transport() should not be instantiated directly.");else if(!SUPPORTED_TRANSPORTS[a])throw Error('Transport type "'+a+'" is not supported.');};
Transport.prototype.serialize=function(a){throw Error("Transport.serialize() must be overridden by subclasses.");};Transport.prototype.deserialize=function(a){throw Error("Transport.deserialize() must be overridden by subclasses.");};Transport.prototype.dispatch=function(a){throw Error("Transport.dispatch() must be overridden by subclasses.");};Transport.prototype.receive=function(a){throw Error("Transport.receive() must be overridden by subclasses.");};
Transport.extend=function(a,b){var c,d;if(TRANSPORTS[a])throw Error("Transport.extend() has already been called for type "+a+".");d=function(){Transport.call(this,a)};_transportExtending=!0;d.prototype=new Transport;_transportExtending=!1;for(c in b)b.hasOwnProperty(c)&&"function"===typeof b[c]&&(d.prototype[c]=b[c]);return TRANSPORTS[a]=d};
RPCTransport=Transport.extend("rpc",{serialize:function(a){var b=a.meta||a;return{data:a.content||a.data,params:b.params,headers:b.headers}},deserialize:function(a){var b={meta:{},content:a.data};a.headers&&(b.meta.headers=a.headers);return b},dispatch:function(a){var b=this,c=a.method,d;if("string"!==typeof c)throw Error('RPCTransport.dispatch() expects a message with a "method" property.');d=util.object.resolve(SUPPORTED_TRANSPORTS.rpc,c);"function"!==typeof d?console.warn('RPCTransport.dispatch() could not resolve dispatcher for method "'+
c+'".'):d(this.serialize(a),function(a,c){c||b.receive(a)})},receive:function(a){}});Channel=function(a){this._events={message:[],error:[]};a.message&&this._events.message.push(a.message);a.error&&this._events.error.push(a.error)};Channel.prototype.on=function(a,b){this._events[a]&&this._events[a].push(b)};Channel.prototype.off=function(a,b){var c,d;this._events[a]&&(c=this._events[a],b?(d=c.indexOf(b),-1<d&&c.splice(d,1)):c=[],this._events[a]=c)};services.channel={}.service("channel");views.detail={};
views.detail.Legislator=View.extend({viewname:"detail.legislator",replace:!0,data:{key:null,kind:null,fec_id:"",bioguideid:"",govtrack_id:"",thomas_id:"",osid:"",lismemberid:null,icpsrid:null,fbid:null,twitterid:null,metavidid:null,pvsid:null,firstname:"",lastname:"",gender:"",birthday:"",lastnameenc:"",lastnamealt:null,namemod:null,nickname:null,religion:null},attached:function(){var a=this.$el,b=a.parentNode,c=function(d){b.removeEventListener("transitionend",c);b.removeEventListener("webkitTransitionEnd",c);
a.classList.remove("v-enter")};b.addEventListener("webkitTransitionEnd",c);b.addEventListener("transitionend",c);a.classList.add("v-enter")}});views.Header=View.extend({viewname:"layout.header",replace:!0});views.Stage=View.extend({viewname:"layout.stage",replace:!0});views.page={};views.page.Login=View.extend({viewname:"page.login",replace:!0,methods:{login:function(a){a.preventDefault();a.stopPropagation();console.log("Login.login() called.")},signup:function(a){a.preventDefault();a.stopPropagation();console.log("Login.signup() called.")}},data:{session:null}});views.Map=View.extend({viewname:"page.map",replace:!0,selectors:{map:"#map",edge:".edge",node:".node",selected:".selected"},data:{map:{selected:[],changed:!1},config:{width:0,height:0,force:{alpha:.75,strength:1,friction:.9,theta:.7,gravity:.1,charge:-600,distance:180},origin:{snap:!1,dynamic:!1,position:null},node:{radius:25,scaleFactor:1.6,classes:["node"]},labels:{enable:!1,distance:0},edge:{width:2,stroke:"#999",classes:["link"]},sprite:{width:60,height:60}},dragging:!1,active:!1},methods:{isNode:function(a){return a.classList.contains("node")},
isEdge:function(a){return a.classList.contains("link")},viewDetail:function(a){var b,c,d;this.dragging||(b=a.target,this.isNode(b)&&(a.preventDefault(),a.stopPropagation(),c=b.getAttribute("id").split("-").pop(),d=this.$.detail.keys(),b.classList.contains(this.$options.selectors.selected.slice(1))?(a=d.indexOf(c),-1<a&&d.splice(a,1)):a.shiftKey?2>d.length&&d.push(c):d=[c],this.map.selected=d,this.map.changed=!0,this.$root.$emit("route","/"+(1<d.length?d.join("/and/"):d[0]||""))))},browseTo:function(a){console.log("map.browseTo()")},
startDrag:function(a){this.dragging=!0},endDrag:function(a){this.dragging=!1},draw:function(a){var b=this,c,d,e,f,g,h,k,l;if(a&&!b.map.root)c=b.config,d=b.$options.selectors,e=d3.select(d.map).attr("width",c.width).attr("height",c.height),f=e.selectAll(d.node),g=e.selectAll(d.edge),h=function(){b.config.origin.snap?(a.nodes[a.origin].x=b.config.origin.position.x,a.nodes[a.origin].y=b.config.origin.position.y):b.config.origin.position={x:a.nodes[a.origin].x,y:a.nodes[a.origin].y};g.attr("x1",function(a){return a.source.x-
b.config.node.radius}).attr("y1",function(a){return a.source.y-b.config.node.radius}).attr("x2",function(a){return a.target.x-b.config.node.radius}).attr("y2",function(a){return a.target.y-b.config.node.radius});f.attr("cx",function(a){return a.x-b.config.node.radius}).attr("cy",function(a){return a.y-b.config.node.radius});b.map.changed&&(f.filter(d.selected).filter(function(a){return-1===b.map.selected.indexOf(a.key)}).classed({selected:!1}).transition().duration(150).ease("cubic").attr("r",c.node.radius),
f.filter(function(a){return-1<b.map.selected.indexOf(a.key)}).classed({selected:!0}).transition().duration(150).ease("cubic").attr("r",c.node.radius*c.node.scaleFactor),b.map.changed=!1,b.map.force.start())},k=d3.layout.force().size([c.width,c.height]).linkDistance(c.force.distance).linkStrength(c.force.strength).friction(c.force.friction).theta(c.force.theta).gravity(c.force.gravity).alpha(c.force.alpha).charge(function(a){return-1<b.map.selected.indexOf(a.key)?c.force.charge*Math.pow(c.node.scaleFactor,
2):c.force.charge}).on("tick",h),l=function(){var d=a.nodes,e=a.edges;k.nodes(d).links(e).start();g=g.data(e,function(a){return a.key});g.exit().remove();g.enter().insert("line",".node").attr("id",function(a){return"edge-"+a.key}).attr("x1",function(a){return a.source.x}).attr("y1",function(a){return a.source.y}).attr("x2",function(a){return a.target.x}).attr("y2",function(a){return a.target.y}).attr("stroke-width",c.edge.width).attr("stroke",c.edge.stroke).attr("class",c.edge.classes);f=f.data(d,
function(a){return a.key});f.exit().remove();f.enter().append("svg:circle").attr("id",function(a){return"node-"+a.key}).attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y}).attr("r",c.node.radius).attr("width",c.sprite.width).attr("height",c.sprite.height).attr("class",function(a,c){-1<b.map.selected.indexOf(a.key)&&(b.map.changed=!0);return a.classes.join(" ")}).call(k.drag);f.filter(function(b,c){return b.key===a.origin_key});b.map.changed&&k.start()},b.map.root=e,b.map.force=k,
this.$root.nextTick(function(){l()});else return b.map.root=null,$(b.$options.selectors.map).innerHTML="",b.draw(a)},resize:function(a){a=this.$el.clientWidth;var b=this.$el.clientHeight;this.config.width=a;this.config.height=b;this.map.root&&this.map.root.attr("width",a).attr("height",b);this.config.origin.snap&&(this.config.origin.position={x:a/2,y:b/2});this.map.force.size([a,b]).resume()}},ready:function(){var a=this.$options.selectors.map;this.$watch("active",function(b){b&&$(a).classList.remove("transparent")});
this.resize=this.resize.bind(this);window.addEventListener("resize",this.resize)},beforeDestroy:function(){window.removeEventListener("resize",this.resize)},handler:function(a){var b=this.$el.clientWidth,c=this.$el.clientHeight;this.config.width=b;this.config.height=c;this.config.origin.snap&&(this.config.origin.position=this.config.origin.position||{},this.config.origin.position={x:b/2,y:c/2});a?(this.active=!0,this.draw(a)):(this.map.changed=!0,this.map.force&&this.map.force.start())}});views.App=Vue.extend({data:{page:{active:!1},modal:null},methods:{route:function(a){var b;a.target&&a.target.hasAttribute("data-route")&&(b=a.target.getAttribute("href"),a.preventDefault(),a.stopPropagation());b&&this.$emit("route",b)},error:function(a){this.$emit("route","/404",{error:a})},nextTick:function(a){return Vue.nextTick(a)}},ready:function(){this.$on("route",function(a,b){services.router.route(a,b)})}});services.view.put("app",views.App);
