class Move

	constructor: (@container) ->

		# Create the
		@move = document.createElement "div"

		# Set style
		@move.style.cssText = "position:absolute;box-sizing:border-box;top:0;left:0;right:0;height:30px;border-bottom:1px solid #bbb;cursor:move;"

		# Add a close button
		@container.appendChild @move

		@move.addEventListener "mousedown", @mousedown


	mousedown: (e) =>

		@pos = x:e.clientX, y:e.clientY

		document.addEventListener "mousemove", @movement
		document.addEventListener "mouseup", @mouseup


	mouseup: =>

		document.removeEventListener "mouseup", @mouseup
		document.removeEventListener "mousemove", @movement


	movement: (e) =>

		console.log "x", x = e.clientX-@pos.x
		console.log "y", y = e.clientY-@pos.y

		@container.style.transform = "translate(#{x}px,#{y}px)"



module.exports = Move
