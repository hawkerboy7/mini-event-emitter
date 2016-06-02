var EventEmitter;

EventEmitter = (function() {
  var error, isFunction, isString;

  isString = function(event) {
    return typeof event === 'string' || event instanceof String;
  };

  isFunction = function(fn) {
    return typeof fn === 'function';
  };

  error = function(self, name, id, event) {
    var msg;
    if (!self.log) {
      return self;
    }
    msg = "MiniEventEmitter ~ " + name + " ~ ";
    if (id === 1) {
      msg += "Event name should be a string";
    }
    if (id === 2) {
      msg += "Provided function to remove with event \"" + event + "\" is not found";
    }
    if (id === 3) {
      msg += "Event was not provided";
    }
    if (id === 4) {
      msg += "Event \"" + event + "\" does not exist";
    }
    if (id === 5) {
      msg += "Second param provided with event \"" + event + "\" is not a function";
    }
    console.log(msg);
    return self;
  };

  function EventEmitter(log) {
    this.log = log != null ? log : false;
    this.events = {};
  }

  EventEmitter.prototype.on = function(event, fn) {
    if (!isString(event)) {
      return error(this, 'on', 1);
    }
    if (!isFunction(fn)) {
      return error(this, 'on', 5, event);
    }
    if (this.events[event]) {
      this.events[event].push(fn);
    } else {
      this.events[event] = [fn];
    }
    return this;
  };

  EventEmitter.prototype.off = function(event, fn) {
    var index;
    if (event && !isString(event)) {
      return error(this, 'off', 1);
    }
    if (fn && !isFunction(fn)) {
      return error(this, 'off', 5, event);
    }
    if (!event) {
      this.events = {};
    } else if (!fn) {
      if (!this.events[event]) {
        return error(this, 'off', 4, event);
      }
      delete this.events[event];
    } else {
      if (-1 === (index = this.events[event].indexOf(fn))) {
        return error(this, 'off', 2, event);
      }
      this.events[event].splice(index, 1);
      if (this.events[event].length === 0) {
        delete this.events[event];
      }
    }
    return this;
  };

  EventEmitter.prototype.emit = function() {
    var action, args, event, i, len, list;
    args = Array.from(arguments);
    event = args.shift();
    if (!event) {
      return error(this, 'emit', 3);
    }
    if (!isString(event)) {
      return error(this, 'emit', 1);
    }
    if (!(list = this.events[event])) {
      return error(this, 'emit', 4, event);
    }
    for (i = 0, len = list.length; i < len; i++) {
      action = list[i];
      action.apply(action, args);
    }
    return this;
  };

  return EventEmitter;

})();

module.exports = EventEmitter;
