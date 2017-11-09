Move  = require "./move"
Close = require "./close"



class Panel

	constructor: (@mini) ->

		# Only run in a browser
		return if not document?

		@setup()
		@render()


	# --------------------------------------------------
	# Public available
	# --------------------------------------------------
	panel: (arg) =>

		# Only run in a browser
		return if not document?

		# Toggle the state of the debug panel unless a state is provided
		@toggle = if not arg? then !@toggle else !!arg

		if @toggle
			document.body.appendChild @container
		else
			@container.remove()


	# --------------------------------------------------
	# Private
	# --------------------------------------------------
	setup: ->

		@toggle = false

		@width = @mini.settings.panel.width
		@height = @mini.settings.panel.height


	render: ->

		@container = document.createElement "div"

		@container.style.cssText = "position:fixed;box-sizing:border-box;top:50%;left:50%;width:#{@width}px;height:#{@height}px;margin-top:-#{@height/2}px;margin-left:-#{@width/2}px;background-color:rgba(255,255,255,0.7);z-index:9999;border:1px solid #bbb;border-radius:3px;will-change:transform;"

		# Add a bar which allows the panel to be moved
		new Move @container
		new Close this, @container





module.exports = Panel
