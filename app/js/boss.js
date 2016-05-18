(function (global, Role) {
  'use strict';

  // Boss extends Role
  var _super = Role;

  // baseSpeed is init speed of boss
  // it should faster than worrior.revolutionSpeed
  // var baseSpeedMultiple = 1.65; // 1.65 is good for debug
  var baseSpeedMultiple = 1.1;
  var baseSpeed;

  // findSpeed is boss's speed when worrior out of purview
  // it should faster than worrior.revolutionSpeed
  var findSpeedMultiple = 5;
  var findSpeed;

  var edgePurviewMultiple = 0.05; // multiple for calc attack purview edge wide

  function Boss(assets, world) {
    _super.call(this, assets, world);
    this.size = 60;
    this.rotateSpeed = 0; // rad/ms
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

    this.sprite.rotation = this.sprite.rotation + this.rotateSpeed * dt;
    // l(this.rotateDirection);
  };

  Boss.prototype.addEnemy = function (worrior) {
    this.worrior = worrior;
    //this.sprite.rotation = this.worrior.revolution + Math.PI;
    baseSpeed = baseSpeedMultiple * this.worrior.revolutionSpeed;
    findSpeed = findSpeedMultiple * this.worrior.revolutionSpeed;
    this.rotateSpeed = baseSpeed;
  };

  /**
   * if the worrior in the edge part of purview
   */
  Boss.prototype.isInEdge = function (worriorRev) {
    return this.isInLeftEdge(worriorRev) || this.isInRightEdge(worriorRev);
  };

  /**
   * if the worrior in the left edge part of purview
   */
  Boss.prototype.isInLeftEdge = function (worriorRev) {
    // radian of left line of the edge
    var radianLeft = this.sprite.rotation - this.attackPurview;
    // radian of right line of the edge
    var radianRight = radianLeft + this.attackPurview * edgePurviewMultiple;
    return Role.isBetween(worriorRev, radianLeft, radianRight);
  };

  /**
   * if the worrior in the right edge part of purview
   */
  Boss.prototype.isInRightEdge = function (worriorRev) {
    // radian of right line of the edge
    var radianRight = this.sprite.rotation + this.attackPurview;
    // radian of left line of the edge
    var radianLeft = radianRight - this.attackPurview * edgePurviewMultiple;
    return Role.isBetween(worriorRev, radianLeft, radianRight);
  };

  /*
   * Aim at the worrior
   * determine if it is time to change rotate direction and shoot
   * @TODO consider the circumstance of boss is slower
   * now it is certain that this.rotateSpeed > this.worrior.revolutionSpeed
   */
  Boss.prototype.aim = function (t) {
    this.worrior.legalizeRadian();
    var worriorRev = this.worrior.revolution;
    // var diff = worriorRev - this.sprite.rotation;
    var diffAbs = Role.absRadianDiff(worriorRev, this.sprite.rotation);//Math.abs(diff) < Math.PI ? Math.abs(diff) : 2 * Math.PI - Math.abs(diff);

    // if w at edge part of attack purview
    var inEdge = this.isInEdge(worriorRev);
    // if b and w run in opposite direciton
    var isOpposite = this.rotateSpeed * this.worrior.revolutionSpeed < 0;
    // var isFaster = this.rotateSpeed > this.worrior.revolutionSpeed;

    if(diffAbs < 0) {
      debugger;
    }
    
    // if(!inEdge) {
    //   l(inEdge);
    // } else {
    //   debugger;
    // }
    // if(isOpposite && !inEdge) {
    //   debugger;
    // }

    // if(inEdge) {
    //   debugger;
    // }

    if (diffAbs <= this.attackPurview) {
      this.rotateSpeed = Math.sign(this.rotateSpeed) * baseSpeed;

      if(isOpposite && this.isInLeftEdge(worriorRev)) {
        //debugger;
      }

      if (inEdge) {
        this.follow();
      }
    } else {
      this.rotateSpeed = findSpeed;
    }

  };

  Boss.prototype.follow = function () {
    this.setSpeed(
      -this.rotateSpeed,
      this.calcEdgeLockTime()
      //true
    );
  }

  /**
   * use it only when worrior run to the edge part of boss's attack purview
   * and boss is faster than the worrior
   * and boss have to turn back
   * and need a time to lock changed boss.rotateDirection
   */
  Boss.prototype.calcEdgeLockTime = function () {
    var isOpposite = this.rotateSpeed * this.worrior.revolutionSpeed < 0;
    var relativeSpeed = isOpposite
      ? Math.abs(this.rotateSpeed - this.worrior.revolutionSpeed)
      : Math.abs(this.rotateSpeed + this.worrior.revolutionSpeed);
    var radian = 2 * this.attackPurview - this.attackPurview * 2 * edgePurviewMultiple - (Math.PI * 0.01);

    return radian / relativeSpeed;
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
      ? 2 * this.attackPurview - this.attackPurview * 2 * edgePurviewMultiple
      : 2 * this.attackPurview - this.attackPurview * edgePurviewMultiple;

    if (this.rotateSpeed >=0) {
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
      ? 2 * this.attackPurview - this.attackPurview * 2 * edgePurviewMultiple
      : 2 * this.attackPurview - this.attackPurview * edgePurviewMultiple;

    if (this.rotateSpeed >= 0) {
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
    if (this.rotateSpeed >= 0) {
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

  var isLockingSpeed = false;
  Boss.prototype.setSpeed = function (speed, t, force) {
    if (isLockingSpeed && !force) {
      return;
    }
    if (isLockingSpeed && this.rotateSpeed === speed) {
      return;
    }

    //l('lock');
    // t = t || (2 * Math.PI / this.rotateSpeed);
    this.rotateSpeed = speed;

    isLockingSpeed = true;
    setTimeout(function () {
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
    var diff = Role.absRadianDiff(this.worrior.revolution, this.sprite.rotation);

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
    console.clear();
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
