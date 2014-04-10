
image_prefix = "//storage.googleapis.com/providence-clarity/warehouse/raw/govtrack/photos/"

demo_data = @demo_data = {"nodes":[{"id":"400001","name":"Rep. Neil Abercrombie (D, HI-1)","type":"rep","district":1,"state":"HI","party":"Democrat"},{"id":"400003","name":"Rep. Gary Ackerman (D, NY-5)","type":"rep","district":5,"state":"NY","party":"Democrat"},{"id":"400004","name":"Rep. Robert Aderholt (R, AL-4)","type":"rep","district":4,"state":"AL","party":"Republican"},{"id":"400006","name":"Rep. Rodney Alexander (R, LA-5)","type":"rep","district":5,"state":"LA","party":"Republican"},{"id":"400013","name":"Sen. Tammy Baldwin (D, WI)","type":"sen","class":0,"state":"WI","party":"Democrat"},{"id":"400019","name":"Rep. Charles Bass (R, NH-2)","type":"rep","district":2,"state":"NH","party":"Republican"},{"id":"400027","name":"Rep. Judy Biggert (R, IL-13)","type":"rep","district":13,"state":"IL","party":"Republican"},{"id":"400028","name":"Rep. Michael Bilirakis (R, FL-9)","type":"rep","district":9,"state":"FL","party":"Republican"},{"id":"400183","name":"Rep. Tim Holden (D, PA-17)","type":"rep","district":17,"state":"PA","party":"Democrat"},{"id":"400187","name":"Rep. John Hostlettler (R, IN-8)","type":"rep","district":8,"state":"IN","party":"Republican"},{"id":"400196","name":"Rep. Darrell Issa (R, CA-49)","type":"rep","district":49,"state":"CA","party":"Republican"},{"id":"400157","name":"Rep. Kay Granger (R, TX-12)","type":"rep","district":12,"state":"TX","party":"Republican"},{"id":"400120","name":"Rep. Rahm Emanuel (D, IL-5)","type":"rep","district":5,"state":"IL","party":"Democrat"},{"id":"400125","name":"Rep. Bob Etheridge (D, NC-2)","type":"rep","district":2,"state":"NC","party":"Democrat"},{"id":"400117","name":"Rep. Jennifer Dunn (R, WA-8)","type":"rep","district":8,"state":"WA","party":"Republican"}],"edges":[{"id":0,"source":0,"target":1,"value":25},{"id":1,"source":0,"target":5,"value":37},{"id":2,"source":1,"target":12,"value":114},{"id":3,"source":1,"target":4,"value":28},{"id":4,"source":1,"target":7,"value":19},{"id":5,"source":2,"target":14,"value":17},{"id":6,"source":3,"target":14,"value":32},{"id":7,"source":4,"target":2,"value":37},{"id":8,"source":5,"target":11,"value":46},{"id":9,"source":5,"target":13,"value":47},{"id":10,"source":5,"target":7,"value":61},{"id":11,"source":6,"target":0,"value":132},{"id":12,"source":6,"target":1,"value":177},{"id":13,"source":7,"target":14,"value":41},{"id":14,"source":7,"target":3,"value":98},{"id":15,"source":8,"target":12,"value":14},{"id":16,"source":9,"target":2,"value":43},{"id":17,"source":9,"target":8,"value":31},{"id":18,"source":9,"target":11,"value":85},{"id":19,"source":10,"target":3,"value":23},{"id":20,"source":10,"target":12,"value":41}]}

_d = true
_fd_tm = 1500
_fd_id = 'appspinner'
_st_id = 'appstage'
_vz_id = 'visualizer'
_ga_id = 'UA-25133943-10'
_fcm_name = 'fatcatmap: staging'
_mp_id = 'map'
_fcm_v = 'v0.0.1-alpha'
_ga_gd = 'fatcatmap.apps.momentum.io'
_ga_dm = '//deliver.fatcatmap.org/' + (_d == true ? 'analytics_debug.js' : 'analytics.js')
_df_id = 'js-deferred'
_cf_id = 'js-config'
_pd_id = 'pagedata'

