<p align="center">
	<a target="_blank" href="https://travis-ci.org/hawkerboy7/mini-event-emitter">
		<img src="https://img.shields.io/travis/hawkerboy7/mini-event-emitter.svg?branch=master">
	</a>
	<a target="_blank" href="https://david-dm.org/hawkerboy7/mini-event-emitter#info=devDependencies&amp;view=table">
		<img src="https://img.shields.io/david/hawkerboy7/mini-event-emitter.svg">
	</a>
	<a target="_blank" href="https://www.codacy.com/app/dunk_king7/mini-event-emitter/dashboard">
		<img src="https://img.shields.io/codacy/dbc58e6bbbb648358029a6635ce831c1.svg">
	</a>
	<a target="_blank" href="https://gitter.im/hawkerboy7/mini-event-emitter">
		<img src="https://img.shields.io/badge/Gitter-JOIN%20CHAT%20%E2%86%92-1dce73.svg">
	</a>
</p>



# MiniEventEmitter


`npm install --save mini-event-emitter`


## What is it?
The `mini-event-emitter` is an easy lightweight javascript EventEmitter which has no dependencies.
Using the `MiniEventEmitter` you can easily create new instaces.
This way you can create multiple `MiniEventEmitters` with isolated events.
It also has the ability to show you a log message in case you do something that does not make sense.
This should help you as a developer to debug your code faster and help you check for gost events.

As of version `0.3.0` you have the possibility to add a group to an event and eventListener.
So later in your code you can remove events and eventListeners bound to a specific group (e.g. a DOM element).
Using `.emit()` events will be send to all groups.
Also the `.trigger()` is introduced which does the exact same thing as `.emit()` but some people prefer `.trigger()` over `.emit()` so now you can choose.


## Getting Started

### Simple example
```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Listen for the 'test' event and fire an anonymous function
// that does a console.log of all provided arguments
events.on('test', function () { console.log(arguments); });

// Fire the test event with some example arguments
events.emit('test', 4, 'hello', [1,'2'[3]], {a:1,b:2,c:{d:3,e:4}});

// Remove all 'test' eventListeners
events.off('test');

// Wo not fire because all 'test' eventListeners have been removed
events.emit('test');
```


### Removing specific listener functions
```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Create some test functions and let all of them be triggerd on the test event
events.on('test', test1 = function () { console.log('test1'); });
events.on('test', test2 = function () { console.log('test2'); });
events.on('test', test3 = function () { console.log('test3'); });
events.on('test', test4 = function () { console.log('test4'); });

// Fire the test event
events.emit('test');

// Response: 'test1', 'test2', 'test3', 'test4'

// Remove specific 'test' eventListeners by providing the references to the functions
events.off('test',test2);
events.off('test',test3);

// Fire the test event
events.emit('test');

// Response: 'test1', 'test4'
```


### Using groups
```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events({error: true, trance: true});

// Create some test functions and let all of them be triggerd on the test event
events.on('test', test1 = function () { console.log('test1'); });
events.on('test', test2 = function () { console.log('test2'); });
events.on('test', 'group1', test3 = function () { console.log('test3'); });
events.on('test', 'group1', test4 = function () { console.log('test4'); });
events.on('test', 'group2', test5 = function () { console.log('test5'); });
events.on('test', 'group2', test6 = function () { console.log('test6'); });

// Fire the test event
events.emit('test');

// Response: 'test1', 'test2', 'test3', 'test4', 'test5', 'test6'

// Remove a complete group
events.off('test','group1');

// Fire the test event
events.emit('test');

// Response: 'test1', 'test2', 'test5', 'test6'

// Remove a specific function within a group
events.off('test','group2', test5);

// Fire the test event
events.emit('test');

// Response: 'test1', 'test2', 'test6'

// Pay attention: This will remove all test events WITHOUT a group, in this case that means 'group2' function test6 will still fire with the test event
events.off('test');

// Fire the test event
events.emit('test');

// Response: 'test6'

// Remove all functions in 'group2' (which only is function test 6)
events.off('test', 'group2');

// Fire the test event
events.emit('test');

// No Response / Error message
```


## Extra's

### Logging
As decribed earlier you can also log actions which do not make sense and probably are mistakes `error`.
You also have the ability to `trace` **succesfull events**.
You can switch the logging on by providing a `{error: true, trace: true}` as the first argument when creating a new instace of the `MiniEventEmitter`.
By default all logging is disabled.
While running the application you could toggle the `trace` and `error`.
`events.settings.[error/trace] = true/false`.
**Pay attention though!**
*Due to asynchrony toggling between on/off could be more confusing than helpfull, however you are free to choose.*

#### Error example
```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events({error: true});

// Any possible mistake will now be shown in the console

// Trigger the emit function without event name
events.emit();

// Response: MiniEventEmitter ~ emit ~ Event was not provided

// Turn error-logging off again
events.settings.error = false

// Trigger the emit function without event name
events.emit();

// No Response
```

#### Trace example
```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events({trace: true});

// All traces of succesfull 'event emits' will be shown in the console

// Trigger the emit function without event name
events.on('test', function () {console.log("test message");});

// Fire the 'test' event
events.emit('test');

// Response: 'MiniEventEmitter ~ trace ~ test', 'test message'

// Turn trace-logging off again
events.settings.trace = false

// Fire the 'test' event
events.emit('test');

// Response: 'test message'
```

### Cases which are probably flaws using any EventEmitter
The following cases can be recognized by the `MiniEventEmitter` and can be shown to you in the console:

- `.emit` an event which has no listener for it.
- Using `.emit` without an event name.
- Using `.off` on an event name that does not exist
- Using `.off` on an event name that is not inside the provided group
- Using `.off` and providing a function that does not exist with the provided event name (and group)
- Use something other than a sting as event or group name.
- Use something other than a function as an eventListener.


### Chaining
It is also possible to chain `MiniEventEmitter` methodes.

```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Chained: add eventListener 'test', trigger the event and remove the event
events.on('test',function(){console.log('test');}).emit('test').off('test');

// Response: 'test'
```


## Planned Features - Performance optimizers

- Send events to specific groups using `.group`
- Create a `socket.io` link
- Create a `webworker` link
- Add support for require.js / common.js
- Check all code for possible speed gains: `.push` method possibly replace it with `array[array.length]=value`.