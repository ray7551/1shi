(function (global, Role, Bullet, CONFIG) {
  'use strict';

  var _super = Role;
  var initSpeed;
  var turnBackTimeoutId;

  /**
   * @class
   * @extends Role
   * @param assets {string, string[]} resourceID or resourceID array
   * @param world {World}
   * @param revolutionInit {number}
   * @param revolutionSpeed {number}
   * */
  function Warrior(assets, world, revolutionInit, revolutionSpeed) {
    _super.call(this, assets, world);
    this.config = Util.extend({}, CONFIG.warrior, {
      revolutionInit: revolutionInit,
      revolutionSpeed: revolutionSpeed
    });
    this.accelerateMultiple = this.config.accelerateMultiple;
    // don't set accelerateTime to long, it should shorter than 100
    this.accelerateTime = this.config.accelerateTime;

    this.size = this.config.size;
    this.health = this.config.health;
    this.bulletNumLimit = this.config.bulletNumLimit;
    this.bulletNum = this.bulletNumLimit;

    // the initial revolution around the boss. 公转角初始位移
    this.revolutionInit = this.config.revolutionInit;
    initSpeed = this.config.initSpeed;
    this.revolutionSpeed = initSpeed; // rad/ms
  }

  Warrior.prototype.init = function () {
    _super.prototype.init.call(this);
    this.sprite.alpha = 1;
    // the rad around itself. 自转角位移
    this.sprite.rotation = 0;
    // the rad around the boss. 公转角位移
    this.revolution = this.revolutionInit;
    this.sprite.anchor.set(.5, .5);
    this.startAddBullet();
  };

  Warrior.prototype.paint = function () {
    var xScale = this.size * this.unit / this.originSize.width;
    var yScale = this.size * this.unit / this.originSize.height;
    this.sprite.scale.set(xScale, yScale);
    this.radius = this.config.radius * this.unit;
    this.sprite.position.set(
      - this.radius * Math.sin(this.revolution - this.revolutionInit) + this.world.width / 2,
      this.radius * Math.cos(this.revolution - this.revolutionInit) + this.world.height / 2
    );
  };

  Warrior.prototype.update = function (dt) {
    this.legalizeRadian();

    this.sprite.position.set(
      - this.radius * Math.sin(this.revolution - this.revolutionInit) + this.world.width / 2,
      this.radius * Math.cos(this.revolution - this.revolutionInit) + this.world.height / 2
    );

    this.revolution = this.revolution + this.revolutionSpeed * dt;
    this.sprite.rotation = this.revolution - this.revolutionInit;
  };

  Warrior.prototype.turnBack = function () {
    this._turnBack();
    if(typeof turnBackTimeoutId === 'undefined') {
      this._accelerate(this.accelerateTime);
    }
    this.shoot();
  };

  Warrior.prototype._turnBack = function () {
    this.revolutionSpeed = -this.revolutionSpeed;
  };

  Warrior.prototype._accelerate = function (time) {
    var originSpeed = this.revolutionSpeed;
    this.revolutionSpeed = this.accelerateMultiple * originSpeed;

    turnBackTimeoutId = setTimeout(function () {
      this.revolutionSpeed = originSpeed;
      turnBackTimeoutId = undefined;
    }.bind(this), time);
  };

  Warrior.prototype.legalizeRadian = function () {
    this.revolution = Role.legalizeRadian(this.revolution);
    this.sprite.rotation = Role.legalizeRadian(this.sprite.rotation);
  };

  Warrior.prototype.shoot = function () {
    if(this.bulletNum <= 0) {
      return;
    }
    var bullet = new Bullet(this.world, this, {
      damage: 10,
      speed: this.config.bulletSpeed,
      radius: this.radius / this.world.unit,
      radian: this.revolution,
      rotation: this.revolution,
      position: {
        x: this.sprite.position.x,
        y: this.sprite.position.y
      }
    });

    this.bulletNum--;
    // debugger;
    this.world.addDisplayObject(bullet);
  };

  Warrior.prototype.isShooted = function (bulletPosition) {
    var distance = Role.distance(bulletPosition, this.sprite.position);
    return distance < this.sprite.width / 2;
  }

  Warrior.prototype.injured = function (damage) {
    this.health -= damage;
  };

  Warrior.prototype.startAddBullet = function () {
    this.addBulletIntervalId = setInterval(function addBullet() {
      if(this.bulletNum < this.bulletNumLimit){
        this.bulletNum++;
      }
    }.bind(this), this.config.bulletAddInterval);
  };

  Warrior.prototype.pauseAddBullet = function () {
    window.clearInterval(this.addBulletIntervalId);
  }

  global.Warrior = Warrior;
})(window, Role, Bullet, CONFIG);
