(function (global, CONFIG) {
  'use strict';
  var config = Object.assign({}, CONFIG.bullet);
  var textureInstance = {
    warrior: null,  // bullet texture instance for warrior
    boss: null      // bullet texture instance for boss
  };

  var BulletTexture = function () {
  }

  var generateTexture = function(ownerName) {
    ownerName = ownerName.toLowerCase();
    var bulletShape = new PIXI.Graphics();

    bulletShape.beginFill(config.color[ownerName], 1);
    bulletShape.drawRect(0, 0, 10, 10); // drawRect(x, y, width, height)
    bulletShape.endFill();
    return bulletShape.generateTexture();
  };

  BulletTexture.getTexture = function (ownerName) {
    if(textureInstance[ownerName]) {
      return textureInstance[ownerName];
    }

    textureInstance[ownerName] = generateTexture(ownerName);
    return textureInstance[ownerName];
  }

  global.BulletTexture = BulletTexture;
})(window, CONFIG);