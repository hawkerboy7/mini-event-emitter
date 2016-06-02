var EventEmitter;

EventEmitter = (function() {
  var error, isString;

  isString = function(event) {
    return typeof event === 'string' || event instanceof String;
  };

  error = function(log, id, event) {
    var msg;
    if (!log) {
      return;
    }
    msg = 'EventEmitter ~ ';
    if (id === 1) {
      msg += "Event name should be a string";
    }
    if (id === 2) {
      msg += "Provided function to remove is not found";
    }
    if (id === 3) {
      msg += "Event was not provided";
    }
    if (id === 4) {
      msg += "Emit name \"" + event + "\" doesn't exist";
    }
    return console.log(msg);
  };

  function EventEmitter(log1) {
    this.log = log1;
    this.events = {};
  }

  EventEmitter.prototype.on = function(event, fn) {
    if (!isString(event)) {
      return error(this.log, 1);
    }
    if (this.events[event]) {
      return this.events[event].push(fn);
    } else {
      return this.events[event] = [fn];
    }
  };

  EventEmitter.prototype.off = function(event, fn) {
    var index;
    if (!isString(event)) {
      return error(this.log, 1);
    }
    if (!event) {
      return this.events = {};
    } else if (!fn) {
      return delete this.events[event];
    } else {
      if (-1 === (index = this.events[event].indexOf(fn))) {
        return error(this.log, 2);
      }
      this.events[event].splice(index, 1);
      if (this.events[event].length === 0) {
        return delete this.events[event];
      }
    }
  };

  EventEmitter.prototype.emit = function() {
    var action, args, event, i, len, list, results;
    args = Array.from(arguments);
    event = args.shift();
    if (!event) {
      return error(this.log, 3);
    }
    if (!isString(event)) {
      return error(this.log, 1);
    }
    if (!(list = this.events[event])) {
      return error(this.log, 4, event);
    }
    results = [];
    for (i = 0, len = list.length; i < len; i++) {
      action = list[i];
      results.push(action.apply(action, args));
    }
    return results;
  };

  return EventEmitter;

})();

module.exports = EventEmitter;
