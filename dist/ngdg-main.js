/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/cjs/BumpMapper.js":
/*!*******************************!*\
  !*** ./src/cjs/BumpMapper.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * A helper to apply bumpmaps to any rectangular mesh.
 *
 * @author  Ikaros Kappler
 * @date    2021-09-06
 * @modified 2022-02-22 Replaced Gmetry by ThreeGeometryHellfix.Gmetry.
 * @version 1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BumpMapper = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
var computeVertexNormals_1 = __webpack_require__(/*! ./computeVertexNormals */ "./src/cjs/computeVertexNormals.js");
var GeometryGenerationHelpers_1 = __webpack_require__(/*! ./GeometryGenerationHelpers */ "./src/cjs/GeometryGenerationHelpers.js");
var three_geometry_hellfix_1 = __webpack_require__(/*! three-geometry-hellfix */ "./node_modules/three-geometry-hellfix/src/esm/index.js");
exports.BumpMapper = {
    applyBumpmap: function (dildoGeometry, bufferedGeometry, bumpmap, material, options) {
        var collectedVertexNormals = (0, computeVertexNormals_1.computeVertexNormals)(dildoGeometry, bufferedGeometry);
        var dildoNormalGeometry = new three_geometry_hellfix_1.Gmetry();
        dildoNormalGeometry.vertices = collectedVertexNormals.map(function (normalLine) {
            var endPoint = normalLine.end.clone();
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.normalizeVectorXYZ(normalLine.start, endPoint, options.bumpmapStrength);
            return endPoint;
        });
        var dildoNormalsMesh = new THREE.Points(dildoNormalGeometry.toBufferGeometry(), new THREE.PointsMaterial({
            size: 1.4,
            color: 0x00ffff
        }));
        // if (options.showBumpmapTargets) {
        //   dildoNormalsMesh.position.y = -100;
        //   this.addMesh(dildoNormalsMesh);
        // }
        var dildoMesh = null;
        console.log("options.useBumpmap", options.useBumpmap, "bumpmap", bumpmap);
        // const heightMap = createHeightMapFromImage( bumpmapTexture ):
        if (options.useBumpmap && bumpmap) {
            for (var y = 0; y < dildoGeometry.vertexMatrix.length; y++) {
                for (var x = 0; x < dildoGeometry.vertexMatrix[y].length; x++) {
                    var vertIndex = dildoGeometry.vertexMatrix[y][x];
                    var vertex = dildoGeometry.vertices[vertIndex];
                    var yRatio = 1.0 - y / (dildoGeometry.vertexMatrix.length - 1);
                    var xRatio = x / (dildoGeometry.vertexMatrix[y].length - 1);
                    var lerpFactor = bumpmap.getHeightAt(xRatio, yRatio);
                    var lerpTarget = dildoNormalGeometry.vertices[vertIndex];
                    vertex.lerp(lerpTarget, lerpFactor);
                }
            }
            // Also lerp top point
            //   const vertIndex: number = dildoGeometry.topIndex;
            //   //   const vertIndex: number = dildoGeometry.vertexMatrix[dildoGeometry.vertexMatrix.length - 1][0];
            //   const vertex: THREE.Vector3 = dildoGeometry.vertices[vertIndex];
            //   const yRatio: number = 0.0;
            //   const xRatio: number = 0.5;
            //   const lerpFactor: number = bumpmap.getHeightAt(xRatio, yRatio);
            //   const lerpTarget: THREE.Vector3 = dildoNormalGeometry.vertices[vertIndex];
            //   vertex.lerp(lerpTarget, lerpFactor);
            // Override the buffered geometry! (bumpmap has been applied)
            // TODO: verify correctness with Gmery
            // bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry as unknown as Gmetry);
            bufferedGeometry = dildoGeometry.toBufferGeometry();
            bufferedGeometry.computeVertexNormals();
            // Override the mesh! (bumpmap has been applied)
            dildoMesh = new THREE.Mesh(bufferedGeometry, material);
        }
        return { dildoMesh: dildoMesh, dildoNormalsMesh: dildoNormalsMesh };
    }
};
//# sourceMappingURL=BumpMapper.js.map

/***/ }),

/***/ "./src/cjs/DildoGeneration.js":
/*!************************************!*\
  !*** ./src/cjs/DildoGeneration.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * A class to manage 3d scenes and the generation of dildo models.
 *
 * @author   Ikaros Kappler
 * @date     2020-07-01
 * @modified 2020-09-11 Added proper texture loading.
 * @modified 2021-06-07 Fixing `removeCachedGeometries`. Adding bending of model.
 * @modified 2021-08-29 Ported this class to Typescript from vanilla JS.
 * @modified 2022-02-03 Added `clearResults` function.
 * @modified 2022-02-22 Replaced Gmetry by ThreeGeometryHellfix.Gmetry.
 * @version  1.2.3
 **/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DildoGeneration = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
var VertexNormalsHelper_1 = __webpack_require__(/*! three/examples/jsm/helpers/VertexNormalsHelper */ "./node_modules/three/examples/jsm/helpers/VertexNormalsHelper.js");
var DildoGeometry_1 = __webpack_require__(/*! ./DildoGeometry */ "./src/cjs/DildoGeometry.js");
var DildoMaterials_1 = __webpack_require__(/*! ./DildoMaterials */ "./src/cjs/DildoMaterials.js");
var GeometryGenerationHelpers_1 = __webpack_require__(/*! ./GeometryGenerationHelpers */ "./src/cjs/GeometryGenerationHelpers.js");
var mergeGeometries_1 = __webpack_require__(/*! ./mergeGeometries */ "./src/cjs/mergeGeometries.js");
var PathFinder_1 = __webpack_require__(/*! ./PathFinder */ "./src/cjs/PathFinder.js");
var randomWebColor_1 = __webpack_require__(/*! ./randomWebColor */ "./src/cjs/randomWebColor.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
var BumpMapper_1 = __webpack_require__(/*! ./BumpMapper */ "./src/cjs/BumpMapper.js");
var three_geometry_hellfix_1 = __webpack_require__(/*! three-geometry-hellfix */ "./node_modules/three-geometry-hellfix/src/esm/index.js");
var DildoGeneration = /** @class */ (function () {
    function DildoGeneration(canvasId, options) {
        this.canvas = document.getElementById(canvasId);
        this.parent = this.canvas.parentElement;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 500;
        var lightDistanceFactor = 10.0;
        var intensityFactor = 1.0;
        this.ambientLightA = new THREE.AmbientLight(0x444444);
        this.ambientLightA.position.set(350, 0, -350).multiplyScalar(lightDistanceFactor * 5);
        // this.ambientLightA = new THREE.PointLight(0xffffff, intensityFactor * 5.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
        // this.ambientLightA.position.set(350, 0, -350).multiplyScalar(lightDistanceFactor);
        this.scene.add(this.ambientLightA);
        this.ambientLightB = new THREE.PointLight(0xffffff, intensityFactor * 5.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
        this.ambientLightB.position.set(-350, 0, 350).multiplyScalar(lightDistanceFactor);
        this.scene.add(this.ambientLightB);
        this.directionalLightA = new THREE.DirectionalLight(0xffffff, intensityFactor * 2.0);
        // this.directionalLightA = new THREE.PointLight(0xffffff, 1.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
        this.directionalLightA.position.set(350, 350, 350).multiplyScalar(lightDistanceFactor);
        this.scene.add(this.directionalLightA);
        this.scene.add(this.directionalLightA.target);
        this.directionalLightB = new THREE.DirectionalLight(0xffffff, intensityFactor * 2.0);
        this.directionalLightB.position.set(-350, -350, -50).multiplyScalar(lightDistanceFactor);
        this.scene.add(this.directionalLightB);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            preserveDrawingBuffer: true,
            antialias: true // false
        });
        // TODO: check if this works!
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls = options.makeOrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();
        // Cache all geometries for later removal
        this.geometries = [];
        // Remember partial results
        // Record<string,object>
        this.partialResults = {};
        // Record<string.THREE.Mesh>
        this.splitResults = {};
        var _self = this;
        window.addEventListener("resize", function () {
            _self.resizeCanvas();
        });
        this.resizeCanvas();
        var animate = function () {
            requestAnimationFrame(animate);
            _self.controls.update();
            _self.renderer.render(_self.scene, _self.camera);
        };
        animate();
    }
    /**
     * Resize the 3d canvas to fit its container.
     */
    DildoGeneration.prototype.resizeCanvas = function () {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = "" + width + "px";
        this.canvas.style.height = "" + height + "px";
        this.canvas.setAttribute("width", "" + width + "px");
        this.canvas.setAttribute("height", height + "px");
        this.renderer.setSize(width, height);
        // What am I doing here?
        this.camera.setViewOffset(width, height, width / 4, height / 20, width, height);
    };
    /**
     * Clears the current scene and rebuilds everything from scratch according to the
     * mesh options being passed.
     *
     * @param {BezierPath} options.outline
     * @param {number}     options.segmentCount
     * @param {number}     options.outlineSegmentCount (>= 2).
     * @param {number}     options.bendAngle The bending angle in degrees (!).
     * @param {boolean}    options.performSlice
     * @param {boolean?}   options.useTextureImage
     * @param {string?}    options.textureImagePath
     * @param {boolean?}   options.wireframe
     * @param {string}     options.renderFaces - "double" or "front" (default) or "back"
     **/
    DildoGeneration.prototype.rebuild = function (options) {
        this.removeCachedGeometries();
        this.clearResults();
        var baseRadius = options.outline.getBounds().width;
        var baseShape = GeometryGenerationHelpers_1.GeometryGenerationHelpers.mkCircularPolygon(baseRadius, options.shapeSegmentCount, options.baseShapeExcentricity);
        var useBumpmap = typeof options.useBumpmap !== "undefined" ? options.useBumpmap : false;
        // const bumpmapPath = "./assets/img/bumpmap.png";
        // const bumpmapTexture: THREE.Texture | null = useBumpmap ? DildoMaterials.loadTextureImage(bumpmapPath) : null;
        var bumpmap = useBumpmap && options.bumpmap ? options.bumpmap : null;
        var dildoGeometry = new DildoGeometry_1.DildoGeometry(Object.assign({ baseShape: baseShape /*, bumpmapTexture: bumpmapTexture */ }, options));
        var useTextureImage = options.useTextureImage && typeof options.textureImagePath !== "undefined";
        var textureImagePath = typeof options.textureImagePath !== "undefined" ? options.textureImagePath : null;
        var doubleSingleSide = options.renderFaces === "double" ? THREE.DoubleSide : options.renderFaces === "back" ? THREE.BackSide : THREE.FrontSide;
        var wireframe = typeof options.wireframe !== "undefined" ? options.wireframe : false;
        var material = DildoMaterials_1.DildoMaterials.createMainMaterial(useTextureImage, wireframe, textureImagePath, doubleSingleSide);
        // This can be overriden in later steps! (after bumpmap was applied)
        // let bufferedGeometry: THREE.BufferGeometry = new THREE.BufferGeometry().fromGeometry(
        //   dildoGeometry as unknown as Gmetry
        // );
        // TODO: verify correctness
        var bufferedGeometry = dildoGeometry.toBufferGeometry();
        bufferedGeometry.computeVertexNormals();
        // This can be overriden in later steps! (after bumpmap was applied)
        var dildoMesh = new THREE.Mesh(bufferedGeometry, material);
        this.camera.lookAt(new THREE.Vector3(20, 0, 150));
        this.camera.lookAt(dildoMesh.position);
        var spineGeometry = new three_geometry_hellfix_1.Gmetry();
        dildoGeometry.spineVertices.forEach(function (spineVert) {
            spineGeometry.vertices.push(spineVert.clone());
        });
        if (options.addSpine) {
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.addSpine(this, spineGeometry);
        }
        // Add perpendicular path?
        if (options.showBasicPerpendiculars) {
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.addPerpendicularPaths(this, dildoGeometry);
        }
        // Show computed dildo normals?
        // if (options.previewBumpmap || options.useBumpmap) {
        if (options.useBumpmap) {
            // const collectedVertexNormals: Array<THREE.Line3> = computeVertexNormals(
            //   dildoGeometry as unknown as Gmetry,
            //   bufferedGeometry
            // );
            // const dildoNormalGeometry = new Gmetry();
            // dildoNormalGeometry.vertices = collectedVertexNormals.map((normalLine: THREE.Line3) => {
            //   const endPoint: THREE.Vector3 = normalLine.end.clone();
            //   GeometryGenerationHelpers.normalizeVectorXYZ(normalLine.start, endPoint, options.bumpmapStrength);
            //   return endPoint;
            // });
            // const dildoNormalsMesh: THREE.Points = new THREE.Points(
            //   dildoNormalGeometry,
            //   new THREE.PointsMaterial({
            //     size: 1.4,
            //     color: 0x00ffff
            //   })
            // );
            // if (options.showBumpmapTargets) {
            //   dildoNormalsMesh.position.y = -100;
            //   this.addMesh(dildoNormalsMesh);
            // }
            // console.log("options.useBumpmap", options.useBumpmap, "bumpmap", bumpmap);
            // // const heightMap = createHeightMapFromImage( bumpmapTexture ):
            // if (options.useBumpmap && bumpmap) {
            //   for (var y = 0; y < dildoGeometry.vertexMatrix.length; y++) {
            //     for (var x = 0; x < dildoGeometry.vertexMatrix[y].length; x++) {
            //       const vertIndex: number = dildoGeometry.vertexMatrix[y][x];
            //       const vertex: THREE.Vector3 = dildoGeometry.vertices[vertIndex];
            //       const yRatio: number = y / (dildoGeometry.vertexMatrix.length - 1);
            //       const xRatio: number = x / (dildoGeometry.vertexMatrix[y].length - 1);
            //       const lerpFactor: number = bumpmap.getHeightAt(xRatio, yRatio);
            //       const lerpTarget: THREE.Vector3 = dildoNormalGeometry.vertices[vertIndex];
            //       vertex.lerp(lerpTarget, lerpFactor);
            //     }
            //   }
            //   // Override the buffered geometry! (bumpmap has been applied)
            //   bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry as unknown as Gmetry);
            //   bufferedGeometry.computeVertexNormals();
            //   // Override the mesh! (bumpmap has been applied)
            //   dildoMesh = new THREE.Mesh(bufferedGeometry, material);
            // }
            var _a = BumpMapper_1.BumpMapper.applyBumpmap(dildoGeometry, bufferedGeometry, bumpmap, material, options), bumpmappedDildoMesh = _a.dildoMesh, dildoNormalsMesh = _a.dildoNormalsMesh;
            dildoMesh = bumpmappedDildoMesh;
            if (options.showBumpmapTargets) {
                // dildoNormalsMesh.position.y = -100;
                dildoNormalsMesh.position.y = constants_1.SPLIT_MESH_OFFSET.y;
                this.addMesh(dildoNormalsMesh);
            }
        }
        if (options.performSlice) {
            this.__performPlaneSlice(dildoMesh, dildoGeometry, wireframe, useTextureImage, textureImagePath, options);
            // The CSG operations are not reliable.
            // this.__performCsgSlice(latheMesh, geometry, material);
        }
        else {
            // dildoMesh.position.y = -100;
            dildoMesh.position.y = constants_1.SPLIT_MESH_OFFSET.y;
            dildoMesh.userData["isExportable"] = true;
            this.addMesh(dildoMesh);
            if (options.showNormals) {
                var vnHelper = new VertexNormalsHelper_1.VertexNormalsHelper(dildoMesh, options.normalsLength, 0x00ff00); // Fourth param 1?
                // TODO: use addMesh() here?
                this.scene.add(vnHelper);
                this.geometries.push(vnHelper);
            }
        }
    };
    /**
     * Perform the actual slice operation.
     *
     * This will create several new meshes:
     *  * a left geometry slice (along the z- axis).
     *  * a right geometry slice (along the z+ axis).
     *  * an inner slice cut geometry (inside the dildo model, cutting it into two halves).
     *  * an outer slice cut geometry (inside the mould model, cutting that one into two halves).
     *
     * These will always be generated, even if the options tell different; if so then they are set
     * to be invisible.
     *
     * @param {ThreeGeometryHellfix.Gmetry} latheMesh - The buffered dildo geometry (required to perform the slice operation).
     * @param {DildoGeometry} latheUnbufferedGeometry - The unbuffered dildo geometry (required to obtain the perpendicular path lines).
     * @param {boolean} wireframe
     */
    DildoGeneration.prototype.__performPlaneSlice = function (latheMesh, latheUnbufferedGeometry, wireframe, useTextureImage, textureImagePath, options) {
        // var epsilon = 0.000001;
        var leftPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        var leftSliceGeometry = GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeSlice(latheUnbufferedGeometry, leftPlane);
        var rightPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
        var rightSliceGeometry = GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeSlice(latheUnbufferedGeometry, rightPlane);
        var sliceMaterial = DildoMaterials_1.DildoMaterials.createSliceMaterial(useTextureImage, wireframe, textureImagePath);
        // Find points on intersection path (this is a single path in this configuration)
        var planeGeom = new THREE.PlaneGeometry(300, 500);
        var planeMesh = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({
            color: 0x484848,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        }));
        planeMesh.rotation.x = Math.PI / 5;
        this.partialResults[constants_1.KEY_SPLIT_PANE_MESH] = planeMesh;
        if (options.showSplitPane) {
            planeMesh.position.z = 0.5;
            this.addMesh(planeMesh);
        }
        var planeIntersectionPoints = GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeAndAddPlaneIntersection(this, latheMesh, latheUnbufferedGeometry, planeMesh, planeGeom, options);
        // Find the connected path (there is only one if you choose the cut plane properly)
        // Note that it doesn't matter which slice geometry we use as left and right match
        // perfectly together at their cut plane.
        // Array<number[]>
        var connectedPaths = new PathFinder_1.PathFinder().findAllPathsOnMesh(leftSliceGeometry, planeIntersectionPoints);
        // TEST what the connected paths look like
        // TODO: add an option and only add to scene if desired.
        for (var p = 0; p < connectedPaths.length; p++) {
            // TODO: verify
            // const geometry: Gmetry = new Gmetry();
            // geometry.vertices = connectedPaths[p].map(function (geometryVertexIndex) {
            //   return leftSliceGeometry.vertices[geometryVertexIndex];
            // });
            var vertices = connectedPaths[p].map(function (geometryVertexIndex) {
                return leftSliceGeometry.vertices[geometryVertexIndex];
            });
            var geometry = GeometryGenerationHelpers_1.GeometryGenerationHelpers.verticesToBufferGeometry(vertices);
            var linesMesh_1 = new THREE.Line(geometry, // .toBufferGeometry(),
            new THREE.LineBasicMaterial({
                color: (0, randomWebColor_1.randomWebColor)(i, "Mixed") // 0x8800a8
            }));
            // linesMesh.position.y = -100;
            linesMesh_1.position.y = constants_1.SPLIT_MESH_OFFSET.y;
            // linesMesh.position.z = -50;
            this.addMesh(linesMesh_1);
        }
        if (options.addPrecalculatedShapeOutlines) {
            // TEST what the line mesh looks like
            var pointGeometry = new three_geometry_hellfix_1.Gmetry();
            pointGeometry.vertices = planeIntersectionPoints;
            var linesMesh = new THREE.Line(pointGeometry.toBufferGeometry(), new THREE.LineBasicMaterial({
                color: 0x8800a8
            }));
            // linesMesh.position.y = -100;
            // linesMesh.position.z = -50;
            linesMesh.position.y = constants_1.SPLIT_MESH_OFFSET.y;
            linesMesh.position.z = constants_1.SPLIT_MESH_OFFSET.z;
            this.addMesh(linesMesh);
        }
        // Triangulate connected paths
        var triangulatedGeometries = [];
        for (var i = 0; i < connectedPaths.length; i++) {
            var triangulationGeometry = GeometryGenerationHelpers_1.GeometryGenerationHelpers.makePlaneTriangulation(this, leftSliceGeometry, connectedPaths[i], options);
            triangulatedGeometries.push(triangulationGeometry);
            // Merge together left and right slice geometry with the triangulated
            // cut faces.
            if (options.closeCutAreas) {
                (0, mergeGeometries_1.mergeGeometries)(leftSliceGeometry, triangulationGeometry, constants_1.EPS);
                (0, mergeGeometries_1.mergeGeometries)(rightSliceGeometry, triangulationGeometry, constants_1.EPS);
            }
        }
        // const arrangeSplitsOnPlane = true;
        if (options.showLeftSplit) {
            leftSliceGeometry.uvsNeedUpdate = true;
            // TODO: check if this is still required
            leftSliceGeometry.buffersNeedUpdate = true;
            leftSliceGeometry.computeVertexNormals();
            var slicedMeshLeft = new THREE.Mesh(leftSliceGeometry.toBufferGeometry(), sliceMaterial);
            // slicedMeshLeft.position.y = -100;
            // slicedMeshLeft.position.z = -50;
            slicedMeshLeft.position.y = constants_1.SPLIT_MESH_OFFSET.y;
            slicedMeshLeft.position.z = constants_1.SPLIT_MESH_OFFSET.z;
            // if (arrangeSplitsOnPlane) {
            //   // slicedMeshLeft.rotation.x = -Math.PI / 2;
            //   slicedMeshLeft.rotation.y = -Math.PI / 2.0;
            //   slicedMeshLeft.rotation.z = Math.PI / 2.0;
            // }
            slicedMeshLeft.userData["isExportable"] = true;
            this.addMesh(slicedMeshLeft);
            this.splitResults[constants_1.KEY_SLICED_MESH_LEFT] = slicedMeshLeft;
            if (options.showNormals) {
                var vnHelper = new VertexNormalsHelper_1.VertexNormalsHelper(slicedMeshLeft, options.normalsLength, 0x00ff00);
                this.scene.add(vnHelper);
                this.geometries.push(vnHelper);
            }
        }
        if (options.showRightSplit) {
            rightSliceGeometry.uvsNeedUpdate = true;
            // TODO: check if this is still required
            rightSliceGeometry.buffersNeedUpdate = true;
            rightSliceGeometry.computeVertexNormals();
            var slicedMeshRight = new THREE.Mesh(rightSliceGeometry.toBufferGeometry(), sliceMaterial);
            // slicedMeshRight.position.y = -100;
            // slicedMeshRight.position.z = 50;
            slicedMeshRight.position.y = constants_1.SPLIT_MESH_OFFSET.y;
            slicedMeshRight.position.z = -constants_1.SPLIT_MESH_OFFSET.z; // Important: use inverse value here!
            slicedMeshRight.userData["isExportable"] = true;
            this.addMesh(slicedMeshRight);
            this.splitResults[constants_1.KEY_SLICED_MESH_RIGHT] = slicedMeshRight;
            if (options.showNormals) {
                var vnHelper = new VertexNormalsHelper_1.VertexNormalsHelper(slicedMeshRight, options.normalsLength, 0x00ff00);
                this.scene.add(vnHelper);
                this.geometries.push(vnHelper);
            }
        }
        // Remember everything
        this.partialResults[constants_1.KEY_LEFT_SLICE_PLANE] = leftPlane;
        this.partialResults[constants_1.KEY_LEFT_SLICE_GEOMETRY] = leftSliceGeometry;
        this.partialResults[constants_1.KEY_RIGHT_SLICE_PLANE] = rightPlane;
        this.partialResults[constants_1.KEY_RIGHT_SLICE_GEOMETRY] = rightSliceGeometry;
        this.partialResults[constants_1.KEY_PLANE_INTERSECTION_POINTS] = planeIntersectionPoints;
        this.partialResults[constants_1.KEY_SPLIT_TRIANGULATION_GEOMETRIES] = triangulatedGeometries;
    };
    //   /**
    //    * Make a triangulation of the given path specified by the verted indices.
    //    *
    //    * @param {Array<number>} connectedPath - An array of vertex indices.
    //    * @return {ThreeGeometryHellfix.Gmetry} trianglesMesh
    //    */
    //   var makePlaneTriangulation = function (generator, sliceGeometry, connectedPath, options) {
    //     // Convert the connected paths indices to [x, y, x, y, x, y, ...] coordinates (requied by earcut)
    //     var currentPathXYData = connectedPath.reduce(function (earcutInput, vertIndex) {
    //       var vert = sliceGeometry.vertices[vertIndex];
    //       earcutInput.push(vert.x, vert.y);
    //       return earcutInput;
    //     }, []);
    //     // Array<number> : triplets of vertex indices in the plain XY array
    //     var triangles = earcut(currentPathXYData);
    //     // Convert triangle indices back to a geometry
    //     var trianglesGeometry = new Gmetry();
    //     // We will merge the geometries in the end which will create clones of the vertices.
    //     // No need to clone here.
    //     // trianglesGeometry.vertices = leftSliceGeometry.vertices;
    //     trianglesGeometry.vertices = connectedPath.map(function (geometryVertexIndex) {
    //       return sliceGeometry.vertices[geometryVertexIndex];
    //     });
    //     // Array<{x,y}> is compatible with Array<{x,y,z}> here :)
    //     var flatSideBounds = Bounds.computeFromVertices(trianglesGeometry.vertices);
    //     for (var t = 0; t < triangles.length; t += 3) {
    //       var a = triangles[t];
    //       var b = triangles[t + 1];
    //       var c = triangles[t + 2];
    //       trianglesGeometry.faces.push(new THREE.Face3(a, b, c));
    //       // Add UVs
    //       UVHelpers.makeFlatTriangleUVs(trianglesGeometry, flatSideBounds, a, b, c);
    //     }
    //     trianglesGeometry.uvsNeedUpdate = true;
    //     trianglesGeometry.buffersNeedUpdate = true;
    //     trianglesGeometry.computeVertexNormals();
    //     var trianglesMesh = new THREE.Mesh(
    //       trianglesGeometry,
    //       new THREE.MeshBasicMaterial({
    //         color: 0x0048ff,
    //         transparent: true,
    //         opacity: 0.55,
    //         side: THREE.DoubleSide
    //       })
    //     );
    //     trianglesMesh.position.y = -100;
    //     // trianglesMesh.position.z += 1.0; // Avoid Moiré with plane mesh?
    //     trianglesMesh.userData["isExportable"] = false;
    //     generator.partialResults[KEY_PLANE_INTERSECTION_TRIANGULATION] = trianglesGeometry;
    //     if (options.showSplitShapeTriangulation) {
    //       generator.addMesh(trianglesMesh);
    //     }
    //     return trianglesGeometry;
    //   };
    /**
     * Add a mesh to the underlying scene.
     *
     * The function will make some modifications to the rotation of the meshes.
     * @param {THREE.Mesh} mesh
     */
    DildoGeneration.prototype.addMesh = function (mesh) {
        mesh.rotation.x = Math.PI;
        this.scene.add(mesh);
        this.geometries.push(mesh);
    };
    DildoGeneration.prototype.removeCachedGeometries = function () {
        for (var i = 0; i < this.geometries.length; i++) {
            var old = this.geometries[i];
            // Remove old object.
            //  A better way would be to update the lathe in-place. Possible?
            this.scene.remove(old);
            //   if (typeof old.dispose == "function") old.dispose();
            //   if (typeof old.material != "undefined" && typeof old.material.dispose == "function") old.material.dispose();
            if (old instanceof THREE.Mesh) {
                old.geometry.dispose();
                old.material.dispose();
            }
        }
        this.geometries = [];
    };
    DildoGeneration.prototype.clearResults = function () {
        this.splitResults[constants_1.KEY_SLICED_MESH_RIGHT] = null;
        this.splitResults[constants_1.KEY_SLICED_MESH_LEFT] = null;
        this.partialResults[constants_1.KEY_LEFT_SLICE_PLANE] = null;
        this.partialResults[constants_1.KEY_LEFT_SLICE_GEOMETRY] = null;
        this.partialResults[constants_1.KEY_RIGHT_SLICE_PLANE] = null;
        this.partialResults[constants_1.KEY_RIGHT_SLICE_GEOMETRY] = null;
        this.partialResults[constants_1.KEY_PLANE_INTERSECTION_POINTS] = null;
        this.partialResults[constants_1.KEY_SPLIT_TRIANGULATION_GEOMETRIES] = null;
    };
    /**
     * Generate an STL string from the (exportable) meshes that are currently stored inside this generator.
     *
     * @param {function(string)} options.onComplete
     **/
    DildoGeneration.prototype.generateSTL = function (options, exporter) {
        // const exporter: STLExporter = new STLExporter();
        var stlBuffer = [];
        // TODO: merge all exportable geometries together and export as one.
        for (var i in this.geometries) {
            if (this.geometries[i].userData["isExportable"] === true) {
                var stlData = exporter.parse(this.geometries[i]);
                stlBuffer.push(stlData);
            }
        }
        if (typeof options.onComplete === "function") {
            options.onComplete(stlBuffer.join("\n\n"));
        }
        else {
            console.warn("STL data was generated but no 'onComplete' callback was defined.");
        }
    };
    return DildoGeneration;
}()); // END class
exports.DildoGeneration = DildoGeneration;
//# sourceMappingURL=DildoGeneration.js.map

