
###

  file header yup

###


###
  catnip! :)
###
catnip = @['catnip'] =
  ui: {}
  el: {}
  data: {}
  graph: {}
  context: {}
  config:
    assets: {}
  state:
    pending: 1
  events:
    onload: []


###
  get
###
_get = @['_get'] = (d) ->
  if d and d.querySelector?
    return d
  if typeof d == 'string'
    if d[0] == '#'
      return document.getElementById d.replace('#','')
    else
      return document.querySelectorAll d
  console.log '_get was asked to retrieve:', d
  throw 'invalid _get string'


###
  show
###
show = @['show'] = @['catnip']['ui']['show'] = (d, hidden_only) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    if hidden_only
      element.classList.remove('hidden')
    else
      element.classList.remove('transparent')


###
  hide
###
hide = @['hide'] = @['catnip']['ui']['hide'] = (d) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    element.classList.add('transparent')


###
  toggle
###
toggle = @['toggle'] = @['catnip']['ui']['toggle'] = (d, klass) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    element.classList.toggle(klass || 'transparent')


###
  dye
###
dye = @['dye'] = @['catnip']['ui']['dye'] = (d, color) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    element.style.setProperty('background-color', color)


###
  busy
###
busy = @['busy'] = @['catnip']['busy'] = () =>
  _pending = @['catnip']['state']['pending']++
  if _pending == 0
    if @['spinner']
      show(@['spinner'])


###
  idle
###
idle = @['idle'] = @['catnip']['idle'] = () =>
  _pending = --@['catnip']['state']['pending']
  if _pending == 0
    if @['spinner']
      hide(@['spinner'])


###
  expand
###
expand = @['expand'] = @['catnip']['ui']['expand'] = (target) ->
  el = _get target
  if not el.length?
    el = [el]

  for element in el
    if element.classList.contains('open-small')
      element.setAttribute('class', 'open-expanded')
    else if element.classList.contains('open-expanded')
      element.setAttribute('class', 'open-fullscreen')
    else if element.classList.contains('collapsed')
      element.setAttribute('class', 'open-small')


###
  collapse
###
collapse = @['collapse'] = @['catnip']['ui']['collapse'] = (target) ->
  el = _get target
  if not el.length?
    el = [el]

  for element in el
    if element.classList.contains('open-expanded')
      element.setAttribute('class', 'open-small')
    else if element.classList.contains('open-fullscreen')
      element.setAttribute('class', 'open-expanded')


###
  close
###
close = @['close'] = @['catnip']['ui']['close'] = (target) ->
  el = _get target
  if not el.length?
    el = [el]

  for element in el
    element.setAttribute('class', 'collapsed transparent')


###
  spinner
###
spinner = @['spinner'] = @['catnip']['el']['spinner'] = _get '#appspinner'


###
  stage
###
stage = @['stage'] = @['catnip']['el']['stage'] = _get '#appstage'


###
  frame
###
frame = @['frame'] = @['catnip']['el']['frame'] = _get '#appframe'


###
  logon
###
_logon = @['catnip']['el']['logon'] = _get '#logon'


###
  asset prefix
###
asset_prefix = @['catnip']['config']['assets']['prefix'] = "//storage.googleapis.com/providence-clarity/"


###
  jQuery mount
###

if $?
  $.extend(catnip: @['catnip'])



###
  data
###
data = @['catnip']['data']['raw'] = {}


###
  index
###
index = @['catnip']['data']['index'] =
  adjacency: {}
  nodes_by_key: {}
  edges_by_key: {}
  natives_by_key: {}
  object_natives: {}


###
  graph
###
graph = @['catnip']['data']['graph'] =
  nodes: []
  edges: []
  natives: []


###
  receive: a function of untold value
###

