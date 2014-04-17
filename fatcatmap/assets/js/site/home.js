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
      strength: 0.8,
      friction: 0.7,
      theta: 0.6,
      gravity: 0.075,
      charge: -80
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
    var edge_i, graph, index, payload, source, source_i, target_spec, targets, _ref;
    payload = JSON.parse(data);
    index = {
      map: {},
      nodes_to_edges: {},
      objects_to_natives: {}
    };
    graph = {
      nodes: [],
      edges: []
    };
    _ref = payload.data.index.map;
    for (source_i in _ref) {
      target_spec = _ref[source_i];
      edge_i = target_spec[0], targets = 2 <= target_spec.length ? __slice.call(target_spec, 1) : [];
      source = {
        node: {
          key: payload.data.keys[source_i],
          object: payload.data.objects[source_i]
        },
        "native": payload.data.objects[payload.data.index]
      };
    }
    return draw(interpreted.graph);
  };

  draw = this.draw = function(graph) {
    var color, force, height, width, _load;
    console.log('graph', graph);
    width = stage.offsetWidth;
    height = stage.offsetHeight;
    color = this.d3.scale.category20();
    force = this.d3.layout.force().linkDistance(graph_config.force.distance).linkStrength(graph_config.force.strength).friction(graph_config.force.friction).charge(graph_config.force.charge).theta(graph_config.force.theta).gravity(graph_config.force.gravity).size([graph_config.width, graph_config.height]);
    _load = function(g) {
      var edge_group, group, link, node, sprite, svg;
      svg = d3.select(map);
      edge_group = svg.selectAll('.edge').data(g.edges).enter().append('svg').attr('id', function(e) {
        return 'edge-' + e.edge.id;
      });
      link = edge_group.append('line').attr('stroke', '#999').attr('class', 'link').style('stroke-width', 2);
      sprite = svg.selectAll('.node').data(g.nodes).enter().append('svg').attr('id', function(n) {
        return 'group-' + n.node.encoded;
      }).attr('width', graph_config.sprite.width).attr('height', graph_config.sprite.height).call(force.drag);
      group = sprite.append('g').attr('width', graph_config.sprite.width).attr('height', graph_config.sprite.height);
      node = group.append('circle').attr('r', graph_config.node.radius).attr('cx', graph_config.sprite.width / 2).attr('cy', graph_config.sprite.height / 2).attr('class', 'node');
      this.d3.select('#appstage').on('click', function(n) {
        return force.alpha(.4);
      });
      force.on('tick', function(f) {
        link.attr('x1', function(d) {
          return d.source.x + (graph_config.node.radius / 2);
        }).attr('y1', function(d) {
          return d.source.y + (graph_config.node.radius / 2);
        }).attr('x2', function(d) {
          return d.target.x + (graph_config.node.radius / 2);
        }).attr('y2', function(d) {
          return d.target.y + (graph_config.node.radius / 2);
        });
        return sprite.attr('x', function(d) {
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
