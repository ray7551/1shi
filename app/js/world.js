;
(function (window, PIXI, $) {
  var World = function (canvasId, bgColor, width, height) {
    var $canvas = document.getElementById(canvasId);
    this.bgColor = typeof bgColor !== 'undefined' ? bgColor : 0x8232CD;
    this.fullWindow = !width || !height;

    if (this.fullWindow) {
      width = window.innerWidth;
      height = window.innerHeight;
    } else {
      $canvas.classList.add('center');
    }

    this.renderer = PIXI.autoDetectRenderer(width, height, {
      view: $canvas
    });
    this.renderer.backgroundColor = this.bgColor;
    if (this.fullWindow) {
      this.bindWindowResize();
    }
    this.width = this.renderer.width;
    this.height = this.renderer.height;

    this.stage = new PIXI.Container();
    this.render();
  };

  World.prototype = {
    bindWindowResize: function () {
      $(window).resize(function () {
        this.resize(window.innerWidth, window.innerHeight);
      }.bind(this));
    },

    render: function () {
      this.renderer.render(this.stage);
    },

    resize: function (width, height) {
      this.renderer.resize(width, height);
      this.width = this.renderer.width;
      this.height = this.renderer.height;
    },

    tick: function () {

    }
  }


  window.World = World;
})(window, PIXI, jQuery);
