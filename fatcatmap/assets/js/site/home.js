(function() {
  var demo_data, draw, frame, graph_config, image_prefix, map, receive, stage, _get,
    __slice = [].slice;

  image_prefix = "//storage.googleapis.com/providence-clarity/warehouse/raw/govtrack/photos/";

  demo_data = this.demo_data = {
    "nodes": [
      {
        "id": "400001",
        "name": "Rep. Neil Abercrombie (D, HI-1)",
        "type": "rep",
        "district": 1,
        "state": "HI",
        "party": "Democrat"
      }, {
        "id": "400003",
        "name": "Rep. Gary Ackerman (D, NY-5)",
        "type": "rep",
        "district": 5,
        "state": "NY",
        "party": "Democrat"
      }, {
        "id": "400004",
        "name": "Rep. Robert Aderholt (R, AL-4)",
        "type": "rep",
        "district": 4,
        "state": "AL",
        "party": "Republican"
      }, {
        "id": "400006",
        "name": "Rep. Rodney Alexander (R, LA-5)",
        "type": "rep",
        "district": 5,
        "state": "LA",
        "party": "Republican"
      }, {
        "id": "400013",
        "name": "Sen. Tammy Baldwin (D, WI)",
        "type": "sen",
        "class": 0,
        "state": "WI",
        "party": "Democrat"
      }, {
        "id": "400019",
        "name": "Rep. Charles Bass (R, NH-2)",
        "type": "rep",
        "district": 2,
        "state": "NH",
        "party": "Republican"
      }, {
        "id": "400027",
        "name": "Rep. Judy Biggert (R, IL-13)",
        "type": "rep",
        "district": 13,
        "state": "IL",
        "party": "Republican"
      }, {
        "id": "400028",
        "name": "Rep. Michael Bilirakis (R, FL-9)",
        "type": "rep",
        "district": 9,
        "state": "FL",
        "party": "Republican"
      }, {
        "id": "400183",
        "name": "Rep. Tim Holden (D, PA-17)",
        "type": "rep",
        "district": 17,
        "state": "PA",
        "party": "Democrat"
      }, {
        "id": "400187",
        "name": "Rep. John Hostlettler (R, IN-8)",
        "type": "rep",
        "district": 8,
        "state": "IN",
        "party": "Republican"
      }, {
        "id": "400196",
        "name": "Rep. Darrell Issa (R, CA-49)",
        "type": "rep",
        "district": 49,
        "state": "CA",
        "party": "Republican"
      }, {
        "id": "400157",
        "name": "Rep. Kay Granger (R, TX-12)",
        "type": "rep",
        "district": 12,
        "state": "TX",
        "party": "Republican"
      }, {
        "id": "400120",
        "name": "Rep. Rahm Emanuel (D, IL-5)",
        "type": "rep",
        "district": 5,
        "state": "IL",
        "party": "Democrat"
      }, {
        "id": "400125",
        "name": "Rep. Bob Etheridge (D, NC-2)",
        "type": "rep",
        "district": 2,
        "state": "NC",
        "party": "Democrat"
      }, {
        "id": "400117",
        "name": "Rep. Jennifer Dunn (R, WA-8)",
        "type": "rep",
        "district": 8,
        "state": "WA",
        "party": "Republican"
      }
    ],
    "edges": [
      {
        "id": 0,
        "source": 0,
        "target": 1,
        "value": 25
      }, {
        "id": 1,
        "source": 0,
        "target": 5,
        "value": 37
      }, {
        "id": 2,
        "source": 1,
        "target": 12,
        "value": 114
      }, {
        "id": 3,
        "source": 1,
        "target": 4,
        "value": 28
      }, {
        "id": 4,
        "source": 1,
        "target": 7,
        "value": 19
      }, {
        "id": 5,
        "source": 2,
        "target": 14,
        "value": 17
      }, {
        "id": 6,
        "source": 3,
        "target": 14,
        "value": 32
      }, {
        "id": 7,
        "source": 4,
        "target": 2,
        "value": 37
      }, {
        "id": 8,
        "source": 5,
        "target": 11,
        "value": 46
      }, {
        "id": 9,
        "source": 5,
        "target": 13,
        "value": 47
      }, {
        "id": 10,
        "source": 5,
        "target": 7,
        "value": 61
      }, {
        "id": 11,
        "source": 6,
        "target": 0,
        "value": 132
      }, {
        "id": 12,
        "source": 6,
        "target": 1,
        "value": 177
      }, {
        "id": 13,
        "source": 7,
        "target": 14,
        "value": 41
      }, {
        "id": 14,
        "source": 7,
        "target": 3,
        "value": 98
      }, {
        "id": 15,
        "source": 8,
        "target": 12,
        "value": 14
      }, {
        "id": 16,
        "source": 9,
        "target": 2,
        "value": 43
      }, {
        "id": 17,
        "source": 9,
        "target": 8,
        "value": 31
      }, {
        "id": 18,
        "source": 9,
        "target": 11,
        "value": 85
      }, {
        "id": 19,
        "source": 10,
        "target": 3,
        "value": 23
      }, {
        "id": 20,
        "source": 10,
        "target": 12,
        "value": 41
      }
    ]
  };

  _get = function(d) {
    return document.getElementById(d);
  };

  stage = _get('appstage');

  map = _get('map');

  frame = _get('appframe');

  graph_config = {
    width: frame.offsetWidth,
    height: frame.offsetHeight,
    force: {
      strength: 0.7,
      friction: 0.5,
      theta: 0.5,
      gravity: 0.08,
      charge: -100,
      distance: function(e) {
        var _ref;
        if (((_ref = e["native"]) != null ? _ref.data : void 0) != null) {
          return e["native"].data.total;
        }
        return 50;
      }
    },
    node: {
      radius: 20
    },
    sprite: {
      width: 60,
      height: 60
    }
  };

  receive = this.receive = function(data) {
    var edge_i, graph, index, key, key_i, native_i, node_i, payload, source_k, target_k, targets, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    if (typeof data === 'string') {
      payload = this.payload = JSON.parse(data);
    } else {
      payload = this.payload = data;
    }
    data = this.data = {};
    index = this.index = {
      nodes_by_key: {},
      edges_by_key: {},
      natives_by_key: {},
      object_natives: {}
    };
    graph = this.graph = {
      nodes: [],
      edges: [],
      natives: []
    };
    _ref = payload.data.keys;
    for (key_i = _i = 0, _len = _ref.length; _i < _len; key_i = ++_i) {
      key = _ref[key_i];
      data[key] = payload.data.objects[key_i];
    }
    _ref1 = payload.graph.natives;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      native_i = _ref1[_j];
      _i = index.natives_by_key[payload.data.keys[native_i]] = (graph.natives.push({
        key: payload.data.keys[native_i],
        data: data[payload.data.keys[native_i]]
      })) - 1;
    }
    _ref2 = payload.graph.nodes;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      node_i = _ref2[_k];
      _i = index.nodes_by_key[payload.data.keys[node_i]] = (graph.nodes.push({
        node: {
          key: payload.data.keys[node_i],
          data: data[payload.data.keys[node_i]]
        },
        "native": graph.natives[index.natives_by_key[data[payload.data.keys[node_i]]["native"]]]
      })) - 1;
    }
    _ref3 = payload.graph.edges;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      edge_i = _ref3[_l];
      _ref4 = payload.data.objects[edge_i].node, source_k = _ref4[0], targets = 2 <= _ref4.length ? __slice.call(_ref4, 1) : [];
      for (_m = 0, _len4 = targets.length; _m < _len4; _m++) {
        target_k = targets[_m];
        if (index.edges_by_key[payload.data.keys[edge_i]] == null) {
          index.edges_by_key[payload.data.keys[edge_i]] = [];
        }
        _i = (graph.edges.push({
          edge: {
            key: payload.data.keys[edge_i],
            data: data[payload.data.keys[edge_i]]
          },
          "native": graph.natives[index.natives_by_key[data[payload.data.keys[edge_i]]["native"]]],
          source: {
            index: index.nodes_by_key[source_k],
            object: graph.nodes[index.nodes_by_key[source_k]]
          },
          target: {
            index: index.nodes_by_key[target_k],
            object: graph.nodes[index.nodes_by_key[target_k]]
          }
        })) - 1;
        index.edges_by_key[payload.data.keys[edge_i]].push(_i);
      }
    }
    return setTimeout((function() {
      return draw(graph);
    }), 0);
  };

  draw = this.draw = function(graph) {
    var color, force, height, width, _load;
    console.log('graph', graph);
    width = stage.offsetWidth;
    height = stage.offsetHeight;
    color = this.d3.scale.category20();
    force = this.d3.layout.force().linkDistance(graph_config.force.distance).linkStrength(graph_config.force.strength).friction(graph_config.force.friction).charge(graph_config.force.charge).theta(graph_config.force.theta).gravity(graph_config.force.gravity).size([graph_config.width, graph_config.height]);
    _load = function(g) {
      var container, edge, edge_wrap, legislator_image, line, node, node_wrap, svg;
      svg = d3.select(map);
      edge_wrap = svg.selectAll('.edge').data(g.edges).enter();
      edge = edge_wrap.append('svg').attr('id', function(e) {
        return 'edge-' + e.edge.key;
      });
      line = edge.append('line').attr('stroke', '#999').attr('class', 'link').style('stroke-width', 2);
      node_wrap = svg.selectAll('.node').data(g.nodes).enter();
      container = node_wrap.append('svg').attr('id', function(n) {
        return 'group-' + n.node.key;
      }).attr('width', graph_config.sprite.width).attr('height', graph_config.sprite.height).call(force.drag);
      node = container.append('g').attr('width', graph_config.sprite.width).attr('height', graph_config.sprite.height);
      node = node.append('circle').attr('r', graph_config.node.radius).attr('cx', graph_config.sprite.width / 2).attr('cy', graph_config.sprite.height / 2).attr('class', 'node');
      legislator_image = node.append('image').filter(function(n) {
        return n["native"].data.fecid != null;
      }).attr('width', graph_config.sprite.width).attr('height', graph_config.sprite.height).attr('clip-path', 'url(#node-circle-mask)').attr('xlink:href', function(n) {
        return image_prefix + n["native"].data.govtrackid.toString() + '-' + '100px.jpeg';
      });
      this.d3.select(stage).on('click', function(n) {
        return force.alpha(.5);
      });
      force.on('tick', function(f) {
        line.attr('x1', function(d) {
          return d.source.object.x + (graph_config.node.radius / 2);
        }).attr('y1', function(d) {
          return d.source.object.y + (graph_config.node.radius / 2);
        }).attr('x2', function(d) {
          return d.target.object.x + (graph_config.node.radius / 2);
        }).attr('y2', function(d) {
          return d.target.object.y + (graph_config.node.radius / 2);
        });
        return container.attr('x', function(d) {
          return d.x - graph_config.node.radius;
        }).attr('y', function(d) {
          return d.y - graph_config.node.radius;
        });
      });
      return force.nodes(g.nodes).links(g.edges).start();
    };
    return _load(graph);
  };

}).call(this);

//# sourceMappingURL=../../../../.develop/maps/fatcatmap/assets/coffee/site/home.js.map