/***/ }),

/***/ "./src/cjs/DildoGeometry.js":
/*!**********************************!*\
  !*** ./src/cjs/DildoGeometry.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * @require THREE.Geometry
 *
 * @author   Ikaros Kappler
 * @date     2020-07-08
 * @modified 2021-06-11 Fixing top and bottom points; preparing slicing of mesh.
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry (and Face3).
 * @version  1.0.3
 **/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DildoGeometry = void 0;
// TODOs
// + Add cut-plane faces when hollow
// + Move vertex-creating helper functions out of the class
// + Move face-creating helper functions out of the class
// + Move UV-creating helper functions out of the class
// + port to typescript
var plotboilerplate_1 = __webpack_require__(/*! plotboilerplate */ "./node_modules/plotboilerplate/src/esm/index.js");
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
var GeometryGenerationHelpers_1 = __webpack_require__(/*! ./GeometryGenerationHelpers */ "./src/cjs/GeometryGenerationHelpers.js");
var earcut_typescript_1 = __webpack_require__(/*! earcut-typescript */ "./node_modules/earcut-typescript/src/cjs/earcut.js"); // TODO: fix earcut types
var UVHelpers_1 = __webpack_require__(/*! ./UVHelpers */ "./src/cjs/UVHelpers.js");
var cjs_1 = __webpack_require__(/*! three-geometry-hellfix/src/cjs */ "./node_modules/three-geometry-hellfix/src/cjs/index.js");
var DEG_TO_RAD = Math.PI / 180.0;
// import { DEG_TO_RAD } from "./constants";
// This is a dirty workaround to
// avoid direct class extending of THREE.Geometry.
// I am using `THREE.Geometry.call(this);` instead :/
// export class DildoBaseClass {
//   // implements IDildoGeometry {
//   vertices: Array<THREE.Vector3>;
//   faces: Array<Face3>;
//   faceVertexUvs: Array<Array<[THREE.Vector2, THREE.Vector2, THREE.Vector2]>>;
//   uvsNeedUpdate: boolean;
//   buffersNeedUpdate: boolean;
//   constructor() {
//     this.vertices = [];
//     this.faces = [];
//     this.faceVertexUvs = [[]];
//   }
// }
// export class DildoGeometry { // extends globalThis.THREE.Geometry {
// export class DildoGeometry extends DildoBaseClass {
var DildoGeometry = /** @class */ (function (_super) {
    __extends(DildoGeometry, _super);
    /**
     * Create a new dildo geometry from the passed options..
     *
     * @param {Polygon} options.baseShape - The base shape to use (this is usually some regular polygon).
     * @param {BezierPath} options.outline - The lathe outline to use.
     * @param {number} options.bendAngle - A bend angle (in degrees!). Will only be applied if isBending=true.
     * @param {number} options.outlineSegmentCount (>= 2).
     * @param {boolean} options.isBending - Switch bending on/off no matter what the bend angle says.
     * @param {boolean} options.makeHollow - Make a hollow mold.
     **/
    function DildoGeometry(options) {
        var _this = _super.call(this) || this;
        // TODO: verify
        // THREE.Geometry.call(this);
        cjs_1.Gmetry.call(_this);
        _this.vertexMatrix = []; // Array<Array<number>>
        _this.topIndex = -1;
        _this.bottomIndex = -1;
        _this.spineVertices = []; // Array<THREE.Vector>
        _this.outerPerpLines = []; // Array<Three.Line3>
        _this.innerPerpLines = []; // Array<Three.Line3>
        _this.flatSidePolygon = null; // Polygon (2d)
        _this.leftFlatIndices = []; // Array<number>
        _this.rightFlatIndices = []; // Array<number>
        _this.leftFlatTriangleIndices = []; // Array[[number,number,number]]
        _this.rightFlatTriangleIndices = []; // Array[[number,number,number]]
        _this.flatSideBounds = null; // Bounds
        // The four corner vertices from the hollow shell plus the bottom vertex indices left and right
        _this.hollowBottomEdgeVertIndices = []; // [number,number,number,number, number, number]
        _this.hollowBottomTriagles = []; // Array<[number,number,number]>
        _this.dildoNormals = [];
        _this._buildVertices(options);
        _this._buildFaces(options);
        _this._buildUVMapping(options);
        // Fill up missing UVs to avoid warnings
        // This is a bit dirty, but not in call cases it is useful to create UV mappings
        // while (this.faceVertexUvs[0].length < this.faces.length) {
        //   this.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0.5, 1)]);
        // }
        if (options.useBumpmap) {
            if (options.bumpmapTexture) {
                _this.__applyBumpmap(options.bumpmapTexture);
            }
            else {
                console.warn("Cannot apply bumpmap as desired, because the bumpmap texture is null or undefined.");
            }
        }
        return _this;
    }
    /**
     *
     * @param {Polygon} baseShape
     * @param {Vertex} shapeCenter
     * @param {Bounds} outlineBounds
     * @param {THREE.Vertex3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @param {number=0} shapeTwistAngle - The angle to twist this particular shape around the y axis.
     * @return { yMin: number, yMax : number }
     */
    DildoGeometry.prototype.__buildSlice = function (baseShape, outlineBounds, outlineVert, sliceIndex, heightT, isBending, bendAngle, arcRadius, shapeTwistAngle) {
        var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
        // TODO: are these is use?
        var yMin, yMax;
        for (var i = 0; i < baseShape.vertices.length; i++) {
            var shapeVert = baseShape.vertices[i];
            if (isBending) {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, 0, shapeVert.y * outlineXPct);
                // Apply twist
                rotateVertY(vert, shapeTwistAngle, 0, 0);
                this._bendVertex(vert, bendAngle, arcRadius, heightT);
                vert.y += outlineBounds.max.y;
            }
            else {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, outlineVert.y, shapeVert.y * outlineXPct);
                // Apply twist
                rotateVertY(vert, shapeTwistAngle, 0, 0);
            }
            this.vertexMatrix[sliceIndex][i] = this.vertices.length;
            this.vertices.push(vert);
            if (sliceIndex == 0) {
                if (i == 0)
                    yMin = vert.y;
                if (i + 1 == baseShape.vertices.length)
                    yMax = vert.y;
            }
        } // END for
    };
    /**
     *
     * @param {Polygon} baseShape
     * @param {Vertex} shapeCenter
     * @param {Bounds} outlineBounds
     * @param {THREE.Vertex3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @return { yMin: number, yMax : number }
     */
    DildoGeometry.prototype.__buildSpine = function (shapeCenter, outlineBounds, outlineVert, heightT, isBending, bendAngle, arcRadius) {
        var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
        // Find shape's center point to construct a spine
        var spineVert = shapeCenter.clone();
        if (isBending) {
            var vert = new THREE.Vector3(spineVert.x * outlineXPct, 0, spineVert.y * outlineXPct);
            this._bendVertex(vert, bendAngle, arcRadius, heightT);
            vert.y += outlineBounds.max.y;
        }
        else {
            var vert = new THREE.Vector3(spineVert.x * outlineXPct, outlineVert.y, spineVert.y * outlineXPct);
        }
        this.spineVertices.push(vert);
    };
    /**
     *
     * @param {Polygon} baseShape
     * @param {Bounds} outlineBounds
     * @param {THREE.Vertex3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @return { yMin: number, yMax : number }
     */
    DildoGeometry.prototype.__buildPerps = function (baseShape, outlineBounds, outlineVert, // THREE.Vector3?
    perpendicularVert, heightT, isBending, bendAngle, arcRadius, normalizePerpendiculars, normalsLength) {
        var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
        var halfIndices = [0, Math.floor(baseShape.vertices.length / 2)];
        for (var j = 0; j < halfIndices.length; j++) {
            var i = halfIndices[j];
            var shapeVert = baseShape.vertices[i];
            if (isBending) {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, 0, shapeVert.y * outlineXPct);
                this._bendVertex(vert, bendAngle, arcRadius, heightT);
                vert.y += outlineBounds.max.y;
            }
            else {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, outlineVert.y, shapeVert.y * outlineXPct);
            }
            var perpDifference = new THREE.Vector3(outlineVert.x - perpendicularVert.x, outlineVert.y - perpendicularVert.y, 0);
            // TODO: check (this is in both cases the same)
            if (i == 0)
                var endVert = new THREE.Vector3(vert.x - perpendicularVert.x, vert.y + perpendicularVert.y, 0);
            else
                var endVert = new THREE.Vector3(vert.x + perpendicularVert.x, vert.y + perpendicularVert.y, 0);
            rotateVert(endVert, bendAngle * heightT, vert.x, vert.y);
            var outerPerpVert = vert.clone();
            outerPerpVert.x += perpDifference.x;
            outerPerpVert.y += perpDifference.y;
            outerPerpVert.z += perpDifference.z;
            if (normalizePerpendiculars) {
                GeometryGenerationHelpers_1.GeometryGenerationHelpers.normalizeVectorXY(vert, endVert, normalsLength);
            }
            if (i == 0) {
                this.outerPerpLines.push(new THREE.Line3(vert, endVert));
            }
            else {
                this.innerPerpLines.push(new THREE.Line3(vert, endVert));
            }
        } // END for
    };
    //   /**
    //    *
    //    * @param {Polygon} baseShape
    //    * @param {Bounds} outlineBounds
    //    * @param {THREE.Vertex3} outlineVert
    //    * @param {number} sliceIndex
    //    * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
    //    * @param {boolean} isBending
    //    * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
    //    * @param {number=} arcRadius
    //    * @param {boolean=} normalizePerpendiculars
    //    * @param {number=} normalsLength
    //    * @return { yMin: number, yMax : number }
    //    */
    //   __buildNormals(
    //     outlineSegmentIndex: number,
    //     baseShape: Polygon,
    //     outlineBounds: Bounds,
    //     outlineVert: Vertex, // THREE.Vector3?
    //     perpendicularVert: Vertex,
    //     heightT: number,
    //     isBending: boolean,
    //     bendAngle: number,
    //     arcRadius: number,
    //     normalizePerpendiculars: boolean,
    //     normalsLength: number
    //   ) {
    //     // var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
    //     // var halfIndices = [0, Math.floor(baseShape.vertices.length / 2)];
    //     // for (var j = 0; j < halfIndices.length; j++) {
    //     //   var i = halfIndices[j];
    //     //   var shapeVert = baseShape.vertices[i];
    //     //   if (isBending) {
    //     //     var vert = new THREE.Vector3(shapeVert.x * outlineXPct, 0, shapeVert.y * outlineXPct);
    //     //     this._bendVertex(vert, bendAngle, arcRadius, heightT);
    //     //     vert.y += outlineBounds.max.y;
    //     //   } else {
    //     //     var vert = new THREE.Vector3(shapeVert.x * outlineXPct, outlineVert.y, shapeVert.y * outlineXPct);
    //     //   }
    //     //   var perpDifference = new THREE.Vector3(outlineVert.x - perpendicularVert.x, outlineVert.y - perpendicularVert.y, 0);
    //     //   if (i == 0) var endVert = new THREE.Vector3(vert.x - perpendicularVert.x, vert.y + perpendicularVert.y, 0);
    //     //   else var endVert = new THREE.Vector3(vert.x + perpendicularVert.x, vert.y + perpendicularVert.y, 0);
    //     //   rotateVert(endVert, bendAngle * heightT, vert.x, vert.y);
    //     //   var outerPerpVert = vert.clone();
    //     //   outerPerpVert.x += perpDifference.x;
    //     //   outerPerpVert.y += perpDifference.y;
    //     //   outerPerpVert.z += perpDifference.z;
    //     //   if (normalizePerpendiculars) {
    //     //     normalizeVectorXY(vert, endVert, normalsLength);
    //     //   }
    //     //   if (i == 0) {
    //     //     this.outerPerpLines.push(new THREE.Line3(vert, endVert));
    //     //   } else {
    //     //     this.innerPerpLines.push(new THREE.Line3(vert, endVert));
    //     //   }
    //     // } // END for
    //     var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
    //     var halfIndices = [0, Math.floor(baseShape.vertices.length / 2)];
    //     // Just append? Should be growing from 0 to n-1
    //     this.dildoNormals[outlineSegmentIndex] = [];
    //     // for (var j = 0; j < halfIndices.length; j++) {
    //     console.log("baseShape.vertices.length", baseShape.vertices.length);
    //     for (var i = 0; i < baseShape.vertices.length; i++) {
    //       //   var i = halfIndices[j];
    //       var shapeVert = baseShape.vertices[i];
    //       var perpDifference = new THREE.Vector3(outlineVert.x - perpendicularVert.x, outlineVert.y - perpendicularVert.y, 0);
    //       normalizeVectorXY(outlineVert, perpDifference, normalsLength);
    //       rotateVertY(perpDifference, bendAngle * heightT, vert.x, vert.y);
    //       if (i == 0) {
    //         console.log("perpDifference", perpDifference);
    //       }
    //       if (isBending) {
    //         var vert = new THREE.Vector3(shapeVert.x * outlineXPct, 0, shapeVert.y * outlineXPct);
    //         // vert.add(new THREE.Vector3(perpDifference.x, 0, perpDifference.y));
    //         // vert.sub(perpDifference);
    //         this._bendVertex(vert, bendAngle, arcRadius, heightT);
    //         vert.y += outlineBounds.max.y;
    //       } else {
    //         var vert = new THREE.Vector3(shapeVert.x * outlineXPct, outlineVert.y, shapeVert.y * outlineXPct);
    //         // vert.add(new THREE.Vector3(perpDifference.x, perpDifference.y, 0));
    //         // vert.sub(perpDifference);
    //       }
    //       //   var perpDifference = new THREE.Vector3(outlineVert.x - perpendicularVert.x, outlineVert.y - perpendicularVert.y, 0);
    //       // TODO: check (this is in both cases the same)
    //       //   if (i == 0) var endVert = new THREE.Vector3(vert.x - perpendicularVert.x, vert.y + perpendicularVert.y, vert.z);
    //       //   //0);
    //       //   else var endVert = new THREE.Vector3(vert.x + perpendicularVert.x, vert.y + perpendicularVert.y, vert.z); // 0);
    //       // var endVert = new THREE.Vector3(vert.x + perpendicularVert.x, vert.y + perpendicularVert.y, vert.z);
    //       //   rotateVert(endVert, bendAngle * heightT, vert.x, vert.y);
    //       var outerPerpVert = vert.clone();
    //       outerPerpVert.x += perpDifference.x;
    //       outerPerpVert.y += perpDifference.y;
    //       outerPerpVert.z += perpDifference.z;
    //       // TODO: re-check
    //       if (true || normalizePerpendiculars) {
    //         // normalizeVectorXY(vert, endVert, normalsLength);
    //         // normalizeVectorXYZ(vert, endVert, normalsLength);
    //       }
    //       // Add to cut lines?
    //       //   if (i == 0) {
    //       //     this.outerPerpLines.push(new THREE.Line3(vert, endVert));
    //       //   } else if (i == halfIndices[1]) {
    //       //     this.innerPerpLines.push(new THREE.Line3(vert, endVert));
    //       //   }
    //       // Add to regular normals
    //       this.dildoNormals[outlineSegmentIndex].push(vert);
    //       if (i == 0) {
    //         // console.log("endVert", outerPerpVert);
    //       }
    //     } // END for
    //   }
    /**
     * Pre: perpLines are already built.
     *
     * Note: the last indices in the array will show to the point equivalent to the bottom point.
     *
     * @param {*} options
     */
    DildoGeometry.prototype.__makeFlatSideVertices = function (shapeRadius) {
        // We are using the earcut algorithm later
        //  + create an outline of the perpendicular end points
        //  + shift the outline to the left bound of the mesh
        //  + [LATER] run earcut
        //  + [LATER] add all triangle faces
        //  + [LATER] create a copy of the vertices and the triangulation the the right side
        // Step 1: serialize the 2d vertex data along the perpendicular path
        // var polygon = new Polygon(this.getPerpendicularPathVertices(true), false);
        this.flatSidePolygon = new plotboilerplate_1.Polygon(this.getPerpendicularPathVertices(true), false);
        this.flatSideBounds = this.flatSidePolygon.getBounds();
        // Step 2: Add the 3d vertices to this geometry (and store positions in left-/rightFlatIndices array)
        for (var i = 0; i < this.flatSidePolygon.vertices.length; i++) {
            var nextIndex = this.vertices.length;
            this.leftFlatIndices.push(nextIndex);
            this.vertices.push(new THREE.Vector3(this.flatSidePolygon.vertices[i].x, this.flatSidePolygon.vertices[i].y, shapeRadius));
            if (i === 0 || i + 1 === this.flatSidePolygon.vertices.length || i + 2 === this.flatSidePolygon.vertices.length) {
                // Keep track of the four corner points (two left, two right)
                this.hollowBottomEdgeVertIndices.push(nextIndex);
            }
        }
        for (var i = 0; i < this.flatSidePolygon.vertices.length; i++) {
            var nextIndex = this.vertices.length;
            this.rightFlatIndices.push(nextIndex);
            this.vertices.push(new THREE.Vector3(this.flatSidePolygon.vertices[i].x, this.flatSidePolygon.vertices[i].y, -shapeRadius));
            if (i === 0 || i + 1 === this.flatSidePolygon.vertices.length || i + 2 === this.flatSidePolygon.vertices.length) {
                // Keep track of the four corner points (two left, two right)
                this.hollowBottomEdgeVertIndices.push(nextIndex);
            }
        }
    };
    /**
     * Pre: perpLines are already built.
     *
     * Note: the last indices in the array will show to the point equivalent to the bottom point.
     *
     * @param {*}
     */
    DildoGeometry.prototype.__makeFlatSideFaces = function () {
        // We are using the earcut algorithm here
        //  + [DONE before] create an outline of the perpendicular end points
        //  + [DONE before] shift the outline to the left bound of the mesh
        //  + run earcut
        //  + add all triangle faces
        //  + create a copy of the vertices and the triangulation the the right side
        var _self = this;
        // Array<THREE.Vector3>  (compatible with XYCoords :)
        var polygonVertices = this.leftFlatIndices.map(function (flatSideIndex) {
            return _self.vertices[flatSideIndex];
        });
        var polygonData = GeometryGenerationHelpers_1.GeometryGenerationHelpers.flattenVert2dArray(polygonVertices);
        // Step 3: run Earcut
        var triangleIndices = (0, earcut_typescript_1.earcut)(polygonData);
        // Step 4: process the earcut result;
        //         add the retrieved triangles as geometry faces.
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            var a = triangleIndices[i];
            var b = triangleIndices[i + 1];
            var c = triangleIndices[i + 2];
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeFace3(this, this.leftFlatIndices[a], this.leftFlatIndices[b], this.leftFlatIndices[c]);
            this.leftFlatTriangleIndices.push([this.leftFlatIndices[a], this.leftFlatIndices[b], this.leftFlatIndices[c]]);
        }
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            var a = triangleIndices[i];
            var b = triangleIndices[i + 1];
            var c = triangleIndices[i + 2];
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeFace3(this, this.rightFlatIndices[a], this.rightFlatIndices[c], this.rightFlatIndices[b]);
            this.rightFlatTriangleIndices.push([this.rightFlatIndices[a], this.rightFlatIndices[b], this.rightFlatIndices[c]]);
        }
    };
    DildoGeometry.prototype.getPerpendicularPathVertices = function (includeBottomVert, getInner) {
        // Array<XYCoords>
        var polygonVertices = [];
        for (var i = 0; i < this.innerPerpLines.length; i++) {
            polygonVertices.push(getInner ? this.innerPerpLines[i].start : this.innerPerpLines[i].end);
        }
        // Reverse the outer path segment (both begin at bottom and meet at the top)
        for (var i = this.outerPerpLines.length - 1; i >= 0; i--) {
            polygonVertices.push(getInner ? this.outerPerpLines[i].start : this.outerPerpLines[i].end);
        }
        // Also add base point at last index
        if (includeBottomVert) {
            polygonVertices.push(this.vertices[this.bottomIndex]);
        }
        return polygonVertices;
    };
    DildoGeometry.prototype.getPerpendicularHullLines = function () {
        // Array<XYCoords>
        var perpLines = [];
        for (var i = 0; i < this.innerPerpLines.length; i++) {
            perpLines.push(this.innerPerpLines[i]);
        }
        // Reverse the outer path segment (both begin at bottom and meet at the top)
        for (var i = this.outerPerpLines.length - 1; i >= 0; i--) {
            perpLines.push(this.outerPerpLines[i]);
        }
        return perpLines;
    };
    /**
     * Construct the top vertex that's used to closed the cylinder geometry at the top.
     *
     * @param {plotboilerplate.Bounds} outlineBounds
     * @param {boolean} isBending
     * @param {number|NaN|undefined} bendAngle
     * @param {number|undefined} arcRadius
     * @returns THREE.Vector
     */
    DildoGeometry.prototype._getTopVertex = function (outlineBounds, isBending, bendAngle, arcRadius) {
        if (isBending) {
            var topPoint = new THREE.Vector3(0, 0, 0);
            this._bendVertex(topPoint, bendAngle, arcRadius, 1.0);
            topPoint.y += outlineBounds.max.y;
            return topPoint;
        }
        else {
            return new THREE.Vector3(0, outlineBounds.min.y, 0);
        }
    };
    /**
     * Construct the bottom vertex that's used to closed the cylinder geometry at the bottom.
     *
     * @param {plotboilerplate.Bounds} outlineBounds
     * @param {boolean} isBending
     * @returns THREE.Vector
     */
    DildoGeometry.prototype._getBottomVertex = function (outlineBounds) {
        var bottomPoint = new THREE.Vector3(0, outlineBounds.max.y, 0);
        // if (isBending) {
        // No need to bend the bottom point (no effect)
        // this._bendVertex(bottomPoint, bendAngle, arcRadius, 0.0);
        // }
        return bottomPoint;
    };
    /**
     * A helper function to 'bend' a vertex position around the desired bend axis (angle + radius).
     * @private
     * @param {} vert
     * @param {*} bendAngle
     * @param {*} arcRadius
     * @param {*} heightT
     */
    DildoGeometry.prototype._bendVertex = function (vert, bendAngle, arcRadius, heightT) {
        var axis = new THREE.Vector3(0, 0, 1);
        var angle = bendAngle * heightT;
        // Move slice point along radius, rotate, then move back
        // (equivalent to rotation around arc center)
        vert.x -= arcRadius;
        vert.applyAxisAngle(axis, angle);
        vert.x += arcRadius;
    };
    /**
     * Rotate a 3d vector around the z axis (back-front-axis).
     *
     * @param {THREE.Vector3} vert
     * @param {THREE.Vector3} angle
     * @param {number} xCenter
     * @param {number} yCenter
     * @returns
     */
    //   // TODO: move to helpers
    //   var rotateVert = function (vert, angle, xCenter, yCenter) {
    //     var axis = new THREE.Vector3(0, 0, 1);
    //     vert.x -= xCenter;
    //     vert.y -= yCenter;
    //     vert.applyAxisAngle(axis, angle);
    //     vert.x += xCenter;
    //     vert.y += yCenter;
    //     return vert;
    //   };
    //   /**
    //    * Rotate a 3d vector around the y axis (up-down-axis).
    //    *
    //    * @param {THREE.Vector3} vert
    //    * @param {THREE.Vector3} angle
    //    * @param {number} xCenter
    //    * @param {number} zCenter
    //    * @returns
    //    */
    //   // TODO: move to helpers
    //   var rotateVertY = function (vert, angle, xCenter, zCenter) {
    //     var axis = new THREE.Vector3(0, 1, 0);
    //     vert.x -= xCenter;
    //     vert.z -= zCenter;
    //     vert.applyAxisAngle(axis, angle);
    //     vert.x += xCenter;
    //     vert.z += zCenter;
    //     return vert;
    //   };
    //   /**
    //    * Normalize a 2D vector to a given length.
    //    *
    //    * @param {XYCoords} base - The start point.
    //    * @param {XYCoords} extend - The end point.
    //    * @param {number} normalLength - The desired length
    //    */
    //   var normalizeVectorXY = function (base, extend, normalLength) {
    //     var diff = { x: extend.x - base.x, y: extend.y - base.y }; // XYCoords
    //     var length = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
    //     var ratio = normalLength / length;
    //     extend.x = base.x + diff.x * ratio;
    //     extend.y = base.y + diff.y * ratio;
    //   };
    // computeVertexNormals() {
    //   for( var f = 0; f < this.faces.length; f++ ) {
    //       var face = this.faces[f];
    //   }
    // }
    // TODO
    DildoGeometry.prototype.applyBumpMap = function (bumpMapTexture) {
        // Build normals
        for (var i = 0; i < this.vertexMatrix.length; i++) {
            for (var j = 0; j < this.vertexMatrix[i].length; j++) {
                var vertIndex = this.vertexMatrix[i][j];
                var vertex = this.vertices[vertIndex];
            }
        }
    };
    /**
     * Build up the faces for this geometry.
     * @param {*} options
     */
    // DildoGeometry.prototype._buildFaces = function (options) {
    DildoGeometry.prototype._buildFaces = function (options) {
        var baseShape = options.baseShape;
        var outlineSegmentCount = options.outlineSegmentCount;
        var closeTop = Boolean(options.closeTop);
        var closeBottom = Boolean(options.closeBottom);
        var makeHollow = Boolean(options.makeHollow);
        var baseShapeSegmentCount = baseShape.vertices.length;
        this.faceVertexUvs[0] = [];
        for (var s = 0; s < outlineSegmentCount; s++) {
            for (var i = 0; i < baseShapeSegmentCount; i++) {
                if (s > 0) {
                    if (i > 0) {
                        this.addFace4ByIndices(s, i - 1, s - 1, i, makeHollow);
                        if (i + 1 == baseShape.vertices.length) {
                            // Close the gap on the shape
                            this.addFace4ByIndices(s, i, s - 1, 0, makeHollow);
                        }
                    }
                }
            } // END for
        } // END for
        if (makeHollow) {
            this.__makeFlatSideFaces();
            this.__makeBackFrontFaces();
        }
        if (closeBottom) {
            if (makeHollow)
                this._buildHollowBottomFaces();
            else
                this._buildEndFaces(this.bottomIndex, 0, baseShapeSegmentCount, false);
        }
        if (closeTop) {
            this._buildEndFaces(this.topIndex, this.vertexMatrix.length - 1, baseShapeSegmentCount, makeHollow);
        }
    };
    DildoGeometry.prototype._buildHollowBottomFaces = function () {
        var _self = this;
        var edgeVertices = this.hollowBottomEdgeVertIndices.map(function (edgeVertIndex) {
            return _self.vertices[edgeVertIndex];
        });
        var findClosestEdgeIndex = function (vert) {
            // THREE.Vector
            var index = 0;
            var distance = Number.MAX_VALUE;
            var tmpDist;
            for (var i = 0; i < edgeVertices.length; i++) {
                var tmpIndex = _self.hollowBottomEdgeVertIndices[i];
                if ((tmpDist = edgeVertices[i].distanceTo(vert)) < distance) {
                    index = tmpIndex;
                    distance = tmpDist;
                }
            }
            return index;
        };
        // 'Last index' starts at last point at all : )
        var n = this.vertexMatrix[0].length;
        var lastIndex = findClosestEdgeIndex(this.vertices[n - 1]);
        var triangleIndices; // = []; // [number,number,number]
        // Use first slice (at bottom position)
        for (var i = 0; i < n; i++) {
            var curIndex = findClosestEdgeIndex(this.vertices[this.vertexMatrix[0][i]]);
            // Close gap to last (different shell index)
            triangleIndices = [lastIndex, this.vertexMatrix[0][i == 0 ? n - 1 : i - 1], this.vertexMatrix[0][i]];
            this.faces.push(new cjs_1.Face3(triangleIndices[0], triangleIndices[1], triangleIndices[2])); // Same?
            this.hollowBottomTriagles.push(triangleIndices);
            if (lastIndex !== curIndex) {
                // Add normal triangle to same shell index
                triangleIndices = [curIndex, lastIndex, this.vertexMatrix[0][i]];
                this.faces.push(new cjs_1.Face3(triangleIndices[0], triangleIndices[1], triangleIndices[2]));
                this.hollowBottomTriagles.push(triangleIndices);
            }
            lastIndex = curIndex;
        }
    };
    /**
     * Build the face and the top or bottom end of the geometry. Imagine the dildo geometry
     * as a closed cylinder: this function created the top or the bottom 'circle'.
     *
     * @param {number} endVertexIndex - This should be `this.topIndex` or `this.bottomIndex`.
     * @param {number} shapeIndex - This should be `0` (top) or `outlineSegmentCount-1` (bottom).
     * @param {number} baseShapeSegmentCount - The number of shape segments.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    DildoGeometry.prototype._buildEndFaces = function (endVertexIndex, shapeIndex, baseShapeSegmentCount, inverseFaceDirection) {
        // Close at top.
        for (var i = 1; i < baseShapeSegmentCount; i++) {
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeFace3(this, this.vertexMatrix[shapeIndex][i - 1], endVertexIndex, this.vertexMatrix[shapeIndex][i], inverseFaceDirection);
            if (i + 1 == baseShapeSegmentCount) {
                GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeFace3(this, this.vertexMatrix[shapeIndex][i], endVertexIndex, this.vertexMatrix[shapeIndex][0], inverseFaceDirection);
            }
        }
    };
    /**
     * Pre: flatSides are made
     *
     * @param {*} options
     */
    DildoGeometry.prototype.__makeBackFrontFaces = function () {
        // Connect left and right side (important: ignore bottom vertex at last index)
        for (var i = 1; i + 1 < this.flatSidePolygon.vertices.length; i++) {
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeFace4(this, this.leftFlatIndices[i], this.leftFlatIndices[i - 1], this.rightFlatIndices[i], this.rightFlatIndices[i - 1]);
        }
    };
    /**
     * Build the texture UV mapping for all faces.
     *
     * @param {Polygon} options.baseShape
     * @param {number} options.outlineSegmentCount
     * @param {number} options.vertices.length
     */
    // DildoGeometry.prototype._buildUVMapping = function (options) {
    DildoGeometry.prototype._buildUVMapping = function (options) {
        var baseShape = options.baseShape;
        var outlineSegmentCount = options.outlineSegmentCount;
        var baseShapeSegmentCount = baseShape.vertices.length;
        var closeTop = Boolean(options.closeTop);
        var closeBottom = Boolean(options.closeBottom);
        var makeHollow = Boolean(options.makeHollow);
        // https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
        for (var s = 1; s < outlineSegmentCount; s++) {
            for (var i = 1; i < baseShape.vertices.length; i++) {
                GeometryGenerationHelpers_1.GeometryGenerationHelpers.addCylindricUV4(this, s, i - 1, s - 1, i, outlineSegmentCount, baseShapeSegmentCount, makeHollow);
                if (i + 1 == baseShape.vertices.length) {
                    // Close the gap on the shape
                    GeometryGenerationHelpers_1.GeometryGenerationHelpers.addCylindricUV4(this, s, i - 1, s - 1, i, outlineSegmentCount, baseShapeSegmentCount, makeHollow);
                }
            }
        }
        if (makeHollow) {
            // Make flat side UVS (left)
            // Note: left flat side and right flat side have the same number of polygon vertices
            for (var i = 0; i < this.leftFlatTriangleIndices.length; i++) {
                var leftA = this.leftFlatTriangleIndices[i][0];
                var leftB = this.leftFlatTriangleIndices[i][1];
                var leftC = this.leftFlatTriangleIndices[i][2];
                UVHelpers_1.UVHelpers.makeFlatTriangleUVs(this, this.flatSideBounds, leftA, leftB, leftC);
            }
            // Make flat side UVS (right)
            for (var i = 0; i < this.rightFlatTriangleIndices.length; i++) {
                // NOTE: as the triangles are computed on the left flat side -> for the right side
                //          change the winding order!!!
                var rightA = this.rightFlatTriangleIndices[i][0];
                var rightB = this.rightFlatTriangleIndices[i][2];
                var rightC = this.rightFlatTriangleIndices[i][1];
                UVHelpers_1.UVHelpers.makeFlatTriangleUVs(this, this.flatSideBounds, rightA, rightB, rightC);
            }
            // TODO: add these as function
            for (var i = 1; i + 1 < this.flatSidePolygon.vertices.length; i++) {
                var ratioI = (i - 1) / (this.flatSidePolygon.vertices.length - 1);
                var ratioJ = i / (this.flatSidePolygon.vertices.length - 1);
                this.faceVertexUvs[0].push([
                    new THREE.Vector2(0.0, ratioJ),
                    new THREE.Vector2(0.0, ratioI),
                    new THREE.Vector2(1.0, ratioJ)
                ]);
                this.faceVertexUvs[0].push([
                    new THREE.Vector2(0.0, ratioI),
                    new THREE.Vector2(1.0, ratioI),
                    new THREE.Vector2(1.0, ratioJ)
                ]);
            }
        } // END if[makeHollow]
        // Build UV mapping for the bottom (base)
        if (closeBottom) {
            if (makeHollow) {
                makeHollowBottomUVs(this, this.hollowBottomEdgeVertIndices, this.hollowBottomTriagles);
            }
            else {
                for (var i = 1; i < baseShapeSegmentCount; i++) {
                    GeometryGenerationHelpers_1.GeometryGenerationHelpers.addPyramidalBaseUV3(this, i - 1, baseShapeSegmentCount);
                    if (i + 1 == baseShapeSegmentCount) {
                        // Close the gap on the shape
                        GeometryGenerationHelpers_1.GeometryGenerationHelpers.addPyramidalBaseUV3(this, i - 1, baseShapeSegmentCount);
                    }
                }
            }
        }
        // Build UV mapping for the top (closing element)
        if (closeTop) {
            var lastIndex = outlineSegmentCount - 1;
            for (var i = 1; i < baseShapeSegmentCount; i++) {
                GeometryGenerationHelpers_1.GeometryGenerationHelpers.addPyramidalBaseUV3(this, i - 1, baseShapeSegmentCount);
                if (i + 1 == baseShapeSegmentCount) {
                    // Close the gap on the shape
                    GeometryGenerationHelpers_1.GeometryGenerationHelpers.addPyramidalBaseUV3(this, lastIndex, baseShapeSegmentCount);
                }
            }
        }
        this.uvsNeedUpdate = true;
    };
    /**
     * Build a triangulated face4 (two face3) for the given matrix index pairs. The method will create
     * two right-turning triangles.
     *
     * <pre>
     *       (a,b)---(c,b)
     *         |    /  |
     *         |   /   |
     *         |  /    |
     *       (a,d)---(c,d)
     * </pre>
     *
     * @param {number} a - The first primary index in the `vertexMatrix` array.
     * @param {number} b - The first seconday index in the `vertexMatrix[a]` array.
     * @param {number} c - The second primary index in the `vertexMatrix` array.
     * @param {number} d - The second seconday index in the `vertexMatrix[c]` array.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    DildoGeometry.prototype.addFace4ByIndices = function (a, b, c, d, inverseFaceDirection) {
        GeometryGenerationHelpers_1.GeometryGenerationHelpers.makeFace4(this, this.vertexMatrix[a][b], this.vertexMatrix[c][b], this.vertexMatrix[a][d], this.vertexMatrix[c][d], inverseFaceDirection);
    };
    /**
     * Build up the vertices in this geometry.
     *
     * @param {} options
     */
    DildoGeometry.prototype._buildVertices = function (options) {
        var baseShape = options.baseShape;
        var outline = options.outline;
        var outlineSegmentCount = options.outlineSegmentCount;
        var makeHollow = Boolean(options.makeHollow);
        var bendAngleRad = (options.bendAngle / 180) * Math.PI;
        var hollowStrengthX = options.hollowStrengthX; // default=15.0? // TODO: hollow strength as param
        var twistAngle = options.twistAngle * DEG_TO_RAD;
        var normalizePerpendiculars = Boolean(options.normalizePerpendiculars);
        var normalsLength = typeof options.normalsLength !== "undefined" ? options.normalsLength : 10.0;
        var outlineBounds = outline.getBounds();
        var shapeHeight = outlineBounds.height;
        var shapeBounds = baseShape.getBounds();
        var shapeCenter = shapeBounds.getCenter();
        var arcLength = shapeHeight;
        var arcRadius = arcLength / bendAngleRad;
        var isBending = options.isBending &&
            !isNaN(arcRadius) &&
            arcRadius !== Number.POSITIVE_INFINITY &&
            arcRadius !== Number.NEGATIVE_INFINITY &&
            Math.abs(bendAngleRad) > 0.01;
        for (var s = 0; s < outlineSegmentCount; s++) {
            var t = Math.min(1.0, Math.max(0.0, s / (outlineSegmentCount - 1)));
            this.vertexMatrix[s] = [];
            var outlineVert = outline.getPointAt(t);
            var perpendicularVert = outline.getPerpendicularAt(t);
            var heightT = (outlineBounds.max.y - outlineVert.y) / shapeHeight;
            var outlineT = s / (outlineSegmentCount - 1);
            this.__buildSlice(baseShape, outlineBounds, outlineVert, s, heightT, isBending, bendAngleRad, arcRadius, twistAngle * outlineT);
            this.__buildSpine(shapeCenter, outlineBounds, outlineVert, heightT, isBending, bendAngleRad, arcRadius);
            this.__buildPerps(baseShape, outlineBounds, outlineVert, perpendicularVert, heightT, isBending, bendAngleRad, arcRadius, normalizePerpendiculars, normalsLength);
            // this.__buildNormals(
            //   s,
            //   baseShape,
            //   outlineBounds,
            //   outlineVert,
            //   perpendicularVert,
            //   heightT,
            //   isBending,
            //   bendAngleRad,
            //   arcRadius,
            //   normalizePerpendiculars,
            //   normalsLength
            // );
        } // END for
        var topVertex = this._getTopVertex(outlineBounds, isBending, bendAngleRad, arcRadius);
        var bottomVertex = this._getBottomVertex(outlineBounds);
        this.topIndex = this.vertices.length;
        this.vertices.push(topVertex);
        this.bottomIndex = this.vertices.length;
        this.vertices.push(bottomVertex);
        if (makeHollow) {
            // Construct the left and the right flat bounds (used to make a casting mould)
            this.__makeFlatSideVertices(Math.max(shapeBounds.width, shapeBounds.height) / 2.0 + hollowStrengthX);
        }
    };
    DildoGeometry.prototype.__applyBumpmap = function (bumpmapTexture) {
        var tmp = this;
        for (var i = 0; i < this.vertexMatrix.length; i++) {
            for (var j = 0; j < this.vertexMatrix[i].length; j++) {
                // apply local bump map
                // const normal = tmp.
            }
        }
    };
    return DildoGeometry;
}(cjs_1.Gmetry)); // END class
exports.DildoGeometry = DildoGeometry;
// TODO: move to helpers
var rotateVert = function (vert, angle, xCenter, yCenter) {
    var axis = new THREE.Vector3(0, 0, 1);
    vert.x -= xCenter;
    vert.y -= yCenter;
    vert.applyAxisAngle(axis, angle);
    vert.x += xCenter;
    vert.y += yCenter;
    return vert;
};
/**
 * Rotate a 3d vector around the y axis (up-down-axis).
 *
 * @param {THREE.Vector3} vert
 * @param {THREE.Vector3} angle
 * @param {number} xCenter
 * @param {number} zCenter
 * @returns
 */
