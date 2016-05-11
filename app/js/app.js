$(function () {
  'use strict';


  var world = new World('main');

  // △
  var bossSize = world.width * 0.06;
  var boss = new PIXI.Text('▲', {
    font : bossSize + 'px Arial',
    align : 'center'
  });
  boss.alpha = .8;
  boss.rotation = 0;
  boss.rotateSpeed = 0.004;
  

  world.stage.addChild(boss);

  
  requestAnimationFrame(animate);

  var lastTime;
  function animate(timestamp) {
    var dt = timestamp - (lastTime || timestamp);
    lastTime = timestamp;

    boss.x = world.width / 2;
    boss.y = world.height / 2;
    boss.pivot.x = boss.width * .5;
    boss.pivot.y = boss.height * .5;
    boss.rotation += boss.rotateSpeed * dt;
    world.render();

    requestAnimationFrame(animate);
  }


});
