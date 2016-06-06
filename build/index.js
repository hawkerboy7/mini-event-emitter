var EventEmitter;

EventEmitter = (function() {
  var check, error, isFunction, isString, objLength, remove;

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
    if (id === 8) {
      msg += "Group \"" + group + "\" doesn't have any function to remove";
    }
    console.log(msg);
    return self;
  };

  check = function(group, fn) {
    if ((fn == null) && isFunction(group)) {
      fn = group;
      group = '';
    } else {
      if (!group) {
        group = '';
      }
    }
    return [group, fn];
  };

  remove = function(self, events, groups, group, fn) {
    var action, actions, event, i, index, len, ref, results;
    if (!groups[group]) {
      return error(self, 'off', 8, null, group);
    }
    ref = groups[group];
    results = [];
    for (event in ref) {
      actions = ref[event];
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        index = events[event].indexOf(action);
        events[event].splice(index, 1);
      }
      if (events[event].length === 0) {
        results.push(delete events[event]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  function EventEmitter(obj) {
    this.settings = {
      error: obj != null ? obj.error : void 0,
      trace: obj != null ? obj.trace : void 0
    };
    this.events = {};
    this.groups = {};
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
    if (this.groups[group]) {
      if (this.groups[group][event]) {
        this.groups[group][event].push(fn);
      } else {
        this.groups[group][event] = [fn];
      }
    } else {
      this.groups[group] = {};
      this.groups[group][event] = [fn];
    }
    if (this.events[event]) {
      this.events[event].push(fn);
    } else {
      this.events[event] = [fn];
    }
    return this;
  };

  EventEmitter.prototype.off = function(event, group, fn) {
    var ref;
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
      remove(this, this.events, this.groups, group, fn);
      return this;
    }
    if (!this.events[event]) {
      return error(this, 'off', 4, event);
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
    if (this.settings.trace) {
      console.log("MiniEventEmitter ~ trace ~ " + event);
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
