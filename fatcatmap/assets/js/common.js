
/*

  file header yup
 */

/*
  get
 */
var dye, frame, hide, image_prefix, load_context, map, mapper, onloads, receive, show, stage, _get, _onload,
  __slice = [].slice;

_get = this['_get'] = function(d) {
  if (d && (d.querySelector != null)) {
    return d;
  }
  if (typeof d === 'string') {
    if (d[0] === '#') {
      return document.getElementById(d.replace('#', ''));
    } else {
      return document.querySelectorAll(d);
    }
  }
  console.log('_get was asked to retrieve:', d);
  throw 'invalid _get string';
};


/*
  show
 */

show = this['show'] = function(d, hidden_only) {
  var el, element, _i, _len, _results;
  el = _get(d);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    if (hidden_only) {
      _results.push(element.classList.remove('hidden'));
    } else {
      _results.push(element.classList.remove('transparent'));
    }
  }
  return _results;
};


/*
  hide
 */

hide = this['hide'] = function(d) {
  var el, element, _i, _len, _results;
  el = _get(d);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    _results.push(element.classList.add('transparent'));
  }
  return _results;
};


/*
  dye
 */

dye = function(d, color) {
  var el, element, _i, _len, _results;
  el = _get(d);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    _results.push(element.classList.add('transparent'));
  }
  return _results;
};


/*
  stage
 */

stage = this['stage'] = _get('#appstage');


/*
  map
 */

map = this['map'] = _get('#map');


/*
  mapper
 */

mapper = this['mapper'] = _get('#mapper');


/*
  frame
 */

frame = this['frame'] = _get('#appframe');


/*
  image prefix
 */

image_prefix = this['image_prefix'] = "//deliver.fcm-static.org/image-proxy/providence-clarity/warehouse/raw/govtrack/photos/";


/*
  onload callbacks
 */

onloads = this['__onload_callbacks'] = [];


/*

  receive: a function of untold value
 */

receive = this['receive'] = function(data) {
  var graph, index, key, key_i, native_i, native_suboffset, payload, source_k, target_k, targets, _, _i, _j, _k, _key_iter, _len, _len1, _len2, _ref, _ref1, _ref2;
  if (typeof data === 'string') {
    payload = this['payload'] = JSON.parse(data);
  } else {
    payload = this['payload'] = data;
  }
  data = this['data'] = {};
  index = this['index'] = {
    nodes_by_key: {},
    edges_by_key: {},
    natives_by_key: {},
    object_natives: {}
  };
  graph = this['graph'] = {
    nodes: [],
    edges: [],
    natives: []
  };
  _ref = payload.data.keys;
  for (key_i = _i = 0, _len = _ref.length; _i < _len; key_i = ++_i) {
    key = _ref[key_i];
    data[key] = payload.data.objects[key_i];
  }
  _ref1 = Array(payload.graph.natives);
  for (native_suboffset = _j = 0, _len1 = _ref1.length; _j < _len1; native_suboffset = ++_j) {
    _ = _ref1[native_suboffset];
    native_i = payload.graph.edges + 1 + native_suboffset;
    _i = index.natives_by_key[payload.data.keys[native_i]] = (graph.natives.push({
      key: payload.data.keys[native_i],
      data: data[payload.data.keys[native_i]]
    })) - 1;
  }
  _key_iter = -1;
  while (_key_iter < payload.data.keys.length) {
    _key_iter++;
    if (_key_iter <= payload.graph.nodes) {
      _i = index.nodes_by_key[payload.data.keys[_key_iter]] = (graph.nodes.push({
        node: {
          key: payload.data.keys[_key_iter],
          data: data[payload.data.keys[_key_iter]]
        },
        "native": graph.natives[index.natives_by_key[data[payload.data.keys[_key_iter]]["native"]]]
      })) - 1;
    } else if (_key_iter <= payload.graph.edges) {
      _ref2 = payload.data.objects[_key_iter].node, source_k = _ref2[0], targets = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];
      for (_k = 0, _len2 = targets.length; _k < _len2; _k++) {
        target_k = targets[_k];
        if (index.edges_by_key[payload.data.keys[_key_iter]] == null) {
          index.edges_by_key[payload.data.keys[_key_iter]] = [];
        }
        _i = (graph.edges.push({
          edge: {
            key: payload.data.keys[_key_iter],
            data: data[payload.data.keys[_key_iter]]
          },
          "native": graph.natives[index.natives_by_key[data[payload.data.keys[_key_iter]]["native"]]],
          source: {
            index: index.nodes_by_key[source_k],
            object: graph.nodes[index.nodes_by_key[source_k]]
          },
          target: {
            index: index.nodes_by_key[target_k],
            object: graph.nodes[index.nodes_by_key[target_k]]
          }
        })) - 1;
      }
      index.edges_by_key[payload.data.keys[_key_iter]].push(_i);
    }
  }
  return setTimeout((function() {
    return this['draw'](graph);
  }), 0);
};


/*

  context
 */

load_context = this['load_context'] = function(event, data) {
  var context, pagedata, _mapper_queue, _mapper_reveal, _show_queue, _ui_reveal;
  _show_queue = [];
  _mapper_queue = [];
  context = this['context'] = data || JSON.parse(document.getElementById('js-context').textContent);
  console.log("Loading context...", context);
  if (this['context']['services']) {
    console.log("Loading services...", context['services']);
    apptools['rpc']['service']['factory'](context['services']);
  }
  if (this['context']['pagedata']) {
    pagedata = this['pagedata'] = JSON.parse(document.getElementById('js-data').textContent);
    console.log("Detected stapled pagedata...", pagedata);
    this['receive'](pagedata);
  }
  if (this['context']['session']) {
    if (this['context']['session']['established']) {
      this['session'] = this['context']['session']['payload'];
      console.log("Loading existing session...", this['session']);
    } else {
      this['session'] = {
        authenticated: false
      };
      console.log("Establishing fresh session...", this['session']);
      _show_queue.push(this['_get']('#logon'));
    }
  }
  _show_queue.push(this['_get']('#appfooter'));
  _show_queue.push(this['_get']('#appstage'));
  _mapper_queue.push(this['_get']('#catnip'));
  _ui_reveal = (function(_this) {
    return function() {
      var element_set, _i, _len, _results;
      console.log('Flushing UI reveal queue...', _show_queue);
      _results = [];
      for (_i = 0, _len = _show_queue.length; _i < _len; _i++) {
        element_set = _show_queue[_i];
        _results.push(_this['show'](element_set));
      }
      return _results;
    };
  })(this);
  _mapper_reveal = (function(_this) {
    return function() {
      var element_set, _i, _len, _results;
      console.log('Flusing mapper reveal queue...', _mapper_queue);
      _results = [];
      for (_i = 0, _len = _mapper_queue.length; _i < _len; _i++) {
        element_set = _mapper_queue[_i];
        _results.push(_this['show'](element_set));
      }
      return _results;
    };
  })(this);
  setTimeout(_ui_reveal, 800);
  setTimeout(_mapper_reveal, 500);
  return this['context'];
};

onloads.push(load_context);


/*

  receive: a function of untold value
 */

_onload = this['onload'] = function(event) {
  var callback, _i, _len, _ref, _results;
  _ref = this['__onload_callbacks'];
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    callback = _ref[_i];
    _results.push(callback(event));
  }
  return _results;
};

//# sourceMappingURL=../../../.develop/maps/fatcatmap/assets/coffee/common.js.map
