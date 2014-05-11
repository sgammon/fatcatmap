
###

  file header yup

###


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
  catnip! :)
###
catnip = @['catnip'] =
  ui: {}
  data: {}
  graph: {}
  context: {}
  config:
    assets:
      prefix: "//storage.googleapis.com/providence-clarity/"
  state:
    pending: 1
  events:
    onload: []
  el:
    map: _get '#appstage'
    stage: _get '#appstage'
    frame: _get '#appframe'
    logon: _get '#logon'
    mapper: _get '#mapper'
    spinner: _get '#appspinner'
    leftbar: _get '#leftbar'
    rightbar: _get '#rightbar'


###
  show
###
show = @['show'] = @['catnip']['ui']['show'] = (d, hidden_only) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    element.classList.remove('hidden')
    if not hidden_only
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
    if @['catnip']['el']['spinner']
      $.catnip.ui.show(@['catnip']['el']['spinner'])


###
  idle
###
idle = @['idle'] = @['catnip']['idle'] = () =>
  _pending = --@['catnip']['state']['pending']
  if _pending == 0
    if @['catnip']['el']['spinner']
      $.catnip.ui.hide(@['catnip']['el']['spinner'])


###
  expand
###
expand = @['expand'] = @['catnip']['ui']['expand'] = (target, state=false) ->
  el = _get target
  if not el.length?
    el = [el]

  for element in el
    if element.classList.contains('open-small')
      remove = 'open-small'
      if not state
        add = 'open-expanded'
    else if element.classList.contains('open-expanded')
      remove = 'open-expanded'
      if not state
        add = 'open-fullscreen'
    else if element.classList.contains('collapsed')
      remove = 'collapsed'
      if not state
        add = 'open-small'
    add = add || state
    if remove
      element.classList.remove(remove)
      element.classList.remove('transparent')
    element.classList.add(add)


###
  collapse
###
collapse = @['collapse'] = @['catnip']['ui']['collapse'] = (target, state=false) ->
  el = _get target
  if not el.length?
    el = [el]

  for element in el
    if element.classList.contains('open-small')
      remove = 'open-small'
      if not state
        add = 'collapsed'
    else if element.classList.contains('open-expanded')
      remove = 'open-expanded'
      if not state
        add = 'open-small'
    else if element.classList.contains('open-fullscreen')
      remove = 'open-fullscreen'
      if not state
        add = 'open-expanded'
    add = add or state
    if remove
      element.classList.remove(remove)
    element.classList.add(add)


###
  close
###
close = @['close'] = @['catnip']['ui']['close'] = (target) ->
  el = _get target
  if not el.length?
    el = [el]

  for element in el
    element.classList.remove('open-small')
    element.classList.remove('open-expanded')
    element.classList.remove('open-fullscreen')
    element.classList.add('collapsed')
    element.classList.add('transparent')


###
  jQuery mount
###

if $?
  $.extend(catnip: @['catnip'])



###
  data
###
@['catnip']['data']['raw'] = {}


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
  origin: null
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

  # copy origin reference
  graph.origin = payload.graph.origin

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
        data: payload.data.objects[native_i]
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
              data: payload.data.objects[_key_iter]
            native: @['catnip']['data']['raw'][payload.data.objects[_key_iter].native]
            source: index.nodes_by_key[source_k]
            target: index.nodes_by_key[target_k]
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

  context = @['catnip']['context'] = data || JSON.parse(document.getElementById('js-context').textContent)
  @['catnip']['context']['load'] = load_context
  console.log "Loading context...", context

  # add context elements from JS

  # - general
  @['catnip']['context']['agent']['capabilities']['cookies'] = navigator.cookieEnabled

  # - retina
  @['catnip']['context']['agent']['capabilities']['retina'] = window.devicePixelRatio == 2

  # - worker-related
  @['catnip']['context']['agent']['capabilities']['worker'] = window.Worker and true or false
  @['catnip']['context']['agent']['capabilities']['shared_worker'] = window.SharedWorker and true or false
  @['catnip']['context']['agent']['capabilities']['service_worker'] = navigator.serviceWorker and true or false

  # - transport-related
  @['catnip']['context']['agent']['capabilities']['websocket'] = window.WebSocket and true or false

  # - sensor-related
  @['catnip']['context']['agent']['capabilities']['geo'] = navigator.geolocation and true or false
  @['catnip']['context']['agent']['capabilities']['touch'] = navigator.maxTouchPoints > 0
  @['catnip']['context']['agent']['capabilities']['history'] = window.history.pushState and true or false
  @['catnip']['context']['agent']['capabilities']['storage'] =
    local: window.localStorage?
    session: window.sessionStorage?
    indexed: window.IDBFactory?

  # process services
  if @['catnip']['context']['services']
    console.log "Loading services...", context['services']
    apptools['rpc']['service']['factory'](context['services'])

  # process pagedata
  if @['catnip']['context']['pagedata']
    pagedata = @['pagedata'] = JSON.parse(document.getElementById('js-data').textContent)
    console.log "Detected stapled pagedata...", pagedata

    @['catnip']['data']['receive'](pagedata)

  # process session
  if @['catnip']['context']['session']
    if @['catnip']['context']['session']['established']
      @['catnip']['session'] = @['catnip']['context']['session']['payload']
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
