class MiniEventEmitter

	constructor: (@mini, obj) ->

		# Define and store settings
		@mini.settings =
			error  : obj?.error || false
			trace  : obj?.trace || false

		# Store all events
		@mini.events = {}

		# Store all groups
		@mini.groups = {}


	# --------------------------------------------------
	# Public available
	# --------------------------------------------------
	on: (event, group, fn) =>

		# Make group optional
		[group, fn] = @optional group, fn

		# Check if the input is valid if not allow chaining
		return @mini if not @valid "on", event, group, fn

		# Check if the provided group exists
		if (groups = @mini.groups)[group]

			# Check if the provided event exists within this group and either push to or create an array with fns
			if groups[group][event] then groups[group][event].push fn else groups[group][event] = [fn]

		else

			# Create the provided group
			groups[group] = {}

			# Create an array with fn for this group and event
			groups[group][event] = [fn]

		# Either add a new event or push it to a list with others
		if (events = @mini.events)[event] then events[event].push fn else events[event] = [fn]

		# Allow chaining
		@mini


	off: (event, group, fn) =>

		# Remove all events, groups and eventListeners
		return @removeAll() if arguments.length is 0

		# Make group optional
		[group, fn] = @optional group, fn

		# Check if the input is valid if not allow chaining
		return @mini if not @valid "off", event, group, fn

		# Provided group does not exist
		if not @mini.groups[group]

			@error "off", 7, event, group

			# Allow chaining
			return @mini

		# No event is provided so remove all fn from the provided group
		return @removeGroup group if not event

		# Event name does not exist for the provided group
		if not fns = @mini.groups[group][event]

			@error "off", 8, event, group

			# Allow chaining
			return @mini

		# If no fn to remove is provided, remove all fns of the event+group
		if not fn

			@removeFns event, fns

			# Allow chaining
			return @mini

		# Provided fn to remove is not found for the provided event and group
		if -1 is index = fns.indexOf fn

			@error "off", 2, event, group

			# Allow chaining
			return @mini

		# Remove single fn
		@removeFn event, group, fns, fn, index

		# Allow chaining
		@mini


	emitIf: =>

		@_emit arguments, true


	emit: =>

		@_emit arguments


	_emit: (args, skip) ->

		# Turn arguments into an array
		args = Array.from args

		# Retrieve event name from the provided arguments
		event = args.shift()

		# Check if the provided event exists
		return @mini if not fns = @validEvent event, skip

		# Trace the event
		@trace event, args

		# Excecute all fns of the event
		fn.apply fn, args for fn in fns

		# Allow chaining
		@mini



	# --------------------------------------------------
	# Helpers
	# --------------------------------------------------
	valid: (name, event, group, fn) ->

		if name is "on"

			# Event name MUST be a string
			return @error name, 1 if not @isString event

			# Group MUST be a string
			return @error name, 5 if not @isString group

			# Fn MUST be a function
			return @error name, 6, event, group if not @isFunction fn

		if name is "off"

			# Event name MUST be a string OR null
			return @error name, 1 if event isnt null and not @isString event

			# Group MUST be a string
			return @error name, 5 if not @isString group

			# Fn MAY be a function
			return @error name, 6, event, group if fn and not @isFunction fn

		true


	validEvent: (event, skip) ->

		# Event was not provided
		return @error "emit", 3 if not event

		# Event name must be a string
		return @error "emit", 1 if not @isString event

		# Event name does not exist
		if not fns = @mini.events[event]

			# Send the error with emit but not with emitIf
			@error "emit", 4, event if not skip

			return null

		# Return all found fn's to be excecuted
		fns


	error: (name, id, event, group) ->

		# Only log the message if they are required
		return null if not @mini.settings.error

		# Prefix all error messages with the MiniEventEmitter text
		msg = "MiniEventEmitter ~ #{name} ~ "

		if id is 1 then msg += "Event name must be a string"
		if id is 2 then msg += "Provided function to remove with event \"#{event}\" in group \"#{group}\" is not found"
		if id is 3 then msg += "Event was not provided"
		if id is 4 then msg += "EventListener for event \"#{event}\" does not exist"
		if id is 5 then msg += "Provided group must be a string"
		if id is 6 then msg += "The last param provided with event \"#{event}\" and group \"#{group}\" is expected to be a function"
		if id is 7 then msg += "Provided group \"#{group}\" is not found"
		if id is 8 then msg += "Event \"#{event}\" does not exist for the provided group \"#{group}\""

		# Log the message to the console (as a warning if available)
		if console then (if console.warn then console.warn msg else console.log msg)

		null


	optional: (group, fn) ->

		# Check if the "actual" group was provided or only an event and fucntion
		if not fn? and @isFunction group

			# Group contains the fn, so correct accordingly
			fn = group

			# Set group to default
			group = ""

		else

			# Make sure the group is a string
			group = "" if not group

		# Return new group and fn
		[group, fn]


	removeAll: ->

		# Removes all MiniEventEmitter's references to events, groups and eventListeners
		@mini.events = {}
		@mini.groups = {}

		# Allow chaining
		@mini


	removeGroup: (group) ->

		# Remove all events of the provided group
		@removeFns event, fns for event, fns of @mini.groups[group]

		# Remove the group
		delete @mini.groups[group]

		# Allow chaining
		@mini


	removeFns: (event, fns) =>

		# Loop over all found fns in the group
		for fn in fns

			# Get the index of the fn in the eventlist
			index = @mini.events[event].indexOf fn

			# Remove the fn from the eventlist
			@mini.events[event].splice index, 1

		# If no fns are left within the eventlist remove it
		delete @mini.events[event] if @mini.events[event].length is 0


	removeFn: (event, group, fns, fn, index) =>

		# Remove fn from groups list
		fns.splice index, 1

		# If no fns are left within the event of a group remove it
		delete @mini.groups[group][event] if fns.length is 0

		# If no events are left within the group remove it
		delete @mini.groups[group] if 0 is @objLength @mini.groups[group]

		# Get the index of the fn in the eventlist
		index = @mini.events[event].indexOf fn

		# Remove fn from the eventlist
		@mini.events[event].splice index, 1

		# If no fns are left within the group remove it
		delete @mini.events[event] if @mini.events[event].length is 0


	trace: (event, args) ->

		# If traced, all *emited* events will be loged *before* the event is actually emitted
		if @mini.settings.trace

			# The trace message
			msg = "MiniEventEmitter ~ trace ~ #{event}"

			# Make trace messages blue if the log.debug is available (in browser)
			if args.length is 0

				# Log without arguments
				if console.debug then console.log "%c #{msg}", "color: #13d" else console.log msg

			else

				# Log arguments as well
				if console.debug then console.log "%c #{msg}", "color: #13d", args else console.log msg, args


	# Shortcuts
	isString: (event) -> typeof event is "string" or event instanceof String
	objLength: (obj) -> Object.keys(obj).length
	isFunction: (fn) -> typeof fn is "function"



# --------------------------------------------------
# Expose
# --------------------------------------------------

# Require | Browserify, Node
module.exports = MiniEventEmitter

# Distribution | Browser
# window.MiniEventEmitter = MiniEventEmitter
