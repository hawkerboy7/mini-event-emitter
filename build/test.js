var Events, events;

Events = require("./index");

events = new Events;

events.on("test", function() {
  return console.log(JSON.stringify(arguments));
});

events.emit("test", 4, "hello", [1, "2", [3]], {
  a: 1,
  b: 2,
  c: {
    d: 3,
    e: 4
  }
});

events.emit("test");

events.off("test");

events.emit("test");
