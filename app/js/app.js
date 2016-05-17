// $(function () {
//   'use strict';

  //var world = new World('main', 0x8232CD, 500, 900);
  // gold FFD700
  // goldenrod DAA520
  // orangered FF4500
  // orange FFA500
  // lightblue ADD8E6
  var world = new World('main', 0xFFA500);
  world.loadAssets([
    'res/img/boss.png',
    'res/img/worrior.png'
  ], main);

  function main() {
    // △
    var boss = new Boss(['res/img/boss.png'], world);
    var worrior = new Worrior(['res/img/worrior.png'], world);

    world.addDisplayObject(boss);
    world.addDisplayObject(worrior);

    boss.addEnemy(worrior);

    world.tick();
  }


// });
