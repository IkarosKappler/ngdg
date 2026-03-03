/**
 * A script for testing the lib with three.js.
 *
 * @requires PlotBoilerplate
 * @requires Bounds
 * @requires MouseHandler
 * @requires gup
 * @requires dat.gui
 * @requires three.js
 *
 * @author   Ikaros Kappler
 * @date     2019-07-01
 * @version  1.0.0
 **/

(function (_context) {
  "use strict";

  window.addEventListener("load", function () {
    // Fetch the GET params
    var GUP = gup();
    var params = new Params(GUP);
    var isDarkmode = detectDarkMode(GUP);

    var modal = new Modal();

    var canvasId = "sculptmap-canvas";

    var canvas = document.getElementById(canvasId);
    var parent = canvas.parentElement;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = 500;

    var lightDistanceFactor = 10.0;
    var intensityFactor = 1.0;

    var ambientLightA = new THREE.AmbientLight(0x444444);
    ambientLightA.position.set(350, 0, -350).multiplyScalar(lightDistanceFactor * 5);
    // this.ambientLightA = new THREE.PointLight(0xffffff, intensityFactor * 5.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
    // this.ambientLightA.position.set(350, 0, -350).multiplyScalar(lightDistanceFactor);
    scene.add(ambientLightA);

    var ambientLightB = new THREE.PointLight(0xffffff, intensityFactor * 5.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
    ambientLightB.position.set(-350, 0, 350).multiplyScalar(lightDistanceFactor);
    scene.add(ambientLightB);

    var directionalLightA = new THREE.DirectionalLight(0xffffff, intensityFactor * 2.0);
    // this.directionalLightA = new THREE.PointLight(0xffffff, 1.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
    directionalLightA.position.set(350, 350, 350).multiplyScalar(lightDistanceFactor);
    scene.add(directionalLightA);
    scene.add(directionalLightA.target);

    var directionalLightB = new THREE.DirectionalLight(0xffffff, intensityFactor * 2.0);
    directionalLightB.position.set(-350, -350, -50).multiplyScalar(lightDistanceFactor);
    scene.add(directionalLightB);

    // Add grid helper
    var gridHelper = new THREE.GridHelper(90, 9);
    gridHelper.colorGrid = 0xe8e8e8;
    scene.add(gridHelper);

    // Add an axis helper
    var ah = new THREE.AxisHelper(50);
    ah.position.y -= 0.1; // The axis helper should not intefere with the grid helper
    scene.add(ah);

    // var geometry = new THREE.BoxGeometry(12, 12, 12);
    // scene.add(geometry);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      preserveDrawingBuffer: true, // This is required to take screen shots
      antialias: true // false
    });
    // TODO: check if this works!
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // var controls = options.makeOrbitControls(camera, renderer.domElement);
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", function () {
      directionalLightA.position.copy(camera.position);
    });
    controls.enableDamping = true;
    controls.dampingFactor = 1.0;
    controls.enableZoom = true;
    controls.target.copy(cube.position);
    controls.update();

    /**
     * Resize the 3d canvas to fit its container.
     */
    var resizeCanvas = function () {
      let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "" + width + "px";
      canvas.style.height = "" + height + "px";
      canvas.setAttribute("width", "" + width + "px");
      canvas.setAttribute("height", height + "px");
      renderer.setSize(width, height);
      // What am I doing here?
      camera.setViewOffset(width, height, width / 4, height / 20, width, height);
    };

    // +---------------------------------------------------------------------------------
    // | Show the current sculpt map.
    // +-------------------------------
    var showSculptmap = function () {
      modal.setTitle("Show Sculpt Map");
      modal.setFooter("");
      modal.setActions([Modal.ACTION_CLOSE]);
      //   const geometry = dildoGeneration.primaryDildoGeometry;
      //   const sculptmap = ngdg.SculptMap.fromDildoGeometry(geometry);
      //   const canvas = sculptmap.toCanvas();
      //   const dataString = canvas.toDataURL();
      var dataString = "xxxxx";
      modal.setBody('<div style="height: 60vh; width: 100%;"><img src="' + dataString + '" width="100%" height="100%"></div>');
      modal.open();
    };
    showSculptmap();

    // +---------------------------------------------------------------------------------
    // | Load the config from the local storage.
    // | Handle file drop.
    // +-------------------------------
    var fileDrop = new FileDrop(document.body);
    fileDrop.onFileBinaryDropped(function (blob, file) {
      console.log("Binary file dropped:", file, blob);
    });
    // fileDrop.onFileJSONDropped(function (jsonObject) {
    //   try {
    //     setPathInstance(BezierPath.fromArray(jsonObject));
    //     rebuild();
    //   } catch (e) {
    //     console.error("Failed to retrieve Bézier path from dropped file.", jsonObject);
    //     console.log(e);
    //   }
    // });

    window.addEventListener("resize", () => {
      resizeCanvas();
    });
    resizeCanvas();

    var animateCount = 0;
    const animate = () => {
      if (animateCount % 100 === 0) {
        console.log("animateCount", animateCount);
      }

      // Let's animate the cube: a rotation.
      cube.rotation.x += 0.05;
      cube.rotation.y += 0.04;

      controls.update();
      renderer.render(scene, camera);
      animateCount++;
      // Pass the render function itself
      requestAnimationFrame(animate);
    };
    animate();
  });
})(globalThis);
