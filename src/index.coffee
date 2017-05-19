Handler = require "./handler"



class MiniEventEmitter

	constructor: (obj) ->

		# Create a handler so not all methodes will be exposed
		handler = new Handler this, obj

		# --------------------------------------------------
		# Public exposure
		# --------------------------------------------------
		@on      = handler.on
		@off     = handler.off
		@emit    = handler.emit
		@trigger = handler.emit



# --------------------------------------------------
# Expose
# --------------------------------------------------

# Require | Browserify, Node
module.exports = MiniEventEmitter

# Distribution | Browser
# window.MiniEventEmitter = MiniEventEmitter
