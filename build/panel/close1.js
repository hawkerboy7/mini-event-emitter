var Close;

Close = (function() {
  function Close(container) {
    this.container = container;
    this.move = document.createElement("div");
    this.move.style.cssText = "position:absolute;top:10px;right:10px;width:20px;height:20px;border:1px solid #555;";
    this.container.appendChild(this.move);
    this.move.onclick = function() {
      return console.log("click 1");
    };
    this.move.addEventListener("click", function() {
      return console.log("click 2");
    });
    this.move.addEventListener("click", function() {
      return console.log("click 3");
    });
  }

  return Close;

})();

module.exports = Close;
