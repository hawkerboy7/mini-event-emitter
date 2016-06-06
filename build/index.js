var EventEmitter;

EventEmitter = (function() {
  var check, error, isFunction, isString, objLength;

  isString = function(event) {
    return typeof event === 'string' || event instanceof String;
  };

  objLength = function(obj) {
    return Object.keys(obj).length;
  };

  isFunction = function(fn) {
    return typeof fn === 'function';
  };

  error = function(self, name, id, event, group) {
    var msg;
    if (!self.settings.error) {
      return self;
    }
    msg = "MiniEventEmitter ~ " + name + " ~ ";
    if (id === 1) {
      msg += "Event name must be a string";
    }
    if (id === 2) {
      msg += "Provided function to remove with event \"" + event + "\" in group \"" + group + "\" is not found";
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
    if (id === 6) {
      msg += "Group must be a string";
    }
    if (id === 7) {
      msg += "Group \"" + group + "\" doesn't exist for the event \"" + event + "\"";
    }
    console.log(msg);
    return self;
  };

  check = function(group, fn) {
    if (fn == null) {
      fn = group;
      group = '';
    }
    return [group, fn];
  };

  function EventEmitter(obj) {
    this.settings = {
      error: obj != null ? obj.error : void 0,
      trace: obj != null ? obj.trace : void 0
    };
    this.events = {};
  }

  EventEmitter.prototype.on = function(event, group, fn) {
    var ref;
    ref = check(group, fn), group = ref[0], fn = ref[1];
    if (!isString(event)) {
      return error(this, 'on', 1);
    }
    if (!isString(group)) {
      return error(this, 'on', 6);
    }
    if (!isFunction(fn)) {
      return error(this, 'on', 5, event);
    }
    if (this.events[event]) {
      if (this.events[event][group]) {
        this.events[event][group].push(fn);
      } else {
        this.events[event][group] = [fn];
      }
    } else {
      this.events[event] = {};
      this.events[event][group] = [fn];
    }
    return this;
  };

  EventEmitter.prototype.off = function(event, group, fn) {
    var index, ref;
    ref = check(group, fn), group = ref[0], fn = ref[1];
    if (event && !isString(event)) {
      return error(this, 'off', 1);
    }
    if (!isString(group)) {
      return error(this, 'on', 6);
    }
    if (fn && !isFunction(fn)) {
      return error(this, 'off', 5, event);
    }
    if (!event) {
      this.events = {};
    } else {
      if (!this.events[event]) {
        return error(this, 'off', 4, event);
      }
      if (!fn) {
        delete this.events[event];
      } else {
        if (!this.events[event][group]) {
          return error(this, 'off', 7, event, group);
        }
        if (-1 === (index = this.events[event][group].indexOf(fn))) {
          return error(this, 'off', 2, event, group);
        }
        this.events[event][group].splice(index, 1);
        if (this.events[event][group].length === 0) {
          delete this.events[event][group];
        }
        if (objLength(this.events[event] === 0)) {
          delete this.events[event];
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.emit = function() {
    var action, actions, args, event, group, i, len, list;
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
    if (this.settings.trace) {
      console.log("MiniEventEmitter ~ trace ~ " + event);
    }
    for (group in list) {
      actions = list[group];
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        action.apply(action, args);
      }
    }
    return this;
  };

  return EventEmitter;

})();

module.exports = EventEmitter;
