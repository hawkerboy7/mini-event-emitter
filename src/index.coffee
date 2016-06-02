class EventEmitter

	# Short cut
	isString = (event) -> typeof event is 'string' or event instanceof String

	# Handling all error's
	error = (log, id, event) ->

		# Only log the message if they are required
		return if not log

		# Prefix all error messages with the EventEmitter text
		msg = 'EventEmitter ~ '

		if id is 1 then msg += "Event name should be a string"
		if id is 2 then msg += "Provided function to remove is not found"
		if id is 3 then msg += "Event was not provided"
		if id is 4 then msg += "Emit name \"#{event}\" doesn't exist"

		# Log the message to the console
		console.log msg


	constructor: (@log) ->

		# Store all events
		@events = {}


	on: (event, fn) ->

		# Event name should be a string
		return error @log, 1 if not isString event

		# Either add a new event or push it to a list with others
		if @events[event] then @events[event].push fn else @events[event] = [fn]


	off: (event, fn) ->

		# Event name should be a string
		return error @log, 1 if not isString event

		if not event

			# Reset events
			@events = {}

		else if not fn

			# Remove all function listeners by eventname
			delete @events[event]

		else

			# Function to remove does not exist
			return error @log, 2 if -1 is index = @events[event].indexOf fn

			# Remove function from events list
			@events[event].splice index, 1

			# If no functions are left also remove the attribute in functions
			delete @events[event] if @events[event].length is 0


	emit: ->

		# Turn arguments into an array
		args = Array.from arguments

		# Retrieve event name from the provided arguments
		event = args.shift()

		# Event was not provided
		return error @log, 3 if not event

		# Event name should be a string
		return error @log, 1 if not isString event

		# Emit name doesn't exist
		return error @log, 4, event if not list = @events[event]

		# Run function with all arguments except for the eventName
		action.apply action, args for action in list



module.exports = EventEmitter