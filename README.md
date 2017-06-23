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
The `MiniEventEmitter` is an easy javascript EventEmitter which has no dependencies.
You can easily create new instaces of the `MiniEventEmitter`.
This way you can create multiple `MiniEventEmitters` with isolated events.
It also has the ability to show you [trace and error](#logging) messages.
This way you can keep track of all events being send and also show you something that does not make sense resulting in an error.
This should help you as a developer to debug your code faster and help you check for gost events.

You have the possibility to add a [group](#using-groups) to an event.
This way you can remove events and eventListeners bound to a specific group (e.g. a DOM element).
Using `.emit()` all eventListeners for a specific event will excecute regardless of groups.
Also the `.trigger()` is available which does the exact same thing as `.emit()`.
Some people prefer `.trigger()` over `.emit()` so you can use both.



## Getting started


### Simple example
```javascript
// Require the MiniEventEmitter
var Events = require("mini-event-emitter");

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Listen for the "test" event and fire an anonymous function
events.on("test", function (a,b) { console.log(a,b); });

// Fire the test event with some example arguments
events.emit("test", "my first argument", "my second argument");

// Response: my first argument my second argument

// Remove all "test" eventListeners
events.off("test");

// Will not fire because all "test" eventListeners have been removed
events.emit("test");
```


## Functions

#### `.on(event[,group],eventListener)`
- `string` **event**, indicating the **event** to be listened for.
- `string` **group** *optional*, allows for **event**s to be in a **group**. Using `.off()` you can remove (all) **event**s linked to a **group**.
- `function` **eventListener**, the function to be excecuted when the **event** is emitted or triggered.


#### `.off([event][,group][,eventListener])`
- `string` **event** *optional*
- `string` **group** *optional*
- `function` **eventListener** *optional*
All possible ways to use `.off()` are explained below.

##### `.off()`
Remove all *event*s, *group*s and *eventListener*s

##### `.off(event)`
Remove all *eventListener*'s for this **event** without a *group*.

##### `.off(event,group)`
Remove all *eventListener*'s for this **event** in this **group**.

##### `.off(event,eventListener)`
Remove a specific **eventListener** for this **event** without a *group*.

##### `.off(event,group,eventListener)`
Remove a specific **eventListener** for this **event** in this **group**.

##### `.off(null)`
Remove all *event*s and *eventListener*s without a **group**. *(the first argument `event` **must** be `null`)*

##### `.off(null,group)`
Remove all *event*s and *eventListener*s in this **group**. *(the first argument `event` **must** be `null`)*

#### `.emit(event[, ...])`
- `string` **event**, identifies which *eventListener*s are to be excecuted.
- `...` *optional*, any amount of aditional arguments may be added

#### `.trigger(event[, ...])`
Same as `.emit()`

#### `.emitIf(event[, ...])`
Same as `.emit()` but the event will only be send if it is being listened for

#### `.triggerIf(event[, ...])`
Same as `.emitIf()`



## Aditional examples


### Removing specific listener functions
```javascript
// Require the MiniEventEmitter
var Events = require("mini-event-emitter");

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Create some test functions and let all of them be triggerd on the test event
events.on("test", test1 = function () { console.log("test1"); });
events.on("test", test2 = function () { console.log("test2"); });
events.on("test", test3 = function () { console.log("test3"); });
events.on("test", test4 = function () { console.log("test4"); });

// Fire the test event
events.emit("test");

// Response: "test1", "test2", "test3", "test4"

// Remove specific "test" eventListeners by providing the references to the functions
events.off("test",test2);
events.off("test",test3);

// Fire the test event
events.emit("test");

// Response: "test1", "test4"
```


### Using groups
```javascript
// Require the MiniEventEmitter
var Events = require("mini-event-emitter");

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Create some test functions and let all of them be triggerd on the test event
events.on("test", test1 = function () { console.log("test1"); });
events.on("test", test2 = function () { console.log("test2"); });
events.on("test", "group1", test3 = function () { console.log("test3"); });
events.on("test", "group1", test4 = function () { console.log("test4"); });
events.on("test", "group2", test5 = function () { console.log("test5"); });
events.on("test", "group2", test6 = function () { console.log("test6"); });

// Fire the test event
events.emit("test");

// Response: "test1", "test2", "test3", "test4", "test5", "test6"

// Remove a complete group
events.off("test","group1");

// Fire the test event
events.emit("test");

// Response: "test1", "test2", "test5", "test6"

// Remove a specific function within a group
events.off("test","group2", test5);

// Fire the test event
events.emit("test");

// Response: "test1", "test2", "test6"

// Pay attention: This will remove all test events WITHOUT a group (or group "").
// In this case that means "group2" function "test6" will still fire with the test event
events.off("test");

// Fire the test event
events.emit("test");

// Response: "test6"

// Remove all functions in "group2" (which at this point only is function test 6)
events.off("test", "group2");

// Fire the test event
events.emit("test");

// No Response
```


### Clear a group
```javascript
// Require the MiniEventEmitter
var Events = require("mini-event-emitter");

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Create some test functions and and group them to group testGroup
events.on("test1", "testGroup1", test1 = function () { console.log("test1"); });
events.on("test2", "testGroup1", test2 = function () { console.log("test2"); });
events.on("test3", "testGroup1", test3 = function () { console.log("test3"); });
events.on("test3", "testGroup2", test4 = function () { console.log("test4"); });
events.on("test3", "testGroup2", test5 = function () { console.log("test5"); });

// Fire the events
events.emit("test1").emit("test2").emit("test3");

// Response: "test1", "test2", "test3", "test4", "test5"

// Remove a complete group
events.off(null,"testGroup1");

// Fire the test event
events.emit("test1").emit("test2").emit("test3");

// Response: "test4", "test5"

```



## Extra's


### Logging
#### `new Events([options])`
- `options` **object**, contains the options for this `MiniEventEmitter` instance

##### `options.error = [boolean]`
Defaults to `false`. If `true` is provided actions which do not make sense and probably are mistakes are logged.

##### `options.trace = [boolean]`
Defaults to `false`. If `true` is provided **succesfull events** and their arguments, if available, will be logged.

##### `options.name = [string]`
Defaults to `MiniEventEmitter`. If `[string]` is provided `error` and `trace` messages will contain the provided name.
<br><br>
While running the application you could toggle the `trace` and `error`.
`events.settings.[error/trace] = true/false`.
**Pay attention though!**
*Due to asynchrony toggling between on/off could be more confusing than helpfull, however you are free to choose.*


#### Error example
```javascript
// Require the MiniEventEmitter
var Events = require("mini-event-emitter");

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
var Events = require("mini-event-emitter");

// Create a new instance of the MiniEventEmitter
var events = new Events({trace: true});

// All traces of succesfull "event emits" will be shown in the console

// Create an example test event with eventListener
events.on("test", function () {console.log("test message");});

// Fire the "test" event
events.emit("test");

// Response: "MiniEventEmitter ~ trace ~ test", "test message"

// Turn trace-logging off again
events.settings.trace = false

// Fire the "test" event
events.emit("test");

// Response: "test message"
```


#### Name example
```javascript
// Require the MiniEventEmitter
var Events = require("mini-event-emitter");

// Create a new instance of the MiniEventEmitter
var events = new Events({trace: true, error: true, name: "My Name"});

// Any possible mistake will now be shown in the console
// All traces of succesfull "event emits" will be shown in the console

// Create an example test event with eventListener
events.on("test", function () {console.log("test message");});

// Fire the "test" event
events.emit("test");

// Response: "My Name ~ trace ~ test"
// Response: "test message"

// Trigger the emit function without event name
events.emit();

// Response: "My Name ~ emit ~ Event was not provided"
```


### Cases MiniEventEmitter can warn you about
The following cases can be recognized by the `MiniEventEmitter` and can be shown to you in the console:

- `.emit` an event which has no eventListener for it
- Using `.emit` without an event.
- Using `.off` for an event that does not exist (in the specified group)
- Using `.off` for a group that does not exist
- Using `.off` and providing an eventListener that does not exist with the provided event name (and group)
- Providing anything other than a string as event or group
- Providing anything other than a function as an eventListener


### Chaining
It is also possible to chain `MiniEventEmitter` methodes.

```javascript
// Require the MiniEventEmitter
var Events = require("mini-event-emitter");

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Chained: add eventListener "test", trigger the event and remove the event
events.on("test",function(){console.log("test");}).emit("test");

// Response: "test"
```


## Used attributes
If you want to extend `MiniEventEmitter` which you can, you do need to make sure you do not override existing attributes as that will break `MiniEventEmitter`.
Below you find all attributes used.

```javascript
var events = new Events = require("mini-event-emitter");

// MiniEventEmitter Functions
events.on()
events.off()
events.emit()
events.emitIf()
events.trigger()
events.triggerIf()

// MiniEventEmitter references and storage objects
events.events
events.groups
events.settings
