
@onload = (event) ->

  for callback in @__onload_callbacks
    callback(event)
