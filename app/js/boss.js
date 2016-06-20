(function (global, Role, CONFIG) {
  'use strict';

  // Boss extends Role
  var _super = Role;

  var isLockingSpeed = false;
  var lockSpeedTimeoutId;

  /**
   * @class
   * @extends Role
   * @param assets {string, string[]} resourceID or resourceID array
   * @param world {World}
   * */
  function Boss(assets, world) {
    _super.call(this, assets, world);
    this.config = Util.extend({}, CONFIG.boss);
    this.size = this.config.size;
    this.rotateSpeed = 0; // rad/ms
    // baseSpeed is init speed of boss
    // it should faster than warrior.revolutionSpeed
    this.baseSpeedMultiple = this.config.baseSpeedMultiple;
    // findSpeed is boss's speed when warrior out of purview
    // it should faster than warrior.revolutionSpeed
    this.findSpeedMultiple = this.config.findSpeedMultiple;
    this.rotateInit = this.config.rotateInit;
    // boss has no revolution, but boss's bullet need revolutionInit
    this.revolutionInit = this.config.revolutionInit;
    this.health = this.config.health;
    this.purviewEdgeMultiple = this.config.purviewEdgeMultiple; // multiple for calc attack purview edge wide
    Object.defineProperties(this, {
      // attack range
      'attackPurview': {
        get: function () {
          // it should mainly determined by boss.rotateSpeed, warrior.revolutionSpeed and bulet speed
          // now temporarily use defaultAttackPurview as attackPurview
          return this.config.defaultAttackPurview;
        }
      }
    });
  }

  Boss.prototype.init = function () {
    _super.prototype.init.call(this);
    this.sprite.alpha = this.config.initAlpha;
    this.sprite.rotation = this.rotateInit;

    this.startShoot();
  };

  Boss.prototype.paint = function () {
    var xScale = this.size * this.unit / this.originSize.width;
    var yScale = this.size * this.unit / this.originSize.height;
    this.sprite.scale.set(xScale, yScale);
    this.sprite.position.set(
      this.world.width / 2,
      this.world.height / 2
    );
    this.sprite.anchor.set(.5, .5);
  };

  Boss.prototype.update = function (dt, t) {
    this.sprite.rotation = Role.legalizeRadian(this.sprite.rotation);

    // Aim at the warrior
    this.aim(t);
    //this.audit();

    this.sprite.rotation = this.sprite.rotation + this.rotateSpeed * dt;
    // l(this.rotateDirection);
  };

  Boss.prototype.addEnemy = function (warrior) {
    this.warrior = warrior;
    //this.sprite.rotation = this.warrior.revolution + Math.PI;
    this.baseSpeed = this.baseSpeedMultiple * this.warrior.revolutionSpeed;
    this.findSpeed = this.findSpeedMultiple * this.warrior.revolutionSpeed;
    this.rotateSpeed = this.baseSpeed;
  };

  /**
   * if the warrior in the edge part of purview
   */
  Boss.prototype.isInEdge = function (warriorRev) {
    return this.isInLeftEdge(warriorRev) || this.isInRightEdge(warriorRev);
  };

  /**
   * if the warrior in the left edge part of purview
   */
  Boss.prototype.isInLeftEdge = function (warriorRev) {
    // radian of left line of the edge
    var radianRight = this.sprite.rotation - this.attackPurview;
    // radian of right line of the edge
    var radianLeft = radianRight - this.attackPurview * this.purviewEdgeMultiple;
    return Role.isBetween(warriorRev, radianLeft, radianRight);
  };

  /**
   * if the warrior in the right edge part of purview
   */
  Boss.prototype.isInRightEdge = function (warriorRev) {
    // radian of right line of the edge
    var radianLeft = this.sprite.rotation + this.attackPurview;
    // radian of left line of the edge
    var radianRight = radianLeft + this.attackPurview * this.purviewEdgeMultiple;
    return Role.isBetween(warriorRev, radianLeft, radianRight);
  };

  /*
   * Aim at the warrior
   * determine if it is time to change rotate direction and shoot
   * @TODO consider the circumstance of boss is slower
   * now it is certain that this.rotateSpeed > this.warrior.revolutionSpeed
   */
  Boss.prototype.aim = function () {
    this.warrior.legalizeRadian();
    var warriorRev = this.warrior.revolution;
    var diffAbs = Role.absRadianDiff(warriorRev, this.sprite.rotation);

    // if w at edge part of attack purview
    var inEdge = this.isInEdge(warriorRev);

    if (inEdge) {
      this.rotateSpeed = Util.sign(this.rotateSpeed) * this.baseSpeed;
      this.follow();
      return;
    }

    if (diffAbs <= this.attackPurview * (1 + this.purviewEdgeMultiple)) {
      this.rotateSpeed = Util.sign(this.rotateSpeed) * this.baseSpeed;
    } else {
      this.rotateSpeed = this.findSpeed;
    }

  };

  Boss.prototype.follow = function () {
    this.setSpeed(
      -this.rotateSpeed,
      this.calcEdgeLockTime()
      // true
    );
  };

  /**
   * use it only when warrior run to the edge part of boss's attack purview
   * and boss is faster than the warrior
   * and boss have to turn back
   * and need a time to lock changed boss.rotateDirection
   */
  Boss.prototype.calcEdgeLockTime = function () {
    var isOpposite = this.rotateSpeed * this.warrior.revolutionSpeed < 0;
    var relativeSpeed = isOpposite
      ? Math.abs(this.rotateSpeed - this.warrior.revolutionSpeed)
      : Math.abs(this.rotateSpeed + this.warrior.revolutionSpeed);
    // 0.02 rad approximate 1 degree
    // it lets browser have enough time to calculate and set next direction
    var radian = 2 * this.attackPurview - 0.02;

    return radian / relativeSpeed;
  };

  Boss.prototype.setSpeed = function (speed, t, force) {
    if (isLockingSpeed && !force) {
      return;
    }
    if (isLockingSpeed && this.rotateSpeed === speed) {
      return;
    }
    if (isLockingSpeed && force) {
      window.clearTimeout(lockSpeedTimeoutId);
    }

    //l('lock');
    this.rotateSpeed = speed;

    isLockingSpeed = true;
    lockSpeedTimeoutId = setTimeout(function () {
      isLockingSpeed = false;
      //l('unlock');
    }, t);
  };


  var efficiency = {
    count: {
      inVision: 0,
      outofVision: 0
    },
    recentData: [],
    recentLength: 200,
    sum: 0,
    recentSum: 0,
    totalCount: 0,
    average: 0,
    recentAverage: 0
  };

  // calculate how efficiently the aim algorithm is
  Boss.prototype.audit = function () {
    var diff = Role.absRadianDiff(this.warrior.revolution, this.sprite.rotation);

    if (diff < this.attackPurview) {
      efficiency.count.inVision++;
    } else {
      efficiency.count.outofVision++;
    }
    efficiency.totalCount++;

    if (efficiency.count.inVision === 0) {
      return;
    }

    var aimEfficiency = efficiency.count.inVision / (efficiency.count.inVision + efficiency.count.outofVision) * 100;

    if (efficiency.recentData.length >= efficiency.recentLength) {
      efficiency.recentSum -= efficiency.recentData.shift();
    }
    efficiency.recentData.push(aimEfficiency);
    efficiency.sum += aimEfficiency;
    efficiency.recentSum += aimEfficiency;

    efficiency.average = efficiency.sum / efficiency.totalCount;
    efficiency.recentAverage = efficiency.recentSum / efficiency.recentLength;

    // l(efficiency.average, efficiency.recentAverage);
    // l(efficiency.average);
    // console.clear();
    l(efficiency.recentAverage);
  };

  Boss.prototype.injured = function (damage) {
    this.health -= damage;
    this.sprite.alpha -= damage / this.config.health * (this.config.initAlpha - this.config.minAlpha);
  };

  Boss.prototype.shoot = function () {
    var bullet = new Bullet(this.world, this, {
      speed: this.config.bulletSpeed,
      radius: 0,
      radian: this.sprite.rotation + Math.PI,
      rotation: this.sprite.rotation,
      position: {
        x: this.sprite.position.x,
        y: this.sprite.position.y
      }
    });
    // debugger;
    this.world.addDisplayObject(bullet);
  };

  Boss.prototype.pauseShoot = function () {
    window.clearInterval(this.shootIntervalId);
  };

  Boss.prototype.startShoot = function () {
    this.shootIntervalId = setInterval(function () {
      this.shoot();
    }.bind(this), this.config.shootInterval);
  };

  global.Boss = Boss;
})(window, Role, CONFIG);
