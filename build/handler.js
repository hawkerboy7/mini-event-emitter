var MiniEventEmitter;

MiniEventEmitter = (function() {
  var _emit, error, isFunction, isString, objLength, optional, removeFn;

  function MiniEventEmitter(mini, obj) {
    var webworkify;
    this.mini = mini;
    this.mini.settings = {
      error: (obj != null ? obj.error : void 0) || false,
      trace: (obj != null ? obj.trace : void 0) || false,
      worker: (obj != null ? obj.worker : void 0) || null
    };
    this.mini.events = {};
    this.mini.groups = {};
    if (!this.mini.settings.worker) {
      return;
    }
    if (!webworkify && !(webworkify = obj != null ? obj.webworkify : void 0)) {
      return;
    }
    this.mini.worker = webworkify(this.settings.worker);
    this.mini.worker.addEventListener("message", (function(_this) {
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
      return error(this, "on", 1);
    }
    if (!isString(group)) {
      return error(this, "on", 5);
    }
    if (!isFunction(fn)) {
      return error(this, "on", 6, event, group);
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
    var actions, index1, index2, ref, ref1;
    ref = optional(group, fn), group = ref[0], fn = ref[1];
    if (event && !isString(event)) {
      return error(this, "off", 1);
    }
    if (!isString(group)) {
      return error(this, "off", 5);
    }
    if (fn && !isFunction(fn)) {
      return error(this, "off", 6, event, group);
    }
    if (event && !this.groups[group]) {
      return error(this, "off", 7, event, group);
    }
    if (!event) {
      ref1 = this.groups[group];
      for (event in ref1) {
        actions = ref1[event];
        removeFn(this, event, actions);
      }
      delete this.groups[group];
      return this;
    }
    if (!(actions = this.groups[group][event])) {
      return error(this, "off", 4, event, group);
    }
    if (!fn) {
      removeFn(this, event, actions);
      delete this.groups[group][event];
      if (0 === objLength(this.groups[group])) {
        delete this.groups[group];
      }
      return this;
    }
    if (-1 === (index1 = actions.indexOf(fn))) {
      return error(this, "off", 2, event, group);
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

  MiniEventEmitter.prototype.offGroup = function(name) {
    var actions, event, group;
    if (name && !isString(name)) {
      return error(this, "offGroup", 5);
    }
    if (!(group = this.groups[name])) {
      return error(this, "offGroup", 7);
    }
    for (event in group) {
      actions = group[event];
      removeFn(this, event, actions);
    }
    delete this.groups[name];
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

  isString = function(event) {
    return typeof event === "string" || event instanceof String;
  };

  objLength = function(obj) {
    return Object.keys(obj).length;
  };

  isFunction = function(fn) {
    return typeof fn === "function";
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
      msg += "EventListener for event \"" + event + "\" does not exist";
    }
    if (id === 5) {
      msg += "Provided group must be a string";
    }
    if (id === 6) {
      msg += "The last param provided with event \"" + event + "\" and group \"" + group + "\" is expected to be a function";
    }
    if (id === 7) {
      msg += "Provided Group \"" + group + "\" does not have any events";
    }
    if (console) {
      if (console.warn) {
        console.warn(msg);
      } else {
        console.log(msg);
      }
    }
    return self;
  };

  optional = function(group, fn) {
    if ((fn == null) && isFunction(group)) {
      fn = group;
      group = "";
    } else {
      if (!group) {
        group = "";
      }
    }
    return [group, fn];
  };

  removeFn = function(self, event, actions) {
    var action, i, index, len;
    for (i = 0, len = actions.length; i < len; i++) {
      action = actions[i];
      index = self.events[event].indexOf(action);
      self.events[event].splice(index, 1);
    }
    if (self.events[event].length === 0) {
      return delete self.events[event];
    }
  };

  _emit = function(arg) {
    var action, args, argumenten, event, i, internal, len, list, msg, self;
    self = arg.self, event = arg.event, args = arg.args, internal = arg.internal;
    if (!event) {
      return error(self, "emit", 3);
    }
    if (!isString(event)) {
      return error(self, "emit", 1);
    }
    if (!(list = self.events[event])) {
      return error(self, "emit", 4, event);
    }
    if (self.settings.worker && !internal) {
      self.worker.postMessage({
        args: args,
        event: event
      });
    } else {
      if (self.settings.trace) {
        msg = "MiniEventEmitter ~ trace ~ " + event;
        if ((argumenten = args.length === 0 ? null : args)) {
          if (console.debug) {
            console.log("%c " + msg, "color: #13d", argumenten);
          } else {
            console.log(msg, argumenten);
          }
        } else {
          if (console.debug) {
            console.log("%c " + msg, "color: #13d");
          } else {
            console.log(msg);
          }
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

module.exports = MiniEventEmitter;