// TODO: move to helpers
var rotateVertY = function (vert, angle, xCenter, zCenter) {
    var axis = new THREE.Vector3(0, 1, 0);
    vert.x -= xCenter;
    vert.z -= zCenter;
    vert.applyAxisAngle(axis, angle);
    vert.x += xCenter;
    vert.z += zCenter;
    return vert;
};
// /**
//  * Normalize a 2D vector to a given length.
//  *
//  * @param {XYCoords} base - The start point.
//  * @param {XYCoords} extend - The end point.
//  * @param {number} normalLength - The desired length
//  */
// // TODO: add types
// var normalizeVectorXY = function (base, extend, normalLength) {
//   var diff = { x: extend.x - base.x, y: extend.y - base.y }; // XYCoords
//   var length = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
//   var ratio = normalLength / length;
//   extend.x = base.x + diff.x * ratio;
//   extend.y = base.y + diff.y * ratio;
// };
/**
 * Normalize a 2D vector to a given length.
 *
 * @param {THREE.Vector3} base - The start point.
 * @param {THREE.Vector3} extend - The end point.
 * @param {number} normalLength - The desired length
 */
// TOTO: add types
var normalizeVectorXYZ = function (base, extend, normalLength) {
    var diff = { x: extend.x - base.x, y: extend.y - base.y, z: extend.z - base.z };
    var length = Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
    var ratio = normalLength / length;
    extend.x = base.x + diff.x * ratio;
    extend.y = base.y + diff.y * ratio;
    extend.z = base.z + diff.z * ratio;
};
/**
 *
 * @param {THREE.Geometry} thisGeometry
 * @param {Array<number>} containingPolygonIndices
 * @param {Array<[number,number,number]>} triangles
 */
