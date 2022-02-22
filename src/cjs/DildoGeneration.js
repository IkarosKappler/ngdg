"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DildoGeneration = void 0;
var THREE = require("three");
var VertexNormalsHelper_1 = require("three/examples/jsm/helpers/VertexNormalsHelper");
var DildoGeometry_1 = require("./DildoGeometry");
var DildoMaterials_1 = require("./DildoMaterials");
var GeometryGenerationHelpers_1 = require("./GeometryGenerationHelpers");
var mergeGeometries_1 = require("./mergeGeometries");
var PathFinder_1 = require("./PathFinder");
var randomWebColor_1 = require("./randomWebColor");
var constants_1 = require("./constants");
var BumpMapper_1 = require("./BumpMapper");
var three_geometry_hellfix_1 = require("three-geometry-hellfix");
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