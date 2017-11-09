var Handler, MiniEventEmitter, Panel;

Panel = require("./panel");

Handler = require("./handler");

MiniEventEmitter = (function() {
  function MiniEventEmitter(obj) {
    var handler, panel;
    handler = new Handler(this, obj);
    panel = new Panel(this);
    this.on = handler.on;
    this.off = handler.off;
    this.emit = handler.emit;
    this.emitIf = handler.emitIf;
    this.trigger = handler.emit;
    this.triggerIf = handler.emitIf;
    this.panel = panel.panel;
  }

  return MiniEventEmitter;

})();

module.exports = MiniEventEmitter;
