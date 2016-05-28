//$(function () {
'use strict';

//var world = new World('main', 0x8232CD, 500, 900);
// orbit 0x8232CD
// gold 0xFFD700
// goldenrod 0xDAA520
// orangered 0xFF4500
// orange 0xFFA500
// lightblue 0xADD8E6
// lightgreen 0x90EE90
// darkgreen 0x006400
// green 0x008000
// magenta 0xFF00FF

var world = new World('main', 0x006400);
world.loadAssets(CONFIG.sprites, main);

function main() {
  // △
  var boss = new Boss('boss', world);
  var warrior = new Warrior('warrior', world, Math.PI, 0.0010);
  // var warrior = new Warrior(['res/img/warrior.png'], world, Math.PI);

  world.addDisplayObject(boss);
  world.addDisplayObject(warrior);


  // var bulletShape = new PIXI.Graphics();
  // bulletShape.beginFill(0xFFFFFF, 1);
  // bulletShape.drawRect(200, 200, 100, 100); // drawRect(x, y, width, height)
  // bulletShape.endFill();
  // var bulletTexture = bulletShape.generateTexture();
  // var bs = new PIXI.Sprite(bulletTexture);
  // world.playground.addChild(bs);


  boss.addEnemy(warrior);
  world.start();
}


//});
