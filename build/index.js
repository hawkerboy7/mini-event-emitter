var MiniEventEmitter;

MiniEventEmitter = (function() {
  var _emit, check, error, isFunction, isString, objLength;

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
      msg += "Group \"" + group + "\" with event \"" + event + "\" does not exists";
    }
    if (id === 9) {
      msg += "Event \"" + event + "\" does not exist in group \"" + group + "\"";
    }
    if (console.warn) {
      console.warn(msg);
    } else {
      console.log(msg);
    }
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

  _emit = function(arg1) {
    var action, args, event, internal, j, len, list, msg, self;
    self = arg1.self, event = arg1.event, args = arg1.args, internal = arg1.internal;
    if (!event) {
      return error(self, 'emit', 3);
    }
    if (!isString(event)) {
      return error(self, 'emit', 1);
    }
    if (!(list = self.events[event])) {
      return error(self, 'emit', 4, event);
    }
    if (self.settings.worker && !internal) {
      self.worker.postMessage(JSON.stringify({
        args: args,
        event: event
      }));
    } else {
      if (self.settings.trace) {
        msg = "MiniEventEmitter ~ trace ~ " + event;
        if (console.debug) {
          console.debug(msg);
        } else {
          console.log(msg);
        }
      }
      for (j = 0, len = list.length; j < len; j++) {
        action = list[j];
        action.apply(action, args);
      }
    }
    return this;
  };

  function MiniEventEmitter(obj) {
    this.settings = {
      error: obj != null ? obj.error : void 0,
      trace: obj != null ? obj.trace : void 0,
      worker: obj != null ? obj.worker : void 0
    };
    this.events = {};
    this.groups = {};
    if (!this.settings.worker) {
      return;
    }
    this.worker = webworkify(this.settings.worker);
    this.worker.addEventListener('message', (function(_this) {
      return function(arg1) {
        var action, actions, arg, args, data, eventName, i, j, len, ref, results;
        data = arg1.data;
        args = [];
        ref = JSON.parse(data);
        for (i in ref) {
          arg = ref[i];
          args[i] = arg;
        }
        eventName = args.shift();
        if (!(actions = _this.events[eventName])) {
          return console.log("Event: '" + eventName + "' not found");
        }
        results = [];
        for (j = 0, len = actions.length; j < len; j++) {
          action = actions[j];
          results.push(action.apply(action, args));
        }
        return results;
      };
    })(this));
  }

  MiniEventEmitter.prototype.on = function(event, group, fn) {
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

  MiniEventEmitter.prototype.off = function(event, group, fn) {
    var actions, index1, index2, ref, ref1, removeFn;
    removeFn = (function(_this) {
      return function() {
        var action, index, j, len;
        for (j = 0, len = actions.length; j < len; j++) {
          action = actions[j];
          index = _this.events[event].indexOf(action);
          _this.events[event].splice(index, 1);
        }
        if (_this.events[event].length === 0) {
          return delete _this.events[event];
        }
      };
    })(this);
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
    if (!this.groups[group]) {
      return error(this, 'off', 8, event, group);
    }
    if (!event) {
      ref1 = this.groups[group];
      for (event in ref1) {
        actions = ref1[event];
        removeFn();
      }
      delete this.groups[group];
      return this;
    }
    if (!(actions = this.groups[group][event])) {
      return error(this, 'off', 4, event, group);
    }
    if (!fn) {
      removeFn();
      delete this.groups[group][event];
      if (0 === objLength(this.groups[group])) {
        delete this.groups[group];
      }
      return this;
    }
    if (-1 === (index1 = actions.indexOf(fn))) {
      return error(this, 'off', 2, event, group);
    }
    actions.splice(index1, 1);
    if (actions.length === 0) {
      delete this.groups[group][event];
    }
    if (0 === objLength(this.groups[group])) {
      delete this.groups[group];
    }
    index2 = this.events[event].indexOf(fn);
    this.events[event].splice(index2, 1);
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
    return this;
  };

  MiniEventEmitter.prototype.emit = function() {
    var args, event;
    args = Array.from(arguments);
    event = args.shift();
    return _emit({
      self: this,
      args: args,
      event: event,
      internal: false
    });
  };

  MiniEventEmitter.prototype.trigger = function() {
    this.emit.apply(this, arguments);
    return this;
  };

  return MiniEventEmitter;

})();

(function() {
  var msg;
  if ((typeof module !== "undefined" && module !== null) && module.exports) {
    return module.exports = MiniEventEmitter;
  } else if (window) {
    return window.MiniEventEmitter = MiniEventEmitter;
  } else {
    msg = "Cannot expose MiniEventEmitter";
    if (console.warn) {
      return console.warn(msg);
    } else {
      return console.log(msg);
    }
  }
})();