_get = (d) -> document.getElementById d
_fd = -> spinner.classList.add('transparent')
ga_debug = _d
spinner = _get _fd_id
stage = _get _st_id
deferred = _get _df_id
_js_config = _get _cf_id
data = _get _pd_id
footer = _get 'appfooter'
header = _get 'appheader'
mapper = _get _vz_id
map = _get _mp_id
frame = _get 'appframe'

_gr_c =
  width: frame.offsetWidth
  height: frame.offsetHeight
  force:
    strength: 0.8
    friction: 0.7
    theta: 0.6
    gravity: 0.075
    charge: -80
    distance: (e) -> e.value + 125
  node:
    radius: 20
  sprite:
    width: 60
    height: 60

_ga_cfg =
  domain: _ga_gd
  siteSpeedSampleRate: 100
  cookieDomain: 'none'
  forceSSL: true
  anonymizeIp: true

draw = @draw = (graph) ->
  width = stage.offsetWidth
  height = stage.offsetHeight
  color = @d3.scale.category20()

  force = @d3.layout.force()
    .linkDistance(_gr_c.force.distance)
    .linkStrength(_gr_c.force.strength)
    .friction(_gr_c.force.friction)
    .charge(_gr_c.force.charge)
    .theta(_gr_c.force.theta)
    .gravity(_gr_c.force.gravity)
    .size([_gr_c.width, _gr_c.height])

  _load = (g) ->

    svg = d3.select(map)

    edge_group = svg.selectAll('.link').data(g.edges)
      .enter().append('svg')
        .attr('id', (d) -> 'edge-' + d.id.toString())
        .attr('data-id', (d) -> d.id.toString())
        .attr('data-type', 'edge')
        .attr('data-kind', 'comembership')

    link = edge_group.append('line')
      .attr('stroke', '#999')
      .attr('class', 'link')
      .style('stroke-width', (d) -> Math.sqrt(d.value) > 5 ? 1 : 2)

    sprite = svg.selectAll('.node').data(g.nodes)
      .enter().append('svg')
        .attr('id', (d) -> 'group-' + d.id)
        .attr('width', _gr_c.sprite.width)
        .attr('height', _gr_c.sprite.height)
        .attr('data-id', (d) -> d.id.toString())
        .attr('data-type', 'node')
        .attr('data-kind', 'legislator')
        .call(force.drag)

    group = sprite.append('g')
      .attr('width', _gr_c.sprite.width)
      .attr('height', _gr_c.sprite.height)

    node = group.append('circle')
      .attr('r', _gr_c.node.radius)
      .attr('cx', _gr_c.sprite.width / 2)
      .attr('cy', _gr_c.sprite.height / 2)
      .attr('class', (d) -> [
        if d.party == 'Republican' then 'republican' else 'democrat',
        if d.type == 'sen' then 'senate' else 'congress',
        'node'
      ].join(' '))

    image = group.append('image')
      .attr('width', _gr_c.sprite.width)
      .attr('height', _gr_c.sprite.height)
      .attr('clip-path', 'url(#node-circle-mask)')
      .attr('xlink:href', (d) -> image_prefix + d.id.toString() + '-' + '100px.jpeg')

    @d3.select('#appstage').on('click', (d) -> force.alpha(.4))

    force.on 'tick', (d) ->

      link.attr('x1', (d) -> d.source.x + (_gr_c.node.radius / 2))
          .attr('y1', (d) -> d.source.y + (_gr_c.node.radius / 2))
          .attr('x2', (d) -> d.target.x + (_gr_c.node.radius / 2))
          .attr('y2', (d) -> d.target.y + (_gr_c.node.radius / 2))

      sprite.attr('x', (d) -> d.x - _gr_c.node.radius)
            .attr('y', (d) -> d.y - _gr_c.node.radius)

    force.nodes(g.nodes).links(g.edges).start()

  return _load(graph)

draw(demo_data)