var makeHollowBottomUVs = function (thisGeometry, containingPolygonIndices, triangles) {
    // Compute polyon bounds
    var polygonBounds = plotboilerplate_1.Bounds.computeFromVertices(containingPolygonIndices.map(function (vertIndex) {
        return new plotboilerplate_1.Vertex(thisGeometry.vertices[vertIndex].x, thisGeometry.vertices[vertIndex].z);
    }));
    var getUVRatios = function (vert) {
        // console.log((vert.x - shapeBounds.min.x) / shapeBounds.width, (vert.y - shapeBounds.min.y) / shapeBounds.height);
        return new THREE.Vector2((vert.x - polygonBounds.min.x) / polygonBounds.width, (vert.z - polygonBounds.min.y) / polygonBounds.height);
    };
    // ON the x-z-plane {x, *, z}
    for (var t = 0; t < triangles.length; t++) {
        var vertA = thisGeometry.vertices[triangles[t][0]];
        var vertB = thisGeometry.vertices[triangles[t][1]];
        var vertC = thisGeometry.vertices[triangles[t][2]];
        thisGeometry.faceVertexUvs[0].push([getUVRatios(vertA), getUVRatios(vertB), getUVRatios(vertC)]);
    }
};
//# sourceMappingURL=DildoGeometry.js.map

/***/ }),

/***/ "./src/cjs/DildoMaterials.js":
/*!***********************************!*\
  !*** ./src/cjs/DildoMaterials.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * A collection of materials and material making functions.
 *
 * @require THREE
 *
 * @author Ikaros Kappler
 * @date 2021-07-02
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @version 1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DildoMaterials = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
exports.DildoMaterials = (function () {
    /**
     * Map<string,texture>
     */
    var textureStore = new Map();
    var DildoMaterials = {
        /**
         * Create a new mesh material from the given parameters.
         *
         * @param {boolean} useTextureImage - Load and use the given texture (at `textureImagePath`) if set to true.
         * @param {boolean} wireframe - Create a wireframe material if true.
         * @param {string} textureImagePath - The texture path to use (if useTextureImage is set to true).
         * @param {THREE.DoubleSide|THREE.FrontSide|THREE.Backside} doubleSingleSide - Wether to display one one or both face sides.
         * @returns
         */
        createMainMaterial: function (useTextureImage, wireframe, textureImagePath, doubleSingleSide) {
            return useTextureImage
                ? new THREE.MeshLambertMaterial({
                    color: 0xffffff,
                    wireframe: wireframe,
                    //   flatShading: false,
                    depthTest: true,
                    opacity: 1.0,
                    // side: THREE.DoubleSide,
                    side: doubleSingleSide,
                    visible: true,
                    emissive: 0x0,
                    reflectivity: 1.0,
                    refractionRatio: 0.89,
                    map: DildoMaterials.loadTextureImage(textureImagePath)
                })
                : new THREE.MeshPhongMaterial({
                    color: 0x3838ff,
                    wireframe: wireframe,
                    flatShading: false,
                    depthTest: true,
                    opacity: 1.0,
                    // side: THREE.DoubleSide,
                    side: doubleSingleSide,
                    visible: true,
                    emissive: 0x0,
                    reflectivity: 1.0,
                    refractionRatio: 0.89,
                    map: null
                });
        },
        createSliceMaterial: function (useTextureImage, wireframe, textureImagePath) {
            if (wireframe) {
                return new THREE.MeshBasicMaterial({ wireframe: true });
                // return new THREE.MeshStandardMaterial({ wireframe: true });
            }
            else {
                return new THREE.MeshLambertMaterial({
                    color: useTextureImage ? 0x888888 : 0xa1848a8,
                    wireframe: false,
                    // flatShading: false,
                    depthTest: true,
                    opacity: 1.0,
                    side: THREE.DoubleSide,
                    // side: doubleSingleSide,
                    visible: true,
                    emissive: 0x0,
                    reflectivity: 1.0,
                    refractionRatio: 0.89,
                    map: useTextureImage ? DildoMaterials.loadTextureImage(textureImagePath) : null,
                    vertexColors: false
                });
            }
        },
        /**
         * Load a texture or get it from the internal buffer if it was already loaded before.
         *
         * @param {string} path - The path (absolute or relative) to the texture image to load.
         * @returns {THREE.Texture}
         */
        loadTextureImage: function (path) {
            var texture = textureStore.get(path);
            if (!texture) {
                // TODO: use a singleton here?
                var loader = new THREE.TextureLoader();
                texture = loader.load(path);
                textureStore.set(path, texture);
            }
            return texture;
        }
    };
    return DildoMaterials;
})();
//# sourceMappingURL=DildoMaterials.js.map

/***/ }),

