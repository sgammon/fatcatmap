
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
