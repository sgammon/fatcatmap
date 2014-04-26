
###
  catnip
###
catnip = @['catnip'] = {}


###
  map
###
map = @['map'] = _get '#map'


###
  mapper
###
mapper = @['mapper'] = _get '#mapper'

###
  graph_config
###

graph_config = @['graph_config'] =

  width: @['mapper'].offsetWidth
  height: @['mapper'].offsetHeight

  force:
    alpha: 1
    strength: 0.4
    friction: 0.5
    theta: 0.3
    gravity: 0.05
    charge: -50
    distance: (e) ->
      if e.native?.data?
        return e.native.data.total
      return 500

  node:
    radius: 20

  sprite:
    width: 60
    height: 60
    images:
      format: (@['context']?.agent?.capabilities?.webp? 'webp' : 'jpeg') || 'jpeg'

  events:
    click:
      warmup: .4


###
  browse
###

browse = @['browse'] = (node) ->

  console.log 'Browsing to origin...', node

  $.apptools.api.graph
    .construct
      origin: node.node.key
    .fulfill
      success: (response) ->
        receive response

###
  draw
###

draw = @['draw'] = (_graph) ->

  if not @['catnip'].graph?

    @['catnip']['graph'] = _graph
    config = @['graph_config']

    color = @['d3'].scale.category20()

    force = @['catnip']['force'] = @['d3'].layout.force()
                      .linkDistance(config['force']['distance'])
                      .linkStrength(config['force']['strength'])
                      .friction(config['force']['friction'])
                      .charge(config['force']['charge'])
                      .theta(config['force']['theta'])
                      .gravity(config['force']['gravity'])
                      .alpha(config['force']['alpha'])
                      .size([config['width'], config['height']])

    _load = (g) ->

      svg = @['catnip']['svg'] = @['d3'].select(@['map'])

      ## 1) edge structure
      edge_wrap = @['catnip']['edge_wrap'] = svg.selectAll('.edge')
                     .data(g['edges'])
                     .enter()

      edge = @['catnip']['edge'] = edge_wrap.append('svg')
                      .attr('id', (e) -> 'edge-' + e.edge.key)

      line = @['catnip']['line'] = edge.append('line')
                 .attr('stroke', '#999')
                 .attr('class', 'link')
                 .style('stroke-width', 2)

      ## 2) node structure
      node_wrap = @['catnip']['node_wrap'] = svg.selectAll('.node')
                     .data(g['nodes'])
                     .enter()

      container = @catnip['node_container'] = node_wrap.append('svg')
                           .attr('id', (n) -> 'group-' + n['node']['key'])
                           .attr('width', config['sprite']['width'])
                           .attr('height', config['sprite']['height'])
                           .call(force['drag'])
                           .on('dblclick', browse)

      node = @catnip['node'] = container.append('g')
                      .attr('width', config['sprite']['width'])
                      .attr('height', config['sprite']['height'])

      shape = @catnip['circle'] = node.append('circle')
                  .attr('r', config['node']['radius'])
                  .attr('cx', config['sprite']['width'] / 2)
                  .attr('cy', config['sprite']['height'] / 2)
                  .attr('class', 'node')

      ## 2.1) image for legislators
      legislator_image = @catnip['legislator_image'] = node.append('image')
                             .filter((n) -> n['native']['data']['govtrack_id']?)
                             .attr('width', config['sprite']['width'])
                             .attr('height', config['sprite']['height'])
                             .attr('clip-path', 'url(#node-circle-mask)')
                             .attr('xlink:href', (n) -> image_prefix + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'])

      #@['d3'].select(stage).on('click', (n) -> force['alpha'](config['events']['click']['warmup']))

      force.on 'tick', (f) ->

        line.attr('x1', (d) -> d['source']['object']['x'] + (config['node']['radius'] / 2))
            .attr('y1', (d) -> d['source']['object']['y'] + (config['node']['radius'] / 2))
            .attr('x2', (d) -> d['target']['object']['x'] + (config['node']['radius'] / 2))
            .attr('y2', (d) -> d['target']['object']['y'] + (config['node']['radius'] / 2))

        container.attr('x', (d) -> d['x'] - config['node']['radius'])
                 .attr('y', (d) -> d['y'] - config['node']['radius'])

      force.nodes(g['nodes']).links(g['edges']).start()

    console.log 'Drawing graph...', _graph
    _graph_draw = () =>
      _load(graph)
    return setTimeout(_graph_draw, 150)

  # ~~ incremental draw: graph's already here bruh ~~ #
  console.log 'Incremental draw...', graph

  _incremental_draw = () =>

    @['catnip'] = {}

    # redraws for now get rid of the current grapher
    @['hide'](@['map']);
    @['map'].textContent = ''
    @['draw'](graph)

    _show_graph = () => @['show'](@['map'])
    setTimeout(_show_graph, 250)

  return setTimeout(_incremental_draw, 0)
