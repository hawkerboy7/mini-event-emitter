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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9jbGllbnQvanMvYXBwLmpzIiwiYnVpbGQvY2xpZW50L2pzL2hhbmRsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBIYW5kbGVyLCBNaW5pRXZlbnRFbWl0dGVyO1xuXG5IYW5kbGVyID0gcmVxdWlyZShcIi4vaGFuZGxlclwiKTtcblxuTWluaUV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gTWluaUV2ZW50RW1pdHRlcihvYmopIHtcbiAgICB2YXIgaGFuZGxlcjtcbiAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIodGhpcywgb2JqKTtcbiAgICB0aGlzLm9uID0gaGFuZGxlci5vbjtcbiAgICB0aGlzLm9mZiA9IGhhbmRsZXIub2ZmO1xuICAgIHRoaXMuZW1pdCA9IGhhbmRsZXIuZW1pdDtcbiAgICB0aGlzLmVtaXRJZiA9IGhhbmRsZXIuZW1pdElmO1xuICAgIHRoaXMudHJpZ2dlciA9IGhhbmRsZXIuZW1pdDtcbiAgICB0aGlzLnRyaWdnZXJJZiA9IGhhbmRsZXIuZW1pdElmO1xuICB9XG5cbiAgcmV0dXJuIE1pbmlFdmVudEVtaXR0ZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWluaUV2ZW50RW1pdHRlcjtcbiIsInZhciBNaW5pRXZlbnRFbWl0dGVyLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuTWluaUV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gTWluaUV2ZW50RW1pdHRlcihtaW5pLCBvYmopIHtcbiAgICB0aGlzLm1pbmkgPSBtaW5pO1xuICAgIHRoaXMucmVtb3ZlRm4gPSBiaW5kKHRoaXMucmVtb3ZlRm4sIHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlRm5zID0gYmluZCh0aGlzLnJlbW92ZUZucywgdGhpcyk7XG4gICAgdGhpcy5lbWl0ID0gYmluZCh0aGlzLmVtaXQsIHRoaXMpO1xuICAgIHRoaXMuZW1pdElmID0gYmluZCh0aGlzLmVtaXRJZiwgdGhpcyk7XG4gICAgdGhpcy5vZmYgPSBiaW5kKHRoaXMub2ZmLCB0aGlzKTtcbiAgICB0aGlzLm9uID0gYmluZCh0aGlzLm9uLCB0aGlzKTtcbiAgICB0aGlzLm1pbmkuc2V0dGluZ3MgPSB7XG4gICAgICBuYW1lOiAob2JqICE9IG51bGwgPyBvYmoubmFtZSA6IHZvaWQgMCkgfHwgXCJNaW5pRXZlbnRFbWl0dGVyXCIsXG4gICAgICBlcnJvcjogKG9iaiAhPSBudWxsID8gb2JqLmVycm9yIDogdm9pZCAwKSB8fCBmYWxzZSxcbiAgICAgIHRyYWNlOiAob2JqICE9IG51bGwgPyBvYmoudHJhY2UgOiB2b2lkIDApIHx8IGZhbHNlXG4gICAgfTtcbiAgICB0aGlzLm1pbmkuZXZlbnRzID0ge307XG4gICAgdGhpcy5taW5pLmdyb3VwcyA9IHt9O1xuICB9XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgZ3JvdXAsIGZuKSB7XG4gICAgdmFyIGV2ZW50cywgZ3JvdXBzLCByZWY7XG4gICAgcmVmID0gdGhpcy5vcHRpb25hbChncm91cCwgZm4pLCBncm91cCA9IHJlZlswXSwgZm4gPSByZWZbMV07XG4gICAgaWYgKCF0aGlzLnZhbGlkKFwib25cIiwgZXZlbnQsIGdyb3VwLCBmbikpIHtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIGlmICgoZ3JvdXBzID0gdGhpcy5taW5pLmdyb3VwcylbZ3JvdXBdKSB7XG4gICAgICBpZiAoZ3JvdXBzW2dyb3VwXVtldmVudF0pIHtcbiAgICAgICAgZ3JvdXBzW2dyb3VwXVtldmVudF0ucHVzaChmbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncm91cHNbZ3JvdXBdW2V2ZW50XSA9IFtmbl07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3Vwc1tncm91cF0gPSB7fTtcbiAgICAgIGdyb3Vwc1tncm91cF1bZXZlbnRdID0gW2ZuXTtcbiAgICB9XG4gICAgaWYgKChldmVudHMgPSB0aGlzLm1pbmkuZXZlbnRzKVtldmVudF0pIHtcbiAgICAgIGV2ZW50c1tldmVudF0ucHVzaChmbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50c1tldmVudF0gPSBbZm5dO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50LCBncm91cCwgZm4pIHtcbiAgICB2YXIgZm5zLCBpbmRleCwgcmVmO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVBbGwoKTtcbiAgICB9XG4gICAgcmVmID0gdGhpcy5vcHRpb25hbChncm91cCwgZm4pLCBncm91cCA9IHJlZlswXSwgZm4gPSByZWZbMV07XG4gICAgaWYgKCF0aGlzLnZhbGlkKFwib2ZmXCIsIGV2ZW50LCBncm91cCwgZm4pKSB7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubWluaS5ncm91cHNbZ3JvdXBdKSB7XG4gICAgICB0aGlzLmVycm9yKFwib2ZmXCIsIDcsIGV2ZW50LCBncm91cCk7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVHcm91cChncm91cCk7XG4gICAgfVxuICAgIGlmICghKGZucyA9IHRoaXMubWluaS5ncm91cHNbZ3JvdXBdW2V2ZW50XSkpIHtcbiAgICAgIHRoaXMuZXJyb3IoXCJvZmZcIiwgOCwgZXZlbnQsIGdyb3VwKTtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIGlmICghZm4pIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbW92ZUZucyhldmVudCwgZ3JvdXAsIGZucyk7XG4gICAgfVxuICAgIGlmICgtMSA9PT0gKGluZGV4ID0gZm5zLmluZGV4T2YoZm4pKSkge1xuICAgICAgdGhpcy5lcnJvcihcIm9mZlwiLCAyLCBldmVudCwgZ3JvdXApO1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVGbihldmVudCwgZ3JvdXAsIGZucywgZm4sIGluZGV4KTtcbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRJZiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9lbWl0KGFyZ3VtZW50cywgdHJ1ZSk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9lbWl0KGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2VtaXQgPSBmdW5jdGlvbihhcmdzLCBza2lwKSB7XG4gICAgdmFyIGV2ZW50LCBmbiwgZm5zLCBpO1xuICAgIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3MpO1xuICAgIGV2ZW50ID0gYXJncy5zaGlmdCgpO1xuICAgIGlmICghKGZucyA9IHRoaXMudmFsaWRFdmVudChldmVudCwgc2tpcCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICB0aGlzLnRyYWNlKGV2ZW50LCBhcmdzKTtcbiAgICBmb3IgKGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpICs9IC0xKSB7XG4gICAgICBmbiA9IGZuc1tpXTtcbiAgICAgIGZuLmFwcGx5KGZuLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS52YWxpZCA9IGZ1bmN0aW9uKG5hbWUsIGV2ZW50LCBncm91cCwgZm4pIHtcbiAgICBpZiAobmFtZSA9PT0gXCJvblwiKSB7XG4gICAgICBpZiAoIXRoaXMuaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yKG5hbWUsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmlzU3RyaW5nKGdyb3VwKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCA1KTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCA2LCBldmVudCwgZ3JvdXApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmFtZSA9PT0gXCJvZmZcIikge1xuICAgICAgaWYgKGV2ZW50ICE9PSBudWxsICYmICF0aGlzLmlzU3RyaW5nKGV2ZW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCAxKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pc1N0cmluZyhncm91cCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNSk7XG4gICAgICB9XG4gICAgICBpZiAoZm4gJiYgIXRoaXMuaXNGdW5jdGlvbihmbikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNiwgZXZlbnQsIGdyb3VwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUudmFsaWRFdmVudCA9IGZ1bmN0aW9uKGV2ZW50LCBza2lwKSB7XG4gICAgdmFyIGZucztcbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvcihcImVtaXRcIiwgMyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1N0cmluZyhldmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVycm9yKFwiZW1pdFwiLCAxKTtcbiAgICB9XG4gICAgaWYgKCEoZm5zID0gdGhpcy5taW5pLmV2ZW50c1tldmVudF0pKSB7XG4gICAgICBpZiAoIXNraXApIHtcbiAgICAgICAgdGhpcy5lcnJvcihcImVtaXRcIiwgNCwgZXZlbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBmbnM7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihuYW1lLCBpZCwgZXZlbnQsIGdyb3VwKSB7XG4gICAgdmFyIG1zZztcbiAgICBpZiAoIXRoaXMubWluaS5zZXR0aW5ncy5lcnJvcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG1zZyA9IHRoaXMubWluaS5zZXR0aW5ncy5uYW1lICsgXCIgfiBcIiArIG5hbWUgKyBcIiB+IFwiO1xuICAgIGlmIChpZCA9PT0gMSkge1xuICAgICAgbXNnICs9IFwiRXZlbnQgbmFtZSBtdXN0IGJlIGEgc3RyaW5nXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gMikge1xuICAgICAgbXNnICs9IFwiUHJvdmlkZWQgZnVuY3Rpb24gdG8gcmVtb3ZlIHdpdGggZXZlbnQgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIgaW4gZ3JvdXAgXFxcIlwiICsgZ3JvdXAgKyBcIlxcXCIgaXMgbm90IGZvdW5kXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gMykge1xuICAgICAgbXNnICs9IFwiRXZlbnQgd2FzIG5vdCBwcm92aWRlZFwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDQpIHtcbiAgICAgIG1zZyArPSBcIkV2ZW50TGlzdGVuZXIgZm9yIGV2ZW50IFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGRvZXMgbm90IGV4aXN0XCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gNSkge1xuICAgICAgbXNnICs9IFwiUHJvdmlkZWQgZ3JvdXAgbXVzdCBiZSBhIHN0cmluZ1wiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDYpIHtcbiAgICAgIG1zZyArPSBcIlRoZSBsYXN0IHBhcmFtIHByb3ZpZGVkIHdpdGggZXZlbnQgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIgYW5kIGdyb3VwIFxcXCJcIiArIGdyb3VwICsgXCJcXFwiIGlzIGV4cGVjdGVkIHRvIGJlIGEgZnVuY3Rpb25cIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA3KSB7XG4gICAgICBtc2cgKz0gXCJQcm92aWRlZCBncm91cCBcXFwiXCIgKyBncm91cCArIFwiXFxcIiBpcyBub3QgZm91bmRcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA4KSB7XG4gICAgICBtc2cgKz0gXCJFdmVudCBcXFwiXCIgKyBldmVudCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdCBmb3IgdGhlIHByb3ZpZGVkIGdyb3VwIFxcXCJcIiArIGdyb3VwICsgXCJcXFwiXCI7XG4gICAgfVxuICAgIGlmIChjb25zb2xlKSB7XG4gICAgICBpZiAoY29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUub3B0aW9uYWwgPSBmdW5jdGlvbihncm91cCwgZm4pIHtcbiAgICBpZiAoKGZuID09IG51bGwpICYmIHRoaXMuaXNGdW5jdGlvbihncm91cCkpIHtcbiAgICAgIGZuID0gZ3JvdXA7XG4gICAgICBncm91cCA9IFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghZ3JvdXApIHtcbiAgICAgICAgZ3JvdXAgPSBcIlwiO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW2dyb3VwLCBmbl07XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5taW5pLmV2ZW50cyA9IHt9O1xuICAgIHRoaXMubWluaS5ncm91cHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcbiAgICB2YXIgZXZlbnQsIGZucywgcmVmO1xuICAgIHJlZiA9IHRoaXMubWluaS5ncm91cHNbZ3JvdXBdO1xuICAgIGZvciAoZXZlbnQgaW4gcmVmKSB7XG4gICAgICBmbnMgPSByZWZbZXZlbnRdO1xuICAgICAgdGhpcy5yZW1vdmVGbnMoZXZlbnQsIGdyb3VwLCBmbnMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUZucyA9IGZ1bmN0aW9uKGV2ZW50LCBncm91cCwgZm5zKSB7XG4gICAgdmFyIGZuLCBpO1xuICAgIGZvciAoaSA9IGZucy5sZW5ndGggLSAxOyBpID49IDA7IGkgKz0gLTEpIHtcbiAgICAgIGZuID0gZm5zW2ldO1xuICAgICAgdGhpcy5yZW1vdmVGbihldmVudCwgZ3JvdXAsIGZucywgZm4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUZuID0gZnVuY3Rpb24oZXZlbnQsIGdyb3VwLCBmbnMsIGZuLCBpbmRleCkge1xuICAgIGlmICghaW5kZXgpIHtcbiAgICAgIGluZGV4ID0gZm5zLmluZGV4T2YoZm4pO1xuICAgIH1cbiAgICBmbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBpZiAoZm5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZGVsZXRlIHRoaXMubWluaS5ncm91cHNbZ3JvdXBdW2V2ZW50XTtcbiAgICB9XG4gICAgaWYgKDAgPT09IHRoaXMub2JqTGVuZ3RoKHRoaXMubWluaS5ncm91cHNbZ3JvdXBdKSkge1xuICAgICAgZGVsZXRlIHRoaXMubWluaS5ncm91cHNbZ3JvdXBdO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubWluaS5ldmVudHNbZXZlbnRdLmluZGV4T2YoZm4pO1xuICAgIHRoaXMubWluaS5ldmVudHNbZXZlbnRdLnNwbGljZShpbmRleCwgMSk7XG4gICAgaWYgKHRoaXMubWluaS5ldmVudHNbZXZlbnRdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGRlbGV0ZSB0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XTtcbiAgICB9XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUudHJhY2UgPSBmdW5jdGlvbihldmVudCwgYXJncykge1xuICAgIHZhciBtc2c7XG4gICAgaWYgKHRoaXMubWluaS5zZXR0aW5ncy50cmFjZSkge1xuICAgICAgbXNnID0gdGhpcy5taW5pLnNldHRpbmdzLm5hbWUgKyBcIiB+IHRyYWNlIH4gXCIgKyBldmVudDtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoY29uc29sZS5kZWJ1Zykge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIiVjIFwiICsgbXNnLCBcImNvbG9yOiAjMTNkXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY29uc29sZS5kZWJ1Zykge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIiVjIFwiICsgbXNnLCBcImNvbG9yOiAjMTNkXCIsIGFyZ3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtc2csIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLmlzU3RyaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICByZXR1cm4gdHlwZW9mIGV2ZW50ID09PSBcInN0cmluZ1wiIHx8IGV2ZW50IGluc3RhbmNlb2YgU3RyaW5nO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9iakxlbmd0aCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5pc0Z1bmN0aW9uID0gZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCI7XG4gIH07XG5cbiAgcmV0dXJuIE1pbmlFdmVudEVtaXR0ZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWluaUV2ZW50RW1pdHRlcjtcbiJdfQ==
