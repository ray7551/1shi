;
(function (global) {
  'use strict';

  function Role(assets, world) {
    this.assets = assets || [];
    this.sprites = [];
    this.spritesOriginSize = [];
    this.world = world;

    Object.defineProperties(this, {
      'sprite': {
        get: function () {
          return this.sprites[0];
        },
        set: function (val) {
          this.sprites[0] = val;
        },
        enumerable: true
      },
      'originSize': {
        get: function () {
          return this.spritesOriginSize[0];
        },
        set: function (val) {
          new Error('You cannot set originSize');
        },
        enumerable: true
      },
      'unit': {
        get: function() {
          return this.world.unit;
        },
        set: function (val) {
          new Error('You cannot set unit in a Role');
        },
        enumerable: true
      }
    });
  }

  Role.legalizeRadian = function(radian) {
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

    if(abs > Math.PI) {
      return Role.isBetween(edge1 + Math.PI, edge2 + Math.PI);
    } else {
      return (radian >= edge1 && radian <= edge2)
        || (radian >= edge2 && radian <= edge1)
    }
  }


  Role.prototype = {
    init: function () {
      this.assets.forEach(function (resourceID) {
        var sprite;
        sprite = new PIXI.Sprite(
          PIXI.Texture.fromImage(resourceID)
        );
        this.sprites.push(sprite);
        this.spritesOriginSize.push({
          width: sprite.width,
          height: sprite.height
        });
      }.bind(this));
    },

    update: function () {
      // this update function will be invoked in every world.tick loop
    },

    paint: function () {
      // this function will be invoded while boss initialization or every time world.resize
    }
  };



  global.Role = Role;
})(window);