/***/ "./src/cjs/GeometryGenerationHelpers.js":
/*!**********************************************!*\
  !*** ./src/cjs/GeometryGenerationHelpers.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * A collection of helper function used to generate dildo meshes.
 *
 * @require sliceGeometry
 *
 * @author   Ikaros Kappler
 * @date     2021-06-30
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced Gmetry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeometryGenerationHelpers = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
var earcut_typescript_1 = __webpack_require__(/*! earcut-typescript */ "./node_modules/earcut-typescript/src/cjs/earcut.js");
var plotboilerplate_1 = __webpack_require__(/*! plotboilerplate */ "./node_modules/plotboilerplate/src/esm/index.js");
var threejs_slice_geometry_typescript_1 = __webpack_require__(/*! threejs-slice-geometry-typescript */ "../threejs-slice-geometry-typescript/src/esm/index.js"); // TODO: convert to custom library
var PlaneMeshIntersection_1 = __webpack_require__(/*! ./PlaneMeshIntersection */ "./src/cjs/PlaneMeshIntersection.js");
var clearDuplicateVertices3_1 = __webpack_require__(/*! ./clearDuplicateVertices3 */ "./src/cjs/clearDuplicateVertices3.js");
var three_geometry_hellfix_1 = __webpack_require__(/*! three-geometry-hellfix */ "./node_modules/three-geometry-hellfix/src/esm/index.js");
var UVHelpers_1 = __webpack_require__(/*! ./UVHelpers */ "./src/cjs/UVHelpers.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
exports.GeometryGenerationHelpers = {
    /**
     * Create a (right-turning) triangle of the three vertices at index A, B and C.
     *
     * The default direction (right) can be changed to left to pass `invsereFaceDirection=true`.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the face to.
     * @param {number} vertIndexA
     * @param {number} vertIndexB
     * @param {number} vertIndexC
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace3: function (geometry, vertIndexA, vertIndexB, vertIndexC, inverseFaceDirection) {
        if (inverseFaceDirection) {
            geometry.faces.push(new three_geometry_hellfix_1.Face3(vertIndexC, vertIndexB, vertIndexA));
        }
        else {
            geometry.faces.push(new three_geometry_hellfix_1.Face3(vertIndexA, vertIndexB, vertIndexC));
        }
    },
    /**
     * Build a triangulated face4 (two face3) for the given vertex indices. The method will create
     * two right-turning triangles by default, or two left-turning triangles if `inverseFaceDirection`.
     *
     * <pre>
     *         A-----B
     *         |   / |
     *         |  /  |
     *         | /   |
     *         C-----D
     * </pre>
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the face to.
     * @param {number} vertIndexA - The first vertex index.
     * @param {number} vertIndexB - The second vertex index.
     * @param {number} vertIndexC - The third vertex index.
     * @param {number} vertIndexD - The fourth vertex index.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace4: function (geometry, vertIndexA, vertIndexB, vertIndexC, vertIndexD, inverseFaceDirection) {
        if (inverseFaceDirection) {
            // Just inverse the winding order of both face3 elements
            exports.GeometryGenerationHelpers.makeFace3(geometry, vertIndexA, vertIndexC, vertIndexB, false);
            exports.GeometryGenerationHelpers.makeFace3(geometry, vertIndexC, vertIndexD, vertIndexB, false);
        }
        else {
            exports.GeometryGenerationHelpers.makeFace3(geometry, vertIndexA, vertIndexB, vertIndexC, false);
            exports.GeometryGenerationHelpers.makeFace3(geometry, vertIndexB, vertIndexD, vertIndexC, false);
        }
    },
    /**
     * Create texture UV coordinates for the rectangular two  triangles at matrix indices a, b, c and d.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the face to.
     * @param {number} a - The first face-4 vertex index.
     * @param {number} b - The second face-4 vertex index.
     * @param {number} c - The third face-4 vertex index.
     * @param {number} d - The fourth face-4 vertex index.
     * @param {number} outlineSegmentCount - The total number of segments on the outline.
     * @param {number} baseShapeSegmentCount - The total number of segments on the base shape.
     * @param {boolean=false} inverseFaceDirection - If true then the UV mapping is applied in left winding order (instead of right which is the default).
     */
    addCylindricUV4: function (geometry, a, b, c, d, outlineSegmentCount, baseShapeSegmentCount, inverseFaceDirection) {
        if (inverseFaceDirection) {
            // change: abc -> acb
            // change: bdc -> cdb
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(a / outlineSegmentCount, b / baseShapeSegmentCount),
                new THREE.Vector2(a / outlineSegmentCount, d / baseShapeSegmentCount),
                new THREE.Vector2(c / outlineSegmentCount, b / baseShapeSegmentCount)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(a / outlineSegmentCount, d / baseShapeSegmentCount),
                new THREE.Vector2(c / outlineSegmentCount, d / baseShapeSegmentCount),
                new THREE.Vector2(c / outlineSegmentCount, b / baseShapeSegmentCount)
            ]);
        }
        else {
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(a / outlineSegmentCount, b / baseShapeSegmentCount),
                new THREE.Vector2(c / outlineSegmentCount, b / baseShapeSegmentCount),
                new THREE.Vector2(a / outlineSegmentCount, d / baseShapeSegmentCount)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(c / outlineSegmentCount, b / baseShapeSegmentCount),
                new THREE.Vector2(c / outlineSegmentCount, d / baseShapeSegmentCount),
                new THREE.Vector2(a / outlineSegmentCount, d / baseShapeSegmentCount)
            ]);
        }
    },
    /**
     * Create texture UV coordinates for the triangle at matrix indices a, b and c.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the new faces to.
     * @param {number} a - The current base shape segment index, must be inside [0,baseShapeSegmentCount-1].
     * @param {number} baseShapeSegmentCount - The total number of base shape segments.
     */
    addPyramidalBaseUV3: function (geometry, a, baseShapeSegmentCount) {
        // Create a mirrored texture to avoid hard visual cuts
        var ratioA = 1.0 - Math.abs(0.5 - a / baseShapeSegmentCount) * 2;
        var ratioB = 1.0 - Math.abs(0.5 - (a + 1) / baseShapeSegmentCount) * 2;
        geometry.faceVertexUvs[0].push([new THREE.Vector2(ratioA, 0), new THREE.Vector2(0.5, 1), new THREE.Vector2(ratioB, 0)]);
    },
    /**
     * Flatten an array of 2d vertices into a flat array of coordinates.
     * (required by the earcut algorithm for example).
     *
     * @param {Array<XYCoords>} vertices2d
     * @returns {Array<number>}
     */
    flattenVert2dArray: function (vertices2d) {
        // Array<number>
        var coordinates = [];
        for (var i = 0; i < vertices2d.length; i++) {
            coordinates.push(vertices2d[i].x, vertices2d[i].y);
        }
        return coordinates;
    },
    /**
     * A helper function to create (discrete) circular 2d shapes.
     *
     * @param {number} radius - The radius of the circle.
     * @param {number} pointCount - The number of vertices to construct the circle with.
     * @param {number=1.0} excentricity - To create ellipses (default is 1.0).
     * @returns {Polygon}
     */
    mkCircularPolygon: function (radius, pointCount, excentricity) {
        if (typeof excentricity === "undefined") {
            excentricity = 1.0;
        }
        var vertices = [];
        var phi;
        for (var i = 0; i < pointCount; i++) {
            phi = Math.PI * 2 * (i / pointCount);
            vertices.push(new plotboilerplate_1.Vertex(Math.cos(phi) * radius * excentricity, Math.sin(phi) * radius));
        }
        return new plotboilerplate_1.Polygon(vertices, false);
    },
    /**
     * Slice a geometry at the given plane and add the remaining part(s).
     *
     * Note that only the right half (on the positive z axis) is kept. To obtain both you
     * need to run the algorithm twice with two flipped planes.
     *
     * Note also that the mesh is open at the cut plane.
     *
     * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The geometry to slice.
     * @param {THREE.Plane} plane PlaneGeometry???
     * @return {ThreeGeometryHellfix.Gmetry}
     */
    makeSlice: function (unbufferedGeometry, plane) {
        // Slice mesh into two
        // See https://github.com/tdhooper/threejs-slice-geometry
        var closeHoles = false; // This might be configurable in a later version.
        // TODO: resolve typecast here.
        //       Maybe the whole IDildoGeometry interface can be removed
        var slicedGeometry = (0, threejs_slice_geometry_typescript_1.sliceGeometry)(unbufferedGeometry, plane, closeHoles);
        // Now note that it's possible that the result might contain multiple vertices
        // at the same position, which makes further calculations quite difficult.
        // -> Merge multiple vertices into one
        slicedGeometry.mergeVertices();
        // And don't forget to compute the normals.
        slicedGeometry.computeFaceNormals();
        return slicedGeometry;
    },
    /**
     * This function creates the cut intersection elements to fill the (open) slice meshes.
     *
     * @param {DildoGeneration} thisGenerator
     * @param {THREE.Mesh} mesh
     * @param {IDildoGeometry} unbufferedGeometry
     * @param {THREE.Plane} planeGeometry
     * @returns
     */
    makeAndAddPlaneIntersection: function (thisGenerator, mesh, unbufferedGeometry, // Gmetry,
    planeGeometry, // THREE.Plane, // THREE.PlaneGeometry, // THREE.Plane ???
    planeGeometryReal, 
    // TODO: use a proper global interface here
    options // { showSplitShape?: boolean }
    ) {
        // Find the cut path
        var planeMeshIntersection = new PlaneMeshIntersection_1.PlaneMeshIntersection();
        // Array<THREE.Vector3>  (compatible with XYCoords :)
        var intersectionPoints = planeMeshIntersection.getIntersectionPoints(mesh, unbufferedGeometry, planeGeometry, planeGeometryReal);
        var EPS = 0.000001;
        var uniqueIntersectionPoints = (0, clearDuplicateVertices3_1.clearDuplicateVertices3)(intersectionPoints, EPS);
        // TODO: verify
        // const pointGeometry: Gmetry = new Gmetry();
        // pointGeometry.vertices = uniqueIntersectionPoints;
        var pointGeometry = exports.GeometryGenerationHelpers.verticesToBufferGeometry(uniqueIntersectionPoints);
        var pointsMaterial = new THREE.PointsMaterial({
            size: 1.4,
            color: 0x00ffff
        });
        // TODO: verify
        // const pointsMesh: THREE.Points = new THREE.Points(pointGeometry.toBufferGeometry(), pointsMaterial);
        var pointsMesh = new THREE.Points(pointGeometry, pointsMaterial);
        if (options.showSplitShape) {
            pointsMesh.position.y = -100;
            pointsMesh.position.z = -50;
            thisGenerator.addMesh(pointsMesh);
        }
        // TODO: convert point set to path
        // Test: make a triangulation to see what the path looks like
        var polygonData = exports.GeometryGenerationHelpers.flattenVert2dArray(uniqueIntersectionPoints);
        // Run Earcut
        var triangleIndices = (0, earcut_typescript_1.earcut)(polygonData);
        // Process the earcut result;
        //         add the retrieved triangles as geometry faces.
        var triangleGeometry = new three_geometry_hellfix_1.Gmetry();
        for (var i = 0; i < uniqueIntersectionPoints.length; i++) {
            triangleGeometry.vertices.push(uniqueIntersectionPoints[i].clone());
        }
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            var a = triangleIndices[i];
            var b = triangleIndices[i + 1];
            var c = triangleIndices[i + 2];
            exports.GeometryGenerationHelpers.makeFace3(triangleGeometry, a, b, c);
        }
        if (options.addRawIntersectionTriangleMesh) {
            // This is more a quick experimental preview feature.
            // The data is often faulty and too unprecise.
            var triangleMesh = new THREE.Mesh(triangleGeometry.toBufferGeometry(), new THREE.LineBasicMaterial({
                color: 0xff8800
            }));
            triangleMesh.position.y = -100;
            triangleMesh.position.z = -50;
            thisGenerator.addMesh(triangleMesh);
        }
        // Make the actual models
        // CURRENTLY NOT IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
        if (options.addPrecalculatedMassiveFaces) {
            exports.GeometryGenerationHelpers.makeAndAddMassivePlaneIntersection(thisGenerator, unbufferedGeometry);
        }
        if (options.addPrecalculatedHollowFaces) {
            exports.GeometryGenerationHelpers.makeAndAddHollowPlaneIntersection(thisGenerator, unbufferedGeometry);
        }
        return uniqueIntersectionPoints;
    },
    // CURRENTLY NOT REALLY IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
    makeAndAddMassivePlaneIntersection: function (thisGenerator, unbufferedGeometry) {
        var intersectionPoints = unbufferedGeometry.getPerpendicularPathVertices(true, true); // includeBottom=true, getInner=true
        var pointGeometry = new three_geometry_hellfix_1.Gmetry();
        pointGeometry.vertices = intersectionPoints;
        var pointsMaterial = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xff0000,
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });
        // Array<number,number,number,...>
        var polygonData = exports.GeometryGenerationHelpers.flattenVert2dArray(intersectionPoints);
        // Step 3: run Earcut
        var triangleIndices = (0, earcut_typescript_1.earcut)(polygonData);
        // Step 4: process the earcut result;
        //         add the retrieved triangles as geometry faces.
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            var a = triangleIndices[i];
            var b = triangleIndices[i + 1];
            var c = triangleIndices[i + 2];
            exports.GeometryGenerationHelpers.makeFace3(pointGeometry, a, b, c);
        }
        var pointsMesh = new THREE.Mesh(pointGeometry.toBufferGeometry(), pointsMaterial);
        pointsMesh.position.y = -100;
        pointsMesh.position.z = 50;
        pointsMesh.userData["isExportable"] = false;
        thisGenerator.addMesh(pointsMesh);
    },
    // CURRENTLY NOT REALLY IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
    makeAndAddHollowPlaneIntersection: function (thisGenerator, unbufferedGeometry) {
        var pointGeometry = new three_geometry_hellfix_1.Gmetry();
        var perpLines = unbufferedGeometry.getPerpendicularHullLines();
        for (var i = 0; i < perpLines.length; i++) {
            var innerPoint = perpLines[i].start;
            var outerPoint = perpLines[i].end;
            pointGeometry.vertices.push(innerPoint, outerPoint);
            var vertIndex = pointGeometry.vertices.length;
            if (i > 0) {
                pointGeometry.faces.push(new three_geometry_hellfix_1.Face3(vertIndex - 4, vertIndex - 2, vertIndex - 3));
                pointGeometry.faces.push(new three_geometry_hellfix_1.Face3(vertIndex - 3, vertIndex - 2, vertIndex - 1));
            }
        }
        var pointsMaterial = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xff0000,
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });
        var pointsMesh = new THREE.Mesh(pointGeometry.toBufferGeometry(), pointsMaterial);
        pointsMesh.position.y = -100;
        pointsMesh.position.z = -50;
        pointsMesh.userData["isExportable"] = false;
        thisGenerator.addMesh(pointsMesh);
    },
    /**
     * Add an orange colored line mesh from a spine geometry..
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new mesh to.
     * @param {ThreeGeometryHellfix.Gmetry} spineGeometry - The spine geometry itself.
     */
    addSpine: function (thisGenerator, spineGeometry) {
        var spineMesh = new THREE.LineSegments(spineGeometry.toBufferGeometry(), new THREE.LineBasicMaterial({
            color: 0xff8800
        }));
        spineMesh.position.y = -100;
        thisGenerator.addMesh(spineMesh);
    },
    /**
     * This function creates two line-meshes in red and green indicating the perpendicular cut
     * path along the geometry to be sliced.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new two meshes to.
     * @param {DildoGeometry} unbufferedDildoGeometry - The dildo geometry to retrieve the perpendicular path from.
     */
    addPerpendicularPaths: function (thisGenerator, unbufferedDildoGeometry) {
        exports.GeometryGenerationHelpers.addPerpendicularPath(thisGenerator, unbufferedDildoGeometry.outerPerpLines, 0xff0000);
        exports.GeometryGenerationHelpers.addPerpendicularPath(thisGenerator, unbufferedDildoGeometry.innerPerpLines, 0x00ff00);
    },
    /**
     * Add the given array of perpendicular lines (perpendicular to the mesh surface along the cut path)
     * as a THREE.LineSegments geometry.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the created line mesh to.
     * @param {Array<THREE.Line3>} perpLines - The lines to
     * @param {number} materialColor - A color for the material to use (like 0xff0000 for red).
     */
    addPerpendicularPath: function (thisGenerator, perpLines, materialColor) {
        var outerPerpGeometry = new three_geometry_hellfix_1.Gmetry();
        perpLines.forEach(function (perpLine) {
            outerPerpGeometry.vertices.push(perpLine.start.clone());
            outerPerpGeometry.vertices.push(perpLine.end.clone());
        });
        var outerPerpMesh = new THREE.LineSegments(outerPerpGeometry.toBufferGeometry(), new THREE.LineBasicMaterial({
            color: materialColor
        }));
        outerPerpMesh.position.y = -100;
        thisGenerator.addMesh(outerPerpMesh);
    },
    // TODO: add to global helper functions
    /**
     * Make a triangulation of the given path specified by the verted indices.
     *
     * @param {Array<number>} connectedPath - An array of vertex indices.
     * @return {ThreeGeometryHellfix.Gmetry} trianglesMesh
     */
    makePlaneTriangulation: function (generator, sliceGeometry, connectedPath, options) {
        // Convert the connected paths indices to [x, y, x, y, x, y, ...] coordinates (requied by earcut)
        var currentPathXYData = connectedPath.reduce(function (earcutInput, vertIndex) {
            var vert = sliceGeometry.vertices[vertIndex];
            earcutInput.push(vert.x, vert.y);
            return earcutInput;
        }, []);
        // Array<number> : triplets of vertex indices in the plain XY array
        var triangles = (0, earcut_typescript_1.earcut)(currentPathXYData);
        // Convert triangle indices back to a geometry
        var trianglesGeometry = new three_geometry_hellfix_1.Gmetry();
        // We will merge the geometries in the end which will create clones of the vertices.
        // No need to clone here.
        // trianglesGeometry.vertices = leftSliceGeometry.vertices;
        trianglesGeometry.vertices = connectedPath.map(function (geometryVertexIndex) {
            return sliceGeometry.vertices[geometryVertexIndex];
        });
        // Array<{x,y}> is compatible with Array<{x,y,z}> here :)
        var flatSideBounds = plotboilerplate_1.Bounds.computeFromVertices(trianglesGeometry.vertices.map(function (vector3) { return new plotboilerplate_1.Vertex(vector3.x, vector3.y); }));
        for (var t = 0; t < triangles.length; t += 3) {
            var a = triangles[t];
            var b = triangles[t + 1];
            var c = triangles[t + 2];
            trianglesGeometry.faces.push(new three_geometry_hellfix_1.Face3(a, b, c));
            // Add UVs
            UVHelpers_1.UVHelpers.makeFlatTriangleUVs(trianglesGeometry, flatSideBounds, a, b, c);
        }
        trianglesGeometry.uvsNeedUpdate = true;
        // TODO: check if this is still required
        trianglesGeometry.buffersNeedUpdate = true;
        trianglesGeometry.computeVertexNormals();
        var trianglesMesh = new THREE.Mesh(trianglesGeometry.toBufferGeometry(), new THREE.MeshBasicMaterial({
            color: 0x0048ff,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide
        }));
        trianglesMesh.position.y = -100;
        // trianglesMesh.position.z += 1.0; // Avoid Moiré with plane mesh?
        trianglesMesh.userData["isExportable"] = false;
        generator.partialResults[constants_1.KEY_PLANE_INTERSECTION_TRIANGULATION] = trianglesGeometry;
        if (options.showSplitShapeTriangulation) {
            generator.addMesh(trianglesMesh);
        }
        return trianglesGeometry;
    },
    /**
     * Normalize a 2D vector to a given length.
     *
     * @param {XYCoords} base - The start point.
     * @param {XYCoords} extend - The end point.
     * @param {number} normalLength - The desired length
     */
    // TODO: add types
    normalizeVectorXY: function (base, extend, normalLength) {
        var diff = { x: extend.x - base.x, y: extend.y - base.y }; // XYCoords
        var length = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
        var ratio = normalLength / length;
        extend.x = base.x + diff.x * ratio;
        extend.y = base.y + diff.y * ratio;
    },
    /**
     * Normalize a 2D vector to a given length.
     *
     * @param {XYCoords} base - The start point.
     * @param {XYCoords} extend - The end point.
     * @param {number} normalLength - The desired length
     */
    // TODO: add types
    normalizeVectorXYZ: function (base, extend, normalLength) {
        var diff = { x: extend.x - base.x, y: extend.y - base.y, z: extend.z - base.z };
        var length = Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
        var ratio = normalLength / length;
        extend.x = base.x + diff.x * ratio;
        extend.y = base.y + diff.y * ratio;
        extend.z = base.z + diff.z * ratio;
    },
    /**
     * A helper function to clear all child nodes from the given HTML DOM node.
     *
     * @param {HTMLElement} rootNoode
     */
    removeAllChildNodes: function (rootNode) {
        while (rootNode.lastChild) {
            rootNode.removeChild(rootNode.lastChild);
        }
    },
    /**
     * Clamp the given number into the passed min-max interval.
     *
     * @param {number} n
     * @param {number} min
     * @param {number} max
     * @returns
     */
    clamp: function (n, min, max) {
        return Math.max(Math.min(n, max), min);
    },
    verticesToBufferGeometry: function (vertices) {
        var geometry = new THREE.BufferGeometry();
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        var vertexData = new Float32Array(vertices.reduce(function (accu, vert) {
            accu.push(vert.x, vert.y, vert.z);
            return accu;
        }, []));
        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute("position", new THREE.BufferAttribute(vertexData, 3));
        return geometry;
    }
};
//# sourceMappingURL=GeometryGenerationHelpers.js.map

