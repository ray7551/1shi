(function (global, Role) {
  'use strict';

  // Boss extends Role
  var _super = Role;

  function Boss(assets, world) {
    _super.call(this, assets, world);
    this.size = 40;
    this.rotateSpeed = 0.004;
  }

  Boss.prototype.init = function () {
    _super.prototype.init.call(this);
    this.sprite.alpha = 1;
    this.sprite.rotation = 0;
    this.paint();
  };

  Boss.prototype.paint = function () {
    var xScale = this.size * this.unit / this.originSize.width;
    var yScale = this.size * this.unit / this.originSize.height;
    this.sprite.scale.set(xScale, yScale);
    this.sprite.position.set(
      this.world.width / 2, // - this.width / 2,
      this.world.height / 2 // - this.height / 2
    );
    this.sprite.anchor.set(.5, .5);
    //this.pivot.set(.5, .5);
    // l('w h', this.width, this.height);
    // l('position pivot', this.position, this.pivot);
    // l('scale', this.sprite.scale);
  };

  Boss.prototype.update = function (dt) {
    // Aim at the worrior
    var worriorRev = this.worrior.revolution + Math.PI;
    var diff = worriorRev - this.sprite.rotation;
    //l(diff);
    //this.sprite.rotation += this.rotateSpeed * dt;
  },

  Boss.prototype.aim = function(worrior) {
    this.worrior = worrior;
  }

  global.Boss = Boss;
})(window, Role);
