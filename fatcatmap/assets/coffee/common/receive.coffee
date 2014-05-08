
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