/***/ }),

/***/ "./src/cjs/ImageStore.js":
/*!*******************************!*\
  !*** ./src/cjs/ImageStore.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * @author  Ikaros Kappler
 * @date    2021-09-02
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImageStore = void 0;
exports.ImageStore = (function () {
    var imageMap = new Map();
    var Store = {
        getImage: function (path, onComplete) {
            // Try to find in store
            var image = imageMap.get(path);
            if (!image) {
                image = document.createElement("img"); // as HTMLImageElement;
                imageMap.set(path, image);
                image.onload = function () {
                    onComplete(image);
                };
                image.setAttribute("src", path);
            }
            return image;
        },
        isImageLoaded: function (image) {
            return image.complete && image.naturalHeight !== 0 && image.naturalHeight !== undefined;
        }
    };
    return Store;
})();
//# sourceMappingURL=ImageStore.js.map

/***/ }),

/***/ "./src/cjs/LocalstorageIO.js":
/*!***********************************!*\
  !*** ./src/cjs/LocalstorageIO.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * A basic IO interface for storing and retrieving json data from local storage.
 *
 * @author   Ikaros Kappler
 * @date     2021-10-13
 * @modified 2022-02-02 Removed the dnd IO (using FileDrop.js instead).
 * @version  1.1.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalstorageIO = void 0;
var LocalstorageIO = /** @class */ (function () {
    /**
     *
     * @param {HTMLElement} element - The element you wish to operate as the drop zone (like <body/>).
     */
    function LocalstorageIO() {
    }
    /**
     * Install a callback for retrieving the `bezier_path` string from the localstorage.
     *
     * @param {(data:string)=>void} handlePathRestored - The callback to handle the retrieved storage value. Will be called immediately.
     * @param {()=>string} requestPath - Requests the `bezier_path` string value to store; will be called on a 10 second timer interval.
     */
    LocalstorageIO.prototype.onPathRestored = function (handlePathRestored, requestPath) {
        var bezierJSON = localStorage.getItem("bezier_path");
        if (bezierJSON) {
            handlePathRestored(bezierJSON);
        }
        setInterval(function () {
            var newBezierJSON = requestPath();
            if (newBezierJSON) {
                localStorage.setItem("bezier_path", newBezierJSON);
            }
        }, 10000);
    };
    return LocalstorageIO;
}());
exports.LocalstorageIO = LocalstorageIO;
//# sourceMappingURL=LocalstorageIO.js.map

/***/ }),

/***/ "./src/cjs/PathFinder.js":
/*!*******************************!*\
  !*** ./src/cjs/PathFinder.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * The PathFinger tool will find the connected path on a mesh surface, given by a set
 * of vertices that lay on the geometry's surface.
 *
 * Each vertex in the path elements array must be at some gometry vertex position. The position
 * does not necessarily need to be exact, some epsilon is used (default epsilon is 0.000001).
 *
 * @author   Ikaros Kappler
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @date     2021-07-06
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PathFinder = void 0;
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
var PathFinder = /** @class */ (function () {
    /**
     * Construct a new PathFinder.
     *
     * @param {number=0.000001} epsilon - (optional) Specity any custom epsilon here if the default epsilon is too large/small. Must be >= 0.
     */
    function PathFinder(epsilon) {
        this.visitedVertices = new Set();
        this.unvisitedVertIndices = new Set(); // <number>
        this.numVisitedVertices = 0;
        this.epsilon = typeof epsilon !== "undefined" && epsilon >= 0 ? epsilon : constants_1.EPS;
    }
    /**
     * Find all connected paths specified by the path vertex array, that lay on the geometry's surface.
     *
     * If the vertices depict more than one path, then the returned array will contain
     * multiple paths, too.
     *
     * The pathVertices array must not contain duplicates.
     *
     * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The geometry itself containing the path vertices.
     * @param {THREE.Vector3[]} pathVertices - The unsorted vertices (must form a connected path on the geometry).
     * @return {Array<number[]>} An array of paths; each path consists of an array of path vertex indices in the `pathVertices` param.
     */
    PathFinder.prototype.findAllPathsOnMesh = function (unbufferedGeometry, pathVertices) {
        var collectedPaths = []; // Array<number[]>
        this.visitedVertices.clear();
        this.unvisitedVertIndices.clear();
        // Map path vertices to vertices in the geometry.
        //
        // Please note that the index array might be shorter than the vertex array itself, if some vertices could
        // not be located in the geometry.
        //
        var pathVertIndices = mapVerticesToGeometryIndices(unbufferedGeometry, pathVertices, this.epsilon);
        var n = pathVertIndices.length;
        // Initially build up an array of path vertices, marking them all as unvisited.
        this.unvisitedVertIndices = new Set(pathVertIndices.map(function (_pathVert, index) {
            return index;
        }));
        // As long as there are path vertices unvisited, there are sill portions of the path(s)
        // to be processed.
        while (this.numVisitedVertices < n) {
            var nextUnvisitedIndex = this.unvisitedVertIndices.values().next().value;
            // Array<number>
            var path = this.findUnvisitedPaths(unbufferedGeometry, pathVertIndices, nextUnvisitedIndex);
            collectedPaths.push(path);
        }
        // Try to find adjacent paths to connect them.
        return this.combineAdjacentPaths(collectedPaths, unbufferedGeometry);
    };
    /**
     * Find the next sequence unvisited path (indices) of vertices that are directly connected
     * via some faces on the geometry's surface.
     *
     * Be aware that path detection only works in one direction, so you will probably end up
     * in several paths that can still be connected, if you start with some random vertex
     * index.
     *
     * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The geometry to use to find connected vertices (use it's faces).
     * @param {Array<number>} pathVertIndices - The indices of all vertices that form the path(s). Each index must match a vertex in the geometry's `vertices` array.
     * @param {number} unvisitedIndex - The path vertex (index) to start with. This can be picked randomly.
     * @returns {Array<number>} The indices of the found path in an array (index sequence).
     */
    PathFinder.prototype.findUnvisitedPaths = function (unbufferedGeometry, pathVertIndices, unvisitedIndex) {
        var path = [unvisitedIndex]; // which elements?
        this.visitedVertices.add(unvisitedIndex);
        this.unvisitedVertIndices.delete(unvisitedIndex);
        this.numVisitedVertices++;
        // Find the the face for this vertex's index
        // var faceAndVertIndex; // { faceIndex: number, vertIndex: number }
        var adjacentVertIndex;
        while ((adjacentVertIndex = this.findAdjacentFace(unbufferedGeometry, pathVertIndices, unvisitedIndex)) !== -1) {
            // Retrieved face/vertex tuple represents the next element on the path
            path.push(adjacentVertIndex);
            this.visitedVertices.add(adjacentVertIndex);
            this.unvisitedVertIndices.delete(adjacentVertIndex);
            this.numVisitedVertices++;
            unvisitedIndex = adjacentVertIndex;
        }
        return path;
    };
    /**
     * Find the next unvisited vertex index that connects the given (unvisited) vertex
     * index of the path.
     *
     * To find that the geometry's faces will be used.
     *
     * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry
     * @param {Array<number>} pathVertIndices
     * @param {number} unvisitedIndex
     * @returns {number} The next adjacent face index or -1 if none can be found.
     */
    PathFinder.prototype.findAdjacentFace = function (unbufferedGeometry, pathVertIndices, unvisitedIndex) {
        var faceCount = unbufferedGeometry.faces.length;
        for (var f = 0; f < faceCount; f++) {
            if (faceHasVertIndex(unbufferedGeometry, f, unvisitedIndex)) {
                // Face is a canditate to extend the path.
                // Check if there is a second un-visited path vertex
                for (var i = 0; i < pathVertIndices.length; i++) {
                    var pathVertIndex = pathVertIndices[i];
                    if (pathVertIndex === unvisitedIndex) {
                        continue;
                    }
                    if (this.isVisited(pathVertIndex)) {
                        continue;
                    }
                    if (!this.isVisited(pathVertIndex) && faceHasVertIndex(unbufferedGeometry, f, pathVertIndex)) {
                        return pathVertIndex;
                    }
                    if (faceHasVertIndex(unbufferedGeometry, f, pathVertIndex)) {
                        return pathVertIndex;
                    }
                } // END for
            } // END if
        } // END for
        // At this point no matching face was found
        return -1;
    };
    /**
     * Checks if the given vertex index (one of the path vertices) was already
     * marked as being visited.
     *
     * @param {number} vertIndex
     * @returns {boolean}
     */
    PathFinder.prototype.isVisited = function (vertIndex) {
        return this.visitedVertices.has(vertIndex);
    };
    /**
     * Find adjacent paths and connect them.
     *
     * @param {Array<number[]>} collectedPaths
     * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry
     * @param {THREE.Vector3[]} pathVertices
     * @return {Array<number[]>} A new sequence of paths (a path is an array of vertex indices).
     */
    PathFinder.prototype.combineAdjacentPaths = function (collectedPaths, unbufferedGeometry) {
        var resultPaths = [];
        // First build up an unvisited path set (set of path indices)
        var unvisitedPathIndexSet = new Set(collectedPaths.map(function (_path, index) {
            return index;
        }));
        while (unvisitedPathIndexSet.size > 0) {
            var currentPathIndex = unvisitedPathIndexSet.values().next().value;
            unvisitedPathIndexSet.delete(currentPathIndex);
            var currentPath = collectedPaths[currentPathIndex];
            var nextPath = null; // TODO: type?
            do {
                nextPath = findAdjacentPath(collectedPaths, currentPath[currentPath.length - 1], unvisitedPathIndexSet, unbufferedGeometry);
                if (!nextPath && currentPath.length > 1) {
                    // If path's end point has no connection try reversed path
                    currentPath = currentPath.reverse();
                    nextPath = findAdjacentPath(collectedPaths, currentPath[currentPath.length - 1], unvisitedPathIndexSet, unbufferedGeometry);
                }
                if (nextPath) {
                    currentPath = currentPath.concat(nextPath);
                }
            } while (nextPath);
            // All adjacent paths found and connected.
            resultPaths.push(currentPath);
        }
        return resultPaths;
    };
    return PathFinder;
}()); // END class
exports.PathFinder = PathFinder;
/**
 * A simple check to determine if a face of the geometry (given by the face index)
 * is adjacent to the given vertex index (a vertex index in the geometry.).
 *
 * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry
 * @param {number} faceIndex
 * @param {number} geometryVertexIndex
 * @returns
 */
var faceHasVertIndex = function (unbufferedGeometry, faceIndex, geometryVertexIndex) {
    var face = unbufferedGeometry.faces[faceIndex];
    return face.a === geometryVertexIndex || face.b === geometryVertexIndex || face.c === geometryVertexIndex;
};
/**
 * Get an array of vertex indices inside the geometry that represent the given path vertices,
 *
 * If no equivalent geometry vertex can be found (for a path vertex) then the path vertex
 * will be skipped.
 * So the returned array might be shorter than the path – and thus, have gaps.
 *
 * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The Three.js geometry to use.
 * @param {Array<THREE.Vector3>} pathVertices - The acual mesh vertices of the current path.
 * @param {number} epsilon - Is required here (just pass through).
 * @returns
 */
var mapVerticesToGeometryIndices = function (unbufferedGeometry, pathVertices, epsilon) {
    var pathVertIndices = [];
    for (var i = 0; i < pathVertices.length; i++) {
        var pathVert = pathVertices[i];
        var foundIndex = -1;
        var foundDist = epsilon;
        for (var j = 0; j < unbufferedGeometry.vertices.length; j++) {
            var curDist = unbufferedGeometry.vertices[j].distanceTo(pathVert);
            if (curDist <= foundDist) {
                // Remember geometry index if closest to path vertex
                if (foundIndex === -1 ||
                    // By convention use smalled vertex index if multiple found
                    (foundIndex !== -1 && unbufferedGeometry.vertices[foundIndex].distanceTo(pathVert) >= curDist && foundIndex > j)) {
                    foundIndex = j;
                    foundDist = curDist;
                }
            }
        }
        if (foundIndex === -1) {
            console.warn("PathFinder.mapVerticesToGeometryIndices could not find a matching geometry vertex for path point " +
                i +
                ". The final result might be locally broken.");
        }
        else {
            // Note: it may be possible that NO MATCHING GEOMETRY VERT was found (foundIndex = -1).
            pathVertIndices.push(foundIndex);
        }
    } // END for i
    return pathVertIndices;
};
/**
 * This is a helper function to find adjacent sub paths and connect them.
 * It expects basic path segments already to be found and that they are
 * somehow connected. Unconnected paths – which are possible in non-convex
 * geometries – will stay unconnected.
 *
 * It locates the next path that connects to the given (current) path
 * and returns the acual path indices in the correct order. Forward paths
 * and backward paths are detected here and being brought into the correct
 * order.
 *
 * Example: if a path connects with it's end vertex to the end of the given
 * path, then it will be reversed.
 *
 * @param {Array<number[]>} collectedPaths - The array of paths (array of array)
 * @param {number} currentVertIndex - The vertex index in the geometry to find the next adjacent path for.
 * @param {Set<number>} unvisitedPathIndexSet - A set to keep track of unvisited vertex indices. Will be updated.
 * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The geometry to find the path on.
 * @returns
 */
var findAdjacentPath = function (collectedPaths, currentVertIndex, unvisitedPathIndexSet, unbufferedGeometry) {
    for (var f = 0; f < unbufferedGeometry.faces.length; f++) {
        if (faceHasVertIndex(unbufferedGeometry, f, currentVertIndex)) {
            // Now find any unvisited path (first or last point) that connects here.
            for (var p = 0; p < collectedPaths.length; p++) {
                if (!unvisitedPathIndexSet.has(p)) {
                    // Path already visited
                    continue;
                }
                var nextPath = collectedPaths[p];
                if (faceHasVertIndex(unbufferedGeometry, f, nextPath[0])) {
                    // Concat forwards
                    unvisitedPathIndexSet.delete(p);
                    return nextPath;
                }
                else if (faceHasVertIndex(unbufferedGeometry, f, nextPath[nextPath.length - 1])) {
                    // Concat backwards
                    unvisitedPathIndexSet.delete(p);
                    return nextPath.reverse();
                }
            }
        }
    }
};
//# sourceMappingURL=PathFinder.js.map

/***/ }),

/***/ "./src/cjs/PlaneMeshIntersection.js":
/*!******************************************!*\
  !*** ./src/cjs/PlaneMeshIntersection.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Compute the intersection of a mesh and a plane.
 *
 * Inspired by
 *    https://stackoverflow.com/questions/42348495/three-js-find-all-points-where-a-mesh-intersects-a-plane
 *    https://jsfiddle.net/prisoner849/8uxw667m/
 *
 * @co-author Ikaros Kappler
 * @date 2021-06-11
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version 1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlaneMeshIntersection = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
var PlaneMeshIntersection = /** @class */ (function () {
    /**
     * Constructor.
     */
    function PlaneMeshIntersection() {
        var _this = this;
        /**
         *
         * @param {THREE.Mesh} mesh
         * @param {ThreeGeometryHellfix.Gmetry} geometry
         * @param {THREE.Mesh} plane {THREE.PlaneGeometry ???
         * @returns {Array<THREE.Vector3>}
         */
        // TODO: plane type???
        this.getIntersectionPoints = function (mesh, geometry, plane, planeGeometryReal) {
            // Note: this could also work with a directly passed Mesh.Plane object instead a THREE.PlaneGeometry.
            _this.pointsOfIntersection = [];
            var mathPlane = new THREE.Plane();
            // var planeGeometry : THREE.Geometry = (plane as unknown).geometry;
            // plane.localToWorld(this.planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
            // plane.localToWorld(this.planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
            // plane.localToWorld(this.planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
            // TODO: https://discourse.threejs.org/t/three-geometry-will-be-removed-from-core-with-r125/22401/13
            // plane.localToWorld(this.planePointA.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].a]));
            // plane.localToWorld(this.planePointB.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].b]));
            // plane.localToWorld(this.planePointC.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].c]));
            var _a = getThreePlanePoints(planeGeometryReal), a = _a[0], b = _a[1], c = _a[2];
            plane.localToWorld(_this.planePointA.copy(a));
            plane.localToWorld(_this.planePointB.copy(b));
            plane.localToWorld(_this.planePointC.copy(c));
            mathPlane.setFromCoplanarPoints(_this.planePointA, _this.planePointB, _this.planePointC);
            var _self = _this;
            geometry.faces.forEach(function (face) {
                mesh.localToWorld(_self.a.copy(geometry.vertices[face.a]));
                mesh.localToWorld(_self.b.copy(geometry.vertices[face.b]));
                mesh.localToWorld(_self.c.copy(geometry.vertices[face.c]));
                _self.lineAB = new THREE.Line3(_self.a, _self.b);
                _self.lineBC = new THREE.Line3(_self.b, _self.c);
                _self.lineCA = new THREE.Line3(_self.c, _self.a);
                _self.__setPointOfIntersection(_self.lineAB, mathPlane);
                _self.__setPointOfIntersection(_self.lineBC, mathPlane);
                _self.__setPointOfIntersection(_self.lineCA, mathPlane);
            });
            return _this.pointsOfIntersection;
        };
        this.__setPointOfIntersection = function (line, plane) {
            var intersectionPoint = plane.intersectLine(line, this.pointOfIntersection);
            if (intersectionPoint) {
                this.pointsOfIntersection.push(intersectionPoint.clone());
            }
        };
        //   Vector3[]
        this.pointsOfIntersection = [];
        this.a = new THREE.Vector3();
        this.b = new THREE.Vector3();
        this.c = new THREE.Vector3();
        this.planePointA = new THREE.Vector3();
        this.planePointB = new THREE.Vector3();
        this.planePointC = new THREE.Vector3();
        this.lineAB = new THREE.Line3();
        this.lineBC = new THREE.Line3();
        this.lineCA = new THREE.Line3();
        this.pointOfIntersection = new THREE.Vector3();
    }
    return PlaneMeshIntersection;
}());
exports.PlaneMeshIntersection = PlaneMeshIntersection;
// https://discourse.threejs.org/t/three-geometry-will-be-removed-from-core-with-r125/22401/13
//
// Due to Mugen87 accessing vertices in the BufferGeometry (replacing Geomtry) works like this:
//
// const positionAttribute = MovingCube.geometry.getAttribute( 'position' );
// const localVertex = new THREE.Vector3();
// const globalVertex = new THREE.Vector3();
// for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
// 	localVertex.fromBufferAttribute( positionAttribute, vertexIndex );
// 	globalVertex.copy( localVertex ).applyMatrix4( MovingCube.matrixWorld );
// }
var getThreePlanePoints = function (planeGeometryReal) {
    var positionAttribute = planeGeometryReal.getAttribute("position");
    var localVertex = new THREE.Vector3();
    // const globalVertex = new THREE.Vector3();
    // for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
    // 	localVertex.fromBufferAttribute( positionAttribute, vertexIndex );
    // 	// globalVertex.copy( localVertex ).applyMatrix4( planeGeometryReal.matrixWorld );
    // }
    var a = new THREE.Vector3();
    var b = new THREE.Vector3();
    var c = new THREE.Vector3();
    a.fromBufferAttribute(positionAttribute, 0);
    b.fromBufferAttribute(positionAttribute, 1);
    c.fromBufferAttribute(positionAttribute, 2);
    return [a, b, c];
};
//# sourceMappingURL=PlaneMeshIntersection.js.map

