var Handler, MiniEventEmitter;

Handler = require("./handler");

MiniEventEmitter = (function() {
  function MiniEventEmitter(obj) {
    var handler;
    handler = new Handler(this, obj);
    this.on = handler.on;
    this.off = handler.off;
    this.emit = handler.emit;
    this.trigger = handler.emit;
  }

  return MiniEventEmitter;

})();

module.exports = MiniEventEmitter;
