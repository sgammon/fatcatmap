
/*

  file header yup
 */

/*
  get
 */
var busy, catnip, close, collapse, dye, expand, graph, hide, idle, index, load_context, receive, show, toggle, _get, _onload,
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
  catnip! :)
 */

catnip = this['catnip'] = {
  ui: {},
  data: {},
  graph: {},
  context: {},
  config: {
    assets: {
      prefix: "//storage.googleapis.com/providence-clarity/"
    }
  },
  state: {
    pending: 1
  },
  events: {
    onload: []
  },
  el: {
    map: _get('#appstage'),
    stage: _get('#appstage'),
    frame: _get('#appframe'),
    logon: _get('#logon'),
    mapper: _get('#mapper'),
    spinner: _get('#appspinner'),
    leftbar: _get('#leftbar'),
    rightbar: _get('#rightbar')
  }
};


/*
  show
 */

show = this['show'] = this['catnip']['ui']['show'] = function(d, hidden_only) {
  var el, element, _i, _len, _results;
  el = _get(d);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    element.classList.remove('hidden');
    if (!hidden_only) {
      _results.push(element.classList.remove('transparent'));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};


/*
  hide
 */

hide = this['hide'] = this['catnip']['ui']['hide'] = function(d) {
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
  toggle
 */

toggle = this['toggle'] = this['catnip']['ui']['toggle'] = function(d, klass) {
  var el, element, _i, _len, _results;
  el = _get(d);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    _results.push(element.classList.toggle(klass || 'transparent'));
  }
  return _results;
};


/*
  dye
 */

dye = this['dye'] = this['catnip']['ui']['dye'] = function(d, color) {
  var el, element, _i, _len, _results;
  el = _get(d);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    _results.push(element.style.setProperty('background-color', color));
  }
  return _results;
};


/*
  busy
 */

busy = this['busy'] = this['catnip']['busy'] = (function(_this) {
  return function() {
    var _pending;
    _pending = _this['catnip']['state']['pending']++;
    if (_pending === 0) {
      if (_this['catnip']['el']['spinner']) {
        return $.catnip.ui.show(_this['catnip']['el']['spinner']);
      }
    }
  };
})(this);


/*
  idle
 */

idle = this['idle'] = this['catnip']['idle'] = (function(_this) {
  return function() {
    var _pending;
    _pending = --_this['catnip']['state']['pending'];
    if (_pending === 0) {
      if (_this['catnip']['el']['spinner']) {
        return $.catnip.ui.hide(_this['catnip']['el']['spinner']);
      }
    }
  };
})(this);


/*
  expand
 */

expand = this['expand'] = this['catnip']['ui']['expand'] = function(target, state) {
  var add, el, element, remove, _i, _len, _results;
  if (state == null) {
    state = false;
  }
  el = _get(target);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    if (element.classList.contains('open-small')) {
      remove = 'open-small';
      if (!state) {
        add = 'open-expanded';
      }
    } else if (element.classList.contains('open-expanded')) {
      remove = 'open-expanded';
      if (!state) {
        add = 'open-fullscreen';
      }
    } else if (element.classList.contains('collapsed')) {
      remove = 'collapsed';
      if (!state) {
        add = 'open-small';
      }
    }
    add = add || state;
    if (remove) {
      element.classList.remove(remove);
      element.classList.remove('transparent');
    }
    _results.push(element.classList.add(add));
  }
  return _results;
};


/*
  collapse
 */

collapse = this['collapse'] = this['catnip']['ui']['collapse'] = function(target, state) {
  var add, el, element, remove, _i, _len, _results;
  if (state == null) {
    state = false;
  }
  el = _get(target);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    if (element.classList.contains('open-small')) {
      remove = 'open-small';
      if (!state) {
        add = 'collapsed';
      }
    } else if (element.classList.contains('open-expanded')) {
      remove = 'open-expanded';
      if (!state) {
        add = 'open-small';
      }
    } else if (element.classList.contains('open-fullscreen')) {
      remove = 'open-fullscreen';
      if (!state) {
        add = 'open-expanded';
      }
    }
    add = add || state;
    if (remove) {
      element.classList.remove(remove);
    }
    _results.push(element.classList.add(add));
  }
  return _results;
};


