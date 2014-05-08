
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
