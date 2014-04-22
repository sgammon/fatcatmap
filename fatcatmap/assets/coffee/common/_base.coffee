
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
