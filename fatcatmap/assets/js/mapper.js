
/*
  map
 */
var browse, configure, detail, draw, leftbar, map, mapper, rightbar;

map = this['map'] = this['catnip']['el']['map'] = _get('#map');


/*
  mapper
 */

mapper = this['mapper'] = this['catnip']['el']['mapper'] = _get('#mapper');


/*
  leftbar
 */

leftbar = this['leftbar'] = this['catnip']['el']['leftbar'] = _get('#leftbar');


/*
  rightbar
 */

rightbar = this['rightbar'] = this['catnip']['el']['rightbar'] = _get('#rightbar');


/*
  graph_config
 */

configure = function() {
  var config;
  config = {
    width: this['catnip']['el']['mapper'].offsetWidth,
    height: this['catnip']['el']['mapper'].offsetHeight,
    force: {
      alpha: 0,
      strength: 50,
      friction: 0,
      theta: 0.1,
      gravity: 0.01,
      charge: 0,
      distance: 10
    },
    node: {
      radius: 20
    },
    sprite: {
      width: 60,
      height: 60,
      images: {
        format: (this['catnip']['context']['data']['agent']['capabilities']['webp'] && 'webp') || 'jpeg'
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
  detail
 */

detail = this['detail'] = this['catnip']['graph']['detail'] = function(node) {
  return console.log('Showing detail for node...', node);
};


/*
  browse
 */

browse = this['browse'] = this['catnip']['graph']['browse'] = function(node) {
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

draw = this['draw'] = this['catnip']['graph']['draw'] = (function(_this) {
  return function(_graph) {
    var color, config, force, graph_config, _graph_draw, _incremental_draw, _load, _resize;
    if (_this['catnip']['graph']['active'] == null) {
      graph_config = _this['catnip']['config']['graph'] = configure();
      _this['catnip']['graph']['active'] = _graph;
      config = _this['catnip']['config']['graph'];
      color = _this['d3'].scale.category20();
      force = _this['catnip']['graph']['force'] = _this['d3'].layout.force().linkDistance(config['force']['distance']).linkStrength(config['force']['strength']).friction(config['force']['friction']).charge(config['force']['charge']).theta(config['force']['theta']).gravity(config['force']['gravity']).alpha(config['force']['alpha']).size([config['width'], config['height']]);
      _resize = function() {
        var height, width;
        width = this.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
        height = this.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
        this['catnip']['graph']['root'].attr('width', width).attr('height', height);
        return this['catnip']['graph']['force'].alpha(config['events']['click']['warmup']);
      };
      _load = function(g) {
        var container, edge, edge_wrap, legislator_image, line, node, node_wrap, shape, svg;
        svg = this['catnip']['graph']['root'] = this['d3'].select(this['map']);
        edge_wrap = this['catnip']['graph']['edge_wrap'] = svg.selectAll('.edge').data(g['edges']).enter();
        edge = this['catnip']['graph']['edge'] = edge_wrap.append('svg').attr('id', function(e) {
          return 'edge-' + e.edge.key;
        });
        line = this['catnip']['graph']['line'] = edge.append('line').attr('stroke', '#999').attr('class', 'link').style('stroke-width', 2);
        node_wrap = this['catnip']['graph']['node_wrap'] = svg.selectAll('.node').data(g['nodes']).enter();
        container = this['catnip']['graph']['node_container'] = node_wrap.append('svg').attr('id', function(n) {
          return 'group-' + n['node']['key'];
        }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).call(force['drag']).on('dblclick', this['catnip']['graph']['browse']).on('click', this['catnip']['graph']['detail']);
        node = this['catnip']['graph']['node'] = container.append('g').attr('width', config['sprite']['width']).attr('height', config['sprite']['height']);
        shape = this['catnip']['graph']['circle'] = node.append('circle').attr('r', config['node']['radius']).attr('cx', config['sprite']['width'] / 2).attr('cy', config['sprite']['height'] / 2).attr('class', 'node');
        legislator_image = this['catnip']['graph']['legislator_image'] = node.append('image').filter(function(n) {
          return n['native']['data']['govtrack_id'] != null;
        }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).attr('clip-path', 'url(#node-circle-mask)').attr('xlink:href', (function(_this) {
          return function(n) {
            return _this['catnip']['config']['assets']['prefix'] + 'warehouse/raw/govtrack/photos/' + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'];
          };
        })(this));
        window.onresize = _resize;
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
      _graph_draw = function() {
        return _load(graph);
      };
      return setTimeout(_graph_draw, 150);
    }
    console.log('Incremental draw...', graph);
    _incremental_draw = function() {
      var _show_graph;
      _this['catnip']['ui']['hide'](_this['map']);
      _this['catnip']['el']['map'].textContent = '';
      _this['catnip']['graph']['draw'](graph);
      _show_graph = function() {
        return _this['catnip']['ui']['show'](_this['map']);
      };
      return setTimeout(_show_graph, 250);
    };
    return setTimeout(_incremental_draw, 0);
  };
})(this);

//# sourceMappingURL=../../../.develop/maps/fatcatmap/assets/coffee/mapper.js.map
