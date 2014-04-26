
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

  draw

###

draw = @['draw'] = (graph) ->

  config = @['graph_config']

  color = @['d3'].scale.category20()

  force = @['d3'].layout.force()
                    .linkDistance(config['force']['distance'])
                    .linkStrength(config['force']['strength'])
                    .friction(config['force']['friction'])
                    .charge(config['force']['charge'])
                    .theta(config['force']['theta'])
                    .gravity(config['force']['gravity'])
                    .alpha(config['force']['alpha'])
                    .size([config['width'], config['height']])

  _load = (g) ->

    svg = @['d3'].select(@['map'])

    ## 1) edge structure
    edge_wrap = svg.selectAll('.edge')
                   .data(g['edges'])
                   .enter()

    edge = edge_wrap.append('svg')
                    .attr('id', (e) -> 'edge-' + e.edge.key)

    line = edge.append('line')
               .attr('stroke', '#999')
               .attr('class', 'link')
               .style('stroke-width', 2)

    ## 2) node structure
    node_wrap = svg.selectAll('.node')
                   .data(g['nodes'])
                   .enter()

    container = node_wrap.append('svg')
                         .attr('id', (n) -> 'group-' + n['node']['key'])
                         .attr('width', config['sprite']['width'])
                         .attr('height', config['sprite']['height'])
                         .call(force['drag'])

    node = container.append('g')
                    .attr('width', config['sprite']['width'])
                    .attr('height', config['sprite']['height'])

    shape = node.append('circle')
                .attr('r', config['node']['radius'])
                .attr('cx', config['sprite']['width'] / 2)
                .attr('cy', config['sprite']['height'] / 2)
                .attr('class', 'node')

    ## 2.1) image for legislators
    legislator_image = node.append('image')
                           .filter((n) -> n['native']['data']['govtrack_id']?)
                           .attr('width', config['sprite']['width'])
                           .attr('height', config['sprite']['height'])
                           .attr('clip-path', 'url(#node-circle-mask)')
                           .attr('xlink:href', (n) -> image_prefix + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'])

    @['d3'].select(stage).on('click', (n) -> force['alpha'](config['events']['click']['warmup']))

    force.on 'tick', (f) ->

      line.attr('x1', (d) -> d['source']['object']['x'] + (config['node']['radius'] / 2))
          .attr('y1', (d) -> d['source']['object']['y'] + (config['node']['radius'] / 2))
          .attr('x2', (d) -> d['target']['object']['x'] + (config['node']['radius'] / 2))
          .attr('y2', (d) -> d['target']['object']['y'] + (config['node']['radius'] / 2))

      container.attr('x', (d) -> d['x'] - config['node']['radius'])
               .attr('y', (d) -> d['y'] - config['node']['radius'])

    force.nodes(g['nodes']).links(g['edges']).start()

  _graph_draw = () =>
    _load(graph)
  return setTimeout(_graph_draw, 150)
