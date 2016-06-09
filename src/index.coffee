class MiniEventEmitter

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

		# Prefix all error messages with the MiniEventEmitter text
		msg = "MiniEventEmitter ~ #{name} ~ "

		if id is 1 then msg += "Event name must be a string"
		if id is 2 then msg += "Provided function to remove with event \"#{event}\" in group \"#{group}\" is not found"
		if id is 3 then msg += "Event was not provided"
		if id is 4 then msg += "Event \"#{event}\" does not exist"
		if id is 5 then msg += "Second param provided with event \"#{event}\" is not a function"
		if id is 6 then msg += "Group must be a string"
		if id is 7 then msg += "Group \"#{group}\" doesn't exist for the event \"#{event}\""
		if id is 8 then msg += "Group \"#{group}\" with event \"#{event}\" does not exists"
		if id is 9 then msg += "Event \"#{event}\" does not exist in group \"#{group}\""

		# Log the message to the console (as a warning if available)
		if console.warn then console.warn msg else console.log msg

		# Return this/self to allow chaining
		self

	# Make group optional
	check = (group, fn) ->

		if not fn? and isFunction group

			# group must contain the callback function so set it correctly
			fn = group

			# Unset the group
			group = ''

		else

			# Make sure the group is a string
			group = '' if not group

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
		@groups = {}


	on: (event, group, fn) ->

		# Make group optional
		[group, fn] = check group, fn

		# Event name must be a string
		return error this, 'on', 1 if not isString event

		# Group must be a string
		return error this, 'on', 6 if not isString group

		# Fn must be a function
		return error this, 'on', 5, event if not isFunction fn

		# Check if the provided group exists
		if @groups[group]

			# Check if the provided event exists within this group and either push to or create an array with functions
			if @groups[group][event] then @groups[group][event].push fn else @groups[group][event] = [fn]

		else

			# Create the provided group
			@groups[group] = {}

			# Create an array with function for this group and event
			@groups[group][event] = [fn]

		# Either add a new event or push it to a list with others
		if @events[event] then @events[event].push fn else @events[event] = [fn]

		# Return this to allow chaining
		this


	off: (event, group, fn) ->

		# Define the actual remove function variables are already know due to the scope the function is in
		removeFn = =>

			# Loop over all found function in the group
			for action in actions

				# Get the index of the stored function
				index = @events[event].indexOf action

				# Remove function from events list
				@events[event].splice index, 1

			# If no functions are left within the group remove it
			delete @events[event] if @events[event].length is 0

		# Make group optional
		[group, fn] = check group, fn

		# Event name must be a string
		return error this, 'off', 1 if event and not isString event

		# Group must be a string
		return error this, 'on', 6 if not isString group

		# Fn must be a function
		return error this, 'off', 5, event if fn and not isFunction fn

		# Provided group must exist
		return error this, 'off', 8, event, group if not @groups[group]

		if not event

			# Remove all events of the provided group
			removeFn() for event, actions of @groups[group]

			# Remove the group
			delete @groups[group]

			# Return this to allow chaining
			return this

		# Event name doesn't exist for this group
		return error this, 'off', 4, event, group if not actions = @groups[group][event]

		# Check if a function to be removed is defined
		if not fn

			# Remove the eventListeners of the specified group+event
			removeFn()

			# Remove all events related to the group
			delete @groups[group][event]

			# If no events are left within the group remove it
			delete @groups[group] if 0 is objLength @groups[group]

			# Return this to allow chaining
			return this

		return error this, 'off', 2, event, group if -1 is index1 = actions.indexOf fn

		# Remove function from groups list
		actions.splice index1, 1

		# If no functions are left within the event of a group remove it
		delete @groups[group][event] if actions.length is 0

		# If no events are left within the group remove it
		delete @groups[group] if 0 is objLength @groups[group]

		# Get the index of the stored function
		index2 = @events[event].indexOf fn

		# Remove function from events list
		@events[event].splice index2, 1

		# If no functions are left within the group remove it
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

		# Event name must be a string
		return error this, 'emit', 1 if not isString event

		# Event name doesn't exist
		return error this, 'emit', 4, event if not list = @events[event]

		# If tabs is defined by the user it will receive all emited event trough that function
		if @settings.trace

			# The trace message
			msg = "MiniEventEmitter ~ trace ~ #{event}"

			# Log the message to the console (as a debug if available)
			if console.debug then console.debug msg else console.log msg

		# Loop over all functions/actions within a group
		action.apply action, args for action in list

		# Return this to allow chaining
		this


	trigger: ->

		# Send request along to emit
		@emit.apply @, arguments

		# Return this to allow chaining
		this



# Export for browserify or simple browser
(->
	if module? && module.exports
		module.exports = MiniEventEmitter
	else if window
		window.MiniEventEmitter = MiniEventEmitter
	else
		msg = "Cannot expose MiniEventEmitter"
		if console.warn then console.warn msg else console.log msg
)()