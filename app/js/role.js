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
