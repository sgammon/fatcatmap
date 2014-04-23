
###

  file header yup

###


###
  get
###
_get = (d) -> document.getElementById d


###
  stage
###
stage = @['stage'] = _get 'appstage'


###
  map
###
map = @['map'] = _get 'map'


###
  mapper
###
mapper = @['mapper'] = _get 'mapper'


###
  frame
###
frame = @['frame'] = _get 'appframe'


###
  image prefix
###
image_prefix = @['image_prefix'] = "//deliver.fcm-static.org/image-proxy/providence-clarity/warehouse/raw/govtrack/photos/"


###
  onload callbacks
###
onloads = @['__onload_callbacks'] = []



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

  data = @['data'] = {}

  index = @['index'] =
    nodes_by_key: {}
    edges_by_key: {}
    natives_by_key: {}
    object_natives: {}

  graph = @['graph'] =
    nodes: []
    edges: []
    natives: []

  ## == inflate data objects == ##

  ## 1) keys & objects
  for key, key_i in payload.data.keys
    data[key] = payload.data.objects[key_i]

  ## 2) natives
  for _, native_suboffset in Array(payload.graph.natives)
    native_i = (payload.graph.edges + 1 + native_suboffset)
    _i = index.natives_by_key[payload.data.keys[native_i]] = (graph.natives.push
      key: payload.data.keys[native_i]
      data: data[payload.data.keys[native_i]]
    ) - 1

  ## == inflate graph structure == ##
  _key_iter = -1

  while _key_iter < payload.data.keys.length
    _key_iter++

    if _key_iter <= payload.graph.nodes

      ## 1) nodes
      _i = index.nodes_by_key[payload.data.keys[_key_iter]] = (graph.nodes.push
        node:
          key: payload.data.keys[_key_iter]
          data: data[payload.data.keys[_key_iter]]
        native: graph.natives[index.natives_by_key[data[payload.data.keys[_key_iter]].native]]
      ) - 1

    else if _key_iter <= payload.graph.edges

      ## 2) edges
      [source_k, targets...] = payload.data.objects[_key_iter].node

      for target_k in targets
        if not index.edges_by_key[payload.data.keys[_key_iter]]?
          index.edges_by_key[payload.data.keys[_key_iter]] = []

        _i = (graph.edges.push
          edge:
            key: payload.data.keys[_key_iter]
            data: data[payload.data.keys[_key_iter]]
          native: graph.natives[index.natives_by_key[data[payload.data.keys[_key_iter]].native]]
          source:
            index: index.nodes_by_key[source_k]
            object: graph.nodes[index.nodes_by_key[source_k]]
          target:
            index: index.nodes_by_key[target_k]
            object: graph.nodes[index.nodes_by_key[target_k]]
        ) - 1

      index.edges_by_key[payload.data.keys[_key_iter]].push _i

  return setTimeout (-> @['draw'](graph)), 0


###

  context

###

# == session / user context == #
load_context = @['load_context'] = (event, data) ->

  context = @['context'] = data || JSON.parse(document.getElementById('js-context').textContent)
  console.log "Loading context...", context

  if @['context']['services']
    console.log "Loading services...", context['services']
    apptools['rpc']['service']['factory'](context['services'])

  if @['context']['pagedata']
    pagedata = @['pagedata'] = JSON.parse(document.getElementById('js-data').textContent)
    console.log "Detected stapled pagedata...", pagedata

    @['receive'](pagedata)

  return @['context']

onloads.push load_context


###

  receive: a function of untold value

###

_onload = @['onload'] = (event) ->

  for callback in @['__onload_callbacks']
    callback(event)
