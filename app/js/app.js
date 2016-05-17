// $(function () {
//   'use strict';

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
  world.loadAssets([
    'res/img/boss.png',
    'res/img/worrior.png'
  ], main);

  function main() {
    // △
    var boss = new Boss(['res/img/boss.png'], world);
    var worrior = new Worrior(['res/img/worrior.png'], world, Math.PI, 0.0005);

    world.addDisplayObject(boss);
    world.addDisplayObject(worrior);

    boss.addEnemy(worrior);

    world.tick();
  }


// });
