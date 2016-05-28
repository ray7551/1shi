var CONFIG = {
  sprites: {
    boss: {
      name: 'boss',
      url: 'res/img/boss.png'
    }, 
    warrior: {
      name: 'warrior',
      //shape: [ 0,19, 10,0, 19,19 ],
      url: 'res/img/warrior.png'
    }
  },
  world: {
    gridNum: 100 // 1000 x 1000 grid
  },
  boss: {
    size: 6,
    baseSpeedMultiple: 3.65,  // 1.65 is good for debug
    findSpeedMultiple: 8,
    defaultAttackPurview: Math.PI / 5,
    purviewEdgeMultiple: 0.4,
    health: 100,
    initAlpha: 1,
    minAlpha: 0.4,
    shootInterval: 200, // ms
    rotateInit: Math.PI,
    revolutionInit: 0,   // boss has no revolution, but boss's bullet need revolutionInit 
    bulletSpeed: 0.05
  },
  warrior: {
    radius: 40,
    size: 4,
    accelerateMultiple: 5,
    accelerateTime: 30,
    health: 20,
    bulletSpeed: -0.05,
    bulletNumLimit: 5,
    bulletAddInterval: 1000,

    revolutionInit: Math.PI,
    initSpeed: 0.0005
  },
  bullet: {
    color: {
      warrior: 0xFFFFFF,
      boss: 0x000000
    },
    size: {width: 1, height: 2},

    damage: 20,
    speed: -0.05,
    radius: 40,
    radian: 0,
    rotation: 0,
    position: {
      x: 0,
      y: 0
    }
  }
};