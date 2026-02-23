/**
 * @date 2022-02-11
 */

(function() {

        window.addEventListener("load",function() {

            // console.log("globalThis", globalThis )
            console.log("Face3", TGH.Face3);
            // console.log("Gmetry", Gmetry);



            var width = window.innerWidth;
            var height = window.innerHeight;

            var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
            camera.position.z = 5;
            camera.position.y = -3;

            
            renderer = new THREE.WebGLRenderer({
              alpha: true
            });
            renderer.setSize(width, height);
            document.body.appendChild( renderer.domElement );
            
            var controls = new THREE.TrackballControls(camera, renderer.domElement);

            var scene = new THREE.Scene();


            var light = new THREE.PointLight( 0xffffff, 1, 100 );
            light.position.set( 20, 30, 40 );
            scene.add( light );

            var light = new THREE.AmbientLight( 0x404040 ); // soft white light
            scene.add( light );

            var material = new THREE.MeshNormalMaterial({
              side: THREE.DoubleSide,
              wireframe: true
            });

            // var image = document.getElementById('map');
            // var canvas = document.createElement('canvas');
            // canvas.width = 256;
            // canvas.height = 256;
            // var ctx = canvas.getContext('2d');
            // ctx.drawImage(image, 0, 0);

            // var texture = new THREE.Texture( canvas );
            // texture.needsUpdate = true;

            // var mapMaterial = new THREE.MeshBasicMaterial({
            //   // map: texture,
            //   side: THREE.DoubleSide
            // });
            var mapMaterial = new THREE.MeshBasicMaterial({
              color: 0xffffff, // 0x484848,
              transparent: true,
              opacity: 0.35,
              side: THREE.DoubleSide,
              wireframe: true
            })

            var PlaneHelper = function(plane) {
              var geom = new THREE.PlaneGeometry( 5, 5, 50, 50 );
              var material = new THREE.MeshBasicMaterial({
                color: '#333',
                side: THREE.DoubleSide,
                wireframe: true
              });
              var obj = new THREE.Mesh( geom, material );
              obj.lookAt(plane.normal);
              obj.translateOnAxis(
                new THREE.Vector3(1, 0, 0).cross(plane.normal).normalize(),
                plane.constant * -1
              );
              return obj;
            };

        //     var wavyPlaneGeom = function() {
        //       var degree = 3;
        //       var knots = [0, 0, 0, 0, 1, 1, 1, 1];
        //       var pts = [];
        //       var numPoints = 4;
        //       for (u = 0; u < numPoints; u++) {
        //         var ptsV = [];
        //         for (v = 0; v < numPoints; v++) {
        //           ptsV.push([
        //             u/numPoints - 0.5,
        //             Math.random() - 0.5,
        //             v/numPoints - 0.1
        //           ])
        //         }
        //         pts.push(ptsV)
        //       }
        //       var srf = verb.geom.NurbsSurface.byKnotsControlPointsWeights(degree, degree, knots, knots, pts);
        //       var geom = srf.toThreeGeometry();
        //       return geom;
        //     }

            var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

            var planeHelper = new PlaneHelper(plane);
            scene.add( planeHelper );

            var m = new THREE.Matrix4();
            var m1 = new THREE.Matrix4().makeRotationY(Math.PI / 3);
            var m2 = new THREE.Matrix4().makeRotationX(Math.PI / 3);
            m.multiplyMatrices( m1, m2 );

            // var geom = wavyPlaneGeom();
            // m.setPosition(new THREE.Vector3(0, -.8, 0));
            // geom.applyMatrix(m);
            // geom = sliceGeometry(geom, plane);
            // scene.add( new THREE.Mesh( geom, material ) );

        //     var geom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        //     m.setPosition(new THREE.Vector3(1.2, -.8, 0));
        //     geom.applyMatrix(m);
        //     geom = sliceGeometry(geom, plane);
        //     scene.add( new THREE.Mesh( geom, mapMaterial ) );

            var bgeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            // m.setPosition(new THREE.Vector3(1.2, -.8, 0));
            bgeom.applyMatrix4(m);
            var geom = new TGH.Gmetry().fromBufferGeometry(bgeom);
            geom = sliceGeometry(geom, plane);
            scene.add( new THREE.Mesh( geom.toBufferGeometry(), mapMaterial ) );

        //     var geom = new THREE.TorusGeometry( 0.5, 0.1, 16, 100 );
        //     m.setPosition(new THREE.Vector3(-1.2, -.8, 0));
        //     geom.applyMatrix(m);
        //     geom = sliceGeometry(geom, plane);
        //     scene.add( new THREE.Mesh( geom, mapMaterial ) );

        //     var geom = wavyPlaneGeom();
        //     m.setPosition(new THREE.Vector3(0, .8, 0));
        //     geom.applyMatrix(m);
        //     geom = sliceGeometry(geom, plane, true);
        //     scene.add( new THREE.Mesh( geom, material ) );

        //     var geom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        //     m.setPosition(new THREE.Vector3(1.2, .8, 0));
        //     geom.applyMatrix(m);
        //     geom = sliceGeometry(geom, plane, true);
        //     scene.add( new THREE.Mesh( geom, mapMaterial ) );

        //     var geom = new THREE.TorusGeometry( 0.5, 0.1, 16, 100 );
        //     m.setPosition(new THREE.Vector3(-1.2, .8, 0));
        //     geom.applyMatrix(m);
        //     geom = sliceGeometry(geom, plane, true);
        //     scene.add( new THREE.Mesh( geom, mapMaterial ) );

            function render() {
              renderer.render(scene, camera);
            }

            function animate() {
              render();
              controls.update();
              requestAnimationFrame(animate);
            }

            function onWindowResize() {
              width = window.innerWidth;
              height = window.innerHeight;
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              renderer.setSize(width, height);
            }

            controls.addEventListener('change', function() {
              render();
            });

            window.addEventListener('resize', onWindowResize, false);
            animate();


        });

})();