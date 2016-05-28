(function (global, PIXI, $, CONFIG) {
  'use strict';
  var config = Object.assign({}, CONFIG.world);
  var $canvas;
  var t = 0;

  // constructor
  function World(canvasId, bgColor, width, height) {
    $canvas = $('#' + canvasId);
    this.bgColor = typeof bgColor !== 'undefined' ? bgColor : 0x8232CD;
    this.fullWindow = !width || !height;

    if (this.fullWindow) {
      width = document.body.clientWidth;
      height = document.body.clientHeight;
    } else {
      $canvas.classList.add('center');
    }

    this.renderer = PIXI.autoDetectRenderer(width, height, {
      view: document.getElementById(canvasId)
    });
    this.renderer.backgroundColor = this.bgColor;
    if (this.fullWindow) {
      this.bindWindowResize();
    }
    this.bindOrientationChange();
    this.bindVisibilityChange();

    this.width = this.renderer.width;
    this.height = this.renderer.height;
    this.setUnit();

    this.graphics = new PIXI.Graphics();
    this.playground = new PIXI.Container();

    this.ticker = PIXI.ticker.shared;
    this.isBindedResume = false;
  }

  // public functions
  World.prototype = {
    children: {
      warrior: null,
      bullets: [],
      boss: null,
    }, // child objects
    width: 0,
    height: 0,
    graphics: null,
    renderer: null,
    fullWindow: true,
    bgColor: 0x8232CD,
  };
  World.prototype.loadAssets = function (assets, cb) {
    Object.keys(assets).forEach(function (name) {
      PIXI.loader.add(name, assets[name].url);
    });
    PIXI.loader.load(cb);
  };

  World.prototype.addDisplayObject = function (obj) {
    obj.init();
    obj.paint();
    if (Array.isArray(obj.sprites)) {
      obj.sprites.forEach(function (sprite) {
        this.playground.addChild(sprite);
      }.bind(this));
    } else {
      this.playground.addChild(obj.sprites);
    }
    this.addChild(obj);
  };

  World.prototype.addChild = function (obj) {
    if (obj.constructor === global.Warrior) {
      this.children.warrior = obj;
      this.bindClick();
    } else if (obj.constructor === global.Bullet) {
      this.children.bullets.push(obj);
    } else if (obj.constructor === global.Boss) {
      this.children.boss = obj;
    }
  };

  World.prototype.eachChild = function (cb, children) {
    children = children || this.children;
    for (var role in children) {
      if (!children.hasOwnProperty(role) || !children[role]) {
        continue;
      }

      if (Array.isArray(children[role])) {
        if (children[role].length >= 1) {
          this.eachChild(cb, children[role]);
        }
      } else {
        cb(children[role]);
      }
    }
  };

  World.prototype.removeDisplayObject = function (obj) {
    if (obj.constructor === global.Bullet) {
      this.children.bullets.splice(this.children.bullets.indexOf(obj), 1);
    }
    this.playground.removeChild(obj.sprite);
    obj.sprite.destroy();
  };

  World.prototype.bindWindowResize = function () {
    $(window).resize(function () {
      // don't use window.innerWidth and window.innerHeight here,
      // or it will leave a block of space below the canvas
      // while change orientation to landscape.(iOS 7)
      this.resize(document.body.clientWidth, document.body.clientHeight);
    }.bind(this));
  };

  World.prototype.bindOrientationChange = function () {
    $(window).on('orientationchange', function () {
      this.pause();
      this.bindResume();
      this.resize(document.body.clientWidth, document.body.clientHeight);
    }.bind(this));
  };

  World.prototype.bindClick = function () {
    var clickHandler = function () {
      if (this.isBindedResume) {
        $canvas.trigger('game.resume');
        return;
      }
      this.children.warrior.turnBack();
    }.bind(this);

    $canvas.on('touchstart click', clickHandler);
  };

  World.prototype.bindVisibilityChange = function () {
    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange;
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support 
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.mozHidden !== 'undefined') {
      hidden = 'mozHidden';
      visibilityChange = 'mozvisibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }
    // Adjusts the program behavior, based on whether the webpage is active or hidden
    $(window).on(visibilityChange, function () {
      if (document[hidden]) {
        this.pause();
        this.bindResume();
      }
    }.bind(this));
  };

  World.prototype.bindResume = function () {
    if (this.isBindedResume || this.isEnd) {
      return;
    }
    var clickHandler = function () {
      this.isBindedResume = false;
      this.resume();
      $canvas.unbind('game.resume')
    }.bind(this);

    $canvas.bind('game.resume', clickHandler);
    this.isBindedResume = true;
  };

  World.prototype.render = function () {
    this.renderer.render(this.playground);
  };

  World.prototype.setUnit = function () {
    this.unit = Math.min(this.width, this.height) / config.gridNum;
  };

  World.prototype.resize = function (width, height) {
    this.renderer.resize(width, height);
    this.width = this.renderer.width;
    this.height = this.renderer.height;
    this.setUnit();

    this.eachChild(function (obj) {
      obj.paint();
    });
    this.render();
    // fix ios 7 wired scroll bug when orientation change to landscape
    window.scrollTo(0, 0);
  };

  World.prototype.update = function (dt, t) {
    this.eachChild(function (obj) {
      obj.update(dt, t);
    });
  };

  World.prototype.hitTest = function () {
    var j = this.children.bullets.length - 1;
    for (; j >= 0; j--) {
      var bullet = this.children.bullets[j];

      if (bullet.owner === this.children.warrior) {
        if(this.bulletHitTest(bullet)) {
          return;
        }

        if (bullet.radius <= this.children.boss.size * this.unit / 2) {
          // boss injured
          this.children.boss.injured(bullet.damage);
          this.removeDisplayObject(bullet);
          return;
        }

      } else if (bullet.owner === this.children.boss
        && this.children.warrior.isShooted(bullet.sprite.position)) {
        // worrior injured
        this.children.warrior.injured(bullet.damage);
        this.removeDisplayObject(bullet);
        return;
      }

      if (bullet.radius >= Math.max(this.width, this.height) / 2) {
        // bullet fly out of world
        this.removeDisplayObject(bullet);
      }
    }
  };

  World.prototype.bulletHitTest = function (bullet) {
    if(bullet.owner !== this.children.warrior) {
      return;
    }

    var bossBullets = this.children.bullets
      .filter(function (b) {
        return b.owner === this.children.boss
      }.bind(this));

    var i = bossBullets.length - 1;
    for (; i >= 0; i--) {
      // detect if any bullet meets another bullet
      var bossBullet = bossBullets[i];
      if (bossBullet.gridX === bullet.gridX && bossBullet.gridY === bullet.gridY) {
        this.removeDisplayObject(bullet);
        this.removeDisplayObject(bossBullet);
        return true;
      }
    }
    return false;
  };

  World.prototype.checkAlive = function () {
    if (this.children.boss.health <= 0) {
      l('U WIN!');
      this.end();
      return;
    }
    if (this.children.warrior.health <= 0) {
      l('U DIE!');
      this.end();
      return;
    }
  }

  World.prototype.tick = function () {
    if (this.isEnd) {
      return;
    }

    this.render();
    this.update(this.ticker.elapsedMS, this.ticker.lastTime);

    this.hitTest();
    this.checkAlive();
  };

  World.prototype.start = function () {
    this.isEnd = false;
    this.ticker.add(this.tick, this);
  }

  World.prototype.pause = function () {
    if (this.isEnd) {
      return;
    }
    this.children.boss.pauseShoot();
    this.children.warrior.pauseAddBullet();
    this.ticker.stop();
  };

  World.prototype.resume = function () {
    this.ticker.start();
    this.children.boss.startShoot();
    this.children.warrior.startAddBullet();
  };

  World.prototype.end = function () {
    this.isEnd = true;
    this.pause();
  };

  global.World = World;


})(window, PIXI, jQuery, CONFIG);
