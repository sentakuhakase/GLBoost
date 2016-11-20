var arg = new Object;
var pair = location.search.substring(1).split('&');
for(var i = 0; pair[i] ; i++) {
  var kv = pair[i].split('=');
  arg[kv[0]] = kv[1];
}

GLBoost.TARGET_WEBGL_VERSION = arg.webglver ? parseInt(arg.webglver) : 1;
var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 640;

phina.globalize();

phina.define('MainScene', {
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit();

    var layer = phina.display.GLBoostLayer({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    }).addChildTo(this);

    var glBoostContext = layer.glBoostContext;

    var positions = [
      new GLBoost.Vector3(-0.5, -0.5, 0.0),
      new GLBoost.Vector3(0.5, -0.5, 0.0),
      new GLBoost.Vector3(-0.5,  0.5, 0.0),

      new GLBoost.Vector3(-0.5, 0.5, 0.0),
      new GLBoost.Vector3(0.5, -0.5, 0.0),
      new GLBoost.Vector3(0.5,  0.5, 0.0)

    ];
    var colors = [
      new GLBoost.Vector4(0.0, 1.0, 1.0, 1.0),
      new GLBoost.Vector4(1.0, 1.0, 0.0, 1.0),
      new GLBoost.Vector4(0.0, 0.0, 1.0, 1.0),

      new GLBoost.Vector4(0.0, 0.0, 1.0, 1.0),
      new GLBoost.Vector4(1.0, 1.0, 0.0, 1.0),
      new GLBoost.Vector4(1.0, 0.0, 0.0, 1.0)

    ];
    var texcoords = [
      new GLBoost.Vector2(0.0, 0.0),
      new GLBoost.Vector2(1.0, 0.0),
      new GLBoost.Vector2(0.0, 1.0),

      new GLBoost.Vector2(0.0, 1.0),
      new GLBoost.Vector2(1.0, 0.0),
      new GLBoost.Vector2(1.0, 1.0)
    ];

    var geometry = glBoostContext.createGeometry();
    geometry.setVerticesData({
      position: positions,
      //color: colors,
      texcoord: texcoords
    });

    var texture = glBoostContext.createPhinaTexture(512, 512, new GLBoost.Vector4(1, 0, 1, 0.2));
    
    var label = Label('phina.jsとGLBoostの夢の共演！');
    label.fill = 'white';
    label.stroke = 'black';
    label.fontSize = 28;
    label.strokeWidth = 4;
    label.x = label.calcCanvasWidth()/2;
    label.y = label.calcCanvasHeight()/2;
    label.y += 100;
    
    var heart = HeartShape({radius: 86});
    heart.x = heart.calcCanvasWidth()/2;
    heart.y = heart.calcCanvasHeight()/2;
    heart.x += 130;
    heart.y += 150;
    
    texture.addPhinaObject(label).addPhinaObject(heart).renderPhinaObjects();

    var material = glBoostContext.createClassicMaterial();
    material.diffuseTexture = texture;
    var mesh = glBoostContext.createMesh(geometry, material);
    layer.scene.addChild( mesh );

    var camera = glBoostContext.createPerspectiveCamera(
        {
          eye: new GLBoost.Vector3(0.0, 0, 2.0),
          center: new GLBoost.Vector3(0.0, 0.0, 0.0),
          up: new GLBoost.Vector3(0.0, 1.0, 0.0)
        },
        {
          fovy: 45.0,
          aspect: 1.0,
          zNear: 0.1,
          zFar: 300.0
        }
    );
    layer.scene.addChild( camera );

    layer.expression.prepareToRender();

    var delta = 0;
    layer.update = function() {

      mesh.rotate = new GLBoost.Vector3(0, delta, 0);

      delta += 0.3;
        /*
      var rotateMatrix = GLBoost.Matrix44.rotateY(-1.0);
      var rotatedVector = rotateMatrix.multiplyVector(camera.eye);
      camera.eye = rotatedVector;*/
    };



  }
});

phina.main(function() {
  var app = GameApp({
    startLabel: 'main',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  });

  app.fps = 120;
  app.enableStats();
  app.run();
});

