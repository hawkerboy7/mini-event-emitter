var Close,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Close = (function() {
  function Close(panel, container) {
    this.panel = panel;
    this.container = container;
    this.leave = bind(this.leave, this);
    this.enter = bind(this.enter, this);
    this.exit = bind(this.exit, this);
    this.close = document.createElement("div");
    this.close.style.cssText = "position:absolute;box-sizing:border-box;top:5px;right:5px;width:20px;height:20px;border:1px solid #bbb;border-radius:3px;text-align:center;font-size:14px;line-height:20px;cursor:pointer;font-weight:bold;";
    this.close.innerHTML = "&#10060;";
    this.container.appendChild(this.close);
    this.close.addEventListener("click", this.exit);
    this.close.addEventListener("mouseenter", this.enter);
    this.close.addEventListener("mouseleave", this.leave);
  }

  Close.prototype.exit = function() {
    return this.panel.panel();
  };

  Close.prototype.enter = function() {
    return this.close.style.border = "1px solid #1C86EE";
  };

  Close.prototype.leave = function() {
    return this.close.style.border = "1px solid #bbb";
  };

  return Close;

})();

module.exports = Close;
