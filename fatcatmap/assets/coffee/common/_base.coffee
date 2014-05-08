
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
