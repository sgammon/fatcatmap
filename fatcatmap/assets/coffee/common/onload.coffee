
###

  receive: a function of untold value

###

_onload = @['onload'] = (event) ->

  for callback in @['catnip']['events']['onload']
    callback(event)
