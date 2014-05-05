
/*
  catnip
 */
var browse, catnip, configure, draw, leftbar, map, mapper;

catnip = this['catnip'] = {};


/*
  map
 */

map = this['map'] = _get('#map');


/*
  mapper
 */

mapper = this['mapper'] = _get('#mapper');


/*
  leftbar
 */

leftbar = this['leftbar'] = _get('#leftbar');


/*
  rightbar
 */

leftbar = this['rightbar'] = _get('#rightbar');


/*
  graph_config
 */

configure = function() {
  var config;
  config = {
    width: this['mapper'].offsetWidth,
    height: this['mapper'].offsetHeight,
    force: {
      alpha: 0,
      strength: 0,
      friction: 0,
      theta: 0,
      gravity: 1,
      charge: 0,
      distance: function(e) {
        var _ref;
        if (((_ref = e["native"]) != null ? _ref.data : void 0) != null) {
          return e["native"].data.total;
        }
        return 5000;
      }
    },
    node: {
      radius: 20
    },
    sprite: {
      width: 60,
      height: 60,
      images: {
        format: 'jpeg'
      }
    },
    events: {
      click: {
        warmup: .8
      }
    }
  };
  return config;
};


/*
  browse
 */

browse = this['browse'] = function(node) {
  console.log('Browsing to origin...', node);
  return $.apptools.api.graph.construct({
    origin: node.node.key
  }).fulfill({
    success: function(response) {
      return receive(response);
    }
  });
};


/*
  draw
 */

draw = this['draw'] = function(_graph) {
  var color, config, force, graph_config, _graph_draw, _incremental_draw, _load;
  if (this['catnip'].graph == null) {
    graph_config = this['graph_config'] = configure();
    this['catnip']['graph'] = _graph;
    config = this['graph_config'];
    color = this['d3'].scale.category20();
    force = this['catnip']['force'] = this['d3'].layout.force().linkDistance(config['force']['distance']).linkStrength(config['force']['strength']).friction(config['force']['friction']).charge(config['force']['charge']).theta(config['force']['theta']).gravity(config['force']['gravity']).alpha(config['force']['alpha']).size([config['width'], config['height']]);
    _load = function(g) {
      var container, edge, edge_wrap, legislator_image, line, node, node_wrap, shape, svg;
      svg = this['catnip']['svg'] = this['d3'].select(this['map']);
      edge_wrap = this['catnip']['edge_wrap'] = svg.selectAll('.edge').data(g['edges']).enter();
      edge = this['catnip']['edge'] = edge_wrap.append('svg').attr('id', function(e) {
        return 'edge-' + e.edge.key;
      });
      line = this['catnip']['line'] = edge.append('line').attr('stroke', '#999').attr('class', 'link').style('stroke-width', 2);
      node_wrap = this['catnip']['node_wrap'] = svg.selectAll('.node').data(g['nodes']).enter();
      container = this.catnip['node_container'] = node_wrap.append('svg').attr('id', function(n) {
        return 'group-' + n['node']['key'];
      }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).call(force['drag']).on('dblclick', browse);
      node = this.catnip['node'] = container.append('g').attr('width', config['sprite']['width']).attr('height', config['sprite']['height']);
      shape = this.catnip['circle'] = node.append('circle').attr('r', config['node']['radius']).attr('cx', config['sprite']['width'] / 2).attr('cy', config['sprite']['height'] / 2).attr('class', 'node');
      legislator_image = this.catnip['legislator_image'] = node.append('image').filter(function(n) {
        return n['native']['data']['govtrack_id'] != null;
      }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).attr('clip-path', 'url(#node-circle-mask)').attr('xlink:href', function(n) {
        return image_prefix + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'];
      });
      force.on('tick', function(f) {
        line.attr('x1', function(d) {
          return d['source']['object']['x'] + (config['node']['radius'] / 2);
        }).attr('y1', function(d) {
          return d['source']['object']['y'] + (config['node']['radius'] / 2);
        }).attr('x2', function(d) {
          return d['target']['object']['x'] + (config['node']['radius'] / 2);
        }).attr('y2', function(d) {
          return d['target']['object']['y'] + (config['node']['radius'] / 2);
        });
        return container.attr('x', function(d) {
          return d['x'] - config['node']['radius'];
        }).attr('y', function(d) {
          return d['y'] - config['node']['radius'];
        });
      });
      return force.nodes(g['nodes']).links(g['edges']).start();
    };
    console.log('Drawing graph...', _graph);
    _graph_draw = (function(_this) {
      return function() {
        return _load(graph);
      };
    })(this);
    return setTimeout(_graph_draw, 150);
  }
  console.log('Incremental draw...', graph);
  _incremental_draw = (function(_this) {
    return function() {
      var _show_graph;
      _this['catnip'] = {};
      _this['hide'](_this['map']);
      _this['map'].textContent = '';
      _this['draw'](graph);
      _show_graph = function() {
        return _this['show'](_this['map']);
      };
      return setTimeout(_show_graph, 250);
    };
  })(this);
  return setTimeout(_incremental_draw, 0);
};

//# sourceMappingURL=../../../.develop/maps/fatcatmap/assets/coffee/mapper.js.map
