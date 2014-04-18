
image_prefix = "//fatcatmap.org/image-proxy/providence-clarity/warehouse/raw/govtrack/photos/"
demo_data = @demo_data = {"nodes":[{"id":"400001","name":"Rep. Neil Abercrombie (D, HI-1)","type":"rep","district":1,"state":"HI","party":"Democrat"},{"id":"400003","name":"Rep. Gary Ackerman (D, NY-5)","type":"rep","district":5,"state":"NY","party":"Democrat"},{"id":"400004","name":"Rep. Robert Aderholt (R, AL-4)","type":"rep","district":4,"state":"AL","party":"Republican"},{"id":"400006","name":"Rep. Rodney Alexander (R, LA-5)","type":"rep","district":5,"state":"LA","party":"Republican"},{"id":"400013","name":"Sen. Tammy Baldwin (D, WI)","type":"sen","class":0,"state":"WI","party":"Democrat"},{"id":"400019","name":"Rep. Charles Bass (R, NH-2)","type":"rep","district":2,"state":"NH","party":"Republican"},{"id":"400027","name":"Rep. Judy Biggert (R, IL-13)","type":"rep","district":13,"state":"IL","party":"Republican"},{"id":"400028","name":"Rep. Michael Bilirakis (R, FL-9)","type":"rep","district":9,"state":"FL","party":"Republican"},{"id":"400183","name":"Rep. Tim Holden (D, PA-17)","type":"rep","district":17,"state":"PA","party":"Democrat"},{"id":"400187","name":"Rep. John Hostlettler (R, IN-8)","type":"rep","district":8,"state":"IN","party":"Republican"},{"id":"400196","name":"Rep. Darrell Issa (R, CA-49)","type":"rep","district":49,"state":"CA","party":"Republican"},{"id":"400157","name":"Rep. Kay Granger (R, TX-12)","type":"rep","district":12,"state":"TX","party":"Republican"},{"id":"400120","name":"Rep. Rahm Emanuel (D, IL-5)","type":"rep","district":5,"state":"IL","party":"Democrat"},{"id":"400125","name":"Rep. Bob Etheridge (D, NC-2)","type":"rep","district":2,"state":"NC","party":"Democrat"},{"id":"400117","name":"Rep. Jennifer Dunn (R, WA-8)","type":"rep","district":8,"state":"WA","party":"Republican"}],"edges":[{"id":0,"source":0,"target":1,"value":25},{"id":1,"source":0,"target":5,"value":37},{"id":2,"source":1,"target":12,"value":114},{"id":3,"source":1,"target":4,"value":28},{"id":4,"source":1,"target":7,"value":19},{"id":5,"source":2,"target":14,"value":17},{"id":6,"source":3,"target":14,"value":32},{"id":7,"source":4,"target":2,"value":37},{"id":8,"source":5,"target":11,"value":46},{"id":9,"source":5,"target":13,"value":47},{"id":10,"source":5,"target":7,"value":61},{"id":11,"source":6,"target":0,"value":132},{"id":12,"source":6,"target":1,"value":177},{"id":13,"source":7,"target":14,"value":41},{"id":14,"source":7,"target":3,"value":98},{"id":15,"source":8,"target":12,"value":14},{"id":16,"source":9,"target":2,"value":43},{"id":17,"source":9,"target":8,"value":31},{"id":18,"source":9,"target":11,"value":85},{"id":19,"source":10,"target":3,"value":23},{"id":20,"source":10,"target":12,"value":41}]}

# == utils == #
_get = (d) -> document.getElementById d

# == vars == #
stage = _get 'appstage'
map = _get 'map'
frame = _get 'appframe'

# == graph config == #
graph_config =

  width: frame.offsetWidth
  height: frame.offsetHeight

  force:
    strength: 0.7
    friction: 0.5
    theta: 0.5
    gravity: 0.08
    charge: -100
    distance: (e) ->
      if e.native?.data?
        return e.native.data.total
      return 50

  node:
    radius: 20

  sprite:
    width: 60
    height: 60