/***/ }),

/***/ "./src/cjs/UVHelpers.js":
/*!******************************!*\
  !*** ./src/cjs/UVHelpers.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * @author   Ikaros Kappler
 * @date     2021-08-03
 * @modified 2021-08-04 Ported to Typsescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.2
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UVHelpers = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
exports.UVHelpers = {
    /**
     * Helper function to create triangular UV Mappings for a triangle.
     *
     * @param {ThreeGeometryHellfix.Gmetry} thisGeometry
     * @param {Bounds} shapeBounds
     * @param {number} vertIndexA - The index in the geometry's vertices array.
     * @param {number} vertIndexB - ...
     * @param {number} vertIndexC - ...
     */
    makeFlatTriangleUVs: function (thisGeometry, // THREE.Geometry does not longer exist since r125 and will be replaced by BufferGeometry
    shapeBounds, vertIndexA, vertIndexB, vertIndexC) {
        var vertA = thisGeometry.vertices[vertIndexA];
        var vertB = thisGeometry.vertices[vertIndexB];
        var vertC = thisGeometry.vertices[vertIndexC];
        // Convert a position vertex { x, y, * } to UV coordinates { u, v }
        var getUVRatios = function (vert) {
            return new THREE.Vector2((vert.x - shapeBounds.min.x) / shapeBounds.width, (vert.y - shapeBounds.min.y) / shapeBounds.height);
        };
        thisGeometry.faceVertexUvs[0].push([getUVRatios(vertA), getUVRatios(vertB), getUVRatios(vertC)]);
    }
};
//# sourceMappingURL=UVHelpers.js.map

/***/ }),

/***/ "./src/cjs/clearDuplicateVertices3.js":
/*!********************************************!*\
  !*** ./src/cjs/clearDuplicateVertices3.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * @author   Ikaros Kappler
 * @date     2021-07-13
 * @modified 2021-08-04 Ported to Typescript from vainlla JS.
 * @version  1.0.1
 **/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.clearDuplicateVertices3 = void 0;
var EPS = 0.000001;
/**
 * Filter the array and clear all duplicates.
 *
 * The original array is left unchanged. The vertices in the array are not cloned.
 *
 * @param {THREE.Vector3[]} vertices
 * @param {number=EPS} epsilon
 * @return {THREE.Vector3[]}
 */
var clearDuplicateVertices3 = function (vertices, epsilon) {
    if (typeof epsilon === "undefined") {
        epsilon = EPS;
    }
    var result = [];
    for (var i = 0; i < vertices.length; i++) {
        if (!containsElementFrom(vertices, vertices[i], i + 1, epsilon)) {
            result.push(vertices[i]);
        }
    }
    return result;
};
exports.clearDuplicateVertices3 = clearDuplicateVertices3;
/**
 * A distance checker: check if the passed to vertices are no more than 'eps' units apart.
 *
 * @param {THREE.Vector3} vertA
 * @param {THREE.Vector3} vertB
 * @param {number} eps
 * @returns {boolean}
 */
var isCloseTo = function (vertA, vertB, eps) {
    return vertA.distanceTo(vertB) < eps;
};
/**
 * Try to find an element in the given vertex array, starting at a given position (inclusive).
 *
 * @param {THREE.Vector3[]} vertices
 * @param {THREE.Vector3} vertex
 * @param {number} fromIndex
 * @param {number} epsilon
 * @returns {boolan}
 */
var containsElementFrom = function (vertices, vertex, fromIndex, epsilon) {
    for (var i = fromIndex; i < vertices.length; i++) {
        if (isCloseTo(vertices[i], vertex, epsilon)) {
            return true;
        }
    }
    return false;
};
//# sourceMappingURL=clearDuplicateVertices3.js.map

/***/ }),

/***/ "./src/cjs/computeVertexNormals.js":
/*!*****************************************!*\
  !*** ./src/cjs/computeVertexNormals.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Calculate the vertex normals of a mesh from the pre-calculated face normals.
 *
 * jkmott writing about this challenge:
 *   >> If you have a large complex mesh with small faces you can get away with
 *   >> computing the vertex normals by taking the average of the face normals
 *   >> that surround it, and that’s a fine strategy.
 *
 * https://meshola.wordpress.com/2016/07/24/three-js-vertex-normals/
 *
 * @author   Ikaros Kappler
 * @date     2021-08-31
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeVertexNormals = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
/**
 * Compute the vertex normals of a base geometry and its buffered counterpart (both parts are required here).
 *
 * Note that unbufferedGeometry.computeVertexNormals() must have been called for this to work.
 *
 * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The base geometry.
 * @param {THREE.BufferedGeometry} bufferedGeometry - The buffered geometry.
 * @returns
 */
var computeVertexNormals = function (unbufferedGeometry, bufferedGeometry) {
    // Fetch the face normals from the buffers.
    var vertexNormals = bufferedGeometry.getAttribute("normal");
    var collectedFaceNormals = Array(unbufferedGeometry.faces.length);
    // For each face get the three face normals, each of which consists of 3 float values itself.
    // So each face consumes 9 floats from the array buffer.
    for (var f = 0; f < unbufferedGeometry.faces.length; f++) {
        var face = unbufferedGeometry.faces[f];
        var faceNormalA = new THREE.Vector3(vertexNormals.array[f * 9 + 0], vertexNormals.array[f * 9 + 1], vertexNormals.array[f * 9 + 2]);
        var faceNormalB = new THREE.Vector3(vertexNormals.array[f * 9 + 3], vertexNormals.array[f * 9 + 4], vertexNormals.array[f * 9 + 5]);
        var faceNormalC = new THREE.Vector3(vertexNormals.array[f * 9 + 6], vertexNormals.array[f * 9 + 7], vertexNormals.array[f * 9 + 8]);
        addVertexNormal(collectedFaceNormals, face.a, faceNormalA);
        addVertexNormal(collectedFaceNormals, face.b, faceNormalB);
        addVertexNormal(collectedFaceNormals, face.c, faceNormalC);
    } // END for
    //   console.log("collectedFaceNormals", collectedFaceNormals);
    var normals = new Array(unbufferedGeometry.vertices.length);
    for (var i = 0; i < unbufferedGeometry.vertices.length; i++) {
        var averageNormal = computeAverageVector(collectedFaceNormals[i]);
        averageNormal.add(unbufferedGeometry.vertices[i]);
        normals[i] = new THREE.Line3(unbufferedGeometry.vertices[i], averageNormal);
    }
    return normals;
};
exports.computeVertexNormals = computeVertexNormals;
/**
 * Add the computed face normal to the given vertex normal buffer.
 *
 * Each vertex normal buffer ends up with multiple face normals associated with it (from the
 * adjacent faces). The aim is to calculate the average vector from all.
 *
 * @param {Array<THREE.Vector3[]>} buffer
 * @param {number} vertIndex
 * @param {THREE.Vector3} vertexNormal
 */
var addVertexNormal = function (buffer, vertIndex, vertexNormal) {
    if (vertIndex >= buffer.length || typeof buffer[vertIndex] === "undefined") {
        buffer[vertIndex] = [];
    }
    buffer[vertIndex].push(vertexNormal);
};
/**
 * Compute the average vector from a sequence of (nromal) vectors.
 *
 * @param {Array<THREE.Vector3>} vectors - The vectors to get the average vector for.
 * @returns {THREE.Vector3} The average vector from all given.
 */
var computeAverageVector = function (vectors) {
    var avg = new THREE.Vector3(0, 0, 0);
    if (vectors) {
        vectors.forEach(function (nrml) {
            avg.add(nrml);
        });
        avg.divideScalar(vectors.length);
    }
    return avg;
};
//# sourceMappingURL=computeVertexNormals.js.map

/***/ }),

/***/ "./src/cjs/constants.js":
/*!******************************!*\
  !*** ./src/cjs/constants.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-08-30
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KEY_SLICED_MESH_LEFT = exports.KEY_SLICED_MESH_RIGHT = exports.KEY_SPLIT_TRIANGULATION_GEOMETRIES = exports.KEY_PLANE_INTERSECTION_TRIANGULATION = exports.KEY_PLANE_INTERSECTION_POINTS = exports.KEY_SPLIT_PANE_MESH = exports.KEY_RIGHT_SLICE_PLANE = exports.KEY_LEFT_SLICE_PLANE = exports.KEY_RIGHT_SLICE_GEOMETRY = exports.KEY_LEFT_SLICE_GEOMETRY = exports.SPLIT_MESH_OFFSET = exports.DEG_TO_RAD = exports.EPS = void 0;
exports.EPS = 0.000001;
exports.DEG_TO_RAD = Math.PI / 180.0;
// Note: z and -z will be used for left and right split.
exports.SPLIT_MESH_OFFSET = { x: 0, y: -100, z: -50 };
exports.KEY_LEFT_SLICE_GEOMETRY = "KEY_LEFT_SLICE_GEOMETRY"; // THREE.Geometry
exports.KEY_RIGHT_SLICE_GEOMETRY = "KEY_RIGHT_SLICE_GEOMETRY"; // THREE.Geometry
exports.KEY_LEFT_SLICE_PLANE = "KEY_LEFT_SLICE_PLANE"; // THREE.Plane
exports.KEY_RIGHT_SLICE_PLANE = "KEY_RIGHT_SLICE_PLANE"; // THREE.Plane
exports.KEY_SPLIT_PANE_MESH = "KEY_SPLIT_PANE_MESH"; // THREE.Mesh
exports.KEY_PLANE_INTERSECTION_POINTS = "KEY_PLANE_INTERSECTION_POINTS"; // Array<Vector3>
exports.KEY_PLANE_INTERSECTION_TRIANGULATION = "KEY_PLANE_INTERSECTION_TRIANGULATION"; // THREE.Geometry
exports.KEY_SPLIT_TRIANGULATION_GEOMETRIES = "KEY_SPLIT_TRIANGULATION_GEOMETRIES"; // Array<THREE.Geometry>
exports.KEY_SLICED_MESH_RIGHT = "KEY_SLICED_MESH_RIGHT"; // THREE.Mesh
exports.KEY_SLICED_MESH_LEFT = "KEY_SLICED_MESH_LEFT"; // THREE.Mesh
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./src/cjs/defaults.js":
/*!*****************************!*\
  !*** ./src/cjs/defaults.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_BEZIER_JSON = void 0;
// Refactored from dildo-generator
exports.DEFAULT_BEZIER_JSON = "\n  [\n    {\n       \"startPoint\":[\n          -122,\n          77.80736634304651\n       ],\n       \"endPoint\":[\n          -65.59022229786551,\n          21.46778533702511\n       ],\n       \"startControlPoint\":[\n          -121.62058129515852,\n          25.08908859418696\n       ],\n       \"endControlPoint\":[\n          -79.33419353770395,\n          48.71529293460728\n       ]\n    },\n    {\n       \"startPoint\":[\n          -65.59022229786551,\n          21.46778533702511\n       ],\n       \"endPoint\":[\n          -65.66917273472913,\n          -149.23537680826058\n       ],\n       \"startControlPoint\":[\n          -52.448492057756646,\n          -4.585775770903305\n       ],\n       \"endControlPoint\":[\n          -86.1618869001374,\n          -62.11613821618976\n       ]\n    },\n    {\n       \"startPoint\":[\n          -65.66917273472913,\n          -149.23537680826058\n       ],\n       \"endPoint\":[\n          -61.86203591980055,\n          -243.8368165606738\n       ],\n       \"startControlPoint\":[\n          -53.701578771473564,\n          -200.1123697454778\n       ],\n       \"endControlPoint\":[\n          -69.80704300441666,\n          -205.36451303641783\n       ]\n    },\n    {\n       \"startPoint\":[\n          -61.86203591980055,\n          -243.8368165606738\n       ],\n       \"endPoint\":[\n          -21.108966092052256,\n          -323\n       ],\n       \"startControlPoint\":[\n          -54.08681426887413,\n          -281.486963896856\n       ],\n       \"endControlPoint\":[\n          -53.05779349623559,\n          -323\n       ]\n    }\n ]\n  ";
//# sourceMappingURL=defaults.js.map

/***/ }),

/***/ "./src/cjs/entry.js":
/*!**************************!*\
  !*** ./src/cjs/entry.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {



// Export the library to the global scope:
globalThis.ngdg = (__webpack_require__(/*! ./ngdg */ "./src/cjs/ngdg.js").ngdg);


/***/ }),

/***/ "./src/cjs/isMobileDevice.js":
/*!***********************************!*\
  !*** ./src/cjs/isMobileDevice.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


// http://detectmobilebrowsers.com/
// @date 2021-11-02
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isMobileDevice = void 0;
var isMobileDevice = function () {
    return (function (a) {
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)));
    })(navigator.userAgent || navigator.vendor || window.opera);
};
exports.isMobileDevice = isMobileDevice;
//# sourceMappingURL=isMobileDevice.js.map

/***/ }),

/***/ "./src/cjs/locateVertexInArray.js":
/*!****************************************!*\
  !*** ./src/cjs/locateVertexInArray.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * @author   Ikaros Kappler
 * @date     2021-07-26
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.locateVertexInArray = void 0;
/**
 * Find that vertex in the array that is closest to the given vertex.
 *
 * The epsilon is not optional.
 *
 * @param {Array<THREE.Vector3>} vertArray
 * @param {THREE.Vector3} vertex
 * @param {number} epsilon
 * @returns {number} The index of the found vertex or -1 if not found.
 */
var locateVertexInArray = function (vertArray, vertex, epsilon) {
    var closestDist = Number.POSITIVE_INFINITY;
    var closestIndex = -1;
    for (var i = 0; i < vertArray.length; i++) {
        var dist = vertArray[i].distanceTo(vertex);
        if (closestIndex === -1 && dist < closestDist && dist < epsilon) {
            closestIndex = i;
            closestDist = dist;
        }
    }
    return closestIndex;
};
exports.locateVertexInArray = locateVertexInArray;
//# sourceMappingURL=locateVertexInArray.js.map

/***/ }),

/***/ "./src/cjs/mergeGeometries.js":
/*!************************************!*\
  !*** ./src/cjs/mergeGeometries.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Merge one geometry (all vertices and faces) into the other.
 *
 * @require locateVertexInArray
 *
 * @author   Ikaros Kappler
 * @date     2021-07-26
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry (and so Face3).
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mergeAndMapVertices = exports.mergeGeometries = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.cjs");
var locateVertexInArray_1 = __webpack_require__(/*! ./locateVertexInArray */ "./src/cjs/locateVertexInArray.js");
var three_geometry_hellfix_1 = __webpack_require__(/*! three-geometry-hellfix */ "./node_modules/three-geometry-hellfix/src/esm/index.js");
var EPS = 0.000001;
// import { EPS } from "./constants";
/**
 * This function tries to merge the 'mergeGeometry' into the 'baseGeometry'.
 * It assumes that both geometries are somehow connected, so it will try to
 * local equal vertices first instead of just copying all 'mergeGeometry' vertices
 * into the other one.
 *
 * The merged vertices will be cloned.
 *
 * @param {ThreeGeometryHellfix.Gmetry} baseGeometry
 * @param {ThreeGeometryHellfix.Gmetry} mergeGeometry
 */
var mergeGeometries = function (baseGeometry, mergeGeometry, epsilon) {
    if (typeof epsilon === "undefined") {
        epsilon = EPS;
    }
    var vertexMap = (0, exports.mergeAndMapVertices)(baseGeometry, mergeGeometry, epsilon);
    for (var f = 0; f < mergeGeometry.faces.length; f++) {
        var face = mergeGeometry.faces[f];
        var a = vertexMap[face.a];
        var b = vertexMap[face.b];
        var c = vertexMap[face.c];
        // baseGeometry.faces.push(new THREE.Face3(a, b, c));
        // TODO: how to use this here?
        // Face3 is not a constructor!!! Just a type!!!
        baseGeometry.faces.push(new three_geometry_hellfix_1.Face3(a, b, c));
        if (mergeGeometry.faceVertexUvs.length > 0 && f < mergeGeometry.faceVertexUvs[0].length) {
            var uvData = mergeGeometry.faceVertexUvs[0][f]; // [Vector2,Vector2,Vector2]
            baseGeometry.faceVertexUvs[0].push([uvData[0].clone(), uvData[1].clone(), uvData[2].clone()]);
        }
        else {
            baseGeometry.faceVertexUvs[0].push([new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(1.0, 0.5)]);
        }
    }
};
exports.mergeGeometries = mergeGeometries;
/**
 * This function merges the vertices from a given geometry into a base geometry.
 * It will ty to locate existing vertices within an epsilon range and keep those. Vertices that
 * have no close existing counterpart in the base geometry will be added.
 *
 * The function returns a mapping of new/merged vertices inside the base geometry, showing
 * which vertex (index) was mapped whereto.
 *
 * @param {THREE-Geometry} baseGeometry
 * @param {THREE-Geometry} mergeGeometry
 * @param {number} epsilon
 * @returns Array<number>
 */
var mergeAndMapVertices = function (baseGeometry, mergeGeometry, epsilon) {
    var vertexMap = [];
    for (var v = 0; v < mergeGeometry.vertices.length; v++) {
        var mergeVert = mergeGeometry.vertices[v];
        var indexInBase = (0, locateVertexInArray_1.locateVertexInArray)(baseGeometry.vertices, mergeVert, epsilon);
        if (indexInBase === -1) {
            // The current vertex cannot be found in the base geometry.
            //  -> add to geometry and remember new index.
            vertexMap.push(baseGeometry.vertices.length);
            baseGeometry.vertices.push(mergeVert.clone());
        }
        else {
            vertexMap.push(indexInBase);
        }
    }
    return vertexMap;
};
exports.mergeAndMapVertices = mergeAndMapVertices;
//# sourceMappingURL=mergeGeometries.js.map

/***/ }),

/***/ "./src/cjs/ngdg.js":
/*!*************************!*\
  !*** ./src/cjs/ngdg.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * This defines the globally exported wrapper library.
 *
 * See ./src/cjs/entry.js
 *
 * @author   Ikaros Kappler
 * @version  1.0.0
 * @date     2021-09-27
 * @modified 2022-01-29
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ngdg = void 0;
var defaults_1 = __webpack_require__(/*! ./defaults */ "./src/cjs/defaults.js");
var ImageStore_1 = __webpack_require__(/*! ./ImageStore */ "./src/cjs/ImageStore.js");
var DildoGeneration_1 = __webpack_require__(/*! ./DildoGeneration */ "./src/cjs/DildoGeneration.js");
var LocalstorageIO_1 = __webpack_require__(/*! ./LocalstorageIO */ "./src/cjs/LocalstorageIO.js");
var isMobileDevice_1 = __webpack_require__(/*! ./isMobileDevice */ "./src/cjs/isMobileDevice.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
exports.ngdg = {
    DEFAULT_BEZIER_JSON: defaults_1.DEFAULT_BEZIER_JSON,
    DEG_TO_RAD: constants_1.DEG_TO_RAD,
    SPLIT_MESH_OFFSET: constants_1.SPLIT_MESH_OFFSET,
    KEY_SLICED_MESH_RIGHT: constants_1.KEY_SLICED_MESH_RIGHT,
    KEY_SLICED_MESH_LEFT: constants_1.KEY_SLICED_MESH_LEFT,
    LocalstorageIO: LocalstorageIO_1.LocalstorageIO,
    DildoGeneration: DildoGeneration_1.DildoGeneration,
    ImageStore: ImageStore_1.ImageStore,
    isMobileDevice: isMobileDevice_1.isMobileDevice
};
//# sourceMappingURL=ngdg.js.map

/***/ }),

