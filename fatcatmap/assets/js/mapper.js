
/*

  mapper
 */

/*
  graph_config
 */
var browse, configure, detail, draw;

configure = function() {
  var config;
  config = {
    width: this['catnip']['el']['mapper'].offsetWidth,
    height: this['catnip']['el']['mapper'].offsetHeight,
    force: {
      alpha: 0,
      strength: 10,
      friction: 0,
      theta: 0.1,
      gravity: 0.001,
      charge: -1000,
      distance: 150
    },
    origin: {
      snap: true,
      dynamic: true,
      position: {
        x: this['catnip']['el']['mapper'].offsetWidth - 30,
        y: this['catnip']['el']['mapper'].offsetHeight - 30
      }
    },
    node: {
      radius: 20,
      classes: 'node'
    },
    labels: {
      enable: true,
      distance: 0
    },
    edge: {
      width: 2,
      stroke: '#999',
      classes: 'link'
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
  this['catnip']['config']['graph'] = config;
  return config;
};


/*
  detail
 */

detail = this['detail'] = this['catnip']['graph']['detail'] = function(node) {
  console.log('Showing detail for node...', node);
  $('#leftbar section.content').text('node: ' + node.node.key);
  if ($.catnip.el.leftbar.classList.contains('collapsed')) {
    return $.catnip.ui.expand($.catnip.el.leftbar);
  }
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
    var color, config, force, graph_config, _incremental_draw, _load, _load_graph, _resize;
    console.log('Drawing materialized graph.', _graph);
    if (_this['catnip']['graph']['active'] == null) {
      graph_config = _this['catnip']['config']['graph'] = configure();
      _this['catnip']['graph']['active'] = _graph;
      config = _this['catnip']['config']['graph'];
      color = _this['d3'].scale.category20();
      force = _this['catnip']['graph']['force'] = _this['d3'].layout.force().size([config['width'], config['height']]).linkDistance(config['force']['distance']).charge(config['force']['charge']);
      _resize = function() {
        var height, width;
        width = this.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
        height = this.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
        this['catnip']['config']['graph']['width'] = width;
        this['catnip']['config']['graph']['height'] = height;
        this['catnip']['graph']['root'].attr('width', width).attr('height', height);
        return this['catnip']['graph']['force'].alpha(config['events']['click']['warmup']).size([config['width'], config['height']]);
      };
      _load = function(g, w, h) {
        var anchorLink, anchorNode, container, edge, edge_wrap, label_force, legislator_image, line, line_tick, node, node_tick, node_wrap, shape, svg, _consider_district, _e, _edge_labels, _generate_node_classes, _i, _j, _label, _len, _len1, _n, _node_labels, _ref, _ref1, _title_postfix;
        svg = this['catnip']['graph']['root'] = this['d3'].select(this['map']);
        if (config['labels']['enable']) {
          _node_labels = [];
          _edge_labels = [];
          _ref = g.nodes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            _n = _ref[_i];
            _label = [];
            if ((_n["native"].data.fecid != null) || (_n["native"].data.govtrack_id != null)) {
              if (_n["native"].data.fecid != null) {
                _consider_district = false;
                if (_n["native"].data.fecid[0] === 'H') {
                  _label.push('Rep.');
                  _consider_district = true;
                } else if (_n["native"].data.fecid[0] === 'S') {
                  _label.push('Sen.');
                } else if (_n["native"].data.fecid[0] === 'P') {
                  _label.push('President');
                }
                _label.push(_n["native"].data.firstname);
                _label.push(_n["native"].data.lastname);
                _title_postfix = _n["native"].data.fecid.slice(2, 4);
                if (_consider_district) {
                  _title_postfix += '-' + _n["native"].data.fecid.slice(4, 6);
                }
                _label.push('[' + _title_postfix + ']');
                _node_labels.push({
                  node: _n,
                  label: _label.join(' ')
                });
              } else {
                console.warn('Missing FECID for Legislator node.', _n);
                _node_labels.push({
                  node: _n,
                  label: ''
                });
              }
            } else if (_n["native"].data.contributor_type != null) {
              _node_labels.push({
                node: _n,
                label: _n["native"].data.name
              });
            } else {
              console.error('Unidentified object.', _n);
            }
          }
          _ref1 = g.edges;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            _e = _ref1[_j];
            _edge_labels.push({
              edge: _e,
              label: 'contribution',
              source: _e.source,
              target: _e.target
            });
          }
          label_force = this['catnip']['graph']['label_force'] = this['d3'].layout.force().nodes(_node_labels).links(_edge_labels).gravity(0).linkDistance(0).linkStrength(8).charge(-100).size([w, h]);
        }
        edge_wrap = this['catnip']['graph']['edge_wrap'] = svg.selectAll('.edge').data(g['edges']).enter();
        edge = this['catnip']['graph']['edge'] = edge_wrap.append('svg:svg').attr('id', function(e) {
          return 'edge-' + e.edge.key;
        });
        line = this['catnip']['graph']['line'] = edge.append('svg:line').attr('stroke', config['edge']['stroke']).attr('class', config['edge']['classes']).style('stroke-width', config['edge']['width']);
        node_wrap = this['catnip']['graph']['node_wrap'] = svg.selectAll('.node').data(g['nodes']).enter();
        container = this['catnip']['graph']['node_container'] = node_wrap.append('svg:svg').attr('id', function(n) {
          return 'group-' + n['node']['key'];
        }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).on('dblclick', this['catnip']['graph']['browse']).on('click', this['catnip']['graph']['detail']).call(force['drag']);
        _generate_node_classes = function(d, i) {
          var classList;
          classList = ['node-group'];
          if (d["native"].data.govtrack_id != null) {
            classList.push('legislator');
            classList.push(d["native"].data.gender === 'M' && 'male' || 'female');
            classList.push(parseInt((Math.random() * 100) % 2) && 'democrat' || 'republican');
          } else {
            classList.push('contributor');
            classList.push(d["native"].data.contributor_type === 'C' && 'corporate' || 'individual');
          }
          return classList.join(' ');
        };
        node = this['catnip']['graph']['node'] = container.append('svg:g').attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).attr('class', _generate_node_classes);
        shape = this['catnip']['graph']['circle'] = node.append('svg:circle').attr('r', config['node']['radius']).attr('cx', config['sprite']['width'] / 2).attr('cy', config['sprite']['height'] / 2).attr('class', config['node']['classes']);
        legislator_image = this['catnip']['graph']['legislator_image'] = node.append('svg:image').filter(function(n) {
          return n['native']['data']['govtrack_id'] != null;
        }).attr('width', config['sprite']['width']).attr('height', config['sprite']['height']).attr('clip-path', 'url(#node-circle-mask)').attr('xlink:href', (function(_this) {
          return function(n) {
            return _this['catnip']['config']['assets']['prefix'] + 'warehouse/raw/govtrack/photos/' + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'];
          };
        })(this));
        anchorLink = svg.selectAll('.ghost-edge.label').data(_edge_labels);
        anchorNode = svg.selectAll('.ghost-node.label').data(label_force.nodes()).enter().append('svg:g').attr('id', function(d, i) {
          return 'anchor-' + d.node.node.key;
        }).attr('class', 'anchor-node').append('svg:circle').attr('r', 0).style('fill', '#FFF').append('svg:text').text(function(d, i) {
          return d.label || '';
        }).style('fill', '#555').style('font-family', 'Arial').style('font-size', 12);
        window.onresize = _resize;
        line_tick = (function(_this) {
          return function(direction, point, edge_data, edge_i) {
            if (config['origin']['snap']) {
              if (edge_data[direction]['index'] === graph.origin) {
                return Math.floor(config['origin']['position'][point]);
              }
            }
            return Math.floor(edge_data[direction][point] + (config['node']['radius'] / 2));
          };
        })(this);
        node_tick = (function(_this) {
          return function(point, node_data, node_i) {
            if (config['origin']['snap']) {
              if (node_i === graph.origin) {
                return Math.floor(config['origin']['position'][point] - (config['sprite']['width'] / 2));
              }
            }
            return Math.floor(node_data[point] - config['node']['radius']);
          };
        })(this);
        force.on('tick', (function(_this) {
          return function(f) {
            var center_x, center_y, point, _k, _l, _len2, _len3, _ref2, _ref3, _results;
            center_x = config['width'] / 2;
            center_y = config['height'] / 2;
            if (config['origin']['dynamic'] && config['origin']['snap']) {
              config['origin']['position'] = {
                x: center_x + (config['sprite']['width'] / 2),
                y: center_y + (config['sprite']['height'] / 2)
              };
            }
            if (config['labels']['enable']) {
              label_force.start();
            }
            _ref2 = ['x', 'y'];
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              point = _ref2[_k];
              container.attr(point, function(d, i) {
                return node_tick(point, d, i);
              });
            }
            _ref3 = ['x1', 'y1', 'x2', 'y2'];
            _results = [];
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              point = _ref3[_l];
              _results.push(line.attr(point, function(d, i) {
                return line_tick(point[1] === '1' && 'source' || 'target', point[0], d, i);
              }));
            }
            return _results;
          };
        })(this));
        return force.nodes(g['nodes']).links(g['edges']).start() || force;
      };
      console.log('Drawing graph...', _graph);
      _load_graph = function() {
        return _load(graph);
      };
      return setTimeout(_load_graph, 150);
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