# == data transform == #
receive = @receive = (data) ->

  # parse data
  if typeof data == 'string'
    payload = @payload = JSON.parse data
  else
    payload = @payload = data

  data = @data = {}

  index = @index =
    nodes_by_key: {}
    edges_by_key: {}
    natives_by_key: {}
    object_natives: {}

  graph = @graph =
    nodes: []
    edges: []
    natives: []

  ## == inflate data objects == ##

  ## 1) keys & objects
  for key, key_i in payload.data.keys
    data[key] = payload.data.objects[key_i]

  ## 2) natives
  for native_i in payload.graph.natives
    _i = index.natives_by_key[payload.data.keys[native_i]] = (graph.natives.push
      key: payload.data.keys[native_i]
      data: data[payload.data.keys[native_i]]
    ) - 1

  ## == inflate graph structure == ##

  ## 1) nodes
  for node_i in payload.graph.nodes
    _i = index.nodes_by_key[payload.data.keys[node_i]] = (graph.nodes.push
      node:
        key: payload.data.keys[node_i]
        data: data[payload.data.keys[node_i]]
      native: graph.natives[index.natives_by_key[data[payload.data.keys[node_i]].native]]
    ) - 1

  ## 2) edges
  for edge_i in payload.graph.edges

    # extract source and targets from edge
    [source_k, targets...] = payload.data.objects[edge_i].node

    for target_k in targets
      if not index.edges_by_key[payload.data.keys[edge_i]]?
        index.edges_by_key[payload.data.keys[edge_i]] = []

      _i = (graph.edges.push
        edge:
          key: payload.data.keys[edge_i]
          data: data[payload.data.keys[edge_i]]
        native: graph.natives[index.natives_by_key[data[payload.data.keys[edge_i]].native]]
        source:
          index: index.nodes_by_key[source_k]
          object: graph.nodes[index.nodes_by_key[source_k]]
        target:
          index: index.nodes_by_key[target_k]
          object: graph.nodes[index.nodes_by_key[target_k]]
      ) - 1

      index.edges_by_key[payload.data.keys[edge_i]].push _i

  return setTimeout (-> draw(graph)), 0

# == graph draw == #
draw = @draw = (graph) ->

  console.log 'graph', graph

  width = stage.offsetWidth
  height = stage.offsetHeight

  color = @d3.scale.category20()

  force = @d3.layout.force()
                    .linkDistance(graph_config.force.distance)
                    .linkStrength(graph_config.force.strength)
                    .friction(graph_config.force.friction)
                    .charge(graph_config.force.charge)
                    .theta(graph_config.force.theta)
                    .gravity(graph_config.force.gravity)
                    .size([graph_config.width, graph_config.height])

  _load = (g) ->

    svg = d3.select(map)

    ## 1) edge structure
    edge_wrap = svg.selectAll('.edge')
                   .data(g.edges)
                   .enter()

    edge = edge_wrap.append('svg')
                    .attr('id', (e) -> 'edge-' + e.edge.key)

    line = edge.append('line')
               .attr('stroke', '#999')
               .attr('class', 'link')
               .style('stroke-width', 2)

    ## 2) node structure
    node_wrap = svg.selectAll('.node')
                   .data(g.nodes)
                   .enter()

    container = node_wrap.append('svg')
                         .attr('id', (n) -> 'group-' + n.node.key)
                         .attr('width', graph_config.sprite.width)
                         .attr('height', graph_config.sprite.height)
                         .call(force.drag)

    node = container.append('g')
                    .attr('width', graph_config.sprite.width)
                    .attr('height', graph_config.sprite.height)

    node = node.append('circle')
               .attr('r', graph_config.node.radius)
               .attr('cx', graph_config.sprite.width / 2)
               .attr('cy', graph_config.sprite.height / 2)
               .attr('class', 'node')

    ## 2.1) image for legislators
    legislator_image = node.append('image')
                           .filter((n) -> n.native.data.fecid?)
                           .attr('width', graph_config.sprite.width)
                           .attr('height', graph_config.sprite.height)
                           .attr('clip-path', 'url(#node-circle-mask)')
                           .attr('xlink:href', (n) -> image_prefix + n.native.data.govtrackid.toString() + '-' + '100px.jpeg')

    @d3.select(stage).on('click', (n) -> force.alpha(.5))

    force.on 'tick', (f) ->

      line.attr('x1', (d) -> d.source.object.x + (graph_config.node.radius / 2))
          .attr('y1', (d) -> d.source.object.y + (graph_config.node.radius / 2))
          .attr('x2', (d) -> d.target.object.x + (graph_config.node.radius / 2))
          .attr('y2', (d) -> d.target.object.y + (graph_config.node.radius / 2))

      container.attr('x', (d) -> d.x - graph_config.node.radius)
               .attr('y', (d) -> d.y - graph_config.node.radius)

    force.nodes(g.nodes).links(g.edges).start()

  return _load(graph)
