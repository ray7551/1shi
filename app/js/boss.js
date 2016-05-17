(function (global, Role) {
  'use strict';

  // Boss extends Role
  var _super = Role;
  var visionPurview = Math.PI / 8;
  var baseSpeedMultiple = 1.5;
  var baseSpeed;
  var edgePurviewMultiple = 0.05; // multiple for calc attack purview edge wide

  function Boss(assets, world) {
    _super.call(this, assets, world);
    this.size = 60;
    this.rotateSpeed = 0; // rad/ms
    this.rotateDirection = DIRECTION.CW;
    this.rotateInit = 0;
    Object.defineProperties(this, {
      // attack range
      'attackPurview': {
        get: function () {
          // it should mainly determined by boss.rotateSpeed, worrior.revolutionSpeed and bulet speed
          // now temporarily use Math.PI / 8 as attackPurview 
          return Math.PI / 4;
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
    this.sprite.rotation = Role.legalizeRadian(this.sprite.rotation);

    // Aim at the worrior
    this.aim(t);
    //this.audit();

    this.sprite.rotation = this.rotateDirection === DIRECTION.CW 
      ? this.sprite.rotation + this.rotateSpeed * dt 
      : this.sprite.rotation - this.rotateSpeed * dt;
    // l(this.rotateDirection);
  };

  Boss.prototype.addEnemy = function (worrior) {
    this.worrior = worrior;
    //this.sprite.rotation = this.worrior.revolution + Math.PI;
    baseSpeed = baseSpeedMultiple * this.worrior.revolutionSpeed;
    this.rotateSpeed = baseSpeed;
  };

  /*
   * Aim at the worrior
   * determine if it is time to change rotate direction and shoot
   */
  Boss.prototype.aim = function (t) {
    var worriorRev = Role.legalizeRadian(this.worrior.revolution);
    var diff = worriorRev - this.sprite.rotation;
    var diffAbs = Math.abs(diff) < Math.PI ? Math.abs(diff) : 2 * Math.PI - Math.abs(diff);

    // if w at edge part of attack purvieiw
    var inEdge = this.attackPurview - diffAbs > this.attackPurview * edgePurviewMultiple;
    var inLeftEdge = inEdge && diff < 0;
    var inRightEdge = inEdge && diff > 0;
    // if b and w run in opposite direciton
    var isOpposite = this.worrior.revolutionDirection !== this.rotateDirection;

    // @TODO consider the circumstance of boss is slower
    // now it certain that this.rotateSpeed > this.worrior.revolutionSpeed
    // var isFaster = this.rotateSpeed > this.worrior.revolutionSpeed;

    var newDirection;

    // if (lockingDirection) {
    //   return;
    // }

    if(diffAbs < 0) {
      debugger;
    }

    if (diffAbs <= this.attackPurview) {

      this.rotateSpeed = baseSpeed;
      if (isOpposite) {
        if (inLeftEdge && this.worrior.revolutionDirection === DIRECTION.CCW) {
          this.setDirection(DIRECTION.CW, this.calcEdgeLockTime(), true);
          return;
        }

        if (inRightEdge && this.worrior.revolutionDirection === DIRECTION.CW) {
          this.setDirection(DIRECTION.CCW, this.calcEdgeLockTime(), true);
          return;
        }
        this.rotateSpeed = baseSpeed;
        newDirection = diff >= 0 ? DIRECTION.CW : DIRECTION.CCW;
        this.setDirection(newDirection, this.calcOppsTrackLockTime(diff));
      } else {
        if (inLeftEdge && this.worrior.revolutionDirection === DIRECTION.CW) {
          this.setDirection(DIRECTION.CW, this.calcEdgeLockTime(), true);
          return;
        }

        if (inRightEdge && this.worrior.revolutionDirection === DIRECTION.CCW) {
          this.setDirection(DIRECTION.CCW, this.calcEdgeLockTime(), true);
          // this.setDirection(DIRECTION.CCW);
          return;
        }
        this.rotateSpeed = baseSpeed;
        newDirection = diff >= 0 ? DIRECTION.CW : DIRECTION.CCW;
        this.setDirection(newDirection, this.calcSameTrackLockTime(diff));
      }
    } else {
      this.rotateSpeed = 5 * baseSpeed;
    }
    
  };

  Boss.prototype.calcEdgeLockTime = function () {
    // isOpposite
    var lockTime;
    var speedDiff = this.rotateSpeed - this.worrior.revolutionSpeed;
    var radian = 2 * this.attackPurview - this.attackPurview * 2 * edgePurviewMultiple - 2;

    lockTime = radian / speedDiff;
    return lockTime;
  };

  /**
   * use it only when boss and worrior run in opposite direction
   * and worrior coming in attackPurview
   * and boss is faster than the worrior
   * and need a time to lock changed boss.rotateDirection
   */
  Boss.prototype.calcOppsTrackLockTime = function (diff, cutDubbleEdge) {
    var lockTime;
    var speedSum = this.rotateSpeed + this.worrior.revolutionSpeed;
    var speedDiff = this.rotateSpeed - this.worrior.revolutionSpeed;
    var radian = cutDubbleEdge
      ? 2 * this.attackPurview - this.attackPurview * 2 * edgePurviewMultiple - 2
      : 2 * this.attackPurview - this.attackPurview * edgePurviewMultiple - 2;

    if (this.rotateDirection === DIRECTION.CW) {
      if (diff <= 0) {
        lockTime = radian / speedDiff;
      } else {
        lockTime = radian / speedSum;
      }
    } else {
      if (diff <= 0) {
        lockTime = radian / speedSum;
      } else {
        lockTime = radian / speedDiff;
      }
    }

    return lockTime;
  }

  /**
   * use it only when boss and worrior run in same direction
   * and worrior coming in attackPurview
   * and boss is faster than the worrior
   * and need a time to lock changed boss.rotateDirection
   */
  Boss.prototype.calcSameTrackLockTime = function (diff, cutDubbleEdge) {
    var lockTime;
    var speedSum = this.rotateSpeed + this.worrior.revolutionSpeed;
    var speedDiff = this.rotateSpeed - this.worrior.revolutionSpeed;
    var radian = cutDubbleEdge
      ? 2 * this.attackPurview - this.attackPurview * 2 * edgePurviewMultiple - 2
      : 2 * this.attackPurview - this.attackPurview * edgePurviewMultiple - 2;

    if (this.rotateDirection === DIRECTION.CW) {
      if (diff <= 0) {
        lockTime = radian / speedSum;
      } else {
        lockTime = radian / speedDiff;
      }
    } else {
      if (diff <= 0) {
        lockTime = radian / speedDiff;
      } else {
        lockTime = radian / speedSum;
      }
    }

    return lockTime;
  }

  /**
   * use it only when boss and worrior run in same direction
   * and worrior getting out of attackPurview
   * and boss is slower than the worrior
   * and Boss need a time to turn back to the good place
   */
  Boss.prototype.calcBackLockTime = function (diff) {
    var lockTime;
    var relativeSpeed = this.rotateSpeed + this.worrior.revolutionSpeed;
    if (this.rotateDirection === DIRECTION.CW) {
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

    //l('lock');
    // t = t || (2 * Math.PI / this.rotateSpeed);
    this.rotateDirection = direction;

    lockingDirection = true;
    setTimeout(function () {
      lockingDirection = false;
      //l('unlock');
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
