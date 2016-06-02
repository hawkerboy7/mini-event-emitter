[![Build Status](https://travis-ci.org/hawkerboy7/mini-event-emitter.svg?branch=master)](https://travis-ci.org/hawkerboy7/mini-event-emitter-base)&nbsp;&nbsp;[![Join the chat at https://gitter.im/hawkerboy7/mini-event-emitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/hawkerboy7/mini-event-emitter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# MiniEventEmitter

`npm install --save mini-event-emitter`

## What is it?
The `mini-event-emitter` is an easy lightweight javascript EventEmitter which has no dependencies.
It is build to work with browserify.
In using the `MiniEventEmitter` you can create new instaces. This way you can easily create multiple `MiniEventEmitters` with isolated events.
It also has the ability to show you a log message in case you do something that doesn't make sense.
This should help you as a developer to debug your code faster and help you check for gost events.


## Getting Started

### Simple
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

// Remove all 'test' eventlisteners
events.off('test');

// Won't fire because all eventlisteners have been removed
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

// Remove specific 'test' eventlisteners by providing the references to the functions
events.off('test',test2);
events.off('test',test3);

// Fire the test event
events.emit('test');

// Response: 'test1', 'test4'
```



## Extra's

### Logging
As decribed earlier you can also log actions which don't make sense and probably are mistakes. You can turn the logging on by providing a `true` as the first argument when creating a new instace of the `MiniEventEmitter`. During the application you could also turn logging on and of while the `MiniEventEmitter` is running. `events.log = true/false`. **Pay attention though!** *Due to asynchrony turning logging on and off could be more confusing than helpfull but you are free to choose.*

```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events true

// Any possible mistake will now be shown in the console.

// Trigger the emit function without event name
events.emit();

// Response: MiniEventEmitter ~ emit ~ Event was not provided

// Turn logging off again
events.log = false

// Trigger the emit function without event name
events.emit();

// No Response
```

### Cases which are probably flaws using any EventEmitter
The following cases can be recognized by the `MiniEventEmitter` and can be shown to you in the console:

- `.emit` an event which has no listener for it.
- Using `.emit` without an event name.
- Using `.off` on an event name that doesn't exist
- Using `.off` and providing a function that doesn't exist with the provided event name
- Use something other than a sting as event name.
- Use something other than a function as an eventlistener.


### Chaining
It is also possible to chain `MiniEventEmitter` methodes.

```javascript
// Require the MiniEventEmitter
var Events = require('mini-event-emitter');

// Create a new instance of the MiniEventEmitter
var events = new Events();

// Chained: add event listener 'test', trigger the event and remove the event
events.on('test',function(){console.log('test');}).emit('test').off('test');

// Response: 'test'
```