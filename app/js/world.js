;
(function (window, PIXI, $) {
  'use strict';
  // private varaibles
  var requestID;
  var t = 0;

  var World = (function () {
    // constructor
    function World(canvasId, bgColor, width, height) {
      var $canvas = document.getElementById(canvasId);
      this.bgColor = typeof bgColor !== 'undefined' ? bgColor : 0x8232CD;
      this.fullWindow = !width || !height;

      if (this.fullWindow) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
      } else {
        $canvas.classList.add('center');
      }

      this.renderer = PIXI.autoDetectRenderer(width, height, {
        view: $canvas
      });
      this.renderer.backgroundColor = this.bgColor;
      if (this.fullWindow) {
        this.bindWindowResize();
      }
      this.bindOrientationChange();

      this.width = this.renderer.width;
      this.height = this.renderer.height;
      this.setUnit();

      this.graphics = new PIXI.Graphics();
      this.playground = new PIXI.Container();

      this.bindClick();

      this.render();
    }

    // public functions
    World.prototype = {
      children: [], // child objects
      width: 0,
      height: 0,
      graphics: null,
      renderer: null,
      fullWindow: true,
      bgColor: 0x8232CD,
      worrior: null,

      loadAssets: function (assets, cb) {
        assets.forEach(function (asset) {
          PIXI.loader.add(asset);
        });
        PIXI.loader.load(cb);
      },

      addDisplayObject: function (obj, name) {
        obj.init();
        if(Array.isArray(obj.sprites)) {
          obj.sprites.forEach(function(sprite) {
            this.playground.addChild(sprite);
          }.bind(this));
        } else {
          this.playground.addChild(obj.sprites);
        }
        this.children.push(obj);

        if(obj.constructor.name == 'Worrior') {
          this.worrior = obj;
        }
      },

      bindWindowResize: function () {
        $(window).resize(function () {
          // don't use window.innerWidth and window.innerHeight here, 
          // or it will leave a block of space below the canvas
          // while change orientation to landscape.(iOS 7)
          this.resize(document.body.clientWidth, document.body.clientHeight);
        }.bind(this));
      },

      bindOrientationChange: function () {
        window.addEventListener('orientationchange', function () {
          this.resize(document.body.clientWidth, document.body.clientHeight);
        }, false);
      },

      bindClick: function () {
        var clickHandler = function () {
          this.worrior.revolutionDirection = this.worrior.revolutionDirection === DIRECTION.CW
            ? DIRECTION.CCW
            : DIRECTION.CW;
        }.bind(this);
        
        $(this.renderer.view)
          .on('touchstart', clickHandler)
          .on('click', clickHandler);
      },

      render: function () {
        this.renderer.render(this.playground);
      },

      setUnit: function () {
        this.unit = Math.min(this.width, this.height) * 0.001;
      },

      resize: function (width, height) {
        this.renderer.resize(width, height);
        this.width = this.renderer.width;
        this.height = this.renderer.height;
        this.setUnit();

        this.children.forEach(function(obj) {
          obj.paint();
        });

        // fix ios 7 wired scroll bug when change to landscape
        window.scrollTo(0, 0);
      },

      update: function (dt, t) {
        this.children.forEach(function(obj) {
          obj.update(dt, t);
        });
      },

      detectCollision: function () {

      },

      tick: function () {
        var lastTime;
        var animate = function(timestamp) {
          var dt = timestamp - (lastTime || timestamp);
          lastTime = timestamp;
          t += dt;

          this.update(dt, t);
          this.detectCollision();
          this.render();

          requestID = requestAnimationFrame(animate);
        }.bind(this);

        requestID = requestAnimationFrame(animate);

      }
    }

    return World;
  })();



  window.World = World;


})(window, PIXI, jQuery);
