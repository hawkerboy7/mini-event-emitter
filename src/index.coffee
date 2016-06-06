class EventEmitter

	# --------------------------------------------------
	# Private functionality
	# --------------------------------------------------

	# Shortcuts
	isString = (event) -> typeof event is 'string' or event instanceof String
	objLength = (obj) -> Object.keys(obj).length
	isFunction = (fn) -> typeof fn is 'function'

	# Handling all error's
	error = (self, name, id, event, group) ->

		# Only log the message if they are required
		return self if not self.settings.error

		# Prefix all error messages with the EventEmitter text
		msg = "MiniEventEmitter ~ #{name} ~ "

		if id is 1 then msg += "Event name must be a string"
		if id is 2 then msg += "Provided function to remove with event \"#{event}\" in group \"#{group}\" is not found"
		if id is 3 then msg += "Event was not provided"
		if id is 4 then msg += "Event \"#{event}\" does not exist"
		if id is 5 then msg += "Second param provided with event \"#{event}\" is not a function"
		if id is 6 then msg += "Group must be a string"
		if id is 7 then msg += "Group \"#{group}\" doesn't exist for the event \"#{event}\""

		# Log the message to the console
		console.log msg

		# Return this/self to allow chaining
		self

	# Make group optional
	check = (group, fn) ->

		if not fn?

			# group must contain the callback function so set it correctly
			fn = group

			# Unset the group
			group = ''

		# Return new group and function
		[group, fn]

	# --------------------------------------------------
	# Public functionality
	# --------------------------------------------------
	constructor: (obj) ->

		@settings =
			error : obj?.error
			trace : obj?.trace

		# Store all events
		@events = {}


	on: (event, group, fn) ->

		# Make group optional
		[group, fn] = check group, fn

		# Event name must be a string
		return error this, 'on', 1 if not isString event

		# Group must be a string
		return error this, 'on', 6 if not isString group

		# Fn must be a function
		return error this, 'on', 5, event if not isFunction fn

		# Either add a new event or push it to a list with others

		if @events[event]

			# Check if the group exists within the event
			if @events[event][group]

				# Add function to the event+group list
				@events[event][group].push fn
			else

				# Create event+group list with the initial function
				@events[event][group] = [fn]

		else

			# Create event object
			@events[event] = {}

			# Create group within the event
			@events[event][group] = [fn]

		# Return this to allow chaining
		this


	off: (event, group, fn) ->

		# Make group optional
		[group, fn] = check group, fn

		# Event name must be a string
		return error this, 'off', 1 if event and not isString event

		# Group must be a string
		return error this, 'on', 6 if not isString group

		# Fn must be a function
		return error this, 'off', 5, event if fn and not isFunction fn

		if not event

			# Reset events
			@events = {}

		else

			# Event name doesn't exist
			return error this, 'off', 4, event if not @events[event]

			if not fn

				# Remove all function listeners by eventname
				delete @events[event]

			else

				# Group name doesn't exist for this event
				return error this, 'off', 7, event, group if not @events[event][group]

				# Function to remove does not exist
				return error this, 'off', 2, event, group if -1 is index = @events[event][group].indexOf fn

				# Remove function from events list
				@events[event][group].splice index, 1

				# If no functions are left within the group remove it
				delete @events[event][group] if @events[event][group].length is 0

				# If no groups are left within the event remove the event
				delete @events[event] if objLength @events[event] is 0

		# Return this to allow chaining
		this


	emit: ->

		# Turn arguments into an array
		args = Array.from arguments

		# Retrieve event name from the provided arguments
		event = args.shift()

		# Event was not provided
		return error this, 'emit', 3 if not event

		# Event name must be a string
		return error this, 'emit', 1 if not isString event

		# Event name doesn't exist
		return error this, 'emit', 4, event if not list = @events[event]

		# If tabs is defined by the user it will receive all emited event trough that function
		console.log "MiniEventEmitter ~ trace ~ #{event}" if @settings.trace

		# Loop over all groups within the provided event
		for group, actions of list

			# Loop over all functions/actions within a group
			action.apply action, args for action in actions

		# Return this to allow chaining
		this



module.exports = EventEmitter