
# == utils == #
_get = (d) -> document.getElementById d

# == vars == #
@stage = _get 'appstage'
@map = _get 'map'
@frame = _get 'appframe'
@image_prefix = "//fatcatmap.org/image-proxy/providence-clarity/warehouse/raw/govtrack/photos/"

@__onload_callbacks = []