# == data transform == #
receive = @['catnip']['data']['receive'] = (data) =>

  # parse data
  if typeof data == 'string'
    payload = @['catnip']['data']['payload'] = JSON.parse data
  else
    payload = @['catnip']['data']['payload'] = data

  ## == inflate data objects == ##

  ## 1) keys & objects
  for key, key_i in payload.data.keys
    @['catnip']['data']['raw'][key] = payload.data.objects[key_i] unless @['catnip']['data']['raw'][key]?

  ## 2) natives
  for _, native_suboffset in Array(payload.graph.natives)
    native_i = (payload.graph.edges + 1 + native_suboffset)

    if not index.natives_by_key[payload.data.keys[native_i]]?
      index.natives_by_key[payload.data.keys[native_i]] = (graph.natives.push
        key: payload.data.keys[native_i]
        data: data[payload.data.keys[native_i]]
      ) - 1

  ## == inflate graph structure == ##
  _key_iter = -1

  while _key_iter < payload.data.keys.length
    _key_iter++

    if _key_iter <= payload.graph.nodes

      ## 1) nodes
      if not @['catnip']['data']['index']['nodes_by_key'][payload['data']['keys'][_key_iter]]
        _i = index.nodes_by_key[payload.data.keys[_key_iter]] = (graph.nodes.push
          node:
            key: payload.data.keys[_key_iter]
            data: @['catnip']['data']['raw'][payload.data.keys[_key_iter]]
          native:
            key: payload.data.objects[_key_iter].native
            data: @['catnip']['data']['raw'][payload.data.objects[_key_iter].native]
        ) - 1
      else
        _i = index.nodes_by_key[payload.data.keys[_key_iter]]

    else if _key_iter <= payload.graph.edges

      ## 2) edges
      if not index.edges_by_key[payload.data.keys[_key_iter]]
        index.edges_by_key[payload.data.keys[_key_iter]] = []

      [source_k, targets...] = payload.data.objects[_key_iter].node

      for target_k in targets

        if @['catnip']['data']['index']['adjacency'][source_k] and @['catnip']['data']['index']['adjacency'][source_k][target_k]
          _i = @['catnip']['data']['index']['adjacency'][source_k][target_k]

        else
          _i = (graph.edges.push
            edge:
              key: payload.data.keys[_key_iter]
              data: data[payload.data.keys[_key_iter]]
            native: data[payload.data.objects[_key_iter].native]
            source:
              index: index.nodes_by_key[source_k]
              object: graph.nodes[index.nodes_by_key[source_k]]
            target:
              index: index.nodes_by_key[target_k]
              object: graph.nodes[index.nodes_by_key[target_k]]
          ) - 1

          index.edges_by_key[payload.data.keys[_key_iter]].push _i

          if not @['catnip']['data']['index']['adjacency'][source_k]?
            @['catnip']['data']['index']['adjacency'][source_k] = {}
          @['catnip']['data']['index']['adjacency'][source_k][target_k] = _i
  return setTimeout (-> @['catnip']['graph']['draw'](graph)), 0



###

  context

###

# == session / user context == #
load_context = @['catnip']['context']['load'] = (event, data) =>

  _show_queue = []
  _mapper_queue = []

  context = @['catnip']['context']['data'] = data || JSON.parse(document.getElementById('js-context').textContent)
  console.log "Loading context...", context

  # process services
  if @['catnip']['context']['data']['services']
    console.log "Loading services...", context['services']
    apptools['rpc']['service']['factory'](context['services'])

  # process pagedata
  if @['catnip']['context']['data']['pagedata']
    pagedata = @['pagedata'] = JSON.parse(document.getElementById('js-data').textContent)
    console.log "Detected stapled pagedata...", pagedata

    @['catnip']['data']['receive'](pagedata)

  # process session
  if @['catnip']['context']['data']['session']
    if @['catnip']['context']['data']['session']['established']
      @['catnip']['session'] = @['catnip']['context']['data']['session']['payload']
      console.log "Loading existing session...", @['catnip']['session']

    else
      @['catnip']['session'] = {}

      console.log "Establishing fresh session...", @['catnip']['session']
      _show_queue.push @['catnip']['el']['logon']

  # prepare map for UI queue
  _map = @['_get']('#map')
  if _map
    _catnip = @['_get']('#catnip')
    _show_queue.push _map
    _mapper_queue.push _catnip

  _show_queue.push @['_get']('#appfooter')

  # set up UI show callback
  _ui_reveal = () =>

    console.log 'Flushing UI reveal queue...', _show_queue
    for element_set in _show_queue
      @['catnip']['ui']['show'](element_set)

  # set up mapper show callback
  _mapper_reveal = () =>

    console.log 'Flusing mapper reveal queue...', _mapper_queue
    for element_set in _mapper_queue
      @['catnip']['ui']['show'](element_set)

    @['catnip']['idle']()

  setTimeout(_ui_reveal, 800)
  setTimeout(_mapper_reveal, 500)
  return @['catnip']['context']

@['catnip']['events']['onload'].push load_context


###

  storage

###


###

  history

###


###

  receive: a function of untold value

###

_onload = @['onload'] = (event) ->

  for callback in @['catnip']['events']['onload']
    callback(event)
