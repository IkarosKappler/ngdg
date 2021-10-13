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
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BumpMapper = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
var computeVertexNormals_1 = __webpack_require__(/*! ./computeVertexNormals */ "./src/cjs/computeVertexNormals.js");
var GeometryGenerationHelpers_1 = __webpack_require__(/*! ./GeometryGenerationHelpers */ "./src/cjs/GeometryGenerationHelpers.js");
exports.BumpMapper = {
    applyBumpmap: function (dildoGeometry, bufferedGeometry, bumpmap, material, options) {
        var collectedVertexNormals = (0, computeVertexNormals_1.computeVertexNormals)(dildoGeometry, bufferedGeometry);
        var dildoNormalGeometry = new THREE.Geometry();
        dildoNormalGeometry.vertices = collectedVertexNormals.map(function (normalLine) {
            var endPoint = normalLine.end.clone();
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.normalizeVectorXYZ(normalLine.start, endPoint, options.bumpmapStrength);
            return endPoint;
        });
        var dildoNormalsMesh = new THREE.Points(dildoNormalGeometry, new THREE.PointsMaterial({
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
            bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry);
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
 * @version  1.2.1
 **/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DildoGeneration = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
var VertexNormalsHelper_1 = __webpack_require__(/*! three/examples/jsm/helpers/VertexNormalsHelper */ "./node_modules/three/examples/jsm/helpers/VertexNormalsHelper.js");
var DildoGeometry_1 = __webpack_require__(/*! ./DildoGeometry */ "./src/cjs/DildoGeometry.js");
var DildoMaterials_1 = __webpack_require__(/*! ./DildoMaterials */ "./src/cjs/DildoMaterials.js");
var GeometryGenerationHelpers_1 = __webpack_require__(/*! ./GeometryGenerationHelpers */ "./src/cjs/GeometryGenerationHelpers.js");
var mergeGeometries_1 = __webpack_require__(/*! ./mergeGeometries */ "./src/cjs/mergeGeometries.js");
var PathFinder_1 = __webpack_require__(/*! ./PathFinder */ "./src/cjs/PathFinder.js");
var randomWebColor_1 = __webpack_require__(/*! ./randomWebColor */ "./src/cjs/randomWebColor.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
var BumpMapper_1 = __webpack_require__(/*! ./BumpMapper */ "./src/cjs/BumpMapper.js");
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
        // const isBumpmappingPossible : boolean = (options.useBumpmap && bumpmapTexture);
        var material = DildoMaterials_1.DildoMaterials.createMainMaterial(useTextureImage, wireframe, textureImagePath, doubleSingleSide);
        // This can be overriden in later steps! (after bumpmap was applied)
        var bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry);
        bufferedGeometry.computeVertexNormals();
        // This can be overriden in later steps! (after bumpmap was applied)
        var dildoMesh = new THREE.Mesh(bufferedGeometry, material);
        this.camera.lookAt(new THREE.Vector3(20, 0, 150));
        this.camera.lookAt(dildoMesh.position);
        var spineGeometry = new THREE.Geometry();
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
            //   dildoGeometry as unknown as THREE.Geometry,
            //   bufferedGeometry
            // );
            // const dildoNormalGeometry = new THREE.Geometry();
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
            //   bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry as unknown as THREE.Geometry);
            //   bufferedGeometry.computeVertexNormals();
            //   // Override the mesh! (bumpmap has been applied)
            //   dildoMesh = new THREE.Mesh(bufferedGeometry, material);
            // }
            var _a = BumpMapper_1.BumpMapper.applyBumpmap(dildoGeometry, bufferedGeometry, bumpmap, material, options), bumpmappedDildoMesh = _a.dildoMesh, dildoNormalsMesh = _a.dildoNormalsMesh;
            dildoMesh = bumpmappedDildoMesh;
            if (options.showBumpmapTargets) {
                dildoNormalsMesh.position.y = -100;
                this.addMesh(dildoNormalsMesh);
            }
        }
        if (options.performSlice) {
            this.__performPlaneSlice(dildoMesh, dildoGeometry, wireframe, useTextureImage, textureImagePath, options);
            // The CSG operations are not reliable.
            // this.__performCsgSlice(latheMesh, geometry, material);
        }
        else {
            dildoMesh.position.y = -100;
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
     * @param {THREE.Geometry} latheMesh - The buffered dildo geometry (required to perform the slice operation).
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
            var geometry = new THREE.Geometry();
            geometry.vertices = connectedPaths[p].map(function (geometryVertexIndex) {
                return leftSliceGeometry.vertices[geometryVertexIndex];
            });
            var linesMesh_1 = new THREE.Line(geometry, new THREE.LineBasicMaterial({
                color: (0, randomWebColor_1.randomWebColor)(i, "Mixed") // 0x8800a8
            }));
            linesMesh_1.position.y = -100;
            // linesMesh.position.z = -50;
            this.addMesh(linesMesh_1);
        }
        if (options.addPrecalculatedShapeOutlines) {
            // TEST what the line mesh looks like
            var pointGeometry = new THREE.Geometry();
            pointGeometry.vertices = planeIntersectionPoints;
            var linesMesh = new THREE.Line(pointGeometry, new THREE.LineBasicMaterial({
                color: 0x8800a8
            }));
            linesMesh.position.y = -100;
            linesMesh.position.z = -50;
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
        if (options.showLeftSplit) {
            leftSliceGeometry.uvsNeedUpdate = true;
            // TODO: check if this is still required
            leftSliceGeometry.buffersNeedUpdate = true;
            leftSliceGeometry.computeVertexNormals();
            var slicedMeshLeft = new THREE.Mesh(leftSliceGeometry, sliceMaterial);
            slicedMeshLeft.position.y = -100;
            slicedMeshLeft.position.z = -50;
            slicedMeshLeft.userData["isExportable"] = true;
            this.addMesh(slicedMeshLeft);
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
            var slicedMeshRight = new THREE.Mesh(rightSliceGeometry, sliceMaterial);
            slicedMeshRight.position.y = -100;
            slicedMeshRight.position.z = 50;
            slicedMeshRight.userData["isExportable"] = true;
            this.addMesh(slicedMeshRight);
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
    //    * @return {THREE.Geometry} trianglesMesh
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
    //     var trianglesGeometry = new THREE.Geometry();
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
     * NOT CURRENTLY IN USE (too unstable?)
     *
     * @param {*} latheMesh
     * @param {*} latheUnbufferedGeometry
     * @param {*} material
     */
    //   __performCsgSlice(latheMesh, latheUnbufferedGeometry, material) {
    //     latheMesh.updateMatrix();
    //     var bbox = new THREE.Box3().setFromObject(latheMesh);
    //     // console.log(bbox);
    //     var box_material = new THREE.MeshBasicMaterial({ wireframe: true });
    //     var cube_geometry = new THREE.BoxGeometry( // new THREE.CubeGeometry(
    //       ((bbox.max.x - bbox.min.x) / 2) * 1.2 + 0.01,
    //       (bbox.max.y - bbox.min.y) * 1.1,
    //       (bbox.max.z - bbox.min.z) * 1.2
    //     );
    //     var cube_mesh = new THREE.Mesh(cube_geometry, box_material);
    //     cube_mesh.updateMatrix();
    //     cube_mesh.position.x = latheMesh.position.x + (bbox.max.x - bbox.min.x) / 4;
    //     cube_mesh.position.y = bbox.min.y + (bbox.max.y - bbox.min.y) / 2 + -30;
    //     cube_mesh.position.z = bbox.min.z + (bbox.max.z - bbox.min.z) / 2;
    //     this.addMesh(cube_mesh);
    //     var cube_bsp = new ThreeBSP(cube_mesh);
    //     var mesh_bsp = new ThreeBSP(new THREE.Mesh(latheUnbufferedGeometry, material));
    //     var subtract_bsp = cube_bsp.subtract(mesh_bsp);
    //     var result = subtract_bsp.toMesh(material);
    //     this.addMesh(result);
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
 * @version  1.0.2
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
exports.DildoGeometry = exports.DildoBaseClass = void 0;
// TODOs
// + Add cut-plane faces when hollow
// + Move vertex-creating helper functions out of the class
// + Move face-creating helper functions out of the class
// + Move UV-creating helper functions out of the class
// + port to typescript
var plotboilerplate_1 = __webpack_require__(/*! plotboilerplate */ "../plotboilerplate/src/esm/index.js");
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
var GeometryGenerationHelpers_1 = __webpack_require__(/*! ./GeometryGenerationHelpers */ "./src/cjs/GeometryGenerationHelpers.js");
// import { earcut } from "./thirdparty-ported/earcut"; // TODO: fix earcut types
var earcut_typescript_1 = __webpack_require__(/*! earcut-typescript */ "./node_modules/earcut-typescript/src/cjs/earcut.js"); // TODO: fix earcut types
var UVHelpers_1 = __webpack_require__(/*! ./UVHelpers */ "./src/cjs/UVHelpers.js");
var DEG_TO_RAD = Math.PI / 180.0;
// import { DEG_TO_RAD } from "./constants";
// This is a dirty workaround to
// avoid direct class extending of THREE.Geometry.
// I am using `THREE.Geometry.call(this);` instead :/
var DildoBaseClass = /** @class */ (function () {
    function DildoBaseClass() {
        this.vertices = [];
        this.faces = [];
        this.faceVertexUvs = [[]];
    }
    return DildoBaseClass;
}());
exports.DildoBaseClass = DildoBaseClass;
// export class DildoGeometry { // extends globalThis.THREE.Geometry {
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
        THREE.Geometry.call(_this);
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
            this.faces.push(new THREE.Face3(triangleIndices[0], triangleIndices[1], triangleIndices[2])); // Same?
            this.hollowBottomTriagles.push(triangleIndices);
            if (lastIndex !== curIndex) {
                // Add normal triangle to same shell index
                triangleIndices = [curIndex, lastIndex, this.vertexMatrix[0][i]];
                this.faces.push(new THREE.Face3(triangleIndices[0], triangleIndices[1], triangleIndices[2]));
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
}(DildoBaseClass)); // END class
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
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
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
 * @version  0.0.1-alpha
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeometryGenerationHelpers = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
// import { earcut } from "./thirdparty-ported/earcut"; // TODO: fix earcut types, convert to custum library
var earcut_typescript_1 = __webpack_require__(/*! earcut-typescript */ "./node_modules/earcut-typescript/src/cjs/earcut.js");
var plotboilerplate_1 = __webpack_require__(/*! plotboilerplate */ "../plotboilerplate/src/esm/index.js");
// import { sliceGeometry } from "./thirdparty-ported/threejs-slice-geometry"; // TODO: convert to custom library
var threejs_slice_geometry_typescript_1 = __webpack_require__(/*! threejs-slice-geometry-typescript */ "./node_modules/threejs-slice-geometry-typescript/src/cjs/slice.js"); // TODO: convert to custom library
var PlaneMeshIntersection_1 = __webpack_require__(/*! ./PlaneMeshIntersection */ "./src/cjs/PlaneMeshIntersection.js");
var clearDuplicateVertices3_1 = __webpack_require__(/*! ./clearDuplicateVertices3 */ "./src/cjs/clearDuplicateVertices3.js");
var UVHelpers_1 = __webpack_require__(/*! ./UVHelpers */ "./src/cjs/UVHelpers.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
exports.GeometryGenerationHelpers = {
    /**
     * Create a (right-turning) triangle of the three vertices at index A, B and C.
     *
     * The default direction (right) can be changed to left to pass `invsereFaceDirection=true`.
     *
     * @param {THREE.Geometry} geometry - The geometry to add the face to.
     * @param {number} vertIndexA
     * @param {number} vertIndexB
     * @param {number} vertIndexC
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace3: function (geometry, vertIndexA, vertIndexB, vertIndexC, inverseFaceDirection) {
        if (inverseFaceDirection) {
            geometry.faces.push(new THREE.Face3(vertIndexC, vertIndexB, vertIndexA));
        }
        else {
            geometry.faces.push(new THREE.Face3(vertIndexA, vertIndexB, vertIndexC));
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
     * @param {THREE.Geometry} geometry - The geometry to add the face to.
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
     * @param {THREE.Geometry} geometry - The geometry to add the face to.
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
     * @param {THREE.Geometry} geometry - The geometry to add the new faces to.
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
     * @param {THREE.Geometry} unbufferedGeometry - The geometry to slice.
     * @param {THREE.Plane} plane PlaneGeometry???
     * @return {THREE.Geometry}
     */
    makeSlice: function (unbufferedGeometry, plane) {
        // Slice mesh into two
        // See https://github.com/tdhooper/threejs-slice-geometry
        var closeHoles = false; // This might be configurable in a later version.
        // TODO: cc
        // var sliceMaterial = DildoMaterials.createSliceMaterial(wireframe);
        // var slicedGeometry = sliceGeometry(unbufferedGeometry, plane, closeHoles);
        var slicedGeometry = (0, threejs_slice_geometry_typescript_1.sliceGeometry)(unbufferedGeometry, plane, closeHoles);
        // Now note that it's possible that the result might contain multiple vertices
        // at the same position, which makes further calculations quite difficult.
        // -> Merge multiple vertices into one
        slicedGeometry.mergeVertices();
        // And don't forget to compute the normals.
        slicedGeometry.computeFaceNormals();
        // var slicedMesh = new THREE.Mesh(slicedGeometry, sliceMaterial);
        // var slicedMesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(slicedGeometry), sliceMaterial);
        //   slicedMesh.position.y = -100;
        //   slicedMesh.position.z = zOffset;
        //   slicedMesh.userData["isExportable"] = true;
        //   thisGenerator.addMesh(slicedMesh);
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
    makeAndAddPlaneIntersection: function (thisGenerator, mesh, unbufferedGeometry, // THREE.Geometry,
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
        var pointGeometry = new THREE.Geometry();
        pointGeometry.vertices = uniqueIntersectionPoints;
        var pointsMaterial = new THREE.PointsMaterial({
            size: 1.4,
            color: 0x00ffff
        });
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
        var triangleGeometry = new THREE.Geometry();
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
            var triangleMesh = new THREE.Mesh(triangleGeometry, new THREE.LineBasicMaterial({
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
        var pointGeometry = new THREE.Geometry();
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
        var pointsMesh = new THREE.Mesh(pointGeometry, pointsMaterial);
        pointsMesh.position.y = -100;
        pointsMesh.position.z = 50;
        pointsMesh.userData["isExportable"] = false;
        thisGenerator.addMesh(pointsMesh);
    },
    // CURRENTLY NOT REALLY IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
    makeAndAddHollowPlaneIntersection: function (thisGenerator, unbufferedGeometry) {
        var pointGeometry = new THREE.Geometry();
        var perpLines = unbufferedGeometry.getPerpendicularHullLines();
        for (var i = 0; i < perpLines.length; i++) {
            var innerPoint = perpLines[i].start;
            var outerPoint = perpLines[i].end;
            pointGeometry.vertices.push(innerPoint, outerPoint);
            var vertIndex = pointGeometry.vertices.length;
            if (i > 0) {
                pointGeometry.faces.push(new THREE.Face3(vertIndex - 4, vertIndex - 2, vertIndex - 3));
                pointGeometry.faces.push(new THREE.Face3(vertIndex - 3, vertIndex - 2, vertIndex - 1));
            }
        }
        var pointsMaterial = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xff0000,
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });
        var pointsMesh = new THREE.Mesh(pointGeometry, pointsMaterial);
        pointsMesh.position.y = -100;
        pointsMesh.position.z = -50;
        pointsMesh.userData["isExportable"] = false;
        thisGenerator.addMesh(pointsMesh);
    },
    /**
     * Add an orange colored line mesh from a spine geometry..
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new mesh to.
     * @param {THREE.Geometry} spineGeometry - The spine geometry itself.
     */
    addSpine: function (thisGenerator, spineGeometry) {
        var spineMesh = new THREE.LineSegments(spineGeometry, new THREE.LineBasicMaterial({
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
        var outerPerpGeometry = new THREE.Geometry();
        perpLines.forEach(function (perpLine) {
            outerPerpGeometry.vertices.push(perpLine.start.clone());
            outerPerpGeometry.vertices.push(perpLine.end.clone());
        });
        var outerPerpMesh = new THREE.LineSegments(outerPerpGeometry, new THREE.LineBasicMaterial({
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
     * @return {THREE.Geometry} trianglesMesh
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
        var trianglesGeometry = new THREE.Geometry();
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
            trianglesGeometry.faces.push(new THREE.Face3(a, b, c));
            // Add UVs
            UVHelpers_1.UVHelpers.makeFlatTriangleUVs(trianglesGeometry, flatSideBounds, a, b, c);
        }
        trianglesGeometry.uvsNeedUpdate = true;
        // TODO: check if this is still required
        trianglesGeometry.buffersNeedUpdate = true;
        trianglesGeometry.computeVertexNormals();
        var trianglesMesh = new THREE.Mesh(trianglesGeometry, new THREE.MeshBasicMaterial({
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
 * @date     2021-07-06
 * @version  1.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PathFinder = void 0;
// var EPS = 0.000001;
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
     * @param {THREE.Geometry} unbufferedGeometry - The geometry itself containing the path vertices.
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
     * @param {THREE.Geometry} unbufferedGeometry - The geometry to use to find connected vertices (use it's faces).
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
     * @param {THREE.Geometry} unbufferedGeometry
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
     * @param {THREE.Geometry} unbufferedGeometry
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
 * @param {THREE.Geometry} unbufferedGeometry
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
 * @param {THREE.Geometry} unbufferedGeometry - The Three.js geometry to use.
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
 * @param {THREE.Geometry} unbufferedGeometry - The geometry to find the path on.
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
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlaneMeshIntersection = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
var PlaneMeshIntersection = /** @class */ (function () {
    /**
     * Constructor.
     */
    function PlaneMeshIntersection() {
        var _this = this;
        /**
         *
         * @param {THREE.Mesh} mesh
         * @param {THREE.Geometry} geometry
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
            plane.localToWorld(_this.planePointA.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].a]));
            plane.localToWorld(_this.planePointB.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].b]));
            plane.localToWorld(_this.planePointC.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].c]));
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
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UVHelpers = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
exports.UVHelpers = {
    /**
     * Helper function to create triangular UV Mappings for a triangle.
     *
     * @param {THREE.Geometry} thisGeometry
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
 * @author  Ikaros Kappler
 * @date    2021-08-31
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeVertexNormals = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/**
 * Compute the vertex normals of a base geometry and its buffered counterpart (both parts are required here).
 *
 * Note that unbufferedGeometry.computeVertexNormals() must have been called for this to work.
 *
 * @param {THREE.Geometry} unbufferedGeometry - The base geometry.
 * @param {THREE.BufferedGeometry} bufferedGeometry - The buffered geometry.
 * @returns
 */
var computeVertexNormals = function (unbufferedGeometry, bufferedGeometry) {
    // Fetch the face normals from the buffers.
    var vertexNormals = bufferedGeometry.getAttribute("normal");
    //   console.log("normals", vertexNormals);
    //   console.log(
    //     "unbufferedGeometry.vertices.length",
    //     unbufferedGeometry.vertices.length,
    //     "unbufferedGeometry.faces.length",
    //     unbufferedGeometry.faces.length,
    //     "vertexNormals.array.length/3",
    //     vertexNormals.array.length / 3
    //   );
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
exports.KEY_SPLIT_TRIANGULATION_GEOMETRIES = exports.KEY_PLANE_INTERSECTION_TRIANGULATION = exports.KEY_PLANE_INTERSECTION_POINTS = exports.KEY_SPLIT_PANE_MESH = exports.KEY_RIGHT_SLICE_PLANE = exports.KEY_LEFT_SLICE_PLANE = exports.KEY_RIGHT_SLICE_GEOMETRY = exports.KEY_LEFT_SLICE_GEOMETRY = exports.DEG_TO_RAD = exports.EPS = void 0;
exports.EPS = 0.000001;
exports.DEG_TO_RAD = Math.PI / 180.0;
exports.KEY_LEFT_SLICE_GEOMETRY = "KEY_LEFT_SLICE_GEOMETRY"; // THREE.Geometry
exports.KEY_RIGHT_SLICE_GEOMETRY = "KEY_RIGHT_SLICE_GEOMETRY"; // THREE.Geometry
exports.KEY_LEFT_SLICE_PLANE = "KEY_LEFT_SLICE_PLANE"; // THREE.Plane
exports.KEY_RIGHT_SLICE_PLANE = "KEY_RIGHT_SLICE_PLANE"; // THREE.Plane
exports.KEY_SPLIT_PANE_MESH = "KEY_SPLIT_PANE_MESH"; // THREE.Mesh
exports.KEY_PLANE_INTERSECTION_POINTS = "KEY_PLANE_INTERSECTION_POINTS"; // Array<Vector3>
exports.KEY_PLANE_INTERSECTION_TRIANGULATION = "KEY_PLANE_INTERSECTION_TRIANGULATION"; // THREE.Geometry
exports.KEY_SPLIT_TRIANGULATION_GEOMETRIES = "KEY_SPLIT_TRIANGULATION_GEOMETRIES"; // Array<THREE.Geometry>
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
exports.DEFAULT_BEZIER_JSON = 
//'[ { "startPoint" : [-122,77.80736634304651], "endPoint" : [-65.59022229786551,21.46778533702511], "startControlPoint": [-121.62058129515852,25.08908859418696], "endControlPoint" : [-79.33419353770395,48.71529293460728] }, { "startPoint" : [-65.59022229786551,21.46778533702511], "endPoint" : [-65.66917273472913,-149.23537680826058], "startControlPoint": [-52.448492057756646,-4.585775770903305], "endControlPoint" : [-86.1618869001374,-62.11613821618976] }, { "startPoint" : [-65.66917273472913,-149.23537680826058], "endPoint" : [-61.86203591980055,-243.8368165606738], "startControlPoint": [-53.701578771473564,-200.1123697454778], "endControlPoint" : [-69.80704300441666,-205.36451303641783] }, { "startPoint" : [-61.86203591980055,-243.8368165606738], "endPoint" : [-21.108966092052256,-323], "startControlPoint": [-54.08681426887413,-281.486963896856], "endControlPoint" : [-53.05779349623559,-323] } ]';
"\n  [\n    {\n       \"startPoint\":[\n          -122,\n          77.80736634304651\n       ],\n       \"endPoint\":[\n          -65.59022229786551,\n          21.46778533702511\n       ],\n       \"startControlPoint\":[\n          -121.62058129515852,\n          25.08908859418696\n       ],\n       \"endControlPoint\":[\n          -79.33419353770395,\n          48.71529293460728\n       ]\n    },\n    {\n       \"startPoint\":[\n          -65.59022229786551,\n          21.46778533702511\n       ],\n       \"endPoint\":[\n          -65.66917273472913,\n          -149.23537680826058\n       ],\n       \"startControlPoint\":[\n          -52.448492057756646,\n          -4.585775770903305\n       ],\n       \"endControlPoint\":[\n          -86.1618869001374,\n          -62.11613821618976\n       ]\n    },\n    {\n       \"startPoint\":[\n          -65.66917273472913,\n          -149.23537680826058\n       ],\n       \"endPoint\":[\n          -61.86203591980055,\n          -243.8368165606738\n       ],\n       \"startControlPoint\":[\n          -53.701578771473564,\n          -200.1123697454778\n       ],\n       \"endControlPoint\":[\n          -69.80704300441666,\n          -205.36451303641783\n       ]\n    },\n    {\n       \"startPoint\":[\n          -61.86203591980055,\n          -243.8368165606738\n       ],\n       \"endPoint\":[\n          -21.108966092052256,\n          -323\n       ],\n       \"startControlPoint\":[\n          -54.08681426887413,\n          -281.486963896856\n       ],\n       \"endControlPoint\":[\n          -53.05779349623559,\n          -323\n       ]\n    }\n ]\n  ";
//# sourceMappingURL=defaults.js.map

/***/ }),

/***/ "./src/cjs/entry.js":
/*!**************************!*\
  !*** ./src/cjs/entry.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {



// Export the library to the global scope:
globalThis.ngdg = __webpack_require__(/*! ./ngdg */ "./src/cjs/ngdg.js").ngdg;


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
 * @version  1.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mergeAndMapVertices = exports.mergeGeometries = void 0;
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
// import { Geometry, Face3 } from "three/examples/jsm/deprecated/Geometry";
var locateVertexInArray_1 = __webpack_require__(/*! ./locateVertexInArray */ "./src/cjs/locateVertexInArray.js");
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
 * @param {THREE.Geometry} baseGeometry
 * @param {THREE.Geometry} mergeGeometry
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
        baseGeometry.faces.push(new THREE.Face3(a, b, c));
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
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-09-27
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ngdg = void 0;
var defaults_1 = __webpack_require__(/*! ./defaults */ "./src/cjs/defaults.js");
var ImageStore_1 = __webpack_require__(/*! ./ImageStore */ "./src/cjs/ImageStore.js");
var DildoGeneration_1 = __webpack_require__(/*! ./DildoGeneration */ "./src/cjs/DildoGeneration.js");
exports.ngdg = {
    DEFAULT_BEZIER_JSON: defaults_1.DEFAULT_BEZIER_JSON,
    DildoGeneration: DildoGeneration_1.DildoGeneration,
    ImageStore: ImageStore_1.ImageStore
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
var WebColorsMalachite_1 = __webpack_require__(/*! plotboilerplate/src/esm/utils/WebColorsMalachite */ "../plotboilerplate/src/esm/utils/WebColorsMalachite.js");
var WebColorsContrast_1 = __webpack_require__(/*! plotboilerplate/src/esm/utils/WebColorsContrast */ "../plotboilerplate/src/esm/utils/WebColorsContrast.js");
var WebColors_1 = __webpack_require__(/*! plotboilerplate/src/esm/utils/WebColors */ "../plotboilerplate/src/esm/utils/WebColors.js");
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

/***/ "../plotboilerplate/src/esm/BezierPath.js":
/*!************************************************!*\
  !*** ../plotboilerplate/src/esm/BezierPath.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BezierPath": () => (/* binding */ BezierPath)
/* harmony export */ });
/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Bounds */ "../plotboilerplate/src/esm/Bounds.js");
/* harmony import */ var _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CubicBezierCurve */ "../plotboilerplate/src/esm/CubicBezierCurve.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * @author Ikaros Kappler
 * @date 2013-08-19
 * @modified 2018-08-16 Added closure. Removed the 'IKRS' wrapper.
 * @modified 2018-11-20 Added circular auto-adjustment.
 * @modified 2018-11-25 Added the point constants to the BezierPath class itself.
 * @modified 2018-11-28 Added the locateCurveByStartPoint() function.
 * @modified 2018-12-04 Added the toSVGString() function.
 * @modified 2019-03-23 Added JSDoc tags.
 * @modified 2019-03-23 Changed the fuctions getPoint and getPointAt to match semantics in the Line class.
 * @modified 2019-11-18 Fixed the clone function: adjustCircular attribute was not cloned.
 * @modified 2019-12-02 Removed some excessive comments.
 * @modified 2019-12-04 Fixed the missing obtainHandleLengths behavior in the adjustNeightbourControlPoint function.
 * @modified 2020-02-06 Added function locateCurveByEndPoint( Vertex ).
 * @modified 2020-02-11 Added 'return this' to the scale(Vertex,number) and to the translate(Vertex) function.
 * @modified 2020-03-24 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-06-03 Made the private helper function _locateUIndex to a private function.
 * @modified 2020-06-03 Added the getBounds() function.
 * @modified 2020-07-14 Changed the moveCurvePoint(...,Vertex) to moveCurvePoint(...,XYCoords).
 * @modified 2020-07-24 Added the getClosestT(Vertex) function.
 * @modified 2020-12-29 Constructor is now private (no explicit use intended).
 * @modified 2021-05-25 Added BezierPath.fromReducedList( Array<number> ).
 * @version 2.3.1
 *
 * @file BezierPath
 * @public
 **/




/**
 * @classdesc A BezierPath class.
 *
 * This was refactored from an older project.
 *
 * @requires Bounds
 * @requires Vertex
 * @requires CubicBezierCurve
 * @requires XYCoords
 * @requires SVGSerializable
 * @requires UID
 * @requires UIDGenerator
 **/
class BezierPath {
    /**
     * The constructor.<br>
     * <br>
     * This constructor expects a sequence of path points and will approximate
     * the location of control points by picking some between the points.<br>
     * You should consider just constructing empty paths and then add more curves later using
     * the addCurve() function.
     *
     * @constructor
     * @name BezierPath
     * @param {Vertex[]} pathPoints - An array of path vertices (no control points).
     **/
    constructor(pathPoints) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "BezierPath";
        /** @constant {number} */
        this.START_POINT = 0;
        /** @constant {number} */
        this.START_CONTROL_POINT = 1;
        /** @constant {number} */
        this.END_CONTROL_POINT = 2;
        /** @constant {number} */
        this.END_POINT = 3;
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_2__.UIDGenerator.next();
        if (!pathPoints)
            pathPoints = [];
        this.totalArcLength = 0.0;
        // Set this flag to true if you want the first point and
        // last point of the path to be auto adjusted, too.
        this.adjustCircular = false;
        this.bezierCurves = [];
    }
    /**
     * Add a cubic bezier curve to the end of this path.
     *
     * @method addCurve
     * @param {CubicBezierCurve} curve - The curve to be added to the end of the path.
     * @instance
     * @memberof BezierPath
     * @return {void}
     **/
    addCurve(curve) {
        if (curve == null || typeof curve == "undefined")
            throw "Cannot add null curve to bézier path.";
        this.bezierCurves.push(curve);
        if (this.bezierCurves.length > 1) {
            curve.startPoint = this.bezierCurves[this.bezierCurves.length - 2].endPoint;
            this.adjustSuccessorControlPoint(this.bezierCurves.length - 2, // curveIndex,
            true, // obtainHandleLength,
            true // updateArcLengths
            );
        }
        else {
            this.totalArcLength += curve.getLength();
        }
    }
    /**
     * Locate the curve with the given start point (function returns the index).
     *
     * @method locateCurveByStartPoint
     * @param {Vertex} point - The (curve start-) point to look for.
     * @instance
     * @memberof BezierPath
     * @return {number} The curve index or -1 if curve (start-) point not found
     **/
    locateCurveByStartPoint(point) {
        // for( var i in this.bezierCurves ) {
        for (var i = 0; i < this.bezierCurves.length; i++) {
            if (this.bezierCurves[i].startPoint.equals(point))
                return i;
        }
        return -1;
    }
    /**
     * Locate the curve with the given end point (function returns the index).
     *
     * @method locateCurveByEndPoint
     * @param {Vertex} point - The (curve end-) point to look for.
     * @instance
     * @memberof BezierPath
     * @return {number} The curve index or -1 if curve (end-) point not found
     **/
    locateCurveByEndPoint(point) {
        // for( var i in this.bezierCurves ) {
        for (var i = 0; i < this.bezierCurves.length; i++) {
            if (this.bezierCurves[i].endPoint.equals(point))
                return i;
        }
        return -1;
    }
    /**
     * Locate the curve with the given start point (function returns the index).
     *
     * @method locateCurveByStartControlPoint
     * @param {Vertex} point - The (curve endt-) point to look for.
     * @instance
     * @memberof BezierPath
     * @return {number} The curve index or -1 if curve (end-) point not found
     **/
    locateCurveByStartControlPoint(point) {
        // for( var i in this.bezierCurves ) {
        for (var i = 0; i < this.bezierCurves.length; i++) {
            if (this.bezierCurves[i].startControlPoint.equals(point))
                return i;
        }
        return -1;
    }
    // +---------------------------------------------------------------------------------
    // | Locate the curve with the given end control point.
    // |
    // | @param point:Vertex The point to look for.
    // | @return Number The index or -1 if not found.
    // +-------------------------------
    locateCurveByEndControlPoint(point) {
        // for( var i in this.bezierCurves ) {
        for (var i = 0; i < this.bezierCurves.length; i++) {
            if (this.bezierCurves[i].endControlPoint.equals(point))
                return i;
        }
        return -1;
    }
    /**
     * Get the total length of this path.<br>
     * <br>
     * Note that the returned value comes from the curve buffer. Unregistered changes
     * to the curve points will result in invalid path length values.
     *
     * @method getLength
     * @instance
     * @memberof BezierPath
     * @return {number} The (buffered) length of the path.
     **/
    getLength() {
        return this.totalArcLength;
    }
    /**
     * This function is internally called whenever the curve or path configuration
     * changed. It updates the attribute that stores the path length information.<br>
     * <br>
     * If you perform any unregistered changes to the curve points you should call
     * this function afterwards to update the curve buffer. Not updating may
     * result in unexpected behavior.
     *
     * @method updateArcLengths
     * @instance
     * @memberof BezierPath
     * @return {void}
     **/
    updateArcLengths() {
        this.totalArcLength = 0.0;
        for (var i = 0; i < this.bezierCurves.length; i++) {
            this.bezierCurves[i].updateArcLengths();
            this.totalArcLength += this.bezierCurves[i].getLength();
        }
    }
    /**
     * Get the number of curves in this path.
     *
     * @method getCurveCount
     * @instance
     * @memberof BezierPath
     * @return {number} The number of curves in this path.
     **/
    getCurveCount() {
        return this.bezierCurves.length;
    }
    /**
     * Get the cubic bezier curve at the given index.
     *
     * @method getCurveAt
     * @param {number} index - The curve index from 0 to getCurveCount()-1.
     * @instance
     * @memberof BezierPath
     * @return {CubicBezierCurve} The curve at the specified index.
     **/
    getCurveAt(curveIndex) {
        return this.bezierCurves[curveIndex];
    }
    /**
     * Remove the end point of this path (which removes the last curve from this path).<br>
     * <br>
     * Please note that this function does never remove the first curve, thus the path
     * cannot be empty after this call.
     *
     * @method removeEndPoint
     * @instance
     * @memberof BezierPath
     * @return {boolean} Indicating if the last curve was removed.
     **/
    /*
      BezierPath.prototype.removeEndPoint = function() {
      if( this.bezierCurves.length <= 1 )
          return false;
      
      var newArray = [ this.bezierCurves.length-1 ];
      for( var i = 0; i < this.bezierCurves.length-1; i++ ) {
          newArray[i] = this.bezierCurves[i];
      }
      
      // Update arc length
      this.totalArcLength -= this.bezierCurves[ this.bezierCurves.length-1 ].getLength();
      this.bezierCurves = newArray;
      return true;
      }
      */
    /**
     * Remove the start point of this path (which removes the first curve from this path).<br>
     * <br>
     * Please note that this function does never remove the last curve, thus the path
     * cannot be empty after this call.<br>
     *
     * @method removeStartPoint
     * @instance
     * @memberof BezierPath
     * @return {boolean} Indicating if the first curve was removed.
     **/
    /*
      BezierPath.prototype.removeStartPoint = function() {
  
      if( this.bezierCurves.length <= 1 )
          return false;
  
      var newArray = [ this.bezierCurves.length-1 ];
      for( var i = 1; i < this.bezierCurves.length; i++ ) {
  
          newArray[i-1] = this.bezierCurves[i];
  
      }
      
      // Update arc length
      this.totalArcLength -= this.bezierCurves[ 0 ].getLength();
      this.bezierCurves = newArray;
      
      return true;
      }
      */
    /**
     * Removes a path point inside the path.
     *
     * This function joins the bezier curve at the given index with
     * its predecessor, which means that the start point at the given
     * curve index will be removed.
     *
     * @method joinAt
     * @param {number} curveIndex - The index of the curve to be joined with its predecessor.
     * @instance
     * @memberof BezierPath
     * @return {boolean} True if the passed index indicated an inner vertex and the two curves were joined.
     **/
    /*
      BezierPath.prototype.joinAt = function( curveIndex ) {
  
      if( curveIndex < 0 || curveIndex >= this.bezierCurves.length )
          return false;
      
      var leftCurve  = this.bezierCurves[ curveIndex-1 ];
      var rightCurve = this.bezierCurves[ curveIndex ];
  
      // Make the length of the new handle double that long
      var leftControlPoint = leftCurve.getStartControlPoint().clone();
      leftControlPoint.sub( leftCurve.getStartPoint() );
      leftControlPoint.multiplyScalar( 2.0 );
      leftControlPoint.add( leftCurve.getStartPoint() );
      
      var rightControlPoint = rightCurve.getEndControlPoint().clone();
      rightControlPoint.sub( rightCurve.getEndPoint() );
      rightControlPoint.multiplyScalar( 2.0 );
      rightControlPoint.add( rightCurve.getEndPoint() );
  
      var newCurve = new IKRS.CubicBezierCurve( leftCurve.getStartPoint(),
                            rightCurve.getEndPoint(),
                            leftControlPoint,
                            rightControlPoint
                          );
      // Place into array
      var newArray = [ this.bezierCurves.length - 1 ];
  
      for( var i = 0; i < curveIndex-1; i++ )
          newArray[ i ] = this.bezierCurves[i];
      
      newArray[ curveIndex-1 ] = newCurve;
      
      // Shift trailing curves left
      for( var i = curveIndex; i+1 < this.bezierCurves.length; i++ )
          newArray[ i ] = this.bezierCurves[ i+1 ];
          
      this.bezierCurves = newArray;
      this.updateArcLengths();
  
      return true;
      }
      */
    /**
     * Add a new inner curve point to the path.<br>
     * <br>
     * This function splits the bezier curve at the given index and given
     * curve segment index.
     *
     * @method splitAt
     * @param {number} curveIndex - The index of the curve to split.
     * @param {nunber} segmentIndex - The index of the curve segment where the split should be performed.
     * @instance
     * @memberof BezierPath
     * @return {boolean} True if the passed indices were valid and the path was split.
     **/
    /*
      BezierPath.prototype.splitAt = function( curveIndex,
                           segmentIndex
                         ) {
      // Must be a valid curve index
      if( curveIndex < 0 || curveIndex >= this.bezierCurves.length )
          return false;
  
      var oldCurve = this.bezierCurves[ curveIndex ];
  
      // Segment must be an INNER point!
      // (the outer points are already bezier end/start points!)
      if( segmentIndex < 1 || segmentIndex-1 >= oldCurve.segmentCache.length )
          return false;
  
      // Make room for a new curve
      for( var c = this.bezierCurves.length; c > curveIndex; c-- ) {
          // Move one position to the right
          this.bezierCurves[ c ] = this.bezierCurves[ c-1 ];
      }
  
      // Accumulate segment lengths
      var u = 0;
      for( var i = 0; i < segmentIndex; i++ )
          u += oldCurve.segmentLengths[i];
      //var tangent = oldCurve.getTangentAt( u );
      var tangent = oldCurve.getTangent( u );
      tangent = tangent.multiplyScalar( 0.25 );
  
      var leftEndControlPoint = oldCurve.segmentCache[ segmentIndex ].clone();
      leftEndControlPoint.sub( tangent );
      
      var rightStartControlPoint = oldCurve.segmentCache[ segmentIndex ].clone();
      rightStartControlPoint.add( tangent );
      
      // Make the old existing handles a quarter that long
      var leftStartControlPoint = oldCurve.getStartControlPoint().clone();
      // move to (0,0)
      leftStartControlPoint.sub( oldCurve.getStartPoint() );
      leftStartControlPoint.multiplyScalar( 0.25 );
      leftStartControlPoint.add( oldCurve.getStartPoint() );
  
      var rightEndControlPoint = oldCurve.getEndControlPoint().clone();
      // move to (0,0)
      rightEndControlPoint.sub( oldCurve.getEndPoint() );
      rightEndControlPoint.multiplyScalar( 0.25 );
      rightEndControlPoint.add( oldCurve.getEndPoint() );
  
      var newLeft  = new CubicBezierCurve( oldCurve.getStartPoint(),                      // old start point
                           oldCurve.segmentCache[ segmentIndex ],         // new end point
                           leftStartControlPoint,                         // old start control point
                           leftEndControlPoint                            // new end control point
                         );
      var newRight = new CubicBezierCurve( oldCurve.segmentCache[ segmentIndex ],         // new start point
                           oldCurve.getEndPoint(),                        // old end point
                           rightStartControlPoint,                        // new start control point
                           rightEndControlPoint                           // old end control point
                         );
      
      // Insert split curve(s) at free index
      this.bezierCurves[ curveIndex ]     = newLeft;
      this.bezierCurves[ curveIndex + 1 ] = newRight;
      
      // Update total arc length, even if there is only a very little change!
      this.totalArcLength -= oldCurve.getLength();
      this.totalArcLength += newLeft.getLength();
      this.totalArcLength += newRight.getLength();
  
      return true;
      };
      */
    /*
      insertVertexAt( t:number ) : void {
      console.log('Inserting vertex at', t );
      // Find the curve index
      var u : number = 0;
      var curveIndex : number = -1;
      var localT : number = 0.0;
      for( var i = 0; curveIndex == -1 && i < this.bezierCurves.length; i++ ) {
          
      }
      }; */
    /**
     * Move the whole bezier path by the given (x,y)-amount.
     *
     * @method translate
     * @param {Vertex} amount - The amount to be added (amount.x and amount.y)
     *                          to each vertex of the curve.
     * @instance
     * @memberof BezierPath
     * @return {BezierPath} this for chaining
     **/
    translate(amount) {
        for (var i = 0; i < this.bezierCurves.length; i++) {
            var curve = this.bezierCurves[i];
            curve.getStartPoint().add(amount);
            curve.getStartControlPoint().add(amount);
            curve.getEndControlPoint().add(amount);
        }
        // Don't forget to translate the last curve's last point
        var curve = this.bezierCurves[this.bezierCurves.length - 1];
        curve.getEndPoint().add(amount);
        this.updateArcLengths();
        return this;
    }
    /**
     * Scale the whole bezier path by the given (x,y)-factors.
     *
     * @method scale
     * @param {Vertex} anchor - The scale origin to scale from.
     * @param {number} amount - The scalar to be multiplied with.
     * @instance
     * @memberof BezierPath
     * @return {BezierPath} this for chaining.
     **/
    scale(anchor, scaling) {
        for (var i = 0; i < this.bezierCurves.length; i++) {
            var curve = this.bezierCurves[i];
            curve.getStartPoint().scale(scaling, anchor);
            curve.getStartControlPoint().scale(scaling, anchor);
            curve.getEndControlPoint().scale(scaling, anchor);
            // Do NOT scale the end point here!
            // Don't forget that the curves are connected and on curve's end point
            // the the successor's start point (same instance)!
        }
        // Finally move the last end point (was not scaled yet)
        if (this.bezierCurves.length > 0 && !this.adjustCircular) {
            this.bezierCurves[this.bezierCurves.length - 1].getEndPoint().scale(scaling, anchor);
        }
        this.updateArcLengths();
        return this;
    }
    /**
     * Rotate the whole bezier path around a point..
     *
     * @method rotate
     * @param {Vertex} angle  - The angle to rotate this path by.
     * @param {Vertex} center - The rotation center.
     * @instance
     * @memberof BezierPath
     * @return {void}
     **/
    rotate(angle, center) {
        for (var i = 0; i < this.bezierCurves.length; i++) {
            var curve = this.bezierCurves[i];
            curve.getStartPoint().rotate(angle, center);
            curve.getStartControlPoint().rotate(angle, center);
            curve.getEndControlPoint().rotate(angle, center);
            // Do NOT rotate the end point here!
            // Don't forget that the curves are connected and on curve's end point
            // the the successor's start point (same instance)!
        }
        // Finally move the last end point (was not scaled yet)
        if (this.bezierCurves.length > 0 && !this.adjustCircular) {
            this.bezierCurves[this.bezierCurves.length - 1].getEndPoint().rotate(angle, center);
        }
    }
    /**
     * Get the 't' position on this curve with the minimal distance to point p.
     *
     * @param {Vertex} p - The point to find the closest curve point for.
     * @return {number} A value t with 0.0 <= t <= 1.0.
     **/
    getClosestT(p) {
        // Find the spline to extract the value from
        var minIndex = -1;
        var minDist = 0.0;
        var dist = 0.0;
        var curveT = 0.0;
        var uMin = 0.0;
        var u = 0.0;
        for (var i = 0; i < this.bezierCurves.length; i++) {
            curveT = this.bezierCurves[i].getClosestT(p);
            dist = this.bezierCurves[i].getPointAt(curveT).distance(p);
            if (minIndex == -1 || dist < minDist) {
                minIndex = i;
                minDist = dist;
                uMin = u + curveT * this.bezierCurves[i].getLength();
            }
            u += this.bezierCurves[i].getLength();
        }
        return Math.max(0.0, Math.min(1.0, uMin / this.totalArcLength));
    }
    /**
     * Get the point on the bézier path at the given relative path location.
     *
     * @method getPoint
     * @param {number} u - The relative path position: <pre>0 <= u <= this.getLength()</pre>
     * @instance
     * @memberof BezierPath
     * @return {Vertex} The point at the relative path position.
     **/
    getPoint(u) {
        if (u < 0 || u > this.totalArcLength) {
            console.warn("[BezierPath.getPoint(u)] u is out of bounds: " + u + ".");
            u = Math.min(this.totalArcLength, Math.max(u, 0));
        }
        // Find the spline to extract the value from
        var i = 0;
        var uTemp = 0.0;
        while (i < this.bezierCurves.length && uTemp + this.bezierCurves[i].getLength() < u) {
            uTemp += this.bezierCurves[i].getLength();
            i++;
        }
        // if u == arcLength
        //   -> i is max
        if (i >= this.bezierCurves.length)
            return this.bezierCurves[this.bezierCurves.length - 1].getEndPoint().clone();
        var bCurve = this.bezierCurves[i];
        var relativeU = u - uTemp;
        return bCurve.getPoint(relativeU);
    }
    /**
     * Get the point on the bézier path at the given path fraction.
     *
     * @method getPointAt
     * @param {number} t - The absolute path position: <pre>0.0 <= t <= 1.0</pre>
     * @instance
     * @memberof BezierPath
     * @return {Vertex} The point at the absolute path position.
     **/
    getPointAt(t) {
        return this.getPoint(t * this.totalArcLength);
    }
    /**
     * Get the tangent of the bézier path at the given path fraction.<br>
     * <br>
     * Note that the returned vector is not normalized.
     *
     * @method getTangentAt
     * @param {number} t - The absolute path position: <pre>0.0 <= t <= 1.0</pre>
     * @instance
     * @memberof BezierPath
     * @return {Vertex} The tangent vector at the absolute path position.
     **/
    getTangentAt(t) {
        return this.getTangent(t * this.totalArcLength);
    }
    /**
     *  Get the tangent of the bézier path at the given path location.<br>
     * <br>
     * Note that the returned vector is not normalized.
     *
     * @method getTangent
     * @param {number} u - The relative path position: <pre>0 <= u <= getLength()</pre>
     * @instance
     * @memberof BezierPath
     * @return {Vertex} The tangent vector at the relative path position.
     **/
    getTangent(u) {
        if (u < 0 || u > this.totalArcLength) {
            console.warn("[BezierPath.getTangent(u)] u is out of bounds: " + u + ".");
            // return undefined;
            u = Math.min(this.totalArcLength, Math.max(0, u));
        }
        // Find the spline to extract the value from
        var i = 0;
        var uTemp = 0.0;
        while (i < this.bezierCurves.length && uTemp + this.bezierCurves[i].getLength() < u) {
            uTemp += this.bezierCurves[i].getLength();
            i++;
        }
        var bCurve = this.bezierCurves[i];
        var relativeU = u - uTemp;
        return bCurve.getTangent(relativeU);
    }
    /**
     * Get the perpendicular of the bézier path at the given absolute path location (fraction).<br>
     * <br>
     * Note that the returned vector is not normalized.
     *
     * @method getPerpendicularAt
     * @param {number} t - The absolute path position: <pre>0.0 <= t <= 1.0</pre>
     * @instance
     * @memberof BezierPath
     * @return {Vertex} The perpendicluar vector at the absolute path position.
     **/
    getPerpendicularAt(t) {
        return this.getPerpendicular(t * this.totalArcLength);
    }
    /**
     * Get the perpendicular of the bézier path at the given relative path location.<br>
     * <br>
     * Note that the returned vector is not normalized.
     *
     * @method getPerpendicular
     * @param {number} u - The relative path position: <pre>0 <= u <= getLength()</pre>
     * @instance
     * @memberof BezierPath
     * @return {Vertex} The perpendicluar vector at the relative path position.
     **/
    getPerpendicular(u) {
        if (u < 0 || u > this.totalArcLength) {
            console.log("[BezierPath.getPerpendicular(u)] u is out of bounds: " + u + ".");
            u = Math.min(this.totalArcLength, Math.max(0, u));
        }
        // Find the spline to extract the value from
        var uResult = BezierPath._locateUIndex(this, u);
        var bCurve = this.bezierCurves[uResult.i];
        var relativeU = u - uResult.uPart;
        return bCurve.getPerpendicular(relativeU);
    }
    /**
     * This is a helper function to locate the curve index for a given
     * absolute path position u.
     *
     * I decided to put this into privat scope as it is really specific. Maybe
     * put this into a utils wrapper.
     *
     * Returns:
     * - {number} i - the index of the containing curve.
     * - {number} uPart - the absolute curve length sum (length from the beginning to u, should equal u itself).
     * - {number} uBefore - the absolute curve length for all segments _before_ the matched curve (usually uBefore <= uPart).
     **/
    static _locateUIndex(path, u) {
        var i = 0;
        var uTemp = 0.0;
        var uBefore = 0.0;
        while (i < path.bezierCurves.length && uTemp + path.bezierCurves[i].getLength() < u) {
            uTemp += path.bezierCurves[i].getLength();
            if (i + 1 < path.bezierCurves.length)
                uBefore += path.bezierCurves[i].getLength();
            i++;
        }
        return { i: i, uPart: uTemp, uBefore: uBefore };
    }
    /**
     * Get a specific sub path from this path. The start and end position are specified by
     * ratio number in [0..1].
     *
     * 0.0 is at the beginning of the path.
     * 1.0 is at the end of the path.
     *
     * Values below 0 or beyond 1 are cropped down to the [0..1] interval.
     *
     * startT > endT is allowed, the returned sub path will have inverse direction then.
     *
     * @method getSubPathAt
     * @param {number} startT - The start position of the sub path.
     * @param {number} endT - The end position of the sub path.
     * @instance
     * @memberof BezierPath
     * @return {BezierPath} The desired sub path in the bounds [startT..endT].
     **/
    getSubPathAt(startT, endT) {
        startT = Math.max(0, startT);
        endT = Math.min(1.0, endT);
        let startU = startT * this.totalArcLength;
        let endU = endT * this.totalArcLength;
        var uStartResult = BezierPath._locateUIndex(this, startU); // { i:int, uPart:float, uBefore:float }
        var uEndResult = BezierPath._locateUIndex(this, endU); // { i:int, uPart:float, uBefore:float }
        var firstT = (startU - uStartResult.uBefore) / this.bezierCurves[uStartResult.i].getLength();
        if (uStartResult.i == uEndResult.i) {
            // Subpath begins and ends in the same path segment (just get a simple sub curve from that path element).
            var lastT = (endU - uEndResult.uBefore) / this.bezierCurves[uEndResult.i].getLength();
            var firstCurve = this.bezierCurves[uStartResult.i].getSubCurveAt(firstT, lastT);
            return BezierPath.fromArray([firstCurve]);
        }
        else {
            var curves = [];
            if (uStartResult.i > uEndResult.i) {
                // Back to front direction
                var firstCurve = this.bezierCurves[uStartResult.i].getSubCurveAt(firstT, 0.0);
                curves.push(firstCurve);
                for (var i = uStartResult.i - 1; i > uEndResult.i; i--) {
                    curves.push(this.bezierCurves[i].clone().reverse());
                }
                var lastT = (endU - uEndResult.uBefore) / this.bezierCurves[uEndResult.i].getLength();
                curves.push(this.bezierCurves[uEndResult.i].getSubCurveAt(1.0, lastT));
            }
            else {
                // Front to back direction
                var firstCurve = this.bezierCurves[uStartResult.i].getSubCurveAt(firstT, 1.0);
                curves.push(firstCurve);
                for (var i = uStartResult.i + 1; i < uEndResult.i && i < this.bezierCurves.length; i++) {
                    curves.push(this.bezierCurves[i].clone());
                }
                var lastT = (endU - uEndResult.uBefore) / this.bezierCurves[uEndResult.i].getLength();
                curves.push(this.bezierCurves[uEndResult.i].getSubCurveAt(0, lastT));
            }
            return BezierPath.fromArray(curves);
        }
    }
    /**
     * This function moves the addressed curve point (or control point) with
     * keeping up the path's curve integrity.<br>
     * <br>
     * Thus is done by moving neighbour- and control- points as needed.
     *
     * @method moveCurvePoint
     * @param {number} curveIndex - The curve index to move a point from.
     * @param {number} pointID - One of the curve's four point IDs (START_POINT,
     *                           START_CONTROL_POINT, END_CONTRO_POINT or END_POINT).
     * @param {XYCoords} moveAmount - The amount to move the addressed vertex by.
     * @instance
     * @memberof BezierPath
     * @return {void}
     **/
    moveCurvePoint(curveIndex, pointID, moveAmount) {
        var bCurve = this.getCurveAt(curveIndex);
        bCurve.moveCurvePoint(pointID, moveAmount, true, // move control point, too
        true // updateArcLengths
        );
        // If inner point and NOT control point
        //  --> move neightbour
        if (pointID == this.START_POINT && (curveIndex > 0 || this.adjustCircular)) {
            // Set predecessor's control point!
            var predecessor = this.getCurveAt(curveIndex - 1 < 0 ? this.bezierCurves.length + (curveIndex - 1) : curveIndex - 1);
            predecessor.moveCurvePoint(this.END_CONTROL_POINT, moveAmount, true, // move control point, too
            false // updateArcLengths
            );
        }
        else if (pointID == this.END_POINT && (curveIndex + 1 < this.bezierCurves.length || this.adjustCircular)) {
            // Set successcor
            var successor = this.getCurveAt((curveIndex + 1) % this.bezierCurves.length);
            successor.moveCurvePoint(this.START_CONTROL_POINT, moveAmount, true, // move control point, too
            false // updateArcLengths
            );
        }
        else if (pointID == this.START_CONTROL_POINT && curveIndex > 0) {
            this.adjustPredecessorControlPoint(curveIndex, true, // obtain handle length?
            false // update arc lengths
            );
        }
        else if (pointID == this.END_CONTROL_POINT && curveIndex + 1 < this.getCurveCount()) {
            this.adjustSuccessorControlPoint(curveIndex, true, // obtain handle length?
            false // update arc lengths
            );
        }
        // Don't forget to update the arc lengths!
        // Note: this can be optimized as only two curves have changed their lengths!
        this.updateArcLengths();
    }
    /**
     * This helper function adjusts the given point's predecessor's control point.
     *
     * @method adjustPredecessorControlPoint
     * @param {number} curveIndex - The curve index to move a point from.
     * @param {boolean} obtainHandleLength - Moves the point with keeping the original handle length.
     * @param {boolean} updateArcLength - The amount to move the addressed vertex by.
     * @instance
     * @private
     * @memberof BezierPath
     * @return {void}
     **/
    adjustPredecessorControlPoint(curveIndex, obtainHandleLength, updateArcLengths) {
        if (!this.adjustCircular && curveIndex <= 0)
            return; // false;
        var mainCurve = this.getCurveAt(curveIndex);
        var neighbourCurve = this.getCurveAt(curveIndex - 1 < 0 ? this.getCurveCount() + (curveIndex - 1) : curveIndex - 1);
        BezierPath.adjustNeighbourControlPoint(mainCurve, neighbourCurve, mainCurve.getStartPoint(), // the reference point
        mainCurve.getStartControlPoint(), // the dragged control point
        neighbourCurve.getEndPoint(), // the neighbour's point
        neighbourCurve.getEndControlPoint(), // the neighbour's control point to adjust
        obtainHandleLength, updateArcLengths);
    }
    /**
     * This helper function adjusts the given point's successor's control point.
     *
     * @method adjustSuccessorControlPoint
     * @param {number} curveIndex - The curve index to move a point from.
     * @param {boolean} obtainHandleLength - Moves the point with keeping the original handle length.
     * @param {boolean} updateArcLength - The amount to move the addressed vertex by.
     * @instance
     * @private
     * @memberof BezierPath
     * @return {void}
     **/
    adjustSuccessorControlPoint(curveIndex, obtainHandleLength, updateArcLengths) {
        if (!this.adjustCircular && curveIndex + 1 > this.getCurveCount())
            return; //  false;
        var mainCurve = this.getCurveAt(curveIndex);
        var neighbourCurve = this.getCurveAt((curveIndex + 1) % this.getCurveCount());
        /* return */ BezierPath.adjustNeighbourControlPoint(mainCurve, neighbourCurve, mainCurve.getEndPoint(), // the reference point
        mainCurve.getEndControlPoint(), // the dragged control point
        neighbourCurve.getStartPoint(), // the neighbour's point
        neighbourCurve.getStartControlPoint(), // the neighbour's control point to adjust
        obtainHandleLength, updateArcLengths);
    }
    /**
     * This helper function adjusts the given point's successor's control point.
     *
     * @method adjustNeighbourControlPoint
     * @param {CubicBezierCurve} mainCurve
     * @param {CubicBezierCurve} neighbourCurve
     * @param {Vertex} mainPoint
     * @param {Vertex} mainControlPoint
     * @param {Vertex} neighbourPoint
     * @param {Vertex} neighbourControlPoint
     * @param {boolean} obtainHandleLengths
     * @param {boolean} updateArcLengths
     * @instance
     * @private
     * @memberof BezierPath
     * @return {void}
     **/
    static adjustNeighbourControlPoint(_mainCurve, // TODO: remove param
    neighbourCurve, mainPoint, mainControlPoint, neighbourPoint, neighbourControlPoint, obtainHandleLengths, _updateArcLengths // TODO: remove param
    ) {
        // Calculate start handle length
        var mainHandleBounds = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(mainControlPoint.x - mainPoint.x, mainControlPoint.y - mainPoint.y);
        var neighbourHandleBounds = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(neighbourControlPoint.x - neighbourPoint.x, neighbourControlPoint.y - neighbourPoint.y);
        var mainHandleLength = Math.sqrt(Math.pow(mainHandleBounds.x, 2) + Math.pow(mainHandleBounds.y, 2));
        var neighbourHandleLength = Math.sqrt(Math.pow(neighbourHandleBounds.x, 2) + Math.pow(neighbourHandleBounds.y, 2));
        if (mainHandleLength <= 0.1)
            return; // no secure length available for division? What about zoom? Use EPSILON?
        // Just invert the main handle (keep length or not?
        if (obtainHandleLengths) {
            neighbourControlPoint.set(neighbourPoint.x - mainHandleBounds.x * (neighbourHandleLength / mainHandleLength), neighbourPoint.y - mainHandleBounds.y * (neighbourHandleLength / mainHandleLength));
        }
        else {
            neighbourControlPoint.set(neighbourPoint.x - mainHandleBounds.x, neighbourPoint.y - mainHandleBounds.y);
        }
        neighbourCurve.updateArcLengths();
    }
    /**
     * Get the bounds of this Bézier path.
     *
     * Note the the curves' underlyung segment buffers are used to determine the bounds. The more
     * elements the segment buffers have, the more precise the returned bounds will be.
     *
     * @return {Bounds} The bounds of this Bézier path.
     **/
    getBounds() {
        const min = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        const max = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        var b;
        for (var i = 0; i < this.bezierCurves.length; i++) {
            b = this.bezierCurves[i].getBounds();
            min.x = Math.min(min.x, b.min.x);
            min.y = Math.min(min.y, b.min.y);
            max.x = Math.max(max.x, b.max.x);
            max.y = Math.max(max.y, b.max.y);
        }
        return new _Bounds__WEBPACK_IMPORTED_MODULE_0__.Bounds(min, max);
    }
    /**
     * Clone this BezierPath (deep clone).
     *
     * @method clone
     * @instance
     * @memberof BezierPath
     * @return {BezierPath}
     **/
    clone() {
        var path = new BezierPath(undefined);
        for (var i = 0; i < this.bezierCurves.length; i++) {
            path.bezierCurves.push(this.bezierCurves[i].clone());
            // Connect splines
            if (i > 0)
                path.bezierCurves[i - 1].endPoint = path.bezierCurves[i].startPoint;
        }
        path.updateArcLengths();
        path.adjustCircular = this.adjustCircular;
        return path;
    }
    /**
     * Compare this and the passed Bézier path.
     *
     * @method equals
     * @param {BezierPath} path - The pass to compare with.
     * @instance
     * @memberof BezierPath
     * @return {boolean}
     **/
    equals(path) {
        if (!path)
            return false;
        // Check if path contains the credentials
        if (!path.bezierCurves)
            return false;
        if (typeof path.bezierCurves.length == "undefined")
            return false;
        if (path.bezierCurves.length != this.bezierCurves.length)
            return false;
        for (var i = 0; i < this.bezierCurves.length; i++) {
            if (!this.bezierCurves[i].equals(path.bezierCurves[i]))
                return false;
        }
        return true;
    }
    /**
     * Create a <pre>&lt;path&gt;</pre> SVG representation of this bézier curve.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @method toSVGString
     * @param {object=} [options={}] - Like options.className
     * @param {string=} [options.className] - The classname to use for the SVG item.
     * @instance
     * @memberof BezierPath
     * @return {string} The SVG string.
     **/
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push("<path");
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' d="');
        for (var c = 0; c < this.bezierCurves.length; c++) {
            if (c > 0)
                buffer.push(" ");
            buffer.push(this.bezierCurves[c].toSVGPathData());
        }
        buffer.push('" />');
        return buffer.join("");
    }
    /**
     * Create a JSON string representation of this bézier curve.
     *
     * @method toJSON
     * @param {boolean} prettyFormat - If true then the function will add line breaks.
     * @instance
     * @memberof BezierPath
     * @return {string} The JSON string.
     **/
    toJSON(prettyFormat) {
        var buffer = [];
        buffer.push("["); // array begin
        for (var i = 0; i < this.bezierCurves.length; i++) {
            if (i > 0)
                buffer.push(",");
            if (prettyFormat)
                buffer.push("\n\t");
            else
                buffer.push(" ");
            buffer.push(this.bezierCurves[i].toJSON(prettyFormat));
        }
        if (this.bezierCurves.length != 0)
            buffer.push(" ");
        buffer.push("]"); // array end
        return buffer.join(""); // Convert to string, with empty separator.
    }
    /**
     * Parse a BezierPath from the given JSON string.
     *
     * @method fromJSON
     * @param {string} jsonString - The string with the JSON data.
     * @throw An error if the string is not JSON or does not contain a bezier path object.
     * @static
     * @memberof BezierPath
     * @return {BezierPath} The parsed bezier path instance.
     **/
    static fromJSON(jsonString) {
        var obj = JSON.parse(jsonString);
        return BezierPath.fromArray(obj);
    }
    /**
     * Create a BezierPath instance from the given array.
     *
     * @method fromArray
     * @param {Vertex[][]} arr - A two-dimensional array containing the bezier path vertices.
     * @throw An error if the array does not contain proper bezier path data.
     * @static
     * @memberof BezierPath
     * @return {BezierPath} The bezier path instance retrieved from the array data.
     **/
    static fromArray(obj) {
        if (!Array.isArray(obj))
            throw "[BezierPath.fromArray] Passed object must be an array.";
        const arr = obj; // FORCE?
        if (arr.length < 1)
            throw "[BezierPath.fromArray] Passed array must contain at least one bezier curve (has " + arr.length + ").";
        // Create an empty bezier path
        var bPath = new BezierPath(undefined);
        var lastCurve = null;
        for (var i = 0; i < arr.length; i++) {
            // Convert object (or array?) to bezier curve
            var bCurve;
            if (_CubicBezierCurve__WEBPACK_IMPORTED_MODULE_1__.CubicBezierCurve.isInstance(arr[i])) {
                bCurve = arr[i].clone();
            }
            else if (0 in arr[i] && 1 in arr[i] && 2 in arr[i] && 3 in arr[i]) {
                if (!arr[i][0] || !arr[i][1] || !arr[i][2] || !arr[i][3])
                    throw "Cannot convert path data to BezierPath instance. At least one element is undefined (index=" + i + "): " + arr[i];
                bCurve = _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_1__.CubicBezierCurve.fromArray(arr[i]);
            }
            else {
                bCurve = _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_1__.CubicBezierCurve.fromObject(arr[i]);
            }
            // Set curve start point?
            // (avoid duplicate point instances!)
            if (lastCurve)
                bCurve.startPoint = lastCurve.endPoint;
            // Add to path's internal list
            bPath.bezierCurves.push(bCurve);
            // bPath.totalArcLength += bCurve.getLength();
            lastCurve = bCurve;
        }
        bPath.updateArcLengths();
        // Bezier segments added. Done
        return bPath;
    }
    /**
     * This function converts the bezier path into a string containing
     * integer values only.
     * The points' float values are rounded to 1 digit after the comma.
     *
     * The returned string represents a JSON array (with leading '[' and
     * trailing ']', the separator is ',').
     *
     * @method toReducedListRepresentation
     * @param {number} digits - The number of digits to be used after the comma '.'.
     * @instance
     * @memberof BezierPath
     * @return {string} The reduced list representation of this path.
     **/
    toReducedListRepresentation(digits) {
        if (typeof digits == "undefined")
            digits = 1;
        var buffer = [];
        buffer.push("["); // array begin
        for (var i = 0; i < this.bezierCurves.length; i++) {
            var curve = this.bezierCurves[i];
            buffer.push(curve.getStartPoint().x.toFixed(digits));
            buffer.push(",");
            buffer.push(curve.getStartPoint().y.toFixed(digits));
            buffer.push(",");
            buffer.push(curve.getStartControlPoint().x.toFixed(digits));
            buffer.push(",");
            buffer.push(curve.getStartControlPoint().y.toFixed(digits));
            buffer.push(",");
            buffer.push(curve.getEndControlPoint().x.toFixed(digits));
            buffer.push(",");
            buffer.push(curve.getEndControlPoint().y.toFixed(digits));
            buffer.push(",");
        }
        if (this.bezierCurves.length != 0) {
            var curve = this.bezierCurves[this.bezierCurves.length - 1];
            buffer.push(curve.getEndPoint().x.toFixed(digits));
            buffer.push(",");
            buffer.push(curve.getEndPoint().y.toFixed(digits));
        }
        buffer.push("]"); // array end
        return buffer.join(""); // Convert to string, with empty separator.
    }
    /**
     * Parse a BezierPath instance from the reduced list representation.<br>
     * <br>
     * The passed string must represent a JSON array containing numbers only.
     *
     * @method fromReducedListRepresentation
     * @param {string} listJSON - The number of digits to be used after the floating point.
     * @throw An error if the string is malformed.
     * @instance
     * @memberof BezierPath
     * @return {BezierPath} The bezier path instance retrieved from the string.
     **/
    static fromReducedListRepresentation(listJSON, adjustCircular) {
        // Parse the array
        var pointArray = JSON.parse(listJSON);
        if (!pointArray.length) {
            console.log("Cannot parse bezier path from non-array object nor from empty point list.");
            throw "Cannot parse bezier path from non-array object nor from empty point list.";
        }
        if (pointArray.length < 8) {
            console.log("Cannot build bezier path. The passed array must contain at least 8 elements (numbers).");
            throw "Cannot build bezier path. The passed array must contain at least 8 elements (numbers).";
        }
        return BezierPath.fromReducedList(pointArray, adjustCircular);
    }
    /**
     * Convert a reduced list representation (array of numeric coordinates) to a BezierPath instance.
     *
     * The array's length must be 6*n + 2:
     *  - [sx, sy,  scx, scy,  ecx, ecy, ... , ex,  ey ]
     *     |                               |   |     |
     *     +--- sequence of curves --------+   +-end-+
     *
     * @param {number[]} pointArray
     * @returns BezierPath
     */
    static fromReducedList(pointArray, adjustCircular) {
        // Convert to object
        var bezierPath = new BezierPath(null); // No points yet
        // var firstStartPoint: Vertex;
        var startPoint;
        var startControlPoint;
        var endControlPoint;
        var endPoint;
        var i = 0;
        do {
            if (i == 0) {
                // firstStartPoint =
                startPoint = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(pointArray[i], pointArray[i + 1]);
            }
            startControlPoint = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(pointArray[i + 2], pointArray[i + 3]);
            endControlPoint = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(pointArray[i + 4], pointArray[i + 5]);
            // if (i + 8 >= pointArray.length) {
            //   endPoint = firstStartPoint;
            // } else {
            endPoint = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(pointArray[i + 6], pointArray[i + 7]);
            // }
            var bCurve = new _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_1__.CubicBezierCurve(startPoint, endPoint, startControlPoint, endControlPoint);
            bezierPath.bezierCurves.push(bCurve);
            startPoint = endPoint;
            i += 6;
        } while (i + 2 < pointArray.length);
        bezierPath.adjustCircular = adjustCircular;
        if (adjustCircular) {
            bezierPath.bezierCurves[bezierPath.bezierCurves.length - 1].endPoint = bezierPath.bezierCurves[0].startPoint;
        }
        bezierPath.updateArcLengths();
        return bezierPath;
    }
}
// +---------------------------------------------------------------------------------
// | These constants equal the values from CubicBezierCurve.
// +-------------------------------
/** @constant {number} */
BezierPath.START_POINT = 0;
/** @constant {number} */
BezierPath.START_CONTROL_POINT = 1;
/** @constant {number} */
BezierPath.END_CONTROL_POINT = 2;
/** @constant {number} */
BezierPath.END_POINT = 3;
//# sourceMappingURL=BezierPath.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Bounds.js":
/*!********************************************!*\
  !*** ../plotboilerplate/src/esm/Bounds.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Bounds": () => (/* binding */ Bounds)
/* harmony export */ });
/* harmony import */ var _Polygon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Polygon */ "../plotboilerplate/src/esm/Polygon.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * @author   Ikaros Kappler
 * @date     2020-05-11
 * @modified 2020-10-30 Added the static computeFromVertices function.
 * @modified 2020-11-19 Set min, max, width and height to private.
 * @modified 2021-02-02 Added the `toPolygon` method.
 * @modified 2021-06-21 (mid-summer) Added `getCenter` method.
 * @version  1.3.0
 **/


/**
 * @classdesc A bounds class with min and max values. Implementing IBounds.
 *
 * @requires XYCoords
 * @requires Vertex
 * @requires IBounds
 **/
class Bounds {
    /**
     * The constructor.
     *
     * @constructor
     * @name Bounds
     * @param {XYCoords} min - The min values (x,y) as a XYCoords tuple.
     * @param {XYCoords} max - The max values (x,y) as a XYCoords tuple.
     **/
    constructor(min, max) {
        this.min = min;
        this.max = max;
        this.width = max.x - min.x;
        this.height = max.y - min.y;
    }
    /**
     * Convert this rectangular bounding box to a polygon with four vertices.
     *
     * @method toPolygon
     * @instance
     * @memberof Bounds
     * @return {Polygon} This bound rectangle as a polygon.
     */
    toPolygon() {
        return new _Polygon__WEBPACK_IMPORTED_MODULE_0__.Polygon([new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(this.min), new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(this.max.x, this.min.y), new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(this.max), new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(this.min.x, this.max.y)], false);
    }
    getCenter() {
        return new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(this.min.x + (this.max.x - this.min.x) / 2.0, this.min.y + (this.max.y - this.min.y) / 2);
    }
    /**
     * Compute the minimal bounding box for a given set of vertices.
     *
     * An empty vertex array will return an empty bounding box located at (0,0).
     *
     * @static
     * @method computeFromVertices
     * @memberof Bounds
     * @param {Array<Vertex>} vertices - The set of vertices you want to get the bounding box for.
     * @return The minimal Bounds for the given vertices.
     **/
    static computeFromVertices(vertices) {
        if (vertices.length == 0)
            return new Bounds(new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(0, 0), new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(0, 0));
        let xMin = vertices[0].x;
        let xMax = vertices[0].x;
        let yMin = vertices[0].y;
        let yMax = vertices[0].y;
        let vert;
        for (var i in vertices) {
            vert = vertices[i];
            xMin = Math.min(xMin, vert.x);
            xMax = Math.max(xMax, vert.x);
            yMin = Math.min(yMin, vert.y);
            yMax = Math.max(yMax, vert.y);
        }
        return new Bounds(new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(xMin, yMin), new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(xMax, yMax));
    }
} // END class bounds
//# sourceMappingURL=Bounds.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Circle.js":
/*!********************************************!*\
  !*** ../plotboilerplate/src/esm/Circle.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Circle": () => (/* binding */ Circle)
/* harmony export */ });
/* harmony import */ var _Line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Line */ "../plotboilerplate/src/esm/Line.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _Vector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Vector */ "../plotboilerplate/src/esm/Vector.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * @author   Ikaros Kappler
 * @date     2020-05-04
 * @modified 2020-05-09 Ported to typescript.
 * @modified 2020-05-25 Added the vertAt and tangentAt functions.
 * @mofidied 2020-09-07 Added the circleIntersection(Circle) function.
 * @modified 2020-09-07 Changed the vertAt function by switching sin and cos! The old version did not return the correct vertex (by angle) accoring to the assumed circle math.
 * @modified 2020-10-16 Added the containsCircle(...) function.
 * @modified 2021-01-20 Added UID.
 * @version  1.2.0
 **/




/**
 * @classdesc A simple circle: center point and radius.
 *
 * @requires Line
 * @requires Vector
 * @requires VertTuple
 * @requires Vertex
 * @requires SVGSerializale
 * @requires UID
 * @requires UIDGenerator
 **/
class Circle {
    /**
     * Create a new circle with given center point and radius.
     *
     * @constructor
     * @name Circle
     * @param {Vertex} center - The center point of the circle.
     * @param {number} radius - The radius of the circle.
     */
    constructor(center, radius) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "Circle";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__.UIDGenerator.next();
        this.center = center;
        this.radius = radius;
    }
    ;
    /**
     * Check if the given circle is fully contained inside this circle.
     *
     * @method containsCircle
     * @param {Circle} circle - The circle to check if it is contained in this circle.
     * @instance
     * @memberof Circle
     * @return {boolean} `true` if any only if the given circle is completely inside this circle.
     */
    containsCircle(circle) {
        return this.center.distance(circle.center) + circle.radius < this.radius;
    }
    ;
    /**
     * Calculate the distance from this circle to the given line.
     *
     * * If the line does not intersect this ciecle then the returned
     *   value will be the minimal distance.
     * * If the line goes through this circle then the returned value
     *   will be max inner distance and it will be negative.
     *
     * @method lineDistance
     * @param {Line} line - The line to measure the distance to.
     * @return {number} The minimal distance from the outline of this circle to the given line.
     * @instance
     * @memberof Circle
     */
    lineDistance(line) {
        const closestPointOnLine = line.getClosestPoint(this.center);
        return closestPointOnLine.distance(this.center) - this.radius;
    }
    ;
    /**
     * Get the vertex on the this circle for the given angle.
     *
     * @method vertAt
     * @param {number} angle - The angle (in radians) to use.
     * @return {Vertex} The vertex (point) at the given angle.
     * @instance
     * @memberof Circle
     **/
    vertAt(angle) {
        // Find the point on the circle respective the angle. Then move relative to center.
        return Circle.circleUtils.vertAt(angle, this.radius).add(this.center);
    }
    ;
    /**
     * Get a tangent line of this circle for a given angle.
     *
     * Point a of the returned line is located on the circle, the length equals the radius.
     *
     * @method tangentAt
     * @instance
     * @param {number} angle - The angle (in radians) to use.
     * @return {Line} The tangent line.
     * @memberof Circle
     **/
    tangentAt(angle) {
        const pointA = Circle.circleUtils.vertAt(angle, this.radius);
        // Construct the perpendicular of the line in point a. Then move relative to center.
        return new _Vector__WEBPACK_IMPORTED_MODULE_2__.Vector(pointA, new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(0, 0)).add(this.center).perp();
    }
    ;
    /**
     * Calculate the intersection points (if exists) with the given circle.
     *
     * @method circleIntersection
     * @instance
     * @memberof Circle
     * @param {Circle} circle
     * @return {Line|null} The intersection points (as a line) or null if the two circles do not intersect.
     **/
    circleIntersection(circle) {
        // Circles do not intersect at all?
        if (this.center.distance(circle.center) > this.radius + circle.radius) {
            return null;
        }
        // One circle is fully inside the other?
        if (this.center.distance(circle.center) < Math.abs(this.radius - circle.radius)) {
            return null;
        }
        // Based on the C++ implementation by Robert King
        //    https://stackoverflow.com/questions/3349125/circle-circle-intersection-points
        // and the 'Circles and spheres' article by Paul Bourke.
        //    http://paulbourke.net/geometry/circlesphere/
        //
        // This is the original C++ implementation:
        //
        // pair<Point, Point> intersections(Circle c) {
        //    Point P0(x, y);
        //    Point P1(c.x, c.y);
        //    float d, a, h;
        //    d = P0.distance(P1);
        //    a = (r*r - c.r*c.r + d*d)/(2*d);
        //    h = sqrt(r*r - a*a);
        //    Point P2 = P1.sub(P0).scale(a/d).add(P0);
        //    float x3, y3, x4, y4;
        //    x3 = P2.x + h*(P1.y - P0.y)/d;
        //    y3 = P2.y - h*(P1.x - P0.x)/d;
        //    x4 = P2.x - h*(P1.y - P0.y)/d;
        //    y4 = P2.y + h*(P1.x - P0.x)/d;
        //    return pair<Point, Point>(Point(x3, y3), Point(x4, y4));
        // } 
        var p0 = this.center;
        var p1 = circle.center;
        var d = p0.distance(p1);
        var a = (this.radius * this.radius - circle.radius * circle.radius + d * d) / (2 * d);
        var h = Math.sqrt(this.radius * this.radius - a * a);
        var p2 = p1.clone().scale(a / d, p0);
        var x3 = p2.x + h * (p1.y - p0.y) / d;
        var y3 = p2.y - h * (p1.x - p0.x) / d;
        var x4 = p2.x - h * (p1.y - p0.y) / d;
        var y4 = p2.y + h * (p1.x - p0.x) / d;
        return new _Line__WEBPACK_IMPORTED_MODULE_0__.Line(new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(x3, y3), new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(x4, y4));
    }
    ;
    /**
      * Create an SVG representation of this circle.
      *
      * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
      * @method toSVGString
      * @param {object=} options - An optional set of options, like 'className'.
      * @return {string} A string representing the SVG code for this vertex.
      * @instance
      * @memberof Circle
      */
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push('<circle');
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' cx="' + this.center.x + '"');
        buffer.push(' cy="' + this.center.y + '"');
        buffer.push(' r="' + this.radius + '"');
        buffer.push(' />');
        return buffer.join('');
    }
    ;
} // END class
Circle.circleUtils = {
    vertAt: (angle, radius) => {
        /* return new Vertex( Math.sin(angle) * radius,
                   Math.cos(angle) * radius ); */
        return new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
};
//# sourceMappingURL=Circle.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/CircleSector.js":
/*!**************************************************!*\
  !*** ../plotboilerplate/src/esm/CircleSector.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CircleSector": () => (/* binding */ CircleSector)
/* harmony export */ });
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/**
 * @author   Ikaros Kappler
 * @date     2020-12-17
 * @modified 2021-01-20 Added UID.
 * @modified 2021-02-26 Fixed an error in the svg-arc-calculation (case angle<90deg and anti-clockwise).
 * @version  1.1.1
 **/

/**
 * @classdesc A simple circle sector: circle, start- and end-angle.
 *
 * @requires Line
 * @requires SVGSerializale
 * @requires UID
 * @requires UIDGenerator
 * @requires XYCoords
 **/
class CircleSector {
    /**
     * Create a new circle sector with given circle, start- and end-angle.
     *
     * @constructor
     * @name CircleSector
     * @param {Circle} circle - The circle.
     * @param {number} startAngle - The start angle of the sector.
     * @param {number} endAngle - The end angle of the sector.
     */
    constructor(circle, startAngle, endAngle) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "CircleSector";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_0__.UIDGenerator.next();
        this.circle = circle;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }
    ;
    /**
      * Create an SVG representation of this circle.
      *
      * @method toSVGString
      * @param {object=} options - An optional set of options, like 'className'.
      * @return {string} A string representing the SVG code for this vertex.
      * @instance
      * @memberof Circle
      */
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push('<path ');
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        const data = CircleSector.circleSectorUtils.describeSVGArc(this.circle.center.x, this.circle.center.y, this.circle.radius, this.startAngle, this.endAngle);
        buffer.push(' d="' + data.join(" ") + '" />');
        return buffer.join('');
    }
    ;
} // END class
CircleSector.circleSectorUtils = {
    /**
     * Helper function to convert polar circle coordinates to cartesian coordinates.
     *
     * TODO: generalize for ellipses (two radii).
     *
     * @param {number} angle - The angle in radians.
    */
    polarToCartesian: (centerX, centerY, radius, angle) => {
        return {
            x: centerX + (radius * Math.cos(angle)),
            y: centerY + (radius * Math.sin(angle))
        };
    },
    /**
     * Helper function to convert a circle section as SVG arc params (for the `d` attribute).
     * Found at: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
     *
     * TODO: generalize for ellipses (two radii).
     *
     * @param {boolean} options.moveToStart - If false (default=true) the initial 'Move' command will not be used.
     * @return [ 'A', radiusx, radiusy, rotation=0, largeArcFlag=1|0, sweepFlag=0, endx, endy ]
     */
    describeSVGArc: (x, y, radius, startAngle, endAngle, options) => {
        if (typeof options === 'undefined')
            options = { moveToStart: true };
        const end = CircleSector.circleSectorUtils.polarToCartesian(x, y, radius, endAngle);
        const start = CircleSector.circleSectorUtils.polarToCartesian(x, y, radius, startAngle);
        // Split full circles into two halves.
        // Some browsers have problems to render full circles (described by start==end).
        if (Math.PI * 2 - Math.abs(startAngle - endAngle) < 0.001) {
            const firstHalf = CircleSector.circleSectorUtils.describeSVGArc(x, y, radius, startAngle, startAngle + (endAngle - startAngle) / 2, options);
            const secondHalf = CircleSector.circleSectorUtils.describeSVGArc(x, y, radius, startAngle + (endAngle - startAngle) / 2, endAngle, options);
            return firstHalf.concat(secondHalf);
        }
        // Boolean stored as integers (0|1).
        const diff = endAngle - startAngle;
        var largeArcFlag;
        var sweepFlag;
        if (diff < 0) {
            largeArcFlag = Math.abs(diff) < Math.PI ? 1 : 0;
            sweepFlag = 1;
        }
        else {
            largeArcFlag = Math.abs(diff) > Math.PI ? 1 : 0;
            sweepFlag = 1;
        }
        const pathData = [];
        if (options.moveToStart) {
            pathData.push('M', start.x, start.y);
        }
        pathData.push("A", radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y);
        return pathData;
    }
};
//# sourceMappingURL=CircleSector.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/CubicBezierCurve.js":
/*!******************************************************!*\
  !*** ../plotboilerplate/src/esm/CubicBezierCurve.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CubicBezierCurve": () => (/* binding */ CubicBezierCurve)
/* harmony export */ });
/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Bounds */ "../plotboilerplate/src/esm/Bounds.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/* harmony import */ var _Vector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Vector */ "../plotboilerplate/src/esm/Vector.js");
/**
 * @author   Ikaros Kappler
 * @date     2013-08-15
 * @modified 2018-08-16 Added a closure. Removed the wrapper class 'IKRS'. Replaced class THREE.Vector2 by Vertex class.
 * @modified 2018-11-19 Added the fromArray(Array) function.
 * @modified 2018-11-28 Added the locateCurveByPoint(Vertex) function.
 * @modified 2018-12-04 Added the toSVGPathData() function.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2019-03-23 Changed the signatures of getPoint, getPointAt and getTangent (!version 2.0).
 * @modified 2019-12-02 Fixed the updateArcLength function. It used the wrong pointAt function (was renamed before).
 * @modified 2020-02-06 Added the getSubCurveAt(number,number) function.
 * @modified 2020-02-06 Fixed a serious bug in the arc lenght calculation (length was never reset, urgh).
 * @modified 2020-02-07 Added the isInstance(any) function.
 * @modified 2020-02-10 Added the reverse() function.
 * @modified 2020-02-10 Fixed the translate(...) function (returning 'this' was missing).
 * @modified 2020-03-24 Ported this class from vanilla JS to Typescript.
 * @modified 2020-06-03 Added the getBounds() function.
 * @modified 2020-07-14 Changed the moveCurvePoint(...,Vertex) to moveCurvePoint(...,XYCoords), which is more generic.
 * @modified 2020-07-24 Added the getClosestT function and the helper function locateIntervalByDistance(...).
 * @modified 2021-01-20 Added UID.
 * @version 2.5.0
 *
 * @file CubicBezierCurve
 * @public
 **/




/**
 * @classdesc A refactored cubic bezier curve class.
 *
 * @requires Bounds
 * @requires Vertex
 * @requires Vector
 * @requires XYCoords
 * @requires UID
 * @requires UIDGenerator
 */
class CubicBezierCurve {
    /**
     * The constructor.
     *
     * @constructor
     * @name CubicBezierCurve
     * @param {Vertex} startPoint - The Bézier curve's start point.
     * @param {Vertex} endPoint   - The Bézier curve's end point.
     * @param {Vertex} startControlPoint - The Bézier curve's start control point.
     * @param {Vertex} endControlPoint   - The Bézier curve's end control point.
     **/
    constructor(startPoint, endPoint, startControlPoint, endControlPoint) {
        /** @constant {number} */
        this.START_POINT = CubicBezierCurve.START_POINT;
        /** @constant {number} */
        this.START_CONTROL_POINT = CubicBezierCurve.START_CONTROL_POINT;
        /** @constant {number} */
        this.END_CONTROL_POINT = CubicBezierCurve.END_CONTROL_POINT;
        /** @constant {number} */
        this.END_POINT = CubicBezierCurve.END_POINT;
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__.UIDGenerator.next();
        this.startPoint = startPoint;
        this.startControlPoint = startControlPoint;
        this.endPoint = endPoint;
        this.endControlPoint = endControlPoint;
        this.curveIntervals = 30;
        // An array of vertices
        this.segmentCache = [];
        // An array of floats
        this.segmentLengths = [];
        // float
        this.arcLength = null;
        this.updateArcLengths();
    }
    ;
    /**
     * Move the given curve point (the start point, end point or one of the two
     * control points).
     *
     * @method moveCurvePoint
     * @param {number} pointID - The numeric identicator of the point to move. Use one of the four eBezierPoint constants.
     * @param {XYCoords} moveAmount - The amount to move the specified point by.
     * @param {boolean} moveControlPoint - Move the control points along with their path point (if specified point is a path point).
     * @param {boolean} updateArcLengths - Specifiy if the internal arc segment buffer should be updated.
     * @instance
     * @memberof CubicBezierCurve
     * @return {void}
     **/
    moveCurvePoint(pointID, moveAmount, moveControlPoint, updateArcLengths) {
        if (pointID == this.START_POINT) {
            this.getStartPoint().add(moveAmount);
            if (moveControlPoint)
                this.getStartControlPoint().add(moveAmount);
        }
        else if (pointID == this.START_CONTROL_POINT) {
            this.getStartControlPoint().add(moveAmount);
        }
        else if (pointID == this.END_CONTROL_POINT) {
            this.getEndControlPoint().add(moveAmount);
        }
        else if (pointID == this.END_POINT) {
            this.getEndPoint().add(moveAmount);
            if (moveControlPoint)
                this.getEndControlPoint().add(moveAmount);
        }
        else {
            console.log(`[CubicBezierCurve.moveCurvePoint] pointID '${pointID}' invalid.`);
        }
        if (updateArcLengths)
            this.updateArcLengths();
    }
    ;
    /**
     * Translate the whole curve by the given {x,y} amount: moves all four points.
     *
     * @method translate
     * @param {Vertex} amount - The amount to translate this curve by.
     * @instance
     * @memberof CubicBezierCurve
     * @return {CubicBezierCurve} this (for chaining).
     **/
    translate(amount) {
        this.startPoint.add(amount);
        this.startControlPoint.add(amount);
        this.endControlPoint.add(amount);
        this.endPoint.add(amount);
        return this;
    }
    ;
    /**
     * Reverse this curve, means swapping start- and end-point and swapping
     * start-control- and end-control-point.
     *
     * @method reverse
     * @instance
     * @memberof CubicBezierCurve
     * @return {CubicBezierCurve} this (for chaining).
     **/
    reverse() {
        let tmp = this.startPoint;
        this.startPoint = this.endPoint;
        this.endPoint = tmp;
        tmp = this.startControlPoint;
        this.startControlPoint = this.endControlPoint;
        this.endControlPoint = tmp;
        return this;
    }
    ;
    /**
     * Get the total curve length.<br>
     * <br>
     * As not all Bézier curved have a closed formula to calculate their lengths, this
     * implementation uses a segment buffer (with a length of 30 segments). So the
     * returned length is taken from the arc segment buffer.<br>
     * <br>
     * Note that if the curve points were changed and the segment buffer was not
     * updated this function might return wrong (old) values.
     *
     * @method getLength
     * @instance
     * @memberof CubicBezierCurve
     * @return {number} >= 0
     **/
    getLength() {
        return this.arcLength;
    }
    ;
    /**
     * Uptate the internal arc segment buffer and their lengths.<br>
     * <br>
     * All class functions update the buffer automatically; if any
     * curve point is changed by other reasons you should call this
     * function to keep actual values in the buffer.
     *
     * @method updateArcLengths
     * @instance
     * @memberof CubicBezierCurve
     * @return {void}
     **/
    updateArcLengths() {
        let pointA = this.startPoint.clone();
        let pointB = new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(0, 0);
        let curveStep = 1.0 / this.curveIntervals;
        // Clear segment cache
        this.segmentCache = [];
        // Push start point into buffer
        this.segmentCache.push(this.startPoint);
        this.segmentLengths = [];
        let newLength = 0.0;
        var t = 0.0;
        let tmpLength;
        while (t <= 1.0) {
            pointB = this.getPointAt(t);
            // Store point into cache
            this.segmentCache.push(pointB);
            // Calculate segment length
            tmpLength = pointA.distance(pointB);
            this.segmentLengths.push(tmpLength);
            newLength += tmpLength;
            pointA = pointB;
            t += curveStep;
        }
        this.arcLength = newLength;
    }
    ;
    /**
     * Get a 't' (relative position on curve) with the closest distance to point 'p'.
     *
     * The returned number is 0.0 <= t <= 1.0. Use the getPointAt(t) function to retrieve the actual curve point.
     *
     * This function uses a recursive approach by cutting the curve into several linear segments.
     *
     * @param {Vertex} p - The point to find the closest position ('t' on the curve).
     * @return {number}
     **/
    getClosestT(p) {
        // We would like to have an error that's not larger than 1.0.
        var desiredEpsilon = 1.0;
        var result = { t: 0, tPrev: 0.0, tNext: 1.0 };
        var iteration = 0;
        do {
            result = this.locateIntervalByDistance(p, result.tPrev, result.tNext, this.curveIntervals);
            iteration++;
            // Be sure: stop after 4 iterations
        } while (iteration < 4 && this.getPointAt(result.tPrev).distance(this.getPointAt(result.tNext)) > desiredEpsilon);
        return result.t;
    }
    ;
    /**
     * This helper function locates the 't' on a fixed step interval with the minimal distance
     * between the curve (at 't') and the given point.
     *
     * Furthermore you must specify a sub curve (start 't' and end 't') you want to search on.
     * Using tStart=0.0 and tEnd=1.0 will search on the full curve.
     *
     * @param {Vertex} p - The point to find the closest curve point for.
     * @param {number} tStart - The start position (start 't' of the sub curve). Should be >= 0.0.
     * @param {number} tEnd - The end position (end 't' of the sub curve). Should be <= 1.0.
     * @param {number} stepCount - The number of steps to check within the interval.
     *
     * @return {object} - An object with t, tPrev and tNext (numbers).
     **/
    locateIntervalByDistance(p, tStart, tEnd, stepCount) {
        var minIndex = -1;
        var minDist = 0;
        var t = 0.0;
        const tDiff = tEnd - tStart;
        for (var i = 0; i <= stepCount; i++) {
            t = tStart + tDiff * (i / stepCount);
            var vert = this.getPointAt(t);
            var dist = vert.distance(p);
            if (minIndex == -1 || dist < minDist) {
                minIndex = i;
                minDist = dist;
            }
        }
        return { t: tStart + tDiff * (minIndex / stepCount),
            tPrev: tStart + tDiff * (Math.max(0, minIndex - 1) / stepCount),
            tNext: tStart + tDiff * (Math.min(stepCount, minIndex + 1) / stepCount)
        };
    }
    ;
    /**
     * Get the bounds of this bezier curve.
     *
     * The bounds are approximated by the underlying segment buffer; the more segment there are,
     * the more accurate will be the returned bounds.
     *
     * @return {Bounds} The bounds of this curve.
     **/
    getBounds() {
        var min = new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        var max = new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        let v;
        for (var i = 0; i < this.segmentCache.length; i++) {
            v = this.segmentCache[i];
            min.x = Math.min(min.x, v.x);
            min.y = Math.min(min.y, v.y);
            max.x = Math.max(max.x, v.x);
            max.y = Math.max(max.y, v.y);
        }
        return new _Bounds__WEBPACK_IMPORTED_MODULE_0__.Bounds(min, max);
    }
    ;
    /**
     * Get the start point of the curve.<br>
     * <br>
     * This function just returns this.startPoint.
     *
     * @method getStartPoint
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex} this.startPoint
     **/
    getStartPoint() {
        return this.startPoint;
    }
    ;
    /**
     * Get the end point of the curve.<br>
     * <br>
     * This function just returns this.endPoint.
     *
     * @method getEndPoint
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex} this.endPoint
     **/
    getEndPoint() {
        return this.endPoint;
    }
    ;
    /**
     * Get the start control point of the curve.<br>
     * <br>
     * This function just returns this.startControlPoint.
     *
     * @method getStartControlPoint
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex} this.startControlPoint
     **/
    getStartControlPoint() {
        return this.startControlPoint;
    }
    ;
    /**
     * Get the end control point of the curve.<br>
     * <br>
     * This function just returns this.endControlPoint.
     *
     * @method getEndControlPoint
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex} this.endControlPoint
     **/
    getEndControlPoint() {
        return this.endControlPoint;
    }
    ;
    /**
     * Get one of the four curve points specified by the passt point ID.
     *
     * @method getEndControlPoint
     * @param {number} id - One of START_POINT, START_CONTROL_POINT, END_CONTROL_POINT or END_POINT.
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex}
     **/
    getPointByID(id) {
        if (id == this.START_POINT)
            return this.startPoint;
        if (id == this.END_POINT)
            return this.endPoint;
        if (id == this.START_CONTROL_POINT)
            return this.startControlPoint;
        if (id == this.END_CONTROL_POINT)
            return this.endControlPoint;
        throw new Error(`Invalid point ID '${id}'.`);
    }
    ;
    /**
     * Get the curve point at a given position t, where t is in [0,1].<br>
     * <br>
     * @see Line.pointAt
     *
     * @method getPointAt
     * @param {number} t - The position on the curve in [0,1] (0 means at
     *                     start point, 1 means at end point, other values address points in bertween).
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex}
     **/
    getPointAt(t) {
        // Perform some powerful math magic
        const x = this.startPoint.x * Math.pow(1.0 - t, 3) + this.startControlPoint.x * 3 * t * Math.pow(1.0 - t, 2)
            + this.endControlPoint.x * 3 * Math.pow(t, 2) * (1.0 - t) + this.endPoint.x * Math.pow(t, 3);
        const y = this.startPoint.y * Math.pow(1.0 - t, 3) + this.startControlPoint.y * 3 * t * Math.pow(1.0 - t, 2)
            + this.endControlPoint.y * 3 * Math.pow(t, 2) * (1.0 - t) + this.endPoint.y * Math.pow(t, 3);
        return new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(x, y);
    }
    ;
    /**
     * Get the curve point at a given position u, where u is in [0,arcLength].<br>
     * <br>
     * @see CubicBezierCurve.getPointAt
     *
     * @method getPoint
     * @param {number} u - The position on the curve in [0,arcLength] (0 means at
     *                     start point, arcLength means at end point, other values address points in bertween).
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex}
     **/
    getPoint(u) {
        return this.getPointAt(u / this.arcLength);
    }
    ;
    /**
     * Get the curve tangent vector at a given absolute curve position t in [0,1].<br>
     * <br>
     * Note that the returned tangent vector (end point) is not normalized and relative to (0,0).
     *
     * @method getTangent
     * @param {number} t - The position on the curve in [0,1].
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex}
     **/
    getTangentAt(t) {
        const a = this.getStartPoint();
        const b = this.getStartControlPoint();
        const c = this.getEndControlPoint();
        const d = this.getEndPoint();
        // This is the shortened one
        const t2 = t * t;
        // (1 - t)^2 = (1-t)*(1-t) = 1 - t - t + t^2 = 1 - 2*t + t^2
        const nt2 = 1 - 2 * t + t2;
        const tX = -3 * a.x * nt2 +
            b.x * (3 * nt2 - 6 * (t - t2)) +
            c.x * (6 * (t - t2) - 3 * t2) +
            3 * d.x * t2;
        const tY = -3 * a.y * nt2 +
            b.y * (3 * nt2 - 6 * (t - t2)) +
            c.y * (6 * (t - t2) - 3 * t2) +
            3 * d.y * t2;
        // Note: my implementation does NOT normalize tangent vectors!
        return new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(tX, tY);
    }
    ;
    /**
     * Get a sub curve at the given start end end offsets (values between 0.0 and 1.0).
     *
     * tStart >= tEnd is allowed, you will get a reversed sub curve then.
     *
     * @method getSubCurveAt
     * @param {number} tStart – The start offset of the desired sub curve (must be in [0..1]).
     * @param {number} tEnd – The end offset if the desired cub curve (must be in [0..1]).
     * @instance
     * @memberof CubicBezierCurve
     * @return {CubicBezierCurve} The sub curve as a new curve.
     **/
    getSubCurveAt(tStart, tEnd) {
        const startVec = new _Vector__WEBPACK_IMPORTED_MODULE_3__.Vector(this.getPointAt(tStart), this.getTangentAt(tStart));
        const endVec = new _Vector__WEBPACK_IMPORTED_MODULE_3__.Vector(this.getPointAt(tEnd), this.getTangentAt(tEnd).inv());
        // Tangents are relative. Make absolute.
        startVec.b.add(startVec.a);
        endVec.b.add(endVec.a);
        // This 'splits' the curve at the given point at t.
        startVec.scale(0.33333333 * (tEnd - tStart));
        endVec.scale(0.33333333 * (tEnd - tStart));
        // Draw the bezier curve
        // pb.draw.cubicBezier( startVec.a, endVec.a, startVec.b, endVec.b, '#8800ff', 2 );
        return new CubicBezierCurve(startVec.a, endVec.a, startVec.b, endVec.b);
    }
    ;
    /**
     * Convert a relative curve position u to the absolute curve position t.
     *
     * @method convertU2t
     * @param {number} u - The relative position on the curve in [0,arcLength].
     * @instance
     * @memberof CubicBezierCurve
     * @return {number}
     **/
    convertU2T(u) {
        return Math.max(0.0, Math.min(1.0, (u / this.arcLength)));
    }
    ;
    /**
     * Get the curve tangent vector at a given relative position u in [0,arcLength].<br>
     * <br>
     * Note that the returned tangent vector (end point) is not normalized.
     *
     * @method getTangent
     * @param {number} u - The position on the curve in [0,arcLength].
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex}
     **/
    getTangent(u) {
        return this.getTangentAt(this.convertU2T(u));
    }
    ;
    /**
     * Get the curve perpendicular at a given relative position u in [0,arcLength] as a vector.<br>
     * <br>
     * Note that the returned vector (end point) is not normalized.
     *
     * @method getPerpendicular
     * @param {number} u - The relative position on the curve in [0,arcLength].
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex}
     **/
    getPerpendicular(u) {
        return this.getPerpendicularAt(this.convertU2T(u));
    }
    ;
    /**
     * Get the curve perpendicular at a given absolute position t in [0,1] as a vector.<br>
     * <br>
     * Note that the returned vector (end point) is not normalized.
     *
     * @method getPerpendicularAt
     * @param {number} u - The absolute position on the curve in [0,1].
     * @instance
     * @memberof CubicBezierCurve
     * @return {Vertex}
     **/
    getPerpendicularAt(t) {
        const tangentVector = this.getTangentAt(t);
        return new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(tangentVector.y, -tangentVector.x);
    }
    ;
    /**
     * Clone this Bézier curve (deep clone).
     *
     * @method clone
     * @instance
     * @memberof CubicBezierCurve
     * @return {CubicBezierCurve}
     **/
    clone() {
        return new CubicBezierCurve(this.getStartPoint().clone(), this.getEndPoint().clone(), this.getStartControlPoint().clone(), this.getEndControlPoint().clone());
    }
    ;
    /**
     * Check if this and the specified curve are equal.<br>
     * <br>
     * All four points need to be equal for this, the Vertex.equals function is used.<br>
     * <br>
     * Please note that this function is not type safe (comparison with any object will fail).
     *
     * @method clone
     * @param {CubicBezierCurve} curve - The curve to compare with.
     * @instance
     * @memberof CubicBezierCurve
     * @return {boolean}
     **/
    equals(curve) {
        // Note: in the earlier vanilla-JS version this was callable with plain objects.
        //       Let's see if this restricted version works out.
        if (!curve)
            return false;
        if (!curve.startPoint ||
            !curve.endPoint ||
            !curve.startControlPoint ||
            !curve.endControlPoint)
            return false;
        return this.startPoint.equals(curve.startPoint)
            && this.endPoint.equals(curve.endPoint)
            && this.startControlPoint.equals(curve.startControlPoint)
            && this.endControlPoint.equals(curve.endControlPoint);
    }
    ;
    /**
     * Quick check for class instance.
     * Is there a better way?
     *
     * @method isInstance
     * @param {any} obj - Check if the passed object/value is an instance of CubicBezierCurve.
     * @instance
     * @memberof CubicBezierCurve
     * @return {boolean}
     **/
    static isInstance(obj) {
        // Note: check this again
        /* OLD VANILLA JS IMPLEMENTATION */
        /* if( typeof obj != "object" )
            return false;
        function hasXY(v) {
            return typeof v != "undefined" && typeof v.x == "number" && typeof v.y == "number";
        }
        return typeof obj.startPoint == "object" && hasXY(obj.startPoint)
            && typeof obj.endPoint == "object" && hasXY(obj.endPoint)
            && typeof obj.startControlPoint == "object" && hasXY(obj.startControlPoint)
            && typeof obj.endControlPoint == "object" && hasXY(obj.endControlPoint);
        */
        return obj instanceof CubicBezierCurve;
    }
    ;
    /**
     * Create an SVG path data representation of this bézier curve.
     *
     * Path data string format is:<br>
     *  <pre>'M x0 y1 C dx0 dy1 dx1 dy1 x1 x2'</pre><br>
     * or in other words<br>
     *   <pre>'M startoint.x startPoint.y C startControlPoint.x startControlPoint.y endControlPoint.x endControlPoint.y endPoint.x endPoint.y'</pre>
     *
     * @method toSVGPathData
     * @instance
     * @memberof CubicBezierCurve
     * @return {string}  The SVG path data string.
     **/
    toSVGPathData() {
        var buffer = [];
        buffer.push('M ');
        buffer.push(this.startPoint.x.toString());
        buffer.push(' ');
        buffer.push(this.startPoint.y.toString());
        buffer.push(' C ');
        buffer.push(this.startControlPoint.x.toString());
        buffer.push(' ');
        buffer.push(this.startControlPoint.y.toString());
        buffer.push(' ');
        buffer.push(this.endControlPoint.x.toString());
        buffer.push(' ');
        buffer.push(this.endControlPoint.y.toString());
        buffer.push(' ');
        buffer.push(this.endPoint.x.toString());
        buffer.push(' ');
        buffer.push(this.endPoint.y.toString());
        return buffer.join('');
    }
    ;
    /**
     * Convert this curve to a JSON string.
     *
     * @method toJSON
     * @param {boolean=} [prettyFormat=false] - If set to true the function will add line breaks.
     * @instance
     * @memberof CubicBezierCurve
     * @return {string} The JSON data.
     **/
    toJSON(prettyFormat) {
        var jsonString = "{ " + // begin object
            (prettyFormat ? "\n\t" : "") +
            "\"startPoint\" : [" + this.getStartPoint().x + "," + this.getStartPoint().y + "], " +
            (prettyFormat ? "\n\t" : "") +
            "\"endPoint\" : [" + this.getEndPoint().x + "," + this.getEndPoint().y + "], " +
            (prettyFormat ? "\n\t" : "") +
            "\"startControlPoint\": [" + this.getStartControlPoint().x + "," + this.getStartControlPoint().y + "], " +
            (prettyFormat ? "\n\t" : "") +
            "\"endControlPoint\" : [" + this.getEndControlPoint().x + "," + this.getEndControlPoint().y + "]" +
            (prettyFormat ? "\n\t" : "") +
            " }"; // end object
        return jsonString;
    }
    ;
    /**
     * Parse a Bézier curve from the given JSON string.
     *
     * @method fromJSON
     * @param {string} jsonString - The JSON data to parse.
     * @memberof CubicBezierCurve
     * @static
     * @throws An exception if the JSON string is malformed.
     * @return {CubicBezierCurve}
     **/
    static fromJSON(jsonString) {
        var obj = JSON.parse(jsonString);
        return CubicBezierCurve.fromObject(obj);
    }
    ;
    /**
     * Try to convert the passed object to a CubicBezierCurve.
     *
     * @method fromObject
     * @param {object} obj - The object to convert.
     * @memberof CubicBezierCurve
     * @static
     * @throws An exception if the passed object is malformed.
     * @return {CubicBezierCurve}
     **/
    static fromObject(obj) {
        if (typeof obj !== "object")
            throw "Can only build from object.";
        if (!obj.startPoint)
            throw "Object member \"startPoint\" missing.";
        if (!obj.endPoint)
            throw "Object member \"endPoint\" missing.";
        if (!obj.startControlPoint)
            throw "Object member \"startControlPoint\" missing.";
        if (!obj.endControlPoint)
            throw "Object member \"endControlPoint\" missing.";
        return new CubicBezierCurve(new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(obj.startPoint[0], obj.startPoint[1]), new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(obj.endPoint[0], obj.endPoint[1]), new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(obj.startControlPoint[0], obj.startControlPoint[1]), new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(obj.endControlPoint[0], obj.endControlPoint[1]));
    }
    ;
    /**
     * Convert a 4-element array of vertices to a cubic bézier curve.
     *
     * @method fromArray
     * @param {Vertex[]} arr -  [ startVertex, endVertex, startControlVertex, endControlVertex ]
     * @memberof CubicBezierCurve
     * @throws An exception if the passed array is malformed.
     * @return {CubicBezierCurve}
     **/
    static fromArray(arr) {
        if (!Array.isArray(arr))
            throw "Can only build from object.";
        if (arr.length != 4)
            throw "Can only build from array with four elements.";
        return new CubicBezierCurve(arr[0], arr[1], arr[2], arr[3]);
    }
    ;
}
/** @constant {number} */
CubicBezierCurve.START_POINT = 0;
/** @constant {number} */
CubicBezierCurve.START_CONTROL_POINT = 1;
/** @constant {number} */
CubicBezierCurve.END_CONTROL_POINT = 2;
/** @constant {number} */
CubicBezierCurve.END_POINT = 3;
//# sourceMappingURL=CubicBezierCurve.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Grid.js":
/*!******************************************!*\
  !*** ../plotboilerplate/src/esm/Grid.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Grid": () => (/* binding */ Grid)
/* harmony export */ });
/**
 * @author   Ikaros Kappler
 * @date     2018-11-28
 * @modified 2018-12-09 Added the utils: baseLog(Number,Number) and mapRasterScale(Number,Number).
 * @version  1.0.1
 *
 * @file Grid
 * @fileoverview Note that the PlotBoilerplate already has a Grid instance member. The Grid is not meant
 *               to be added to the canvas as a drawable as it encapsulates more an abstract concept of the canvas
 *               rather than a drawable object.
 * @public
 **/
/**
 * @classdesc A grid class with vertical and horizontal lines (or a raster).
 *
 * Note that the PlotBoilerplate already has a Grid instance member. The Grid is not meant
 * to be added to the canvas as a drawable as it encapsulates more an abstract concept of the canvas
 * rather than a drawable object.
 *
 * @requires Vertex
 */
class Grid {
    /**
     * The constructor.
     *
     * @constructor
     * @name Grid
     * @param {Vertex} center - The offset of the grid (default is [0,0]).
     * @param {Vertex} size   - The x- and y-size of the grid.
     **/
    constructor(center, size) {
        this.center = center;
        this.size = size;
    }
    ;
}
/**
 * @memberof Grid
 **/
Grid.utils = {
    /**
     * Calculate the logarithm of the given number (num) to a given base.<br>
     * <br>
     * This function returns the number l with<br>
     *  <pre>num == Math.pow(base,l)</pre>
     *
     * @member baseLog
     * @function
     * @memberof Grid
     * @inner
     * @param {number} base - The base to calculate the logarithm to.
     * @param {number} num  - The number to calculate the logarithm for.
     * @return {number} <pre>log(base)/log(num)</pre>
     **/
    baseLog: (base, num) => { return Math.log(base) / Math.log(num); },
    /**
     * Calculate the raster scale for a given logarithmic mapping.<br>
     * <br>
     * Example (with adjustFactor=2):<br>
     * <pre>
     * If scale is 4.33, then the mapping is 1/2 (because 2^2 <= 4.33 <= 2^3)<br>
     * If scale is 0.33, then the mapping is 2 because (2^(1/2) >= 0.33 >= 2^(1/4)
     * </pre>
     *
     * @member mapRasterScale
     * @function
     * @memberof Grid
     * @inner
     * @param {number} adjustFactor The base for the logarithmic raster scaling when zoomed.
     * @param {number} scale        The currently used scale factor.
     * @return {number}
     **/
    mapRasterScale: (adjustFactor, scale) => {
        var gf = 1.0;
        if (scale >= 1) {
            gf = Math.abs(Math.floor(1 / Grid.utils.baseLog(adjustFactor, scale)));
            gf = 1 / Math.pow(adjustFactor, gf);
        }
        else {
            gf = Math.abs(Math.floor(Grid.utils.baseLog(1 / adjustFactor, 1 / (scale + 1))));
        }
        return gf;
    }
};
//# sourceMappingURL=Grid.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/KeyHandler.js":
/*!************************************************!*\
  !*** ../plotboilerplate/src/esm/KeyHandler.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "KeyHandler": () => (/* binding */ KeyHandler)
/* harmony export */ });
/**
 * @author   Ikaros Kappler
 * @date     2018-11-11 (Alaaf)
 * @modified 2020-03-28 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-07-28 Changed the `delete` key code from 8 to 46.
 * @modified 2020-10-04 Changed `window` to `globalThis`.
 * @modified 2020-10-04 Added extended JSDoc.
 * @version  1.0.4
 *
 * @file KeyHandler
 * @public
 **/
/**
 * @classdesc A generic key handler.
 *
 * Example
 * =======
 * @example
 *      // Javascript
 *	new KeyHandler( { trackAll : true } )
 *	    .down('enter',function() { console.log('ENTER was hit.'); } )
 *	    .press('enter',function() { console.log('ENTER was pressed.'); } )
 *	    .up('enter',function() { console.log('ENTER was released.'); } )
 *
 *          .down('e',function() { console.log('e was hit. shift is pressed?',keyHandler.isDown('shift')); } )
 *
 *	    .up('windows',function() { console.log('windows was released.'); } )
 *	;
 */
class KeyHandler {
    /**
     * The constructor.
     *
     * @constructor
     * @instance
     * @memberof KeyHandler
     * @param {HTMLElement} options.element (optional) The HTML element to listen on; if null then 'window' will be used.
     * @param {boolean} options.trackAll (optional) Set to true if you want to keep track of _all_ keys (keyStatus).
    **/
    constructor(options) {
        this.downListeners = [];
        this.pressListeners = [];
        this.upListeners = [];
        this.keyStates = {};
        options = options || {};
        this.element = options.element ? options.element : globalThis;
        this.downListeners = [];
        this.pressListeners = [];
        this.upListeners = [];
        this.keyStates = [];
        // This could be made configurable in a later version. It allows to
        // keep track of the key status no matter if there are any listeners
        // on the key or not.
        this.trackAllKeys = options.trackAll || false;
        // Install the listeners
        this.installListeners();
    }
    ;
    /**
     * A helper function to fire key events from this KeyHandler.
     *
     * @param {KeyboardEvent} event - The key event to fire.
     * @param {Array<XKeyListener>} listener - The listeners to fire to.
     */
    fireEvent(event, listeners) {
        let hasListener = false;
        for (var i in listeners) {
            var lis = listeners[i];
            if (lis.keyCode != event.keyCode)
                continue;
            lis.listener(event);
            hasListener = true;
        }
        return hasListener;
    }
    ;
    /**
     * Internal function to fire a new keydown event to all listeners.
     * You should not call this function on your own unless you know what you do.
     *
     * @name fireDownEvent
     * @memberof KeyHandler
     * @instance
     * @private
     * @param {KeyboardEvent} e
     * @param {KeyHandler} handler
     * @return {void}
     */
    fireDownEvent(e, handler) {
        if (handler.fireEvent(e, handler.downListeners) || handler.trackAllKeys) {
            // Down event has listeners. Update key state.
            handler.keyStates[e.keyCode] = 'down';
        }
    }
    ;
    /**
     * Internal function to fire a new keypress event to all listeners.
     * You should not call this function on your own unless you know what you do.
     *
     * @name firePressEvent
     * @memberof KeyHandler
     * @instance
     * @private
     * @param {KeyboardEvent} e
     * @param {KeyHandler} handler
     * @return void
     */
    firePressEvent(e, handler) {
        handler.fireEvent(e, handler.pressListeners);
    }
    ;
    /**
     * Internal function to fire a new keyup event to all listeners.
     * You should not call this function on your own unless you know what you do.
     *
     * @name fireUpEvent
     * @memberof KeyHandler
     * @instance
     * @private
     * @param {KeyboardEvent} e
     * @param {KeyHandler} handler
     * @return {void}
     */
    fireUpEvent(e, handler) {
        if (handler.fireEvent(e, handler.upListeners) || handler.trackAllKeys) {
            // Up event has listeners. Clear key state.
            delete handler.keyStates[e.keyCode];
        }
    }
    ;
    /**
     * Resolve the key/name code.
     */
    static key2code(key) {
        if (typeof key == 'number')
            return key;
        if (typeof key != 'string')
            throw "Unknown key name or key type (should be a string or integer): " + key;
        if (KeyHandler.KEY_CODES[key])
            return KeyHandler.KEY_CODES[key];
        throw "Unknown key (cannot resolve key code): " + key;
    }
    ;
    /**
     * Install the required listeners into the initially passed element.
     *
     * By default the listeners are installed into the root element specified on
     * construction (or 'window').
     */
    installListeners() {
        var _self = this;
        this.element.addEventListener('keydown', this._keyDownListener = (e) => { _self.fireDownEvent(e, _self); });
        this.element.addEventListener('keypress', this._keyPressListener = (e) => { _self.firePressEvent(e, _self); });
        this.element.addEventListener('keyup', this._keyUpListener = (e) => { _self.fireUpEvent(e, _self); });
    }
    ;
    /**
     *  Remove all installed event listeners from the underlying element.
     */
    releaseListeners() {
        this.element.removeEventListener('keydown', this._keyDownListener);
        this.element.removeEventListener('keypress', this._keyPressListener);
        this.element.removeEventListener('keyup', this._keyUpListener);
    }
    ;
    /**
     * Listen for key down. This function allows chaining.
     *
     * Example: new KeyHandler().down('enter',function() {console.log('Enter hit.')});
     *
     * @name down
     * @memberof KeyHandler
     * @instance
     * @param {string|number} key -  Any key identifier, key code or one from the KEY_CODES list.
     * @param {(e:KeyboardEvent)=>void} e -  The callback to be triggered.
     * @return {KeyHandler} this
     */
    down(key, listener) {
        this.downListeners.push({ key: key, keyCode: KeyHandler.key2code(key), listener: listener });
        return this;
    }
    ;
    /**
     * Listen for key press.
     *
     * Example: new KeyHandler().press('enter',function() {console.log('Enter pressed.')});
     *
     * @name press
     * @memberof KeyHandler
     * @instance
     * @param {string|number} key - Any key identifier, key code or one from the KEY_CODES list.
     * @param {(e:KeyboardEvent)=>void} listener - The callback to be triggered.
     * @return {KeyHandler} this
     */
    press(key, listener) {
        this.pressListeners.push({ key: key, keyCode: KeyHandler.key2code(key), listener: listener });
        return this;
    }
    ;
    /**
     * Listen for key up.
     *
     * Example: new KeyHandler().up('enter',function() {console.log('Enter released.')});
     *
     * @name up
     * @memberof KeyHandler
     * @instance
     * @param {string} key - Any key identifier, key code or one from the KEY_CODES list.
     * @param {(e:KeyboardEvent)=>void)} e - The callback to be triggered.
     * @return {KeyHandler} this
     */
    up(key, listener) {
        this.upListeners.push({ key: key, keyCode: KeyHandler.key2code(key), listener: listener });
        return this;
    }
    ;
    /**
     * Check if a specific key is currently held pressed.
     *
     * @param {string|number} key - Any key identifier, key code or one from the KEY_CODES list.
     */
    isDown(key) {
        if (typeof key == 'number')
            return this.keyStates[key] ? true : false;
        else
            return this.keyStates[KeyHandler.key2code(key)] ? true : false;
    }
}
/**
 * Source:
 * https://keycode.info/
 */
KeyHandler.KEY_CODES = {
    'break': 3,
    'backspace': 8,
    // 'delete'	 : 8, // alternate: 46
    'tab': 9,
    'clear': 12,
    'enter': 13,
    'shift': 16,
    'ctrl': 17,
    'alt': 18,
    'pause': 19,
    // 'break'	         : 19,
    'capslock': 20,
    'hangul': 21,
    'hanja': 25,
    'escape': 27,
    'conversion': 28,
    'non-conversion': 29,
    'spacebar': 32,
    'pageup': 33,
    'pagedown': 34,
    'end': 35,
    'home': 36,
    'leftarrow': 37,
    'uparrow': 38,
    'rightarrow': 39,
    'downarrow': 40,
    'select': 41,
    'print': 42,
    'execute': 43,
    'printscreen': 44,
    'insert': 45,
    'delete': 46,
    'help': 47,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    ':': 58,
    'semicolon (firefox)': 59,
    'equals': 59,
    '<': 60,
    'equals (firefox)': 61,
    'ß': 63,
    '@ (firefox)': 64,
    'a': 65,
    'b': 66,
    'c': 67,
    'd': 68,
    'e': 69,
    'f': 70,
    'g': 71,
    'h': 72,
    'i': 73,
    'j': 74,
    'k': 75,
    'l': 76,
    'm': 77,
    'n': 78,
    'o': 79,
    'p': 80,
    'q': 81,
    'r': 82,
    's': 83,
    't': 84,
    'u': 85,
    'v': 86,
    'w': 87,
    'x': 88,
    'y': 89,
    'z': 90,
    'windows': 91,
    'leftcommand': 91,
    'chromebooksearch': 91,
    'rightwindowkey': 92,
    'windowsmenu': 93,
    'rightcommant': 93,
    'sleep': 95,
    'numpad0': 96,
    'numpad1': 97,
    'numpad2': 98,
    'numpad3': 99,
    'numpad4': 100,
    'numpad5': 101,
    'numpad6': 102,
    'numpad7': 103,
    'numpad8': 104,
    'numpad9': 105,
    'multiply': 106,
    'add': 107,
    'numpadperiod': 108,
    'subtract': 109,
    'decimalpoint': 110,
    'divide': 111,
    'f1': 112,
    'f2': 113,
    'f3': 114,
    'f4': 115,
    'f5': 116,
    'f6': 117,
    'f7': 118,
    'f8': 119,
    'f9': 120,
    'f10': 121,
    'f11': 122,
    'f12': 123,
    'f13': 124,
    'f14': 125,
    'f15': 126,
    'f16': 127,
    'f17': 128,
    'f18': 129,
    'f19': 130,
    'f20': 131,
    'f21': 132,
    'f22': 133,
    'f23': 134,
    'f24': 135,
    'numlock': 144,
    'scrolllock': 145,
    '^': 160,
    '!': 161,
    // '؛' 	 : 162 // (arabic semicolon)
    '#': 163,
    '$': 164,
    'ù': 165,
    'pagebackward': 166,
    'pageforward': 167,
    'refresh': 168,
    'closingparen': 169,
    '*': 170,
    '~+*': 171,
    // 'home'	         : 172,
    'minus': 173,
    // 'mute'           : 173,
    // 'unmute'	 : 173,
    'decreasevolumelevel': 174,
    'increasevolumelevel': 175,
    'next': 176,
    'previous': 177,
    'stop': 178,
    'play/pause': 179,
    'email': 180,
    'mute': 181,
    'unmute': 181,
    //'decreasevolumelevel'	182 // firefox
    //'increasevolumelevel'	183 // firefox
    'semicolon': 186,
    'ñ': 186,
    'equal': 187,
    'comma': 188,
    'dash': 189,
    'period': 190,
    'forwardslash': 191,
    'ç': 191,
    'grave accent': 192,
    //'ñ' 192,
    'æ': 192,
    'ö': 192,
    '?': 193,
    '/': 193,
    '°': 193,
    // 'numpadperiod'	 : 194, // chrome
    'openbracket': 219,
    'backslash': 220,
    'closebracket': 221,
    'å': 221,
    'singlequote': 222,
    'ø': 222,
    'ä': 222,
    '`': 223,
    // 'left or right ⌘ key (firefox)'	224
    'altgr': 225,
    // '< /git >, left back slash'	226
    'GNOME Compose Key': 230,
    'XF86Forward': 233,
    'XF86Back': 234,
    'alphanumeric': 240,
    'hiragana': 242,
    'katakana': 242,
    'half-width': 243,
    'full-width': 243,
    'kanji': 244,
    'unlocktrackpad': 251,
    'toggletouchpad': 255
};
//# sourceMappingURL=KeyHandler.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Line.js":
/*!******************************************!*\
  !*** ../plotboilerplate/src/esm/Line.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Line": () => (/* binding */ Line)
/* harmony export */ });
/* harmony import */ var _VertTuple__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./VertTuple */ "../plotboilerplate/src/esm/VertTuple.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * @author   Ikaros Kappler
 * @date     2016-03-12
 * @modified 2018-12-05 Refactored the code from the morley-triangle script.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2019-04-28 Fixed a bug in the Line.sub( Vertex ) function (was not working).
 * @modified 2019-09-02 Added the Line.add( Vertex ) function.
 * @modified 2019-09-02 Added the Line.denominator( Line ) function.
 * @modified 2019-09-02 Added the Line.colinear( Line ) function.
 * @modified 2019-09-02 Fixed an error in the Line.intersection( Line ) function (class Point was renamed to Vertex).
 * @modified 2019-12-15 Added the Line.moveTo(Vertex) function.
 * @modified 2020-03-16 The Line.angle(Line) parameter is now optional. The baseline (x-axis) will be used if not defined.
 * @modified 2020-03-23 Ported to Typescript from JS.
 * @modified 2020-12-04 The `intersection` function returns undefined if both lines are parallel.
 * @version  2.1.3
 *
 * @file Line
 * @public
 **/


/**
 * @classdesc A line consists of two vertices a and b.<br>
 * <br>
 * This is some refactored code from my 'Morley Triangle' test<br>
 *   https://github.com/IkarosKappler/morleys-trisector-theorem
 *
 * @requires Vertex
 */
class Line extends _VertTuple__WEBPACK_IMPORTED_MODULE_0__.VertTuple {
    /**
     * Creates an instance of Line.
     *
     * @constructor
     * @name Line
     * @param {Vertex} a The line's first point.
     * @param {Vertex} b The line's second point.
     **/
    constructor(a, b) {
        super(a, b, (a, b) => new Line(a, b));
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "Line";
    }
    /**
     * Get the intersection if this line and the specified line.
     *
     * @method intersection
     * @param {Line} line The second line.
     * @return {Vertex|undefined} The intersection (may lie outside the end-points) or `undefined` if both lines are parallel.
     * @instance
     * @memberof Line
     **/
    // !!! DO NOT MOVE TO VertTuple
    intersection(line) {
        const denominator = this.denominator(line);
        if (denominator == 0)
            return null;
        let a = this.a.y - line.a.y;
        let b = this.a.x - line.a.x;
        const numerator1 = ((line.b.x - line.a.x) * a) - ((line.b.y - line.a.y) * b);
        const numerator2 = ((this.b.x - this.a.x) * a) - ((this.b.y - this.a.y) * b);
        a = numerator1 / denominator; // NaN if parallel lines
        b = numerator2 / denominator;
        // Catch NaN?
        const x = this.a.x + (a * (this.b.x - this.a.x));
        const y = this.a.y + (a * (this.b.y - this.a.y));
        if (isNaN(a) || isNaN(x) || isNaN(y)) {
            return undefined;
        }
        // if we cast these lines infinitely in both directions, they intersect here:
        return new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(x, y);
    }
    ;
    /**
     * Create an SVG representation of this line.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @method toSVGString
     * @param {options} p - A set of options, like the 'classname' to use
     *                      for the line object.
     * @return {string} The SVG string representing this line.
     * @instance
     * @memberof Line
     **/
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push('<line');
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' x1="' + this.a.x + '"');
        buffer.push(' y1="' + this.a.y + '"');
        buffer.push(' x2="' + this.b.x + '"');
        buffer.push(' y2="' + this.b.y + '"');
        buffer.push(' />');
        return buffer.join('');
    }
    ;
}
//# sourceMappingURL=Line.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/MouseHandler.js":
/*!**************************************************!*\
  !*** ../plotboilerplate/src/esm/MouseHandler.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "XMouseEvent": () => (/* binding */ XMouseEvent),
/* harmony export */   "XWheelEvent": () => (/* binding */ XWheelEvent),
/* harmony export */   "MouseHandler": () => (/* binding */ MouseHandler)
/* harmony export */ });
/**
 * @author   Ikaros Kappler
 * @date     2018-03-19
 * @modified 2018-04-28 Added the param 'wasDragged'.
 * @modified 2018-08-16 Added the param 'dragAmount'.
 * @modified 2018-08-27 Added the param 'element'.
 * @modified 2018-11-11 Changed the scope from a simple global var to a member of window/_context.
 * @modified 2018-11-19 Renamed the 'mousedown' function to 'down' and the 'mouseup' function to 'up'.
 * @modified 2018-11-28 Added the 'wheel' listener.
 * @modified 2018-12-09 Cleaned up some code.
 * @modified 2019-02-10 Cleaned up some more code.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-04-08 Fixed the click event (internally fired a 'mouseup' event) (1.0.10)
 * @modified 2020-04-08 Added the optional 'name' property. (1.0.11)
 * @modified 2020-04-08 The new version always installs internal listenrs to track drag events even
 *                      if there is no external drag listener installed (1.1.0).
 * @modified 2020-10-04 Added extended JSDoc comments.
 * @modified 2020-11-25 Added the `isTouchEvent` param.
 * @modified 2021-01-10 The mouse handler is now also working with SVGElements.
 * @version  1.2.0
 *
 * @file MouseHandler
 * @public
 **/
class XMouseEvent extends MouseEvent {
}
class XWheelEvent extends WheelEvent {
}
/**
 * @classdesc A simple mouse handler for demos.
 * Use to avoid load massive libraries like jQuery.
 *
 * @requires XYCoords
 */
class MouseHandler {
    /**
     * The constructor.
     *
     * Pass the DOM element you want to receive mouse events from.
     *
     * Usage
     * =====
     * @example
     *   // Javascript
     *   new MouseHandler( document.getElementById('mycanvas') )
     *	    .drag( function(e) {
     *		console.log( 'Mouse dragged: ' + JSON.stringify(e) );
     *		if( e.params.leftMouse ) ;
     *		else if( e.params.rightMouse ) ;
     *	    } )
     *	    .move( function(e) {
     *		console.log( 'Mouse moved: ' + JSON.stringify(e.params) );
     *	    } )
     *          .up( function(e) {
     *              console.log( 'Mouse up. Was dragged?', e.params.wasDragged );
     *          } )
     *          .down( function(e) {
     *              console.log( 'Mouse down.' );
     *          } )
     *          .click( function(e) {
     *              console.log( 'Click.' );
     *          } )
     *          .wheel( function(e) {
     *              console.log( 'Wheel. delta='+e.deltaY );
     *          } )
     *
     * @example
     *   // Typescript
     *   new MouseHandler( document.getElementById('mycanvas') )
     *	    .drag( (e:XMouseEvent) => {
     *		console.log( 'Mouse dragged: ' + JSON.stringify(e) );
     *		if( e.params.leftMouse ) ;
     *		else if( e.params.rightMouse ) ;
     *	    } )
     *	    .move( (e:XMouseEvent) => {
     *		console.log( 'Mouse moved: ' + JSON.stringify(e.params) );
     *	    } )
     *          .up( (e:XMouseEvent) => {
     *              console.log( 'Mouse up. Was dragged?', e.params.wasDragged );
     *          } )
     *          .down( (e:XMouseEvent) => {
     *              console.log( 'Mouse down.' );
     *          } )
     *          .click( (e:XMouseEvent) => {
     *              console.log( 'Click.' );
     *          } )
     *          .wheel( (e:XWheelEvent) => {
     *              console.log( 'Wheel. delta='+e.deltaY );
     *          } )
     *
     * @constructor
     * @instance
     * @memberof MouseHandler
     * @param {HTMLElement} element
     **/
    constructor(element, name) {
        this.mouseDownPos = undefined;
        this.mouseDragPos = undefined;
        // TODO: cc
        // private mousePos       : { x:number, y:number }|undefined = undefined;
        this.mouseButton = -1;
        this.listeners = {};
        this.installed = {};
        this.handlers = {};
        // +----------------------------------------------------------------------
        // | Some private vars to store the current mouse/position/button state.
        // +-------------------------------------------------
        this.name = name;
        this.element = element;
        this.mouseDownPos = null;
        this.mouseDragPos = null;
        // this.mousePos     = null;
        this.mouseButton = -1;
        this.listeners = {};
        this.installed = {};
        this.handlers = {};
        // +----------------------------------------------------------------------
        // | Define the internal event handlers.
        // |
        // | They will dispatch the modified event (relative mouse position,
        // | drag offset, ...) to the callbacks.
        // +-------------------------------------------------
        const _self = this;
        this.handlers['mousemove'] = (e) => {
            if (_self.listeners.mousemove)
                _self.listeners.mousemove(_self.mkParams(e, 'mousemove'));
            if (_self.mouseDragPos && _self.listeners.drag)
                _self.listeners.drag(_self.mkParams(e, 'drag'));
            if (_self.mouseDownPos)
                _self.mouseDragPos = _self.relPos(e);
        };
        this.handlers['mouseup'] = (e) => {
            if (_self.listeners.mouseup)
                _self.listeners.mouseup(_self.mkParams(e, 'mouseup'));
            _self.mouseDragPos = undefined;
            _self.mouseDownPos = undefined;
            _self.mouseButton = -1;
        };
        this.handlers['mousedown'] = (e) => {
            _self.mouseDragPos = _self.relPos(e);
            _self.mouseDownPos = _self.relPos(e);
            _self.mouseButton = e.button;
            if (_self.listeners.mousedown)
                _self.listeners.mousedown(_self.mkParams(e, 'mousedown'));
        };
        this.handlers['click'] = (e) => {
            if (_self.listeners.click)
                _self.listeners.click(_self.mkParams(e, 'click'));
        };
        this.handlers['wheel'] = (e) => {
            if (_self.listeners.wheel)
                _self.listeners.wheel(_self.mkParams(e, 'wheel'));
        };
        this.element.addEventListener('mousemove', this.handlers['mousemove']);
        this.element.addEventListener('mouseup', this.handlers['mouseup']);
        this.element.addEventListener('mousedown', this.handlers['mousedown']);
        this.element.addEventListener('click', this.handlers['click']);
        this.element.addEventListener('wheel', this.handlers['wheel']);
    }
    /**
     * Get relative position from the given MouseEvent.
     *
     * @name relPos
     * @memberof MouseHandler
     * @instance
     * @private
     * @param {MouseEvent} e - The mouse event to get the relative position for.
     * @return {XYCoords} The relative mouse coordinates.
     */
    relPos(e) {
        return { x: e.offsetX,
            y: e.offsetY
        };
    }
    ;
    /**
     * Build the extended event params.
     *
     * @name mkParams
     * @memberof MouseHandler
     * @instance
     * @private
     * @param {MouseEvent} e - The mouse event to get the relative position for.
     * @param {string} eventName - The name of the firing event.
     * @return {XMouseEvent}
     */
    mkParams(e, eventName) {
        const rel = this.relPos(e);
        const xEvent = e;
        xEvent.params = {
            element: this.element,
            name: eventName,
            isTouchEvent: false,
            pos: rel,
            button: this.mouseButton,
            leftButton: this.mouseButton == 0,
            middleButton: this.mouseButton == 1,
            rightButton: this.mouseButton == 2,
            mouseDownPos: this.mouseDownPos,
            draggedFrom: this.mouseDragPos,
            wasDragged: (this.mouseDownPos != null && (this.mouseDownPos.x != rel.x || this.mouseDownPos.y != rel.y)),
            dragAmount: (this.mouseDownPos != null ? { x: rel.x - this.mouseDragPos.x, y: rel.y - this.mouseDragPos.y } : { x: 0, y: 0 })
        };
        return xEvent;
    }
    /**
     * Install a new listener.
     * Please note that this mouse handler can only handle one listener per event type.
     *
     * @name listenFor
     * @memberof MouseHandler
     * @instance
     * @private
     * @param {string} eventName - The name of the firing event to listen for.
     * @return {void}
     */
    listenFor(eventName) {
        if (this.installed[eventName])
            return;
        // In the new version 1.1.0 has all internal listeners installed by default.
        this.installed[eventName] = true;
    }
    /**
     * Un-install a new listener.
     *
     * @name listenFor
     * @memberof MouseHandler
     * @instance
     * @private
     * @param {string} eventName - The name of the firing event to unlisten for.
     * @return {void}
     */
    unlistenFor(eventName) {
        if (!this.installed[eventName])
            return;
        // In the new version 1.1.0 has all internal listeners installed by default.
        delete this.installed[eventName];
    }
    /**
     * Installer function to listen for a specific event: mouse-drag.
     * Pass your callbacks here.
     *
     * Note: this support chaining.
     *
     * @name drag
     * @memberof MouseHandler
     * @instance
     * @param {XMouseCallback} callback - The drag-callback to listen for.
     * @return {MouseHandler} this
     */
    drag(callback) {
        if (this.listeners.drag)
            this.throwAlreadyInstalled('drag');
        this.listeners.drag = callback;
        this.listenFor('mousedown');
        this.listenFor('mousemove');
        this.listenFor('mouseup');
        return this;
    }
    ;
    /**
     * Installer function to listen for a specific event: mouse-move.
     * Pass your callbacks here.
     *
     * Note: this support chaining.
     *
     * @name move
     * @memberof MouseHandler
     * @instance
     * @param {XMouseCallback} callback - The move-callback to listen for.
     * @return {MouseHandler} this
     */
    move(callback) {
        if (this.listeners.mousemove)
            this.throwAlreadyInstalled('mousemove');
        this.listenFor('mousemove');
        this.listeners.mousemove = callback;
        return this;
    }
    ;
    /**
     * Installer function to listen for a specific event: mouse-up.
     * Pass your callbacks here.
     *
     * Note: this support chaining.
     *
     * @name up
     * @memberof MouseHandler
     * @instance
     * @param {XMouseCallback} callback - The up-callback to listen for.
     * @return {MouseHandler} this
     */
    up(callback) {
        if (this.listeners.mouseup)
            this.throwAlreadyInstalled('mouseup');
        this.listenFor('mouseup');
        this.listeners.mouseup = callback;
        return this;
    }
    ;
    /**
     * Installer function to listen for a specific event: mouse-down.
     * Pass your callbacks here.
     *
     * Note: this support chaining.
     *
     * @name down
     * @memberof MouseHandler
     * @instance
     * @param {XMouseCallback} callback - The down-callback to listen for.
     * @return {MouseHandler} this
     */
    down(callback) {
        if (this.listeners.mousedown)
            this.throwAlreadyInstalled('mousedown');
        this.listenFor('mousedown');
        this.listeners.mousedown = callback;
        return this;
    }
    ;
    /**
     * Installer function to listen for a specific event: mouse-click.
     * Pass your callbacks here.
     *
     * Note: this support chaining.
     *
     * @name click
     * @memberof MouseHandler
     * @instance
     * @param {XMouseCallback} callback - The click-callback to listen for.
     * @return {MouseHandler} this
     */
    click(callback) {
        if (this.listeners.click)
            this.throwAlreadyInstalled('click');
        this.listenFor('click');
        this.listeners.click = callback;
        return this;
    }
    ;
    /**
     * Installer function to listen for a specific event: mouse-wheel.
     * Pass your callbacks here.
     *
     * Note: this support chaining.
     *
     * @name wheel
     * @memberof MouseHandler
     * @instance
     * @param {XWheelCallback} callback - The wheel-callback to listen for.
     * @return {MouseHandler} this
     */
    wheel(callback) {
        if (this.listeners.wheel)
            this.throwAlreadyInstalled('wheel');
        this.listenFor('wheel');
        this.listeners.wheel = callback;
        return this;
    }
    ;
    /**
     * An internal function to throw events.
     *
     * @name throwAlreadyInstalled
     * @memberof MouseHandler
     * @instance
     * @private
     * @param {string} name - The name of the event.
     * @return {void}
     */
    throwAlreadyInstalled(name) {
        throw `This MouseHandler already has a '${name}' callback. To keep the code simple there is only room for one.`;
    }
    ;
    /**
     * Call this when your work is done.
     *
     * The function will un-install all event listeners.
     *
     * @name destroy
     * @memberof MouseHandler
     * @instance
     * @private
     * @return {void}
     */
    destroy() {
        this.unlistenFor('mousedown');
        this.unlistenFor('mousemove');
        this.unlistenFor('moseup');
        this.unlistenFor('click');
        this.unlistenFor('wheel');
        this.element.removeEventListener('mousemove', this.handlers['mousemove']);
        this.element.removeEventListener('mouseup', this.handlers['mousedown']);
        this.element.removeEventListener('mousedown', this.handlers['mousedown']);
        this.element.removeEventListener('click', this.handlers['click']);
        this.element.removeEventListener('wheel', this.handlers['wheel']);
    }
}
//# sourceMappingURL=MouseHandler.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/PBImage.js":
/*!*********************************************!*\
  !*** ../plotboilerplate/src/esm/PBImage.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PBImage": () => (/* binding */ PBImage)
/* harmony export */ });
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/**
 * @author   Ikaros Kappler
 * @date     2019-01-30
 * @modified 2019-03-23 Added JSDoc tags.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified 2021-01-20 Added UID.
 * @version 1.1.0
 *
 * @file PBImage
 * @fileoverview As native Image objects have only a position and with
 *               and height thei are not suitable for UI dragging interfaces.
 * @public
 **/

/**
 * @classdesc A wrapper for image objects. Has an upper left and a lower right corner point.
 *
 * @requires Vertex
 * @requires SVGSerializable
 * @requires UID
 * @requires UIDGenerator
 */
class PBImage {
    /**
     * The constructor.
     *
     * @constructor
     * @name PBImage
     * @param {Image} image - The actual image.
     * @param {Vertex} upperLeft - The upper left corner.
     * @param {Vertex} lowerRight - The lower right corner.
     **/
    constructor(image, upperLeft, lowerRight) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "PBImage";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_0__.UIDGenerator.next();
        this.image = image;
        this.upperLeft = upperLeft;
        this.lowerRight = lowerRight;
    }
    ;
    /**
     * Convert this vertex to SVG code.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} A string representing the SVG code for this vertex.
     * @instance
     * @memberof PBImage
     **/
    toSVGString(options) {
        console.warn("PBImage is not yet SVG serializable. Returning empty SVG string.");
        return "";
    }
    ;
}
//# sourceMappingURL=PBImage.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/PlotBoilerplate.js":
/*!*****************************************************!*\
  !*** ../plotboilerplate/src/esm/PlotBoilerplate.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PlotBoilerplate": () => (/* binding */ PlotBoilerplate),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var alloyfinger_typescript__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alloyfinger-typescript */ "../plotboilerplate/node_modules/alloyfinger-typescript/src/esm/index.js");
/* harmony import */ var _draw__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./draw */ "../plotboilerplate/src/esm/draw.js");
/* harmony import */ var _drawgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./drawgl */ "../plotboilerplate/src/esm/drawgl.js");
/* harmony import */ var _drawutilssvg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./drawutilssvg */ "../plotboilerplate/src/esm/drawutilssvg.js");
/* harmony import */ var _BezierPath__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./BezierPath */ "../plotboilerplate/src/esm/BezierPath.js");
/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Bounds */ "../plotboilerplate/src/esm/Bounds.js");
/* harmony import */ var _Circle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Circle */ "../plotboilerplate/src/esm/Circle.js");
/* harmony import */ var _CircleSector__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./CircleSector */ "../plotboilerplate/src/esm/CircleSector.js");
/* harmony import */ var _Grid__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Grid */ "../plotboilerplate/src/esm/Grid.js");
/* harmony import */ var _KeyHandler__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./KeyHandler */ "../plotboilerplate/src/esm/KeyHandler.js");
/* harmony import */ var _Line__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Line */ "../plotboilerplate/src/esm/Line.js");
/* harmony import */ var _MouseHandler__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./MouseHandler */ "../plotboilerplate/src/esm/MouseHandler.js");
/* harmony import */ var _PBImage__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./PBImage */ "../plotboilerplate/src/esm/PBImage.js");
/* harmony import */ var _Polygon__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./Polygon */ "../plotboilerplate/src/esm/Polygon.js");
/* harmony import */ var _Triangle__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Triangle */ "../plotboilerplate/src/esm/Triangle.js");
/* harmony import */ var _VEllipse__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./VEllipse */ "../plotboilerplate/src/esm/VEllipse.js");
/* harmony import */ var _VEllipseSector__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./VEllipseSector */ "../plotboilerplate/src/esm/VEllipseSector.js");
/* harmony import */ var _Vector__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./Vector */ "../plotboilerplate/src/esm/Vector.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/* harmony import */ var _VertexAttr__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./VertexAttr */ "../plotboilerplate/src/esm/VertexAttr.js");
/**
 * @author   Ikaros Kappler
 * @date     2018-10-23
 * @modified 2018-11-19 Added multi-select and multi-drag.
 * @modified 2018-12-04 Added basic SVG export.
 * @modified 2018-12-09 Extended the constructor (canvas).
 * @modified 2018-12-18 Added the config.redrawOnResize param.
 * @modified 2018-12-18 Added the config.defaultCanvas{Width,Height} params.
 * @modified 2018-12-19 Added CSS scaling.
 * @modified 2018-12-28 Removed the unused 'drawLabel' param. Added the 'enableMouse' and 'enableKeys' params.
 * @modified 2018-12-29 Added the 'drawOrigin' param.
 * @modified 2018-12-29 Renamed the 'autoCenterOffset' param to 'autoAdjustOffset'. Added the params 'offsetAdjustXPercent' and 'offsetAdjustYPercent'.
 * @modified 2019-01-14 Added params 'drawBezierHandleLines' and 'drawBezierHandlePoints'. Added the 'redraw' praam to the add() function.
 * @modified 2019-01-16 Added params 'drawHandleLines' and 'drawHandlePoints'. Added the new params to the dat.gui interface.
 * @modified 2019-01-30 Added the 'Vector' type (extending the Line class).
 * @modified 2019-01-30 Added the 'PBImage' type (a wrapper for images).
 * @modified 2019-02-02 Added the 'canvasWidthFactor' and 'canvasHeightFactor' params.
 * @modified 2019-02-03 Removed the drawBackgroundImage() function, with had no purpose at all. Just add an image to the drawables-list.
 * @modified 2019-02-06 Vertices (instace of Vertex) can now be added. Added the 'draggable' attribute to the vertex attributes.
 * @modified 2019-02-10 Fixed a draggable-bug in PBImage handling (scaling was not possible).
 * @modified 2019-02-10 Added the 'enableTouch' option (default is true).
 * @modified 2019-02-14 Added the console for debugging (setConsole(object)).
 * @modified 2019-02-19 Added two new constants: DEFAULT_CLICK_TOLERANCE and DEFAULT_TOUCH_TOLERANCE.
 * @modified 2019-02-19 Added the second param to the locatePointNear(Vertex,Number) function.
 * @modified 2019-02-20 Removed the 'loadFile' entry from the GUI as it was experimental and never in use.
 * @modified 2019-02-23 Removed the 'rebuild' function as it had no purpose.
 * @modified 2019-02-23 Added scaling of the click-/touch-tolerance with the CSS scale.
 * @modified 2019-03-23 Added JSDoc tags. Changed the default value of config.drawOrigin to false.
 * @modified 2019-04-03 Fixed the touch-drag position detection for canvas elements that are not located at document position (0,0).
 * @modified 2019-04-03 Tweaked the fit-to-parent function to work with paddings and borders.
 * @modified 2019-04-28 Added the preClear callback param (called before the canvas was cleared on redraw and before any elements are drawn).
 * @modified 2019-09-18 Added basics for WebGL support (strictly experimental).
 * @modified 2019-10-03 Added the .beginDrawCycle call in the redraw function.
 * @modified 2019-11-06 Added fetch.num, fetch.val, fetch.bool, fetch.func functions.
 * @modified 2019-11-13 Fixed an issue with the mouse-sensitive area around vertices (were affected by zoom).
 * @modified 2019-11-13 Added the 'enableMouseWheel' param.
 * @modified 2019-11-18 Added the Triangle class as a regular drawable element.
 * @modified 2019-11-18 The add function now works with arrays, too.
 * @modified 2019-11-18 Added the _handleColor helper function to determine the render color of non-draggable vertices.
 * @modified 2019-11-19 Fixed a bug in the resizeCanvas function; retina resolution was not possible.
 * @modified 2019-12-04 Added relative positioned zooming.
 * @modified 2019-12-04 Added offsetX and offsetY params.
 * @modified 2019-12-04 Added an 'Set to fullsize retina' button to the GUI config.
 * @modified 2019-12-07 Added the drawConfig for lines, polygons, ellipse, triangles, bezier curves and image control lines.
 * @modified 2019-12-08 Fixed a css scale bug in the viewport() function.
 * @modified 2019-12-08 Added the drawconfig UI panel (line colors and line widths).
 * @modified 2020-02-06 Added handling for the end- and end-control-points of non-cirular Bézier paths (was still missing).
 * @modified 2020-02-06 Fixed a drag-amount bug in the move handling of end points of Bezier paths (control points was not properly moved when non circular).
 * @modified 2020-03-28 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-03-29 Fixed the enableSVGExport flag (read enableEport before).
 * @modified 2020-05-09 Included the Cirlcle class.
 * @modified 2020-06-22 Added the rasterScaleX and rasterScaleY config params.
 * @modified 2020-06-03 Fixed the selectedVerticesOnPolyon(Polygon) function: non-selectable vertices were selected too, before.
 * @modified 2020-07-06 Replacing Touchy.js by AlloyFinger.js
 * @modified 2020-07-27 Added the getVertexNear(XYCoords,number) function
 * @modified 2020-07-27 Extended the remove(Drawable) function: vertices are now removed, too.
 * @modified 2020-07-28 Added PlotBoilerplate.revertMousePosition(number,number) –  the inverse function of transformMousePosition(...).
 * @modified 2020-07-31 Added PlotBoilerplate.getDraggedElementCount() to check wether any elements are currently being dragged.
 * @modified 2020-08-19 Added the VertexAttributes.visible attribute to make vertices invisible.
 * @modified 2020-11-17 Added pure click handling (no dragEnd and !wasMoved jiggliny any more) to the PlotBoilerplate.
 * @modified 2020-12-11 Added the `removeAll(boolean)` function.
 * @modified 2020-12-17 Added the `CircleSector` drawable.
 * @modified 2021-01-04 Avoiding multiple redraw call on adding multiple Drawables (array).
 * @modified 2021-01-08 Added param `draw:DraLib<void>` to the methods `drawVertices`, `drawGrid` and `drawSelectPolygon`.
 * @modified 2021-01-08 Added the customizable `drawAll(...)` function.
 * @modified 2021-01-09 Added the `drawDrawable(...)` function.
 * @modified 2021-01-10 Added the `eventCatcher` element (used to track mouse events on SVGs).
 * @modified 2021-01-26 Fixed SVG resizing.
 * @modified 2021-01-26 Replaced the old SVGBuilder by the new `drawutilssvg` library.
 * @modified 2021-02-08 Fixed a lot of es2015 compatibility issues.
 * @modified 2021-02-18 Adding `adjustOffset(boolean)` function.
 * @modified 2021-03-01 Updated the `PlotBoilerplate.draw(...)` function: ellipses are now rotate-able.
 * @modified 2021-03-03 Added the `VEllipseSector` drawable.
 * @modified 2021-03-29 Clearing `currentClassName` and `currentId` after drawing each drawable.
 * @modified 2021-04-25 Extending `remove` to accept arrays of drawables.
 * @version  1.14.0
 *
 * @file PlotBoilerplate
 * @fileoverview The main class.
 * @public
 **/
var _a;




















/**
 * @classdesc The main class of the PlotBoilerplate.
 *
 * @requires Vertex
 * @requires Line
 * @requires Vector
 * @requires Polygon
 * @requires PBImage
 * @requires VEllipse
 * @requires Circle
 * @requires MouseHandler
 * @requires KeyHandler
 * @requires VertexAttr
 * @requires CubicBezierCurve
 * @requires BezierPath
 * @requires Drawable
 * @requires DrawConfig
 * @requires IHooks
 * @requires PBParams
 * @requires Triangle
 * @requires drawutils
 * @requires drawutilsgl
 * @requires SVGSerializable
 * @requires XYCoords
 * @requires XYDimension
 */
class PlotBoilerplate {
    /**
     * The constructor.
     *
     * @constructor
     * @name PlotBoilerplate
     * @public
     * @param {object} config={} - The configuration.
     * @param {HTMLCanvasElement} config.canvas - Your canvas element in the DOM (required).
     * @param {boolean=} [config.fullSize=true] - If set to true the canvas will gain full window size.
     * @param {boolean=} [config.fitToParent=true] - If set to true the canvas will gain the size of its parent container (overrides fullSize).
     * @param {number=}  [config.scaleX=1.0] - The initial x-zoom. Default is 1.0.
     * @param {number=}  [config.scaleY=1.0] - The initial y-zoom. Default is 1.0.
     * @param {number=}  [config.offsetX=1.0] - The initial x-offset. Default is 0.0. Note that autoAdjustOffset=true overrides these values.
     * @param {number=}  [config.offsetY=1.0] - The initial y-offset. Default is 0.0. Note that autoAdjustOffset=true overrides these values.
     * @param {boolean=} [config.rasterGrid=true] - If set to true the background grid will be drawn rastered.
     * @param {boolean=} [config.rasterScaleX=1.0] - Define the default horizontal raster scale (default=1.0).
     * @param {boolean=} [config.rasterScaleY=1.0] - Define the default vertical raster scale (default=1.0).
     * @param {number=}  [config.rasterAdjustFactor=1.0] - The exponential limit for wrapping down the grid. (2.0 means: halve the grid each 2.0*n zoom step).
     * @param {boolean=} [config.drawOrigin=false] - Draw a crosshair at (0,0).
     * @param {boolean=} [config.autoAdjustOffset=true] -  When set to true then the origin of the XY plane will
     *                         be re-adjusted automatically (see the params
     *                         offsetAdjust{X,Y}Percent for more).
     * @param {number=}  [config.offsetAdjustXPercent=50] - The x-fallback position for the origin after
     *                         resizing the canvas.
     * @param {number=}  [config.offsetAdjustYPercent=50] - The y-fallback position for the origin after
     *                         resizing the canvas.
     * @param {number=}  [config.defaultCanvasWidth=1024] - The canvas size fallback (width) if no automatic resizing
     *                         is switched on.
     * @param {number=}  [config.defaultCanvasHeight=768] - The canvas size fallback (height) if no automatic resizing
     *                         is switched on.
     * @param {number=}  [config.canvasWidthFactor=1.0] - Scaling factor (width) upon the canvas size.
     *                         In combination with cssScale{X,Y} this can be used to obtain
     *                         sub pixel resolutions for retina displays.
     * @param {number=}  [config.canvasHeightFactor=1.0] - Scaling factor (height) upon the canvas size.
     *                         In combination with cssScale{X,Y} this can be used to obtain
     *                         sub pixel resolutions for retina displays.
     * @param {number=}  [config.cssScaleX=1.0] - Visually resize the canvas (horizontally) using CSS transforms (scale).
     * @param {number=}  [config.cssScaleY=1.0] - Visually resize the canvas (vertically) using CSS transforms (scale).
     * @param {boolan=}  [config.cssUniformScale=true] - CSS scale x and y obtaining aspect ratio.
     * @param {boolean=} [config.autoDetectRetina=true] - When set to true (default) the canvas will try to use the display's pixel ratio.
     * @param {string=}  [config.backgroundColor=#ffffff] - The backround color.
     * @param {boolean=} [config.redrawOnResize=true] - Switch auto-redrawing on resize on/off (some applications
     *                         might want to prevent automatic redrawing to avoid data loss from the draw buffer).
     * @param {boolean=} [config.drawBezierHandleLines=true] - Indicates if Bézier curve handles should be drawn (used for
     *                         editors, no required in pure visualizations).
     * @param {boolean=} [config.drawBezierHandlePoints=true] - Indicates if Bézier curve handle points should be drawn.
     * @param {function=} [config.preClear=null] - A callback function that will be triggered just before the
     *                         draw function clears the canvas (before anything else was drawn).
     * @param {function=} [config.preDraw=null] - A callback function that will be triggered just before the draw
     *                         function starts.
     * @param {function=} [config.postDraw=null] - A callback function that will be triggered right after the drawing
     *                         process finished.
     * @param {boolean=} [config.enableMouse=true] - Indicates if the application should handle mouse events for you.
     * @param {boolean=} [config.enableTouch=true] - Indicates if the application should handle touch events for you.
     * @param {boolean=} [config.enableKeys=true] - Indicates if the application should handle key events for you.
     * @param {boolean=} [config.enableMouseWheel=true] - Indicates if the application should handle mouse wheel events for you.
     * @param {boolean=} [config.enableGL=false] - Indicates if the application should use the experimental WebGL features (not recommended).
     * @param {boolean=} [config.enableSVGExport=true] - Indicates if the SVG export should be enabled (default is true).
     *                                                   Note that changes from the postDraw hook might not be visible in the export.
     */
    constructor(config) {
        /**
         * A discrete timestamp to identify single render cycles.
         * Note that using system time milliseconds is not a safe way to identify render frames, as on modern powerful machines
         * multiple frames might be rendered within each millisecond.
         * @member {number}
         * @memberof plotboilerplate
         * @instance
         * @private
         */
        this.renderTime = 0;
        // This should be in some static block ...
        _VertexAttr__WEBPACK_IMPORTED_MODULE_19__.VertexAttr.model = {
            bezierAutoAdjust: false,
            renderTime: 0,
            selectable: true,
            isSelected: false,
            draggable: true,
            visible: true
        };
        if (typeof config.canvas == "undefined") {
            throw "No canvas specified.";
        }
        /**
         * A global config that's attached to the dat.gui control interface.
         *
         * @member {Object}
         * @memberof PlotBoilerplate
         * @instance
         */
        const f = PlotBoilerplate.utils.fetch;
        this.config = {
            canvas: config.canvas,
            fullSize: f.val(config, "fullSize", true),
            fitToParent: f.bool(config, "fitToParent", true),
            scaleX: f.num(config, "scaleX", 1.0),
            scaleY: f.num(config, "scaleY", 1.0),
            offsetX: f.num(config, "offsetX", 0.0),
            offsetY: f.num(config, "offsetY", 0.0),
            rasterGrid: f.bool(config, "rasterGrid", true),
            rasterScaleX: f.num(config, "rasterScaleX", 1.0),
            rasterScaleY: f.num(config, "rasterScaleY", 1.0),
            rasterAdjustFactor: f.num(config, "rasterAdjustdFactror", 2.0),
            drawOrigin: f.bool(config, "drawOrigin", false),
            autoAdjustOffset: f.val(config, "autoAdjustOffset", true),
            offsetAdjustXPercent: f.num(config, "offsetAdjustXPercent", 50),
            offsetAdjustYPercent: f.num(config, "offsetAdjustYPercent", 50),
            backgroundColor: config.backgroundColor || "#ffffff",
            redrawOnResize: f.bool(config, "redrawOnResize", true),
            defaultCanvasWidth: f.num(config, "defaultCanvasWidth", PlotBoilerplate.DEFAULT_CANVAS_WIDTH),
            defaultCanvasHeight: f.num(config, "defaultCanvasHeight", PlotBoilerplate.DEFAULT_CANVAS_HEIGHT),
            canvasWidthFactor: f.num(config, "canvasWidthFactor", 1.0),
            canvasHeightFactor: f.num(config, "canvasHeightFactor", 1.0),
            cssScaleX: f.num(config, "cssScaleX", 1.0),
            cssScaleY: f.num(config, "cssScaleY", 1.0),
            cssUniformScale: f.bool(config, "cssUniformScale", true),
            saveFile: () => {
                _self.hooks.saveFile(_self);
            },
            setToRetina: () => {
                _self._setToRetina();
            },
            autoDetectRetina: f.bool(config, "autoDetectRetina", true),
            enableSVGExport: f.bool(config, "enableSVGExport", true),
            // Listeners/observers
            preClear: f.func(config, "preClear", null),
            preDraw: f.func(config, "preDraw", null),
            postDraw: f.func(config, "postDraw", null),
            // Interaction
            enableMouse: f.bool(config, "enableMouse", true),
            enableTouch: f.bool(config, "enableTouch", true),
            enableKeys: f.bool(config, "enableKeys", true),
            enableMouseWheel: f.bool(config, "enableMouseWheel", true),
            // Experimental (and unfinished)
            enableGL: f.bool(config, "enableGL", false)
        }; // END confog
        /**
         * Configuration for drawing things.
         *
         * @member {Object}
         * @memberof PlotBoilerplate
         * @instance
         */
        this.drawConfig = {
            drawVertices: true,
            drawBezierHandleLines: f.bool(config, "drawBezierHandleLines", true),
            drawBezierHandlePoints: f.bool(config, "drawBezierHandlePoints", true),
            drawHandleLines: f.bool(config, "drawHandleLines", true),
            drawHandlePoints: f.bool(config, "drawHandlePoints", true),
            drawGrid: f.bool(config, "drawGrid", true),
            bezier: {
                color: "#00a822",
                lineWidth: 2,
                handleLine: {
                    color: "rgba(180,180,180,0.5)",
                    lineWidth: 1
                },
                pathVertex: {
                    color: "#B400FF",
                    lineWidth: 1,
                    fill: true
                },
                controlVertex: {
                    color: "#B8D438",
                    lineWidth: 1,
                    fill: true
                }
            },
            polygon: {
                color: "#0022a8",
                lineWidth: 1
            },
            triangle: {
                color: "#6600ff",
                lineWidth: 1
            },
            ellipse: {
                color: "#2222a8",
                lineWidth: 1
            },
            ellipseSector: {
                color: "#a822a8",
                lineWidth: 2
            },
            circle: {
                color: "#22a8a8",
                lineWidth: 2
            },
            circleSector: {
                color: "#2280a8",
                lineWidth: 1
            },
            vertex: {
                color: "#a8a8a8",
                lineWidth: 1
            },
            selectedVertex: {
                color: "#c08000",
                lineWidth: 2
            },
            line: {
                color: "#a844a8",
                lineWidth: 1
            },
            vector: {
                color: "#ff44a8",
                lineWidth: 1
            },
            image: {
                color: "#a8a8a8",
                lineWidth: 1
            }
        }; // END drawConfig
        // +---------------------------------------------------------------------------------
        // | Object members.
        // +-------------------------------
        this.grid = new _Grid__WEBPACK_IMPORTED_MODULE_8__.Grid(new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(0, 0), new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(50, 50));
        this.canvasSize = { width: PlotBoilerplate.DEFAULT_CANVAS_WIDTH, height: PlotBoilerplate.DEFAULT_CANVAS_HEIGHT };
        const canvasElement = typeof config.canvas == "string" ? document.querySelector(config.canvas) : config.canvas;
        // Which renderer to use: Canvas2D, WebGL (experimental) or SVG?
        if (canvasElement.tagName.toLowerCase() === "canvas") {
            this.canvas = canvasElement;
            this.eventCatcher = this.canvas;
            if (this.config.enableGL && typeof _drawgl__WEBPACK_IMPORTED_MODULE_2__.drawutilsgl === "undefined") {
                console.warn(`Cannot use webgl. Package was compiled without experimental gl support. Please use plotboilerplate-glsupport.min.js instead.`);
                console.warn(`Disabling GL and falling back to Canvas2D.`);
                this.config.enableGL = false;
            }
            if (this.config.enableGL) {
                const ctx = this.canvas.getContext("webgl"); // webgl-experimental?
                this.draw = new _drawgl__WEBPACK_IMPORTED_MODULE_2__.drawutilsgl(ctx, false);
                // PROBLEM: same instance of fill and draw when using WebGL.
                //          Shader program cannot be duplicated on the same context.
                this.fill = this.draw.copyInstance(true);
                console.warn("Initialized with experimental mode enableGL=true. Note that this is not yet fully implemented.");
            }
            else {
                const ctx = this.canvas.getContext("2d");
                this.draw = new _draw__WEBPACK_IMPORTED_MODULE_1__.drawutils(ctx, false);
                this.fill = new _draw__WEBPACK_IMPORTED_MODULE_1__.drawutils(ctx, true);
            }
        }
        else if (canvasElement.tagName.toLowerCase() === "svg") {
            if (typeof _drawutilssvg__WEBPACK_IMPORTED_MODULE_3__.drawutilssvg === "undefined")
                throw `The svg draw library is not yet integrated part of PlotBoilerplate. Please include ./src/js/utils/helpers/drawutils.svg into your document.`;
            this.canvas = canvasElement;
            this.draw = new _drawutilssvg__WEBPACK_IMPORTED_MODULE_3__.drawutilssvg(this.canvas, new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(), // offset
            new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(), // scale
            this.canvasSize, false, // fillShapes=false
            this.drawConfig, false // isSecondary=false
            );
            this.fill = this.draw.copyInstance(true); // fillShapes=true
            if (this.canvas.parentElement) {
                this.eventCatcher = document.createElement("div");
                this.eventCatcher.style.position = "absolute";
                this.eventCatcher.style.left = "0";
                this.eventCatcher.style.top = "0";
                this.eventCatcher.style.cursor = "pointer";
                this.canvas.parentElement.style.position = "relative";
                this.canvas.parentElement.appendChild(this.eventCatcher);
            }
            else {
                this.eventCatcher = document.body;
            }
        }
        else {
            throw "Element is neither a canvas nor an svg element.";
        }
        this.draw.scale.set(this.config.scaleX, this.config.scaleY);
        this.fill.scale.set(this.config.scaleX, this.config.scaleY);
        this.vertices = [];
        this.selectPolygon = null;
        this.draggedElements = [];
        this.drawables = [];
        this.console = console;
        this.hooks = {
            // This is changable from the outside
            saveFile: PlotBoilerplate._saveFile
        };
        var _self = this;
        globalThis.addEventListener("resize", () => _self.resizeCanvas());
        this.resizeCanvas();
        if (config.autoDetectRetina) {
            this._setToRetina();
        }
        this.installInputListeners();
        // Apply the configured CSS scale.
        this.updateCSSscale();
        // Init
        this.redraw();
        // Gain focus
        this.canvas.focus();
    } // END constructor
    /**
     * This function opens a save-as file dialog and – once an output file is
     * selected – stores the current canvas contents as an SVG image.
     *
     * It is the default hook for saving files and can be overwritten.
     *
     * @method _saveFile
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     * @private
     **/
    static _saveFile(pb) {
        // Create fake SVG node
        const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // Draw everything to fake node.
        var tosvgDraw = new _drawutilssvg__WEBPACK_IMPORTED_MODULE_3__.drawutilssvg(svgNode, pb.draw.offset, pb.draw.scale, pb.canvasSize, false, // fillShapes=false
        pb.drawConfig);
        var tosvgFill = tosvgDraw.copyInstance(true); // fillShapes=true
        tosvgDraw.beginDrawCycle(0);
        tosvgFill.beginDrawCycle(0);
        if (pb.config.preClear)
            pb.config.preClear();
        tosvgDraw.clear(pb.config.backgroundColor);
        if (pb.config.preDraw)
            pb.config.preDraw(tosvgDraw, tosvgFill);
        pb.drawAll(0, tosvgDraw, tosvgFill);
        pb.drawVertices(0, tosvgDraw);
        if (pb.config.postDraw)
            pb.config.postDraw(tosvgDraw, tosvgFill);
        tosvgDraw.endDrawCycle(0);
        tosvgFill.endDrawCycle(0);
        // Full support in all browsers \o/
        //    https://caniuse.com/xml-serializer
        var serializer = new XMLSerializer();
        var svgCode = serializer.serializeToString(svgNode);
        var blob = new Blob([svgCode], { type: "image/svg;charset=utf-8" });
        // See documentation for FileSaver.js for usage.
        //    https://github.com/eligrey/FileSaver.js
        if (typeof globalThis["saveAs"] != "function")
            throw "Cannot save file; did you load the ./utils/savefile helper function and the eligrey/SaveFile library?";
        var _saveAs = globalThis["saveAs"];
        _saveAs(blob, "plotboilerplate.svg");
    }
    /**
     * This function sets the canvas resolution to factor 2.0 (or the preferred pixel ratio of your device) for retina displays.
     * Please not that in non-GL mode this might result in very slow rendering as the canvas buffer size may increase.
     *
     * @method _setToRetina
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     * @private
     **/
    _setToRetina() {
        this.config.autoDetectRetina = true;
        const pixelRatio = globalThis.devicePixelRatio || 1;
        this.config.cssScaleX = this.config.cssScaleY = 1.0 / pixelRatio;
        this.config.canvasWidthFactor = this.config.canvasHeightFactor = pixelRatio;
        this.resizeCanvas();
        this.updateCSSscale();
    }
    /**
     * Set the current zoom and draw offset to fit the given bounds.
     *
     * This method currently restores the aspect zoom ratio.
     *
     **/
    fitToView(bounds) {
        const canvasCenter = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(this.canvasSize.width / 2.0, this.canvasSize.height / 2.0);
        const canvasRatio = this.canvasSize.width / this.canvasSize.height;
        const ratio = bounds.width / bounds.height;
        // Find the new draw offset
        const center = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(bounds.max.x - bounds.width / 2.0, bounds.max.y - bounds.height / 2.0)
            .inv()
            .addXY(this.canvasSize.width / 2.0, this.canvasSize.height / 2.0);
        this.setOffset(center);
        if (canvasRatio < ratio) {
            const newUniformZoom = this.canvasSize.width / bounds.width;
            this.setZoom(newUniformZoom, newUniformZoom, canvasCenter);
        }
        else {
            const newUniformZoom = this.canvasSize.height / bounds.height;
            this.setZoom(newUniformZoom, newUniformZoom, canvasCenter);
        }
        this.redraw();
    }
    /**
     * Set the console for this instance.
     *
     * @method setConsole
     * @param {Console} con - The new console object (default is globalThis.console).
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    setConsole(con) {
        this.console = con;
    }
    /**
     * Update the CSS scale for the canvas depending onf the cssScale{X,Y} settings.<br>
     * <br>
     * This function is usually only used inernally.
     *
     * @method updateCSSscale
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     * @private
     **/
    updateCSSscale() {
        if (this.config.cssUniformScale) {
            PlotBoilerplate.utils.setCSSscale(this.canvas, this.config.cssScaleX, this.config.cssScaleX);
        }
        else {
            PlotBoilerplate.utils.setCSSscale(this.canvas, this.config.cssScaleX, this.config.cssScaleY);
        }
    }
    /**
     * Add a drawable object.<br>
     * <br>
     * This must be either:<br>
     * <pre>
     *  * a Vertex
     *  * a Line
     *  * a Vector
     *  * a VEllipse
     *  * a VEllipseSector
     *  * a Circle
     *  * a Polygon
     *  * a Triangle
     *  * a BezierPath
     *  * a BPImage
     * </pre>
     *
     * @param {Drawable|Drawable[]} drawable - The drawable (of one of the allowed class instance) to add.
     * @param {boolean} [redraw=true] - If true the function will trigger redraw after the drawable(s) was/were added.
     * @method add
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    add(drawable, redraw) {
        if (Array.isArray(drawable)) {
            const arr = drawable;
            // for( var i in arr )
            for (var i = 0; i < arr.length; i++) {
                this.add(arr[i], false);
            }
        }
        else if (drawable instanceof _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex) {
            this.drawables.push(drawable);
            this.vertices.push(drawable);
        }
        else if (drawable instanceof _Line__WEBPACK_IMPORTED_MODULE_10__.Line) {
            // Add some lines
            this.drawables.push(drawable);
            this.vertices.push(drawable.a);
            this.vertices.push(drawable.b);
        }
        else if (drawable instanceof _Vector__WEBPACK_IMPORTED_MODULE_17__.Vector) {
            this.drawables.push(drawable);
            this.vertices.push(drawable.a);
            this.vertices.push(drawable.b);
        }
        else if (drawable instanceof _VEllipse__WEBPACK_IMPORTED_MODULE_15__.VEllipse) {
            this.vertices.push(drawable.center);
            this.vertices.push(drawable.axis);
            this.drawables.push(drawable);
            drawable.center.listeners.addDragListener((event) => {
                drawable.axis.add(event.params.dragAmount);
            });
        }
        else if (drawable instanceof _VEllipseSector__WEBPACK_IMPORTED_MODULE_16__.VEllipseSector) {
            this.vertices.push(drawable.ellipse.center);
            this.vertices.push(drawable.ellipse.axis);
            this.drawables.push(drawable);
            drawable.ellipse.center.listeners.addDragListener((event) => {
                drawable.ellipse.axis.add(event.params.dragAmount);
            });
        }
        else if (drawable instanceof _Circle__WEBPACK_IMPORTED_MODULE_6__.Circle) {
            this.vertices.push(drawable.center);
            this.drawables.push(drawable);
        }
        else if (drawable instanceof _CircleSector__WEBPACK_IMPORTED_MODULE_7__.CircleSector) {
            this.vertices.push(drawable.circle.center);
            this.drawables.push(drawable);
        }
        else if (drawable instanceof _Polygon__WEBPACK_IMPORTED_MODULE_13__.Polygon) {
            this.drawables.push(drawable);
            // for( var i in drawable.vertices )
            for (var i = 0; i < drawable.vertices.length; i++)
                this.vertices.push(drawable.vertices[i]);
        }
        else if (drawable instanceof _Triangle__WEBPACK_IMPORTED_MODULE_14__.Triangle) {
            this.drawables.push(drawable);
            this.vertices.push(drawable.a);
            this.vertices.push(drawable.b);
            this.vertices.push(drawable.c);
        }
        else if (drawable instanceof _BezierPath__WEBPACK_IMPORTED_MODULE_4__.BezierPath) {
            this.drawables.push(drawable);
            const bezierPath = drawable;
            for (var i = 0; i < bezierPath.bezierCurves.length; i++) {
                if (!drawable.adjustCircular && i == 0)
                    this.vertices.push(bezierPath.bezierCurves[i].startPoint);
                this.vertices.push(bezierPath.bezierCurves[i].endPoint);
                this.vertices.push(bezierPath.bezierCurves[i].startControlPoint);
                this.vertices.push(bezierPath.bezierCurves[i].endControlPoint);
                bezierPath.bezierCurves[i].startControlPoint.attr.selectable = false;
                bezierPath.bezierCurves[i].endControlPoint.attr.selectable = false;
            }
            PlotBoilerplate.utils.enableBezierPathAutoAdjust(drawable);
        }
        else if (drawable instanceof _PBImage__WEBPACK_IMPORTED_MODULE_12__.PBImage) {
            this.vertices.push(drawable.upperLeft);
            this.vertices.push(drawable.lowerRight);
            this.drawables.push(drawable);
            // Todo: think about a IDragEvent interface
            drawable.upperLeft.listeners.addDragListener((e) => {
                drawable.lowerRight.add(e.params.dragAmount);
            });
            drawable.lowerRight.attr.selectable = false;
        }
        else {
            throw "Cannot add drawable of unrecognized type: " + typeof drawable + ".";
        }
        // This is a workaround for backwards compatibility when the 'redraw' param was not yet present.
        if (redraw || typeof redraw == "undefined")
            this.redraw();
    }
    /**
     * Remove a drawable object.<br>
     * <br>
     * This must be either:<br>
     * <pre>
     *  * a Vertex
     *  * a Line
     *  * a Vector
     *  * a VEllipse
     *  * a Circle
     *  * a Polygon
     *  * a BezierPath
     *  * a BPImage
     *  * a Triangle
     * </pre>
     *
     * @param {Drawable|Array<Drawable>} drawable - The drawable (of one of the allowed class instance) to remove.
     * @param {boolean} [redraw=false]
     * @method remove
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    remove(drawable, redraw, removeWithVertices) {
        if (Array.isArray(drawable)) {
            for (var i = 0; i < drawable.length; i++) {
                this.remove(drawable[i], false, removeWithVertices);
            }
            if (redraw) {
                this.redraw();
            }
            return;
        }
        if (drawable instanceof _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex) {
            this.removeVertex(drawable, false);
            if (redraw) {
                this.redraw();
            }
        }
        for (var i = 0; i < this.drawables.length; i++) {
            if (this.drawables[i] === drawable) {
                this.drawables.splice(i, 1);
                if (removeWithVertices) {
                    // Check if some listeners need to be removed
                    if (drawable instanceof _Line__WEBPACK_IMPORTED_MODULE_10__.Line) {
                        // Add some lines
                        this.removeVertex(drawable.a, false);
                        this.removeVertex(drawable.b, false);
                    }
                    else if (drawable instanceof _Vector__WEBPACK_IMPORTED_MODULE_17__.Vector) {
                        this.removeVertex(drawable.a, false);
                        this.removeVertex(drawable.b, false);
                    }
                    else if (drawable instanceof _VEllipse__WEBPACK_IMPORTED_MODULE_15__.VEllipse) {
                        this.removeVertex(drawable.center, false);
                        this.removeVertex(drawable.axis, false);
                    }
                    else if (drawable instanceof _VEllipseSector__WEBPACK_IMPORTED_MODULE_16__.VEllipseSector) {
                        this.removeVertex(drawable.ellipse.center);
                        this.removeVertex(drawable.ellipse.axis);
                    }
                    else if (drawable instanceof _Circle__WEBPACK_IMPORTED_MODULE_6__.Circle) {
                        this.removeVertex(drawable.center, false);
                    }
                    else if (drawable instanceof _CircleSector__WEBPACK_IMPORTED_MODULE_7__.CircleSector) {
                        this.removeVertex(drawable.circle.center, false);
                    }
                    else if (drawable instanceof _Polygon__WEBPACK_IMPORTED_MODULE_13__.Polygon) {
                        // for( var i in drawable.vertices )
                        for (var i = 0; i < drawable.vertices.length; i++)
                            this.removeVertex(drawable.vertices[i], false);
                    }
                    else if (drawable instanceof _Triangle__WEBPACK_IMPORTED_MODULE_14__.Triangle) {
                        this.removeVertex(drawable.a, false);
                        this.removeVertex(drawable.b, false);
                        this.removeVertex(drawable.c, false);
                    }
                    else if (drawable instanceof _BezierPath__WEBPACK_IMPORTED_MODULE_4__.BezierPath) {
                        for (var i = 0; i < drawable.bezierCurves.length; i++) {
                            this.removeVertex(drawable.bezierCurves[i].startPoint, false);
                            this.removeVertex(drawable.bezierCurves[i].startControlPoint, false);
                            this.removeVertex(drawable.bezierCurves[i].endControlPoint, false);
                            if (i + 1 == drawable.bezierCurves.length) {
                                this.removeVertex(drawable.bezierCurves[i].endPoint, false);
                            }
                        }
                    }
                    else if (drawable instanceof _PBImage__WEBPACK_IMPORTED_MODULE_12__.PBImage) {
                        this.removeVertex(drawable.upperLeft, false);
                        this.removeVertex(drawable.lowerRight, false);
                    }
                } // END removeWithVertices
                if (redraw) {
                    this.redraw();
                }
            }
        }
    }
    /**
     * Remove a vertex from the vertex list.<br>
     *
     * @param {Vertex} vert - The vertex to remove.
     * @param {boolean} [redraw=false]
     * @method removeVertex
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    removeVertex(vert, redraw) {
        for (var i = 0; i < this.vertices.length; i++) {
            if (this.vertices[i] === vert) {
                this.vertices.splice(i, 1);
                if (redraw)
                    this.redraw();
                return;
            }
        }
    }
    /**
     * Remove all elements.
     *
     * If you want to keep the vertices, pass `true`.
     *
     * @method removeAll
     * @param {boolean=false} keepVertices
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     */
    removeAll(keepVertices) {
        this.drawables = [];
        if (!Boolean(keepVertices)) {
            this.vertices = [];
        }
        this.redraw();
    }
    /**
     * Find the vertex near the given position.
     *
     * The position is the absolute vertex position, not the x-y-coordinates on the canvas.
     *
     * @param {XYCoords} position - The position of the vertex to search for.
     * @param {number} pixelTolerance - A radius around the position to include into the search.
     *                                  Note that the tolerance will be scaled up/down when zoomed.
     * @return The vertex near the given position or undefined if none was found there.
     **/
    getVertexNear(pixelPosition, pixelTolerance) {
        var p = this.locatePointNear(this.transformMousePosition(pixelPosition.x, pixelPosition.y), pixelTolerance / Math.min(this.config.cssScaleX, this.config.cssScaleY));
        if (p && p.typeName == "vertex")
            return this.vertices[p.vindex];
        return undefined;
    }
    /**
     * Draw the grid with the current config settings.<br>
     *
     * This function is usually only used internally.
     *
     * @method drawGrid
     * @param {DrawLib} draw - The drawing library to use to draw lines.
     * @private
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    drawGrid(draw) {
        if (typeof draw === "undefined") {
            draw = this.draw;
        }
        const gScale = {
            x: (_Grid__WEBPACK_IMPORTED_MODULE_8__.Grid.utils.mapRasterScale(this.config.rasterAdjustFactor, this.draw.scale.x) * this.config.rasterScaleX) /
                this.config.cssScaleX,
            y: (_Grid__WEBPACK_IMPORTED_MODULE_8__.Grid.utils.mapRasterScale(this.config.rasterAdjustFactor, this.draw.scale.y) * this.config.rasterScaleY) /
                this.config.cssScaleY
        };
        var gSize = { width: this.grid.size.x * gScale.x, height: this.grid.size.y * gScale.y };
        var cs = { width: this.canvasSize.width / 2, height: this.canvasSize.height / 2 };
        var offset = this.draw.offset.clone().inv();
        // console.log( "drawGrid", gScale, gSize, cs, offset );
        offset.x =
            ((Math.round(offset.x + cs.width) / Math.round(gSize.width)) * gSize.width) / this.draw.scale.x +
                (((this.draw.offset.x - cs.width) / this.draw.scale.x) % gSize.width);
        offset.y =
            ((Math.round(offset.y + cs.height) / Math.round(gSize.height)) * gSize.height) / this.draw.scale.y +
                (((this.draw.offset.y - cs.height) / this.draw.scale.x) % gSize.height);
        if (this.drawConfig.drawGrid) {
            draw.setCurrentClassName(null);
            if (this.config.rasterGrid) {
                // TODO: move config member to drawConfig
                draw.setCurrentId("raster");
                draw.raster(offset, this.canvasSize.width / this.draw.scale.x, this.canvasSize.height / this.draw.scale.y, gSize.width, gSize.height, "rgba(0,128,255,0.125)");
            }
            else {
                draw.setCurrentId("grid");
                draw.grid(offset, this.canvasSize.width / this.draw.scale.x, this.canvasSize.height / this.draw.scale.y, gSize.width, gSize.height, "rgba(0,128,255,0.095)");
            }
        }
    }
    /**
     * Draw the origin with the current config settings.<br>
     *
     * This function is usually only used internally.
     *
     * @method drawOrigin
     * @param {DrawLib} draw - The drawing library to use to draw lines.
     * @private
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    drawOrigin(draw) {
        // Add a crosshair to mark the origin
        draw.setCurrentId("origin");
        draw.crosshair({ x: 0, y: 0 }, 10, "#000000");
    }
    /**
     * This is just a tiny helper function to determine the render color of vertices.
     **/
    _handleColor(h, color) {
        return h.attr.isSelected ? this.drawConfig.selectedVertex.color : h.attr.draggable ? color : "rgba(128,128,128,0.5)";
    }
    /**
     * Draw all drawables.
     *
     * This function is usually only used internally.
     *
     * @method drawDrawables
     * @param {number} renderTime - The current render time. It will be used to distinct
     *                              already draw vertices from non-draw-yet vertices.
     * @param {DrawLib} draw - The drawing library to use to draw lines.
     * @param {DrawLib} fill - The drawing library to use to fill areas.
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    drawDrawables(renderTime, draw, fill) {
        for (var i in this.drawables) {
            var d = this.drawables[i];
            this.draw.setCurrentId(d.uid);
            this.fill.setCurrentId(d.uid);
            this.draw.setCurrentClassName(d.className);
            this.draw.setCurrentClassName(d.className);
            this.drawDrawable(d, renderTime, draw, fill);
        }
    }
    /**
     * Draw the given drawable.
     *
     * This function is usually only used internally.
     *
     * @method drawDrawable
     * @param {Drawable} d - The drawable to draw.
     * @param {number} renderTime - The current render time. It will be used to distinct
     *                              already draw vertices from non-draw-yet vertices.
     * @param {DrawLib} draw - The drawing library to use to draw lines.
     * @param {DrawLib} fill - The drawing library to use to fill areas.
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    drawDrawable(d, renderTime, draw, fill) {
        if (d instanceof _BezierPath__WEBPACK_IMPORTED_MODULE_4__.BezierPath) {
            for (var c in d.bezierCurves) {
                draw.cubicBezier(d.bezierCurves[c].startPoint, d.bezierCurves[c].endPoint, d.bezierCurves[c].startControlPoint, d.bezierCurves[c].endControlPoint, this.drawConfig.bezier.color, this.drawConfig.bezier.lineWidth);
                if (this.drawConfig.drawBezierHandlePoints && this.drawConfig.drawHandlePoints) {
                    if (d.bezierCurves[c].startPoint.attr.visible) {
                        const df = this.drawConfig.bezier.pathVertex.fill ? fill : draw;
                        df.setCurrentId(`${d.uid}_h0`);
                        df.setCurrentClassName(`${d.className}-start-handle`);
                        if (d.bezierCurves[c].startPoint.attr.bezierAutoAdjust) {
                            df.squareHandle(d.bezierCurves[c].startPoint, 5, this._handleColor(d.bezierCurves[c].startPoint, this.drawConfig.bezier.pathVertex.color));
                        }
                        else {
                            df.diamondHandle(d.bezierCurves[c].startPoint, 7, this._handleColor(d.bezierCurves[c].startPoint, this.drawConfig.bezier.pathVertex.color));
                        }
                    }
                    d.bezierCurves[c].startPoint.attr.renderTime = renderTime;
                    if (d.bezierCurves[c].endPoint.attr.visible) {
                        const df = this.drawConfig.bezier.pathVertex.fill ? fill : draw;
                        df.setCurrentId(`${d.uid}_h0`);
                        df.setCurrentClassName(`${d.className}-start-handle`);
                        if (d.bezierCurves[c].endPoint.attr.bezierAutoAdjust) {
                            df.squareHandle(d.bezierCurves[c].endPoint, 5, this._handleColor(d.bezierCurves[c].endPoint, this.drawConfig.bezier.pathVertex.color));
                        }
                        else {
                            df.diamondHandle(d.bezierCurves[c].endPoint, 7, this._handleColor(d.bezierCurves[c].endPoint, this.drawConfig.bezier.pathVertex.color));
                        }
                    }
                    if (d.bezierCurves[c].startControlPoint.attr.visible) {
                        const df = this.drawConfig.bezier.controlVertex.fill ? fill : draw;
                        df.setCurrentId(`${d.uid}_h2`);
                        df.setCurrentClassName(`${d.className}-start-control-handle`);
                        df.circleHandle(d.bezierCurves[c].startControlPoint, 3, this._handleColor(d.bezierCurves[c].startControlPoint, this.drawConfig.bezier.controlVertex.color));
                    }
                    if (d.bezierCurves[c].endControlPoint.attr.visible) {
                        const df = this.drawConfig.bezier.controlVertex.fill ? fill : draw;
                        df.setCurrentId(`${d.uid}_h3`);
                        df.setCurrentClassName(`${d.className}-end-control-handle`);
                        df.circleHandle(d.bezierCurves[c].endControlPoint, 3, this._handleColor(d.bezierCurves[c].endControlPoint, this.drawConfig.bezier.controlVertex.color));
                    }
                    d.bezierCurves[c].startPoint.attr.renderTime = renderTime;
                    d.bezierCurves[c].endPoint.attr.renderTime = renderTime;
                    d.bezierCurves[c].startControlPoint.attr.renderTime = renderTime;
                    d.bezierCurves[c].endControlPoint.attr.renderTime = renderTime;
                }
                else {
                    d.bezierCurves[c].startPoint.attr.renderTime = renderTime;
                    d.bezierCurves[c].endPoint.attr.renderTime = renderTime;
                    d.bezierCurves[c].startControlPoint.attr.renderTime = renderTime;
                    d.bezierCurves[c].endControlPoint.attr.renderTime = renderTime;
                }
                if (this.drawConfig.drawBezierHandleLines && this.drawConfig.drawHandleLines) {
                    draw.setCurrentId(`${d.uid}_l0`);
                    draw.setCurrentClassName(`${d.className}-start-line`);
                    draw.line(d.bezierCurves[c].startPoint, d.bezierCurves[c].startControlPoint, this.drawConfig.bezier.handleLine.color, this.drawConfig.bezier.handleLine.lineWidth);
                    draw.setCurrentId(`${d.uid}_l1`);
                    draw.setCurrentClassName(`${d.className}-end-line`);
                    draw.line(d.bezierCurves[c].endPoint, d.bezierCurves[c].endControlPoint, this.drawConfig.bezier.handleLine.color, this.drawConfig.bezier.handleLine.lineWidth);
                }
            }
        }
        else if (d instanceof _Polygon__WEBPACK_IMPORTED_MODULE_13__.Polygon) {
            draw.polygon(d, this.drawConfig.polygon.color, this.drawConfig.polygon.lineWidth);
            if (!this.drawConfig.drawHandlePoints) {
                for (var i in d.vertices) {
                    d.vertices[i].attr.renderTime = renderTime;
                }
            }
        }
        else if (d instanceof _Triangle__WEBPACK_IMPORTED_MODULE_14__.Triangle) {
            draw.polyline([d.a, d.b, d.c], false, this.drawConfig.triangle.color, this.drawConfig.triangle.lineWidth);
            if (!this.drawConfig.drawHandlePoints)
                d.a.attr.renderTime = d.b.attr.renderTime = d.c.attr.renderTime = renderTime;
        }
        else if (d instanceof _VEllipse__WEBPACK_IMPORTED_MODULE_15__.VEllipse) {
            if (this.drawConfig.drawHandleLines) {
                draw.setCurrentId(`${d.uid}_e0`);
                draw.setCurrentClassName(`${d.className}-v-line`);
                // draw.line( d.center.clone().add(0,d.axis.y-d.center.y), d.axis, '#c8c8c8' );
                draw.line(d.center.clone().add(0, d.signedRadiusV()).rotate(d.rotation, d.center), d.axis, "#c8c8c8");
                draw.setCurrentId(`${d.uid}_e1`);
                draw.setCurrentClassName(`${d.className}-h-line`);
                // draw.line( d.center.clone().add(d.axis.x-d.center.x,0), d.axis, '#c8c8c8' );
                draw.line(d.center.clone().add(d.signedRadiusH(), 0).rotate(d.rotation, d.center), d.axis, "#c8c8c8");
            }
            draw.setCurrentId(d.uid);
            draw.setCurrentClassName(`${d.className}`);
            draw.ellipse(d.center, 
            // Math.abs(d.axis.x-d.center.x), Math.abs(d.axis.y-d.center.y),
            d.radiusH(), d.radiusV(), this.drawConfig.ellipse.color, this.drawConfig.ellipse.lineWidth, d.rotation);
            if (!this.drawConfig.drawHandlePoints) {
                d.center.attr.renderTime = renderTime;
                d.axis.attr.renderTime = renderTime;
            }
        }
        else if (d instanceof _VEllipseSector__WEBPACK_IMPORTED_MODULE_16__.VEllipseSector) {
            draw.setCurrentId(d.uid);
            draw.setCurrentClassName(`${d.className}`);
            /* draw.ellipse( d.center,
                    // Math.abs(d.axis.x-d.center.x), Math.abs(d.axis.y-d.center.y),
                    d.radiusH(), d.radiusV(),
                    this.drawConfig.ellipse.color,
                    this.drawConfig.ellipse.lineWidth,
                    d.rotation ); */
            const data = _VEllipseSector__WEBPACK_IMPORTED_MODULE_16__.VEllipseSector.ellipseSectorUtils.describeSVGArc(d.ellipse.center.x, d.ellipse.center.y, d.ellipse.radiusH(), d.ellipse.radiusV(), d.startAngle, d.endAngle, d.ellipse.rotation, { moveToStart: true });
            draw.path(data, this.drawConfig.ellipseSector.color, this.drawConfig.ellipseSector.lineWidth);
        }
        else if (d instanceof _Circle__WEBPACK_IMPORTED_MODULE_6__.Circle) {
            draw.circle(d.center, d.radius, this.drawConfig.circle.color, this.drawConfig.circle.lineWidth);
        }
        else if (d instanceof _CircleSector__WEBPACK_IMPORTED_MODULE_7__.CircleSector) {
            draw.circleArc(d.circle.center, d.circle.radius, d.startAngle, d.endAngle, this.drawConfig.circleSector.color, this.drawConfig.circleSector.lineWidth);
        }
        else if (d instanceof _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex) {
            if (this.drawConfig.drawVertices && (!d.attr.selectable || !d.attr.draggable) && d.attr.visible) {
                // Draw as special point (grey)
                draw.circleHandle(d, 7, this.drawConfig.vertex.color);
                d.attr.renderTime = renderTime;
            }
        }
        else if (d instanceof _Line__WEBPACK_IMPORTED_MODULE_10__.Line) {
            draw.line(d.a, d.b, this.drawConfig.line.color, this.drawConfig.line.lineWidth);
            if (!this.drawConfig.drawHandlePoints || !d.a.attr.selectable)
                d.a.attr.renderTime = renderTime;
            if (!this.drawConfig.drawHandlePoints || !d.b.attr.selectable)
                d.b.attr.renderTime = renderTime;
        }
        else if (d instanceof _Vector__WEBPACK_IMPORTED_MODULE_17__.Vector) {
            draw.arrow(d.a, d.b, this.drawConfig.vector.color);
            if (this.drawConfig.drawHandlePoints && d.b.attr.selectable && d.b.attr.visible) {
                draw.setCurrentId(`${d.uid}_h0`);
                draw.setCurrentClassName(`${d.className}-handle`);
                draw.circleHandle(d.b, 3, "#a8a8a8");
            }
            else {
                d.b.attr.renderTime = renderTime;
            }
            if (!this.drawConfig.drawHandlePoints || !d.a.attr.selectable)
                d.a.attr.renderTime = renderTime;
            if (!this.drawConfig.drawHandlePoints || !d.b.attr.selectable)
                d.b.attr.renderTime = renderTime;
        }
        else if (d instanceof _PBImage__WEBPACK_IMPORTED_MODULE_12__.PBImage) {
            if (this.drawConfig.drawHandleLines) {
                draw.setCurrentId(`${d.uid}_l0`);
                draw.setCurrentClassName(`${d.className}-line`);
                draw.line(d.upperLeft, d.lowerRight, this.drawConfig.image.color, this.drawConfig.image.lineWidth);
            }
            fill.setCurrentId(d.uid);
            fill.image(d.image, d.upperLeft, d.lowerRight.clone().sub(d.upperLeft));
            if (this.drawConfig.drawHandlePoints) {
                draw.setCurrentId(`${d.uid}_h0`);
                draw.setCurrentClassName(`${d.className}-lower-right`);
                draw.circleHandle(d.lowerRight, 3, this.drawConfig.image.color);
                d.lowerRight.attr.renderTime = renderTime;
            }
        }
        else {
            console.error("Cannot draw object. Unknown class.");
        }
        draw.setCurrentClassName(null);
        draw.setCurrentId(null);
        fill.setCurrentClassName(null);
        fill.setCurrentId(null);
    }
    /**
     * Draw the select-polygon (if there is one).
     *
     * This function is usually only used internally.
     *
     * @method drawSelectPolygon
     * @private
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    drawSelectPolygon(draw) {
        // Draw select polygon?
        if (this.selectPolygon != null && this.selectPolygon.vertices.length > 0) {
            draw.setCurrentId(this.selectPolygon.uid);
            draw.polygon(this.selectPolygon, "#888888");
            draw.crosshair(this.selectPolygon.vertices[0], 3, "#008888");
        }
    }
    /**
     * Draw all vertices that were not yet drawn with the given render time.<br>
     * <br>
     * This function is usually only used internally.
     *
     * @method drawVertices
     * @private
     * @param {number} renderTime - The current render time. It is used to distinct
     *                              already draw vertices from non-draw-yet vertices.
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    drawVertices(renderTime, draw) {
        // Draw all vertices as small squares if they were not already drawn by other objects
        for (var i in this.vertices) {
            if (this.drawConfig.drawVertices && this.vertices[i].attr.renderTime != renderTime && this.vertices[i].attr.visible) {
                draw.setCurrentId(this.vertices[i].uid);
                draw.squareHandle(this.vertices[i], 5, this._handleColor(this.vertices[i], "rgb(0,128,192)"));
                this.vertices[i].attr.renderTime = renderTime;
            }
        }
    }
    /**
     * Trigger redrawing of all objects.<br>
     * <br>
     * Usually this function is automatically called when objects change.
     *
     * @method redraw
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    redraw() {
        const renderTime = this.renderTime++;
        // Tell the drawing library that a new drawing cycle begins (required for the GL lib).
        this.draw.beginDrawCycle(renderTime);
        this.fill.beginDrawCycle(renderTime);
        if (this.config.preClear)
            this.config.preClear();
        this.clear();
        if (this.config.preDraw)
            this.config.preDraw(this.draw, this.fill);
        this.drawAll(renderTime, this.draw, this.fill);
        if (this.config.postDraw)
            this.config.postDraw(this.draw, this.fill);
        this.draw.endDrawCycle(renderTime);
        this.fill.endDrawCycle(renderTime);
    }
    /**
     * Draw all: drawables, grid, select-polygon and vertices.
     *
     * @method drawAll
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    drawAll(renderTime, draw, fill) {
        this.drawGrid(draw);
        if (this.config.drawOrigin)
            this.drawOrigin(draw);
        this.drawDrawables(renderTime, draw, fill);
        this.drawVertices(renderTime, draw);
        this.drawSelectPolygon(draw);
        // Clear IDs and classnames (postDraw hook might draw somthing and the do not want
        // to interfered with that).
        draw.setCurrentId(undefined);
        draw.setCurrentClassName(undefined);
    } // END redraw
    /**
     * This function clears the canvas with the configured background color.<br>
     * <br>
     * This function is usually only used internally.
     *
     * @method clear
     * @private
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    clear() {
        // Note that elements might have an alpha channel. Clear the scene first.
        this.draw.clear(this.config.backgroundColor);
    }
    /**
     * Clear the selection.<br>
     * <br>
     * This function is usually only used internally.
     *
     * @method clearSelection
     * @private
     * @param {boolean=} [redraw=false] - Indicates if the redraw function should be triggered.
     * @instance
     * @memberof PlotBoilerplate
     * @return {PlotBoilerplate} this
     **/
    clearSelection(redraw) {
        for (var i in this.vertices)
            this.vertices[i].attr.isSelected = false;
        if (redraw)
            this.redraw();
        return this;
    }
    /**
     * Get the current view port.
     *
     * @method viewport
     * @instance
     * @memberof PlotBoilerplate
     * @return {Bounds} The current viewport.
     **/
    viewport() {
        return new _Bounds__WEBPACK_IMPORTED_MODULE_5__.Bounds(this.transformMousePosition(0, 0), this.transformMousePosition(this.canvasSize.width * this.config.cssScaleX, this.canvasSize.height * this.config.cssScaleY));
    }
    /**
     * Trigger the saveFile.hook.
     *
     * @method saveFile
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    saveFile() {
        this.hooks.saveFile(this);
    }
    /**
     * Internal helper function used to get 'float' properties from elements.
     * Used to determine border withs and paddings that were defined using CSS.
     */
    // TODO: this was moved to the DOM utils
    getFProp(elem, propName) {
        return parseFloat(globalThis.getComputedStyle(elem, null).getPropertyValue(propName));
    }
    /**
     * Get the available inner space of the given container.
     *
     * Size minus padding minus border.
     **/
    // TODO: this was moved to the DOM utils
    getAvailableContainerSpace() {
        const _self = this;
        const container = _self.canvas.parentNode; // Element | Document | DocumentFragment;
        _self.canvas.style.display = "none";
        var padding = this.getFProp(container, "padding") || 0, border = this.getFProp(_self.canvas, "border-width") || 0, pl = this.getFProp(container, "padding-left") || padding, pr = this.getFProp(container, "padding-right") || padding, pt = this.getFProp(container, "padding-top") || padding, pb = this.getFProp(container, "padding-bottom") || padding, bl = this.getFProp(_self.canvas, "border-left-width") || border, br = this.getFProp(_self.canvas, "border-right-width") || border, bt = this.getFProp(_self.canvas, "border-top-width") || border, bb = this.getFProp(_self.canvas, "border-bottom-width") || border;
        var w = container.clientWidth;
        var h = container.clientHeight;
        _self.canvas.style.display = "block";
        return { width: w - pl - pr - bl - br, height: h - pt - pb - bt - bb };
    }
    /**
     * This function resizes the canvas to the required settings (toggles fullscreen).<br>
     * <br>
     * This function is usually only used internally but feel free to call it if resizing required.
     *
     * @method resizeCanvas
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    resizeCanvas() {
        const _self = this;
        const _setSize = (w, h) => {
            w *= _self.config.canvasWidthFactor;
            h *= _self.config.canvasHeightFactor;
            _self.canvasSize.width = w;
            _self.canvasSize.height = h;
            if (_self.canvas instanceof HTMLCanvasElement) {
                _self.canvas.width = w;
                _self.canvas.height = h;
            }
            else if (_self.canvas instanceof SVGElement) {
                this.canvas.setAttribute("viewBox", `0 0 ${w} ${h}`);
                this.canvas.setAttribute("width", `${w}`);
                this.canvas.setAttribute("height", `${h}`);
                this.draw.setSize(_self.canvasSize); // No need to set size to this.fill (instance copy)
                this.eventCatcher.style.width = `${w}px`;
                this.eventCatcher.style.height = `${h}px`;
            }
            else {
                console.error("Error: cannot resize canvas element because it seems neither be a HTMLCanvasElement nor an SVGElement.");
            }
            if (_self.config.autoAdjustOffset) {
                // _self.draw.offset.x = _self.fill.offset.x = _self.config.offsetX = w*(_self.config.offsetAdjustXPercent/100);
                // _self.draw.offset.y = _self.fill.offset.y = _self.config.offsetY = h*(_self.config.offsetAdjustYPercent/100);
                _self.adjustOffset(false);
            }
        };
        if (_self.config.fullSize && !_self.config.fitToParent) {
            // Set editor size
            var width = globalThis.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var height = globalThis.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            _self.canvas.style.position = "absolute";
            _self.canvas.style.width = _self.config.canvasWidthFactor * width + "px";
            _self.canvas.style.height = _self.config.canvasWidthFactor * height + "px";
            _self.canvas.style.top = "0px";
            _self.canvas.style.left = "0px";
            _setSize(width, height);
        }
        else if (_self.config.fitToParent) {
            // Set editor size
            _self.canvas.style.position = "absolute";
            const space = this.getAvailableContainerSpace();
            _self.canvas.style.width = _self.config.canvasWidthFactor * space.width + "px";
            _self.canvas.style.height = _self.config.canvasHeightFactor * space.height + "px";
            _self.canvas.style.top = null;
            _self.canvas.style.left = null;
            _setSize(space.width, space.height);
        }
        else {
            _self.canvas.style.width = null;
            _self.canvas.style.height = null;
            _setSize(_self.config.defaultCanvasWidth, _self.config.defaultCanvasHeight);
        }
        if (_self.config.redrawOnResize)
            _self.redraw();
    }
    /**
     *  Add all vertices inside the polygon to the current selection.<br>
     *
     * @method selectVerticesInPolygon
     * @param {Polygon} polygon - The polygonal selection area.
     * @instance
     * @memberof PlotBoilerplate
     * @return {void}
     **/
    selectVerticesInPolygon(polygon) {
        for (var i in this.vertices) {
            if (this.vertices[i].attr.selectable && polygon.containsVert(this.vertices[i]))
                this.vertices[i].attr.isSelected = true;
        }
    }
    /**
     * (Helper) Locates the point (index) at the passed position. Using an internal tolerance of 7 pixels.
     *
     * The result is an object { type : 'bpath', pindex, cindex, pid }
     *
     * Returns false if no point is near the passed position.
     *
     * @method locatePointNear
     * @param {Vertex} point - The polygonal selection area.
     * @param {number=} [tolerance=7] - The tolerance to use identtifying vertices.
     * @private
     * @return {IDraggable} Or false if none found.
     **/
    locatePointNear(point, tolerance) {
        const _self = this;
        if (typeof tolerance == "undefined")
            tolerance = 7;
        // Apply the zoom (the tolerant area should not shrink or grow when zooming)
        tolerance /= _self.draw.scale.x;
        // Search in vertices
        // for( var vindex in _self.vertices ) {
        for (var vindex = 0; vindex < _self.vertices.length; vindex++) {
            var vert = _self.vertices[vindex];
            if ((vert.attr.draggable || vert.attr.selectable) && vert.distance(point) < tolerance) {
                // { type : 'vertex', vindex : vindex };
                return new PlotBoilerplate.Draggable(vert, PlotBoilerplate.Draggable.VERTEX).setVIndex(vindex);
            }
        }
        return null;
    }
    /**
     * Handle left-click event.<br>
     *
     * @method handleClick
     * @param {number} x - The click X position on the canvas.
     * @param {number} y - The click Y position on the canvas.
     * @private
     * @return {void}
     **/
    handleClick(e) {
        // x:number,y:number) {
        const _self = this;
        // const x:number = e.params.pos.x;
        //const y:number = e.params.pos.y;
        var p = this.locatePointNear(_self.transformMousePosition(e.params.pos.x, e.params.pos.y), PlotBoilerplate.DEFAULT_CLICK_TOLERANCE / Math.min(_self.config.cssScaleX, _self.config.cssScaleY));
        if (p) {
            _self.vertices[p.vindex].listeners.fireClickEvent(e);
            if (this.keyHandler && this.keyHandler.isDown("shift")) {
                if (p.typeName == "bpath") {
                    let vert = _self.paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid);
                    if (vert.attr.selectable)
                        vert.attr.isSelected = !vert.attr.isSelected;
                }
                else if (p.typeName == "vertex") {
                    let vert = _self.vertices[p.vindex];
                    if (vert.attr.selectable)
                        vert.attr.isSelected = !vert.attr.isSelected;
                }
                _self.redraw();
            }
            else if (this.keyHandler.isDown("y") /* && p.type=='bpath' && (p.pid==BezierPath.START_POINT || p.pid==BezierPath.END_POINT) */) {
                _self.vertices[p.vindex].attr.bezierAutoAdjust = !_self.vertices[p.vindex].attr.bezierAutoAdjust;
                _self.redraw();
            }
        }
        else if (_self.selectPolygon != null) {
            const vert = _self.transformMousePosition(e.params.pos.x, e.params.pos.y);
            _self.selectPolygon.vertices.push(new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(vert.x, vert.y));
            _self.redraw();
        }
    }
    /**
     * Transforms the given x-y-(mouse-)point to coordinates respecting the view offset
     * and the zoom settings.
     *
     * @method transformMousePosition
     * @param {number} x - The x position relative to the canvas.
     * @param {number} y - The y position relative to the canvas.
     * @instance
     * @memberof PlotBoilerplate
     * @return {XYCoords} A simple object <pre>{ x : Number, y : Number }</pre> with the transformed coordinates.
     **/
    transformMousePosition(x, y) {
        return {
            x: (x / this.config.cssScaleX - this.config.offsetX) / this.config.scaleX,
            y: (y / this.config.cssScaleY - this.config.offsetY) / this.config.scaleY
        };
    }
    /**
     * Revert a transformed mouse position back to canvas coordinates.
     *
     * This is the inverse function of `transformMousePosition`.
     *
     * @method revertMousePosition
     * @param {number} x - The x component of the position to revert.
     * @param {number} y - The y component of the position to revert.
     * @instance
     * @memberof PlotBoilerplate
     * @return {XYCoords} The canvas coordinates for the given position.
     **/
    revertMousePosition(x, y) {
        return { x: x / this.config.cssScaleX + this.config.offsetX, y: y / this.config.cssScaleY + this.config.offsetY };
    }
    /**
     * Determine if any elements are currently being dragged (on mouse move or touch move).
     *
     * @method getDraggedElementCount
     * @instance
     * @memberof PlotBoilerplate
     * @return {number} The number of elements that are currently being dragged.
     **/
    getDraggedElementCount() {
        return this.draggedElements.length;
    }
    /**
     * (Helper) The mouse-down handler.
     *
     * It selects vertices for dragging.
     *
     * @method mouseDownHandler.
     * @param {XMouseEvent} e - The event to handle
     * @private
     * @return {void}
     **/
    mouseDownHandler(e) {
        const _self = this;
        if (e.button != 0)
            return; // Only react on left mouse or touch events
        var p = _self.locatePointNear(_self.transformMousePosition(e.params.pos.x, e.params.pos.y), PlotBoilerplate.DEFAULT_CLICK_TOLERANCE / Math.min(_self.config.cssScaleX, _self.config.cssScaleY));
        if (!p)
            return;
        // Drag all selected elements?
        if (p.typeName == "vertex" && _self.vertices[p.vindex].attr.isSelected) {
            // Multi drag
            // for( var i in _self.vertices ) {
            for (var i = 0; i < _self.vertices.length; i++) {
                if (_self.vertices[i].attr.isSelected) {
                    _self.draggedElements.push(new PlotBoilerplate.Draggable(_self.vertices[i], PlotBoilerplate.Draggable.VERTEX).setVIndex(i));
                    _self.vertices[i].listeners.fireDragStartEvent(e);
                }
            }
        }
        else {
            // Single drag
            if (!_self.vertices[p.vindex].attr.draggable)
                return;
            _self.draggedElements.push(p);
            if (p.typeName == "bpath")
                _self.paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragStartEvent(e);
            else if (p.typeName == "vertex")
                _self.vertices[p.vindex].listeners.fireDragStartEvent(e);
        }
        _self.redraw();
    }
    /**
     * The mouse-drag handler.
     *
     * It moves selected elements around or performs the panning if the ctrl-key if
     * hold down.
     *
     * @method mouseDragHandler.
     * @param {XMouseEvent} e - The event to handle
     * @private
     * @return {void}
     **/
    mouseDragHandler(e) {
        const _self = this;
        const oldDragAmount = { x: e.params.dragAmount.x, y: e.params.dragAmount.y };
        e.params.dragAmount.x /= _self.config.cssScaleX;
        e.params.dragAmount.y /= _self.config.cssScaleY;
        // Important note to: this.keyHandler.isDown('ctrl')
        //    We should not use this for any input.
        //    Reason: most browsers use [Ctrl]+[t] to create new browser tabs.
        //            If so, the key-up event for [Ctrl] will be fired in the _new tab_,
        //            not this one. So this tab will never receive any [Ctrl-down] events
        //            until next keypress; the implication is, that [Ctrl] would still
        //            considered to be pressed which is not true.
        if (this.keyHandler.isDown("alt") || this.keyHandler.isDown("spacebar")) {
            _self.setOffset(_self.draw.offset.clone().add(e.params.dragAmount));
            _self.redraw();
        }
        else {
            // Convert drag amount by scaling
            // Warning: this possibly invalidates the dragEvent for other listeners!
            //          Rethink the solution when other features are added.
            e.params.dragAmount.x /= _self.draw.scale.x;
            e.params.dragAmount.y /= _self.draw.scale.y;
            for (var i in _self.draggedElements) {
                var p = _self.draggedElements[i];
                if (p.typeName == "bpath") {
                    _self.paths[p.pindex].moveCurvePoint(p.cindex, p.pid, new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(e.params.dragAmount.x, e.params.dragAmount.y));
                    _self.paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragEvent(e);
                }
                else if (p.typeName == "vertex") {
                    if (!_self.vertices[p.vindex].attr.draggable)
                        continue;
                    _self.vertices[p.vindex].add(e.params.dragAmount);
                    _self.vertices[p.vindex].listeners.fireDragEvent(e);
                }
            }
        }
        // Restore old event values!
        e.params.dragAmount.x = oldDragAmount.x;
        e.params.dragAmount.y = oldDragAmount.y;
        _self.redraw();
    }
    /**
     * The mouse-up handler.
     *
     * It clears the dragging-selection.
     *
     * @method mouseUpHandler.
     * @param {XMouseEvent} e - The event to handle
     * @private
     * @return {void}
     **/
    mouseUpHandler(e) {
        const _self = this;
        if (e.button != 0)
            return; // Only react on left mouse;
        if (!e.params.wasDragged) {
            _self.handleClick(e); // e.params.pos.x, e.params.pos.y );
        }
        for (var i in _self.draggedElements) {
            var p = _self.draggedElements[i];
            if (p.typeName == "bpath") {
                _self.paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragEndEvent(e);
            }
            else if (p.typeName == "vertex") {
                _self.vertices[p.vindex].listeners.fireDragEndEvent(e);
            }
        }
        _self.draggedElements = [];
        _self.redraw();
    }
    /**
     * The mouse-wheel handler.
     *
     * It performs the zooming.
     *
     * @method mouseWheelHandler.
     * @param {XMouseEvent} e - The event to handle
     * @private
     * @return {void}
     **/
    mouseWheelHandler(e) {
        var zoomStep = 1.25; // Make configurable?
        // CHANGED replaced _self by this
        const _self = this;
        const we = e;
        if (we.deltaY < 0) {
            _self.setZoom(_self.config.scaleX * zoomStep, _self.config.scaleY * zoomStep, new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(e.params.pos.x, e.params.pos.y));
        }
        else if (we.deltaY > 0) {
            _self.setZoom(_self.config.scaleX / zoomStep, _self.config.scaleY / zoomStep, new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(e.params.pos.x, e.params.pos.y));
        }
        e.preventDefault();
        _self.redraw();
    }
    /**
     * Re-adjust the configured offset depending on the current canvas size and zoom (scaleX and scaleY).
     *
     * @method adjustOffset
     * @param {boolean=false} redraw - [optional] If set the canvas will redraw with the new offset (default=false).
     * @return {void}
     **/
    adjustOffset(redraw) {
        this.draw.offset.x =
            this.fill.offset.x =
                this.config.offsetX =
                    this.canvasSize.width * (this.config.offsetAdjustXPercent / 100);
        this.draw.offset.y =
            this.fill.offset.y =
                this.config.offsetY =
                    this.canvasSize.height * (this.config.offsetAdjustYPercent / 100);
        if (redraw) {
            this.redraw();
        }
    }
    /**
     * Set the new draw offset.
     *
     * Note: the function will not trigger any redraws.
     *
     * @param {Vertex} newOffset - The new draw offset to use.
     **/
    setOffset(newOffset) {
        this.draw.offset.set(newOffset);
        this.fill.offset.set(newOffset);
        this.config.offsetX = newOffset.x;
        this.config.offsetY = newOffset.y;
    }
    /**
     * Set a new zoom value (and re-adjust the draw offset).
     *
     * Note: the function will not trigger any redraws.
     *
     * @param {number} zoomFactorX - The new horizontal zoom value.
     * @param {number} zoomFactorY - The new vertical zoom value.
     * @param {Vertex} interactionPos - The position of mouse/touch interaction.
     **/
    setZoom(zoomFactorX, zoomFactorY, interactionPos) {
        let oldPos = this.transformMousePosition(interactionPos.x, interactionPos.y);
        this.draw.scale.x = this.fill.scale.x = this.config.scaleX = Math.max(zoomFactorX, 0.01);
        this.draw.scale.y = this.fill.scale.y = this.config.scaleY = Math.max(zoomFactorY, 0.01);
        let newPos = this.transformMousePosition(interactionPos.x, interactionPos.y);
        let newOffsetX = this.draw.offset.x + (newPos.x - oldPos.x) * this.draw.scale.x;
        let newOffsetY = this.draw.offset.y + (newPos.y - oldPos.y) * this.draw.scale.y;
        this.setOffset({ x: newOffsetX, y: newOffsetY });
    }
    installInputListeners() {
        var _self = this;
        if (this.config.enableMouse) {
            // Install a mouse handler on the canvas.
            new _MouseHandler__WEBPACK_IMPORTED_MODULE_11__.MouseHandler(this.eventCatcher ? this.eventCatcher : this.canvas)
                .down((e) => {
                _self.mouseDownHandler(e);
            })
                .drag((e) => {
                _self.mouseDragHandler(e);
            })
                .up((e) => {
                _self.mouseUpHandler(e);
            });
        }
        else {
            _self.console.log("Mouse interaction disabled.");
        }
        if (this.config.enableMouseWheel) {
            // Install a mouse handler on the canvas.
            new _MouseHandler__WEBPACK_IMPORTED_MODULE_11__.MouseHandler(this.eventCatcher ? this.eventCatcher : this.canvas).wheel((e) => {
                _self.mouseWheelHandler(e);
            });
        }
        else {
            _self.console.log("Mouse wheel interaction disabled.");
        }
        if (this.config.enableTouch) {
            // Install a touch handler on the canvas.
            const relPos = (pos) => {
                const bounds = _self.canvas.getBoundingClientRect();
                return { x: pos.x - bounds.left, y: pos.y - bounds.top };
            };
            // Make PB work together with both, AlloyFinger as a esm module or a commonjs function.
            if (typeof globalThis["AlloyFinger"] === "function" || typeof globalThis["createAlloyFinger"] === "function") {
                try {
                    var touchMovePos = null;
                    var touchDownPos = null;
                    var draggedElement = null;
                    var multiTouchStartScale = null;
                    const clearTouch = () => {
                        touchMovePos = null;
                        touchDownPos = null;
                        draggedElement = null;
                        multiTouchStartScale = null;
                        _self.draggedElements = [];
                    };
                    const afProps = {
                        touchStart: (evt) => {
                            if (evt.touches.length == 1) {
                                touchMovePos = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(relPos({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }));
                                touchDownPos = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(relPos({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }));
                                draggedElement = _self.locatePointNear(_self.transformMousePosition(touchMovePos.x, touchMovePos.y), PlotBoilerplate.DEFAULT_TOUCH_TOLERANCE / Math.min(_self.config.cssScaleX, _self.config.cssScaleY));
                                if (draggedElement && draggedElement.typeName == "vertex") {
                                    var draggingVertex = _self.vertices[draggedElement.vindex];
                                    var fakeEvent = {
                                        params: {
                                            isTouchEvent: true,
                                            dragAmount: { x: 0, y: 0 },
                                            wasDragged: false,
                                            mouseDownPos: touchDownPos.clone(),
                                            mouseDragPos: touchDownPos.clone(),
                                            vertex: draggingVertex
                                        }
                                    };
                                    _self.draggedElements = [draggedElement];
                                    draggingVertex.listeners.fireDragStartEvent(fakeEvent);
                                }
                            }
                        },
                        touchMove: (evt) => {
                            if (evt.touches.length == 1 && draggedElement) {
                                evt.preventDefault();
                                evt.stopPropagation();
                                var rel = relPos({ x: evt.touches[0].clientX, y: evt.touches[0].clientY });
                                var trans = _self.transformMousePosition(rel.x, rel.y);
                                var diff = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(_self.transformMousePosition(touchMovePos.x, touchMovePos.y)).difference(trans);
                                if (draggedElement.typeName == "vertex") {
                                    if (!_self.vertices[draggedElement.vindex].attr.draggable)
                                        return;
                                    _self.vertices[draggedElement.vindex].add(diff);
                                    var draggingVertex = _self.vertices[draggedElement.vindex];
                                    var fakeEvent = {
                                        isTouchEvent: true,
                                        params: {
                                            dragAmount: diff.clone(),
                                            wasDragged: true,
                                            mouseDownPos: touchDownPos.clone(),
                                            mouseDragPos: touchDownPos.clone().add(diff),
                                            vertex: draggingVertex
                                        }
                                    };
                                    draggingVertex.listeners.fireDragEvent(fakeEvent);
                                    _self.redraw();
                                }
                                touchMovePos = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(rel);
                            }
                            else if (evt.touches.length == 2) {
                                // If at least two fingers touch and move, then change the draw offset (panning).
                                evt.preventDefault();
                                evt.stopPropagation();
                                _self.setOffset(_self.draw.offset
                                    .clone()
                                    .addXY(evt.deltaX, evt.deltaY)); // Apply zoom?
                                _self.redraw();
                            }
                        },
                        touchEnd: (evt) => {
                            // Note: e.touches.length is 0 here
                            if (draggedElement && draggedElement.typeName == "vertex") {
                                var draggingVertex = _self.vertices[draggedElement.vindex];
                                var fakeEvent = {
                                    isTouchEvent: true,
                                    params: {
                                        dragAmount: { x: 0, y: 0 },
                                        wasDragged: false,
                                        mouseDownPos: touchDownPos.clone(),
                                        mouseDragPos: touchDownPos.clone(),
                                        vertex: draggingVertex
                                    }
                                };
                                // Check if vertex was moved
                                if (touchMovePos && touchDownPos && touchDownPos.distance(touchMovePos) < 0.001) {
                                    // if( e.touches.length == 1 && diff.x == 0 && diff.y == 0 ) {
                                    draggingVertex.listeners.fireClickEvent(fakeEvent);
                                }
                                else {
                                    draggingVertex.listeners.fireDragEndEvent(fakeEvent);
                                }
                            }
                            clearTouch();
                        },
                        touchCancel: (evt) => {
                            clearTouch();
                        },
                        multipointStart: (evt) => {
                            multiTouchStartScale = _self.draw.scale.clone();
                        },
                        multipointEnd: (evt) => {
                            multiTouchStartScale = null;
                        },
                        pinch: (evt) => {
                            // For pinching there must be at least two touch items
                            const fingerA = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(evt.touches.item(0).clientX, evt.touches.item(0).clientY);
                            const fingerB = new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex(evt.touches.item(1).clientX, evt.touches.item(1).clientY);
                            const center = new _Line__WEBPACK_IMPORTED_MODULE_10__.Line(fingerA, fingerB).vertAt(0.5);
                            _self.setZoom(multiTouchStartScale.x * evt.zoom, multiTouchStartScale.y * evt.zoom, center);
                            _self.redraw();
                        }
                    }; // END afProps
                    if (window["createAlloyFinger"])
                        window["createAlloyFinger"](this.eventCatcher ? this.eventCatcher : this.canvas, afProps);
                    else
                        new alloyfinger_typescript__WEBPACK_IMPORTED_MODULE_0__["default"](this.eventCatcher ? this.eventCatcher : this.canvas, afProps);
                }
                catch (e) {
                    console.error("Failed to initialize AlloyFinger!");
                    console.error(e);
                }
            }
            else if (globalThis["Touchy"] && typeof globalThis["Touchy"] == "function") {
                console.error("[Deprecation] Found Touchy which is not supported any more. Please use AlloyFinger instead.");
                // Convert absolute touch positions to relative DOM element position (relative to canvas)
            }
            else {
                console.warn("Cannot initialize the touch handler. AlloyFinger is missig. Did you include it?");
            }
        }
        else {
            _self.console.log("Touch interaction disabled.");
        }
        if (this.config.enableKeys) {
            // Install key handler
            this.keyHandler = new _KeyHandler__WEBPACK_IMPORTED_MODULE_9__.KeyHandler({ trackAll: true })
                .down("escape", function () {
                _self.clearSelection(true);
            })
                .down("shift", function () {
                _self.selectPolygon = new _Polygon__WEBPACK_IMPORTED_MODULE_13__.Polygon();
                _self.redraw();
            })
                .up("shift", function () {
                // Find and select vertices in the drawn area
                if (_self.selectPolygon == null)
                    return;
                _self.selectVerticesInPolygon(_self.selectPolygon);
                _self.selectPolygon = null;
                _self.redraw();
            });
        } // END IF enableKeys?
        else {
            _self.console.log("Keyboard interaction disabled.");
        }
    }
    /**
     * Creates a control GUI (a dat.gui instance) for this
     * plot boilerplate instance.
     *
     * @method createGUI
     * @instance
     * @memberof PlotBoilerplate
     * @return {dat.gui.GUI}
     **/
    createGUI(props) {
        // This function moved to the helper utils.
        // We do not want to include the whole dat.GUI package.
        if (globalThis["utils"] && typeof globalThis["utils"].createGUI == "function")
            return globalThis["utils"].createGUI(this, props);
        else
            throw "Cannot create dat.GUI instance; did you load the ./utils/creategui helper function an the dat.GUI library?";
    }
} // END class PlotBoilerplate
/** @constant {number} */
PlotBoilerplate.DEFAULT_CANVAS_WIDTH = 1024;
/** @constant {number} */
PlotBoilerplate.DEFAULT_CANVAS_HEIGHT = 768;
/** @constant {number} */
PlotBoilerplate.DEFAULT_CLICK_TOLERANCE = 8;
/** @constant {number} */
PlotBoilerplate.DEFAULT_TOUCH_TOLERANCE = 32;
/**
 * A wrapper class for draggable items (mostly vertices).
 * @private
 **/
PlotBoilerplate.Draggable = (_a = class {
        constructor(item, typeName) {
            this.item = item;
            this.typeName = typeName;
        }
        isVertex() {
            return this.typeName == PlotBoilerplate.Draggable.VERTEX;
        }
        setVIndex(vindex) {
            this.vindex = vindex;
            return this;
        }
    },
    _a.VERTEX = "vertex",
    _a);
/**
 * A set of helper functions.
 **/
PlotBoilerplate.utils = {
    /**
     * Merge the elements in the 'extension' object into the 'base' object based on
     * the keys of 'base'.
     *
     * @param {Object} base
     * @param {Object} extension
     * @return {Object} base extended by the new attributes.
     **/
    safeMergeByKeys: (base, extension) => {
        for (var k in extension) {
            if (!extension.hasOwnProperty(k))
                continue;
            if (base.hasOwnProperty(k)) {
                var typ = typeof base[k];
                try {
                    if (typ == "boolean")
                        base[k] = !!JSON.parse(extension[k]);
                    else if (typ == "number")
                        base[k] = JSON.parse(extension[k]) * 1;
                    else if (typ == "function" && typeof extension[k] == "function")
                        base[k] = extension[k];
                    else
                        base[k] = extension[k];
                }
                catch (e) {
                    console.error("error in key ", k, extension[k], e);
                }
            }
            else {
                base[k] = extension[k];
            }
        }
        return base;
    },
    /**
     * A helper function to scale elements (usually the canvas) using CSS.
     *
     * transform-origin is at (0,0).
     *
     * @param {HTMLElement} element - The DOM element to scale.
     * @param {number} scaleX The - X scale factor.
     * @param {number} scaleY The - Y scale factor.
     * @return {void}
     **/
    setCSSscale: (element, scaleX, scaleY) => {
        element.style["transform-origin"] = "0 0";
        if (scaleX == 1.0 && scaleY == 1.0)
            element.style.transform = null;
        else
            element.style.transform = "scale(" + scaleX + "," + scaleY + ")";
    },
    // A helper for fetching data from objects.
    fetch: {
        /**
         * A helper function to the the object property value specified by the given key.
         *
         * @param {any} object   - The object to get the property's value from. Must not be null.
         * @param {string} key      - The key of the object property (the name).
         * @param {any}    fallback - A default value if the key does not exist.
         **/
        val: (obj, key, fallback) => {
            if (!obj.hasOwnProperty(key))
                return fallback;
            if (typeof obj[key] == "undefined")
                return fallback;
            return obj[key];
        },
        /**
         * A helper function to the the object property numeric value specified by the given key.
         *
         * @param {any}    object   - The object to get the property's value from. Must not be null.
         * @param {string} key      - The key of the object property (the name).
         * @param {number} fallback - A default value if the key does not exist.
         * @return {number}
         **/
        num: (obj, key, fallback) => {
            if (!obj.hasOwnProperty(key))
                return fallback;
            if (typeof obj[key] === "number")
                return obj[key];
            else {
                try {
                    return JSON.parse(obj[key]) * 1;
                }
                catch (e) {
                    return fallback;
                }
            }
        },
        /**
         * A helper function to the the object property boolean value specified by the given key.
         *
         * @param {any}     object   - The object to get the property's value from. Must not be null.
         * @param {string}  key      - The key of the object property (the name).
         * @param {boolean} fallback - A default value if the key does not exist.
         * @return {boolean}
         **/
        bool: (obj, key, fallback) => {
            if (!obj.hasOwnProperty(key))
                return fallback;
            if (typeof obj[key] == "boolean")
                return obj[key];
            else {
                try {
                    return !!JSON.parse(obj[key]);
                }
                catch (e) {
                    return fallback;
                }
            }
        },
        /**
         * A helper function to the the object property function-value specified by the given key.
         *
         * @param {any}      object   - The object to get the property's value from. Must not be null.
         * @param {string}   key      - The key of the object property (the name).
         * @param {function} fallback - A default value if the key does not exist.
         * @return {function}
         **/
        func: (obj, key, fallback) => {
            if (!obj.hasOwnProperty(key))
                return fallback;
            if (typeof obj[key] !== "function")
                return fallback;
            return obj[key];
        }
    },
    /**
     * Installs vertex listeners to the path's vertices so that controlpoints
     * move with their path points when dragged.
     *
     * Bézier path points with attr.bezierAutoAdjust==true will have their
     * two control points audo-updated if moved, too (keep path connections smooth).
     *
     * @param {BezierPath} bezierPath - The path to use auto-adjustment for.
     **/
    enableBezierPathAutoAdjust: (bezierPath) => {
        for (var i = 0; i < bezierPath.bezierCurves.length; i++) {
            // This should be wrapped into the BezierPath implementation.
            bezierPath.bezierCurves[i].startPoint.listeners.addDragListener(function (e) {
                var cindex = bezierPath.locateCurveByStartPoint(e.params.vertex);
                bezierPath.bezierCurves[cindex].startPoint.addXY(-e.params.dragAmount.x, -e.params.dragAmount.y);
                bezierPath.moveCurvePoint(cindex * 1, bezierPath.START_POINT, e.params.dragAmount);
                bezierPath.updateArcLengths();
            });
            bezierPath.bezierCurves[i].startControlPoint.listeners.addDragListener(function (e) {
                var cindex = bezierPath.locateCurveByStartControlPoint(e.params.vertex);
                if (!bezierPath.bezierCurves[cindex].startPoint.attr.bezierAutoAdjust)
                    return;
                bezierPath.adjustPredecessorControlPoint(cindex * 1, true, // obtain handle length?
                false // update arc lengths
                );
                bezierPath.updateArcLengths();
            });
            bezierPath.bezierCurves[i].endControlPoint.listeners.addDragListener(function (e) {
                var cindex = bezierPath.locateCurveByEndControlPoint(e.params.vertex);
                if (!bezierPath.bezierCurves[cindex % bezierPath.bezierCurves.length].endPoint.attr.bezierAutoAdjust)
                    return;
                bezierPath.adjustSuccessorControlPoint(cindex * 1, true, // obtain handle length?
                false // update arc lengths
                );
                bezierPath.updateArcLengths();
            });
            if (i + 1 == bezierPath.bezierCurves.length) {
                // && !bezierPath.adjustCircular ) {
                // Move last control point with the end point (if not circular)
                bezierPath.bezierCurves[bezierPath.bezierCurves.length - 1].endPoint.listeners.addDragListener(function (e) {
                    if (!bezierPath.adjustCircular) {
                        var cindex = bezierPath.locateCurveByEndPoint(e.params.vertex);
                        bezierPath.moveCurvePoint(cindex * 1, bezierPath.END_CONTROL_POINT, new _Vertex__WEBPACK_IMPORTED_MODULE_18__.Vertex({ x: e.params.dragAmount.x, y: e.params.dragAmount.y }));
                    }
                    bezierPath.updateArcLengths();
                });
            }
        } // END for
    }
}; // END utils
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlotBoilerplate);
//# sourceMappingURL=PlotBoilerplate.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Polygon.js":
/*!*********************************************!*\
  !*** ../plotboilerplate/src/esm/Polygon.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Polygon": () => (/* binding */ Polygon)
/* harmony export */ });
/* harmony import */ var _BezierPath__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BezierPath */ "../plotboilerplate/src/esm/BezierPath.js");
/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Bounds */ "../plotboilerplate/src/esm/Bounds.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * @author   Ikaros Kappler
 * @date     2018-04-14
 * @modified 2018-11-17 Added the containsVert function.
 * @modified 2018-12-04 Added the toSVGString function.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2019-10-25 Added the scale function.
 * @modified 2019-11-06 JSDoc update.
 * @modified 2019-11-07 Added toCubicBezierPath(number) function.
 * @modified 2019-11-22 Added the rotate(number,Vertex) function.
 * @modified 2020-03-24 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-10-30 Added the `addVertex` function.
 * @modified 2020-10-31 Added the `getVertexAt` function.
 * @modified 2020-11-06 Added the `move` function.
 * @modified 2020-11-10 Added the `getBounds` function.
 * @modified 2020-11-11 Generalized `move(Vertex)` to `move(XYCoords)`.
 * @modified 2021-01-20 Added UID.
 * @modified 2021-01-29 Added the `signedArea` function (was global function in the demos before).
 * @modified 2021-01-29 Added the `isClockwise` function.
 * @modified 2021-01-29 Added the `area` function.
 * @modified 2021-01-29 Changed the param type for `containsVert` from Vertex to XYCoords.
 * @version 1.7.0
 *
 * @file Polygon
 * @public
 **/




/**
 * @classdesc A polygon class. Any polygon consists of an array of vertices; polygons can be open or closed.
 *
 * @requires BezierPath
 * @requires Bounds
 * @requires SVGSerializabe
 * @requires UID
 * @requires UIDGenerator
 * @requires Vertex
 * @requires XYCoords
 */
class Polygon {
    /**
     * The constructor.
     *
     * @constructor
     * @name Polygon
     * @param {Vertex[]} vertices - An array of 2d vertices that shape the polygon.
     * @param {boolean} isOpen - Indicates if the polygon should be rendered as an open or closed shape.
     **/
    constructor(vertices, isOpen) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "Polygon";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_2__.UIDGenerator.next();
        if (typeof vertices == 'undefined')
            vertices = [];
        this.vertices = vertices;
        this.isOpen = isOpen;
    }
    ;
    /**
     * Add a vertex to the end of the `vertices` array.
     *
     * @method addVert
     * @param {Vertex} vert - The vertex to add.
     * @instance
     * @memberof Polygon
     **/
    addVertex(vert) {
        this.vertices.push(vert);
    }
    ;
    /**
     * Get the polygon vertex at the given position (index).
     *
     * The index may exceed the total vertex count, and will be wrapped around then (modulo).
     *
     * For k >= 0:
     *  - getVertexAt( vertices.length )     == getVertexAt( 0 )
     *  - getVertexAt( vertices.length + k ) == getVertexAt( k )
     *  - getVertexAt( -k )                  == getVertexAt( vertices.length -k )
     *
     * @metho getVertexAt
     * @param {number} index - The index of the desired vertex.
     * @instance
     * @memberof Polygon
     * @return {Vertex} At the given index.
     **/
    getVertexAt(index) {
        if (index < 0)
            return this.vertices[this.vertices.length - (Math.abs(index) % this.vertices.length)];
        else
            return this.vertices[index % this.vertices.length];
    }
    ;
    /**
     * Move the polygon's vertices by the given amount.
     *
     * @method move
     * @param {XYCoords} amount - The amount to move.
     * @instance
     * @memberof Polygon
     * @return {Polygon} this for chaining
     **/
    move(vert) {
        for (var i in this.vertices) {
            this.vertices[i].add(vert);
        }
        return this;
    }
    ;
    /**
     * Check if the given vertex is inside this polygon.<br>
     * <br>
     * Ray-casting algorithm found at<br>
     *    https://stackoverflow.com/questions/22521982/check-if-point-inside-a-polygon
     *
     * @method containsVert
     * @param {XYCoords} vert - The vertex to check. The new x-component.
     * @return {boolean} True if the passed vertex is inside this polygon. The polygon is considered closed.
     * @instance
     * @memberof Polygon
     **/
    containsVert(vert) {
        // ray-casting algorithm based on
        //    http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        var inside = false;
        for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            let xi = this.vertices[i].x, yi = this.vertices[i].y;
            let xj = this.vertices[j].x, yj = this.vertices[j].y;
            var intersect = ((yi > vert.y) != (yj > vert.y))
                && (vert.x < (xj - xi) * (vert.y - yi) / (yj - yi) + xi);
            if (intersect)
                inside = !inside;
        }
        return inside;
    }
    ;
    /**
     * Calculate the area of the given polygon (unsigned).
     *
     * Note that this does not work for self-intersecting polygons.
     *
     * @method area
     * @instance
     * @memberof Polygon
     * @return {number}
     */
    area() {
        return Polygon.utils.area(this.vertices);
    }
    ;
    /**
     * Calulate the signed polyon area by interpreting the polygon as a matrix
     * and calculating its determinant.
     *
     * @method signedArea
     * @instance
     * @memberof Polygon
     * @return {number}
     */
    signedArea() {
        return Polygon.utils.signedArea(this.vertices);
    }
    ;
    /**
     * Get the winding order of this polgon: clockwise or counterclockwise.
     *
     * @method isClockwise
     * @instance
     * @memberof Polygon
     * @return {boolean}
     */
    isClockwise() {
        return Polygon.utils.signedArea(this.vertices) < 0;
    }
    ;
    /**
     * Scale the polygon relative to the given center.
     *
     * @method scale
     * @param {number} factor - The scale factor.
     * @param {Vertex} center - The center of scaling.
     * @return {Polygon} this, for chaining.
     * @instance
     * @memberof Polygon
     **/
    scale(factor, center) {
        for (var i in this.vertices) {
            if (typeof this.vertices[i].scale == 'function')
                this.vertices[i].scale(factor, center);
            else
                console.log('There seems to be a null vertex!', this.vertices[i]);
        }
        return this;
    }
    ;
    /**
     * Rotate the polygon around the given center.
     *
     * @method rotate
     * @param {number} angle  - The rotation angle.
     * @param {Vertex} center - The center of rotation.
     * @instance
     * @memberof Polygon
     * @return {Polygon} this, for chaining.
     **/
    rotate(angle, center) {
        for (var i in this.vertices) {
            this.vertices[i].rotate(angle, center);
        }
        return this;
    }
    ;
    /**
     * Get the bounding box (bounds) of this polygon.
     *
     * @method getBounds
     * @instance
     * @memberof Polygon
     * @return {Bounds} The rectangular bounds of this polygon.
     **/
    getBounds() {
        return _Bounds__WEBPACK_IMPORTED_MODULE_1__.Bounds.computeFromVertices(this.vertices);
    }
    ;
    /**
     * Convert this polygon to a sequence of quadratic Bézier curves.<br>
     * <br>
     * The first vertex in the returned array is the start point.<br>
     * The following sequence are pairs of control-point-and-end-point:
     * <pre>startPoint, controlPoint0, pathPoint1, controlPoint1, pathPoint2, controlPoint2, ..., endPoint</pre>
     *
     * @method toQuadraticBezierData
     * @return {Vertex[]}  An array of 2d vertices that shape the quadratic Bézier curve.
     * @instance
     * @memberof Polygon
     **/
    toQuadraticBezierData() {
        if (this.vertices.length < 3)
            return [];
        var qbezier = [];
        var cc0 = this.vertices[0];
        var cc1 = this.vertices[1];
        var edgeCenter = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(cc0.x + (cc1.x - cc0.x) / 2, cc0.y + (cc1.y - cc0.y) / 2);
        qbezier.push(edgeCenter);
        var limit = this.isOpen ? this.vertices.length : this.vertices.length + 1;
        for (var t = 1; t < limit; t++) {
            cc0 = this.vertices[t % this.vertices.length];
            cc1 = this.vertices[(t + 1) % this.vertices.length];
            var edgeCenter = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(cc0.x + (cc1.x - cc0.x) / 2, cc0.y + (cc1.y - cc0.y) / 2);
            qbezier.push(cc0);
            qbezier.push(edgeCenter);
            cc0 = cc1;
        }
        return qbezier;
    }
    ;
    /**
     * Convert this polygon to a quadratic bezier curve, represented as an SVG data string.
     *
     * @method toQuadraticBezierSVGString
     * @return {string} The 'd' part for an SVG 'path' element.
     * @instance
     * @memberof Polygon
     **/
    toQuadraticBezierSVGString() {
        var qdata = this.toQuadraticBezierData();
        if (qdata.length == 0)
            return "";
        var buffer = ['M ' + qdata[0].x + ' ' + qdata[0].y];
        for (var i = 1; i < qdata.length; i += 2) {
            buffer.push('Q ' + qdata[i].x + ' ' + qdata[i].y + ', ' + qdata[i + 1].x + ' ' + qdata[i + 1].y);
        }
        return buffer.join(' ');
    }
    ;
    /**
     * Convert this polygon to a sequence of cubic Bézier curves.<br>
     * <br>
     * The first vertex in the returned array is the start point.<br>
     * The following sequence are triplets of (first-control-point, secnond-control-point, end-point):<br>
     * <pre>startPoint, controlPoint0_0, controlPoint1_1, pathPoint1, controlPoint1_0, controlPoint1_1, ..., endPoint</pre>
     *
     * @method toCubicBezierData
     * @param {number=} threshold - An optional threshold (default=1.0) how strong the curve segments
     *                              should over-/under-drive. Should be between 0.0 and 1.0 for best
     *                              results but other values are allowed.
     * @return {Vertex[]}  An array of 2d vertices that shape the cubic Bézier curve.
     * @instance
     * @memberof Polygon
     **/
    toCubicBezierData(threshold) {
        if (typeof threshold == 'undefined')
            threshold = 1.0;
        if (this.vertices.length < 3)
            return [];
        var cbezier = [];
        var a = this.vertices[0];
        var b = this.vertices[1];
        var edgeCenter = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(a.x + (b.x - a.x) / 2, a.y + (b.y - a.y) / 2);
        cbezier.push(edgeCenter);
        var limit = this.isOpen ? this.vertices.length - 1 : this.vertices.length;
        for (var t = 0; t < limit; t++) {
            var a = this.vertices[t % this.vertices.length];
            var b = this.vertices[(t + 1) % this.vertices.length];
            var c = this.vertices[(t + 2) % this.vertices.length];
            var aCenter = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(a.x + (b.x - a.x) / 2, a.y + (b.y - a.y) / 2);
            var bCenter = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(b.x + (c.x - b.x) / 2, b.y + (c.y - b.y) / 2);
            var a2 = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(aCenter.x + (b.x - aCenter.x) * threshold, aCenter.y + (b.y - aCenter.y) * threshold);
            var b0 = new _Vertex__WEBPACK_IMPORTED_MODULE_3__.Vertex(bCenter.x + (b.x - bCenter.x) * threshold, bCenter.y + (b.y - bCenter.y) * threshold);
            cbezier.push(a2);
            cbezier.push(b0);
            cbezier.push(bCenter);
        }
        return cbezier;
    }
    ;
    /**
     * Convert this polygon to a cubic bezier curve, represented as an SVG data string.
     *
     * @method toCubicBezierSVGString
     * @return {string} The 'd' part for an SVG 'path' element.
     * @instance
     * @memberof Polygon
     **/
    toCubicBezierSVGString(threshold) {
        var qdata = this.toCubicBezierData(threshold);
        if (qdata.length == 0)
            return "";
        var buffer = ['M ' + qdata[0].x + ' ' + qdata[0].y];
        for (var i = 1; i < qdata.length; i += 3) {
            buffer.push('C ' + qdata[i].x + ' ' + qdata[i].y + ', ' + qdata[i + 1].x + ' ' + qdata[i + 1].y + ', ' + qdata[i + 2].x + ' ' + qdata[i + 2].y);
        }
        return buffer.join(' ');
    }
    ;
    /**
     * Convert this polygon to a cubic bezier path instance.
     *
     * @method toCubicBezierPath
     * @param {number} threshold - The threshold, usually from 0.0 to 1.0.
     * @return {BezierPath}      - A bezier path instance.
     * @instance
     * @memberof Polygon
     **/
    toCubicBezierPath(threshold) {
        var qdata = this.toCubicBezierData(threshold);
        // Conver the linear path vertices to a two-dimensional path array
        var pathdata = [];
        for (var i = 0; i + 3 < qdata.length; i += 3) {
            pathdata.push([qdata[i], qdata[i + 3], qdata[i + 1], qdata[i + 2]]);
        }
        return _BezierPath__WEBPACK_IMPORTED_MODULE_0__.BezierPath.fromArray(pathdata);
    }
    ;
    /**
     * Create an SVG representation of this polygon.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} The SVG string.
     * @instance
     * @memberof Polygon
     **/
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push('<path');
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' d="');
        if (this.vertices.length > 0) {
            buffer.push('M ');
            buffer.push(this.vertices[0].x.toString());
            buffer.push(' ');
            buffer.push(this.vertices[0].y.toString());
            for (var i = 1; i < this.vertices.length; i++) {
                buffer.push(' L ');
                buffer.push(this.vertices[i].x.toString());
                buffer.push(' ');
                buffer.push(this.vertices[i].y.toString());
            }
            if (!this.isOpen) {
                buffer.push(' Z');
            }
        }
        buffer.push('" />');
        return buffer.join('');
    }
    ;
}
Polygon.utils = {
    /**
     * Calculate the area of the given polygon (unsigned).
     *
     * Note that this does not work for self-intersecting polygons.
     *
     * @name area
     * @return {number}
     */
    area(vertices) {
        // Found at:
        //    https://stackoverflow.com/questions/16285134/calculating-polygon-area
        let total = 0.0;
        for (var i = 0, l = vertices.length; i < l; i++) {
            const addX = vertices[i].x;
            const addY = vertices[(i + 1) % l].y;
            const subX = vertices[(i + 1) % l].x;
            const subY = vertices[i].y;
            total += (addX * addY * 0.5);
            total -= (subX * subY * 0.5);
        }
        return Math.abs(total);
    },
    /**
     * Calulate the signed polyon area by interpreting the polygon as a matrix
     * and calculating its determinant.
     *
     * @name signedArea
     * @return {number}
     */
    signedArea(vertices) {
        let sum = 0;
        const n = vertices.length;
        for (var i = 0; i < n; i++) {
            const j = (i + 1) % n;
            sum += (vertices[j].x - vertices[i].x) * (vertices[i].y + vertices[j].y);
        }
        return sum;
    }
};
//# sourceMappingURL=Polygon.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/SVGBuilder.js":
/*!************************************************!*\
  !*** ../plotboilerplate/src/esm/SVGBuilder.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SVGBuilder": () => (/* binding */ SVGBuilder)
/* harmony export */ });
/**
 * Todos:
 *  + use a Drawable interface
 *  + use a SVGSerializable interface
 *
 * @require Vertex
 *
 * @deprecated THIS CLASS IS DEPRECATED. Please use the new `drawutilssvg` instead.
 *
 * @author   Ikaros Kappler
 * @date     2018-12-04
 * @modified 2019-11-07 Added the 'Triangle' style class.
 * @modified 2019-11-13 Added the <?xml ...?> tag.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-12-17 Added Circle and CircleSection style classes.
 * @modified 2021-01-26 DEPRECATION
 * @version  1.0.5
 **/
/**
 * @classdesc A default SVG builder.
 *
 * @requires SVGSerializable
 * @requires Vertex
 */
class SVGBuilder {
    /**
     * @constructor
     **/
    constructor() {
        console.warn("THIS CLASS IS DEPRECATED. Please use the new 'drawutilssvg' instead.");
    }
    ;
    /**
     *  Builds the SVG code from the given list of drawables.
     *
     * @param {object[]} drawables - The drawable elements (should implement Drawable) to be converted (each must have a toSVGString-function).
     * @param {object}   options  - { canvasSize, zoom, offset }
     * @return {string}
     **/
    build(drawables, options) {
        var nl = '\n';
        var indent = '  ';
        var buffer = [];
        buffer.push('<?xml version="1.0" encoding="UTF-8"?>' + nl);
        buffer.push('<svg width="' + options.canvasSize.width + '" height="' + options.canvasSize.height + '"');
        buffer.push(' viewBox="');
        buffer.push('0');
        buffer.push(' ');
        buffer.push('0');
        buffer.push(' ');
        buffer.push(options.canvasSize.width.toString());
        buffer.push(' ');
        buffer.push(options.canvasSize.height.toString());
        buffer.push('"');
        buffer.push(' xmlns="http://www.w3.org/2000/svg">' + nl);
        buffer.push(indent + '<defs>' + nl);
        buffer.push(indent + '<style>' + nl);
        buffer.push(indent + indent + ' .Vertex { fill : blue; stroke : none; } ' + nl);
        buffer.push(indent + indent + ' .Triangle { fill : none; stroke : turquoise; stroke-width : 1px; } ' + nl);
        buffer.push(indent + indent + ' .Polygon { fill : none; stroke : green; stroke-width : 2px; } ' + nl);
        buffer.push(indent + indent + ' .BezierPath { fill : none; stroke : blue; stroke-width : 2px; } ' + nl);
        buffer.push(indent + indent + ' .VEllipse { fill : none; stroke : black; stroke-width : 1px; } ' + nl);
        buffer.push(indent + indent + ' .Line { fill : none; stroke : purple; stroke-width : 1px; } ' + nl);
        buffer.push(indent + indent + ' .Circle { fill : none; stroke : purple; stroke-width : 1px; } ' + nl);
        buffer.push(indent + indent + ' .CircleSector { fill : none; stroke : purple; stroke-width : 1px; } ' + nl);
        buffer.push(indent + '</style>' + nl);
        buffer.push(indent + '</defs>' + nl);
        buffer.push(indent + '<g class="main-g"');
        if (options.zoom || options.offset) {
            buffer.push(' transform="');
            if (options.zoom)
                buffer.push('scale(' + options.zoom.x + ',' + options.zoom.y + ')');
            if (options.offset)
                buffer.push(' translate(' + options.offset.x + ',' + options.offset.y + ')');
            buffer.push('"');
        }
        buffer.push('>' + nl);
        for (var i in drawables) {
            var d = drawables[i];
            if (typeof d.toSVGString == 'function') {
                buffer.push(indent + indent);
                buffer.push(d.toSVGString({ 'className': d.className }));
                buffer.push(nl);
            }
            else {
                console.warn('Unrecognized drawable type has no toSVGString()-function. Ignoring: ' + d.className);
            }
        }
        buffer.push(indent + '</g>' + nl);
        buffer.push('</svg>' + nl);
        return buffer.join('');
    }
    ;
}
//# sourceMappingURL=SVGBuilder.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Triangle.js":
/*!**********************************************!*\
  !*** ../plotboilerplate/src/esm/Triangle.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Triangle": () => (/* binding */ Triangle)
/* harmony export */ });
/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Bounds */ "../plotboilerplate/src/esm/Bounds.js");
/* harmony import */ var _Circle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Circle */ "../plotboilerplate/src/esm/Circle.js");
/* harmony import */ var _Line__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Line */ "../plotboilerplate/src/esm/Line.js");
/* harmony import */ var _Polygon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Polygon */ "../plotboilerplate/src/esm/Polygon.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/* harmony import */ var _geomutils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./geomutils */ "../plotboilerplate/src/esm/geomutils.js");
/**
 * @author    Ikaros Kappler
 * @date_init 2012-10-17 (Wrote a first version of this in that year).
 * @date      2018-04-03 (Refactored the code into a new class).
 * @modified  2018-04-28 Added some documentation.
 * @modified  2019-09-11 Added the scaleToCentroid(Number) function (used by the walking triangle demo).
 * @modified  2019-09-12 Added beautiful JSDoc compliable comments.
 * @modified  2019-11-07 Added to toSVG(options) function to make Triangles renderable as SVG.
 * @modified  2019-12-09 Fixed the determinant() function. The calculation was just wrong.
 * @modified  2020-03-16 (Corona times) Added the 'fromArray' function.
 * @modified  2020-03-17 Added the Triangle.toPolygon() function.
 * @modified  2020-03-17 Added proper JSDoc comments.
 * @modified  2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified  2020-05-09 Added the new Circle class (ported to Typescript from the demos).
 * @modified  2020-05-12 Added getIncircularTriangle() function.
 * @modified  2020-05-12 Added getIncircle() function.
 * @modified  2020-05-12 Fixed the signature of getCircumcirle(). Was still a generic object.
 * @modified  2020-06-18 Added the `getIncenter` function.
 * @modified  2020-12-28 Added the `getArea` function.
 * @modified  2021-01-20 Added UID.
 * @modified  2021-01-22 Always updating circumcircle when retieving it.
 * @version   2.5.1
 *
 * @file Triangle
 * @fileoverview A simple triangle class: three vertices.
 * @public
 **/







/**
 * @classdesc A triangle class for triangulations.
 *
 * The class was written for a Delaunay trinagulation demo so it might
 * contain some strange and unexpected functions.
 *
 * @requires Bounds
 * @requires Circle
 * @requires Line
 * @requires Vertex
 * @requires Polygon
 * @requires SVGSerializale
 * @requires UID
 * @requires UIDGenerator
 * @requires geomutils
 *
 */
class Triangle {
    /**
     * The constructor.
     *
     * @constructor
     * @name Triangle
     * @param {Vertex} a - The first vertex of the triangle.
     * @param {Vertex} b - The second vertex of the triangle.
     * @param {Vertex} c - The third vertex of the triangle.
     **/
    constructor(a, b, c) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "Triangle";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_4__.UIDGenerator.next();
        this.a = a;
        this.b = b;
        this.c = c;
        this.calcCircumcircle();
    }
    /**
     * Create a new triangle from the given array of vertices.
     *
     * The array must have at least three vertices, otherwise an error will be raised.
     * This function will not create copies of the vertices.
     *
     * @method fromArray
     * @static
     * @param {Array<Vertex>} arr - The required array with at least three vertices.
     * @memberof Vertex
     * @return {Triangle}
     **/
    static fromArray(arr) {
        if (arr.length < 3)
            throw `Cannot create triangle from array with less than three vertices (${arr.length})`;
        return new Triangle(arr[0], arr[1], arr[2]);
    }
    ;
    /**
     * Get the area of this triangle. The returned area is never negative.
     *
     * If you are interested in the signed area, please consider using the
     * `Triangle.utils.signedArea` helper function. This method just returns
     * the absolute value of the signed area.
     *
     * @method getArea
     * @instance
     * @memberof Triangle
     * @return {number} The non-negative area of this triangle.
     */
    getArea() {
        return Math.abs(Triangle.utils.signedArea(this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y));
    }
    ;
    /**
     * Get the centroid of this triangle.
     *
     * The centroid is the average midpoint for each side.
     *
     * @method getCentroid
     * @return {Vertex} The centroid
     * @instance
     * @memberof Triangle
     **/
    getCentroid() {
        return new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex((this.a.x + this.b.x + this.c.x) / 3, (this.a.y + this.b.y + this.c.y) / 3);
    }
    ;
    /**
     * Scale the triangle towards its centroid.
     *
     * @method scaleToCentroid
     * @param {number} - The scale factor to use. That can be any scalar.
     * @return {Triangle} this (for chaining)
     * @instance
     * @memberof Triangle
     */
    scaleToCentroid(factor) {
        let centroid = this.getCentroid();
        this.a.scale(factor, centroid);
        this.b.scale(factor, centroid);
        this.c.scale(factor, centroid);
        return this;
    }
    ;
    /**
     * Get the circumcircle of this triangle.
     *
     * The circumcircle is that unique circle on which all three
     * vertices of this triangle are located on.
     *
     * Please note that for performance reasons any changes to vertices will not reflect in changes
     * of the circumcircle (center or radius). Please call the calcCirumcircle() function
     * after triangle vertex changes.
     *
     * @method getCircumcircle
     * @return {Object} - { center:Vertex, radius:float }
     * @instance
     * @memberof Triangle
     */
    getCircumcircle() {
        // if( !this.center || !this.radius ) 
        this.calcCircumcircle();
        return new _Circle__WEBPACK_IMPORTED_MODULE_1__.Circle(this.center.clone(), this.radius);
    }
    ;
    /**
     * Check if this triangle and the passed triangle share an
     * adjacent edge.
     *
     * For edge-checking Vertex.equals is used which uses an
     * an epsilon for comparison.
     *
     * @method isAdjacent
     * @param {Triangle} tri - The second triangle to check adjacency with.
     * @return {boolean} - True if this and the passed triangle have at least one common edge.
     * @instance
     * @memberof Triangle
     */
    isAdjacent(tri) {
        var a = this.a.equals(tri.a) || this.a.equals(tri.b) || this.a.equals(tri.c);
        var b = this.b.equals(tri.a) || this.b.equals(tri.b) || this.b.equals(tri.c);
        var c = this.c.equals(tri.a) || this.c.equals(tri.b) || this.c.equals(tri.c);
        return (a && b) || (a && c) || (b && c);
    }
    ;
    /**
     * Get that vertex of this triangle (a,b,c) that is not vert1 nor vert2 of
     * the passed two.
     *
     * @method getThirdVertex
     * @param {Vertex} vert1 - The first vertex.
     * @param {Vertex} vert2 - The second vertex.
     * @return {Vertex} - The third vertex of this triangle that makes up the whole triangle with vert1 and vert2.
     * @instance
     * @memberof Triangle
     */
    getThirdVertex(vert1, vert2) {
        if (this.a.equals(vert1) && this.b.equals(vert2) || this.a.equals(vert2) && this.b.equals(vert1))
            return this.c;
        if (this.b.equals(vert1) && this.c.equals(vert2) || this.b.equals(vert2) && this.c.equals(vert1))
            return this.a;
        //if( this.c.equals(vert1) && this.a.equals(vert2) || this.c.equals(vert2) && this.a.equals(vert1) )
        return this.b;
    }
    ;
    /**
     * Re-compute the circumcircle of this triangle (if the vertices
     * have changed).
     *
     * The circumcenter and radius are stored in this.center and
     * this.radius. There is a third result: radius_squared (for internal computations).
     *
     * @method calcCircumcircle
     * @return void
     * @instance
     * @memberof Triangle
     */
    calcCircumcircle() {
        // From
        //    http://www.exaflop.org/docs/cgafaq/cga1.html
        const A = this.b.x - this.a.x;
        const B = this.b.y - this.a.y;
        const C = this.c.x - this.a.x;
        const D = this.c.y - this.a.y;
        const E = A * (this.a.x + this.b.x) + B * (this.a.y + this.b.y);
        const F = C * (this.a.x + this.c.x) + D * (this.a.y + this.c.y);
        const G = 2.0 * (A * (this.c.y - this.b.y) - B * (this.c.x - this.b.x));
        let dx, dy;
        if (Math.abs(G) < Triangle.EPSILON) {
            // Collinear - find extremes and use the midpoint
            const bounds = this.bounds();
            this.center = new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex((bounds.min.x + bounds.max.x) / 2, (bounds.min.y + bounds.max.y) / 2);
            dx = this.center.x - bounds.min.x;
            dy = this.center.y - bounds.min.y;
        }
        else {
            const cx = (D * E - B * F) / G;
            const cy = (A * F - C * E) / G;
            this.center = new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(cx, cy);
            dx = this.center.x - this.a.x;
            dy = this.center.y - this.a.y;
        }
        this.radius_squared = dx * dx + dy * dy;
        this.radius = Math.sqrt(this.radius_squared);
    }
    ; // END calcCircumcircle
    /**
     * Check if the passed vertex is inside this triangle's
     * circumcircle.
     *
     * @method inCircumcircle
     * @param {Vertex} v - The vertex to check.
     * @return {boolean}
     * @instance
     * @memberof Triangle
     */
    inCircumcircle(v) {
        const dx = this.center.x - v.x;
        const dy = this.center.y - v.y;
        const dist_squared = dx * dx + dy * dy;
        return (dist_squared <= this.radius_squared);
    }
    ;
    /**
     * Get the rectangular bounds for this triangle.
     *
     * @method bounds
     * @return {Bounds} - The min/max bounds of this triangle.
     * @instance
     * @memberof Triangle
     */
    bounds() {
        return new _Bounds__WEBPACK_IMPORTED_MODULE_0__.Bounds(new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(Triangle.utils.min3(this.a.x, this.b.x, this.c.x), Triangle.utils.min3(this.a.y, this.b.y, this.c.y)), new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(Triangle.utils.max3(this.a.x, this.b.x, this.c.x), Triangle.utils.max3(this.a.y, this.b.y, this.c.y)));
    }
    ;
    /**
     * Convert this triangle to a polygon instance.
     *
     * Plase note that this conversion does not perform a deep clone.
     *
     * @method toPolygon
     * @return {Polygon} A new polygon representing this triangle.
     * @instance
     * @memberof Triangle
     **/
    toPolygon() {
        return new _Polygon__WEBPACK_IMPORTED_MODULE_3__.Polygon([this.a, this.b, this.c]);
    }
    ;
    /**
     * Get the determinant of this triangle.
     *
     * @method determinant
     * @return {number} - The determinant (float).
     * @instance
     * @memberof Triangle
     */
    determinant() {
        // (b.y - a.y)*(c.x - b.x) - (c.y - b.y)*(b.x - a.x);
        return (this.b.y - this.a.y) * (this.c.x - this.b.x) - (this.c.y - this.b.y) * (this.b.x - this.a.x);
    }
    ;
    /**
     * Checks if the passed vertex (p) is inside this triangle.
     *
     * Note: matrix determinants rock.
     *
     * @method containsPoint
     * @param {Vertex} p - The vertex to check.
     * @return {boolean}
     * @instance
     * @memberof Triangle
     */
    containsPoint(p) {
        return Triangle.utils.pointIsInTriangle(p.x, p.y, this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y);
    }
    ;
    /**
     * Get that inner triangle which defines the maximal incircle.
     *
     * @return {Triangle} The triangle of those points in this triangle that define the incircle.
     */
    getIncircularTriangle() {
        const lineA = new _Line__WEBPACK_IMPORTED_MODULE_2__.Line(this.a, this.b);
        const lineB = new _Line__WEBPACK_IMPORTED_MODULE_2__.Line(this.b, this.c);
        const lineC = new _Line__WEBPACK_IMPORTED_MODULE_2__.Line(this.c, this.a);
        const bisector1 = _geomutils__WEBPACK_IMPORTED_MODULE_6__.geomutils.nsectAngle(this.b, this.a, this.c, 2)[0]; // bisector of first angle (in b)
        const bisector2 = _geomutils__WEBPACK_IMPORTED_MODULE_6__.geomutils.nsectAngle(this.c, this.b, this.a, 2)[0]; // bisector of second angle (in c)
        const intersection = bisector1.intersection(bisector2);
        // Find the closest points on one of the polygon lines (all have same distance by construction)
        const circleIntersA = lineA.getClosestPoint(intersection);
        const circleIntersB = lineB.getClosestPoint(intersection);
        const circleIntersC = lineC.getClosestPoint(intersection);
        return new Triangle(circleIntersA, circleIntersB, circleIntersC);
    }
    ;
    /**
     * Get the incircle of this triangle. That is the circle that touches each side
     * of this triangle in exactly one point.
     *
     * Note this just calls getIncircularTriangle().getCircumcircle()
     *
     * @return {Circle} The incircle of this triangle.
     */
    getIncircle() {
        return this.getIncircularTriangle().getCircumcircle();
    }
    ;
    /**
     * Get the incenter of this triangle (which is the center of the circumcircle).
     *
     * Note: due to performance reasonst the incenter is buffered inside the triangle because
     *       computing it is relatively expensive. If a, b or c have changed you should call the
     *       calcCircumcircle() function first, otherwise you might get wrong results.
     * @return Vertex The incenter of this triangle.
     **/
    getIncenter() {
        if (!this.center || !this.radius)
            this.calcCircumcircle();
        return this.center.clone();
    }
    ;
    /**
     * Converts this triangle into a human-readable string.
     *
     * @method toString
     * @return {string}
     * @instance
     * @memberof Triangle
     */
    toString() {
        return '{ a : ' + this.a.toString() + ', b : ' + this.b.toString() + ', c : ' + this.c.toString() + '}';
    }
    ;
    /**
     * Create an SVG representation of this triangle.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} The SVG string.
     * @instance
     * @memberof Triangle
     **/
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push('<path');
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' d="');
        var vertices = [this.a, this.b, this.c];
        if (vertices.length > 0) {
            buffer.push('M ');
            buffer.push(vertices[0].x);
            buffer.push(' ');
            buffer.push(vertices[0].y);
            for (var i = 1; i < vertices.length; i++) {
                buffer.push(' L ');
                buffer.push(vertices[i].x);
                buffer.push(' ');
                buffer.push(vertices[i].y);
            }
            //if( !this.isOpen ) {
            buffer.push(' Z');
            //}
        }
        buffer.push('" />');
        return buffer.join('');
    }
    ;
}
/**
 * An epsilon for comparison.
 * This should be the same epsilon as in Vertex.
 *
 * @private
 **/
Triangle.EPSILON = 1.0e-6;
Triangle.utils = {
    // Used in the bounds() function.
    max3(a, b, c) {
        return (a >= b && a >= c) ? a : (b >= a && b >= c) ? b : c;
    },
    min3(a, b, c) {
        return (a <= b && a <= c) ? a : (b <= a && b <= c) ? b : c;
    },
    signedArea(p0x, p0y, p1x, p1y, p2x, p2y) {
        return 0.5 * (-p1y * p2x + p0y * (-p1x + p2x) + p0x * (p1y - p2y) + p1x * p2y);
    },
    /**
     * Used by the containsPoint() function.
     *
     * @private
     **/
    pointIsInTriangle(px, py, p0x, p0y, p1x, p1y, p2x, p2y) {
        //
        // Point-in-Triangle test found at
        //   http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-2d-triangle
        // var area : number = 1/2*(-p1y*p2x + p0y*(-p1x + p2x) + p0x*(p1y - p2y) + p1x*p2y);
        var area = Triangle.utils.signedArea(p0x, p0y, p1x, p1y, p2x, p2y);
        var s = 1 / (2 * area) * (p0y * p2x - p0x * p2y + (p2y - p0y) * px + (p0x - p2x) * py);
        var t = 1 / (2 * area) * (p0x * p1y - p0y * p1x + (p0y - p1y) * px + (p1x - p0x) * py);
        return s > 0 && t > 0 && (1 - s - t) > 0;
    }
};
//# sourceMappingURL=Triangle.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/UIDGenerator.js":
/*!**************************************************!*\
  !*** ../plotboilerplate/src/esm/UIDGenerator.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "UIDGenerator": () => (/* binding */ UIDGenerator)
/* harmony export */ });
/**
 * @classdesc A static UIDGenerator.
 *
 * @author  Ikaros Kappler
 * @date    2021-01-20
 * @version 1.0.0
 */
class UIDGenerator {
    static next() {
        return `${UIDGenerator.current++}`;
    }
}
UIDGenerator.current = 0;
//# sourceMappingURL=UIDGenerator.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/VEllipse.js":
/*!**********************************************!*\
  !*** ../plotboilerplate/src/esm/VEllipse.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VEllipse": () => (/* binding */ VEllipse)
/* harmony export */ });
/* harmony import */ var _Line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Line */ "../plotboilerplate/src/esm/Line.js");
/* harmony import */ var _Vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Vector */ "../plotboilerplate/src/esm/Vector.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CubicBezierCurve */ "../plotboilerplate/src/esm/CubicBezierCurve.js");
/**
 * @author   Ikaros Kappler
 * @date     2018-11-28
 * @modified 2018-12-04 Added the toSVGString function.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified 2021-01-20 Added UID.
 * @modified 2021-02-14 Added functions `radiusH` and `radiusV`.
 * @modified 2021-02-26 Added helper function `decribeSVGArc(...)`.
 * @modified 2021-03-01 Added attribute `rotation` to allow rotation of ellipses.
 * @modified 2021-03-03 Added the `vertAt` and `perimeter` methods.
 * @modified 2021-03-05 Added the `getFoci`, `normalAt` and `tangentAt` methods.
 * @modified 2021-03-09 Added the `clone` and `rotate` methods.
 * @modified 2021-03-10 Added the `toCubicBezier` method.
 * @modified 2021-03-15 Added `VEllipse.quarterSegmentCount` and `VEllipse.scale` functions.
 * @modified 2021-03-19 Added the `VEllipse.rotate` function.
 * @version  1.2.2
 *
 * @file VEllipse
 * @fileoverview Ellipses with a center and an x- and a y-axis (stored as a vertex).
 **/





/**
 * @classdesc An ellipse class based on two vertices [centerX,centerY] and [radiusX,radiusY].
 *
 * @requires SVGSerializable
 * @requires UID
 * @requires UIDGenerator
 * @requires Vertex
 */
class VEllipse {
    /**
     * The constructor.
     *
     * @constructor
     * @param {Vertex} center - The ellipses center.
     * @param {Vertex} axis - The x- and y-axis (the two radii encoded in a control point).
     * @param {Vertex} rotation - [optional, default=0] The rotation of this ellipse.
     * @name VEllipse
     **/
    constructor(center, axis, rotation) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "VEllipse";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_3__.UIDGenerator.next();
        this.center = center;
        this.axis = axis;
        this.rotation = rotation || 0.0;
    }
    /**
     * Clone this ellipse (deep clone).
     *
     * @return {VEllipse} A copy of this ellipse.s
     */
    clone() {
        return new VEllipse(this.center.clone(), this.axis.clone(), this.rotation);
    }
    /**
     * Get the non-negative horizonal radius of this ellipse.
     *
     * @method radiusH
     * @instance
     * @memberof VEllipse
     * @return {number} The unsigned horizontal radius of this ellipse.
     */
    radiusH() {
        return Math.abs(this.signedRadiusH());
    }
    /**
     * Get the signed horizonal radius of this ellipse.
     *
     * @method signedRadiusH
     * @instance
     * @memberof VEllipse
     * @return {number} The signed horizontal radius of this ellipse.
     */
    signedRadiusH() {
        // return Math.abs(this.axis.x - this.center.x);
        // Rotate axis back to origin before calculating radius
        // return Math.abs(new Vertex(this.axis).rotate(-this.rotation,this.center).x - this.center.x);
        return new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(this.axis).rotate(-this.rotation, this.center).x - this.center.x;
    }
    /**
     * Get the non-negative vertical radius of this ellipse.
     *
     * @method radiusV
     * @instance
     * @memberof VEllipse
     * @return {number} The unsigned vertical radius of this ellipse.
     */
    radiusV() {
        return Math.abs(this.signedRadiusV());
    }
    /**
     * Get the signed vertical radius of this ellipse.
     *
     * @method radiusV
     * @instance
     * @memberof VEllipse
     * @return {number} The signed vertical radius of this ellipse.
     */
    signedRadiusV() {
        // return Math.abs(this.axis.y - this.center.y);
        // Rotate axis back to origin before calculating radius
        // return Math.abs(new Vertex(this.axis).rotate(-this.rotation,this.center).y - this.center.y);
        return new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(this.axis).rotate(-this.rotation, this.center).y - this.center.y;
    }
    /**
     * Scale this ellipse by the given factor from the center point. The factor will be applied to both radii.
     *
     * @method scale
     * @instance
     * @memberof VEllipse
     * @param {number} factor - The factor to scale by.
     * @return {VEllipse} this for chaining.
     */
    scale(factor) {
        this.axis.scale(factor, this.center);
        return this;
    }
    /**
     * Rotate this ellipse around its center.
     *
     * @method rotate
     * @instance
     * @memberof VEllipse
     * @param {number} angle - The angle to rotate by.
     * @returns {VEllipse} this for chaining.
     */
    rotate(angle) {
        this.axis.rotate(angle, this.center);
        this.rotation += angle;
        return this;
    }
    /**
     * Get the vertex on the ellipse's outline at the given angle.
     *
     * @method vertAt
     * @instance
     * @memberof VEllipse
     * @param {number} angle - The angle to determine the vertex at.
     * @return {Vertex} The vertex on the outline at the given angle.
     */
    vertAt(angle) {
        // Tanks to Narasinham for the vertex-on-ellipse equations
        // https://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle
        const a = this.radiusH();
        const b = this.radiusV();
        return new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(VEllipse.utils.polarToCartesian(this.center.x, this.center.y, a, b, angle)).rotate(this.rotation, this.center);
    }
    /**
     * Get the normal vector at the given angle.
     * The normal vector is the vector that intersects the ellipse in a 90 degree angle
     * at the given point (speicified by the given angle).
     *
     * Length of desired normal vector can be specified, default is 1.0.
     *
     * @method normalAt
     * @instance
     * @memberof VEllipse
     * @param {number} angle - The angle to get the normal vector at.
     * @param {number=1.0} length - [optional, default=1] The length of the returned vector.
     */
    normalAt(angle, length) {
        const point = this.vertAt(angle);
        const foci = this.getFoci();
        // Calculate the angle between [point,focusA] and [point,focusB]
        const angleA = new _Line__WEBPACK_IMPORTED_MODULE_0__.Line(point, foci[0]).angle();
        const angleB = new _Line__WEBPACK_IMPORTED_MODULE_0__.Line(point, foci[1]).angle();
        const centerAngle = angleA + (angleB - angleA) / 2.0;
        const endPointA = point.clone().addX(50).clone().rotate(centerAngle, point);
        const endPointB = point
            .clone()
            .addX(50)
            .clone()
            .rotate(Math.PI + centerAngle, point);
        if (this.center.distance(endPointA) < this.center.distance(endPointB)) {
            return new _Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(point, endPointB);
        }
        else {
            return new _Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(point, endPointA);
        }
    }
    /**
     * Get the tangent vector at the given angle.
     * The tangent vector is the vector that touches the ellipse exactly at the given given
     * point (speicified by the given angle).
     *
     * Note that the tangent is just 90 degree rotated normal vector.
     *
     * Length of desired tangent vector can be specified, default is 1.0.
     *
     * @method tangentAt
     * @instance
     * @memberof VEllipse
     * @param {number} angle - The angle to get the tangent vector at.
     * @param {number=1.0} length - [optional, default=1] The length of the returned vector.
     */
    tangentAt(angle, length) {
        const normal = this.normalAt(angle, length);
        // Rotate the normal by 90 degrees, then it is the tangent.
        normal.b.rotate(Math.PI / 2, normal.a);
        return normal;
    }
    /**
     * Get the perimeter of this ellipse.
     *
     * @method perimeter
     * @instance
     * @memberof VEllipse
     * @return {number}
     */
    perimeter() {
        // This method does not use an iterative approximation to determine the perimeter, but it uses
        // a wonderful closed approximation found by Srinivasa Ramanujan.
        // Matt Parker made a neat video about it:
        //    https://www.youtube.com/watch?v=5nW3nJhBHL0
        const a = this.radiusH();
        const b = this.radiusV();
        return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
    }
    /**
     * Get the two foci of this ellipse.
     *
     * @method getFoci
     * @instance
     * @memberof VEllipse
     * @return {Array<Vertex>} An array with two elements, the two focal points of the ellipse (foci).
     */
    getFoci() {
        // https://www.mathopenref.com/ellipsefoci.html
        const rh = this.radiusH();
        const rv = this.radiusV();
        const sdiff = rh * rh - rv * rv;
        // f is the distance of each focs to the center.
        const f = Math.sqrt(Math.abs(sdiff));
        // Foci on x- or y-axis?
        if (sdiff < 0) {
            return [
                this.center.clone().addY(f).rotate(this.rotation, this.center),
                this.center.clone().addY(-f).rotate(this.rotation, this.center)
            ];
        }
        else {
            return [
                this.center.clone().addX(f).rotate(this.rotation, this.center),
                this.center.clone().addX(-f).rotate(this.rotation, this.center)
            ];
        }
    }
    /**
     * Get equally distributed points on the outline of this ellipse.
     *
     * @param {number} pointCount - The number of points.
     * @returns {Array<Vertex>}
     */
    getEquidistantVertices(pointCount) {
        const angles = VEllipse.utils.equidistantVertAngles(this.radiusH(), this.radiusV(), pointCount);
        const result = [];
        for (var i = 0; i < angles.length; i++) {
            result.push(this.vertAt(angles[i]));
        }
        return result;
    }
    /**
     * Convert this ellipse into cubic Bézier curves.
     *
     * @param {number=3} quarterSegmentCount - The number of segments per base elliptic quarter (default is 3, min is 1).
     * @param {number=0.666666} threshold - The Bézier threshold (default value 0.666666 approximates the ellipse with best results
     * but you might wish to use other values)
     * @return {Array<CubicBezierCurve>} An array of cubic Bézier curves representing this ellipse.
     */
    toCubicBezier(quarterSegmentCount, threshold) {
        // Math by Luc Maisonobe
        //    http://www.spaceroots.org/documents/ellipse/node22.html
        // Note that ellipses with radiusH=0 or radiusV=0 cannot be represented as Bézier curves.
        // Return a single line here (as a Bézier curve)
        // if (Math.abs(this.radiusV()) < 0.00001) {
        //   const radiusH = this.radiusH();
        //   return [
        //     new CubicBezierCurve(
        //       this.center.clone().addX(radiusH),
        //       this.center.clone().addX(-radiusH),
        //       this.center.clone(),
        //       this.center.clone()
        //     )
        //   ]; // TODO: test horizontal line ellipse
        // }
        // if (Math.abs(this.radiusH()) < 0.00001) {
        //   const radiusV = this.radiusV();
        //   return [
        //     new CubicBezierCurve(
        //       this.center.clone().addY(radiusV),
        //       this.center.clone().addY(-radiusV),
        //       this.center.clone(),
        //       this.center.clone()
        //     )
        //   ]; // TODO: test vertical line ellipse
        // }
        // At least 4, but 16 seems to be a good value.
        const segmentCount = Math.max(1, quarterSegmentCount || 3) * 4;
        threshold = typeof threshold === "undefined" ? 0.666666 : threshold;
        const radiusH = this.radiusH();
        const radiusV = this.radiusV();
        const curves = [];
        const angles = VEllipse.utils.equidistantVertAngles(radiusH, radiusV, segmentCount);
        let curAngle = angles[0];
        let startPoint = this.vertAt(curAngle);
        for (var i = 0; i < angles.length; i++) {
            let nextAngle = angles[(i + 1) % angles.length];
            let endPoint = this.vertAt(nextAngle);
            if (Math.abs(radiusV) < 0.0001 || Math.abs(radiusH) < 0.0001) {
                // Distorted ellipses can only be approximated by linear Bézier segments
                let diff = startPoint.difference(endPoint);
                let curve = new _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_4__.CubicBezierCurve(startPoint.clone(), endPoint.clone(), startPoint.clone().addXY(diff.x * 0.333, diff.y * 0.333), endPoint.clone().addXY(-diff.x * 0.333, -diff.y * 0.333));
                curves.push(curve);
            }
            else {
                let startTangent = this.tangentAt(curAngle);
                let endTangent = this.tangentAt(nextAngle);
                // Find intersection
                let intersection = startTangent.intersection(endTangent);
                // What if intersection is undefined?
                // --> This *can* not happen if segmentCount > 2 and height and width of the ellipse are not zero.
                let startDiff = startPoint.difference(intersection);
                let endDiff = endPoint.difference(intersection);
                let curve = new _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_4__.CubicBezierCurve(startPoint.clone(), endPoint.clone(), startPoint.clone().add(startDiff.scale(threshold)), endPoint.clone().add(endDiff.scale(threshold)));
                curves.push(curve);
            }
            startPoint = endPoint;
            curAngle = nextAngle;
        }
        return curves;
    }
    /**
     * Create an SVG representation of this ellipse.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @param {object} options { className?:string }
     * @return string The SVG string
     */
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push("<ellipse");
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' cx="' + this.center.x + '"');
        buffer.push(' cy="' + this.center.y + '"');
        buffer.push(' rx="' + this.axis.x + '"');
        buffer.push(' ry="' + this.axis.y + '"');
        buffer.push(" />");
        return buffer.join("");
    }
}
/**
 * A static collection of ellipse-related helper functions.
 * @static
 */
VEllipse.utils = {
    /**
     * Calculate a particular point on the outline of the given ellipse (center plus two radii plus angle).
     *
     * @name polarToCartesian
     * @param {number} centerX - The x coordinate of the elliptic center.
     * @param {number} centerY - The y coordinate of the elliptic center.
     * @param {number} radiusH - The horizontal radius of the ellipse.
     * @param {number} radiusV - The vertical radius of the ellipse.
     * @param {number} angle - The angle (in radians) to get the desired outline point for.
     * @reutn {XYCoords} The outlont point in absolute x-y-coordinates.
     */
    polarToCartesian: (centerX, centerY, radiusH, radiusV, angle) => {
        // Tanks to Narasinham for the vertex-on-ellipse equations
        // https://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle
        var s = Math.sin(Math.PI / 2 - angle);
        var c = Math.cos(Math.PI / 2 - angle);
        return {
            x: centerX + (radiusH * radiusV * s) / Math.sqrt(Math.pow(radiusH * c, 2) + Math.pow(radiusV * s, 2)),
            y: centerY + (radiusH * radiusV * c) / Math.sqrt(Math.pow(radiusH * c, 2) + Math.pow(radiusV * s, 2))
        };
    },
    /**
     * Get the `theta` for a given `phi` (used to determine equidistant points on ellipse).
     *
     * @param radiusH
     * @param radiusV
     * @param phi
     * @returns {number} theta
     */
    phiToTheta: (radiusH, radiusV, phi) => {
        //  See https://math.stackexchange.com/questions/172766/calculating-equidistant-points-around-an-ellipse-arc
        var tanPhi = Math.tan(phi);
        var tanPhi2 = tanPhi * tanPhi;
        var theta = -Math.PI / 2 + phi + Math.atan(((radiusH - radiusV) * tanPhi) / (radiusV + radiusH * tanPhi2));
        return theta;
    },
    /**
     * Get n equidistant points on the elliptic arc.
     *
     * @param pointCount
     * @returns
     */
    equidistantVertAngles: (radiusH, radiusV, pointCount) => {
        const angles = [];
        for (var i = 0; i < pointCount; i++) {
            var phi = Math.PI / 2.0 + ((Math.PI * 2) / pointCount) * i;
            let theta = VEllipse.utils.phiToTheta(radiusH, radiusV, phi);
            angles[i] = theta;
        }
        return angles;
    }
}; // END utils
//# sourceMappingURL=VEllipse.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/VEllipseSector.js":
/*!****************************************************!*\
  !*** ../plotboilerplate/src/esm/VEllipseSector.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VEllipseSector": () => (/* binding */ VEllipseSector)
/* harmony export */ });
/* harmony import */ var _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CubicBezierCurve */ "../plotboilerplate/src/esm/CubicBezierCurve.js");
/* harmony import */ var _geomutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./geomutils */ "../plotboilerplate/src/esm/geomutils.js");
/* harmony import */ var _Line__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Line */ "../plotboilerplate/src/esm/Line.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _VEllipse__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./VEllipse */ "../plotboilerplate/src/esm/VEllipse.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * Implementation of elliptic sectors.
 * Note that sectors are constructed in clockwise direction.
 *
 * @author  Ikaros Kappler
 * @date    2021-02-26
 * @version 1.0.0
 */






/**
 * @classdesc A class for elliptic sectors.
 *
 * @requires Line
 * @requires Vector
 * @requires VertTuple
 * @requires Vertex
 * @requires SVGSerializale
 * @requires UID
 * @requires UIDGenerator
 **/
class VEllipseSector {
    /**
     * Create a new elliptic sector from the given ellipse and two angles.
     *
     * Note that the direction from start to end goes clockwise, and that start and end angle
     * will be wrapped to [0,PI*2).
     *
     * @constructor
     * @name VEllipseSector
     * @param {VEllipse} - The underlying ellipse to use.
     * @param {number} startAngle - The start angle of the sector.
     * @param {numner} endAngle - The end angle of the sector.
     */
    constructor(ellipse, startAngle, endAngle) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "VEllipseSector";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_3__.UIDGenerator.next();
        this.ellipse = ellipse;
        this.startAngle = _geomutils__WEBPACK_IMPORTED_MODULE_1__.geomutils.wrapMinMax(startAngle, 0, Math.PI * 2);
        this.endAngle = _geomutils__WEBPACK_IMPORTED_MODULE_1__.geomutils.wrapMinMax(endAngle, 0, Math.PI * 2);
    }
    /**
     * Convert this elliptic sector into cubic Bézier curves.
     *
     * @param {number=3} quarterSegmentCount - The number of segments per base elliptic quarter (default is 3, min is 1).
     * @param {number=0.666666} threshold - The Bézier threshold (default value 0.666666 approximates the ellipse with best results
     * but you might wish to use other values)
     * @return {Array<CubicBezierCurve>} An array of cubic Bézier curves representing the elliptic sector.
     */
    toCubicBezier(quarterSegmentCount, threshold) {
        // There are at least 4 segments required (dour quarters) to approximate a whole
        // ellipse with Bézier curves.
        // A visually 'good' approximation should have 12; this seems to be a good value (anything multiple of 4).
        const segmentCount = Math.max(1, quarterSegmentCount || 3) * 4;
        threshold = typeof threshold === "undefined" ? 0.666666 : threshold;
        const radiusH = this.ellipse.radiusH();
        const radiusV = this.ellipse.radiusV();
        var startAngle = VEllipseSector.ellipseSectorUtils.normalizeAngle(this.startAngle);
        var endAngle = VEllipseSector.ellipseSectorUtils.normalizeAngle(this.endAngle);
        // Find all angles inside start and end
        var angles = VEllipseSector.ellipseSectorUtils.equidistantVertAngles(radiusH, radiusV, startAngle, endAngle, segmentCount);
        angles = [startAngle].concat(angles).concat([endAngle]);
        const curves = [];
        let curAngle = angles[0];
        let startPoint = this.ellipse.vertAt(curAngle);
        for (var i = 0; i + 1 < angles.length; i++) {
            let nextAngle = angles[(i + 1) % angles.length];
            let endPoint = this.ellipse.vertAt(nextAngle);
            let startTangent = this.ellipse.tangentAt(curAngle);
            let endTangent = this.ellipse.tangentAt(nextAngle);
            // Distorted ellipses can only be approximated by linear Bézier segments
            if (Math.abs(radiusV) < 0.0001 || Math.abs(radiusH) < 0.0001) {
                let diff = startPoint.difference(endPoint);
                let curve = new _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_0__.CubicBezierCurve(startPoint.clone(), endPoint.clone(), startPoint.clone().addXY(diff.x * 0.333, diff.y * 0.333), endPoint.clone().addXY(-diff.x * 0.333, -diff.y * 0.333));
                curves.push(curve);
            }
            else {
                // Find intersection
                let intersection = startTangent.intersection(endTangent);
                // What if intersection is undefined?
                // --> This *can* not happen if segmentCount > 2 and height and width of the ellipse are not zero.
                let startDiff = startPoint.difference(intersection);
                let endDiff = endPoint.difference(intersection);
                let curve = new _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_0__.CubicBezierCurve(startPoint.clone(), endPoint.clone(), startPoint.clone().add(startDiff.scale(threshold)), endPoint.clone().add(endDiff.scale(threshold)));
                curves.push(curve);
            }
            startPoint = endPoint;
            curAngle = nextAngle;
        }
        return curves;
    }
}
VEllipseSector.ellipseSectorUtils = {
    /**
     * Helper function to convert an elliptic section to SVG arc params (for the `d` attribute).
     * Inspiration found at:
     *    https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
     *
     * @param {boolean} options.moveToStart - If false (default=true) the initial 'Move' command will not be used.
     * @return [ 'A', radiusH, radiusV, rotation, largeArcFlag=1|0, sweepFlag=0, endx, endy ]
     */
    describeSVGArc: (x, y, radiusH, radiusV, startAngle, endAngle, rotation, options) => {
        if (typeof options === "undefined")
            options = { moveToStart: true };
        if (typeof rotation === "undefined")
            rotation = 0.0;
        // Important note: this function only works if start- and end-angle are within
        // one whole circle [x,x+2*PI].
        // Revelations of more than 2*PI might result in unexpected arcs.
        // -> Use the geomutils.wrapMax( angle, 2*PI )
        startAngle = _geomutils__WEBPACK_IMPORTED_MODULE_1__.geomutils.wrapMax(startAngle, Math.PI * 2);
        endAngle = _geomutils__WEBPACK_IMPORTED_MODULE_1__.geomutils.wrapMax(endAngle, Math.PI * 2);
        // Find the start- and end-point on the rotated ellipse
        // XYCoords to Vertex (for rotation)
        var end = new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(_VEllipse__WEBPACK_IMPORTED_MODULE_4__.VEllipse.utils.polarToCartesian(x, y, radiusH, radiusV, endAngle));
        var start = new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(_VEllipse__WEBPACK_IMPORTED_MODULE_4__.VEllipse.utils.polarToCartesian(x, y, radiusH, radiusV, startAngle));
        end.rotate(rotation, { x: x, y: y });
        start.rotate(rotation, { x: x, y: y });
        // Boolean stored as integers (0|1).
        var diff = endAngle - startAngle;
        var largeArcFlag;
        if (diff < 0) {
            largeArcFlag = Math.abs(diff) < Math.PI ? 1 : 0;
        }
        else {
            largeArcFlag = Math.abs(diff) > Math.PI ? 1 : 0;
        }
        const sweepFlag = 1;
        const pathData = [];
        if (options.moveToStart) {
            pathData.push("M", start.x, start.y);
        }
        // Arc rotation in degrees, not radians.
        const r2d = 180 / Math.PI;
        pathData.push("A", radiusH, radiusV, rotation * r2d, largeArcFlag, sweepFlag, end.x, end.y);
        return pathData;
    },
    /**
     * Helper function to find second-kind elliptic angles, so that the euclidean distance along the the
     * elliptic sector is the same for all.
     *
     * Note that this is based on the full ellipse calculuation and start and end will be cropped; so the
     * distance from the start angle to the first angle and/or the distance from the last angle to
     * the end angle may be different to the others.
     *
     * Furthermore the computation is only possible on un-rotated ellipses; if your source ellipse has
     * a rotation on the plane please 'rotate' the result angles afterwards to find matching angles.
     *
     * Returned angles are normalized to the interval `[ 0, PI*2 ]`.
     *
     * @param {number} radiusH - The first (horizonal) radius of the ellipse.
     * @param {number} radiusV - The second (vertical) radius of the ellipse.
     * @param {number} startAngle - The opening angle of your elliptic sector (please use normalized angles).
     * @param {number} endAngle - The closing angle of your elliptic sector (please use normalized angles).
     * @param {number} fullEllipsePointCount - The number of base segments to use from the source ellipse (12 or 16 are good numbers).
     * @return {Array<number>} An array of n angles inside startAngle and endAngle (where n <= fullEllipsePointCount).
     */
    equidistantVertAngles: (radiusH, radiusV, startAngle, endAngle, fullEllipsePointCount) => {
        var ellipseAngles = _VEllipse__WEBPACK_IMPORTED_MODULE_4__.VEllipse.utils.equidistantVertAngles(radiusH, radiusV, fullEllipsePointCount);
        ellipseAngles = ellipseAngles.map((angle) => VEllipseSector.ellipseSectorUtils.normalizeAngle(angle));
        var angleIsInRange = (angle) => {
            if (startAngle < endAngle)
                return angle >= startAngle && angle <= endAngle;
            else
                return angle >= startAngle || (angle <= endAngle && angle >= 0);
        };
        // Drop all angles outside the sector
        var ellipseAngles = ellipseAngles.filter(angleIsInRange);
        // Now we need to sort the angles to the first one in the array is the closest to startAngle.
        // --> find the angle that is closest to the start angle
        var startIndex = VEllipseSector.ellipseSectorUtils.findClosestToStartAngle(startAngle, endAngle, ellipseAngles);
        // Bring all angles into the correct order
        //    Idea: use splice or slice here?
        var angles = [];
        for (var i = 0; i < ellipseAngles.length; i++) {
            angles.push(ellipseAngles[(startIndex + i) % ellipseAngles.length]);
        }
        return angles;
    },
    findClosestToStartAngle: (startAngle, endAngle, ellipseAngles) => {
        // Note: endAngle > 0 && startAngle > 0
        if (startAngle > endAngle) {
            const n = ellipseAngles.length;
            for (var i = 0; i < n; i++) {
                const ea = _geomutils__WEBPACK_IMPORTED_MODULE_1__.geomutils.wrapMinMax(ellipseAngles[i], 0, Math.PI * 2);
                if (ea >= startAngle && ea >= endAngle) {
                    return i;
                }
            }
        }
        return 0;
    },
    normalizeAngle: (angle) => (angle < 0 ? Math.PI * 2 + angle : angle),
    /**
     * Convert the elliptic arc from endpoint parameters to center parameters as described
     * in the w3c svg arc implementation note.
     *
     * https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
     *
     * @param {number} x1 - The x component of the start point (end of last SVG command).
     * @param {number} y1 - The y component of the start point (end of last SVG command).
     * @param {number} rx - The first (horizontal) radius of the ellipse.
     * @param {number} ry - The second (vertical) radius of the ellipse.
     * @param {number} phi - The ellipse's rotational angle (angle of axis rotation) in radians (not in degrees as the SVG command uses!)
     * @param {boolean} fa - The large-arc-flag (boolean, not 0 or 1).
     * @param {boolean} fs - The sweep-flag (boolean, not 0 or 1).
     * @param {number} x2 - The x component of the end point (end of last SVG command).
     * @param {number} y2 - The y component of the end point (end of last SVG command).
     * @returns
     */
    endpointToCenterParameters(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
        // console.log("endpointToCenterParameters", x1, y1, phi, rx, ry, fa, fs, x2, y2);
        // Thanks to
        //    https://observablehq.com/@toja/ellipse-and-elliptical-arc-conversion
        const abs = Math.abs;
        const sin = Math.sin;
        const cos = Math.cos;
        const sqrt = Math.sqrt;
        const pow = (n) => {
            return n * n;
        };
        const sinphi = sin(phi);
        const cosphi = cos(phi);
        // Step 1: simplify through translation/rotation
        const x = (cosphi * (x1 - x2)) / 2 + (sinphi * (y1 - y2)) / 2;
        const y = (-sinphi * (x1 - x2)) / 2 + (cosphi * (y1 - y2)) / 2;
        const px = pow(x), py = pow(y), prx = pow(rx), pry = pow(ry);
        // correct of out-of-range radii
        const L = px / prx + py / pry;
        if (L > 1) {
            rx = sqrt(L) * abs(rx);
            ry = sqrt(L) * abs(ry);
        }
        else {
            rx = abs(rx);
            ry = abs(ry);
        }
        // Step 2 + 3: compute center
        const sign = fa === fs ? -1 : 1;
        const M = sqrt((prx * pry - prx * py - pry * px) / (prx * py + pry * px)) * sign;
        const _cx = (M * (rx * y)) / ry;
        const _cy = (M * (-ry * x)) / rx;
        const cx = cosphi * _cx - sinphi * _cy + (x1 + x2) / 2;
        const cy = sinphi * _cx + cosphi * _cy + (y1 + y2) / 2;
        // Step 4: Compute start and end angle
        const center = new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(cx, cy);
        const axis = center.clone().addXY(rx, ry);
        const ellipse = new _VEllipse__WEBPACK_IMPORTED_MODULE_4__.VEllipse(center, axis, 0);
        ellipse.rotate(phi);
        const startAngle = new _Line__WEBPACK_IMPORTED_MODULE_2__.Line(ellipse.center, new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(x1, y1)).angle();
        const endAngle = new _Line__WEBPACK_IMPORTED_MODULE_2__.Line(ellipse.center, new _Vertex__WEBPACK_IMPORTED_MODULE_5__.Vertex(x2, y2)).angle();
        return new VEllipseSector(ellipse, startAngle - phi, endAngle - phi);
    }
}; // END ellipseSectorUtils
//# sourceMappingURL=VEllipseSector.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Vector.js":
/*!********************************************!*\
  !*** ../plotboilerplate/src/esm/Vector.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vector": () => (/* binding */ Vector)
/* harmony export */ });
/* harmony import */ var _VertTuple__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./VertTuple */ "../plotboilerplate/src/esm/VertTuple.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * @author   Ikaros Kappler
 * @date     2019-01-30
 * @modified 2019-02-23 Added the toSVGString function, overriding Line.toSVGString.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2019-04-19 Added the clone function (overriding Line.clone()).
 * @modified 2019-09-02 Added the Vector.perp() function.
 * @modified 2019-09-02 Added the Vector.inverse() function.
 * @modified 2019-12-04 Added the Vector.inv() function.
 * @modified 2020-03-23 Ported to Typescript from JS.
 * @modified 2021-01-20 Added UID.
 * @version  1.3.0
 *
 * @file Vector
 * @public
 **/


/**
 * @classdesc A vector (Vertex,Vertex) is a line with a visible direction.<br>
 *            <br>
 *            Vectors are drawn with an arrow at their end point.<br>
 *            <b>The Vector class extends the Line class.</b>
 *
 * @requires VertTuple
 * @requires Vertex
 **/
class Vector extends _VertTuple__WEBPACK_IMPORTED_MODULE_0__.VertTuple {
    /**
     * The constructor.
     *
     * @constructor
     * @name Vector
     * @extends Line
     * @param {Vertex} vertA - The start vertex of the vector.
     * @param {Vertex} vertB - The end vertex of the vector.
     **/
    constructor(vertA, vertB) {
        super(vertA, vertB, (a, b) => new Vector(a, b));
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "Vector";
    }
    ;
    /**
     * Get the perpendicular of this vector which is located at a.
     *
     * @param {Number} t The position on the vector.
     * @return {Vector} A new vector being the perpendicular of this vector sitting on a.
     **/
    perp() {
        var v = this.clone();
        v.sub(this.a);
        v = new Vector(new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(), new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(-v.b.y, v.b.x));
        v.a.add(this.a);
        v.b.add(this.a);
        return v;
    }
    ;
    /**
     * The inverse of a vector is a vector witht the same magnitude but oppose direction.
     *
     * Please not that the origin of this vector changes here: a->b becomes b->a.
     *
     * @return {Vector}
     **/
    inverse() {
        var tmp = this.a;
        this.a = this.b;
        this.b = tmp;
        return this;
    }
    ;
    /**
     * This function computes the inverse of the vector, which means 'a' stays untouched.
     *
     * @return {Vector} this for chaining.
     **/
    inv() {
        this.b.x = this.a.x - (this.b.x - this.a.x);
        this.b.y = this.a.y - (this.b.y - this.a.y);
        return this;
    }
    ;
    /**
     * Get the intersection if this vector and the specified vector.
     *
     * @method intersection
     * @param {Vector} line The second vector.
     * @return {Vertex} The intersection (may lie outside the end-points).
     * @instance
     * @memberof Line
     **/
    intersection(line) {
        var denominator = this.denominator(line);
        if (denominator == 0)
            return null;
        var a = this.a.y - line.a.y;
        var b = this.a.x - line.a.x;
        var numerator1 = ((line.b.x - line.a.x) * a) - ((line.b.y - line.a.y) * b);
        var numerator2 = ((this.b.x - this.a.x) * a) - ((this.b.y - this.a.y) * b);
        a = numerator1 / denominator; // NaN if parallel lines
        b = numerator2 / denominator;
        // TODO:
        // FOR A VECTOR THE LINE-INTERSECTION MUST BE ON BOTH VECTORS
        // if we cast these lines infinitely in both directions, they intersect here:
        return new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(this.a.x + (a * (this.b.x - this.a.x)), this.a.y + (a * (this.b.y - this.a.y)));
    }
    ;
    /**
     * Create an SVG representation of this line.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @method toSVGString
     * @override
     * @param {object=} options - A set of options, like 'className'.
     * @return {string} The SVG string representation.
     * @instance
     * @memberof Vector
     **/
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        var vertices = Vector.utils.buildArrowHead(this.a, this.b, 8, 1.0, 1.0);
        buffer.push('<g');
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push('>');
        buffer.push('   <line');
        buffer.push(' x1="' + this.a.x + '"');
        buffer.push(' y1="' + this.a.y + '"');
        buffer.push(' x2="' + vertices[0].x + '"');
        buffer.push(' y2="' + vertices[0].y + '"');
        buffer.push(' />');
        // Add arrow head
        buffer.push('   <polygon points="');
        for (var i = 0; i < vertices.length; i++) {
            if (i > 0)
                buffer.push(' ');
            buffer.push('' + vertices[i].x + ',' + vertices[i].y);
        }
        buffer.push('"/>');
        buffer.push('</g>');
        return buffer.join('');
    }
    ;
}
Vector.utils = {
    /**
     * Generate a four-point arrow head, starting at the vector end minus the
     * arrow head length.
     *
     * The first vertex in the returned array is guaranteed to be the located
     * at the vector line end minus the arrow head length.
     *
     *
     * Due to performance all params are required.
     *
     * The params scaleX and scaleY are required for the case that the scaling is not uniform (x and y
     * scaling different). Arrow heads should not look distored on non-uniform scaling.
     *
     * If unsure use 1.0 for scaleX and scaleY (=no distortion).
     * For headlen use 8, it's a good arrow head size.
     *
     * Example:
     *    buildArrowHead( new Vertex(0,0), new Vertex(50,100), 8, 1.0, 1.0 )
     *
     * @param {Vertex} zA - The start vertex of the vector to calculate the arrow head for.
     * @param {Vertex} zB - The end vertex of the vector.
     * @param {number} headlen - The length of the arrow head (along the vector direction. A good value is 12).
     * @param {number} scaleX  - The horizontal scaling during draw.
     * @param {number} scaleY  - the vertical scaling during draw.
     **/
    buildArrowHead: (zA, zB, headlen, scaleX, scaleY) => {
        var angle = Math.atan2((zB.y - zA.y) * scaleY, (zB.x - zA.x) * scaleX);
        var vertices = [];
        vertices.push(new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(zB.x * scaleX - (headlen) * Math.cos(angle), zB.y * scaleY - (headlen) * Math.sin(angle)));
        vertices.push(new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(zB.x * scaleX - (headlen * 1.35) * Math.cos(angle - Math.PI / 8), zB.y * scaleY - (headlen * 1.35) * Math.sin(angle - Math.PI / 8)));
        vertices.push(new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(zB.x * scaleX, zB.y * scaleY));
        vertices.push(new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(zB.x * scaleX - (headlen * 1.35) * Math.cos(angle + Math.PI / 8), zB.y * scaleY - (headlen * 1.35) * Math.sin(angle + Math.PI / 8)));
        return vertices;
    }
};
//# sourceMappingURL=Vector.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/VertTuple.js":
/*!***********************************************!*\
  !*** ../plotboilerplate/src/esm/VertTuple.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VertTuple": () => (/* binding */ VertTuple)
/* harmony export */ });
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/**
 * @author Ikaros Kappler
 * @date   2020-03-24
 * @modified 2020-05-04 Fixed a serious bug in the pointDistance function.
 * @modified 2020-05-12 The angle(line) param was still not optional. Changed that.
 * @modified 2020-11-11 Generalized the `add` and `sub` param from `Vertex` to `XYCoords`.
 * @modified 2020-12-04 Changed`vtutils.dist2` params from `Vertex` to `XYCoords` (generalized).
 * @modified 2020-12-04 Changed `getClosestT` param from `Vertex` to `XYCoords` (generalized).
 * @modified 2020-12-04 Added the `hasPoint(XYCoords)` function.
 * @modified 2021-01-20 Added UID.
 * @version 1.1.0
 */


/**
 * @classdesc An abstract base classes for vertex tuple constructs, like Lines or Vectors.
 * @abstract
 * @requires UID
 * @requires Vertex
 * @requires XYCoords
 */
class VertTuple {
    /**
     * Creates an instance.
     *
     * @constructor
     * @name VertTuple
     * @param {Vertex} a The tuple's first point.
     * @param {Vertex} b The tuple's second point.
     **/
    constructor(a, b, factory) {
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__.UIDGenerator.next();
        this.a = a;
        this.b = b;
        this.factory = factory;
    }
    /**
     * Get the length of this line.
     *
     * @method length
     * @instance
     * @memberof VertTuple
     **/
    length() {
        return Math.sqrt(Math.pow(this.b.x - this.a.x, 2) + Math.pow(this.b.y - this.a.y, 2));
    }
    ;
    /**
     * Set the length of this vector to the given amount. This only works if this
     * vector is not a null vector.
     *
     * @method setLength
     * @param {number} length - The desired length.
     * @memberof VertTuple
     * @return {T} this (for chaining)
     **/
    setLength(length) {
        return this.scale(length / this.length());
    }
    ;
    /**
     * Substract the given vertex from this line's end points.
     *
     * @method sub
     * @param {XYCoords} amount The amount (x,y) to substract.
     * @return {VertTuple} this
     * @instance
     * @memberof VertTuple
     **/
    sub(amount) {
        this.a.sub(amount);
        this.b.sub(amount);
        return this;
    }
    ;
    /**
     * Add the given vertex to this line's end points.
     *
     * @method add
     * @param {XYCoords} amount The amount (x,y) to add.
     * @return {Line} this
     * @instance
     * @memberof VertTuple
     **/
    add(amount) {
        this.a.add(amount);
        this.b.add(amount);
        return this;
    }
    ;
    /**
     * Normalize this line (set to length 1).
     *
     * @method normalize
     * @return {VertTuple} this
     * @instance
     * @memberof VertTuple
     **/
    normalize() {
        this.b.set(this.a.x + (this.b.x - this.a.x) / this.length(), this.a.y + (this.b.y - this.a.y) / this.length());
        return this;
    }
    ;
    /**
     * Scale this line by the given factor.
     *
     * @method scale
     * @param {number} factor The factor for scaling (1.0 means no scale).
     * @return {VertTuple} this
     * @instance
     * @memberof VertTuple
     **/
    scale(factor) {
        this.b.set(this.a.x + (this.b.x - this.a.x) * factor, this.a.y + (this.b.y - this.a.y) * factor);
        return this;
    }
    ;
    /**
     * Move this line to a new location.
     *
     * @method moveTo
     * @param {Vertex} newA - The new desired location of 'a'. Vertex 'b' will be moved, too.
     * @return {VertTuple} this
     * @instance
     * @memberof VertTuple
     **/
    moveTo(newA) {
        let diff = this.a.difference(newA);
        this.a.add(diff);
        this.b.add(diff);
        return this;
    }
    ;
    /**
     * Get the angle between this and the passed line (in radians).
     *
     * @method angle
     * @param {VertTuple} line - (optional) The line to calculate the angle to. If null the baseline (x-axis) will be used.
     * @return {number} this
     * @instance
     * @memberof VertTuple
     **/
    angle(line) {
        if (line == null || typeof line == 'undefined') {
            line = this.factory(new _Vertex__WEBPACK_IMPORTED_MODULE_0__.Vertex(0, 0), new _Vertex__WEBPACK_IMPORTED_MODULE_0__.Vertex(100, 0));
        }
        // Compute the angle from x axis and the return the difference :)
        const v0 = this.b.clone().sub(this.a);
        const v1 = line.b.clone().sub(line.a);
        // Thank you, Javascript, for this second atan function. No additional math is needed here!
        // The result might be negative, but isn't it usually nicer to determine angles in positive values only?
        return Math.atan2(v1.x, v1.y) - Math.atan2(v0.x, v0.y);
    }
    ;
    /**
     * Get line point at position t in [0 ... 1]:<br>
     * <pre>[P(0)]=[A]--------------------[P(t)]------[B]=[P(1)]</pre><br>
     * <br>
     * The counterpart of this function is Line.getClosestT(Vertex).
     *
     * @method vertAt
     * @param {number} t The position scalar.
     * @return {Vertex} The vertex a position t.
     * @instance
     * @memberof VertTuple
     **/
    vertAt(t) {
        return new _Vertex__WEBPACK_IMPORTED_MODULE_0__.Vertex(this.a.x + (this.b.x - this.a.x) * t, this.a.y + (this.b.y - this.a.y) * t);
    }
    ;
    /**
     * Get the denominator of this and the given line.
     *
     * If the denominator is zero (or close to zero) both line are co-linear.
     *
     * @method denominator
     * @param {VertTuple} line
     * @instance
     * @memberof VertTuple
     * @return {Number}
     **/
    denominator(line) {
        // http://jsfiddle.net/justin_c_rounds/Gd2S2/
        return ((line.b.y - line.a.y) * (this.b.x - this.a.x)) - ((line.b.x - line.a.x) * (this.b.y - this.a.y));
    }
    ;
    /**
     * Checks if this and the given line are co-linear.
     *
     * The constant Vertex.EPSILON is used for tolerance.
     *
     * @method colinear
     * @param {VertTuple} line
     * @instance
     * @memberof VertTuple
     * @return true if both lines are co-linear.
     */
    colinear(line) {
        return Math.abs(this.denominator(line)) < _Vertex__WEBPACK_IMPORTED_MODULE_0__.Vertex.EPSILON;
    }
    ;
    /**
     * Get the closest position T from this line to the specified point.
     *
     * The counterpart for this function is Line.vertAt(Number).
     *
     * @name getClosetT
     * @method getClosestT
     * @param {XYCoords} p The point (vertex) to measure the distance to.
     * @return {number} The line position t of minimal distance to p.
     * @instance
     * @memberof VertTuple
     **/
    getClosestT(p) {
        var l2 = VertTuple.vtutils.dist2(this.a, this.b);
        if (l2 === 0)
            return 0;
        var t = ((p.x - this.a.x) * (this.b.x - this.a.x) + (p.y - this.a.y) * (this.b.y - this.a.y)) / l2;
        // Do not wrap to [0,1] here.
        // Other results are of interest, too.
        // t = Math.max(0, Math.min(1, t));
        return t;
    }
    ;
    /**
     * Check if the given point is located on this line. Optionally also check if
     * that point is located between point `a` and `b`.
     *
     * @method hasPoint
     * @param {Vertex} point The point to check.
     * @param {boolean=} insideBoundsOnly If set to to true (default=false) the point must be between start and end point of the line.
     * @return {boolean} True if the given point is on this line.
     * @instance
     * @memberof VertTuple
     */
    hasPoint(point, insideBoundsOnly) {
        const t = this.getClosestT(point);
        // Compare to pointDistance?
        if (typeof insideBoundsOnly !== "undefined" && insideBoundsOnly) {
            const distance = Math.sqrt(VertTuple.vtutils.dist2(point, this.vertAt(t)));
            return distance < _Vertex__WEBPACK_IMPORTED_MODULE_0__.Vertex.EPSILON && t >= 0 && t <= 1;
        }
        else {
            return t >= 0 && t <= 1;
        }
    }
    /**
     * Get the closest point on this line to the specified point.
     *
     * @method getClosestPoint
     * @param {Vertex} p The point (vertex) to measre the distance to.
     * @return {Vertex} The point on the line that is closest to p.
     * @instance
     * @memberof VertTuple
     **/
    getClosestPoint(p) {
        var t = this.getClosestT(p);
        return this.vertAt(t);
    }
    ;
    /**
     * The the minimal distance between this line and the specified point.
     *
     * @method pointDistance
     * @param {Vertex} p The point (vertex) to measre the distance to.
     * @return {number} The absolute minimal distance.
     * @instance
     * @memberof VertTuple
     **/
    pointDistance(p) {
        // Taken From:
        // https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
        return Math.sqrt(VertTuple.vtutils.dist2(p, this.vertAt(this.getClosestT(p))));
    }
    ;
    /**
     * Create a deep clone of this instance.
     *
     * @method cloneLine
     * @return {T} A type safe clone if this instance.
     * @instance
     * @memberof VertTuple
     **/
    clone() {
        return this.factory(this.a.clone(), this.b.clone());
    }
    ;
    /**
     * Create a string representation of this line.
     *
     * @method totring
     * @return {string} The string representing this line.
     * @instance
     * @memberof VertTuple
     **/
    toString() {
        return "{ a : " + this.a.toString() + ", b : " + this.b.toString() + " }";
    }
    ;
}
/**
 * @private
 **/
VertTuple.vtutils = {
    dist2: (v, w) => {
        return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    }
};
//# sourceMappingURL=VertTuple.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/Vertex.js":
/*!********************************************!*\
  !*** ../plotboilerplate/src/esm/Vertex.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vertex": () => (/* binding */ Vertex)
/* harmony export */ });
/* harmony import */ var _VertexAttr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./VertexAttr */ "../plotboilerplate/src/esm/VertexAttr.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _VertexListeners__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./VertexListeners */ "../plotboilerplate/src/esm/VertexListeners.js");
/**
 * @author   Ikaros Kappler
 * @date     2012-10-17
 * @modified 2018-04-03 Refactored the code of october 2012 into a new class.
 * @modified 2018-04-28 Added some documentation.
 * @modified 2018-08-16 Added the set() function.
 * @modified 2018-08-26 Added VertexAttr.
 * @modified 2018-10-31 Extended the constructor by object{x,y}.
 * @modified 2018-11-19 Extended the set(number,number) function to set(Vertex).
 * @modified 2018-11-28 Added 'this' to the VertexAttr constructor.
 * @modified 2018-12-05 Added the sub(...) function. Changed the signature of the add() function! add(Vertex) and add(number,number) are now possible.
 * @modified 2018-12-21 (It's winter solstice) Added the inv()-function.
 * @modified 2019-01-30 Added the setX(Number) and setY(Number) functions.
 * @modified 2019-02-19 Added the difference(Vertex) function.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2019-04-24 Added the randomVertex(ViewPort) function.
 * @modified 2019-11-07 Added toSVGString(object) function.
 * @modified 2019-11-18 Added the rotate(number,Vertex) function.
 * @modified 2019-11-21 Fixed a bug in the rotate(...) function (elements were moved).
 * @modified 2020-03-06 Added functions invX() and invY().
 * @modified 2020-03-23 Ported to Typescript from JS.
 * @modified 2020-05-26 Added functions addX(number) and addY(number).
 * @modified 2020-10-30 Changed the warnings in `sub(...)` and `add(...)` into real errors.
 * @modified 2021-03-01 Changed the second param `center` in the `rotate` function from Vertex to XYCoords.
 * @version  2.4.2
 *
 * @file Vertex
 * @public
 **/



/**
 * @classdesc A vertex is a pair of two numbers.<br>
 * <br>
 * It is used to identify a 2-dimensional point on the x-y-plane.
 *
 * @requires IVertexAttr
 * @requires SVGSerializable
 * @requires UID
 * @requires UIDGenerator
 * @requires VertexAttr
 * @requires VertexListeners
 * @requires XYCoords
 *
 */
class Vertex {
    /**
     * The constructor for the vertex class.
     *
     * @constructor
     * @name Vertex
     * @param {number} x - The x-coordinate of the new vertex.
     * @param {number} y - The y-coordinate of the new vertex.
     **/
    constructor(x, y) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "Vertex";
        this.uid = _UIDGenerator__WEBPACK_IMPORTED_MODULE_1__.UIDGenerator.next();
        if (typeof x == "undefined") {
            this.x = 0;
            this.y = 0;
        }
        else if (typeof x == "number" && typeof y == "number") {
            this.x = x;
            this.y = y;
        }
        else {
            const tuple = x;
            if (typeof tuple.x == "number" && typeof tuple.y == "number") {
                this.x = tuple.x;
                this.y = tuple.y;
            }
            else {
                if (typeof x == "number")
                    this.x = x;
                else if (typeof x == "undefined")
                    this.x = 0;
                else
                    this.x = NaN;
                if (typeof y == "number")
                    this.y = y;
                else if (typeof y == "undefined")
                    this.y = 0;
                else
                    this.y = NaN;
            }
        }
        this.attr = new _VertexAttr__WEBPACK_IMPORTED_MODULE_0__.VertexAttr();
        this.listeners = new _VertexListeners__WEBPACK_IMPORTED_MODULE_2__.VertexListeners(this);
    }
    /**
     * Set the x- and y- component of this vertex.
     *
     * @method set
     * @param {number} x - The new x-component.
     * @param {number} y - The new y-component.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    set(x, y) {
        if (typeof x == "number" && typeof y == "number") {
            this.x = x;
            this.y = y;
        }
        else {
            const tuple = x;
            if (typeof tuple.x == "number" && typeof tuple.y == "number") {
                this.x = tuple.x;
                this.y = tuple.y;
            }
            else {
                if (typeof x == "number")
                    this.x = x;
                else if (typeof x == "undefined")
                    this.x = 0;
                else
                    this.x = NaN;
                if (typeof y == "number")
                    this.y = y;
                else if (typeof y == "undefined")
                    this.y = 0;
                else
                    this.y = NaN;
            }
        }
        return this;
    }
    /**
     * Set the x-component of this vertex.
     *
     * @method setX
     * @param {number} x - The new x-component.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    setX(x) {
        this.x = x;
        return this;
    }
    /**
     * Set the y-component of this vertex.
     *
     * @method setY
     * @param {number} y - The new y-component.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    setY(y) {
        this.y = y;
        return this;
    }
    /**
     * Set the x-component if this vertex to the inverse of its value.
     *
     * @method invX
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    invX() {
        this.x = -this.x;
        return this;
    }
    /**
     * Set the y-component if this vertex to the inverse of its value.
     *
     * @method invY
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    invY() {
        this.y = -this.y;
        return this;
    }
    /**
     * Add the passed amount to x- and y- component of this vertex.<br>
     * <br>
     * This function works with add( {number}, {number} ) and
     * add( {Vertex} ), as well.
     *
     * @method add
     * @param {(number|Vertex)} x - The amount to add to x (or a vertex itself).
     * @param {number=} y - The amount to add to y.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    add(x, y) {
        if (typeof x == "number" && typeof y == "number") {
            this.x += x;
            this.y += y;
        }
        else {
            const tuple = x;
            if (typeof tuple.x == "number" && typeof tuple.y == "number") {
                this.x += tuple.x;
                this.y += tuple.y;
            }
            else {
                if (typeof x == "number")
                    this.x += x;
                else
                    throw `Cannot add ${typeof x} to numeric x component!`;
                if (typeof y == "number")
                    this.y += y;
                else
                    throw `Cannot add ${typeof y} to numeric y component!`;
            }
        }
        return this;
    }
    /**
     * Add the passed amounts to the x- and y- components of this vertex.
     *
     * @method addXY
     * @param {number} x - The amount to add to x.
     * @param {number} y - The amount to add to y.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    addXY(amountX, amountY) {
        this.x += amountX;
        this.y += amountY;
        return this;
    }
    /**
     * Add the passed amounts to the x-component of this vertex.
     *
     * @method addX
     * @param {number} x - The amount to add to x.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    addX(amountX) {
        this.x += amountX;
        return this;
    }
    /**
     * Add the passed amounts to the y-component of this vertex.
     *
     * @method addY
     * @param {number} y - The amount to add to y.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    addY(amountY) {
        this.y += amountY;
        return this;
    }
    /**
     * Substract the passed amount from x- and y- component of this vertex.<br>
     * <br>
     * This function works with sub( {number}, {number} ) and
     * sub( {Vertex} ), as well.
     *
     * @method sub
     * @param {(number|Vertex)} x - The amount to substract from x (or a vertex itself).
     * @param {number=} y - The amount to substract from y.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    sub(x, y) {
        if (typeof x == "number" && typeof y == "number") {
            this.x -= x;
            this.y -= y;
        }
        else {
            const tuple = x;
            if (typeof tuple.x == "number" && typeof tuple.y == "number") {
                this.x -= tuple.x;
                this.y -= tuple.y;
            }
            else {
                if (typeof x == "number")
                    this.x -= x;
                else
                    throw `Cannot add ${typeof x} to numeric x component!`;
                if (typeof y == "number")
                    this.y -= y;
                else
                    throw `Cannot add ${typeof y} to numeric y component!`;
            }
        }
        return this;
    }
    /**
     * Check if this vertex equals the passed one.
     * <br>
     * This function uses an internal epsilon as tolerance.
     *
     * @method equals
     * @param {Vertex} vertex - The vertex to compare this with.
     * @return {boolean}
     * @instance
     * @memberof Vertex
     **/
    equals(vertex) {
        var eqX = Math.abs(this.x - vertex.x) < Vertex.EPSILON;
        var eqY = Math.abs(this.y - vertex.y) < Vertex.EPSILON;
        var result = eqX && eqY;
        return result;
    }
    /**
     * Create a copy of this vertex.
     *
     * @method clone
     * @return {Vertex} A new vertex, an exact copy of this.
     * @instance
     * @memberof Vertex
     **/
    clone() {
        return new Vertex(this.x, this.y);
    }
    /**
     * Get the distance to the passed point (in euclidean metric)
     *
     * @method distance
     * @param {XYCoords} vert - The vertex to measure the distance to.
     * @return {number}
     * @instance
     * @memberof Vertex
     **/
    distance(vert) {
        return Math.sqrt(Math.pow(vert.x - this.x, 2) + Math.pow(vert.y - this.y, 2));
    }
    /**
     * Get the angle of this point (relative to (0,0) or to the given other origin point).
     *
     * @method angle
     * @param {XYCoords} origin - The vertex to measure the angle from.
     * @return {number}
     * @instance
     * @memberof Vertex
     **/
    angle(origin) {
        const a = typeof origin === "undefined"
            ? Math.PI / 2 - Math.atan2(this.x, this.y)
            : Math.PI / 2 - Math.atan2(origin.x - this.x, origin.y - this.y);
        // Map to positive value
        return a < 0 ? Math.PI * 2 + a : a;
    }
    /**
     * Get the difference to the passed point.<br>
     * <br>
     * The difference is (vert.x-this.x, vert.y-this.y).
     *
     * @method difference
     * @param {Vertex} vert - The vertex to measure the x-y-difference to.
     * @return {Vertex} A new vertex.
     * @instance
     * @memberof Vertex
     **/
    difference(vert) {
        return new Vertex(vert.x - this.x, vert.y - this.y);
    }
    /**
     * This is a vector-like behavior and 'scales' this vertex
     * towards/from a given center.
     *
     * @method scale
     * @param {number} factor - The factor to 'scale' this vertex; 1.0 means no change.
     * @param {Vertex=} center - The origin of scaling; default is (0,0).
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    scale(factor, center) {
        if (!center || typeof center === "undefined")
            center = new Vertex(0, 0);
        this.x = center.x + (this.x - center.x) * factor;
        this.y = center.y + (this.y - center.y) * factor;
        return this;
    }
    /**
     * This is a vector-like behavior and 'rotates' this vertex
     * around given center.
     *
     * @method rotate
     * @param {number} angle - The angle to 'rotate' this vertex; 0.0 means no change.
     * @param {XYCoords=} center - The center of rotation; default is (0,0).
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    rotate(angle, center) {
        if (!center || typeof center === "undefined") {
            center = { x: 0, y: 0 };
        }
        this.sub(center);
        angle += Math.atan2(this.y, this.x);
        let len = this.distance(Vertex.ZERO); // {x:0,y:0});
        this.x = len * Math.cos(angle);
        this.y = len * Math.sin(angle);
        this.add(center);
        return this;
    }
    /**
     * Multiply both components of this vertex with the given scalar.<br>
     * <br>
     * Note: as in<br>
     *    https://threejs.org/docs/#api/math/Vector2.multiplyScalar
     *
     * @method multiplyScalar
     * @param {number} scalar - The scale factor; 1.0 means no change.
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    /**
     * Round the two components x and y of this vertex.
     *
     * @method round
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
    /**
     * Change this vertex (x,y) to its inverse (-x,-y).
     *
     * @method inv
     * @return {Vertex} this
     * @instance
     * @memberof Vertex
     **/
    inv() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    /**
     * Get a string representation of this vertex.
     *
     * @method toString
     * @return {string} The string representation of this vertex.
     * @instance
     * @memberof Vertex
     **/
    toString() {
        return "(" + this.x + "," + this.y + ")";
    }
    /**
     * Convert this vertex to SVG code.
     *
     * @deprecated DEPRECATION Please use the drawutilssvg library and an XMLSerializer instead.
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} A string representing the SVG code for this vertex.
     * @instance
     * @memberof Vertex
     **/
    toSVGString(options) {
        options = options || {};
        var buffer = [];
        buffer.push("<circle");
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' cx="' + this.x + '"');
        buffer.push(' cy="' + this.y + '"');
        buffer.push(' r="2"');
        buffer.push(" />");
        return buffer.join("");
    }
    // END Vertex
    /**
     * Create a new random vertex inside the given viewport.
     *
     * @param {ViewPort} viewPort - A {min:Vertex, max:Vertex} viewport specifying the bounds.
     * @return A new vertex with a random position.
     **/
    static randomVertex(viewPort) {
        return new Vertex(viewPort.min.x + Math.random() * (viewPort.max.x - viewPort.min.x), viewPort.min.y + Math.random() * (viewPort.max.y - viewPort.min.y));
    }
}
Vertex.ZERO = new Vertex(0, 0);
/**
 * An epsilon for comparison
 *
 * @private
 * @readonly
 **/
Vertex.EPSILON = 1.0e-6;
Vertex.utils = {
    /**
     * Generate a four-point arrow head, starting at the vector end minus the
     * arrow head length.
     *
     * The first vertex in the returned array is guaranteed to be the located
     * at the vector line end minus the arrow head length.
     *
     *
     * Due to performance all params are required.
     *
     * The params scaleX and scaleY are required for the case that the scaling is not uniform (x and y
     * scaling different). Arrow heads should not look distored on non-uniform scaling.
     *
     * If unsure use 1.0 for scaleX and scaleY (=no distortion).
     * For headlen use 8, it's a good arrow head size.
     *
     * Example:
     *    buildArrowHead( new Vertex(0,0), new Vertex(50,100), 8, 1.0, 1.0 )
     *
     * @param {Vertex} zA - The start vertex of the vector to calculate the arrow head for.
     * @param {Vertex} zB - The end vertex of the vector.
     * @param {number} headlen - The length of the arrow head (along the vector direction. A good value is 12).
     * @param {number} scaleX  - The horizontal scaling during draw.
     * @param {number} scaleY  - the vertical scaling during draw.
     **/
    // @DEPRECATED: use Vector.utils.buildArrowHead instead!!!
    buildArrowHead: (zA, zB, headlen, scaleX, scaleY) => {
        // console.warn('This function is deprecated! Use Vector.utils.buildArrowHead instead!');
        var angle = Math.atan2((zB.y - zA.y) * scaleY, (zB.x - zA.x) * scaleX);
        var vertices = [];
        vertices.push(new Vertex(zB.x * scaleX - headlen * Math.cos(angle), zB.y * scaleY - headlen * Math.sin(angle)));
        vertices.push(new Vertex(zB.x * scaleX - headlen * 1.35 * Math.cos(angle - Math.PI / 8), zB.y * scaleY - headlen * 1.35 * Math.sin(angle - Math.PI / 8)));
        vertices.push(new Vertex(zB.x * scaleX, zB.y * scaleY));
        vertices.push(new Vertex(zB.x * scaleX - headlen * 1.35 * Math.cos(angle + Math.PI / 8), zB.y * scaleY - headlen * 1.35 * Math.sin(angle + Math.PI / 8)));
        return vertices;
    }
};
//# sourceMappingURL=Vertex.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/VertexAttr.js":
/*!************************************************!*\
  !*** ../plotboilerplate/src/esm/VertexAttr.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VertexAttr": () => (/* binding */ VertexAttr)
/* harmony export */ });
/**
 * @author   Ikaros Kappler
 * @date     2018-08-26
 * @modified 2018-11-17 Added the 'isSelected' attribute.
 * @modified 2018-11-27 Added the global model for instantiating with custom attributes.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2020-02-29 Added the 'selectable' attribute.
 * @modified 2020-03-23 Ported to Typescript from JS.
 * @version  1.1.1
 *
 * @file VertexAttr
 * @public
 **/
/**
 * @classdesc The VertexAttr is a helper class to wrap together additional attributes
 * to vertices that do not belong to the 'standard canonical' vertex implementation.<br>
 * <br>
 * This is some sort of 'userData' object, but the constructor uses a global model
 * to obtain a (configurable) default attribute set to all instances.<br>
 */
class VertexAttr {
    /**
     * The constructor.
     *
     * Attributes will be initialized as defined in the model object
     * which serves as a singleton.
     *
     * @constructor
     * @name VertexAttr
     **/
    constructor() {
        this.draggable = true;
        this.selectable = true;
        this.isSelected = false;
        this.visible = true;
        for (var key in VertexAttr.model)
            this[key] = VertexAttr.model[key];
    }
    ;
}
/**
 * This is the global attribute model. Set these object on the initialization
 * of your app to gain all VertexAttr instances have these attributes.
 *
 * @type {object}
 **/
VertexAttr.model = {
    draggable: true,
    selectable: true,
    isSelected: false,
    visible: true
};
//# sourceMappingURL=VertexAttr.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/VertexListeners.js":
/*!*****************************************************!*\
  !*** ../plotboilerplate/src/esm/VertexListeners.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VertexListeners": () => (/* binding */ VertexListeners)
/* harmony export */ });
/**
 * @author   Ikaros Kappler
 * @date     2018-08-27
 * @modified 2018-11-28 Added the vertex-param to the constructor and extended the event. Vertex events now have a 'params' attribute object.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2020-02-22 Added 'return this' to the add* functions (for chanining).
 * @modified 2020-03-23 Ported to Typescript from JS.
 * @modified 2020-11-17 Added the `click` handler.
 * @version  1.1.0
 *
 * @file VertexListeners
 * @public
 **/
/**
 * @classdesc An event listeners wrapper. This is just a set of three listener
 *              queues (drag, dragStart, dragEnd) and their respective firing
 *              functions.
 *
 */
class VertexListeners {
    /**
     * The constructor.
     *
     * @constructor
     * @name VertexListeners
     * @param {Vertex} vertex - The vertex to use these listeners on (just a backward reference).
     **/
    constructor(vertex) {
        this.click = [];
        this.drag = [];
        this.dragStart = [];
        this.dragEnd = [];
        this.vertex = vertex;
    }
    ;
    /**
     * Add a click listener.
     *
     * @method addClickListener
     * @param {VertexListeners~dragListener} listener - The click listener to add (a callback).
     * @return {VertexListeners} this (for chaining)
     * @instance
     * @memberof VertexListeners
     **/
    addClickListener(listener) {
        VertexListeners._addListener(this.click, listener);
        return this;
    }
    ;
    /**
     * The click listener is a function with a single drag event param.
     * @callback VertexListeners~clickListener
     * @param {Event} e - The (extended) click event.
     */
    /**
     * Remove a drag listener.
     *
     * @method removeDragListener
     * @param {VertexListeners~dragListener} listener - The drag listener to remove (a callback).
     * @return {VertexListeners} this (for chaining)
     * @instance
     * @memberof VertexListeners
     **/
    removeClickListener(listener) {
        this.click = VertexListeners._removeListener(this.click, listener);
        return this;
    }
    ;
    /**
     * The click listener is a function with a single drag event param.
     * @callback VertexListeners~clickListener
     * @param {Event} e - The (extended) click event.
     */
    /**
     * Add a drag listener.
     *
     * @method addDragListener
     * @param {VertexListeners~dragListener} listener - The drag listener to add (a callback).
     * @return {VertexListeners} this (for chaining)
     * @instance
     * @memberof VertexListeners
     **/
    addDragListener(listener) {
        VertexListeners._addListener(this.drag, listener);
        return this;
    }
    ;
    /**
     * The drag listener is a function with a single drag event param.
     * @callback VertexListeners~dragListener
     * @param {Event} e - The (extended) drag event.
     */
    /**
     * Remove a drag listener.
     *
     * @method removeDragListener
     * @param {VertexListeners~dragListener} listener - The drag listener to remove (a callback).
     * @return {VertexListeners} this (for chaining)
     * @instance
     * @memberof VertexListeners
     **/
    removeDragListener(listener) {
        this.drag = VertexListeners._removeListener(this.drag, listener);
        return this;
    }
    ;
    /**
     * Add a dragStart listener.
     *
     * @method addDragListener
     * @param {VertexListeners~dragStartListener} listener - The drag-start listener to add (a callback).
     * @return {VertexListeners} this (for chaining)
     * @instance
     * @memberof VertexListeners
     **/
    addDragStartListener(listener) {
        VertexListeners._addListener(this.dragStart, listener);
        return this;
    }
    ;
    /**
     * The drag-start listener is a function with a single drag event param.
     * @callback VertexListeners~dragStartListener
     * @param {Event} e - The (extended) drag event.
     */
    /**
     * Remove a dragStart listener.
     *
     * @method addDragStartListener
     * @param {VertexListeners~dragListener} listener - The drag listener to remove (a callback).
     * @return {VertexListeners} this (for chaining)
     * @instance
     * @memberof VertexListeners
     **/
    removeDragStartListener(listener) {
        this.dragStart = VertexListeners._removeListener(this.dragStart, listener);
        return this;
    }
    ;
    /**
     * Add a dragEnd listener.
     *
     * @method addDragListener
     * @param {VertexListeners~dragEndListener} listener - The drag-end listener to add (a callback).
     * @return {VertexListeners} this (for chaining)
     * @instance
     * @memberof VertexListeners
     **/
    addDragEndListener(listener) {
        // this.dragEnd.push( listener );
        VertexListeners._addListener(this.dragEnd, listener);
        return this;
    }
    ;
    /**
     * The drag-end listener is a function with a single drag event param.
     * @callback VertexListeners~dragEndListener
     * @param {Event} e - The (extended) drag event.
     */
    /**
    * Remove a drag listener.
    *
    * @method removeDragEndListener
    * @param {VertexListeners~clickListener} listener - The drag listener to remove (a callback).
    * @return {VertexListeners} this (for chaining)
    * @instance
    * @memberof VertexListeners
    **/
    removeDragEndListener(listener) {
        // this.drag.push( listener );
        this.dragEnd = VertexListeners._removeListener(this.dragEnd, listener);
        return this;
    }
    ;
    /**
     * Fire a click event with the given event instance to all
     * installed click listeners.
     *
     * @method fireClickEvent
     * @param {VertEvent|XMouseEvent} e - The click event itself to be fired to all installed drag listeners.
     * @return {void}
     * @instance
     * @memberof VertexListeners
     **/
    fireClickEvent(e) {
        VertexListeners._fireEvent(this, this.click, e);
    }
    ;
    /**
     * Fire a drag event with the given event instance to all
     * installed drag listeners.
     *
     * @method fireDragEvent
     * @param {VertEvent|XMouseEvent} e - The drag event itself to be fired to all installed drag listeners.
     * @return {void}
     * @instance
     * @memberof VertexListeners
     **/
    fireDragEvent(e) {
        VertexListeners._fireEvent(this, this.drag, e);
    }
    ;
    /**
     * Fire a dragStart event with the given event instance to all
     * installed drag-start listeners.
     *
     * @method fireDragStartEvent
     * @param {VertEvent|XMouseEvent} e - The drag-start event itself to be fired to all installed dragStart listeners.
     * @return {void}
     * @instance
     * @memberof VertexListeners
     **/
    fireDragStartEvent(e) {
        VertexListeners._fireEvent(this, this.dragStart, e);
    }
    ;
    /**
     * Fire a dragEnd event with the given event instance to all
     * installed drag-end listeners.
     *
     * @method fireDragEndEvent
     * @param {VertEvent|XMouseEvent} e - The drag-end event itself to be fired to all installed dragEnd listeners.
     * @return {void}
     * @instance
     * @memberof VertexListeners
     **/
    fireDragEndEvent(e) {
        VertexListeners._fireEvent(this, this.dragEnd, e);
    }
    ;
    /**
     * @private
     **/
    static _fireEvent(_self, listeners, e) {
        const ve = e;
        if (typeof ve.params == 'undefined')
            ve.params = { vertex: _self.vertex };
        else
            ve.params.vertex = _self.vertex;
        for (var i in listeners) {
            listeners[i](ve);
        }
    }
    ;
    /**
     * @private
     */
    static _addListener(listeners, newListener) {
        for (var i in listeners) {
            if (listeners[i] == newListener)
                return false;
        }
        listeners.push(newListener);
        return true;
    }
    ;
    /**
     * @private
     */
    static _removeListener(listeners, oldListener) {
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i] == oldListener)
                return listeners.splice(i, 1);
        }
        return listeners;
    }
    ;
}
//# sourceMappingURL=VertexListeners.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/draw.js":
/*!******************************************!*\
  !*** ../plotboilerplate/src/esm/draw.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawutils": () => (/* binding */ drawutils)
/* harmony export */ });
/* harmony import */ var _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CubicBezierCurve */ "../plotboilerplate/src/esm/CubicBezierCurve.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/* harmony import */ var _drawutilssvg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./drawutilssvg */ "../plotboilerplate/src/esm/drawutilssvg.js");
/**
 * @author   Ikaros Kappler
 * @date     2018-04-22
 * @modified 2018-08-16 Added the curve() function to draw cubic bézier curves.
 * @modified 2018-10-23 Recognizing the offset param in the circle() function.
 * @modified 2018-11-27 Added the diamondHandle() function.
 * @modified 2018-11-28 Added the grid() function and the ellipse() function.
 * @modified 2018-11-30 Renamed the text() function to label() as it is not scaling.
 * @modified 2018-12-06 Added a test function for drawing arc in SVG style.
 * @modified 2018-12-09 Added the dot(Vertex,color) function (copied from Feigenbaum-plot-script).
 * @modified 2019-01-30 Added the arrow(Vertex,Vertex,color) function for drawing arrow heads.
 * @modified 2019-01-30 Added the image(Image,Vertex,Vertex) function for drawing images.
 * @modified 2019-04-27 Fixed a severe drawing bug in the arrow(...) function. Scaling arrows did not work properly.
 * @modified 2019-04-28 Added Math.round to the dot() drawing parameters to really draw a singlt dot.
 * @modified 2019-06-07 Fixed an issue in the cubicBezier() function. Paths were always closed.
 * @modified 2019-10-03 Added the beginDrawCycle hook.
 * @modified 2019-10-25 Polygons are no longer drawn with dashed lines (solid lines instead).
 * @modified 2019-11-18 Added the polyline function.
 * @modified 2019-11-22 Added a second workaround for th drawImage bug in Safari.
 * @modified 2019-12-07 Added the 'lineWidth' param to the line(...) function.
 * @modified 2019-12-07 Added the 'lineWidth' param to the cubicBezier(...) function.
 * @modified 2019-12-11 Added the 'color' param to the label(...) function.
 * @modified 2019-12-18 Added the quadraticBezier(...) function (for the sake of approximating Lissajous curves).
 * @modified 2019-12-20 Added the 'lineWidth' param to the polyline(...) function.
 * @modified 2020-01-09 Added the 'lineWidth' param to the ellipse(...) function.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-05-05 Added the 'lineWidth' param to the circle(...) function.
 * @modified 2020-05-12 Drawing any handles (square, circle, diamond) with lineWidth 1 now; this was not reset before.
 * @modified 2020-06-22 Added a context.clearRect() call to the clear() function; clearing with alpha channel did not work as expected.
 * @modified 2020-09-07 Added the circleArc(...) function to draw sections of circles.
 * @modified 2020-10-06 Removed the .closePath() instruction from the circleArc function.
 * @modified 2020-10-15 Re-added the text() function.
 * @modified 2020-10-28 Added the path(Path2D) function.
 * @modified 2020-12-28 Added the `singleSegment` mode (test).
 * @modified 2021-01-05 Added the image-loaded/broken check.
 * @modified 2021-01-24 Added the `setCurrentId` function from the `DrawLib` interface.
 * @modified 2021-02-22 Added the `path` drawing function to draw SVG path data.
 * @modified 2021-03-31 Added the `endDrawCycle` function from `DrawLib`.
 * @modified 2021-05-31 Added the `setConfiguration` function from `DrawLib`.
 * @version  1.9.0
 **/



// Todo: rename this class to Drawutils?
/**
 * @classdesc A wrapper class for basic drawing operations.
 *
 * @requires CubicBzierCurvce
 * @requires Polygon
 * @requires Vertex
 * @requires XYCoords
 */
class drawutils {
    /**
     * The constructor.
     *
     * @constructor
     * @name drawutils
     * @param {anvasRenderingContext2D} context - The drawing context.
     * @param {boolean} fillShaped - Indicates if the constructed drawutils should fill all drawn shapes (if possible).
     **/
    constructor(context, fillShapes) {
        this.ctx = context;
        this.offset = new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(0, 0);
        this.scale = new _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(1, 1);
        this.fillShapes = fillShapes;
    }
    /**
     * Called before each draw cycle.
     * @param {UID=} uid - (optional) A UID identifying the currently drawn element(s).
     **/
    beginDrawCycle(renderTime) {
        // NOOP
    }
    /**
     * Called after each draw cycle.
     *
     * This is required for compatibility with other draw classes in the library (like drawgl).
     *
     * @name endDrawCycle
     * @method
     * @param {number} renderTime
     * @instance
     **/
    endDrawCycle(renderTime) {
        // NOOP
    }
    /**
     * Set the current drawlib configuration.
     *
     * @name setConfiguration
     * @method
     * @param {DrawLibConfiguration} configuration - The new configuration settings to use for the next render methods.
     */
    setConfiguration(configuration) {
        this.ctx.globalCompositeOperation = configuration.blendMode;
    }
    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * It is used by some libraries for identifying elemente on re-renders.
     *
     * @name setCurrentId
     * @method
     * @param {UID} uid - A UID identifying the currently drawn element(s).
     **/
    setCurrentId(uid) {
        // NOOP
    }
    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * Determine the class name for further usage here.
     *
     * @name setCurrentClassName
     * @method
     * @param {string} className - A class name for further custom use cases.
     **/
    setCurrentClassName(className) {
        // NOOP
    }
    /**
     * Draw the line between the given two points with the specified (CSS-) color.
     *
     * @method line
     * @param {Vertex} zA - The start point of the line.
     * @param {Vertex} zB - The end point of the line.
     * @param {string} color - Any valid CSS color string.
     * @param {number} lineWidth? - [optional] The line's width.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    line(zA, zB, color, lineWidth) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.offset.x + zA.x * this.scale.x, this.offset.y + zA.y * this.scale.y);
        this.ctx.lineTo(this.offset.x + zB.x * this.scale.x, this.offset.y + zB.y * this.scale.y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth || 1;
        this.ctx.stroke();
        this.ctx.restore();
    }
    /**
     * Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method arrow
     * @param {Vertex} zA - The start point of the arrow-line.
     * @param {Vertex} zB - The end point of the arrow-line.
     * @param {string} color - Any valid CSS color string.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    arrow(zA, zB, color, lineWidth) {
        var headlen = 8; // length of head in pixels
        // var vertices = PlotBoilerplate.utils.buildArrowHead( zA, zB, headlen, this.scale.x, this.scale.y );
        // var vertices : Array<Vertex> = Vertex.utils.buildArrowHead( zA, zB, headlen, this.scale.x, this.scale.y );
        this.ctx.save();
        this.ctx.beginPath();
        var vertices = _Vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex.utils.buildArrowHead(zA, zB, headlen, this.scale.x, this.scale.y);
        this.ctx.moveTo(this.offset.x + zA.x * this.scale.x, this.offset.y + zA.y * this.scale.y);
        for (var i = 0; i < vertices.length; i++) {
            this.ctx.lineTo(this.offset.x + vertices[i].x, this.offset.y + vertices[i].y);
        }
        this.ctx.lineTo(this.offset.x + vertices[0].x, this.offset.y + vertices[0].y);
        this.ctx.lineWidth = lineWidth || 1;
        this._fillOrDraw(color);
        this.ctx.restore();
    }
    /**
     * Draw an image at the given position with the given size.<br>
     * <br>
     * Note: SVG images may have resizing issues at the moment.Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method image
     * @param {Image} image - The image object to draw.
     * @param {Vertex} position - The position to draw the the upper left corner at.
     * @param {Vertex} size - The x/y-size to draw the image with.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    image(image, position, size) {
        if (!image.complete || !image.naturalWidth) {
            // Avoid drawing un-unloaded or broken images
            return;
        }
        this.ctx.save();
        // Note that there is a Safari bug with the 3 or 5 params variant.
        // Only the 9-param varaint works.
        this.ctx.drawImage(image, 0, 0, image.naturalWidth - 1, // There is this horrible Safari bug (fixed in newer versions)
        image.naturalHeight - 1, // To avoid errors substract 1 here.
        this.offset.x + position.x * this.scale.x, this.offset.y + position.y * this.scale.y, size.x * this.scale.x, size.y * this.scale.y);
        this.ctx.restore();
    }
    /**
     * Draw a rectangle.
     *
     * @param {XYCoords} position - The upper left corner of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @param {string} color - The color to use.
     * @param {number=1} lineWidth - (optional) The line with to use (default is 1).
     **/
    rect(position, width, height, color, lineWidth) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.offset.x + position.x * this.scale.x, this.offset.y + position.y * this.scale.y);
        this.ctx.lineTo(this.offset.x + (position.x + width) * this.scale.x, this.offset.y + position.y * this.scale.y);
        this.ctx.lineTo(this.offset.x + (position.x + width) * this.scale.x, this.offset.y + (position.y + height) * this.scale.y);
        this.ctx.lineTo(this.offset.x + position.x * this.scale.x, this.offset.y + (position.y + height) * this.scale.y);
        // this.ctx.lineTo( this.offset.x+position.x*this.scale.x, this.offset.y+position.y*this.scale.y );
        this.ctx.closePath();
        this.ctx.lineWidth = lineWidth || 1;
        this._fillOrDraw(color);
        this.ctx.restore();
    }
    // +---------------------------------------------------------------------------------
    // | This is the final helper function for drawing and filling stuff. It is not
    // | intended to be used from the outside.
    // |
    // | When in draw mode it draws the current shape.
    // | When in fill mode it fills the current shape.
    // |
    // | This function is usually only called internally.
    // |
    // | @param color A stroke/fill color to use.
    // +-------------------------------
    // TODO: convert this to a STATIC function.
    _fillOrDraw(color) {
        if (this.fillShapes) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        else {
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }
    }
    /**
     * Draw the given (cubic) bézier curve.
     *
     * @method cubicBezier
     * @param {Vertex} startPoint - The start point of the cubic Bézier curve
     * @param {Vertex} endPoint   - The end point the cubic Bézier curve.
     * @param {Vertex} startControlPoint - The start control point the cubic Bézier curve.
     * @param {Vertex} endControlPoint   - The end control point the cubic Bézier curve.
     * @param {string} color - The CSS color to draw the curve with.
     * @param {number} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    cubicBezier(startPoint, endPoint, startControlPoint, endControlPoint, color, lineWidth) {
        if (startPoint instanceof _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_0__.CubicBezierCurve) {
            this.cubicBezier(startPoint.startPoint, startPoint.endPoint, startPoint.startControlPoint, startPoint.endControlPoint, color, lineWidth);
            return;
        }
        // Draw curve
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.offset.x + startPoint.x * this.scale.x, this.offset.y + startPoint.y * this.scale.y);
        this.ctx.bezierCurveTo(this.offset.x + startControlPoint.x * this.scale.x, this.offset.y + startControlPoint.y * this.scale.y, this.offset.x + endControlPoint.x * this.scale.x, this.offset.y + endControlPoint.y * this.scale.y, this.offset.x + endPoint.x * this.scale.x, this.offset.y + endPoint.y * this.scale.y);
        //this.ctx.closePath();
        this.ctx.lineWidth = lineWidth || 2;
        this._fillOrDraw(color);
        this.ctx.restore();
    }
    /**
     * Draw the given (quadratic) bézier curve.
     *
     * @method quadraticBezier
     * @param {Vertex} startPoint   - The start point of the cubic Bézier curve
     * @param {Vertex} controlPoint - The control point the cubic Bézier curve.
     * @param {Vertex} endPoint     - The end control point the cubic Bézier curve.
     * @param {string} color        - The CSS color to draw the curve with.
     * @param {number|string} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    quadraticBezier(startPoint, controlPoint, endPoint, color, lineWidth) {
        // Draw curve
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.offset.x + startPoint.x * this.scale.x, this.offset.y + startPoint.y * this.scale.y);
        this.ctx.quadraticCurveTo(this.offset.x + controlPoint.x * this.scale.x, this.offset.y + controlPoint.y * this.scale.y, this.offset.x + endPoint.x * this.scale.x, this.offset.y + endPoint.y * this.scale.y);
        this.ctx.lineWidth = lineWidth || 2;
        this._fillOrDraw(color);
        this.ctx.restore();
    }
    /**
     * Draw the given (cubic) Bézier path.
     *
     * The given path must be an array with n*3+1 vertices, where n is the number of
     * curves in the path:
     * <pre> [ point1, point1_startControl, point2_endControl, point2, point2_startControl, point3_endControl, point3, ... pointN_endControl, pointN ]</pre>
     *
     * @method cubicBezierPath
     * @param {Vertex[]} path - The cubic bezier path as described above.
     * @param {string} color - The CSS colot to draw the path with.
     * @param {number=1} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    cubicBezierPath(path, color, lineWidth) {
        if (!path || path.length == 0)
            return;
        // Draw curve
        this.ctx.save();
        this.ctx.beginPath();
        var endPoint;
        var startControlPoint;
        var endControlPoint;
        this.ctx.moveTo(this.offset.x + path[0].x * this.scale.x, this.offset.y + path[0].y * this.scale.y);
        for (var i = 1; i < path.length; i += 3) {
            startControlPoint = path[i];
            endControlPoint = path[i + 1];
            endPoint = path[i + 2];
            this.ctx.bezierCurveTo(this.offset.x + startControlPoint.x * this.scale.x, this.offset.y + startControlPoint.y * this.scale.y, this.offset.x + endControlPoint.x * this.scale.x, this.offset.y + endControlPoint.y * this.scale.y, this.offset.x + endPoint.x * this.scale.x, this.offset.y + endPoint.y * this.scale.y);
        }
        this.ctx.closePath();
        this.ctx.lineWidth = lineWidth || 1;
        this._fillOrDraw(color);
        this.ctx.restore();
    }
    /**
     * Draw the given handle and handle point (used to draw interactive Bézier curves).
     *
     * The colors for this are fixed and cannot be specified.
     *
     * @method handle
     * @param {Vertex} startPoint - The start of the handle.
     * @param {Vertex} endPoint - The end point of the handle.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    handle(startPoint, endPoint) {
        // Draw handles
        // (No need to save and restore here)
        this.point(startPoint, "rgb(0,32,192)");
        this.square(endPoint, 5, "rgba(0,128,192,0.5)");
    }
    /**
     * Draw a handle line (with a light grey).
     *
     * @method handleLine
     * @param {Vertex} startPoint - The start point to draw the handle at.
     * @param {Vertex} endPoint - The end point to draw the handle at.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    handleLine(startPoint, endPoint) {
        // Draw handle lines
        this.line(startPoint, endPoint, "rgb(192,192,192)");
    }
    /**
     * Draw a 1x1 dot with the specified (CSS-) color.
     *
     * @method dot
     * @param {Vertex} p - The position to draw the dot at.
     * @param {string} color - The CSS color to draw the dot with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    dot(p, color) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(Math.round(this.offset.x + this.scale.x * p.x), Math.round(this.offset.y + this.scale.y * p.y));
        this.ctx.lineTo(Math.round(this.offset.x + this.scale.x * p.x + 1), Math.round(this.offset.y + this.scale.y * p.y + 1));
        this.ctx.closePath();
        this.ctx.lineWidth = 1;
        this._fillOrDraw(color);
        this.ctx.restore();
    }
    /**
     * Draw the given point with the specified (CSS-) color and radius 3.
     *
     * @method point
     * @param {Vertex} p - The position to draw the point at.
     * @param {string} color - The CSS color to draw the point with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    point(p, color) {
        var radius = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.offset.x + p.x * this.scale.x, this.offset.y + p.y * this.scale.y, radius, 0, 2 * Math.PI, false);
        this.ctx.closePath();
        this.ctx.lineWidth = 1;
        this._fillOrDraw(color);
    }
    /**
     * Draw a circle with the specified (CSS-) color and radius.<br>
     * <br>
     * Note that if the x- and y- scales are different the result will be an ellipse rather than a circle.
     *
     * @method circle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @param {number} lineWidth - The line width (optional, default=1).
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circle(center, radius, color, lineWidth) {
        this.ctx.beginPath();
        this.ctx.ellipse(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y, radius * this.scale.x, radius * this.scale.y, 0.0, 0.0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.lineWidth = lineWidth || 1;
        this._fillOrDraw(color);
    }
    /**
       * Draw a circular arc (section of a circle) with the given CSS color.
       *
       * @method circleArc
       * @param {Vertex} center - The center of the circle.
       * @param {number} radius - The radius of the circle.
       * @param {number} startAngle - The angle to start at.
       * @param {number} endAngle - The angle to end at.
       * @param {string=#000000} color - The CSS color to draw the circle with.
       * @param {number=1} lineWidth - The line width to use
       // * @param {boolean=false} options.asSegment - If `true` then no beginPath and no draw will be applied (as part of larger path).
       * @return {void}
       * @instance
       * @memberof drawutils
       */
    circleArc(center, radius, startAngle, endAngle, color, lineWidth, options) {
        if (!options || !options.asSegment) {
            this.ctx.beginPath();
        }
        this.ctx.ellipse(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y, radius * this.scale.x, radius * this.scale.y, 0.0, startAngle, endAngle, false);
        if (!options || !options.asSegment) {
            // this.ctx.closePath();
            this.ctx.lineWidth = lineWidth || 1;
            this._fillOrDraw(color || "#000000");
        }
    }
    /**
     * Draw an ellipse with the specified (CSS-) color and thw two radii.
     *
     * @method ellipse
     * @param {Vertex} center - The center of the ellipse.
     * @param {number} radiusX - The radius of the ellipse.
     * @param {number} radiusY - The radius of the ellipse.
     * @param {string} color - The CSS color to draw the ellipse with.
     * @param {number} lineWidth=1 - An optional line width param (default is 1).
     * @param {number=} rotation - (optional, default=0) The rotation of the ellipse.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    ellipse(center, radiusX, radiusY, color, lineWidth, rotation) {
        if (typeof rotation === "undefined") {
            rotation = 0.0;
        }
        this.ctx.beginPath();
        this.ctx.ellipse(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y, radiusX * this.scale.x, radiusY * this.scale.y, rotation, 0.0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.lineWidth = lineWidth || 1;
        this._fillOrDraw(color);
    }
    /**
     * Draw square at the given center, size and with the specified (CSS-) color.<br>
     * <br>
     * Note that if the x-scale and the y-scale are different the result will be a rectangle rather than a square.
     *
     * @method square
     * @param {XYCoords} center - The center of the square.
     * @param {number} size - The size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @param {number} lineWidth - The line with to use (optional, default is 1).
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    square(center, size, color, lineWidth) {
        this.ctx.beginPath();
        this.ctx.rect(this.offset.x + (center.x - size / 2.0) * this.scale.x, this.offset.y + (center.y - size / 2.0) * this.scale.y, size * this.scale.x, size * this.scale.y);
        this.ctx.closePath();
        this.ctx.lineWidth = lineWidth || 1;
        this._fillOrDraw(color);
    }
    /**
     * Draw a grid of horizontal and vertical lines with the given (CSS-) color.
     *
     * @method grid
     * @param {Vertex} center - The center of the grid.
     * @param {number} width - The total width of the grid (width/2 each to the left and to the right).
     * @param {number} height - The total height of the grid (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal grid size.
     * @param {number} sizeY - The vertical grid size.
     * @param {string} color - The CSS color to draw the grid with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    grid(center, width, height, sizeX, sizeY, color) {
        this.ctx.beginPath();
        var yMin = -Math.ceil((height * 0.5) / sizeY) * sizeY;
        var yMax = height / 2;
        for (var x = -Math.ceil((width * 0.5) / sizeX) * sizeX; x < width / 2; x += sizeX) {
            this.ctx.moveTo(this.offset.x + (center.x + x) * this.scale.x, this.offset.y + (center.y + yMin) * this.scale.y);
            this.ctx.lineTo(this.offset.x + (center.x + x) * this.scale.x, this.offset.y + (center.y + yMax) * this.scale.y);
        }
        var xMin = -Math.ceil((width * 0.5) / sizeX) * sizeX; // -Math.ceil((height*0.5)/sizeY)*sizeY;
        var xMax = width / 2; // height/2;
        for (var y = -Math.ceil((height * 0.5) / sizeY) * sizeY; y < height / 2; y += sizeY) {
            this.ctx.moveTo(this.offset.x + (center.x + xMin) * this.scale.x - 4, this.offset.y + (center.y + y) * this.scale.y);
            this.ctx.lineTo(this.offset.x + (center.x + xMax) * this.scale.x + 4, this.offset.y + (center.y + y) * this.scale.y);
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.0;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Draw a raster of crosshairs in the given grid.<br>
     *
     * This works analogue to the grid() function
     *
     * @method raster
     * @param {Vertex} center - The center of the raster.
     * @param {number} width - The total width of the raster (width/2 each to the left and to the right).
     * @param {number} height - The total height of the raster (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal raster size.
     * @param {number} sizeY - The vertical raster size.
     * @param {string} color - The CSS color to draw the raster with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    raster(center, width, height, sizeX, sizeY, color) {
        this.ctx.save();
        this.ctx.beginPath();
        for (var x = -Math.ceil((width * 0.5) / sizeX) * sizeX; x < width / 2; x += sizeX) {
            for (var y = -Math.ceil((height * 0.5) / sizeY) * sizeY; y < height / 2; y += sizeY) {
                // Draw a crosshair
                this.ctx.moveTo(this.offset.x + (center.x + x) * this.scale.x - 4, this.offset.y + (center.y + y) * this.scale.y);
                this.ctx.lineTo(this.offset.x + (center.x + x) * this.scale.x + 4, this.offset.y + (center.y + y) * this.scale.y);
                this.ctx.moveTo(this.offset.x + (center.x + x) * this.scale.x, this.offset.y + (center.y + y) * this.scale.y - 4);
                this.ctx.lineTo(this.offset.x + (center.x + x) * this.scale.x, this.offset.y + (center.y + y) * this.scale.y + 4);
            }
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.0;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }
    /**
     * Draw a diamond handle (square rotated by 45°) with the given CSS color.
     *
     * It is an inherent feature of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped diamonds.
     *
     * @method diamondHandle
     * @param {Vertex} center - The center of the diamond.
     * @param {Vertex} size - The x/y-size of the diamond.
     * @param {string} color - The CSS color to draw the diamond with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    diamondHandle(center, size, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.offset.x + center.x * this.scale.x - size / 2.0, this.offset.y + center.y * this.scale.y);
        this.ctx.lineTo(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y - size / 2.0);
        this.ctx.lineTo(this.offset.x + center.x * this.scale.x + size / 2.0, this.offset.y + center.y * this.scale.y);
        this.ctx.lineTo(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y + size / 2.0);
        this.ctx.closePath();
        this.ctx.lineWidth = 1;
        this._fillOrDraw(color);
    }
    /**
     * Draw a square handle with the given CSS color.<br>
     * <br>
     * It is an inherent feature of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped squares.
     *
     * @method squareHandle
     * @param {Vertex} center - The center of the square.
     * @param {Vertex} size - The x/y-size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    squareHandle(center, size, color) {
        this.ctx.beginPath();
        this.ctx.rect(this.offset.x + center.x * this.scale.x - size / 2.0, this.offset.y + center.y * this.scale.y - size / 2.0, size, size);
        this.ctx.closePath();
        this.ctx.lineWidth = 1;
        this._fillOrDraw(color);
    }
    /**
     * Draw a circle handle with the given CSS color.<br>
     * <br>
     * It is an inherent feature of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped circles.
     *
     * @method circleHandle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circleHandle(center, radius, color) {
        radius = radius || 3;
        this.ctx.beginPath();
        this.ctx.arc(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y, radius, 0, 2 * Math.PI, false);
        this.ctx.closePath();
        this.ctx.lineWidth = 1;
        this._fillOrDraw(color);
    }
    /**
     * Draw a crosshair with given radius and color at the given position.<br>
     * <br>
     * Note that the crosshair radius will not be affected by scaling.
     *
     * @method crosshair
     * @param {XYCoords} center - The center of the crosshair.
     * @param {number} radius - The radius of the crosshair.
     * @param {string} color - The CSS color to draw the crosshair with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    crosshair(center, radius, color) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.offset.x + center.x * this.scale.x - radius, this.offset.y + center.y * this.scale.y);
        this.ctx.lineTo(this.offset.x + center.x * this.scale.x + radius, this.offset.y + center.y * this.scale.y);
        this.ctx.moveTo(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y - radius);
        this.ctx.lineTo(this.offset.x + center.x * this.scale.x, this.offset.y + center.y * this.scale.y + radius);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }
    /**
     * Draw a polygon.
     *
     * @method polygon
     * @param {Polygon}  polygon - The polygon to draw.
     * @param {string}   color - The CSS color to draw the polygon with.
     * @param {string}   lineWidth - The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    polygon(polygon, color, lineWidth) {
        this.polyline(polygon.vertices, polygon.isOpen, color, lineWidth);
    }
    /**
     * Draw a polygon line (alternative function to the polygon).
     *
     * @method polyline
     * @param {Vertex[]} vertices   - The polygon vertices to draw.
     * @param {boolan}   isOpen     - If true the polyline will not be closed at its end.
     * @param {string}   color      - The CSS color to draw the polygon with.
     * @param {number}   lineWidth  - The line width (default is 1.0);
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    polyline(vertices, isOpen, color, lineWidth) {
        if (vertices.length <= 1)
            return;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth || 1.0;
        this.ctx.moveTo(this.offset.x + vertices[0].x * this.scale.x, this.offset.y + vertices[0].y * this.scale.y);
        for (var i = 0; i < vertices.length; i++) {
            this.ctx.lineTo(this.offset.x + vertices[i].x * this.scale.x, this.offset.y + vertices[i].y * this.scale.y);
        }
        if (!isOpen)
            // && vertices.length > 2 )
            this.ctx.closePath();
        this._fillOrDraw(color);
        this.ctx.closePath();
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }
    text(text, x, y, options) {
        options = options || {};
        this.ctx.save();
        x = this.offset.x + x * this.scale.x;
        y = this.offset.y + y * this.scale.y;
        const color = options.color || "black";
        if (this.fillShapes) {
            this.ctx.fillStyle = color;
            this.ctx.fillText(text, x, y);
        }
        else {
            this.ctx.strokeStyle = color;
            this.ctx.strokeText(text, x, y);
        }
        this.ctx.restore();
    }
    /**
     * Draw a non-scaling text label at the given position.
     *
     * Note that these are absolute label positions, they are not affected by offset or scale.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (optional) rotation in radians (default=0).
     * @param {string=} color - The color to render the text with (default=black).
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    label(text, x, y, rotation, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        if (typeof rotation != "undefined")
            this.ctx.rotate(rotation);
        this.ctx.fillStyle = color || "black";
        if (this.fillShapes) {
            this.ctx.fillText(text, 0, 0);
        }
        else {
            this.ctx.strokeText(text, 0, 0);
        }
        this.ctx.restore();
    }
    /**
     * Draw an SVG-like path given by the specified path data.
     *
     *
     * @method path
     * @param {SVGPathData} pathData - An array of path commands and params.
     * @param {string=null} color - (optional) The color to draw this path with (default is null).
     * @param {number=1} lineWidth - (optional) the line width to use (default is 1).
     * @param {boolean=false} options.inplace - (optional) If set to true then path transforamtions (scale and translate) will be done in-place in the array. This can boost the performance.
     * @instance
     * @memberof drawutils
     * @return {R} An instance representing the drawn path.
     */
    path(pathData, color, lineWidth, options) {
        const d = options && options.inplace ? pathData : _drawutilssvg__WEBPACK_IMPORTED_MODULE_2__.drawutilssvg.copyPathData(pathData);
        _drawutilssvg__WEBPACK_IMPORTED_MODULE_2__.drawutilssvg.transformPathData(d, this.offset, this.scale);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth || 1;
        if (this.fillShapes) {
            this.ctx.fillStyle = color;
            this.ctx.fill(new Path2D(d.join(" ")));
        }
        else {
            this.ctx.strokeStyle = color;
            this.ctx.stroke(new Path2D(d.join(" ")));
        }
    }
    /**
     * Due to gl compatibility there is a generic 'clear' function required
     * to avoid accessing the context object itself directly.
     *
     * This function just fills the whole canvas with a single color.
     *
     * @param {string} color - The color to clear with.
     **/
    clear(color) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
//# sourceMappingURL=draw.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/drawgl.js":
/*!********************************************!*\
  !*** ../plotboilerplate/src/esm/drawgl.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawutilsgl": () => (/* binding */ drawutilsgl)
/* harmony export */ });
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * @author   Ikaros Kappler
 * @date     2019-09-18
 * @modified 2019-10-03 Added the beginDrawCycle hook.
 * @modified 2020-03-25 Ported stub to Typescript.
 * @modified 2020-10-15 Re-added the text() function.
 * @modified 2021-01-24 Added the `setCurrentId` function.
 * @modified 2021-05-31 Added the `setConfiguration` function from `DrawLib`.
 * @version  0.0.5
 **/

/**
 * @classdesc A wrapper class for basic drawing operations. This is the WebGL
 * implementation whih sould work with shaders.
 *
 * @requires CubicBzierCurvce
 * @requires Polygon
 * @requires SVGSerializable
 * @requires Vertex
 * @requires XYCoords
 */
class drawutilsgl {
    /**
     * The constructor.
     *
     * @constructor
     * @name drawutils
     * @param {WebGLRenderingContext} context - The drawing context.
     * @param {boolean} fillShaped - Indicates if the constructed drawutils should fill all drawn shapes (if possible).
     **/
    constructor(context, fillShapes) {
        this.gl = context;
        this.offset = new _Vertex__WEBPACK_IMPORTED_MODULE_0__.Vertex(0, 0);
        this.scale = new _Vertex__WEBPACK_IMPORTED_MODULE_0__.Vertex(1, 1);
        this.fillShapes = fillShapes;
        this._zindex = 0.0;
        if (context == null || typeof context === "undefined")
            return;
        this.glutils = new GLU(context);
        // PROBLEM: CANNOT USE MULTIPLE SHADER PROGRAM INSTANCES ON THE SAME CONTEXT!
        // SOLUTION: USE SHARED SHADER PROGRAM!!! ... somehow ...
        // This needs to be considered in the overlying component; both draw-instances need to
        // share their gl context.
        // That's what the copyInstace(boolean) method is good for.
        this._vertShader = this.glutils.compileShader(drawutilsgl.vertCode, this.gl.VERTEX_SHADER);
        this._fragShader = this.glutils.compileShader(drawutilsgl.fragCode, this.gl.FRAGMENT_SHADER);
        this._program = this.glutils.makeProgram(this._vertShader, this._fragShader);
        // Create an empty buffer object
        this.vertex_buffer = this.gl.createBuffer();
        // Bind appropriate array buffer to it
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
        console.log("gl initialized");
    }
    _x2rel(x) {
        return ((this.scale.x * x + this.offset.x) / this.gl.canvas.width) * 2.0 - 1.0;
    }
    _y2rel(y) {
        return ((this.offset.y - this.scale.y * y) / this.gl.canvas.height) * 2.0 - 1.0;
    }
    /**
     * Creates a 'shallow' (non deep) copy of this instance. This implies
     * that under the hood the same gl context and gl program will be used.
     */
    copyInstance(fillShapes) {
        var copy = new drawutilsgl(null, fillShapes);
        copy.gl = this.gl;
        copy.glutils = this.glutils;
        copy._vertShader = this._vertShader;
        copy._fragShader = this._fragShader;
        copy._program = this._program;
        return copy;
    }
    /**
     * Called before each draw cycle.
     * @param {number} renderTime
     **/
    beginDrawCycle(renderTime) {
        this._zindex = 0.0;
        this.renderTime = renderTime;
    }
    /**
     * Called after each draw cycle.
     *
     * This is required for compatibility with other draw classes in the library (like drawgl).
     *
     * @name endDrawCycle
     * @method
     * @param {number} renderTime
     * @instance
     **/
    endDrawCycle(renderTime) {
        // NOOP
    }
    /**
     * Set the current drawlib configuration.
     *
     * @name setConfiguration
     * @method
     * @param {DrawLibConfiguration} configuration - The new configuration settings to use for the next render methods.
     */
    setConfiguration(configuration) {
        // TODO
    }
    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * It is used by some libraries for identifying elemente on re-renders.
     *
     * @name setCurrentId
     * @method
     * @param {UID} uid - A UID identifying the currently drawn element(s).es.
     **/
    setCurrentId(uid) {
        // NOOP
        this.curId = uid;
    }
    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * Determine the class name for further usage here.
     *
     * @name setCurrentClassName
     * @method
     * @param {string} className - A class name for further custom use cases.
     **/
    setCurrentClassName(className) {
        // NOOP
    }
    /**
     * Draw the line between the given two points with the specified (CSS-) color.
     *
     * @method line
     * @param {Vertex} zA - The start point of the line.
     * @param {Vertex} zB - The end point of the line.
     * @param {string} color - Any valid CSS color string.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    line(zA, zB, color) {
        const vertices = new Float32Array(6);
        vertices[0] = this._x2rel(zA.x);
        vertices[1] = this._y2rel(zA.y);
        vertices[2] = this._zindex;
        vertices[3] = this._x2rel(zB.x);
        vertices[4] = this._y2rel(zB.y);
        vertices[5] = this._zindex;
        this._zindex += 0.001;
        // Create an empty buffer object
        // const vertex_buffer = this.gl.createBuffer();
        // Bind appropriate array buffer to it
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
        // Pass the vertex data to the buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        // Bind vertex buffer object
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
        // Get the attribute location
        var coord = this.gl.getAttribLocation(this._program, "position");
        // Point an attribute to the currently bound VBO
        this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
        // Enable the attribute
        this.gl.enableVertexAttribArray(coord);
        // Unbind the buffer?
        //this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // Set the view port
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        let uRotationVector = this.gl.getUniformLocation(this._program, "uRotationVector");
        // let radians = currentAngle * Math.PI / 180.0;
        let currentRotation = [0.0, 1.0];
        //currentRotation[0] = Math.sin(radians);
        //currentRotation[1] = Math.cos(radians);
        this.gl.uniform2fv(uRotationVector, currentRotation);
        this.gl.lineWidth(5);
        // Draw the line
        this.gl.drawArrays(this.gl.LINES, 0, vertices.length / 3);
        // POINTS, LINE_STRIP, LINE_LOOP, LINES,
        // TRIANGLE_STRIP,TRIANGLE_FAN, TRIANGLES
    }
    /**
     * Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method arrow
     * @param {Vertex} zA - The start point of the arrow-line.
     * @param {Vertex} zB - The end point of the arrow-line.
     * @param {string} color - Any valid CSS color string.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    arrow(zA, zB, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw an image at the given position with the given size.<br>
     * <br>
     * Note: SVG images may have resizing issues at the moment.Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method image
     * @param {Image} image - The image object to draw.
     * @param {Vertex} position - The position to draw the the upper left corner at.
     * @param {Vertex} size - The x/y-size to draw the image with.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    image(image, position, size) {
        // NOT YET IMPLEMENTED
    }
    // +---------------------------------------------------------------------------------
    // | This is the final helper function for drawing and filling stuff. It is not
    // | intended to be used from the outside.
    // |
    // | When in draw mode it draws the current shape.
    // | When in fill mode it fills the current shape.
    // |
    // | This function is usually only called internally.
    // |
    // | @param color A stroke/fill color to use.
    // +-------------------------------
    _fillOrDraw(color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw the given (cubic) bézier curve.
     *
     * @method cubicBezier
     * @param {Vertex} startPoint - The start point of the cubic Bézier curve
     * @param {Vertex} endPoint   - The end point the cubic Bézier curve.
     * @param {Vertex} startControlPoint - The start control point the cubic Bézier curve.
     * @param {Vertex} endControlPoint   - The end control point the cubic Bézier curve.
     * @param {string} color - The CSS color to draw the curve with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    cubicBezier(startPoint, endPoint, startControlPoint, endControlPoint, color, lineWidth) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw the given (cubic) Bézier path.
     *
     * The given path must be an array with n*3+1 vertices, where n is the number of
     * curves in the path:
     * <pre> [ point1, point1_startControl, point2_endControl, point2, point2_startControl, point3_endControl, point3, ... pointN_endControl, pointN ]</pre>
     *
     * @method cubicBezierPath
     * @param {Vertex[]} path - The cubic bezier path as described above.
     * @param {string} color - The CSS colot to draw the path with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    cubicBezierPath(path, color, lineWidth) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw the given handle and handle point (used to draw interactive Bézier curves).
     *
     * The colors for this are fixed and cannot be specified.
     *
     * @method handle
     * @param {Vertex} startPoint - The start of the handle.
     * @param {Vertex} endPoint - The end point of the handle.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    handle(startPoint, endPoint) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a handle line (with a light grey).
     *
     * @method handleLine
     * @param {Vertex} startPoint - The start point to draw the handle at.
     * @param {Vertex} endPoint - The end point to draw the handle at.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    handleLine(startPoint, endPoint) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a 1x1 dot with the specified (CSS-) color.
     *
     * @method dot
     * @param {Vertex} p - The position to draw the dot at.
     * @param {string} color - The CSS color to draw the dot with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    dot(p, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw the given point with the specified (CSS-) color and radius 3.
     *
     * @method point
     * @param {Vertex} p - The position to draw the point at.
     * @param {string} color - The CSS color to draw the point with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    point(p, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a circle with the specified (CSS-) color and radius.<br>
     * <br>
     * Note that if the x- and y- scales are different the result will be an ellipse rather than a circle.
     *
     * @method circle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circle(center, radius, color, lineWidth) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a circular arc (section of a circle) with the given CSS color.
     *
     * @method circleArc
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {number} startAngle - The angle to start at.
     * @param {number} endAngle - The angle to end at.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circleArc(center, radius, startAngle, endAngle, color, lineWidth) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw an ellipse with the specified (CSS-) color and thw two radii.
     *
     * @method ellipse
     * @param {Vertex} center - The center of the ellipse.
     * @param {number} radiusX - The radius of the ellipse.
     * @param {number} radiusY - The radius of the ellipse.
     * @param {string} color - The CSS color to draw the ellipse with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @param {number=} rotation - (optional, default=0) The rotation of the ellipse.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    ellipse(center, radiusX, radiusY, color, lineWidth, rotation) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw square at the given center, size and with the specified (CSS-) color.<br>
     * <br>
     * Note that if the x-scale and the y-scale are different the result will be a rectangle rather than a square.
     *
     * @method square
     * @param {XYCords} center - The center of the square.
     * @param {Vertex} size - The size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    square(center, size, color, lineWidth) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a rectangle.
     *
     * @param {XYCoords} position - The upper left corner of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @param {string} color - The color to use.
     * @param {number=1} lineWidth - (optional) The line with to use (default is 1).
     **/
    rect(position, width, height, color, lineWidth) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a grid of horizontal and vertical lines with the given (CSS-) color.
     *
     * @method grid
     * @param {Vertex} center - The center of the grid.
     * @param {number} width - The total width of the grid (width/2 each to the left and to the right).
     * @param {number} height - The total height of the grid (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal grid size.
     * @param {number} sizeY - The vertical grid size.
     * @param {string} color - The CSS color to draw the grid with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    grid(center, width, height, sizeX, sizeY, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a raster of crosshairs in the given grid.<br>
     *
     * This works analogue to the grid() function
     *
     * @method raster
     * @param {Vertex} center - The center of the raster.
     * @param {number} width - The total width of the raster (width/2 each to the left and to the right).
     * @param {number} height - The total height of the raster (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal raster size.
     * @param {number} sizeY - The vertical raster size.
     * @param {string} color - The CSS color to draw the raster with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    raster(center, width, height, sizeX, sizeY, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a diamond handle (square rotated by 45°) with the given CSS color.
     *
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped diamonds.
     *
     * @method diamondHandle
     * @param {Vertex} center - The center of the diamond.
     * @param {Vertex} size - The x/y-size of the diamond.
     * @param {string} color - The CSS color to draw the diamond with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    diamondHandle(center, size, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a square handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped squares.
     *
     * @method squareHandle
     * @param {Vertex} center - The center of the square.
     * @param {Vertex} size - The x/y-size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    squareHandle(center, size, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a circle handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped circles.
     *
     * @method circleHandle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circleHandle(center, size, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a crosshair with given radius and color at the given position.<br>
     * <br>
     * Note that the crosshair radius will not be affected by scaling.
     *
     * @method crosshair
     * @param {XYCoords} center - The center of the crosshair.
     * @param {number} radius - The radius of the crosshair.
     * @param {string} color - The CSS color to draw the crosshair with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    crosshair(center, radius, color) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a polygon.
     *
     * @method polygon
     * @param {Polygon} polygon - The polygon to draw.
     * @param {string} color - The CSS color to draw the polygon with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    polygon(polygon, color, lineWidth) {
        const vertices = new Float32Array(polygon.vertices.length * 3);
        for (var i = 0; i < polygon.vertices.length; i++) {
            vertices[i * 3 + 0] = this._x2rel(polygon.vertices[i].x);
            vertices[i * 3 + 1] = this._y2rel(polygon.vertices[i].y);
            vertices[i * 3 + 2] = this._zindex;
        }
        this._zindex += 0.001;
        //console.log( vertices );
        // Create an empty buffer object
        // const vertex_buffer = this.gl.createBuffer();
        // Bind appropriate array buffer to it
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
        // Pass the vertex data to the buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        // Bind vertex buffer object
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
        // Get the attribute location
        var coord = this.gl.getAttribLocation(this._program, "position");
        // Point an attribute to the currently bound VBO
        this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
        // Enable the attribute
        this.gl.enableVertexAttribArray(coord);
        // Unbind the buffer?
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // Set the view port
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        let uRotationVector = this.gl.getUniformLocation(this._program, "uRotationVector");
        // let radians = currentAngle * Math.PI / 180.0;
        let currentRotation = [0.0, 1.0];
        //currentRotation[0] = Math.sin(radians);
        //currentRotation[1] = Math.cos(radians);
        this.gl.uniform2fv(uRotationVector, currentRotation);
        // Draw the polygon
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, vertices.length / 3);
        // POINTS, LINE_STRIP, LINE_LOOP, LINES,
        // TRIANGLE_STRIP,TRIANGLE_FAN, TRIANGLES
    }
    /**
     * Draw a polygon line (alternative function to the polygon).
     *
     * @method polyline
     * @param {Vertex[]} vertices - The polygon vertices to draw.
     * @param {boolan}   isOpen   - If true the polyline will not be closed at its end.
     * @param {string}   color    - The CSS color to draw the polygon with.
     * @param {number=}  lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    polyline(vertices, isOpen, color, lineWidth) {
        // NOT YET IMPLEMENTED
    }
    text(text, x, y, options) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw a non-scaling text label at the given position.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (aoptional) rotation in radians.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    // +---------------------------------------------------------------------------------
    // | Draw a non-scaling text label at the given position.
    // +-------------------------------
    label(text, x, y, rotation) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Draw an SVG-like path given by the specified path data.
     *
     * @method path
     * @param {SVGPathData} pathData - An array of path commands and params.
     * @param {string=null} color - (optional) The color to draw this path with (default is null).
     * @param {number=1} lineWidth - (optional) the line width to use (default is 1).
     * @param {boolean=false} options.inplace - (optional) If set to true then path transforamtions (scale and translate) will be done in-place in the array. This can boost the performance.
     * @instance
     * @memberof drawutils
     * @return {R} An instance representing the drawn path.
     */
    path(pathData, color, lineWidth, options) {
        // NOT YET IMPLEMENTED
    }
    /**
     * Due to gl compatibility there is a generic 'clear' function required
     * to avoid accessing the context object itself directly.
     *
     * This function just fills the whole canvas with a single color.
     *
     * @param {string} color - The color to clear with.
     **/
    clear(color) {
        // NOT YET IMPLEMENTED
        // if( typeof color == 'string' )
        // color = Color.parse(color); // Color class does not yet exist in TS
        // Clear the canvas
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // Enable the depth test
        this.gl.enable(this.gl.DEPTH_TEST);
        // Clear the color and depth buffer
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}
// Vertex shader source code
drawutilsgl.vertCode = `
    precision mediump float;

    attribute vec3 position;

    uniform vec2 uRotationVector;

    void main(void) {
	vec2 rotatedPosition = vec2(
	    position.x * uRotationVector.y +
		position.y * uRotationVector.x,
	    position.y * uRotationVector.y -
		position.x * uRotationVector.x
	);

	gl_Position = vec4(rotatedPosition, position.z, 1.0);
    }`;
// Fragment shader source code
drawutilsgl.fragCode = `
    precision highp float;

    void main(void) {
	gl_FragColor = vec4(0.0,0.75,1.0,1.0);
    }`;
/**
 * Some GL helper utils.
 **/
class GLU {
    constructor(gl) {
        this.gl = gl;
    }
    bufferData(verts) {
        // Create an empty buffer object
        var vbuffer = this.gl.createBuffer();
        // Bind appropriate array buffer to it
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbuffer);
        // Pass the vertex data to the buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);
        // Unbind the buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbuffer;
    }
    /*=================== Shaders ====================*/
    compileShader(shaderCode, shaderType) {
        // Create a vertex shader object
        var shader = this.gl.createShader(shaderType);
        // Attach vertex shader source code
        this.gl.shaderSource(shader, shaderCode);
        // Compile the vertex shader
        this.gl.compileShader(shader);
        const vertStatus = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!vertStatus) {
            console.warn("Error in shader:" + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    makeProgram(vertShader, fragShader) {
        // Create a shader program object to store
        // the combined shader program
        var program = this.gl.createProgram();
        // Attach a vertex shader
        this.gl.attachShader(program, vertShader);
        // Attach a fragment shader
        this.gl.attachShader(program, fragShader);
        // Link both the programs
        this.gl.linkProgram(program);
        // Use the combined shader program object
        this.gl.useProgram(program);
        /*======= Do some cleanup ======*/
        this.gl.detachShader(program, vertShader);
        this.gl.detachShader(program, fragShader);
        this.gl.deleteShader(vertShader);
        this.gl.deleteShader(fragShader);
        return program;
    }
}
//# sourceMappingURL=drawgl.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/drawutilssvg.js":
/*!**************************************************!*\
  !*** ../plotboilerplate/src/esm/drawutilssvg.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawutilssvg": () => (/* binding */ drawutilssvg)
/* harmony export */ });
/* harmony import */ var _CircleSector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CircleSector */ "../plotboilerplate/src/esm/CircleSector.js");
/* harmony import */ var _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CubicBezierCurve */ "../plotboilerplate/src/esm/CubicBezierCurve.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/**
 * Draws elements into an SVG node.
 *
 * Note that this library uses buffers and draw cycles. To draw onto an SVG canvas, do this:
 *   const drawLib = new drawutilssvg( svgNode, ... );
 *   const fillLib = drawLib.copyInstance(true);
 *   // Begin draw cycle
 *   drawLib.beginDrawCycle(time);
 *   // ... draw or fill your stuff ...
 *   drawLib.endDrawCycle(time); // Here the elements become visible
 *
 * @author   Ikaros Kappler
 * @date     2021-01-03
 * @modified 2021-01-24 Fixed the `fillShapes` attribute in the copyInstance function.
 * @modified 2021-01-26 Changed the `isPrimary` (default true) attribute to `isSecondary` (default false).
 * @modified 2021-02-03 Added the static `createSvg` function.
 * @modified 2021-02-03 Fixed the currentId='background' bug on the clear() function.
 * @modified 2021-02-03 Fixed CSSProperty `stroke-width` (was line-width before, which is wrong).
 * @modified 2021-02-03 Added the static `HEAD_XML` attribute.
 * @modified 2021-02-19 Added the static helper function `transformPathData(...)` for svg path transformations (scale and translate).
 * @modified 2021-02-22 Added the static helper function `copyPathData(...)`.
 * @modified 2021-02-22 Added the `path` drawing function to draw SVG path data.
 * @modified 2021-03-01 Fixed a bug in the `clear` function (curClassName was not cleared).
 * @modified 2021-03-29 Fixed a bug in the `text` function (second y param was wrong, used x here).
 * @modified 2021-03-29 Moved this file from `src/ts/utils/helpers/` to `src/ts/`.
 * @modified 2021-03-31 Added 'ellipseSector' the the class names.
 * @modified 2021-03-31 Implemented buffering using a buffer <g> node and the beginDrawCycle and endDrawCycle methods.
 * @modified 2021-05-31 Added the `setConfiguration` function from `DrawLib`.
 * @version  1.3.0
 **/



/**
 * @classdesc A helper class for basic SVG drawing operations. This class should
 * be compatible to the default 'draw' class.
 *
 * @requires CubicBzierCurvce
 * @requires Polygon
 * @requires Vertex
 * @requires XYCoords
 */
class drawutilssvg {
    /**
     * The constructor.
     *
     * @constructor
     * @name drawutilssvg
     * @param {SVGElement} svgNode - The SVG node to use.
     * @param {XYCoords} offset - The draw offset to use.
     * @param {XYCoords} scale - The scale factors to use.
     * @param {XYDimension} canvasSize - The initial canvas size (use setSize to change).
     * @param {boolean} fillShapes - Indicates if the constructed drawutils should fill all drawn shapes (if possible).
     * @param {DrawConfig} drawConfig - The default draw config to use for CSS fallback styles.
     * @param {boolean=} isSecondary - (optional) Indicates if this is the primary or secondary instance. Only primary instances manage child nodes.
     * @param {SVGGElement=} gNode - (optional) Primary and seconday instances share the same &lt;g> node.
     **/
    constructor(svgNode, offset, scale, canvasSize, fillShapes, drawConfig, isSecondary, gNode, bufferGNode) {
        this.svgNode = svgNode;
        this.offset = new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(0, 0).set(offset);
        this.scale = new _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(1, 1).set(scale);
        this.fillShapes = fillShapes;
        this.isSecondary = isSecondary;
        this.drawlibConfiguration = {};
        this.cache = new Map();
        this.setSize(canvasSize);
        if (isSecondary) {
            this.gNode = gNode;
            this.bufferGNode = bufferGNode;
        }
        else {
            this.addStyleDefs(drawConfig);
            this.gNode = this.createSVGNode("g");
            this.bufferGNode = this.createSVGNode("g");
            this.svgNode.appendChild(this.gNode);
        }
    }
    addStyleDefs(drawConfig) {
        this.nodeStyle = this.createSVGNode("style");
        this.svgNode.appendChild(this.nodeStyle);
        // Which default styles to add? -> All from the DrawConfig.
        // Compare with DrawConfig interface
        const keys = {
            "polygon": "Polygon",
            "triangle": "Triangle",
            "ellipse": "Ellipse",
            "ellipseSector": "EllipseSector",
            "circle": "Circle",
            "circleSector": "CircleSector",
            "vertex": "Vertex",
            "line": "Line",
            "vector": "Vector",
            "image": "Image"
        };
        // Question: why isn't this working if the svgNode is created dynamically? (nodeStyle.sheet is null)
        const rules = [];
        for (var k in keys) {
            const className = keys[k];
            const drawSettings = drawConfig[k];
            if (drawSettings) {
                rules.push(`.${className} { fill : none; stroke: ${drawSettings.color}; stroke-width: ${drawSettings.lineWidth}px }`);
            }
            else {
                console.warn(`Warning: your draw config is missing the key '${k}' which is required.`);
            }
        }
        this.nodeStyle.innerHTML = rules.join("\n");
    }
    /**
     * This is a simple way to include custom CSS class mappings to the style defs of the generated SVG.
     *
     * The mapping should be of the form
     *   [style-class] -> [style-def-string]
     *
     * Example:
     *   "rect.red" -> "fill: #ff0000; border: 1px solid red"
     *
     * @param {Map<string,string>} defs
     */
    addCustomStyleDefs(defs) {
        const buffer = [];
        defs.forEach((value, key) => {
            buffer.push(key + " { " + value + " }");
        });
        this.nodeStyle.innerHTML += "\n/* Custom styles */\n" + buffer.join("\n");
    }
    /**
     * Retieve an old (cached) element.
     * Only if both – key and nodeName – match, the element will be returned (null otherwise).
     *
     * @method findElement
     * @private
     * @memberof drawutilssvg
     * @instance
     * @param {UID} key - The key of the desired element (used when re-drawing).
     * @param {string} nodeName - The expected node name.
     */
    findElement(key, nodeName) {
        var node = this.cache.get(key);
        if (node && node.nodeName.toUpperCase() === nodeName.toUpperCase()) {
            this.cache.delete(key);
            return node;
        }
        return null;
    }
    /**
     * Create a new DOM node &lt;svg&gt; in the SVG namespace.
     *
     * @method createSVGNode
     * @private
     * @memberof drawutilssvg
     * @instance
     * @param {string} nodeName - The node name (tag-name).
     * @return {SVGElement} A new element in the SVG namespace with the given node name.
     */
    createSVGNode(nodeName) {
        return document.createElementNS("http://www.w3.org/2000/svg", nodeName);
    }
    /**
     * Make a new SVG node (or recycle an old one) with the given node name (circle, path, line, rect, ...).
     *
     * This function is used in draw cycles to re-use old DOM nodes (in hope to boost performance).
     *
     * @method makeNode
     * @private
     * @instance
     * @memberof drawutilssvg
     * @param {string} nodeName - The node name.
     * @return {SVGElement} The new node, which is not yet added to any document.
     */
    makeNode(nodeName) {
        // Try to find node in current DOM cache.
        // Unique node keys are strictly necessary.
        // Try to recycle an old element from cache.
        var node = this.findElement(this.curId, nodeName);
        if (!node) {
            // If no such old elements exists (key not found, tag name not matching),
            // then create a new one.
            node = this.createSVGNode(nodeName);
        }
        if (this.drawlibConfiguration.blendMode) {
            node.style["mix-blend-mode"] = this.drawlibConfiguration.blendMode;
        }
        return node;
    }
    /**
     * This is the final helper function for drawing and filling stuff and binding new
     * nodes to the SVG document.
     * It is not intended to be used from the outside.
     *
     * When in draw mode it draws the current shape.
     * When in fill mode it fills the current shape.
     *
     * This function is usually only called internally.
     *
     * @method _bindFillDraw
     * @private
     * @instance
     * @memberof drawutilssvg
     * @param {SVGElement} node - The node to draw/fill and bind.
     * @param {string} className - The class name(s) to use.
     * @param {string} color - A stroke/fill color to use.
     * @param {number=1} lineWidth - (optional) A line width to use for drawing (default is 1).
     * @return {SVGElement} The node itself (for chaining).
     */
    _bindFillDraw(node, className, color, lineWidth) {
        if (this.curClassName) {
            node.setAttribute("class", `${className} ${this.curClassName}`);
        }
        else {
            node.setAttribute("class", className);
        }
        node.setAttribute("fill", this.fillShapes ? color : "none");
        node.setAttribute("stroke", this.fillShapes ? "none" : color);
        node.setAttribute("stroke-width", `${lineWidth || 1}`);
        if (this.curId) {
            node.setAttribute("id", `${this.curId}`); // Maybe React-style 'key' would be better?
        }
        if (!node.parentNode) {
            // Attach to DOM only if not already attached
            this.bufferGNode.appendChild(node);
        }
        return node;
    }
    /**
     * Sets the size and view box of the document. Call this if canvas size changes.
     *
     * @method setSize
     * @instance
     * @memberof drawutilssvg
     * @param {XYDimension} canvasSize - The new canvas size.
     */
    setSize(canvasSize) {
        this.canvasSize = canvasSize;
        this.svgNode.setAttribute("viewBox", `0 0 ${this.canvasSize.width} ${this.canvasSize.height}`);
        this.svgNode.setAttribute("width", `${this.canvasSize.width}`);
        this.svgNode.setAttribute("height", `${this.canvasSize.height}`);
    }
    /**
     * Creates a 'shallow' (non deep) copy of this instance. This implies
     * that under the hood the same gl context and gl program will be used.
     */
    copyInstance(fillShapes) {
        var copy = new drawutilssvg(this.svgNode, this.offset, this.scale, this.canvasSize, fillShapes, null, // no DrawConfig
        true, // isSecondary
        this.gNode, this.bufferGNode);
        return copy;
    }
    /**
     * Set the current drawlib configuration.
     *
     * @name setConfiguration
     * @method
     * @param {DrawLibConfiguration} configuration - The new configuration settings to use for the next render methods.
     */
    setConfiguration(configuration) {
        this.drawlibConfiguration = configuration;
    }
    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * It is used by some libraries for identifying elemente on re-renders.
     *
     * @name setCurrentId
     * @method
     * @param {UID} uid - A UID identifying the currently drawn element(s).
     * @instance
     * @memberof drawutilssvg
     **/
    setCurrentId(uid) {
        this.curId = uid;
    }
    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * Determine the class name for further usage here.
     *
     * @name setCurrentClassName
     * @method
     * @param {string} className - A class name for further custom use cases.
     * @instance
     * @memberof drawutilssvg
     **/
    setCurrentClassName(className) {
        this.curClassName = className;
    }
    /**
     * Called before each draw cycle.
     * This is required for compatibility with other draw classes in the library.
     *
     * @name beginDrawCycle
     * @method
     * @param {UID=} uid - (optional) A UID identifying the currently drawn element(s).
     * @instance
     * @memberof drawutilssvg
     **/
    beginDrawCycle(renderTime) {
        // Clear non-recycable elements from last draw cycle.
        this.cache.clear();
        // Clearing an SVG is equivalent to removing all its child elements.
        for (var i = 0; i < this.bufferGNode.childNodes.length; i++) {
            // Hide all nodes here. Don't throw them away.
            // We can probably re-use them in the next draw cycle.
            var child = this.bufferGNode.childNodes[i];
            this.cache.set(child.getAttribute("id"), child);
        }
        this.removeAllChildNodes();
    }
    /**
     * Called after each draw cycle.
     *
     * This is required for compatibility with other draw classes in the library (like drawgl).
     *
     * @name endDrawCycle
     * @method
     * @param {number} renderTime
     * @instance
     **/
    endDrawCycle(renderTime) {
        if (!this.isSecondary) {
            // All elements are drawn into the buffer; they are NOT yet visible, not did the browser perform any
            // layout updates.
            // Replace the old <g>-node with the buffer node.
            //   https://stackoverflow.com/questions/27442464/how-to-update-a-svg-image-without-seeing-a-blinking
            this.svgNode.replaceChild(this.bufferGNode, this.gNode);
        }
        let tmp = this.gNode;
        this.gNode = this.bufferGNode;
        this.bufferGNode = tmp;
    }
    _x(x) {
        return this.offset.x + this.scale.x * x;
    }
    _y(y) {
        return this.offset.y + this.scale.y * y;
    }
    /**
     * Draw the line between the given two points with the specified (CSS-) color.
     *
     * @method line
     * @param {Vertex} zA - The start point of the line.
     * @param {Vertex} zB - The end point of the line.
     * @param {string} color - Any valid CSS color string.
     * @param {number=1} lineWidth? - [optional] The line's width.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     **/
    line(zA, zB, color, lineWidth) {
        const line = this.makeNode("line");
        line.setAttribute("x1", `${this._x(zA.x)}`);
        line.setAttribute("y1", `${this._y(zA.y)}`);
        line.setAttribute("x2", `${this._x(zB.x)}`);
        line.setAttribute("y2", `${this._y(zB.y)}`);
        return this._bindFillDraw(line, "line", color, lineWidth || 1);
    }
    /**
     * Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method arrow
     * @param {Vertex} zA - The start point of the arrow-line.
     * @param {Vertex} zB - The end point of the arrow-line.
     * @param {string} color - Any valid CSS color string.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     **/
    arrow(zA, zB, color, lineWidth) {
        const node = this.makeNode("path");
        var headlen = 8; // length of head in pixels
        var vertices = _Vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex.utils.buildArrowHead(zA, zB, headlen, this.scale.x, this.scale.y);
        const d = ["M", this._x(zA.x), this._y(zA.y)];
        for (var i = 0; i <= vertices.length; i++) {
            d.push("L");
            // Note: only use offset here (the vertices are already scaled)
            d.push(this.offset.x + vertices[i % vertices.length].x);
            d.push(this.offset.y + vertices[i % vertices.length].y);
        }
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "arrow", color, lineWidth || 1);
    }
    /**
     * Draw an image at the given position with the given size.<br>
     * <br>
     * Note: SVG images may have resizing issues at the moment.Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method image
     * @param {Image} image - The image object to draw.
     * @param {Vertex} position - The position to draw the the upper left corner at.
     * @param {Vertex} size - The x/y-size to draw the image with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     **/
    image(image, position, size) {
        const node = this.makeNode("image");
        // We need to re-adjust the image if it was not yet fully loaded before.
        const setImageSize = (image) => {
            if (image.naturalWidth) {
                const ratioX = size.x / image.naturalWidth;
                const ratioY = size.y / image.naturalHeight;
                node.setAttribute("width", `${image.naturalWidth * this.scale.x}`);
                node.setAttribute("height", `${image.naturalHeight * this.scale.y}`);
                node.setAttribute("display", null); // Dislay when loaded
                node.setAttribute("transform", `translate(${this._x(position.x)} ${this._y(position.y)}) scale(${ratioX} ${ratioY})`);
            }
        };
        image.addEventListener("load", event => {
            setImageSize(image);
        });
        // Safari has a transform-origin bug.
        // Use x=0, y=0 and translate/scale instead (see above)
        node.setAttribute("x", `${0}`);
        node.setAttribute("y", `${0}`);
        node.setAttribute("display", "none"); // Hide before loaded
        setImageSize(image);
        node.setAttribute("href", image.src);
        return this._bindFillDraw(node, "image", null, null);
    }
    /**
     * Draw the given (cubic) bézier curve.
     *
     * @method cubicBezier
     * @param {Vertex} startPoint - The start point of the cubic Bézier curve
     * @param {Vertex} endPoint   - The end point the cubic Bézier curve.
     * @param {Vertex} startControlPoint - The start control point the cubic Bézier curve.
     * @param {Vertex} endControlPoint   - The end control point the cubic Bézier curve.
     * @param {string} color - The CSS color to draw the curve with.
     * @param {number} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    cubicBezier(startPoint, endPoint, startControlPoint, endControlPoint, color, lineWidth) {
        if (startPoint instanceof _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_1__.CubicBezierCurve) {
            return this.cubicBezier(startPoint.startPoint, startPoint.endPoint, startPoint.startControlPoint, startPoint.endControlPoint, color, lineWidth);
        }
        const node = this.makeNode("path");
        // Draw curve
        const d = [
            "M",
            this._x(startPoint.x),
            this._y(startPoint.y),
            "C",
            this._x(startControlPoint.x),
            this._y(startControlPoint.y),
            this._x(endControlPoint.x),
            this._y(endControlPoint.y),
            this._x(endPoint.x),
            this._y(endPoint.y)
        ];
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "cubierBezier", color, lineWidth);
    }
    /**
     * Draw the given (cubic) Bézier path.
     *
     * The given path must be an array with n*3+1 vertices, where n is the number of
     * curves in the path:
     * <pre> [ point1, point1_startControl, point2_endControl, point2, point2_startControl, point3_endControl, point3, ... pointN_endControl, pointN ]</pre>
     *
     * @method cubicBezierPath
     * @param {Vertex[]} path - The cubic bezier path as described above.
     * @param {string} color - The CSS colot to draw the path with.
     * @param {number=1} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    cubicBezierPath(path, color, lineWidth) {
        const node = this.makeNode("path");
        if (!path || path.length == 0)
            return node;
        // Draw curve
        const d = ["M", this._x(path[0].x), this._y(path[0].y)];
        // Draw curve path
        var endPoint;
        var startControlPoint;
        var endControlPoint;
        for (var i = 1; i < path.length; i += 3) {
            startControlPoint = path[i];
            endControlPoint = path[i + 1];
            endPoint = path[i + 2];
            d.push("C", this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y));
        }
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "cubicBezierPath", color, lineWidth || 1);
    }
    /**
     * Draw the given handle and handle point (used to draw interactive Bézier curves).
     *
     * The colors for this are fixed and cannot be specified.
     *
     * @method handle
     * @param {Vertex} startPoint - The start of the handle.
     * @param {Vertex} endPoint - The end point of the handle.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    handle(startPoint, endPoint) {
        // TODO: redefine methods like these into an abstract class?
        this.point(startPoint, "rgb(0,32,192)");
        this.square(endPoint, 5, "rgba(0,128,192,0.5)");
    }
    /**
     * Draw a handle line (with a light grey).
     *
     * @method handleLine
     * @param {Vertex} startPoint - The start point to draw the handle at.
     * @param {Vertex} endPoint - The end point to draw the handle at.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    handleLine(startPoint, endPoint) {
        this.line(startPoint, endPoint, "rgb(192,192,192)");
    }
    /**
     * Draw a 1x1 dot with the specified (CSS-) color.
     *
     * @method dot
     * @param {Vertex} p - The position to draw the dot at.
     * @param {string} color - The CSS color to draw the dot with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    dot(p, color) {
        const node = this.makeNode("line");
        return this._bindFillDraw(node, "dot", color, 1);
    }
    /**
     * Draw the given point with the specified (CSS-) color and radius 3.
     *
     * @method point
     * @param {Vertex} p - The position to draw the point at.
     * @param {string} color - The CSS color to draw the point with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    point(p, color) {
        var radius = 3;
        const node = this.makeNode("circle");
        node.setAttribute("cx", `${this._x(p.x)}`);
        node.setAttribute("cy", `${this._y(p.y)}`);
        node.setAttribute("r", `${radius}`);
        return this._bindFillDraw(node, "point", color, 1);
    }
    /**
     * Draw a circle with the specified (CSS-) color and radius.<br>
     * <br>
     * Note that if the x- and y- scales are different the result will be an ellipse rather than a circle.
     *
     * @method circle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    circle(center, radius, color, lineWidth) {
        // Todo: draw ellipse when scalex!=scaley
        const node = this.makeNode("circle");
        node.setAttribute("cx", `${this._x(center.x)}`);
        node.setAttribute("cy", `${this._y(center.y)}`);
        node.setAttribute("r", `${radius * this.scale.x}`); // y?
        return this._bindFillDraw(node, "circle", color, lineWidth || 1);
    }
    /**
     * Draw a circular arc (section of a circle) with the given CSS color.
     *
     * @method circleArc
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {number} startAngle - The angle to start at.
     * @param {number} endAngle - The angle to end at.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    circleArc(center, radius, startAngle, endAngle, color, lineWidth) {
        const node = this.makeNode("path");
        const arcData = _CircleSector__WEBPACK_IMPORTED_MODULE_0__.CircleSector.circleSectorUtils.describeSVGArc(this._x(center.x), this._y(center.y), radius * this.scale.x, // y?
        startAngle, endAngle);
        node.setAttribute("d", arcData.join(" "));
        return this._bindFillDraw(node, "circleArc", color, lineWidth || 1);
    }
    /**
     * Draw an ellipse with the specified (CSS-) color and thw two radii.
     *
     * @method ellipse
     * @param {Vertex} center - The center of the ellipse.
     * @param {number} radiusX - The radius of the ellipse.
     * @param {number} radiusY - The radius of the ellipse.
     * @param {string} color - The CSS color to draw the ellipse with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @param {number=} rotation - (optional, default=0) The rotation of the ellipse.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    ellipse(center, radiusX, radiusY, color, lineWidth, rotation) {
        if (typeof rotation === "undefined") {
            rotation = 0.0;
        }
        const node = this.makeNode("ellipse");
        node.setAttribute("cx", `${this._x(center.x)}`);
        node.setAttribute("cy", `${this._y(center.y)}`);
        node.setAttribute("rx", `${radiusX * this.scale.x}`);
        node.setAttribute("ry", `${radiusY * this.scale.y}`);
        // node.setAttribute( 'style', `transform: rotate(${rotation} ${center.x} ${center.y})` );
        node.setAttribute("transform", `rotate(${(rotation * 180) / Math.PI} ${this._x(center.x)} ${this._y(center.y)})`);
        return this._bindFillDraw(node, "ellipse", color, lineWidth || 1);
    }
    /**
     * Draw square at the given center, size and with the specified (CSS-) color.<br>
     * <br>
     * Note that if the x-scale and the y-scale are different the result will be a rectangle rather than a square.
     *
     * @method square
     * @param {XYCoords} center - The center of the square.
     * @param {Vertex} size - The size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    square(center, size, color, lineWidth) {
        const node = this.makeNode("rectangle");
        node.setAttribute("x", `${this._x(center.x - size / 2.0)}`);
        node.setAttribute("y", `${this._y(center.y - size / 2.0)}`);
        node.setAttribute("width", `${size * this.scale.x}`);
        node.setAttribute("height", `${size * this.scale.y}`);
        return this._bindFillDraw(node, "square", color, lineWidth || 1);
    }
    /**
     * Draw a rectangle.
     *
     * @param {XYCoords} position - The upper left corner of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @param {string} color - The color to use.
     * @param {number=1} lineWidth - (optional) The line with to use (default is 1).
     **/
    rect(position, width, height, color, lineWidth) {
        const node = this.makeNode("rect");
        node.setAttribute("x", `${this._x(position.x)}`);
        node.setAttribute("y", `${this._y(position.y)}`);
        node.setAttribute("width", `${width * this.scale.x}`);
        node.setAttribute("height", `${height * this.scale.y}`);
        return this._bindFillDraw(node, "rect", color, lineWidth || 1);
    }
    /**
     * Draw a grid of horizontal and vertical lines with the given (CSS-) color.
     *
     * @method grid
     * @param {Vertex} center - The center of the grid.
     * @param {number} width - The total width of the grid (width/2 each to the left and to the right).
     * @param {number} height - The total height of the grid (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal grid size.
     * @param {number} sizeY - The vertical grid size.
     * @param {string} color - The CSS color to draw the grid with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    grid(center, width, height, sizeX, sizeY, color) {
        const node = this.makeNode("path");
        const d = [];
        var yMin = -Math.ceil((height * 0.5) / sizeY) * sizeY;
        var yMax = height / 2;
        for (var x = -Math.ceil((width * 0.5) / sizeX) * sizeX; x < width / 2; x += sizeX) {
            d.push("M", this._x(center.x + x), this._y(center.y + yMin));
            d.push("L", this._x(center.x + x), this._y(center.y + yMax));
        }
        var xMin = -Math.ceil((width * 0.5) / sizeX) * sizeX;
        var xMax = width / 2;
        for (var y = -Math.ceil((height * 0.5) / sizeY) * sizeY; y < height / 2; y += sizeY) {
            d.push("M", this._x(center.x + xMin), this._y(center.y + y));
            d.push("L", this._x(center.x + xMax), this._y(center.y + y));
        }
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "grid", color, 1);
    }
    /**
     * Draw a raster of crosshairs in the given grid.<br>
     *
     * This works analogue to the grid() function
     *
     * @method raster
     * @param {Vertex} center - The center of the raster.
     * @param {number} width - The total width of the raster (width/2 each to the left and to the right).
     * @param {number} height - The total height of the raster (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal raster size.
     * @param {number} sizeY - The vertical raster size.
     * @param {string} color - The CSS color to draw the raster with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    raster(center, width, height, sizeX, sizeY, color) {
        const node = this.makeNode("path");
        const d = [];
        for (var x = -Math.ceil((width * 0.5) / sizeX) * sizeX; x < width / 2; x += sizeX) {
            for (var y = -Math.ceil((height * 0.5) / sizeY) * sizeY; y < height / 2; y += sizeY) {
                // Draw a crosshair
                d.push("M", this._x(center.x + x) - 4, this._y(center.y + y));
                d.push("L", this._x(center.x + x) + 4, this._y(center.y + y));
                d.push("M", this._x(center.x + x), this._y(center.y + y) - 4);
                d.push("L", this._x(center.x + x), this._y(center.y + y) + 4);
            }
        }
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "raster", color, 1);
    }
    /**
     * Draw a diamond handle (square rotated by 45°) with the given CSS color.
     *
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped diamonds.
     *
     * @method diamondHandle
     * @param {Vertex} center - The center of the diamond.
     * @param {Vertex} size - The x/y-size of the diamond.
     * @param {string} color - The CSS color to draw the diamond with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    diamondHandle(center, size, color) {
        const node = this.makeNode("path");
        const d = [
            "M",
            this._x(center.x) - size / 2.0,
            this._y(center.y),
            "L",
            this._x(center.x),
            this._y(center.y) - size / 2.0,
            "L",
            this._x(center.x) + size / 2.0,
            this._y(center.y),
            "L",
            this._x(center.x),
            this._y(center.y) + size / 2.0,
            "Z"
        ];
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "diamondHandle", color, 1);
    }
    /**
     * Draw a square handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped squares.
     *
     * @method squareHandle
     * @param {Vertex} center - The center of the square.
     * @param {Vertex} size - The x/y-size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    squareHandle(center, size, color) {
        const node = this.makeNode("rect");
        node.setAttribute("x", `${this._x(center.x) - size / 2.0}`);
        node.setAttribute("y", `${this._y(center.y) - size / 2.0}`);
        node.setAttribute("width", `${size}`);
        node.setAttribute("height", `${size}`);
        return this._bindFillDraw(node, "squareHandle", color, 1);
    }
    /**
     * Draw a circle handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped circles.
     *
     * @method circleHandle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    circleHandle(center, radius, color) {
        radius = radius || 3;
        const node = this.makeNode("circle");
        node.setAttribute("cx", `${this._x(center.x)}`);
        node.setAttribute("cy", `${this._y(center.y)}`);
        node.setAttribute("r", `${radius}`);
        return this._bindFillDraw(node, "circleHandle", color, 1);
    }
    /**
     * Draw a crosshair with given radius and color at the given position.<br>
     * <br>
     * Note that the crosshair radius will not be affected by scaling.
     *
     * @method crosshair
     * @param {XYCoords} center - The center of the crosshair.
     * @param {number} radius - The radius of the crosshair.
     * @param {string} color - The CSS color to draw the crosshair with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    crosshair(center, radius, color) {
        const node = this.makeNode("path");
        const d = [
            "M",
            this._x(center.x) - radius,
            this._y(center.y),
            "L",
            this._x(center.x) + radius,
            this._y(center.y),
            "M",
            this._x(center.x),
            this._y(center.y) - radius,
            "L",
            this._x(center.x),
            this._y(center.y) + radius
        ];
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "crosshair", color, 0.5);
    }
    /**
     * Draw a polygon.
     *
     * @method polygon
     * @param {Polygon} polygon - The polygon to draw.
     * @param {string} color - The CSS color to draw the polygon with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    polygon(polygon, color, lineWidth) {
        return this.polyline(polygon.vertices, polygon.isOpen, color, lineWidth);
    }
    /**
     * Draw a polygon line (alternative function to the polygon).
     *
     * @method polyline
     * @param {Vertex[]} vertices - The polygon vertices to draw.
     * @param {boolan}   isOpen   - If true the polyline will not be closed at its end.
     * @param {string}   color    - The CSS color to draw the polygon with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    polyline(vertices, isOpen, color, lineWidth) {
        const node = this.makeNode("path");
        if (vertices.length == 0)
            return node;
        // Draw curve
        const d = ["M", this._x(vertices[0].x), this._y(vertices[0].y)];
        var n = vertices.length;
        for (var i = 1; i < n; i++) {
            d.push("L", this._x(vertices[i].x), this._y(vertices[i].y));
        }
        if (!isOpen)
            d.push("Z");
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "polyline", color, lineWidth || 1);
    }
    /**
     * Draw a text label at the given relative position.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (optional) rotation in radians.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    text(text, x, y, options) {
        options = options || {};
        const color = options.color || "black";
        const node = this.makeNode("text");
        node.setAttribute("x", `${this._x(x)}`);
        node.setAttribute("y", `${this._y(y)}`);
        node.innerHTML = text;
        return this._bindFillDraw(node, "text", color, 1);
    }
    /**
     * Draw a non-scaling text label at the given position.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (optional) rotation in radians.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    label(text, x, y, rotation) {
        const node = this.makeNode("text");
        // For some strange reason SVG rotation transforms use degrees instead of radians
        node.setAttribute("transform", `translate(${this.offset.x},${this.offset.y}), rotate(${(rotation / Math.PI) * 180})`);
        node.innerHTML = text;
        return this._bindFillDraw(node, "label", "black", null);
    }
    /**
     * Draw an SVG-like path given by the specified path data.
     *
     * @method path
     * @param {SVGPathData} pathData - An array of path commands and params.
     * @param {string=null} color - (optional) The color to draw this path with (default is null).
     * @param {number=1} lineWidth - (optional) the line width to use (default is 1).
     * @param {boolean=false} options.inplace - (optional) If set to true then path transforamtions (scale and translate) will be done in-place in the array. This can boost the performance.
     * @instance
     * @memberof drawutils
     * @return {R} An instance representing the drawn path.
     */
    path(pathData, color, lineWidth, options) {
        const node = this.makeNode("path");
        // Transform the path: in-place (fast) or copy (slower)
        const d = options && options.inplace ? pathData : drawutilssvg.copyPathData(pathData);
        drawutilssvg.transformPathData(d, this.offset, this.scale);
        node.setAttribute("d", d.join(" "));
        return this._bindFillDraw(node, "path", color, lineWidth);
    }
    /**
     * Due to gl compatibility there is a generic 'clear' function required
     * to avoid accessing the context object itself directly.
     *
     * This function just fills the whole canvas with a single color.
     *
     * @param {string} color - The color to clear with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     **/
    clear(color) {
        // If this isn't the primary handler then do not remove anything here.
        // The primary handler will do that (no double work).
        if (this.isSecondary) {
            return;
        }
        // // Clearing an SVG is equivalent to removing all its child elements.
        // for (var i = 0; i < this.gNode.childNodes.length; i++) {
        //   // Hide all nodes here. Don't throw them away.
        //   // We can probably re-use them in the next draw cycle.
        //   var child: SVGElement = this.gNode.childNodes[i] as SVGElement;
        //   this.cache.set(child.getAttribute("id"), child);
        // }
        // this.removeAllChildNodes();
        // Add a covering rect with the given background color
        this.curId = "background";
        this.curClassName = undefined;
        const node = this.makeNode("rect");
        // For some strange reason SVG rotation transforms use degrees instead of radians
        // Note that the background does not scale with the zoom level (always covers full element)
        node.setAttribute("x", "0");
        node.setAttribute("y", "0");
        node.setAttribute("width", `${this.canvasSize.width}`);
        node.setAttribute("height", `${this.canvasSize.height}`);
        // Bind this special element into the document
        this._bindFillDraw(node, this.curId, null, null);
        node.setAttribute("fill", typeof color === "undefined" ? "none" : color);
        // Clear the current ID again
        this.curId = undefined;
    }
    /**
     * A private helper function to clear all SVG nodes from the &gt;g> node.
     *
     * @private
     */
    removeAllChildNodes() {
        while (this.bufferGNode.lastChild) {
            this.bufferGNode.removeChild(this.bufferGNode.lastChild);
        }
    }
    /**
     * Create a new and empty `SVGElement` &lt;svg&gt; in the svg-namespace.
     *
     * @name createSvg
     * @static
     * @memberof drawutilssvg
     * @return SVGElement
     */
    static createSvg() {
        return document.createElementNS("http://www.w3.org/2000/svg", "svg");
    }
    /**
     * Create a copy of the given path data. As path data only consists of strings and numbers,
     * the copy will be shallow by definition.
     *
     * @name copyPathData
     * @static
     * @memberof drawutilssvg
     */
    static copyPathData(data) {
        const copy = new Array(data.length);
        for (var i = 0, n = data.length; i < n; i++) {
            copy[i] = data[i];
        }
        return copy;
    }
    /**
     * Transform the given path data (translate and scale. rotating is not intended here).
     *
     * @name transformPathData
     * @static
     * @memberof drawutilssvg
     * @param {SVGPathParams} data - The data to transform.
     * @param {XYCoords} offset - The translation offset (neutral is x=0, y=0).
     * @param {XYCoords} scale - The scale factors (neutral is x=1, y=1).
     */
    static transformPathData(data, offset, scale) {
        // Scale and translate {x,y}
        const _stx = (index) => {
            data[index] = offset.x + scale.x * Number(data[index]);
        };
        const _sty = (index) => {
            data[index] = offset.y + scale.y * Number(data[index]);
        };
        // scale only {x,y}
        const _sx = (index) => {
            data[index] = scale.x * Number(data[index]);
        };
        const _sy = (index) => {
            data[index] = scale.y * Number(data[index]);
        };
        const stx = (value) => {
            return offset.x + scale.x * value;
        };
        const sty = (value) => {
            return offset.y + scale.y * value;
        };
        // scale only {x,y}
        const sx = (value) => {
            return scale.x * value;
        };
        const sy = (value) => {
            return scale.y * value;
        };
        var i = 0;
        var lastPoint = { x: NaN, y: NaN };
        // "save last point"
        var _slp = (index) => {
            lastPoint.x = Number(data[index]);
            lastPoint.y = Number(data[index + 1]);
        };
        while (i < data.length) {
            const cmd = data[i];
            switch (cmd) {
                case "M":
                // MoveTo: M|m x y
                case "L":
                // LineTo L|l x y
                case "T":
                    // Shorthand/smooth quadratic Bézier curveto: T|t x y
                    _stx(i + 1);
                    _sty(i + 2);
                    _slp(i + 1);
                    i += 3;
                    break;
                case "m":
                // MoveTo: M|m x y
                case "l":
                // LineTo L|l x y
                case "t":
                    // Shorthand/smooth quadratic Bézier curveto: T|t x y
                    _sx(i + 1);
                    _sy(i + 2);
                    _slp(i + 1);
                    i += 3;
                    break;
                case "H":
                    // HorizontalLineTo: H|h x
                    _stx(i + 1);
                    lastPoint.x = Number(data[i + 1]);
                    i += 2;
                    break;
                case "h":
                    // HorizontalLineTo: H|h x
                    _sx(i + 1);
                    lastPoint.x = Number(data[i + 1]);
                    i += 2;
                    break;
                case "V":
                    // VerticalLineTo: V|v y
                    _sty(i + 1);
                    lastPoint.y = Number(data[i + 1]);
                    i += 2;
                    break;
                case "v":
                    // VerticalLineTo: V|v y
                    _sy(i + 1);
                    lastPoint.y = Number(data[i + 1]);
                    i += 2;
                    break;
                case "C":
                    // CurveTo: C|c x1 y1 x2 y2 x y
                    _stx(i + 1);
                    _sty(i + 2);
                    _stx(i + 3);
                    _sty(i + 4);
                    _stx(i + 5);
                    _sty(i + 6);
                    _slp(i + 5);
                    i += 7;
                    break;
                case "c":
                    // CurveTo: C|c x1 y1 x2 y2 x y
                    _sx(i + 1);
                    _sy(i + 2);
                    _sx(i + 3);
                    _sy(i + 4);
                    _sx(i + 5);
                    _sy(i + 6);
                    _slp(i + 5);
                    i += 7;
                    break;
                case "S":
                case "Q":
                    // Shorthand-/SmoothCurveTo: S|s x2 y2 x y
                    // QuadraticCurveTo: Q|q x1 y1 x y
                    _stx(i + 1);
                    _sty(i + 2);
                    _stx(i + 3);
                    _sty(i + 4);
                    _slp(i + 3);
                    i += 5;
                    break;
                case "s":
                case "q":
                    // Shorthand-/SmoothCurveTo: S|s x2 y2 x y
                    // QuadraticCurveTo: Q|q x1 y1 x y
                    _sx(i + 1);
                    _sy(i + 2);
                    _sx(i + 3);
                    _sy(i + 4);
                    _slp(i + 3);
                    i += 5;
                    break;
                case "A":
                    // EllipticalArcTo: A|a rx ry x-axis-rotation large-arc-flag sweep-flag x y
                    // Uniform scale: just scale
                    // NOTE: here is something TODO
                    //  * if scalex!=scaleY this won't work
                    //  * Arcs have to be converted to Bézier curves here in that case
                    _sx(i + 1);
                    _sy(i + 2);
                    _stx(i + 6);
                    _sty(i + 7);
                    _slp(i + 6);
                    // Update the arc flag when x _or_ y scale is negative
                    if ((scale.x < 0 && scale.y >= 0) || (scale.x >= 0 && scale.y < 0)) {
                        data[i + 5] = data[i + 5] ? 0 : 1;
                    }
                    i += 8;
                    break;
                case "a":
                    // EllipticalArcTo: A|a rx ry x-axis-rotation large-arc-flag sweep-flag x y
                    _sx(i + 1);
                    _sy(i + 2);
                    _sx(i + 6);
                    _sy(i + 7);
                    _slp(i + 6);
                    i += 8;
                    break;
                case "z":
                case "Z":
                    // ClosePath: Z|z (no arguments)
                    // lastPoint.x = firstPoint.x;
                    // lastPoint.y = firstPoint.y;
                    i++;
                    break;
                // Safepoint: continue reading token by token until something is recognized again
                default:
                    i++;
            }
        } // END while
    } // END transformPathData
}
drawutilssvg.HEAD_XML = [
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" ',
    '         "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">',
    ""
].join("\n");
//# sourceMappingURL=drawutilssvg.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/geomutils.js":
/*!***********************************************!*\
  !*** ../plotboilerplate/src/esm/geomutils.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "geomutils": () => (/* binding */ geomutils)
/* harmony export */ });
/* harmony import */ var _Line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Line */ "../plotboilerplate/src/esm/Line.js");
/* harmony import */ var _Triangle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Triangle */ "../plotboilerplate/src/esm/Triangle.js");
/**
 * @author   Ikaros Kappler
 * @date     2019-02-03
 * @modified 2021-03-01 Added `wrapMax` function.
 * @version  1.1.0
 **/


/**
 * A collection of usefull geometry utilities.
 *
 * @global
 **/
const geomutils = {
    /**
     * Compute the n-section of the angle – described as a triangle (A,B,C) – in point A.
     *
     * @param {Vertex} pA - The first triangle point.
     * @param {Vertex} pB - The second triangle point.
     * @param {Vertex} pC - The third triangle point.
     * @param {number} n - The number of desired angle sections (example: 2 means the angle will be divided into two sections,
     *                      means an returned array with length 1, the middle line).
     *
     * @return {Line[]} An array of n-1 lines secting the given angle in point A into n equal sized angle sections. The lines' first vertex is A.
     */
    nsectAngle(pA, pB, pC, n) {
        const triangle = new _Triangle__WEBPACK_IMPORTED_MODULE_1__.Triangle(pA, pB, pC);
        const lineAB = new _Line__WEBPACK_IMPORTED_MODULE_0__.Line(pA, pB);
        const lineAC = new _Line__WEBPACK_IMPORTED_MODULE_0__.Line(pA, pC);
        // Compute the difference; this is the angle between AB and AC
        var insideAngle = lineAB.angle(lineAC);
        // We want the inner angles of the triangle, not the outer angle;
        //   which one is which depends on the triangle 'direction'
        const clockwise = triangle.determinant() > 0;
        // For convenience convert the angle [-PI,PI] to [0,2*PI]
        if (insideAngle < 0)
            insideAngle = 2 * Math.PI + insideAngle;
        if (!clockwise)
            insideAngle = (2 * Math.PI - insideAngle) * (-1);
        // Scale the rotated lines to the max leg length (looks better)
        const lineLength = Math.max(lineAB.length(), lineAC.length());
        const scaleFactor = lineLength / lineAB.length();
        var result = [];
        for (var i = 1; i < n; i++) {
            // Compute the i-th inner sector line
            result.push(new _Line__WEBPACK_IMPORTED_MODULE_0__.Line(pA, pB.clone().rotate((-i * (insideAngle / n)), pA)).scale(scaleFactor));
        }
        return result;
    },
    /**
     * Wrap the value (e.g. an angle) into the given range of [0,max).
     *
     * @name wrapMax
     * @param {number} x - The value to wrap.
     * @param {number} max - The max bound to use for the range.
     * @return {number} The wrapped value inside the range [0,max).
     */
    wrapMax(x, max) {
        // Found at
        //    https://stackoverflow.com/questions/4633177/c-how-to-wrap-a-float-to-the-interval-pi-pi
        return (max + (x % max)) % max;
    },
    /**
     * Wrap the value (e.g. an angle) into the given range of [min,max).
     *
     * @name wrapMinMax
     * @param {number} x - The value to wrap.
     * @param {number} min - The min bound to use for the range.
     * @param {number} max - The max bound to use for the range.
     * @return {number} The wrapped value inside the range [min,max).
     */
    // Currently un-used
    wrapMinMax(x, min, max) {
        return min + geomutils.wrapMax(x - min, max - min);
    }
};
//# sourceMappingURL=geomutils.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/index.js":
/*!*******************************************!*\
  !*** ../plotboilerplate/src/esm/index.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BezierPath": () => (/* reexport safe */ _BezierPath__WEBPACK_IMPORTED_MODULE_0__.BezierPath),
/* harmony export */   "Bounds": () => (/* reexport safe */ _Bounds__WEBPACK_IMPORTED_MODULE_1__.Bounds),
/* harmony export */   "Circle": () => (/* reexport safe */ _Circle__WEBPACK_IMPORTED_MODULE_2__.Circle),
/* harmony export */   "CircleSector": () => (/* reexport safe */ _CircleSector__WEBPACK_IMPORTED_MODULE_3__.CircleSector),
/* harmony export */   "CubicBezierCurve": () => (/* reexport safe */ _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_4__.CubicBezierCurve),
/* harmony export */   "drawutils": () => (/* reexport safe */ _draw__WEBPACK_IMPORTED_MODULE_5__.drawutils),
/* harmony export */   "drawutilsgl": () => (/* reexport safe */ _drawgl__WEBPACK_IMPORTED_MODULE_6__.drawutilsgl),
/* harmony export */   "drawutilssvg": () => (/* reexport safe */ _drawutilssvg__WEBPACK_IMPORTED_MODULE_7__.drawutilssvg),
/* harmony export */   "geomutils": () => (/* reexport safe */ _geomutils__WEBPACK_IMPORTED_MODULE_8__.geomutils),
/* harmony export */   "Grid": () => (/* reexport safe */ _Grid__WEBPACK_IMPORTED_MODULE_9__.Grid),
/* harmony export */   "KeyHandler": () => (/* reexport safe */ _KeyHandler__WEBPACK_IMPORTED_MODULE_11__.KeyHandler),
/* harmony export */   "Line": () => (/* reexport safe */ _Line__WEBPACK_IMPORTED_MODULE_12__.Line),
/* harmony export */   "MouseHandler": () => (/* reexport safe */ _MouseHandler__WEBPACK_IMPORTED_MODULE_13__.MouseHandler),
/* harmony export */   "XMouseEvent": () => (/* reexport safe */ _MouseHandler__WEBPACK_IMPORTED_MODULE_13__.XMouseEvent),
/* harmony export */   "XWheelEvent": () => (/* reexport safe */ _MouseHandler__WEBPACK_IMPORTED_MODULE_13__.XWheelEvent),
/* harmony export */   "PBImage": () => (/* reexport safe */ _PBImage__WEBPACK_IMPORTED_MODULE_14__.PBImage),
/* harmony export */   "PlotBoilerplate": () => (/* reexport safe */ _PlotBoilerplate__WEBPACK_IMPORTED_MODULE_15__.PlotBoilerplate),
/* harmony export */   "Polygon": () => (/* reexport safe */ _Polygon__WEBPACK_IMPORTED_MODULE_16__.Polygon),
/* harmony export */   "SVGBuilder": () => (/* reexport safe */ _SVGBuilder__WEBPACK_IMPORTED_MODULE_17__.SVGBuilder),
/* harmony export */   "Triangle": () => (/* reexport safe */ _Triangle__WEBPACK_IMPORTED_MODULE_18__.Triangle),
/* harmony export */   "UIDGenerator": () => (/* reexport safe */ _UIDGenerator__WEBPACK_IMPORTED_MODULE_19__.UIDGenerator),
/* harmony export */   "Vector": () => (/* reexport safe */ _Vector__WEBPACK_IMPORTED_MODULE_20__.Vector),
/* harmony export */   "VEllipse": () => (/* reexport safe */ _VEllipse__WEBPACK_IMPORTED_MODULE_21__.VEllipse),
/* harmony export */   "VEllipseSector": () => (/* reexport safe */ _VEllipseSector__WEBPACK_IMPORTED_MODULE_22__.VEllipseSector),
/* harmony export */   "Vertex": () => (/* reexport safe */ _Vertex__WEBPACK_IMPORTED_MODULE_23__.Vertex),
/* harmony export */   "VertexAttr": () => (/* reexport safe */ _VertexAttr__WEBPACK_IMPORTED_MODULE_24__.VertexAttr),
/* harmony export */   "VertexListeners": () => (/* reexport safe */ _VertexListeners__WEBPACK_IMPORTED_MODULE_25__.VertexListeners),
/* harmony export */   "VertTuple": () => (/* reexport safe */ _VertTuple__WEBPACK_IMPORTED_MODULE_26__.VertTuple)
/* harmony export */ });
/* harmony import */ var _BezierPath__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BezierPath */ "../plotboilerplate/src/esm/BezierPath.js");
/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Bounds */ "../plotboilerplate/src/esm/Bounds.js");
/* harmony import */ var _Circle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Circle */ "../plotboilerplate/src/esm/Circle.js");
/* harmony import */ var _CircleSector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CircleSector */ "../plotboilerplate/src/esm/CircleSector.js");
/* harmony import */ var _CubicBezierCurve__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CubicBezierCurve */ "../plotboilerplate/src/esm/CubicBezierCurve.js");
/* harmony import */ var _draw__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./draw */ "../plotboilerplate/src/esm/draw.js");
/* harmony import */ var _drawgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./drawgl */ "../plotboilerplate/src/esm/drawgl.js");
/* harmony import */ var _drawutilssvg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./drawutilssvg */ "../plotboilerplate/src/esm/drawutilssvg.js");
/* harmony import */ var _geomutils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./geomutils */ "../plotboilerplate/src/esm/geomutils.js");
/* harmony import */ var _Grid__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Grid */ "../plotboilerplate/src/esm/Grid.js");
/* harmony import */ var _interfaces__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./interfaces */ "../plotboilerplate/src/esm/interfaces/index.js");
/* harmony import */ var _KeyHandler__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./KeyHandler */ "../plotboilerplate/src/esm/KeyHandler.js");
/* harmony import */ var _Line__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Line */ "../plotboilerplate/src/esm/Line.js");
/* harmony import */ var _MouseHandler__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./MouseHandler */ "../plotboilerplate/src/esm/MouseHandler.js");
/* harmony import */ var _PBImage__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./PBImage */ "../plotboilerplate/src/esm/PBImage.js");
/* harmony import */ var _PlotBoilerplate__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./PlotBoilerplate */ "../plotboilerplate/src/esm/PlotBoilerplate.js");
/* harmony import */ var _Polygon__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./Polygon */ "../plotboilerplate/src/esm/Polygon.js");
/* harmony import */ var _SVGBuilder__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./SVGBuilder */ "../plotboilerplate/src/esm/SVGBuilder.js");
/* harmony import */ var _Triangle__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./Triangle */ "../plotboilerplate/src/esm/Triangle.js");
/* harmony import */ var _UIDGenerator__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./UIDGenerator */ "../plotboilerplate/src/esm/UIDGenerator.js");
/* harmony import */ var _Vector__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./Vector */ "../plotboilerplate/src/esm/Vector.js");
/* harmony import */ var _VEllipse__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./VEllipse */ "../plotboilerplate/src/esm/VEllipse.js");
/* harmony import */ var _VEllipseSector__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./VEllipseSector */ "../plotboilerplate/src/esm/VEllipseSector.js");
/* harmony import */ var _Vertex__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./Vertex */ "../plotboilerplate/src/esm/Vertex.js");
/* harmony import */ var _VertexAttr__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./VertexAttr */ "../plotboilerplate/src/esm/VertexAttr.js");
/* harmony import */ var _VertexListeners__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./VertexListeners */ "../plotboilerplate/src/esm/VertexListeners.js");
/* harmony import */ var _VertTuple__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./VertTuple */ "../plotboilerplate/src/esm/VertTuple.js");



























//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/interfaces/DrawLib.js":
/*!********************************************************!*\
  !*** ../plotboilerplate/src/esm/interfaces/DrawLib.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/**
 * @author Ikaros Kappler
 * @modified 2021-01-10 Added the `CanvasWrapper` interface.
 * @modified 2021-01-20 Added the `UID` type.
 * @modified 2021-01-25 Added the `DrawLib.setCurrentId` and `DrawLib.setCurrentClassName` functions.
 * @modified 2021-01-25 Fixed the `PBParams` interface (inluding DrawConfig).
 * @modified 2021-02-08 Changed the `PBParams` interface: no longer sub-interface of `DrawConfig` (all those attributes were un-used).
 * @modified 2021-02-22 Added the `path` drawing function to draw SVG path data.
 * @modified 2021-03-01 Added the `rotation` param to the DrawLib.ellipse(...) function.
 * @modified 2021-03-02 Added the `VEllipseSector` as to the `Drawable` type.
 * @modified 2021-03-29 Added the `draw` and `fill` params to the `preDraw` and `postDraw` function (required for full svg export support).
 * @modified 2021-03-30 Added the `endDrawCycle` function to `DrawLib`.
 * @modified 2021-05-31 Added the `drawLib.setConfiguration` function.
 * @modified 2021-05-31 Splitted the large interfaces.ts file into this one and others.
 **/

//# sourceMappingURL=DrawLib.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/interfaces/core.js":
/*!*****************************************************!*\
  !*** ../plotboilerplate/src/esm/interfaces/core.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/**
 * @author Ikaros Kappler
 * @modified 2021-01-10 Added the `CanvasWrapper` interface.
 * @modified 2021-01-20 Added the `UID` type.
 * @modified 2021-01-25 Added the `DrawLib.setCurrentId` and `DrawLib.setCurrentClassName` functions.
 * @modified 2021-01-25 Fixed the `PBParams` interface (inluding DrawConfig).
 * @modified 2021-02-08 Changed the `PBParams` interface: no longer sub-interface of `DrawConfig` (all those attributes were un-used).
 * @modified 2021-02-22 Added the `path` drawing function to draw SVG path data.
 * @modified 2021-03-01 Added the `rotation` param to the DrawLib.ellipse(...) function.
 * @modified 2021-03-02 Added the `VEllipseSector` as to the `Drawable` type.
 * @modified 2021-03-29 Added the `draw` and `fill` params to the `preDraw` and `postDraw` function (required for full svg export support).
 * @modified 2021-03-30 Added the `endDrawCycle` function to `DrawLib`.
 * @modified 2021-05-31 Added the `drawLib.setConfiguration` function.
 * @modified 2021-05-31 Splitted the large interfaces.ts file into this one and others.
 * @modified 2021-06-21 Added `IBounds.getCenter()`.
 **/

//# sourceMappingURL=core.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/interfaces/externals.js":
/*!**********************************************************!*\
  !*** ../plotboilerplate/src/esm/interfaces/externals.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/**
 * @author  Ikaros Kappler
 * @date    2021-07-00
 * @version 1.0.0
 */

//# sourceMappingURL=externals.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/interfaces/index.js":
/*!******************************************************!*\
  !*** ../plotboilerplate/src/esm/interfaces/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core */ "../plotboilerplate/src/esm/interfaces/core.js");
/* harmony import */ var _DrawLib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DrawLib */ "../plotboilerplate/src/esm/interfaces/DrawLib.js");
/* harmony import */ var _externals__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./externals */ "../plotboilerplate/src/esm/interfaces/externals.js");



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/utils/WebColors.js":
/*!*****************************************************!*\
  !*** ../plotboilerplate/src/esm/utils/WebColors.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Red": () => (/* binding */ Red),
/* harmony export */   "Pink": () => (/* binding */ Pink),
/* harmony export */   "Purple": () => (/* binding */ Purple),
/* harmony export */   "DeepPurple": () => (/* binding */ DeepPurple),
/* harmony export */   "Indigo": () => (/* binding */ Indigo),
/* harmony export */   "Blue": () => (/* binding */ Blue),
/* harmony export */   "LightBlue": () => (/* binding */ LightBlue),
/* harmony export */   "Cyan": () => (/* binding */ Cyan),
/* harmony export */   "Teal": () => (/* binding */ Teal),
/* harmony export */   "Green": () => (/* binding */ Green),
/* harmony export */   "LightGreen": () => (/* binding */ LightGreen),
/* harmony export */   "WebColors": () => (/* binding */ WebColors),
/* harmony export */   "shuffleWebColors": () => (/* binding */ shuffleWebColors)
/* harmony export */ });
/* harmony import */ var _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datastructures/Color */ "../plotboilerplate/src/esm/utils/datastructures/Color.js");
/**
 * @author   Ikaros Kappler
 * @version  1.0.1
 * @date     2018-11-10
 * @modified 2020-10-23 Ported to Typescript.
 * @modified 2020-10-30 Exporting each color under its name globally.
 **/

const Red = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(255, 67, 55);
const Pink = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(232, 31, 100);
const Purple = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(156, 39, 175);
const DeepPurple = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(103, 59, 184);
const Indigo = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(64, 81, 181);
const Blue = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(35, 151, 245);
const LightBlue = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(6, 170, 245);
const Cyan = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(3, 189, 214);
const Teal = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(1, 150, 137);
const Green = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(77, 175, 82);
const LightGreen = _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(141, 195, 67);
/**
 * A set of beautiful web colors (I know, beauty is in the eye of the beholder).
 *
 * I found this color chart with 11 colors and think it is somewhat nice
 *    https://www.pinterest.com/pin/229965124706497134/
 *
 * @requires Color
 *
 */
const WebColors = [
    Red,
    Pink,
    Purple,
    DeepPurple,
    Indigo,
    Blue,
    LightBlue,
    Cyan,
    Teal,
    Green,
    LightGreen
];
/**
 * A helper function to shuffle the colors into a new order.
 */
const shuffleWebColors = (order) => {
    const result = Array(order.length);
    for (var i = 0; i < order.length; i++) {
        result[i] = WebColors[order[i] % WebColors.length];
    }
    return result;
};
//# sourceMappingURL=WebColors.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/utils/WebColorsContrast.js":
/*!*************************************************************!*\
  !*** ../plotboilerplate/src/esm/utils/WebColorsContrast.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebColorsContrast": () => (/* binding */ WebColorsContrast)
/* harmony export */ });
/* harmony import */ var _WebColors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WebColors */ "../plotboilerplate/src/esm/utils/WebColors.js");
/**
 * @requires Color
 *
 * @date 2020-10-27
 **/

const ORDER_CONTRAST = [8, 0, 6, 4, 1, 9, 2, 10, 3, 7, 5];
const WebColorsContrast = (0,_WebColors__WEBPACK_IMPORTED_MODULE_0__.shuffleWebColors)(ORDER_CONTRAST);
//# sourceMappingURL=WebColorsContrast.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/utils/WebColorsMalachite.js":
/*!**************************************************************!*\
  !*** ../plotboilerplate/src/esm/utils/WebColorsMalachite.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebColorsMalachite": () => (/* binding */ WebColorsMalachite)
/* harmony export */ });
/* harmony import */ var _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datastructures/Color */ "../plotboilerplate/src/esm/utils/datastructures/Color.js");
/**
 * @author   Ikaros Kappler
 * @version  1.0.0
 * @date     2018-11-11
 **/

/**
 * A mix of green shades.
 *
 * @requires Color
 */
const WebColorsMalachite = [
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 21, 6),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 30, 12),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 52, 28),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 81, 47),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(21, 134, 88),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 46, 19),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 68, 40),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(11, 81, 55),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 91, 46),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(0, 111, 46),
    _datastructures_Color__WEBPACK_IMPORTED_MODULE_0__.Color.makeRGB(33, 140, 106)
];
//# sourceMappingURL=WebColorsMalachite.js.map

/***/ }),

/***/ "../plotboilerplate/src/esm/utils/datastructures/Color.js":
/*!****************************************************************!*\
  !*** ../plotboilerplate/src/esm/utils/datastructures/Color.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Color": () => (/* binding */ Color)
/* harmony export */ });
/**
 * @author Extended, bugfixed and ported to TypeScript by Ikaros Kappler.
 * @modified 2018-xx-xx Added a clone() function.
 * @modified 2018-xx-xx Allowing leading '#' in the makeHEX() function.
 * @modified 2018-11-28 Fixed the checkHEX() function to accept 000000.
 * @modified 2019-11-18 Added a generic parse(string) function that detects the format.
 * @modified 2020-01-09 Fixed a bug in the parse(string) function. Hex colors with only three elements were considered faulty.
 * @modified 2020-10-23 Ported to Typescript.
 * @modified 2021-02-08 Fixed a lot of es2015 compatibility issues.
 * @modified 2021-02-08 Added basic tsdoc/jsdoc comments.
 * @version 0.0.9
 **/
/**
 * @classdesc A color class, inspired by neolitec's Javascript class.
 *    Original found at
 *      https://gist.github.com/neolitec/1344610
 *    Thanks to neolitec
 */
class Color {
    /**
     * Construct a new color with `r=0 g=0 b=0`.
     *
     * Consider using the `makeHex`, `makeRGB` or `makeHSL` functions.
     *
     * @constructor
     * @instance
     * @memberof Color
     */
    constructor() {
        this.r = this.g = this.b = 0;
        this.h = this.s = this.l = 0;
        this.a = 1;
    }
    ;
    // --- RGB ---------------------------------- 
    /**
     * Get this color as a CSS `rgb` string.
     *
     * Consult this for details: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
     *
     * @method cssRGB
     * @instance
     * @memberof Color
     * @return {string} This color as a CSS rgb string.
     */
    cssRGB() {
        return "rgb(" + Math.round(255 * this.r) + "," + Math.round(255 * this.g) + "," + Math.round(255 * this.b) + ")";
    }
    ;
    /**
     * Get this color as a CSS `rgba` string.
     *
     * Consult this for details: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
     *
     * @method cssRGBA
     * @instance
     * @memberof Color
     * @return {string} This color as a CSS rgba string.
     */
    cssRGBA() {
        return "rgba(" + Math.round(255 * this.r) + "," + Math.round(255 * this.g) + "," + Math.round(255 * this.b) + "," + this.a + ")";
    }
    ;
    /**
     * Get the red component of this RGB(A)color. This method just returns the `r` color attribute.
     *
     * @method red
     * @instance
     * @memberof Color
     * @return {number} A value between 0.0 and 1.0.
     */
    red() { return this.r; }
    ;
    /**
    * Get the green component of this RGB(A) color. This method just returns the `g` color attribute.
    *
    * @method green
    * @instance
    * @memberof Color
    * @return {number} A value between 0.0 and 1.0.
    */
    green() { return this.g; }
    ;
    /**
     * Get the blue component of this RGB(A) color. This method just returns the `b` color attribute.
     *
     * @method blue
     * @instance
     * @memberof Color
     * @return {number} A value between 0.0 and 1.0.
     */
    blue() { return this.b; }
    ;
    // --- HSL ---------------------------------- 
    /**
     * Get this color as a CSS `hsl` string.
     *
     * @method cssHSL
     * @instance
     * @memberof Color
     * @return {string} This color as a CSS hsl string.
     */
    cssHSL() {
        return "hsl(" + Math.round(360 * this.h) + "," + Math.round(100 * this.s) + "%," + Math.round(100 * this.l) + "%)";
    }
    ;
    /**
     * Get this color as a CSS `hsla` string.
     *
     * @method cssHSLA
     * @instance
     * @memberof Color
     * @return {string} This color as a CSS hsla string.
     */
    cssHSLA() {
        return "hsla(" + Math.round(360 * this.h) + "," + Math.round(100 * this.s) + "%," + Math.round(100 * this.l) + "%," + Math.round(this.a) + ")";
    }
    ;
    /**
     * Get the hue component of this HSL(A) color. This method just returns the `h` color attribute.
     *
     * @method hue
     * @instance
     * @memberof Color
     * @return {number} A value between 0.0 and 1.0.
     */
    hue() { return this.h; }
    ;
    /**
     * Get the saturation component of this HSL(A) color. This method just returns the `s` color attribute.
     *
     * @method saturation
     * @instance
     * @memberof Color
     * @return {number} A value between 0.0 and 1.0.
     */
    saturation() { return this.s; }
    ;
    /**
     * Get the lightness component of this HSL(A) color. This method just returns the `l` color attribute.
     *
     * @method lightness
     * @instance
     * @memberof Color
     * @return {number} A value between 0.0 and 1.0.
     */
    lightness() { return this.l; }
    ;
    // --- HEX ----------------------------------
    /**
     * Get this color as a CSS-HEX string (non-alpha): #rrggbb
     *
     * @method cssHEX
     * @instance
     * @memberof Color
     * @return {string} This color as a CSS-HEX string.
     */
    cssHEX() {
        return "#" +
            (255 * this.r < 16 ? "0" : "") + Math.round(255 * this.r).toString(16) +
            (255 * this.g < 16 ? "0" : "") + Math.round(255 * this.g).toString(16) +
            (255 * this.b < 16 ? "0" : "") + Math.round(255 * this.b).toString(16);
    }
    ;
    // --- Transparency ---------------------------------- 
    /**
     * Get the alpha channel (transparency) of this color.
     *
     * @method alpha
     * @instance
     * @memberof Color
     * @return {number} A value between 0.0 and 1.0.
     */
    alpha() { return this.a; }
    ;
    // --- Modifiers ---------------------------------- 
    saturate(v) {
        if ("string" == typeof v && v.indexOf("%") > -1 && (v = parseInt(v)) != NaN)
            this.s += v / 100;
        else if ("number" == typeof v) // range 255 
            this.s += v / 255;
        else
            throw new Error("error: bad modifier format (percent or number)");
        if (this.s > 1)
            this.s = 1;
        else if (this.s < 0)
            this.s = 0;
        Color.Converter.HSLToRGB(this);
    }
    ;
    desaturate(v) {
        this.saturate("-" + v);
    }
    ;
    lighten(v) {
        if ("string" == typeof v && v.indexOf("%") > -1 && (v = parseInt(v)) != NaN)
            this.l += v / 100;
        else if ("number" == typeof v) // range 255 
            this.l += v / 255;
        else
            throw new Error("error: bad modifier format (percent or number)");
        if (this.l > 1)
            this.l = 1;
        else if (this.l < 0)
            this.l = 0;
        Color.Converter.HSLToRGB(this);
    }
    ;
    darken(v) {
        this.lighten("-" + v);
    }
    ;
    fadein(v) {
        if ("string" == typeof v && v.indexOf("%") > -1 && (v = parseInt(v)) != NaN)
            this.a += v / 100;
        else if ("number" == typeof v) // range 255 
            this.a += v / 255;
        else
            throw new Error("error: bad modifier format (percent or number)");
        if (this.a > 1)
            this.a = 1;
        else if (this.a < 0)
            this.a = 0;
        Color.Converter.HSLToRGB(this);
    }
    ;
    fadeout(v) {
        this.fadein("-" + v);
    }
    ;
    spin(v) {
        if ("string" == typeof v && v.indexOf("%") > -1 && (v = parseInt(v)) != NaN)
            this.h += v / 100;
        else if ("number" == typeof v) // range 360 
            this.h += v / 360;
        else
            throw new Error("error: bad modifier format (percent or number)");
        if (this.h > 1)
            this.h = 1;
        else if (this.h < 0)
            this.h = 0;
        Color.Converter.HSLToRGB(this);
    }
    ;
    static makeRGB(...args) {
        const c = new Color();
        let sanitized;
        if (arguments.length < 3 || arguments.length > 4)
            throw new Error("error: 3 or 4 arguments");
        sanitized = Color.Sanitizer.RGB(arguments[0], arguments[1], arguments[2]);
        c.r = sanitized[0];
        c.g = sanitized[1];
        c.b = sanitized[2];
        if (arguments.length == 4)
            c.a = arguments[3];
        Color.Converter.RGBToHSL(c);
        return c;
    }
    ;
    static makeHSL(...args) {
        const c = new Color();
        let sanitized;
        if (arguments.length < 3 || arguments.length > 4)
            throw new Error("error: 3 or 4 arguments");
        sanitized = Color.Sanitizer.HSL(arguments[0], arguments[1], arguments[2]);
        c.h = sanitized[0];
        c.s = sanitized[1];
        c.l = sanitized[2];
        if (arguments.length == 4)
            c.a = arguments[3];
        Color.Converter.HSLToRGB(c);
        return c;
    }
    ;
    static makeHEX(value) {
        var c = new Color(), sanitized;
        // Edit Ika 2018-0308
        // Allow leading '#'
        if (value && value.startsWith('#'))
            value = value.substr(1);
        Color.Validator.checkHEX(value);
        if (value.length == 3) {
            sanitized = Color.Sanitizer.RGB(parseInt(value.substr(0, 1) + value.substr(0, 1), 16), parseInt(value.substr(1, 1) + value.substr(1, 1), 16), parseInt(value.substr(2, 1) + value.substr(2, 1), 16));
        }
        else if (value.length == 6) {
            sanitized = Color.Sanitizer.RGB(parseInt(value.substr(0, 2), 16), parseInt(value.substr(2, 2), 16), parseInt(value.substr(4, 2), 16));
        }
        else
            throw new Error("error: 3 or 6 arguments");
        c.r = sanitized[0];
        c.g = sanitized[1];
        c.b = sanitized[2];
        Color.Converter.RGBToHSL(c);
        return c;
    }
    ;
    /**
     * Parse the given color string. Currently only these formate are recognized: hex, rgb, rgba.
     *
     * @method parse
     * @static
     * @memberof Color
     * @param {string} str - The string representation to parse.
     * @return {Color} The color instance that's represented by the given string.
     */
    static parse(str) {
        if (typeof str == 'undefined')
            return null;
        if ((str = str.trim().toLowerCase()).length == 0)
            return null;
        if (str.startsWith('#'))
            return Color.makeHEX(str.substring(1, str.length));
        if (str.startsWith('rgb')) {
            var parts = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(0\.\d+))?\)$/.exec(str);
            // [ str, r, g, b, a|undefined ]
            if (typeof parts[4] == 'undefined')
                return Color.makeRGB(parts[1], parts[2], parts[3]);
            else
                return Color.makeRGB(parts[1], parts[2], parts[3], parts[4]);
        }
        else
            throw "Unrecognized color format: " + str;
    }
    ;
    /**
     * Create a clone of this color (RGB).
     *
     * @method clone
     * @instance
     * @memberof Color
     * @return {Color} A clone of this color (in RGB mode).
     */
    clone() {
        return Color.makeRGB(this.r, this.g, this.b, this.a);
    }
    ;
    /**
     * Interpolate this color on the RGB scale.
     *
     * @method interpolate
     * @instance
     * @memberof Color
     * @param {Color} c - The color to interpolate to.
     * @param {number} t - An interpolation value between 0.0 and 1.0.
     * @return {Color} A clone of this color (in RGB mode).
     */
    interpolate(c, t) {
        this.r += (c.r - c.r) * t;
        this.g += (c.g - c.g) * t;
        this.b += (c.b - c.b) * t;
        this.a += (c.a - c.a) * t;
        return this;
    }
    ;
}
Color.Sanitizer = {
    RGB: function (...args) {
        var o = [];
        if (arguments.length == 0) {
            return [];
        }
        // const allAreFrac = Color.testFrac( arguments );
        for (var i = 0; i < arguments.length; i++) {
            var c = arguments[i];
            if ("string" == typeof c && c.indexOf("%") > -1) {
                if ((c = parseInt(c)) == NaN)
                    throw new Error("Bad format");
                if (c < 0 || c > 100)
                    throw new Error("Bad format");
                o[i] = c / 100;
            }
            else {
                // console.log( 'allAreFrac', allAreFrac, arguments );
                if ("string" == typeof c && (c = parseInt(c)) == NaN)
                    throw new Error("Bad format");
                if (c < 0)
                    throw new Error("Bad format");
                //else if( allAreFrac ) o[i] = c; // c >= 0 && c <= 1 (all)
                else if (c >= 0 && c < 1)
                    o[i] = c;
                // else if(c >= 0.0 && c <= 1.0) o[i] = c;
                else if (c >= 1 && c < 256)
                    o[i] = c / 255; // ???
                // else if(c >= 0 && c < 256) o[i] = c/255;
                else
                    throw new Error("Bad format (" + c + ")");
            }
        }
        return o;
    },
    HSL: function (...args) {
        if (arguments.length < 3 || arguments.length > 4)
            throw new Error("3 or 4 arguments required");
        var h = arguments[0], s = arguments[1], l = arguments[2];
        if ("string" == typeof h && (h = parseFloat(h)) == NaN)
            throw new Error("Bad format for hue");
        if (h < 0 || h > 360)
            throw new Error("Hue out of range (0..360)");
        else if ((("" + h).indexOf(".") > -1 && h > 1) || ("" + h).indexOf(".") == -1)
            h /= 360;
        if ("string" == typeof s && s.indexOf("%") > -1) {
            if ((s = parseInt(s)) == NaN)
                throw new Error("Bad format for saturation");
            if (s < 0 || s > 100)
                throw new Error("Bad format for saturation");
            s /= 100;
        }
        else if (s < 0 || s > 1)
            throw new Error("Bad format for saturation");
        if ("string" == typeof l && l.indexOf("%") > -1) {
            if ((l = parseInt(l)) == NaN)
                throw new Error("Bad format for lightness");
            if (l < 0 || l > 100)
                throw new Error("Bad format for lightness");
            l /= 100;
        }
        else if (l < 0 || l > 1)
            throw new Error("Bad format for lightness");
        return [h, s, l];
    }
}; // ENd sanitizer
Color.Validator = {
    /**
     * Check a hexa color (without #)
     */
    checkHEX: (value) => {
        if (value.length != 6 && value.length != 3)
            throw new Error("Hexa color: bad length (" + value.length + ")," + value);
        value = value.toLowerCase();
        //for( var i in value ) {
        for (var i = 0; i < value.length; i++) {
            var c = value.charCodeAt(i);
            if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 102)))
                throw new Error(`Hexa color: out of range for "${value}" at position ${i}.`);
        }
    }
};
Color.Converter = {
    /**
     * Calculates HSL Color.
     * RGB must be normalized.
     * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
     */
    RGBToHSL: (color) => {
        var r = color.r;
        var g = color.g;
        var b = color.b;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        color.l = (max + min) / 2;
        if (max == min) {
            color.h = color.s = 0; // achromatic
        }
        else {
            var d = max - min;
            color.s = color.l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    color.h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    color.h = (b - r) / d + 2;
                    break;
                case b:
                    color.h = (r - g) / d + 4;
                    break;
            }
            color.h /= 6;
        }
    },
    /**
     * Calculates RGB color (nomalized).
     * HSL must be normalized.
     *
     * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
     */
    HSLToRGB: (color) => {
        var h = color.h;
        var s = color.s;
        var l = color.l;
        if (s == 0) {
            color.r = color.g = color.b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            color.r = Color.Converter.hue2rgb(p, q, h + 1 / 3);
            color.g = Color.Converter.hue2rgb(p, q, h);
            color.b = Color.Converter.hue2rgb(p, q, h - 1 / 3);
        }
    },
    hue2rgb: (p, q, t) => {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
};
; // END class
//# sourceMappingURL=Color.js.map

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
/******/ 				installedChunks[chunkIds[i]] = 0;
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