
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
