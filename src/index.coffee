Panel   = require "./panel"
Handler = require "./handler"



class MiniEventEmitter

	constructor: (obj) ->

		# Create a handler so not all methodes will be exposed
		handler = new Handler this, obj

		# Instanciate the panel after the handler so all settings are known
		panel = new Panel this


		# --------------------------------------------------
		# Public exposure
		# --------------------------------------------------

		# Default emitter
		@on        = handler.on
		@off       = handler.off
		@emit      = handler.emit
		@emitIf    = handler.emitIf
		@trigger   = handler.emit
		@triggerIf = handler.emitIf

		# Debug panel
		@panel = panel.panel


# --------------------------------------------------
# Expose
# --------------------------------------------------

# Require | Browserify, Node
module.exports = MiniEventEmitter

# Distribution | Browser
# window.MiniEventEmitter = MiniEventEmitter
