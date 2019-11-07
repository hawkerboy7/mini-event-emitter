if not MiniEventEmitter
	Events = require "./app"
else
	Events = MiniEventEmitter


console.log "Test 1"
events = new Events

events.on "test", ->
	console.log JSON.stringify arguments

events.emit "test", 4, "hello"
events.off "test"
events.emit "test"



console.log "\nTest 2"
events = new Events

events.on "test", test1 = -> console.log "test1"
events.on "test", test2 = -> console.log "test2"
events.on "test", test3 = -> console.log "test3"
events.on "test", test4 = -> console.log "test4"

events.emit "test"
events.off "test", test2
events.off "test", test3
events.emit "test"



console.log "\nTest 3"
events = new Events

events.on "test", test1 = -> console.log("test1")
events.on "test", test2 = -> console.log("test2")
events.on "test", "group1", test3 = -> console.log("test3")
events.on "test", "group1", test4 = -> console.log("test4")
events.on "test", "group2", test5 = -> console.log("test5")
events.on "test", "group2", test6 = -> console.log("test6")

events.emit("test");
events.off("test","group1");
events.emit("test");
events.off("test","group2", test5);
events.emit("test");
events.off("test");
events.emit("test");
events.off("test", "group2");
events.emit("test");



console.log "\nTest 4"
events = new Events error: true
events.emit()
events.settings.error = false
events.emit()



console.log "\nTest 5"
events = new Events trace: true

events.on "test", -> console.log "test message"
events.emit "test"
events.settings.trace = false
events.emit "test"



console.log "\nTest 6"
events = new Events
events.on("test",-> console.log "test" ).emit("test").off("test").emit "test"



console.log "\nTest 7"
events = new Events error: true
events.on("test",-> console.log "test, no error is expected below this line" ).emitIf("test", "argument1").off("test").emitIf "test", "argument1"
