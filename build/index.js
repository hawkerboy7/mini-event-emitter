var MiniEventEmitter;

MiniEventEmitter = (function() {
  var _emit, error, isFunction, isString, objLength, optional;

  function MiniEventEmitter(obj) {
    this.settings = {
      error: (obj != null ? obj.error : void 0) || false,
      trace: (obj != null ? obj.trace : void 0) || false,
      worker: (obj != null ? obj.worker : void 0) || null
    };
    this.events = {};
    this.groups = {};
    if (!this.settings.worker) {
      return;
    }
    this.worker = webworkify(this.settings.worker);
    this.worker.addEventListener('message', (function(_this) {
      return function(arg) {
        var data;
        data = arg.data;
        return _emit({
          self: _this,
          args: data.args,
          event: data.event,
          internal: true
        });
      };
    })(this));
  }

  MiniEventEmitter.prototype.on = function(event, group, fn) {
    var ref;
    ref = optional(group, fn), group = ref[0], fn = ref[1];
    if (!isString(event)) {
      return error(this, 'on', 1);
    }
    if (!isString(group)) {
      return error(this, 'on', 5);
    }
    if (!isFunction(fn)) {
      return error(this, 'on', 6, event, group);
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
        var action, i, index, len;
        for (i = 0, len = actions.length; i < len; i++) {
          action = actions[i];
          index = _this.events[event].indexOf(action);
          _this.events[event].splice(index, 1);
        }
        if (_this.events[event].length === 0) {
          return delete _this.events[event];
        }
      };
    })(this);
    ref = optional(group, fn), group = ref[0], fn = ref[1];
    if (event && !isString(event)) {
      return error(this, 'off', 1);
    }
    if (!isString(group)) {
      return error(this, 'off', 5);
    }
    if (fn && !isFunction(fn)) {
      return error(this, 'off', 6, event, group);
    }
    if (event && !this.groups[group]) {
      return error(this, 'off', 7, event, group);
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
      msg += "Provided group must be a string";
    }
    if (id === 6) {
      msg += "The last param provided with event \"" + event + "\" and group \"" + group + "\" is expected to be a function";
    }
    if (id === 7) {
      msg += "Provided Group \"" + group + "\" doesn't have any events";
    }
    if (console.warn) {
      console.warn(msg);
    } else {
      console.log(msg);
    }
    return self;
  };

  optional = function(group, fn) {
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

  _emit = function(arg) {
    var action, args, event, i, internal, len, list, msg, self;
    self = arg.self, event = arg.event, args = arg.args, internal = arg.internal;
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
      self.worker.postMessage({
        args: args,
        event: event
      });
    } else {
      if (self.settings.trace) {
        msg = "MiniEventEmitter ~ trace ~ " + event;
        if (console.debug) {
          console.debug(msg);
        } else {
          console.log(msg);
        }
      }
      for (i = 0, len = list.length; i < len; i++) {
        action = list[i];
        action.apply(action, args);
      }
    }
    return self;
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
