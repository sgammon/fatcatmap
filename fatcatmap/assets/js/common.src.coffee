
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
  show
###
show = @['show'] = (d, hidden_only) ->
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
hide = @['hide'] = (d) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    element.classList.add('transparent')


###
  toggle
###
toggle = @['toggle'] = (d, klass) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    element.classList.toggle(klass || 'transparent')


###
  dye
###
dye = @['dye'] = (d, color) ->
  el = _get(d)
  if not el.length?
    el = [el]
  for element in el
    element.style.setProperty('background-color', color)


###
  busy
###
busy = @['busy'] = () ->
  _pending = @['pending_tasks']++
  if _pending == 0
    show(@['spinner'])


###
  finish
###
finish = @['finish'] = () ->
  _pending = --@['pending_tasks']
  if _pending == 0
    hide(@['spinner'])


###
  pending_tasks
###
pending_tasks = @['pending_tasks'] = 1


###
  spinner
###
spinner = @['spinner'] = _get '#appspinner'


###
  stage
###
stage = @['stage'] = _get '#appstage'


###
  map
###
map = @['map'] = _get '#map'


###
  mapper
###
mapper = @['mapper'] = _get '#mapper'


###
  frame
###
frame = @['frame'] = _get '#appframe'


###
  image prefix
###
image_prefix = @['image_prefix'] = "//deliver.fcm-static.org/image-proxy/providence-clarity/warehouse/raw/govtrack/photos/"


###
  onload callbacks
###
onloads = @['__onload_callbacks'] = []



###
  data
###
data = @['data'] = {}


###
  index
###
index = @['index'] =
  adjacency: {}
  nodes_by_key: {}
  edges_by_key: {}
  natives_by_key: {}
  object_natives: {}


###
  graph
###
graph = @['graph'] =
  nodes: []
  edges: []
  natives: []


###
  receive: a function of untold value
###

# == data transform == #
receive = @['receive'] = (data) ->

  # parse data
  if typeof data == 'string'
    payload = @['payload'] = JSON.parse data
  else
    payload = @['payload'] = data

  ## == inflate data objects == ##

  ## 1) keys & objects
  for key, key_i in payload.data.keys
    @['data'][key] = payload.data.objects[key_i] unless @['data'][key]?

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
      if not @['index']['nodes_by_key'][payload['data']['keys'][_key_iter]]
        _i = index.nodes_by_key[payload.data.keys[_key_iter]] = (graph.nodes.push
          node:
            key: payload.data.keys[_key_iter]
            data: @['data'][payload.data.keys[_key_iter]]
          native:
            key: payload.data.objects[_key_iter].native
            data: @['data'][payload.data.objects[_key_iter].native]
        ) - 1
      else:
        _i = index.nodes_by_key[payload.data.keys[_key_iter]]

    else if _key_iter <= payload.graph.edges

      ## 2) edges
      if not index.edges_by_key[payload.data.keys[_key_iter]]
        index.edges_by_key[payload.data.keys[_key_iter]] = []

      [source_k, targets...] = payload.data.objects[_key_iter].node

      for target_k in targets

        if @['index']['adjacency'][source_k] and @['index']['adjacency'][source_k][target_k]
          _i = @['index']['adjacency'][source_k][target_k]

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

          if not @['index']['adjacency'][source_k]?
            @['index']['adjacency'][source_k] = {}
          @['index']['adjacency'][source_k][target_k] = _i

  return setTimeout (-> @['draw'](graph)), 0


###

  context

###

# == session / user context == #
load_context = @['load_context'] = (event, data) ->

  _show_queue = []
  _mapper_queue = []

  context = @['context'] = data || JSON.parse(document.getElementById('js-context').textContent)
  console.log "Loading context...", context

  # process services
  if @['context']['services']
    console.log "Loading services...", context['services']
    apptools['rpc']['service']['factory'](context['services'])

  # process pagedata
  if @['context']['pagedata']
    pagedata = @['pagedata'] = JSON.parse(document.getElementById('js-data').textContent)
    console.log "Detected stapled pagedata...", pagedata

    @['receive'](pagedata)

  # process session
  if @['context']['session']
    if @['context']['session']['established']
      @['session'] = @['context']['session']['payload']
      console.log "Loading existing session...", @['session']

    else
      @['session'] =
        authenticated: false

      console.log "Establishing fresh session...", @['session']
      _show_queue.push @['_get']('#logon')

  _show_queue.push @['_get']('#appfooter')
  _show_queue.push @['_get']('#map')
  _mapper_queue.push @['_get']('#catnip')

  # set up UI show callback
  _ui_reveal = () =>

    console.log 'Flushing UI reveal queue...', _show_queue
    for element_set in _show_queue
      @['show'](element_set)

  # set up mapper show callback
  _mapper_reveal = () =>

    console.log 'Flusing mapper reveal queue...', _mapper_queue
    for element_set in _mapper_queue
      @['show'](element_set)

    @['finish']()

  setTimeout(_ui_reveal, 800)
  setTimeout(_mapper_reveal, 500)
  return @['context']

onloads.push load_context


###

  receive: a function of untold value

###

_onload = @['onload'] = (event) ->

  for callback in @['__onload_callbacks']
    callback(event)
