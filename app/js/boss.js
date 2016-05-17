(function (global, Role) {
  'use strict';

  // Boss extends Role
  var _super = Role;
  var visionPurview = Math.PI / 8;
  var baseSpeed;

  function Boss(assets, world) {
    _super.call(this, assets, world);
    this.size = 40;
    this.rotateSpeed = 0; // rad/ms
    this.rotateDirection = DIRECTION.CW;
    Object.defineProperties(this, {
      // attack range
      'attackPurview': {
        get: function () {
          // it should mainly determined by boss.rotateSpeed, worrior.revolutionSpeed and bulet speed
          // now temporarily use Math.PI / 8 as attackPurview 
          return Math.PI / 8;
        }
      }
    });
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

  Boss.prototype.update = function (dt, t) {
    this.sprite.rotation = this.sprite.rotation % (2 * Math.PI);

    // Aim at the worrior
    this.aim(t);
    //this.audit();

    this.sprite.rotation = this.rotateDirection === DIRECTION.CW ? this.sprite.rotation + this.rotateSpeed * dt : this.sprite.rotation - this.rotateSpeed * dt;
    // l(this.rotateDirection);
  };

  Boss.prototype.addEnemy = function (worrior) {
    this.worrior = worrior;
    //this.sprite.rotation = this.worrior.revolution + Math.PI;
    baseSpeed = 1.5 * this.worrior.revolutionSpeed;
    this.rotateSpeed = baseSpeed;
  };

  /*
   * Aim at the worrior
   * determine if it is time to change rotate direction and shoot
   */
  Boss.prototype.aim = function (t) {
    var worriorRev = this.worrior.revolution;
    var diff = worriorRev - this.sprite.rotation;
    var diffAbs = Math.abs(diff) < Math.PI ? Math.abs(diff) : 2 * Math.PI - Math.abs(diff);

    var isOpposite = this.worrior.revolutionDirection !== this.rotateDirection;
    // var isFaster = this.rotateSpeed > this.worrior.revolutionSpeed;
    var lockDirection;

    if (lockingDirection) {
      return;
    }

    if (isOpposite) {
      if (diffAbs <= this.attackPurview) {
        l('INo');
        this.rotateSpeed = baseSpeed;
        lockDirection = diff >= 0 ? DIRECTION.CW : DIRECTION.CCW;
        this.setDirection(lockDirection, this.calcOppsTrackLockTime(diff));
      } else {
        l('OUT');
        this.rotateSpeed = 5 * baseSpeed;
      }
    }
    if (!isOpposite) {
      if (diffAbs <= this.attackPurview) {
        l('INs');
        this.rotateSpeed = baseSpeed;
        lockDirection = diff >= 0 ? DIRECTION.CW : DIRECTION.CCW;
        this.setDirection(lockDirection, this.calcSameTrackLockTime(diff));
      } else {
        l('OUT');
        this.rotateSpeed = 5 * baseSpeed;
      }
      // var lockTime = this.calcLockTime(diff);
      // this.turnBack();
      // this.lockDirection(this.calcLockTime(diff));
    }

    // l(lockingDirection);
    // l(diff);
  };

  // use it only when boss and worrior run in opposite direction
  // and worrior coming in attackPurview
  // and boss is faster than the worrior
  // and need a time to lock changed boss.rotateDirection
  Boss.prototype.calcOppsTrackLockTime = function (diff) {
    var lockTime;
    var relativeSpeed = this.rotateSpeed - this.worrior.revolutionSpeed;
    if (this.worrior.revolutionDirection === DIRECTION.CW) {
      if (diff <= 0) {
        lockTime = 0;
      } else {
        lockTime = 2 * this.attackPurview / relativeSpeed;
      }
    } else {
      if (diff <= 0) {
        lockTime = 2 * this.attackPurview / relativeSpeed;
      } else {
        lockTime = 0;
      }
    }

    return lockTime;
  }

  // use it only when boss and worrior run in same direction
  // and worrior coming in attackPurview
  // and boss is faster than the worrior
  // and need a time to lock changed boss.rotateDirection
  Boss.prototype.calcSameTrackLockTime = function (diff) {
    var lockTime;
    var speedSum = this.rotateSpeed + this.worrior.revolutionSpeed;
    var speedDiff = this.rotateSpeed - this.worrior.revolutionSpeed;
    if (this.rotateDirection === DIRECTION.CW) {
      if (diff <= 0) {
        lockTime = 2 * this.attackPurview / speedSum;
      } else {
        lockTime = 2 * this.attackPurview / speedDiff;
      }
    } else {
      if (diff <= 0) {
        lockTime = 2 * this.attackPurview / speedDiff;
      } else {
        lockTime = 2 * this.attackPurview / speedSum;
      }
    }

    return lockTime;
  }

  // use it only when boss and worrior run in same direction
  // and worrior getting out of attackPurview
  // and boss is slower than the worrior
  // and Boss need a time to turn back to the good place
  Boss.prototype.calcBackLockTime = function (diff) {
    var lockTime;
    var relativeSpeed = this.rotateSpeed + this.worrior.revolutionSpeed;
    if (this.worrior.revolutionDirection === DIRECTION.CW) {
      if (diff <= 0) {
        lockTime = (-diff - this.attackPurview) / relativeSpeed;
      } else {
        lockTime = (2 * Math.PI - diff - this.attackPurview) / relativeSpeed;
      }
    } else {
      if (diff <= 0) {
        lockTime = (2 * Math.PI - (-diff) - this.attackPurview) / relativeSpeed;
      } else {
        lockTime = (2 * Math.PI - diff - this.attackPurview) / relativeSpeed;
      }
    }

    return lockTime;
  }

  var lockingDirection = false;
  Boss.prototype.setDirection = function (direction, t, force) {
    if (lockingDirection && !force) {
      return;
    }

    l('lock');
    // t = t || (2 * Math.PI / this.rotateSpeed);
    this.rotateDirection = direction;

    lockingDirection = true;
    setTimeout(function () {
      lockingDirection = false;
      l('unlock');
    }, t);
  };

  // set rotate direction to the opposite one
  Boss.oppositeDirection = function (direction) {
    return direction === DIRECTION.CW ? DIRECTION.CCW : DIRECTION.CW;
  };

  var count = {
    inVision: 0,
    outofVision: 0
  };
  var efficiency = {
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
    var worriorRev = this.worrior.revolution + Math.PI;
    var diff = Math.abs((worriorRev - this.sprite.rotation) % (2 * Math.PI));

    if (diff < (visionPurview / 2)) { // vision wide PI/12
      count.inVision++;
    } else {
      count.outofVision++;
    }
    efficiency.totalCount++;

    if (count.inVision === 0) {
      return;
    }

    var aimEfficiency = count.inVision / (count.inVision + count.outofVision) * 100;

    if (efficiency.recentData.length >= efficiency.recentLength) {
      var shifted = efficiency.recentData.shift();
      efficiency.recentSum -= shifted;
    }
    efficiency.recentData.push(aimEfficiency);
    efficiency.sum += aimEfficiency;
    efficiency.recentSum += aimEfficiency;

    efficiency.average = efficiency.sum / efficiency.totalCount;
    efficiency.recentAverage = efficiency.recentSum / efficiency.recentLength;

    //l(efficiency.average, efficiency.recentAverage);
    // l(efficiency.average);
    l(efficiency.recentAverage);
  };
  /*
  // A smart way to determine if it is time to change rotate direction and shoot
  Boss.prototype.superAim = function () {

  }*/

  /*
  // produce a radom acceleration between 1 and 3
  Boss.randomAccelerate = function() {

  };*/

  global.Boss = Boss;
})(window, Role);
