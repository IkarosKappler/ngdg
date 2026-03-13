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
    var scene = initScene();
    var meshes = [];

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.set(5, 5, 5);
    // cube.position.z = 25;
    // cube.position.x = 25;
    scene.scene.add(cube);
    meshes.push(cube);

    // var renderer = new THREE.WebGLRenderer({
    //   canvas: canvas,
    //   preserveDrawingBuffer: true, // This is required to take screen shots
    //   antialias: true // false
    // });
    // TODO: check if this works!
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // var controls = options.makeOrbitControls(camera, renderer.domElement);
    var controls = new THREE.OrbitControls(scene.camera, scene.renderer.domElement);
    controls.addEventListener("change", function () {
      scene.directionalLightA.position.copy(scene.camera.position);
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
      scene.canvas.width = width;
      scene.canvas.height = height;
      scene.canvas.style.width = "" + width + "px";
      scene.canvas.style.height = "" + height + "px";
      scene.canvas.setAttribute("width", "" + width + "px");
      scene.canvas.setAttribute("height", height + "px");
      scene.renderer.setSize(width, height);
      // What am I doing here?
      // camera.setViewOffset(width, height, width / 4, height / 20, width, height);
      // camera.lookAt({ x: 0, y: 0, z: 0 });
    };

    // +---------------------------------------------------------------------------------
    // | Show initial help dialog.
    // +-------------------------------
    var imageFile;
    var imageBlob;
    var imageDataUrl;
    var image;
    var sculptmapCanvas = document.getElementById("sculptmap-canvas");
    var sculptmapContext = sculptmapCanvas.getContext("2d");
    var showInfo = function () {
      modal.setTitle("Drop file");
      modal.setFooter("");
      modal.setActions([Modal.ACTION_CLOSE]);

      // var dataString = "xxxxx";
      var modalBody = document.createElement("div");
      var text = document.createElement("div");
      text.innerHTML = "Drop a sculpt map file here (an image file) or select a sculpt map file here: ";
      var fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      fileInput.setAttribute("accept", "image/*");
      modalBody.appendChild(text);
      modalBody.appendChild(fileInput);
      // modal.setBody(`
      //   Drop a sculpt map file here (an image file) or select a sculpt map file here:
      // `);
      modal.setBody(modalBody);
      modal.open();

      fileInput.addEventListener("input", function (event) {
        console.log("event", event);
        if (fileInput.files && fileInput.files[0]) {
          handleFileInput(fileInput.files[0]);
        }
      });
    };

    // +---------------------------------------------------------------------------------
    // | Show the current sculpt map.
    // +-------------------------------
    var showSculptmap = function () {
      return new Promise(function (accept, reject) {
        if (imageFile) {
          // Render image
          // var ctx = modalCanvas.getContext("2d");
          var img = new Image();
          img.onload = function () {
            var w = img.naturalWidth;
            var h = img.naturalHeight;
            sculptmapCanvas.setAttribute("width", w);
            sculptmapCanvas.setAttribute("height", h);
            sculptmapContext.clearRect(0, 0, w, h);
            sculptmapContext.drawImage(img, 0, 0, w, h);
            var pixelData = sculptmapContext.getImageData(0, 0, w, h);
            accept(pixelData);
          };
          img.onerror = reject;
          // img.src = imageDataUrl; // URL.createObjectURL(blob);
          img.src = URL.createObjectURL(imageFile);
        } else {
          reject();
        }
      });
    };
    showInfo();

    // +---------------------------------------------------------------------------------
    // | Export sculpt map if requested
    // +-------------------------------
    var stlExportButton = document.querySelector("#btn-export-stl");
    if (stlExportButton) {
      stlExportButton.addEventListener("click", function () {
        exportSTL(meshes[0]);
      });
    }

    // +---------------------------------------------------------------------------------
    // | Load the config from the local storage.
    // | Handle file drop.
    // +-------------------------------
    var fileDrop = new FileDrop(document.body);
    fileDrop.onFileBinaryDropped(function (blob, file) {
      handleBlobFileInput(blob, file);
    });

    // +---------------------------------------------------------------------------------
    // | Called from the <input type=file> input field on change
    // +-------------------------------
    var handleFileInput = function (file) {
      var reader = new FileReader();
      reader.onload = function (readEvent) {
        // document.getElementById('the-picture').setAttribute('src', e.target.result);
        const arrayBuffer = readEvent.target.result;
        var blob = new Blob([arrayBuffer], { type: file.type });
        handleBlobFileInput(blob, file);
      };
      // const arrayBuffer = reader.readAsArrayBuffer(file);
      reader.readAsArrayBuffer(file);
    };

    // +---------------------------------------------------------------------------------
    // | Called from the file input handler AND from the FileDrop handler.
    // +-------------------------------
    var handleBlobFileInput = function (blob, file) {
      console.log("Binary file dropped:", file, blob);
      imageFile = file;
      imageBlob = blob;
      imageDataUrl = URL.createObjectURL(blob);
      console.log("imageDataUrl", imageDataUrl);
      showSculptmap()
        .then(function (pixelData) {
          // Retrieve image data from sculpt map
          // sculptmapContext;
          var sculptMap = SculptMap.fromPixelData(pixelData);
          var sculptGeometry = sculptMap.toGeometry({ width: 20.0, height: 20.0, depth: 20.0 });
          const sculptMesh = new THREE.Mesh(sculptGeometry, material);
          // Remove current meshes
          meshes.forEach(function (mesh) {
            scene.scene.remove(mesh);
          });
          scene.scene.add(sculptMesh);
          meshes = [sculptMesh];
          scene.camera.lookAt(sculptMesh.position);
          modal.close();

          // Allow STL download
          var actionButtons = document.querySelector("#sculptmap-action-buttons");
          actionButtons.classList.remove("hidden");
        })
        .catch(function (e) {
          console.log("Failed to render sculpt map data to 2d image.");
          console.error(e);
        });
    };

    window.addEventListener("resize", () => {
      resizeCanvas();
    });
    resizeCanvas();

    var animateCount = 0;
    const animate = () => {
      // if (animateCount % 100 === 0) {
      //   console.log("animateCount", animateCount);
      // }

      // Let's animate the cube: a rotation.
      if (cube) {
        cube.rotation.x += 0.05;
        cube.rotation.y += 0.04;
      }

      controls.update();
      scene.renderer.render(scene.scene, scene.camera);
      animateCount++;
      // Pass the render function itself
      requestAnimationFrame(animate);
    };
    animate();
  }); // END init

  // +---------------------------------------------------------------------------------
  // | Initialized the whole 3D scene setup.
  // +-------------------------------
  var initScene = function () {
    var canvasId = "preview-canvas";
    var canvas = document.getElementById(canvasId);
    // var parent = canvas.parentElement;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = 150;
    camera.position.y = 150;

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

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      preserveDrawingBuffer: true, // This is required to take screen shots
      antialias: true // false
    });

    camera.lookAt({ x: 0, y: 0, z: 0 });

    return {
      canvas: canvas,
      scene: scene,
      camera: camera,
      ambientLightA: ambientLightA,
      ambientLightB: ambientLightB,
      directionalLightA: directionalLightA,
      directionalLightB: directionalLightB,
      renderer: renderer
    };
  };

  var exportSTL = function (mesh) {
    const exporter = new THREE.STLExporter();
    const data = exporter.parse(mesh, { binary: true });
    // saveFile(data, "dildomodel-from-sculptmap.stl");
    saveAs(new Blob([data], { type: "application/sla" }), "dildomodel-from-sculptmap.stl");
  };
})(globalThis);