/***/ "./src/cjs/randomWebColor.js":
/*!***********************************!*\
  !*** ./src/cjs/randomWebColor.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Refactored from some older code from 2020.
 *
 * @requires WebColors
 * @requires WebColorsMalachite
 * @requires WebColorsContrast
 *
 * @author   Ikaros Kappler
 * @date     2021-07-14
 * @modified 2021-08-29 Ported to Typescript from vanilla Js.
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.randomWebColor = void 0;
var WebColorsMalachite_1 = __webpack_require__(/*! plotboilerplate/src/esm/utils/WebColorsMalachite */ "./node_modules/plotboilerplate/src/esm/utils/WebColorsMalachite.js");
var WebColorsContrast_1 = __webpack_require__(/*! plotboilerplate/src/esm/utils/WebColorsContrast */ "./node_modules/plotboilerplate/src/esm/utils/WebColorsContrast.js");
var WebColors_1 = __webpack_require__(/*! plotboilerplate/src/esm/utils/WebColors */ "./node_modules/plotboilerplate/src/esm/utils/WebColors.js");
/**
 * Pick a color from the WebColors array.
 *
 * All params are optional.
 *
 * @param {number=undefined} index
 * @param {"Malachite"|"Mixed"|"WebColors"} colorSet
 **/
var randomWebColor = function (index, colorSet) {
    if (typeof index === "undefined") {
        var maxLen = Math.max(typeof WebColorsMalachite_1.WebColorsMalachite !== "undefined" ? WebColorsMalachite_1.WebColorsMalachite.length : 0, typeof WebColorsContrast_1.WebColorsContrast !== "undefined" ? WebColorsContrast_1.WebColorsContrast.length : 0, typeof WebColors_1.WebColors !== "undefined" ? WebColors_1.WebColors.length : 0);
        index = Math.round(Math.random() * maxLen);
    }
    switch (colorSet) {
        case "Malachite":
            if (typeof WebColorsMalachite_1.WebColorsMalachite !== "undefined") {
                return WebColorsMalachite_1.WebColorsMalachite[index % WebColorsMalachite_1.WebColorsMalachite.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsMalachite' color palette but it is not installed. Falling back.");
            }
        case "Mixed":
            if (typeof WebColorsContrast_1.WebColorsContrast !== "undefined") {
                return WebColorsContrast_1.WebColorsContrast[index % WebColorsContrast_1.WebColorsContrast.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsContrast' color palette but it is not installed. Falling back.");
            }
        case "WebColors":
        default:
            return WebColors_1.WebColors[index % WebColors_1.WebColors.length].cssRGB();
    }
};
exports.randomWebColor = randomWebColor;
//# sourceMappingURL=randomWebColor.js.map

/***/ }),

/***/ "../threejs-slice-geometry-typescript/src/esm/GeometryBuilder.js":
/*!***********************************************************************!*\
  !*** ../threejs-slice-geometry-typescript/src/esm/GeometryBuilder.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GeometryBuilder": () => (/* binding */ GeometryBuilder)
/* harmony export */ });
/* harmony import */ var _faces_from_edges__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./faces-from-edges */ "../threejs-slice-geometry-typescript/src/esm/faces-from-edges.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "../threejs-slice-geometry-typescript/src/esm/constants.js");
/* harmony import */ var three_geometry_hellfix__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three-geometry-hellfix */ "../threejs-slice-geometry-typescript/node_modules/three-geometry-hellfix/src/esm/index.js");
/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */



class GeometryBuilder {
    constructor(sourceGeometry, targetGeometry, slicePlane) {
        this.sourceGeometry = sourceGeometry;
        this.targetGeometry = targetGeometry;
        this.slicePlane = slicePlane;
        this.addedVertices = [];
        this.addedIntersections = [];
        this.newEdges = [[]];
    }
    ;
    // TODO: check undfined?
    // This is called without params in line ---67 but param used here as an index??
    startFace(sourceFaceIndex) {
        this.sourceFaceIndex = sourceFaceIndex;
        this.sourceFace = this.sourceGeometry.faces[sourceFaceIndex];
        this.sourceFaceUvs = this.sourceGeometry.faceVertexUvs[0][sourceFaceIndex];
        this.faceIndices = [];
        this.faceNormals = [];
        this.faceUvs = [];
    }
    ;
    endFace() {
        var indices = this.faceIndices.map(function (index, i) {
            return i;
        });
        this.addFace(indices);
    }
    ;
    closeHoles() {
        if (!this.newEdges[0].length) {
            return;
        }
        (0,_faces_from_edges__WEBPACK_IMPORTED_MODULE_0__.facesFromEdges)(this.newEdges)
            .forEach((faceIndices) => {
            var normal = this.faceNormal(faceIndices);
            if (normal.dot(this.slicePlane.normal) > .5) {
                faceIndices.reverse();
            }
            this.startFace();
            this.faceIndices = faceIndices;
            this.endFace();
        }, this);
    }
    ;
    addVertex(key) {
        this.addUv(key);
        this.addNormal(key);
        const index = this.sourceFace[key];
        let newIndex;
        if (this.addedVertices.hasOwnProperty(index)) {
            newIndex = this.addedVertices[index];
        }
        else {
            const vertex = this.sourceGeometry.vertices[index];
            this.targetGeometry.vertices.push(vertex);
            newIndex = this.targetGeometry.vertices.length - 1;
            this.addedVertices[index] = newIndex;
        }
        this.faceIndices.push(newIndex);
    }
    ;
    addIntersection(keyA, keyB, distanceA, distanceB) {
        const t = Math.abs(distanceA) / (Math.abs(distanceA) + Math.abs(distanceB));
        this.addIntersectionUv(keyA, keyB, t);
        this.addIntersectionNormal(keyA, keyB, t);
        const indexA = this.sourceFace[keyA];
        const indexB = this.sourceFace[keyB];
        const id = this.intersectionId(indexA, indexB);
        let index;
        if (this.addedIntersections.hasOwnProperty(id)) {
            index = this.addedIntersections[id];
        }
        else {
            const vertexA = this.sourceGeometry.vertices[indexA];
            const vertexB = this.sourceGeometry.vertices[indexB];
            const newVertex = vertexA.clone().lerp(vertexB, t);
            this.targetGeometry.vertices.push(newVertex);
            index = this.targetGeometry.vertices.length - 1;
            this.addedIntersections[id] = index;
        }
        this.faceIndices.push(index);
        this.updateNewEdges(index);
    }
    ;
    addUv(key) {
        if (!this.sourceFaceUvs) {
            return;
        }
        const index = this.keyIndex(key);
        const uv = this.sourceFaceUvs[index];
        this.faceUvs.push(uv);
    }
    ;
    addIntersectionUv(keyA, keyB, t) {
        if (!this.sourceFaceUvs) {
            return;
        }
        const indexA = this.keyIndex(keyA);
        const indexB = this.keyIndex(keyB);
        const uvA = this.sourceFaceUvs[indexA];
        const uvB = this.sourceFaceUvs[indexB];
        const uv = uvA.clone().lerp(uvB, t);
        this.faceUvs.push(uv);
    }
    ;
    addNormal(key) {
        if (!this.sourceFace.vertexNormals.length) {
            return;
        }
        const index = this.keyIndex(key);
        const normal = this.sourceFace.vertexNormals[index];
        this.faceNormals.push(normal);
    }
    ;
    addIntersectionNormal(keyA, keyB, t) {
        if (!this.sourceFace.vertexNormals.length) {
            return;
        }
        const indexA = this.keyIndex(keyA);
        const indexB = this.keyIndex(keyB);
        const normalA = this.sourceFace.vertexNormals[indexA];
        const normalB = this.sourceFace.vertexNormals[indexB];
        const normal = normalA.clone().lerp(normalB, t).normalize();
        this.faceNormals.push(normal);
    }
    ;
    addFace(indices) {
        if (indices.length === 3) {
            this.addFacePart(indices[0], indices[1], indices[2]);
            return;
        }
        const pairs = [];
        for (var i = 0; i < indices.length; i++) {
            for (var j = i + 1; j < indices.length; j++) {
                var diff = Math.abs(i - j);
                if (diff > 1 && diff < indices.length - 1) {
                    pairs.push([indices[i], indices[j]]);
                }
            }
        }
        pairs.sort(((pairA, pairB) => {
            var lengthA = this.faceEdgeLength(pairA[0], pairA[1]);
            var lengthB = this.faceEdgeLength(pairB[0], pairB[1]);
            return lengthA - lengthB;
        }).bind(this));
        const a = indices.indexOf(pairs[0][0]);
        indices = indices.slice(a).concat(indices.slice(0, a));
        const b = indices.indexOf(pairs[0][1]);
        const indicesA = indices.slice(0, b + 1);
        const indicesB = indices.slice(b).concat(indices.slice(0, 1));
        this.addFace(indicesA);
        this.addFace(indicesB);
    }
    ;
    addFacePart(a, b, c) {
        let normals = null;
        if (this.faceNormals.length) {
            normals = [
                this.faceNormals[a],
                this.faceNormals[b],
                this.faceNormals[c],
            ];
        }
        const face = new three_geometry_hellfix__WEBPACK_IMPORTED_MODULE_2__.Face3(this.faceIndices[a], this.faceIndices[b], this.faceIndices[c], normals);
        this.targetGeometry.faces.push(face);
        if (!this.sourceFaceUvs) {
            return;
        }
        this.targetGeometry.faceVertexUvs[0].push([
            this.faceUvs[a],
            this.faceUvs[b],
            this.faceUvs[c]
        ]);
    }
    ;
    faceEdgeLength(a, b) {
        const indexA = this.faceIndices[a];
        const indexB = this.faceIndices[b];
        const vertexA = this.targetGeometry.vertices[indexA];
        const vertexB = this.targetGeometry.vertices[indexB];
        return vertexA.distanceToSquared(vertexB);
    }
    ;
    intersectionId(indexA, indexB) {
        return [indexA, indexB].sort().join(',');
    }
    ;
    keyIndex(key) {
        return _constants__WEBPACK_IMPORTED_MODULE_1__.FACE_KEYS.indexOf(key);
    }
    ;
    updateNewEdges(index) {
        const edgeIndex = this.newEdges.length - 1;
        let edge = this.newEdges[edgeIndex];
        if (edge.length < 2) {
            edge.push(index);
        }
        else {
            this.newEdges.push([index]);
        }
    }
    ;
    faceNormal(faceIndices) {
        const vertices = faceIndices.map(((index) => {
            return this.targetGeometry.vertices[index];
        }).bind(this));
        const edgeA = vertices[0].clone().sub(vertices[1]);
        const edgeB = vertices[0].clone().sub(vertices[2]);
        return edgeA.cross(edgeB).normalize();
    }
    ;
}
//# sourceMappingURL=GeometryBuilder.js.map

/***/ }),

/***/ "../threejs-slice-geometry-typescript/src/esm/constants.js":
/*!*****************************************************************!*\
  !*** ../threejs-slice-geometry-typescript/src/esm/constants.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FRONT": () => (/* binding */ FRONT),
/* harmony export */   "BACK": () => (/* binding */ BACK),
/* harmony export */   "ON": () => (/* binding */ ON),
/* harmony export */   "FACE_KEYS": () => (/* binding */ FACE_KEYS)
/* harmony export */ });
const FRONT = 'front';
const BACK = 'back';
const ON = 'on';
const FACE_KEYS = ['a', 'b', 'c'];
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "../threejs-slice-geometry-typescript/src/esm/faces-from-edges.js":
/*!************************************************************************!*\
  !*** ../threejs-slice-geometry-typescript/src/esm/faces-from-edges.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "facesFromEdges": () => (/* binding */ facesFromEdges)
/* harmony export */ });
/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */
const facesFromEdges = (edges) => {
    var chains = joinEdges(edges).filter(validFace);
    var faces = chains.map(function (chain) {
        return chain.map(function (edge) {
            return edge[0];
        });
    });
    return faces;
};
const joinEdges = (edges) => {
    let changes = true;
    var chains = edges.map((edge) => {
        return [edge];
    });
    while (changes) {
        changes = connectChains(chains);
    }
    chains = chains.filter(function (chain) {
        return chain.length;
    });
    return chains;
};
const connectChains = (chains) => {
    chains.forEach(function (chainA, i) {
        chains.forEach(function (chainB, j) {
            var merged = mergeChains(chainA, chainB);
            if (merged) {
                delete chains[j];
                return true;
            }
        });
    });
    return false;
};
const mergeChains = (chainA, chainB) => {
    if (chainA === chainB) {
        return false;
    }
    if (chainStart(chainA) === chainEnd(chainB)) {
        chainA.unshift.apply(chainA, chainB);
        return true;
    }
    if (chainStart(chainA) === chainStart(chainB)) {
        reverseChain(chainB);
        chainA.unshift.apply(chainA, chainB);
        return true;
    }
    if (chainEnd(chainA) === chainStart(chainB)) {
        chainA.push.apply(chainA, chainB);
        return true;
    }
    if (chainEnd(chainA) === chainEnd(chainB)) {
        reverseChain(chainB);
        chainA.push.apply(chainA, chainB);
        return true;
    }
    return false;
};
const chainStart = (chain) => {
    return chain[0][0];
};
const chainEnd = (chain) => {
    return chain[chain.length - 1][1];
};
const reverseChain = (chain) => {
    chain.reverse();
    chain.forEach(function (edge) {
        edge.reverse();
    });
};
const validFace = (chain) => {
    return chainStart(chain) === chainEnd(chain) ? 1 : 0;
};
//# sourceMappingURL=faces-from-edges.js.map

/***/ }),

/***/ "../threejs-slice-geometry-typescript/src/esm/index.js":
/*!*************************************************************!*\
  !*** ../threejs-slice-geometry-typescript/src/esm/index.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BACK": () => (/* reexport safe */ _constants__WEBPACK_IMPORTED_MODULE_0__.BACK),
/* harmony export */   "FACE_KEYS": () => (/* reexport safe */ _constants__WEBPACK_IMPORTED_MODULE_0__.FACE_KEYS),
/* harmony export */   "FRONT": () => (/* reexport safe */ _constants__WEBPACK_IMPORTED_MODULE_0__.FRONT),
/* harmony export */   "ON": () => (/* reexport safe */ _constants__WEBPACK_IMPORTED_MODULE_0__.ON),
/* harmony export */   "facesFromEdges": () => (/* reexport safe */ _faces_from_edges__WEBPACK_IMPORTED_MODULE_1__.facesFromEdges),
/* harmony export */   "GeometryBuilder": () => (/* reexport safe */ _GeometryBuilder__WEBPACK_IMPORTED_MODULE_2__.GeometryBuilder),
/* harmony export */   "sliceGeometry": () => (/* reexport safe */ _slice__WEBPACK_IMPORTED_MODULE_3__.sliceGeometry)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../threejs-slice-geometry-typescript/src/esm/constants.js");
/* harmony import */ var _faces_from_edges__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./faces-from-edges */ "../threejs-slice-geometry-typescript/src/esm/faces-from-edges.js");
/* harmony import */ var _GeometryBuilder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./GeometryBuilder */ "../threejs-slice-geometry-typescript/src/esm/GeometryBuilder.js");
/* harmony import */ var _slice__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./slice */ "../threejs-slice-geometry-typescript/src/esm/slice.js");




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../threejs-slice-geometry-typescript/src/esm/slice.js":
/*!*************************************************************!*\
  !*** ../threejs-slice-geometry-typescript/src/esm/slice.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sliceGeometry": () => (/* binding */ sliceGeometry)
/* harmony export */ });
/* harmony import */ var _GeometryBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GeometryBuilder */ "../threejs-slice-geometry-typescript/src/esm/GeometryBuilder.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "../threejs-slice-geometry-typescript/src/esm/constants.js");
/* harmony import */ var three_geometry_hellfix__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three-geometry-hellfix */ "../threejs-slice-geometry-typescript/node_modules/three-geometry-hellfix/src/esm/index.js");



const sliceGeometry = (geometry, plane, closeHoles) => {
    const sliced = new three_geometry_hellfix__WEBPACK_IMPORTED_MODULE_2__.Gmetry();
    const builder = new _GeometryBuilder__WEBPACK_IMPORTED_MODULE_0__.GeometryBuilder(geometry, sliced, plane);
    const distances = [];
    const positions = [];
    geometry.vertices.forEach((vertex) => {
        const distance = findDistance(vertex, plane);
        const position = distanceAsPosition(distance);
        distances.push(distance);
        positions.push(position);
    });
    geometry.faces.forEach(function (face, faceIndex) {
        const facePositions = _constants__WEBPACK_IMPORTED_MODULE_1__.FACE_KEYS.map(function (key) {
            return positions[face[key]];
        });
        if (facePositions.indexOf(_constants__WEBPACK_IMPORTED_MODULE_1__.FRONT) === -1 &&
            facePositions.indexOf(_constants__WEBPACK_IMPORTED_MODULE_1__.BACK) !== -1) {
            return;
        }
        builder.startFace(faceIndex);
        let lastKey = _constants__WEBPACK_IMPORTED_MODULE_1__.FACE_KEYS[_constants__WEBPACK_IMPORTED_MODULE_1__.FACE_KEYS.length - 1];
        let lastIndex = face[lastKey];
        let lastDistance = distances[lastIndex];
        let lastPosition = positions[lastIndex];
        _constants__WEBPACK_IMPORTED_MODULE_1__.FACE_KEYS.map((key) => {
            var index = face[key];
            var distance = distances[index];
            var position = positions[index];
            if (position === _constants__WEBPACK_IMPORTED_MODULE_1__.FRONT) {
                if (lastPosition === _constants__WEBPACK_IMPORTED_MODULE_1__.BACK) {
                    builder.addIntersection(lastKey, key, lastDistance, distance);
                    builder.addVertex(key);
                }
                else {
                    builder.addVertex(key);
                }
            }
            if (position === _constants__WEBPACK_IMPORTED_MODULE_1__.ON) {
                builder.addVertex(key);
            }
            if (position === _constants__WEBPACK_IMPORTED_MODULE_1__.BACK && lastPosition === _constants__WEBPACK_IMPORTED_MODULE_1__.FRONT) {
                builder.addIntersection(lastKey, key, lastDistance, distance);
            }
            lastKey = key;
            lastIndex = index;
            lastPosition = position;
            lastDistance = distance;
        });
        builder.endFace();
    });
    if (closeHoles) {
        builder.closeHoles();
    }
    return sliced;
};
const distanceAsPosition = (distance) => {
    if (distance < 0) {
        return _constants__WEBPACK_IMPORTED_MODULE_1__.BACK;
    }
    if (distance > 0) {
        return _constants__WEBPACK_IMPORTED_MODULE_1__.FRONT;
    }
    return _constants__WEBPACK_IMPORTED_MODULE_1__.ON;
};
const findDistance = (vertex, plane) => {
    return plane.distanceToPoint(vertex);
};
//# sourceMappingURL=slice.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkngdg"] = self["webpackChunkngdg"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/cjs/entry.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=ngdg-main.js.map