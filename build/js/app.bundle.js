(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Handler, MiniEventEmitter;

Handler = require("./handler");

MiniEventEmitter = (function() {
  function MiniEventEmitter(obj) {
    var handler;
    handler = new Handler(this, obj);
    this.on = handler.on;
    this.off = handler.off;
    this.emit = handler.emit;
    this.emitIf = handler.emitIf;
    this.trigger = handler.emit;
    this.triggerIf = handler.emitIf;
  }

  return MiniEventEmitter;

})();

module.exports = MiniEventEmitter;

},{"./handler":2}],2:[function(require,module,exports){
var MiniEventEmitter,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MiniEventEmitter = (function() {
  function MiniEventEmitter(mini, obj) {
    this.mini = mini;
    this.removeFn = bind(this.removeFn, this);
    this.removeFns = bind(this.removeFns, this);
    this.emit = bind(this.emit, this);
    this.emitIf = bind(this.emitIf, this);
    this.off = bind(this.off, this);
    this.on = bind(this.on, this);
    this.mini.settings = {
      name: (obj != null ? obj.name : void 0) || "MiniEventEmitter",
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
    if (arguments.length === 0) {
      return this.removeAll();
    }
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
      return this.removeFns(event, group, fns);
    }
    if (-1 === (index = fns.indexOf(fn))) {
      this.error("off", 2, event, group);
      return this.mini;
    }
    this.removeFn(event, group, fns, fn, index);
    return this.mini;
  };

  MiniEventEmitter.prototype.emitIf = function() {
    return this._emit(arguments, true);
  };

  MiniEventEmitter.prototype.emit = function() {
    return this._emit(arguments);
  };

  MiniEventEmitter.prototype._emit = function(args, skip) {
    var event, fn, fns, i;
    args = Array.from(args);
    event = args.shift();
    if (!(fns = this.validEvent(event, skip))) {
      return this.mini;
    }
    this.trace(event, args);
    for (i = fns.length - 1; i >= 0; i += -1) {
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

  MiniEventEmitter.prototype.validEvent = function(event, skip) {
    var fns;
    if (!event) {
      return this.error("emit", 3);
    }
    if (!this.isString(event)) {
      return this.error("emit", 1);
    }
    if (!(fns = this.mini.events[event])) {
      if (!skip) {
        this.error("emit", 4, event);
      }
      return null;
    }
    return fns;
  };

  MiniEventEmitter.prototype.error = function(name, id, event, group) {
    var msg;
    if (!this.mini.settings.error) {
      return null;
    }
    msg = this.mini.settings.name + " ~ " + name + " ~ ";
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
    return null;
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

  MiniEventEmitter.prototype.removeAll = function() {
    this.mini.events = {};
    this.mini.groups = {};
    return this.mini;
  };

  MiniEventEmitter.prototype.removeGroup = function(group) {
    var event, fns, ref;
    ref = this.mini.groups[group];
    for (event in ref) {
      fns = ref[event];
      this.removeFns(event, group, fns);
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.removeFns = function(event, group, fns) {
    var fn, i;
    for (i = fns.length - 1; i >= 0; i += -1) {
      fn = fns[i];
      this.removeFn(event, group, fns, fn);
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.removeFn = function(event, group, fns, fn, index) {
    if (!index) {
      index = fns.indexOf(fn);
    }
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

  MiniEventEmitter.prototype.trace = function(event, args) {
    var msg;
    if (this.mini.settings.trace) {
      msg = this.mini.settings.name + " ~ trace ~ " + event;
      if (args.length === 0) {
        if (console.debug) {
          return console.log("%c " + msg, "color: #13d");
        } else {
          return console.log(msg);
        }
      } else {
        if (console.debug) {
          return console.log("%c " + msg, "color: #13d", args);
        } else {
          return console.log(msg, args);
        }
      }
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9hcHAuanMiLCJidWlsZC9qcy9oYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgSGFuZGxlciwgTWluaUV2ZW50RW1pdHRlcjtcblxuSGFuZGxlciA9IHJlcXVpcmUoXCIuL2hhbmRsZXJcIik7XG5cbk1pbmlFdmVudEVtaXR0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIE1pbmlFdmVudEVtaXR0ZXIob2JqKSB7XG4gICAgdmFyIGhhbmRsZXI7XG4gICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKHRoaXMsIG9iaik7XG4gICAgdGhpcy5vbiA9IGhhbmRsZXIub247XG4gICAgdGhpcy5vZmYgPSBoYW5kbGVyLm9mZjtcbiAgICB0aGlzLmVtaXQgPSBoYW5kbGVyLmVtaXQ7XG4gICAgdGhpcy5lbWl0SWYgPSBoYW5kbGVyLmVtaXRJZjtcbiAgICB0aGlzLnRyaWdnZXIgPSBoYW5kbGVyLmVtaXQ7XG4gICAgdGhpcy50cmlnZ2VySWYgPSBoYW5kbGVyLmVtaXRJZjtcbiAgfVxuXG4gIHJldHVybiBNaW5pRXZlbnRFbWl0dGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlFdmVudEVtaXR0ZXI7XG4iLCJ2YXIgTWluaUV2ZW50RW1pdHRlcixcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbk1pbmlFdmVudEVtaXR0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIE1pbmlFdmVudEVtaXR0ZXIobWluaSwgb2JqKSB7XG4gICAgdGhpcy5taW5pID0gbWluaTtcbiAgICB0aGlzLnJlbW92ZUZuID0gYmluZCh0aGlzLnJlbW92ZUZuLCB0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUZucyA9IGJpbmQodGhpcy5yZW1vdmVGbnMsIHRoaXMpO1xuICAgIHRoaXMuZW1pdCA9IGJpbmQodGhpcy5lbWl0LCB0aGlzKTtcbiAgICB0aGlzLmVtaXRJZiA9IGJpbmQodGhpcy5lbWl0SWYsIHRoaXMpO1xuICAgIHRoaXMub2ZmID0gYmluZCh0aGlzLm9mZiwgdGhpcyk7XG4gICAgdGhpcy5vbiA9IGJpbmQodGhpcy5vbiwgdGhpcyk7XG4gICAgdGhpcy5taW5pLnNldHRpbmdzID0ge1xuICAgICAgbmFtZTogKG9iaiAhPSBudWxsID8gb2JqLm5hbWUgOiB2b2lkIDApIHx8IFwiTWluaUV2ZW50RW1pdHRlclwiLFxuICAgICAgZXJyb3I6IChvYmogIT0gbnVsbCA/IG9iai5lcnJvciA6IHZvaWQgMCkgfHwgZmFsc2UsXG4gICAgICB0cmFjZTogKG9iaiAhPSBudWxsID8gb2JqLnRyYWNlIDogdm9pZCAwKSB8fCBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5taW5pLmV2ZW50cyA9IHt9O1xuICAgIHRoaXMubWluaS5ncm91cHMgPSB7fTtcbiAgfVxuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnQsIGdyb3VwLCBmbikge1xuICAgIHZhciBldmVudHMsIGdyb3VwcywgcmVmO1xuICAgIHJlZiA9IHRoaXMub3B0aW9uYWwoZ3JvdXAsIGZuKSwgZ3JvdXAgPSByZWZbMF0sIGZuID0gcmVmWzFdO1xuICAgIGlmICghdGhpcy52YWxpZChcIm9uXCIsIGV2ZW50LCBncm91cCwgZm4pKSB7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICBpZiAoKGdyb3VwcyA9IHRoaXMubWluaS5ncm91cHMpW2dyb3VwXSkge1xuICAgICAgaWYgKGdyb3Vwc1tncm91cF1bZXZlbnRdKSB7XG4gICAgICAgIGdyb3Vwc1tncm91cF1bZXZlbnRdLnB1c2goZm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ3JvdXBzW2dyb3VwXVtldmVudF0gPSBbZm5dO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBncm91cHNbZ3JvdXBdID0ge307XG4gICAgICBncm91cHNbZ3JvdXBdW2V2ZW50XSA9IFtmbl07XG4gICAgfVxuICAgIGlmICgoZXZlbnRzID0gdGhpcy5taW5pLmV2ZW50cylbZXZlbnRdKSB7XG4gICAgICBldmVudHNbZXZlbnRdLnB1c2goZm4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudHNbZXZlbnRdID0gW2ZuXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbihldmVudCwgZ3JvdXAsIGZuKSB7XG4gICAgdmFyIGZucywgaW5kZXgsIHJlZjtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsKCk7XG4gICAgfVxuICAgIHJlZiA9IHRoaXMub3B0aW9uYWwoZ3JvdXAsIGZuKSwgZ3JvdXAgPSByZWZbMF0sIGZuID0gcmVmWzFdO1xuICAgIGlmICghdGhpcy52YWxpZChcIm9mZlwiLCBldmVudCwgZ3JvdXAsIGZuKSkge1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXSkge1xuICAgICAgdGhpcy5lcnJvcihcIm9mZlwiLCA3LCBldmVudCwgZ3JvdXApO1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgaWYgKCFldmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlR3JvdXAoZ3JvdXApO1xuICAgIH1cbiAgICBpZiAoIShmbnMgPSB0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXVtldmVudF0pKSB7XG4gICAgICB0aGlzLmVycm9yKFwib2ZmXCIsIDgsIGV2ZW50LCBncm91cCk7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICBpZiAoIWZuKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVGbnMoZXZlbnQsIGdyb3VwLCBmbnMpO1xuICAgIH1cbiAgICBpZiAoLTEgPT09IChpbmRleCA9IGZucy5pbmRleE9mKGZuKSkpIHtcbiAgICAgIHRoaXMuZXJyb3IoXCJvZmZcIiwgMiwgZXZlbnQsIGdyb3VwKTtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlRm4oZXZlbnQsIGdyb3VwLCBmbnMsIGZuLCBpbmRleCk7XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0SWYgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdChhcmd1bWVudHMsIHRydWUpO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdChhcmd1bWVudHMpO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLl9lbWl0ID0gZnVuY3Rpb24oYXJncywgc2tpcCkge1xuICAgIHZhciBldmVudCwgZm4sIGZucywgaTtcbiAgICBhcmdzID0gQXJyYXkuZnJvbShhcmdzKTtcbiAgICBldmVudCA9IGFyZ3Muc2hpZnQoKTtcbiAgICBpZiAoIShmbnMgPSB0aGlzLnZhbGlkRXZlbnQoZXZlbnQsIHNraXApKSkge1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgdGhpcy50cmFjZShldmVudCwgYXJncyk7XG4gICAgZm9yIChpID0gZm5zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSArPSAtMSkge1xuICAgICAgZm4gPSBmbnNbaV07XG4gICAgICBmbi5hcHBseShmbiwgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1pbmk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUudmFsaWQgPSBmdW5jdGlvbihuYW1lLCBldmVudCwgZ3JvdXAsIGZuKSB7XG4gICAgaWYgKG5hbWUgPT09IFwib25cIikge1xuICAgICAgaWYgKCF0aGlzLmlzU3RyaW5nKGV2ZW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCAxKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pc1N0cmluZyhncm91cCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNGdW5jdGlvbihmbikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNiwgZXZlbnQsIGdyb3VwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hbWUgPT09IFwib2ZmXCIpIHtcbiAgICAgIGlmIChldmVudCAhPT0gbnVsbCAmJiAhdGhpcy5pc1N0cmluZyhldmVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNTdHJpbmcoZ3JvdXApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yKG5hbWUsIDUpO1xuICAgICAgfVxuICAgICAgaWYgKGZuICYmICF0aGlzLmlzRnVuY3Rpb24oZm4pKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yKG5hbWUsIDYsIGV2ZW50LCBncm91cCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnZhbGlkRXZlbnQgPSBmdW5jdGlvbihldmVudCwgc2tpcCkge1xuICAgIHZhciBmbnM7XG4gICAgaWYgKCFldmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3IoXCJlbWl0XCIsIDMpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvcihcImVtaXRcIiwgMSk7XG4gICAgfVxuICAgIGlmICghKGZucyA9IHRoaXMubWluaS5ldmVudHNbZXZlbnRdKSkge1xuICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoXCJlbWl0XCIsIDQsIGV2ZW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZm5zO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24obmFtZSwgaWQsIGV2ZW50LCBncm91cCkge1xuICAgIHZhciBtc2c7XG4gICAgaWYgKCF0aGlzLm1pbmkuc2V0dGluZ3MuZXJyb3IpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBtc2cgPSB0aGlzLm1pbmkuc2V0dGluZ3MubmFtZSArIFwiIH4gXCIgKyBuYW1lICsgXCIgfiBcIjtcbiAgICBpZiAoaWQgPT09IDEpIHtcbiAgICAgIG1zZyArPSBcIkV2ZW50IG5hbWUgbXVzdCBiZSBhIHN0cmluZ1wiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDIpIHtcbiAgICAgIG1zZyArPSBcIlByb3ZpZGVkIGZ1bmN0aW9uIHRvIHJlbW92ZSB3aXRoIGV2ZW50IFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGluIGdyb3VwIFxcXCJcIiArIGdyb3VwICsgXCJcXFwiIGlzIG5vdCBmb3VuZFwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDMpIHtcbiAgICAgIG1zZyArPSBcIkV2ZW50IHdhcyBub3QgcHJvdmlkZWRcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA0KSB7XG4gICAgICBtc2cgKz0gXCJFdmVudExpc3RlbmVyIGZvciBldmVudCBcXFwiXCIgKyBldmVudCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdFwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDUpIHtcbiAgICAgIG1zZyArPSBcIlByb3ZpZGVkIGdyb3VwIG11c3QgYmUgYSBzdHJpbmdcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA2KSB7XG4gICAgICBtc2cgKz0gXCJUaGUgbGFzdCBwYXJhbSBwcm92aWRlZCB3aXRoIGV2ZW50IFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGFuZCBncm91cCBcXFwiXCIgKyBncm91cCArIFwiXFxcIiBpcyBleHBlY3RlZCB0byBiZSBhIGZ1bmN0aW9uXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gNykge1xuICAgICAgbXNnICs9IFwiUHJvdmlkZWQgZ3JvdXAgXFxcIlwiICsgZ3JvdXAgKyBcIlxcXCIgaXMgbm90IGZvdW5kXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gOCkge1xuICAgICAgbXNnICs9IFwiRXZlbnQgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIgZG9lcyBub3QgZXhpc3QgZm9yIHRoZSBwcm92aWRlZCBncm91cCBcXFwiXCIgKyBncm91cCArIFwiXFxcIlwiO1xuICAgIH1cbiAgICBpZiAoY29uc29sZSkge1xuICAgICAgaWYgKGNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4obXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9wdGlvbmFsID0gZnVuY3Rpb24oZ3JvdXAsIGZuKSB7XG4gICAgaWYgKChmbiA9PSBudWxsKSAmJiB0aGlzLmlzRnVuY3Rpb24oZ3JvdXApKSB7XG4gICAgICBmbiA9IGdyb3VwO1xuICAgICAgZ3JvdXAgPSBcIlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWdyb3VwKSB7XG4gICAgICAgIGdyb3VwID0gXCJcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtncm91cCwgZm5dO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWluaS5ldmVudHMgPSB7fTtcbiAgICB0aGlzLm1pbmkuZ3JvdXBzID0ge307XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVHcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgdmFyIGV2ZW50LCBmbnMsIHJlZjtcbiAgICByZWYgPSB0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXTtcbiAgICBmb3IgKGV2ZW50IGluIHJlZikge1xuICAgICAgZm5zID0gcmVmW2V2ZW50XTtcbiAgICAgIHRoaXMucmVtb3ZlRm5zKGV2ZW50LCBncm91cCwgZm5zKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVGbnMgPSBmdW5jdGlvbihldmVudCwgZ3JvdXAsIGZucykge1xuICAgIHZhciBmbiwgaTtcbiAgICBmb3IgKGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpICs9IC0xKSB7XG4gICAgICBmbiA9IGZuc1tpXTtcbiAgICAgIHRoaXMucmVtb3ZlRm4oZXZlbnQsIGdyb3VwLCBmbnMsIGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVGbiA9IGZ1bmN0aW9uKGV2ZW50LCBncm91cCwgZm5zLCBmbiwgaW5kZXgpIHtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICBpbmRleCA9IGZucy5pbmRleE9mKGZuKTtcbiAgICB9XG4gICAgZm5zLnNwbGljZShpbmRleCwgMSk7XG4gICAgaWYgKGZucy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlbGV0ZSB0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXVtldmVudF07XG4gICAgfVxuICAgIGlmICgwID09PSB0aGlzLm9iakxlbmd0aCh0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXSkpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXTtcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XS5pbmRleE9mKGZuKTtcbiAgICB0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmICh0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBkZWxldGUgdGhpcy5taW5pLmV2ZW50c1tldmVudF07XG4gICAgfVxuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnRyYWNlID0gZnVuY3Rpb24oZXZlbnQsIGFyZ3MpIHtcbiAgICB2YXIgbXNnO1xuICAgIGlmICh0aGlzLm1pbmkuc2V0dGluZ3MudHJhY2UpIHtcbiAgICAgIG1zZyA9IHRoaXMubWluaS5zZXR0aW5ncy5uYW1lICsgXCIgfiB0cmFjZSB+IFwiICsgZXZlbnQ7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaWYgKGNvbnNvbGUuZGVidWcpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCIlYyBcIiArIG1zZywgXCJjb2xvcjogIzEzZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNvbnNvbGUuZGVidWcpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCIlYyBcIiArIG1zZywgXCJjb2xvcjogIzEzZFwiLCBhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2cobXNnLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5pc1N0cmluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBldmVudCA9PT0gXCJzdHJpbmdcIiB8fCBldmVudCBpbnN0YW5jZW9mIFN0cmluZztcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vYmpMZW5ndGggPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiO1xuICB9O1xuXG4gIHJldHVybiBNaW5pRXZlbnRFbWl0dGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlFdmVudEVtaXR0ZXI7XG4iXX0=
