#javascript:(function(){var s=document.createElement("script");s.src="http://t02uk.github.io/experimental/js/css3dcamera.js"+(+new Date()); document.body.appendChild(s)})();

main = ($) ->

  cssv = (jqueryObj, name, value) ->
    prefices = ['', '-moz-', '-webkit-', '-o-', '-ms-']
    #jqueryObj.css(name, value)
    prefices = ['-webkit-']
    for prefix in prefices
      jqueryObj.css("#{prefix}#{name}", value)

  class CSS3DCamera
    constructor: ->
      @initializeProjmatrix()
      @initializeViewMatrix()
      @transformMatrix = new THREE.Matrix4()
      @setupDom()
      
    applyCss: ->

    initializeProjmatrix: ->
      viewAngle = 1.0
      far = -1
      near = -0.001
      y = 1.0 / Math.tan(viewAngle / 2.0)
      x = y
      z = far / (far - near)
      w = -z * near

      @projMatrix = new THREE.Matrix4(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 1,
        0, 0, w, 0
      ).transpose()

    initializeViewMatrix: ->
      @viewMatrix = new THREE.Matrix4()

    setupDom: ->
      @$domCamera = $('<div>').attr('id', 'camera')
      @$domView = $('<div>').attr('id', 'view')

      @$domCamera.append(@$domView)
      $body = $('body')
      for child in $body.children()
        @$domView.append(child)
      $body.append(@$domCamera)

      $body.css
        overflow: 'hidden'

      @$domCamera.css
        margin: '0px'
        padding: '0px'
        position: 'absolute'

      @$domView.css
        margin: '0px'
        padding: '0px'
        position: 'absolute'

      setDomPosition = =>
        width = $(window).width()
        height = $(window).height()
        @$domCamera.css
          left: width / 2
          top: height / 2

        @$domView.css
          left: 0
          top: 0

      setDomPosition()
      $(window).resize setDomPosition

      cssv(@$domCamera, 'perspective-origin', '0% 0%')
      cssv(@$domView, 'perspective-origin', '0% 0%')

      for e in $('*')
        e = $(e)
        cssv(e, 'transform-style', 'preserve-3d')

      flipTarget = $($('img'))
      for e in flipTarget
        e = $(e)
        cssv(e, 'transform-origin', '100% 100%')
        cssv(e, 'transform-style', 'preserve-3d')
        cssv(e, 'transform', 'rotateX(-60deg)')
        console.info(e)

    cssString: (matrix) ->
      t = matrix.elements

      string = [
        [t[ 0], t[ 1], t[ 2], t[ 3]].join(', '),
        [t[ 4], t[ 5], t[ 6], t[ 7]].join(', '),
        [t[ 8], t[ 9], t[10], t[11]].join(', '),
        [t[12], t[13], t[14], t[15]].join(', '),
      ].join(',   ')
      return "matrix3d(#{string})"

    lookAt: (p, a, u) ->
      pos = (p || new THREE.Vector3(0, 0, 0))
      at = (a || new THREE.Vector3(0, 0, 0))
      upTo = (u || new THREE.Vector3(0, 0, 1))

      z = at.clone().sub(pos).normalize()
      x = upTo.clone().cross(z).normalize()
      y = z.clone().cross(x).normalize().multiplyScalar(-1)

      p_x = -pos.dot(x)
      p_y = -pos.dot(y)
      p_z = -pos.dot(z)

      @viewMatrix.set(
        x.x, y.x, z.x, 0,
        x.y, y.y, z.y, 0,
        x.z, y.z, z.z, 0,
        p_x, p_y, p_z, 1
      )

      @transformMatrix.multiplyMatrices(@viewMatrix, @projMatrix).transpose()

      cssv(@$domCamera, 'transform', @cssString(@transformMatrix))

  class Walker
    constructor: ->
      @camera = new CSS3DCamera()
      @yaw = -0.1
      @pitch = 0.0
      @position = new THREE.Vector3(0, 100, 100)
      @upTo = new THREE.Vector3(0, 0, 1)

    update: ->
      if Keyboard.pressed(16)
        front = @direction()
        front.z = 0
        front.normalize()
        front.multiplyScalar(10)
        up = new THREE.Vector3(0, 0, -1)

        if Keyboard.pressed(37)
          @position.add(front.clone().applyAxisAngle(up, Math.PI / 2))
        if Keyboard.pressed(38)
          @position.add(front.clone().applyAxisAngle(up, Math.PI * 0))
        if Keyboard.pressed(39)
          @position.add(front.clone().applyAxisAngle(up,-Math.PI / 2))
        if Keyboard.pressed(40)
          @position.add(front.clone().applyAxisAngle(up,-Math.PI * 1))
      else
        if Keyboard.pressed(37)
          @pitch -= 0.1
        if Keyboard.pressed(39)
          @pitch += 0.1
        if Keyboard.pressed(38)
          @yaw += 0.1
        if Keyboard.pressed(40)
          @yaw -= 0.1

    apply: ->
      @at = @position.clone().add(@direction())
      @camera.lookAt(@position, @at, @upTo)

    direction: ->
      unit = new THREE.Vector3(0, 1, 0)
      unit.applyAxisAngle(new THREE.Vector3(1, 0, 0), @yaw)
      unit.applyAxisAngle(new THREE.Vector3(0, 0, 1), @pitch)
      unit

      

  class Keyboard
    @setup: ->
      Keyboard.keypressed = []
      $(window).keyup (e) ->
        Keyboard.keypressed[e.keyCode] = false
      $(window).keydown (e) ->
        console.info(e.keyCode)
        Keyboard.keypressed[e.keyCode] = true
    @pressed: (key) ->
      if key.charCodeAt
        !!Keyboard.keypressed[key.charCodeAt(0)]
      else
        !!Keyboard.keypressed[key]

  Keyboard.setup()

  test = ->
    walker = new Walker()
    (() ->
      walker.update()
      walker.apply()
      setTimeout(arguments.callee, 66)
    )()
  test()

# wait for loading external libraries
(() ->
  if window.THREE isnt undefined and window.jQuery isnt undefined
    main(jQuery)
    return
  body = document.getElementsByTagName('body')[0]
  if body isnt undefined
    if window.jQuery is undefined
      script = document.createElement('script')
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.js"
      body.appendChild(script)
    if window.THREE is undefined
      script = document.createElement('script')
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r68/three.js"
      body.appendChild(script)
  setTimeout(arguments.callee, 400)
)()  
