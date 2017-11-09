var Move,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Move = (function() {
  function Move(container) {
    this.container = container;
    this.movement = bind(this.movement, this);
    this.mouseup = bind(this.mouseup, this);
    this.mousedown = bind(this.mousedown, this);
    this.move = document.createElement("div");
    this.move.style.cssText = "position:absolute;box-sizing:border-box;top:0;left:0;right:0;height:30px;border-bottom:1px solid #bbb;cursor:move;";
    this.container.appendChild(this.move);
    this.move.addEventListener("mousedown", this.mousedown);
  }

  Move.prototype.mousedown = function(e) {
    this.pos = {
      x: e.clientX,
      y: e.clientY
    };
    document.addEventListener("mousemove", this.movement);
    return document.addEventListener("mouseup", this.mouseup);
  };

  Move.prototype.mouseup = function() {
    document.removeEventListener("mouseup", this.mouseup);
    return document.removeEventListener("mousemove", this.movement);
  };

  Move.prototype.movement = function(e) {
    var x, y;
    console.log("x", x = e.clientX - this.pos.x);
    console.log("y", y = e.clientY - this.pos.y);
    return this.container.style.transform = "translate(" + x + "px," + y + "px)";
  };

  return Move;

})();

module.exports = Move;
