
/*

  graph_config
 */
var draw, graph_config, _ref, _ref1, _ref2;

graph_config = this['graph_config'] = {
  width: frame.offsetWidth,
  height: frame.offsetHeight,
  force: {
    alpha: 1,
    strength: 0.4,
    friction: 0.5,
    theta: 0.3,
    gravity: 0.05,
    charge: -50,
    distance: function(e) {
      var _ref;
      if (((_ref = e["native"]) != null ? _ref.data : void 0) != null) {
        return e["native"].data.total;
      }
      return 500;
    }
  },
  node: {
    radius: 20
  },
  sprite: {
    width: 60,
    height: 60,
    images: {
      format: ((_ref = this['context']) != null ? (_ref1 = _ref.agent) != null ? (_ref2 = _ref1.capabilities) != null ? typeof _ref2.webp === "function" ? _ref2.webp({
        'webp': 'jpeg'
      }) : void 0 : void 0 : void 0 : void 0) || 'jpeg'
    }
  },
  events: {
    click: {
      warmup: .4
    }
  }
};


/*

  draw
 */

draw = this['draw'] = function(graph) {
  var color, config, force, height, width, _load;
  width = this['stage'].offsetWidth;
  height = this['stage'].offsetHeight;
  config = this['graph_config'];
  color = this['d3'].scale.category20();
  force = this['d3'].layout.force().linkDistance(config['force']['distance']).linkStrength(config['force']['strength']).friction(config['force']['friction']).charge(config['force']['charge']).theta(config['force']['theta']).gravity(config['force']['gravity']).size([config['width'], config['height']]).alpha(config['force']['alpha']);
  _load = function(g) {
    var container, edge, edge_wrap, legislator_image, line, node, node_wrap, shape, svg;
    svg = this['d3'].select(this['map']);
    edge_wrap = svg.selectAll('.edge').data(g['edges']).enter();
    edge = edge_wrap.append('svg').attr('id', function(e) {
      return 'edge-' + e.edge.key;
    });
    line = edge.append('line').attr('stroke', '#999').attr('class', 'link').style('stroke-width', 2);
    node_wrap = svg.selectAll('.node').data(g['nodes']).enter();
    container = node_wrap.append('svg').attr('id', function(n) {
      return 'group-' + n['node']['key'];
    }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).call(force['drag']);
    node = container.append('g').attr('width', config['sprite']['width']).attr('height', config['sprite']['height']);
    shape = node.append('circle').attr('r', config['node']['radius']).attr('cx', config['sprite']['width'] / 2).attr('cy', config['sprite']['height'] / 2).attr('class', 'node');
    legislator_image = node.append('image').filter(function(n) {
      return n['native']['data']['govtrack_id'] != null;
    }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).attr('clip-path', 'url(#node-circle-mask)').attr('xlink:href', function(n) {
      return image_prefix + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'];
    });
    this['d3'].select(stage).on('click', function(n) {
      return force['alpha'](config['events']['click']['warmup']);
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
  return _load(graph);
};

//# sourceMappingURL=../../../.develop/maps/fatcatmap/assets/coffee/mapper.js.map
