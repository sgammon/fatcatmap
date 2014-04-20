
###

  receive: a function of untold value

###

_onload = @['onload'] = (event) ->

  for callback in @['__onload_callbacks']
    callback(event)
