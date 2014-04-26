
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