/*
  close
 */

close = this['close'] = this['catnip']['ui']['close'] = function(target) {
  var el, element, _i, _len, _results;
  el = _get(target);
  if (el.length == null) {
    el = [el];
  }
  _results = [];
  for (_i = 0, _len = el.length; _i < _len; _i++) {
    element = el[_i];
    element.classList.remove('open-small');
    element.classList.remove('open-expanded');
    element.classList.remove('open-fullscreen');
    element.classList.add('collapsed');
    _results.push(element.classList.add('transparent'));
  }
  return _results;
};


/*
  jQuery mount
 */

if (typeof $ !== "undefined" && $ !== null) {
  $.extend({
    catnip: this['catnip']
  });
}


/*
  data
 */

this['catnip']['data']['raw'] = {};


/*
  index
 */

index = this['catnip']['data']['index'] = {
  adjacency: {},
  nodes_by_key: {},
  edges_by_key: {},
  natives_by_key: {},
  object_natives: {}
};


/*
  graph
 */

graph = this['catnip']['data']['graph'] = {
  nodes: [],
  edges: [],
  origin: null,
  natives: []
};


/*
  receive: a function of untold value
 */

receive = this['catnip']['data']['receive'] = (function(_this) {
  return function(data) {
    var key, key_i, native_i, native_suboffset, payload, source_k, target_k, targets, _, _i, _j, _k, _key_iter, _len, _len1, _len2, _ref, _ref1, _ref2;
    if (typeof data === 'string') {
      payload = _this['catnip']['data']['payload'] = JSON.parse(data);
    } else {
      payload = _this['catnip']['data']['payload'] = data;
    }
    graph.origin = payload.graph.origin;
    _ref = payload.data.keys;
    for (key_i = _i = 0, _len = _ref.length; _i < _len; key_i = ++_i) {
      key = _ref[key_i];
      if (_this['catnip']['data']['raw'][key] == null) {
        _this['catnip']['data']['raw'][key] = payload.data.objects[key_i];
      }
    }
    _ref1 = Array(payload.graph.natives);
    for (native_suboffset = _j = 0, _len1 = _ref1.length; _j < _len1; native_suboffset = ++_j) {
      _ = _ref1[native_suboffset];
      native_i = payload.graph.edges + 1 + native_suboffset;
      if (index.natives_by_key[payload.data.keys[native_i]] == null) {
        index.natives_by_key[payload.data.keys[native_i]] = (graph.natives.push({
          key: payload.data.keys[native_i],
          data: payload.data.objects[native_i]
        })) - 1;
      }
    }
    _key_iter = -1;
    while (_key_iter < payload.data.keys.length) {
      _key_iter++;
      if (_key_iter <= payload.graph.nodes) {
        if (!_this['catnip']['data']['index']['nodes_by_key'][payload['data']['keys'][_key_iter]]) {
          _i = index.nodes_by_key[payload.data.keys[_key_iter]] = (graph.nodes.push({
            node: {
              key: payload.data.keys[_key_iter],
              data: _this['catnip']['data']['raw'][payload.data.keys[_key_iter]]
            },
            "native": {
              key: payload.data.objects[_key_iter]["native"],
              data: _this['catnip']['data']['raw'][payload.data.objects[_key_iter]["native"]]
            }
          })) - 1;
        } else {
          _i = index.nodes_by_key[payload.data.keys[_key_iter]];
        }
      } else if (_key_iter <= payload.graph.edges) {
        if (!index.edges_by_key[payload.data.keys[_key_iter]]) {
          index.edges_by_key[payload.data.keys[_key_iter]] = [];
        }
        _ref2 = payload.data.objects[_key_iter].node, source_k = _ref2[0], targets = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];
        for (_k = 0, _len2 = targets.length; _k < _len2; _k++) {
          target_k = targets[_k];
          if (_this['catnip']['data']['index']['adjacency'][source_k] && _this['catnip']['data']['index']['adjacency'][source_k][target_k]) {
            _i = _this['catnip']['data']['index']['adjacency'][source_k][target_k];
          } else {
            _i = (graph.edges.push({
              edge: {
                key: payload.data.keys[_key_iter],
                data: payload.data.objects[_key_iter]
              },
              "native": _this['catnip']['data']['raw'][payload.data.objects[_key_iter]["native"]],
              source: index.nodes_by_key[source_k],
              target: index.nodes_by_key[target_k]
            })) - 1;
            index.edges_by_key[payload.data.keys[_key_iter]].push(_i);
            if (_this['catnip']['data']['index']['adjacency'][source_k] == null) {
              _this['catnip']['data']['index']['adjacency'][source_k] = {};
            }
            _this['catnip']['data']['index']['adjacency'][source_k][target_k] = _i;
          }
        }
      }
    }
    return setTimeout((function() {
      return this['catnip']['graph']['draw'](graph);
    }), 0);
  };
})(this);


