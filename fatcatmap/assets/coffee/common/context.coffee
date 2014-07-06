
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
