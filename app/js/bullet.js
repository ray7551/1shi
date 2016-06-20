(function (global, Role, BulletTexture, CONFIG) {
  'use strict';

  var _super = Role;

  /**
   * @class
   * @extends Role
   * @param world {World}
   * @param owner {Warrior, Boss}
   * @param option {object}
   * */
  var Bullet = function (world, owner, option) {
    var bulletTexture = BulletTexture.getTexture(owner.constructor.name);
    _super.call(this, bulletTexture, world);
    this.config = Util.extend({}, CONFIG.bullet, option);
    this.owner = owner;

    this.size = this.config.size;
    this.color = this.config.color;
    this.damage = this.config.damage;
    this.speed = this.config.speed * this.unit;

  };

  Bullet.prototype.init = function () {
    _super.prototype.init.call(this);
    this.radius = this.config.radius * this.unit;
    this.radian = this.config.radian;
    this.sprite.rotation = this.config.rotation;
    this.sprite.position.x = this.config.position.x;
    this.sprite.position.y = this.config.position.y;
    this.sprite.anchor.set(.5, .5);
    // debugger;
    // the rad around the boss. 公转角位移
    // this.revolution = this.revolutionInit;
    // this.revolutionSpeed = this.owner.revolutionSpeed

  };

  Bullet.prototype.paint = function () {
    var xScale = this.size.width * this.unit / this.originSize.width;
    var yScale = this.size.height * this.unit / this.originSize.height;
    this.sprite.scale.set(xScale, yScale);
    this.sprite.position.set(
      -this.radius * Math.sin(this.radian - this.owner.revolutionInit) + this.world.width / 2,
      this.radius * Math.cos(this.radian - this.owner.revolutionInit) + this.world.height / 2
    );
  };

  Bullet.prototype.update = function (dt) {
    this.radius += this.speed * dt;

    this.sprite.position.set(
      -this.radius * Math.sin(this.radian - this.owner.revolutionInit) + this.world.width / 2,
      this.radius * Math.cos(this.radian - this.owner.revolutionInit) + this.world.height / 2
    );

    this.gridX = Math.ceil(this.sprite.position.x / this.unit);
    this.gridY = Math.ceil(this.sprite.position.y / this.unit);
    // l(-this.radius * Math.sin(this.radian - this.owner.revolutionInit) + this.world.width / 2);
    //
    // this.revolution = this.revolution + this.revolutionSpeed * dt;
    // this.rotation = this.revolution - this.revolutionInit;
  };

  // Bullet.prototype.destroy = function () {
  //   this.sprites.forEach(function(sprite) {
  //     sprite.destroy();
  //     console.log('destroyed:', sprite);
  //   });
  //   // this.owner.removeBullet(this);
  // };

  global.Bullet = Bullet;
})(window, Role, BulletTexture, CONFIG);
