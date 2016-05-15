(function (global, Role, DIRECTION) {
  'use strict';


  var _super = Role;

  function Worrior(assets, world) {
    _super.call(this, assets, world);
    this.size = 40;

    this.revolutionDirection = DIRECTION.CW;

    this.rotateSpeed = 0.002;
    // this.rotateSpeed = 0;
    this.rovolutionSpeed = 0.002;
  }

  Worrior.prototype.init = function () {
    _super.prototype.init.call(this);
    this.sprite.alpha = 1;
    this.sprite.rotation = 0;    // the rad around itself. 自转角位移
    this.revolution = 0;  // the rad around the boss. 公转角位移
    this.sprite.anchor.set(.5, .5);


    this.paint();
  };

  Worrior.prototype.paint = function () {
    var xScale = this.size * this.unit / this.originSize.width;
    var yScale = this.size * this.unit / this.originSize.height;
    this.sprite.radius = 400 * this.unit;
    this.sprite.position.set(
      this.world.width / 2 - this.sprite.width / 2,
      this.world.height / 2 + this.sprite.radius
    );
    this.sprite.scale.set(xScale, yScale);
  };

  Worrior.prototype.update = function (dt, t) {
    // l('position pivot', this.position, this.pivot);
    this.sprite.position.set(
      - this.sprite.radius * Math.sin(this.revolution) + this.world.width / 2,
      this.sprite.radius * Math.cos(this.revolution) + this.world.height / 2
    );

    this.sprite.rotation = this.revolutionDirection === DIRECTION.CW
      ? this.sprite.rotation + this.rotateSpeed * dt
      : this.sprite.rotation - this.rotateSpeed * dt;
    this.sprite.rotation = this.sprite.rotation % (2 * Math.PI);
    this.revolution = this.revolutionDirection === DIRECTION.CW
      ? this.revolution + this.rovolutionSpeed * dt
      : this.revolution - this.rovolutionSpeed * dt;
    this.revolution = this.revolution % (2 * Math.PI);
  }


  global.Worrior = Worrior;
})(window, Role, DIRECTION);
