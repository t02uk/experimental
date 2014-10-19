// Generated by CoffeeScript 1.6.3
(function() {
  var main;

  main = function($) {
    var CSS3DCamera, Keyboard, Walker, cssv, test;
    cssv = function(jqueryObj, name, value) {
      var prefices, prefix, _i, _len, _results;
      prefices = ['', '-moz-', '-webkit-', '-o-', '-ms-'];
      prefices = ['-webkit-'];
      _results = [];
      for (_i = 0, _len = prefices.length; _i < _len; _i++) {
        prefix = prefices[_i];
        _results.push(jqueryObj.css("" + prefix + name, value));
      }
      return _results;
    };
    CSS3DCamera = (function() {
      function CSS3DCamera() {
        this.initializeProjmatrix();
        this.initializeViewMatrix();
        this.transformMatrix = new THREE.Matrix4();
        this.setupDom();
      }

      CSS3DCamera.prototype.initializeProjmatrix = function() {
        var far, near, viewAngle, w, x, y, z;
        viewAngle = 1.0;
        far = -1;
        near = -0.001;
        y = 1.0 / Math.tan(viewAngle / 2.0);
        x = y;
        z = far / (far - near);
        w = -z * near;
        return this.projMatrix = new THREE.Matrix4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 1, 0, 0, w, 0).transpose();
      };

      CSS3DCamera.prototype.initializeViewMatrix = function() {
        return this.viewMatrix = new THREE.Matrix4();
      };

      CSS3DCamera.prototype.setupDom = function() {
        var $body, child, setDomPosition, _i, _len, _ref,
          _this = this;
        this.$domCamera = $('<div>').attr('id', 'camera');
        this.$domView = $('<div>').attr('id', 'view');
        this.$domCamera.append(this.$domView);
        $body = $('body');
        _ref = $body.children();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          this.$domView.append(child);
        }
        $body.append(this.$domCamera);
        $body.css({
          overflow: 'hidden'
        });
        this.$domCamera.css({
          margin: '0px',
          padding: '0px',
          position: 'absolute'
        });
        this.$domView.css({
          margin: '0px',
          padding: '0px',
          position: 'absolute'
        });
        setDomPosition = function() {
          var height, width;
          width = $(window).width();
          height = $(window).height();
          _this.$domCamera.css({
            left: width / 2,
            top: height / 2
          });
          return _this.$domView.css({
            left: 0,
            top: 0
          });
        };
        setDomPosition();
        $(window).resize(setDomPosition);
        cssv(this.$domCamera, 'perspective-origin', '0% 0%');
        return cssv(this.$domView, 'perspective-origin', '0% 0%');
      };

      CSS3DCamera.prototype.cssString = function(matrix) {
        var string, t;
        t = matrix.elements;
        string = [[t[0], t[1], t[2], t[3]].join(', '), [t[4], t[5], t[6], t[7]].join(', '), [t[8], t[9], t[10], t[11]].join(', '), [t[12], t[13], t[14], t[15]].join(', ')].join(',   ');
        return "matrix3d(" + string + ")";
      };

      CSS3DCamera.prototype.lookAt = function(p, a, u) {
        var at, p_x, p_y, p_z, pos, upTo, x, y, z;
        pos = p || new THREE.Vector3(0, 0, 0);
        at = a || new THREE.Vector3(0, 0, 0);
        upTo = u || new THREE.Vector3(0, 0, 1);
        z = at.clone().sub(pos).normalize();
        x = upTo.clone().cross(z).normalize();
        y = z.clone().cross(x).normalize().multiplyScalar(-1);
        p_x = -pos.dot(x);
        p_y = -pos.dot(y);
        p_z = -pos.dot(z);
        this.viewMatrix.set(x.x, y.x, z.x, 0, x.y, y.y, z.y, 0, x.z, y.z, z.z, 0, p_x, p_y, p_z, 1);
        this.transformMatrix.multiplyMatrices(this.viewMatrix, this.projMatrix).transpose();
        return cssv(this.$domCamera, 'transform', this.cssString(this.transformMatrix));
      };

      return CSS3DCamera;

    })();
    Walker = (function() {
      function Walker() {
        this.camera = new CSS3DCamera();
        this.yaw = -0.1;
        this.pitch = 0.0;
        this.position = new THREE.Vector3($(document).width() / 4, 100, 100);
        this.upTo = new THREE.Vector3(0, 0, 1);
        this.installCss();
        this.stepPotential = 0;
      }

      Walker.prototype.installCss = function() {
        var asters, customCss, flipAnimation, flipClass, flopAnimation, flopClass, keyframes, prefices, prefix, stylehtml;
        prefices = ['', '-moz-', '-webkit-', '-o-', '-ms-'];
        asters = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = prefices.length; _i < _len; _i++) {
            prefix = prefices[_i];
            _results.push("" + prefix + "transform-style: preserve-3d;");
          }
          return _results;
        })();
        asters = "* {\n  " + (asters.join("\n")) + ";\n}";
        keyframes = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = prefices.length; _i < _len; _i++) {
            prefix = prefices[_i];
            _results.push("@" + prefix + "keyframes css3dcamera-flip-kf {\n  0%   { " + prefix + "transform: rotateX(  0deg); }\n  100% { " + prefix + "transform: rotateX(-60deg); }\n}\n@" + prefix + "keyframes css3dcamera-flop-kf {\n  0%   { " + prefix + "transform: rotateX(-60deg); }\n  100% { " + prefix + "transform: rotateX(  0deg); }\n}");
          }
          return _results;
        })();
        flipAnimation = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = prefices.length; _i < _len; _i++) {
            prefix = prefices[_i];
            _results.push("" + prefix + "transform-origin: 100% 100%;\n" + prefix + "transform-style: preserve-3d;\n" + prefix + "animation: css3dcamera-flip-kf ease 0.5s normal;\n" + prefix + "transform: rotateX(-60deg);");
          }
          return _results;
        })();
        flipClass = ".css3dcamera-flip {\n  " + (flipAnimation.join("\n")) + ";\n}";
        flopAnimation = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = prefices.length; _i < _len; _i++) {
            prefix = prefices[_i];
            _results.push("" + prefix + "transform-origin: 100% 100%;\n" + prefix + "transform-style: preserve-3d;\n" + prefix + "animation: css3dcamera-flop-kf ease 0.5s normal;\n" + prefix + "transform: rotateX(  0deg);");
          }
          return _results;
        })();
        flopClass = ".css3dcamera-flop {\n  " + (flopAnimation.join("\n")) + ";\n}";
        stylehtml = [asters, keyframes.join("\n"), flipClass, flopClass].join("\n");
        customCss = $("<style>").attr('type', 'text/css').html(stylehtml);
        return ($('head') || $('html')).append(customCss);
      };

      Walker.prototype.flipFlopElements = function() {
        var css, e, _i, _len, _ref;
        if (!this.flipedMoreThanOnce) {
          css = $("<style>").attr('type', 'text/css').html("* {\n  overflow: visible !important;\n}");
          ($('head') || $('html')).append(css);
        }
        _ref = $('img, video, canvas, embed, object, input, textarea, select, label, button, applet, iframe');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          e = $(e);
          if (!e.hasClass('css3dcamera-flip')) {
            e.addClass('css3dcamera-flip');
            e.removeClass('css3dcamera-flop');
          } else {
            e.addClass('css3dcamera-flop');
            e.removeClass('css3dcamera-flip');
          }
        }
        return this.flipedMoreThanOnce = true;
      };

      Walker.prototype.update = function() {
        var front, up;
        if (Keyboard.pressed(16)) {
          front = this.direction();
          front.z = 0;
          front.normalize();
          front.multiplyScalar(30);
          up = new THREE.Vector3(0, 0, -1);
          this.addStepPotential();
          if (Keyboard.pressed(37)) {
            this.position.add(front.clone().applyAxisAngle(up, Math.PI / 2));
          }
          if (Keyboard.pressed(38)) {
            this.position.add(front.clone().applyAxisAngle(up, Math.PI * 0));
          }
          if (Keyboard.pressed(39)) {
            this.position.add(front.clone().applyAxisAngle(up, -Math.PI / 2));
          }
          if (Keyboard.pressed(40)) {
            return this.position.add(front.clone().applyAxisAngle(up, -Math.PI * 1));
          }
        } else {
          if (Keyboard.pressed(37)) {
            this.pitch -= 0.1;
          }
          if (Keyboard.pressed(39)) {
            this.pitch += 0.1;
          }
          if (Keyboard.pressed(38)) {
            this.yaw += 0.1;
          }
          if (Keyboard.pressed(40)) {
            this.yaw -= 0.1;
          }
          if (Keyboard.downed(32) || Keyboard.downed(13)) {
            return this.flipFlopElements();
          }
        }
      };

      Walker.prototype.addStepPotential = function() {
        if (this.stepPotential <= 0) {
          return this.stepPotential += 4;
        }
      };

      Walker.prototype.apply = function() {
        var geta;
        geta = Math.sin(this.stepPotential * Math.PI / 4) * 0.02;
        this.at = this.position.clone().add(this.direction());
        this.camera.lookAt(this.position.clone().add(new THREE.Vector3(0, 0, geta)), this.at, this.upTo);
        if (this.stepPotential > 0) {
          return this.stepPotential--;
        }
      };

      Walker.prototype.direction = function() {
        var unit;
        unit = new THREE.Vector3(0, 1, 0);
        unit.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.yaw);
        unit.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.pitch);
        return unit;
      };

      return Walker;

    })();
    Keyboard = (function() {
      function Keyboard() {}

      Keyboard.setup = function() {
        Keyboard.pressedState = [];
        Keyboard.downedState = [];
        Keyboard.flush();
        $(window).keyup(function(e) {
          Keyboard.pressedState[e.keyCode] = false;
          return Keyboard.downedState[e.keyCode] = 0;
        });
        return $(window).keydown(function(e) {
          Keyboard.pressedState[e.keyCode] = true;
          return Keyboard.downedState[e.keyCode]++;
        });
      };

      Keyboard.pressed = function(key) {
        if (key.charCodeAt) {
          return !!Keyboard.pressedState[key.charCodeAt(0)];
        } else {
          return !!Keyboard.pressedState[key];
        }
      };

      Keyboard.downed = function(key) {
        if (key.charCodeAt) {
          return Keyboard.downedState[key.charCodeAt(0)] === 1;
        } else {
          return Keyboard.downedState[key] === 1;
        }
      };

      Keyboard.flush = function() {
        var i, _i, _results;
        _results = [];
        for (i = _i = 0; _i <= 255; i = ++_i) {
          _results.push(Keyboard.downedState[i] = 0);
        }
        return _results;
      };

      return Keyboard;

    })();
    Keyboard.setup();
    test = function() {
      var walker;
      walker = new Walker();
      return (function() {
        walker.update();
        walker.apply();
        setTimeout(arguments.callee, 66);
        return Keyboard.flush();
      })();
    };
    return test();
  };

  (function() {
    var body, script;
    if (window.THREE !== void 0 && window.jQuery !== void 0) {
      main(jQuery);
      return;
    }
    body = document.getElementsByTagName('body')[0];
    if (body !== void 0) {
      if (window.jQuery === void 0) {
        script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.js";
        body.appendChild(script);
      }
      if (window.THREE === void 0) {
        script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r68/three.js";
        body.appendChild(script);
      }
    }
    return setTimeout(arguments.callee, 400);
  })();

}).call(this);

/*
//@ sourceMappingURL=css3dcamera.map
*/
