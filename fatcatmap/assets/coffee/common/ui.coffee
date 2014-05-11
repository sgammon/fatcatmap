
###

  ui

###


###
  logon
###
$.catnip.el.logon?.addEventListener 'click', (event) ->

  # show/hide signon options and button highlight
  $.catnip.ui.toggle($.catnip.el.logon, 'active')
  $.catnip.ui.toggle($.catnip.el.signon_providers)


###
  sidebars
###

# close button
$('.size-close').on 'click', (event) ->
  sidebar = event.target.parentElement.parentElement
  console.log 'Closing sidebar...', sidebar
  $.catnip.ui.close(sidebar)

# expand button
$('.size-expand').on 'click', (event) ->
  sidebar = event.target.parentElement.parentElement
  console.log 'Expanding sidebar...', sidebar
  $.catnip.ui.expand(sidebar)

# collapse button
$('.size-minimize').on 'click', (event) ->
  sidebar = event.target.parentElement.parentElement
  console.log 'Collapsing sidebar...', sidebar
  $.catnip.ui.collapse(sidebar)
