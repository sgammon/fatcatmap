
###

  mapper

###


###
  graph_config
###

configure = () ->

  config =
    width: @['catnip']['el']['mapper'].offsetWidth
    height: @['catnip']['el']['mapper'].offsetHeight

    force:
      alpha: 0
      strength: 50
      friction: 0
      theta: 0.1
      gravity: 0.01
      charge: 0
      distance: 10

    node:
      radius: 20
      classes: 'node'

    edge:
      width: 2
      stroke: '#999'
      classes: 'link'

    sprite:
      width: 60
      height: 60
      images:
        format: (@['catnip']['context']['data']['agent']['capabilities']['webp'] and 'webp') or 'jpeg'

    events:
      click:
        warmup: .8

  @['catnip']['config']['graph'] = config
  return config


###
  detail
###

detail = @['detail'] = @['catnip']['graph']['detail'] = (node) ->
  console.log 'Showing detail for node...', node


###
  browse
###

browse = @['browse'] = @['catnip']['graph']['browse'] = (node) ->
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

draw = @['draw'] = @['catnip']['graph']['draw'] = (_graph) =>

  if not @['catnip']['graph']['active']?

    graph_config = @['catnip']['config']['graph'] = configure()

    @['catnip']['graph']['active'] = _graph
    config = @['catnip']['config']['graph']

    color = @['d3'].scale.category20()

    force = @['catnip']['graph']['force'] = @['d3'].layout.force()
                      .linkDistance(config['force']['distance'])
                      .linkStrength(config['force']['strength'])
                      .friction(config['force']['friction'])
                      .charge(config['force']['charge'])
                      .theta(config['force']['theta'])
                      .gravity(config['force']['gravity'])
                      .alpha(config['force']['alpha'])
                      .size([config['width'], config['height']])

    _resize = () ->
      width = @innerWidth || document.body.clientWidth || document.documentElement.clientWidth
      height = @innerHeight || document.body.clientHeight || document.documentElement.clientHeight

      @['catnip']['graph']['root']
        .attr('width', width)
        .attr('height', height)

      @['catnip']['graph']['force']
        .alpha(config['events']['click']['warmup'])
        .size([width, height])

    _load = (g) ->

      svg = @['catnip']['graph']['root'] = @['d3'].select(@['map'])

      ## 1) edge structure
      edge_wrap = @['catnip']['graph']['edge_wrap'] = svg.selectAll('.edge')
                     .data(g['edges'])
                     .enter()

      edge = @['catnip']['graph']['edge'] = edge_wrap.append('svg')
                      .attr('id', (e) -> 'edge-' + e.edge.key)

      line = @['catnip']['graph']['line'] = edge.append('line')
                 .attr('stroke', config['edge']['stroke'])
                 .attr('class', config['edge']['classes'])
                 .style('stroke-width', config['edge']['width'])

      ## 2) node structure
      node_wrap = @['catnip']['graph']['node_wrap'] = svg.selectAll('.node')
                     .data(g['nodes'])
                     .enter()

      container = @['catnip']['graph']['node_container'] = node_wrap.append('svg')
                           .attr('id', (n) -> 'group-' + n['node']['key'])
                           .attr('width', config['sprite']['width'])
                           .attr('height', config['sprite']['height'])
                           .on('dblclick', @['catnip']['graph']['browse'])
                           .on('click', @['catnip']['graph']['detail'])
                           .call(force['drag'])

      node = @['catnip']['graph']['node'] = container.append('g')
                      .attr('width', config['sprite']['width'])
                      .attr('height', config['sprite']['height'])

      shape = @['catnip']['graph']['circle'] = node.append('circle')
                  .attr('r', config['node']['radius'])
                  .attr('cx', config['sprite']['width'] / 2)
                  .attr('cy', config['sprite']['height'] / 2)
                  .attr('class', config['node']['classes'])

      ## 2.1) image for legislators
      legislator_image = @['catnip']['graph']['legislator_image'] = node.append('image')
                             .filter((n) -> n['native']['data']['govtrack_id']?)
                             .attr('width', config['sprite']['width'])
                             .attr('height', config['sprite']['height'])
                             .attr('clip-path', 'url(#node-circle-mask)')
                             .attr('xlink:href', (n) => @['catnip']['config']['assets']['prefix'] + 'warehouse/raw/govtrack/photos/' + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'])

      # attach resize handler
      window.onresize = _resize

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

    # redraws for now get rid of the current grapher
    @['catnip']['ui']['hide'](@['map']);
    @['catnip']['el']['map'].textContent = ''
    @['catnip']['graph']['draw'](graph)

    _show_graph = () => @['catnip']['ui']['show'](@['map'])
    setTimeout(_show_graph, 250)

  return setTimeout(_incremental_draw, 0)
