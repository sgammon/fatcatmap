
# == session / user context == #
load_context = @load_context = (event, data) ->

  @context = data || JSON.parse(document.getElementById('js-context').textContent)
  console.log "Loading context...", @context

  if @context.services
    console.log "Loading services...", @context.services
    apptools.rpc.service.factory(@context.services)

  if @context.pagedata
    @pagedata = JSON.parse(document.getElementById('js-data').textContent)
    console.log "Detected stapled pagedata...", @pagedata

    @receive(@pagedata)

  return @context

@__onload_callbacks.push load_context
