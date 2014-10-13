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
        background: 'blue'

      @$domView.css
        margin: '0px'
        padding: '0px'
        position: 'absolute'
        background: 'red'

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

      flipTarget = $($('p'), $('p'))
      for e in flipTarget
        e = $(e)
        cssv(e, 'transform-origin', '50% 50%')
        cssv(e, 'transform-style', 'preserve-3d')
        cssv(e, 'transform', 'rotateX(30deg)')

    cssString: (matrix) ->
      t = matrix.elements

      string = [
        [t[ 0], t[ 4], t[ 8], t[12]].join(', '),
        [t[ 1], t[ 5], t[ 9], t[13]].join(', '),
        [t[ 2], t[ 6], t[10], t[14]].join(', '),
        [t[ 3], t[ 7], t[11], t[15]].join(', '),
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

  window.CSS3DCamera = CSS3DCamera

window.test = ->
  c = 0
  camera = new CSS3DCamera()
  mloop = ->
    position = new THREE.Vector3(0, 0, 1000 - c * 10)
    at = new THREE.Vector3(0, 0, 0)
    upTo = new THREE.Vector3(0, -1, 0)
    camera.lookAt(position, at, upTo)
    c++
  window.setInterval(mloop, 100)

(() ->
  if window.THREE isnt undefined and window.jQuery isnt undefined
    main(jQuery)
    if (window.test)
      window.test()
      return
  body = document.getElementsByTagName('body')[0]
  if body isnt undefined
    if window.jQuery is undefined
      script = document.createElement('script')
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"
      body.appendChild(script)
    if window.THREE is undefined
      script = document.createElement('script')
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r68/three.min.js"
      body.appendChild(script)
  setTimeout(arguments.callee, 400)
)()  
