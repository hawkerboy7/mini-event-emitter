Handler = require "./handler"


class MiniEventEmitter

	# --------------------------------------------------
	# Public functionality
	# --------------------------------------------------
	constructor: (obj) ->

		# Create a handler so methodes will not be exposed
		handler = new Handler this, obj

		# Exposures
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
