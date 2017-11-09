class Close

	constructor: (@panel, @container) ->

		# Create the
		@close = document.createElement "div"

		# Set style
		@close.style.cssText = "position:absolute;box-sizing:border-box;top:5px;right:5px;width:20px;height:20px;border:1px solid #bbb;border-radius:3px;text-align:center;font-size:14px;line-height:20px;cursor:pointer;font-weight:bold;"

		# Set text content
		@close.innerHTML = "&#10060;"

		# Add a close button
		@container.appendChild @close


		@close.addEventListener "click", @exit
		@close.addEventListener "mouseenter", @enter
		@close.addEventListener "mouseleave", @leave


	exit: =>

		# Toggle the pannel to close
		@panel.panel()


	enter: =>

		@close.style.border = "1px solid #1C86EE"


	leave: =>

		@close.style.border = "1px solid #bbb"




module.exports = Close
