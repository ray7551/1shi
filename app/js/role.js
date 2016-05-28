(function (global, PIXI, CONFIG) {
  'use strict';

  /**
   * @class
   * @param assets {string|string[]|PIXI.Texture} resourceID or resourceID array
   * @param world {World}
   * */
  function Role(assets, world) {
    this.assets = Array.isArray(assets)
      ? assets
      : (assets ? [assets] : []);

    /**
     * @member {PIXI.Sprite[]} Role#sprites
     * @memberOf Role#
     */
    this.sprites = [];
    /**
     * @member {Object[]}
     * @memberOf Role#
     */
    this.spritesOriginSize = [];

    /**
     * @member {World} world
     * @memberOf Role#
     */
    this.world = world;

    Object.defineProperties(this, {
      /**
       * @member {PIXI.Sprite} sprite
       * @memberOf Role#
       */
      sprite: {
        get: function () {
          return this.sprites[0];
        },
        set: function (val) {
          this.sprites[0] = val;
        },
        enumerable: true
      },
      /**
       * @member {{width: number, height: number}} originSize of first sprite
       * @memberOf Role#
       */
      originSize: {
        get: function () {
          return this.spritesOriginSize[0];
        },
        set: function () {
          new Error('You cannot set originSize');
        },
        enumerable: true
      },
      /**
       * @member {number}
       * @memberOf Role#
       */
      unit: {
        get: function () {
          return this.world.unit;
        },
        set: function () {
          new Error('You cannot set unit in a Role');
        },
        enumerable: true
      }
    });
  }

  /**
   * this update function will be invoked when using World#addDisplayElement
   * to add sprites
   * @memberOf Role#
   */
  Role.prototype.init = function () {
    this.assets.forEach(function (resourceID) {
      var sprite;
      if (typeof resourceID !== 'string') {
        if (resourceID.constructor !== PIXI.Texture) {
          return;
        }
        sprite = new PIXI.Sprite(resourceID);
      } else {
        sprite = new PIXI.Sprite(
          PIXI.Texture.fromImage(CONFIG.sprites[resourceID].url)
        );
      }

      this.sprites.push(sprite);
      this.spritesOriginSize.push({
        width: sprite.width,
        height: sprite.height
      });
    }.bind(this));
  };

  /**
   * this update function will be invoked in every world.tick loop
   * @memberOf Role#
   */
  Role.prototype.update = function () {
  };

  /**
   * this function will be invoked while boss initialization or every time world.resize
   * @memberOf Role#
   */
  Role.prototype.paint = function () {
  };

  Role.legalizeRadian = function (radian) {
    radian = radian % (2 * Math.PI);
    return radian < 0
      ? 2 * Math.PI + radian
      : radian;
  };

  Role.absRadianDiff = function (radian1, radian2) {
    var diff = Role.legalizeRadian(radian1) - Role.legalizeRadian(radian2);
    var abs = Math.abs(diff);
    return abs < Math.PI
      ? abs
      : 2 * Math.PI - abs;
  };

  Role.isBetween = function (radian, edge1, edge2) {
    radian = Role.legalizeRadian(radian);
    edge1 = Role.legalizeRadian(edge1);
    edge2 = Role.legalizeRadian(edge2);
    var abs = Math.abs(edge1 - edge2);

    if (abs > Math.PI) {
      return Role.isBetween(edge1 + Math.PI, edge2 + Math.PI);
    } else {
      return (radian >= edge1 && radian <= edge2)
        || (radian >= edge2 && radian <= edge1)
    }
  };

  Role.distance = function (positionA, positoinB) {
    return Math.pow(
      Math.pow(positionA.x - positoinB.x, 2) + Math.pow(positionA.y - positoinB.y, 2),
      0.5);
  }

  global.Role = Role;
})(window, PIXI, CONFIG);
