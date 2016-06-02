class EventEmitter

	# Short cut
	isString = (event) -> typeof event is 'string' or event instanceof String
	isFunction = (fn) -> typeof fn is 'function'

	# Handling all error's
	error = (self, name, id, event) ->

		# Only log the message if they are required
		return self if not self.log

		# Prefix all error messages with the EventEmitter text
		msg = "MiniEventEmitter ~ #{name} ~ "

		if id is 1 then msg += "Event name should be a string"
		if id is 2 then msg += "Provided function to remove with event \"#{event}\" is not found"
		if id is 3 then msg += "Event was not provided"
		if id is 4 then msg += "Event \"#{event}\" does not exist"
		if id is 5 then msg += "Second param provided with event \"#{event}\" is not a function"

		# Log the message to the console
		console.log msg

		# Return this/self to allow chaining
		self


	constructor: (@log = false) ->

		# Store all events
		@events = {}


	on: (event, fn) ->

		# Event name should be a string
		return error this, 'on', 1 if not isString event
		return error this, 'on', 5, event if not isFunction fn

		# Either add a new event or push it to a list with others
		if @events[event] then @events[event].push fn else @events[event] = [fn]

		# Return this to allow chaining
		this


	off: (event, fn) ->

		# Event name should be a string
		return error this, 'off', 1 if event and not isString event
		return error this, 'off', 5, event if fn and not isFunction fn

		if not event

			# Reset events
			@events = {}

		else if not fn

			# Event name doesn't exist
			return error this, 'off', 4, event if not @events[event]

			# Remove all function listeners by eventname
			delete @events[event]

		else

			# Function to remove does not exist
			return error this, 'off', 2, event if -1 is index = @events[event].indexOf fn

			# Remove function from events list
			@events[event].splice index, 1

			# If no functions are left also remove the attribute in functions
			delete @events[event] if @events[event].length is 0

		# Return this to allow chaining
		this


	emit: ->

		# Turn arguments into an array
		args = Array.from arguments

		# Retrieve event name from the provided arguments
		event = args.shift()

		# Event was not provided
		return error this, 'emit', 3 if not event

		# Event name should be a string
		return error this, 'emit', 1 if not isString event

		# Event name doesn't exist
		return error this, 'emit', 4, event if not list = @events[event]

		# Run function with all arguments except for the eventName
		action.apply action, args for action in list

		# Return this to allow chaining
		this


module.exports = EventEmitter