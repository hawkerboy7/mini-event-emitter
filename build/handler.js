var MiniEventEmitter,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MiniEventEmitter = (function() {
  function MiniEventEmitter(mini, obj) {
    this.mini = mini;
    this.removeFn = bind(this.removeFn, this);
    this.removeFns = bind(this.removeFns, this);
    this.emit = bind(this.emit, this);
    this.off = bind(this.off, this);
    this.on = bind(this.on, this);
    this.mini.settings = {
      error: (obj != null ? obj.error : void 0) || false,
      trace: (obj != null ? obj.trace : void 0) || false
    };
    this.mini.events = {};
    this.mini.groups = {};
  }

  MiniEventEmitter.prototype.on = function(event, group, fn) {
    var events, groups, ref;
    ref = this.optional(group, fn), group = ref[0], fn = ref[1];
    if (!this.valid("on", event, group, fn)) {
      return this.mini;
    }
    if ((groups = this.mini.groups)[group]) {
      if (groups[group][event]) {
        groups[group][event].push(fn);
      } else {
        groups[group][event] = [fn];
      }
    } else {
      groups[group] = {};
      groups[group][event] = [fn];
    }
    if ((events = this.mini.events)[event]) {
      events[event].push(fn);
    } else {
      events[event] = [fn];
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.off = function(event, group, fn) {
    var fns, index, ref;
    ref = this.optional(group, fn), group = ref[0], fn = ref[1];
    if (!this.valid("off", event, group, fn)) {
      return this.mini;
    }
    if (!this.mini.groups[group]) {
      this.error("off", 7, event, group);
      return this.mini;
    }
    if (!event) {
      return this.removeGroup(group);
    }
    if (!(fns = this.mini.groups[group][event])) {
      this.error("off", 8, event, group);
      return this.mini;
    }
    if (!fn) {
      this.removeFns(event, fns);
      return this.mini;
    }
    if (-1 === (index = fns.indexOf(fn))) {
      this.error("off", 2, event, group);
      return this.mini;
    }
    this.removeFn(event, group, fns, fn, index);
    return this.mini;
  };

  MiniEventEmitter.prototype.emit = function() {
    var args, event, fn, fns, i, len, msg;
    args = Array.from(arguments);
    event = args.shift();
    if (!(fns = this.validEvent(event))) {
      return this.mini;
    }
    if (this.mini.settings.trace) {
      msg = "MiniEventEmitter ~ trace ~ " + event;
      if (args.length === 0) {
        if (console.debug) {
          console.log("%c " + msg, "color: #13d");
        } else {
          console.log(msg);
        }
      } else {
        if (console.debug) {
          console.log("%c " + msg, "color: #13d", args);
        } else {
          console.log(msg, args);
        }
      }
    }
    for (i = 0, len = fns.length; i < len; i++) {
      fn = fns[i];
      fn.apply(fn, args);
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.valid = function(name, event, group, fn) {
    if (name === "on") {
      if (!this.isString(event)) {
        return this.error(name, 1);
      }
      if (!this.isString(group)) {
        return this.error(name, 5);
      }
      if (!this.isFunction(fn)) {
        return this.error(name, 6, event, group);
      }
    }
    if (name === "off") {
      if (event !== null && !this.isString(event)) {
        return this.error(name, 1);
      }
      if (!this.isString(group)) {
        return this.error(name, 5);
      }
      if (fn && !this.isFunction(fn)) {
        return this.error(name, 6, event, group);
      }
    }
    return true;
  };

  MiniEventEmitter.prototype.validEvent = function(event) {
    var fns;
    if (!event) {
      return this.error("emit", 3);
    }
    if (!this.isString(event)) {
      return this.error("emit", 1);
    }
    if (!(fns = this.mini.events[event])) {
      return this.error("emit", 4, event);
    }
    return fns;
  };

  MiniEventEmitter.prototype.error = function(name, id, event, group) {
    var msg;
    if (!this.mini.settings.error) {
      return;
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
      msg += "EventListener for event \"" + event + "\" does not exist";
    }
    if (id === 5) {
      msg += "Provided group must be a string";
    }
    if (id === 6) {
      msg += "The last param provided with event \"" + event + "\" and group \"" + group + "\" is expected to be a function";
    }
    if (id === 7) {
      msg += "Provided group \"" + group + "\" is not found";
    }
    if (id === 8) {
      msg += "Event \"" + event + "\" does not exist for the provided group \"" + group + "\"";
    }
    if (console) {
      if (console.warn) {
        console.warn(msg);
      } else {
        console.log(msg);
      }
    }
    return false;
  };

  MiniEventEmitter.prototype.optional = function(group, fn) {
    if ((fn == null) && this.isFunction(group)) {
      fn = group;
      group = "";
    } else {
      if (!group) {
        group = "";
      }
    }
    return [group, fn];
  };

  MiniEventEmitter.prototype.removeGroup = function(group) {
    var event, fns, ref;
    ref = this.mini.groups[group];
    for (event in ref) {
      fns = ref[event];
      this.removeFns(event, fns);
    }
    delete this.mini.groups[group];
    return this.mini;
  };

  MiniEventEmitter.prototype.removeFns = function(event, fns) {
    var fn, i, index, len;
    for (i = 0, len = fns.length; i < len; i++) {
      fn = fns[i];
      index = this.mini.events[event].indexOf(fn);
      this.mini.events[event].splice(index, 1);
    }
    if (this.mini.events[event].length === 0) {
      return delete this.mini.events[event];
    }
  };

  MiniEventEmitter.prototype.removeFn = function(event, group, fns, fn, index) {
    fns.splice(index, 1);
    if (fns.length === 0) {
      delete this.mini.groups[group][event];
    }
    if (0 === this.objLength(this.mini.groups[group])) {
      delete this.mini.groups[group];
    }
    index = this.mini.events[event].indexOf(fn);
    this.mini.events[event].splice(index, 1);
    if (this.mini.events[event].length === 0) {
      return delete this.mini.events[event];
    }
  };

  MiniEventEmitter.prototype.isString = function(event) {
    return typeof event === "string" || event instanceof String;
  };

  MiniEventEmitter.prototype.objLength = function(obj) {
    return Object.keys(obj).length;
  };

  MiniEventEmitter.prototype.isFunction = function(fn) {
    return typeof fn === "function";
  };

  return MiniEventEmitter;

})();

module.exports = MiniEventEmitter;