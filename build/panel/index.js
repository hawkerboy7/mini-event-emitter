var Close, Move, Panel,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Move = require("./move");

Close = require("./close");

Panel = (function() {
  function Panel(mini) {
    this.mini = mini;
    this.panel = bind(this.panel, this);
    if (typeof document === "undefined" || document === null) {
      return;
    }
    this.setup();
    this.render();
  }

  Panel.prototype.panel = function(arg) {
    if (typeof document === "undefined" || document === null) {
      return;
    }
    this.toggle = arg == null ? !this.toggle : !!arg;
    if (this.toggle) {
      return document.body.appendChild(this.container);
    } else {
      return this.container.remove();
    }
  };

  Panel.prototype.setup = function() {
    this.toggle = false;
    this.width = this.mini.settings.panel.width;
    return this.height = this.mini.settings.panel.height;
  };

  Panel.prototype.render = function() {
    this.container = document.createElement("div");
    this.container.style.cssText = "position:fixed;box-sizing:border-box;top:50%;left:50%;width:" + this.width + "px;height:" + this.height + "px;margin-top:-" + (this.height / 2) + "px;margin-left:-" + (this.width / 2) + "px;background-color:rgba(255,255,255,0.7);z-index:9999;border:1px solid #bbb;border-radius:3px;will-change:transform;";
    new Move(this.container);
    return new Close(this, this.container);
  };

  return Panel;

})();

module.exports = Panel;