/*

  context
 */

load_context = this['catnip']['context']['load'] = (function(_this) {
  return function(event, data) {
    var context, pagedata, _catnip, _map, _mapper_queue, _mapper_reveal, _show_queue, _ui_reveal;
    _show_queue = [];
    _mapper_queue = [];
    context = _this['catnip']['context']['data'] = data || JSON.parse(document.getElementById('js-context').textContent);
    console.log("Loading context...", context);
    if (_this['catnip']['context']['data']['services']) {
      console.log("Loading services...", context['services']);
      apptools['rpc']['service']['factory'](context['services']);
    }
    if (_this['catnip']['context']['data']['pagedata']) {
      pagedata = _this['pagedata'] = JSON.parse(document.getElementById('js-data').textContent);
      console.log("Detected stapled pagedata...", pagedata);
      _this['catnip']['data']['receive'](pagedata);
    }
    if (_this['catnip']['context']['data']['session']) {
      if (_this['catnip']['context']['data']['session']['established']) {
        _this['catnip']['session'] = _this['catnip']['context']['data']['session']['payload'];
        console.log("Loading existing session...", _this['catnip']['session']);
      } else {
        _this['catnip']['session'] = {};
        console.log("Establishing fresh session...", _this['catnip']['session']);
        _show_queue.push(_this['catnip']['el']['logon']);
      }
    }
    _map = _this['_get']('#map');
    if (_map) {
      _catnip = _this['_get']('#catnip');
      _show_queue.push(_map);
      _mapper_queue.push(_catnip);
    }
    _show_queue.push(_this['_get']('#appfooter'));
    _ui_reveal = function() {
      var element_set, _i, _len, _results;
      console.log('Flushing UI reveal queue...', _show_queue);
      _results = [];
      for (_i = 0, _len = _show_queue.length; _i < _len; _i++) {
        element_set = _show_queue[_i];
        _results.push(_this['catnip']['ui']['show'](element_set));
      }
      return _results;
    };
    _mapper_reveal = function() {
      var element_set, _i, _len;
      console.log('Flusing mapper reveal queue...', _mapper_queue);
      for (_i = 0, _len = _mapper_queue.length; _i < _len; _i++) {
        element_set = _mapper_queue[_i];
        _this['catnip']['ui']['show'](element_set);
      }
      return _this['catnip']['idle']();
    };
    setTimeout(_ui_reveal, 800);
    setTimeout(_mapper_reveal, 500);
    return _this['catnip']['context'];
  };
})(this);

this['catnip']['events']['onload'].push(load_context);


/*

  storage
 */


/*

  history
 */


/*

  receive: a function of untold value
 */

_onload = this['onload'] = function(event) {
  var callback, _i, _len, _ref, _results;
  _ref = this['catnip']['events']['onload'];
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    callback = _ref[_i];
    _results.push(callback(event));
  }
  return _results;
};

//# sourceMappingURL=../../../.develop/maps/fatcatmap/assets/coffee/common.js.map
