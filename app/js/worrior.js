(function (global, Role, DIRECTION) {
  'use strict';

  var _super = Role;
  var accelerateMutiple = 5;
  var accelerateTime = 300; // don't set accelerateTime to long, it should shorter than 100
  var initSpeed;
  var turnBackTimeoutId;

  function Worrior(assets, world, revolutionInit, revolutionSpeed) {
    _super.call(this, assets, world);
    this.size = 40;

    // the initial revolution around the boss. 公转角初始位移
    this.revolutionInit = revolutionInit || Math.PI;
    initSpeed = revolutionSpeed || 0.0005;
    this.revolutionSpeed = initSpeed; // rad/ms
    // this.rotateSpeed = this.revolutionSpeed;          // rad/ms
  }

  Worrior.prototype.init = function () {
    _super.prototype.init.call(this);
    this.sprite.alpha = 1;
    // the rad around itself. 自转角位移
    this.sprite.rotation = 0;
    // the rad around the boss. 公转角位移
    this.revolution = this.revolutionInit;
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
    this.legalizeRadian();

    this.sprite.position.set(
      - this.sprite.radius * Math.sin(this.revolution - this.revolutionInit) + this.world.width / 2,
      this.sprite.radius * Math.cos(this.revolution - this.revolutionInit) + this.world.height / 2
    );

    this.revolution = this.revolution + this.revolutionSpeed * dt;
    this.sprite.rotation = this.revolution - this.revolutionInit;
  }

  Worrior.prototype.turnBack = function () {
    this._turnBack();
    if(typeof turnBackTimeoutId === 'undefined') {
      this._accelerate(accelerateTime);
    }
  }

  Worrior.prototype._turnBack = function () {
    this.revolutionSpeed = -this.revolutionSpeed;
  }

  Worrior.prototype._accelerate = function (time) {
    var originSpeed = this.revolutionSpeed;
    this.revolutionSpeed = accelerateMutiple * originSpeed;

    turnBackTimeoutId = setTimeout(function (argument) {
      this.revolutionSpeed = originSpeed;
      turnBackTimeoutId = undefined;
    }.bind(this), time);
  }

  Worrior.prototype.legalizeRadian = function () {
    this.revolution = Role.legalizeRadian(this.revolution);
    this.sprite.rotation = Role.legalizeRadian(this.sprite.rotation);
  }

  global.Worrior = Worrior;
})(window, Role, DIRECTION);
