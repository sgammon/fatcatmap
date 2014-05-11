
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
      strength: 10
      friction: 0
      theta: 0.1
      gravity: 0.001
      charge: -1000
      distance: 200

    origin:
      snap: true
      dynamic: true
      position:
        x: @['catnip']['el']['mapper'].offsetWidth - 30
        y: @['catnip']['el']['mapper'].offsetHeight - 30

    node:
      radius: 20
      classes: 'node'

    labels:
      enable: true
      distance: 0

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
  $('#leftbar section.content').text('node: ' + node.node.key)

  if $.catnip.el.leftbar.classList.contains('collapsed')
    $.catnip.ui.expand($.catnip.el.leftbar)


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

  console.log 'Drawing materialized graph.', _graph

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

      @['catnip']['config']['graph']['width'] = width
      @['catnip']['config']['graph']['height'] = height

      @['catnip']['graph']['root']
        .attr('width', width)
        .attr('height', height)

      @['catnip']['graph']['force']
        .alpha(config['events']['click']['warmup'])
        .size([config['width'], config['height']])

    _load = (g, w, h) ->

      svg = @['catnip']['graph']['root'] = @['d3'].select(@['map'])

      if config['labels']['enable']
        ## 0) generate labels and label force
        _node_labels = []
        _edge_labels = []

        for _n in g.nodes

          _label = []

          # is it a legislator?
          if _n.native.data.fecid? or _n.native.data.govtrack_id?

            if _n.native.data.fecid?

              # by default, ignore districts (only used for house members)
              _consider_district = false

              # process title first
              if _n.native.data.fecid[0] == 'H'
                _label.push 'Rep.'
                _consider_district = true
              else if _n.native.data.fecid[0] == 'S'
                _label.push 'Sen.'
              else if _n.native.data.fecid[0] == 'P'
                _label.push 'President'

              # then add firstname, lastname
              _label.push _n.native.data.firstname
              _label.push _n.native.data.lastname

              # then add state and district, if applicable
              _title_postfix = _n.native.data.fecid.slice(2, 4)
              if _consider_district
                _title_postfix += '-' + _n.native.data.fecid.slice(4, 6)
              _label.push('[' + _title_postfix + ']')

              _node_labels.push node: _n, label: _label.join(' ')

            else
              console.warn 'Missing FECID for Legislator node.', _n
              _node_labels.push node: _n, label: ''

          else if _n.native.data.contributor_type?

            # use the org name by default
            _node_labels.push node: _n, label: _n.native.data.name

          else
            console.error 'Unidentified object.', _n

        for _e in g.edges

          # for now, everything is a contribution
          _edge_labels.push edge: _e, label: 'contribution', source: _e.source, target: _e.target

        label_force = @['catnip']['graph']['label_force'] = @['d3'].layout.force()
                        .nodes(_node_labels)
                        .links(_edge_labels)
                        .gravity(0)
                        .linkDistance(0)
                        .linkStrength(8)
                        .charge(-100)
                        .size([w, h])

      ## 1) edge structure
      edge_wrap = @['catnip']['graph']['edge_wrap'] = svg.selectAll('.edge')
                     .data(g['edges'])
                     .enter()

      edge = @['catnip']['graph']['edge'] = edge_wrap.append('svg:svg')
                      .attr('id', (e) -> 'edge-' + e.edge.key)

      line = @['catnip']['graph']['line'] = edge.append('svg:line')
                 .attr('stroke', config['edge']['stroke'])
                 .attr('class', config['edge']['classes'])
                 .style('stroke-width', config['edge']['width'])

      ## 2) node structure
      node_wrap = @['catnip']['graph']['node_wrap'] = svg.selectAll('.node')
                     .data(g['nodes'])
                     .enter()

      container = @['catnip']['graph']['node_container'] = node_wrap.append('svg:svg')
                           .attr('id', (n) -> 'group-' + n['node']['key'])
                           .attr('width', config['sprite']['width'])
                           .attr('height', config['sprite']['height'])
                           .on('dblclick', @['catnip']['graph']['browse'])
                           .on('click', @['catnip']['graph']['detail'])
                           .call(force['drag'])

      node = @['catnip']['graph']['node'] = container.append('svg:g')
                      .attr('width', config['sprite']['width'])
                      .attr('height', config['sprite']['height'])

      shape = @['catnip']['graph']['circle'] = node.append('svg:circle')
                  .attr('r', config['node']['radius'])
                  .attr('cx', config['sprite']['width'] / 2)
                  .attr('cy', config['sprite']['height'] / 2)
                  .attr('class', config['node']['classes'])

      ## 2.1) image for legislators
      legislator_image = @['catnip']['graph']['legislator_image'] = node.append('svg:image')
                             .filter((n) -> n['native']['data']['govtrack_id']?)
                             .attr('width', config['sprite']['width'])
                             .attr('height', config['sprite']['height'])
                             .attr('clip-path', 'url(#node-circle-mask)')
                             .attr('xlink:href', (n) => @['catnip']['config']['assets']['prefix'] + 'warehouse/raw/govtrack/photos/' + n['native']['data']['govtrack_id'].toString() + '-' + '100px.' + config['sprite']['images']['format'])

      ## 3) label structure
      anchorLink = svg.selectAll('.ghost-edge.label').data(_edge_labels)
      anchorNode = svg.selectAll('.ghost-node.label').data(label_force.nodes()).enter()
                      .append('svg:g').attr('id', (d, i) -> 'anchor-' + d.node.node.key).attr('class', 'anchor-node')
                      .append('svg:circle').attr('r', 0).style('fill', '#FFF')
                      .append('svg:text').text((d, i) -> d.label or '')
                      .style('fill', '#555').style('font-family', 'Arial').style('font-size', 12)

      # attach resize handler
      window.onresize = _resize

      # line tick callback
      line_tick = (direction, point, edge_data, edge_i) =>
        if config['origin']['snap']
          if edge_data[direction]['index'] == graph.origin
            return config['origin']['position'][point]
        return edge_data[direction][point] + (config['node']['radius'] / 2)

      # node tick callback
      node_tick = (point, node_data, node_i) =>
        if config['origin']['snap']
          if node_i == graph.origin
            return config['origin']['position'][point] - (config['sprite']['width'] / 2)
        return node_data[point] - config['node']['radius']

      force.on 'tick', (f) =>

        center_x = config['width'] / 2
        center_y = config['height'] / 2

        if config['origin']['dynamic'] and config['origin']['snap']
          config['origin']['position'] =
            x: center_x + (config['sprite']['width'] / 2)
            y: center_y + (config['sprite']['height'] / 2)

        if config['labels']['enable']
          label_force.start()

        line
          .attr 'x1', (d, i) => line_tick('source', 'x', d, i)
          .attr 'y1', (d, i) => line_tick('source', 'y', d, i)
          .attr 'x2', (d, i) => line_tick('target', 'x', d, i)
          .attr 'y2', (d, i) => line_tick('target', 'y', d, i)

        container
            .attr 'x', (d, i) => node_tick('x', d, i)
            .attr 'y', (d, i) => node_tick('y', d, i)

      # label force

      # start yer engines! :)
      force.nodes(g['nodes']).links(g['edges']).start()
      label_force.start()

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
