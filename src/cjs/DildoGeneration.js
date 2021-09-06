"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DildoGeneration = void 0;
var THREE = require("three");
var VertexNormalsHelper_1 = require("three/examples/jsm/helpers/VertexNormalsHelper");
var STLExporter_1 = require("three/examples/jsm/exporters/STLExporter");
var DildoGeometry_1 = require("./DildoGeometry");
var DildoMaterials_1 = require("./DildoMaterials");
var GeometryGenerationHelpers_1 = require("./GeometryGenerationHelpers");
var mergeGeometries_1 = require("./mergeGeometries");
var PathFinder_1 = require("./PathFinder");
var randomWebColor_1 = require("./randomWebColor");
var constants_1 = require("./constants");
var computeVertexNormals_1 = require("./computeVertexNormals");
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
        // if (options.performSlice) {
        //   this.__performPlaneSlice(dildoMesh, dildoGeometry, wireframe, useTextureImage, textureImagePath, options);
        //   // The CSG operations are not reliable.
        //   // this.__performCsgSlice(latheMesh, geometry, material);
        // } else {
        //   dildoMesh.position.y = -100;
        //   dildoMesh.userData["isExportable"] = true;
        //   this.addMesh(dildoMesh);
        //   if (options.showNormals) {
        //     var vnHelper = new VertexNormalsHelper(dildoMesh, options.normalsLength, 0x00ff00); // Fourth param 1?
        //     // TODO: use addMesh() here?
        //     this.scene.add(vnHelper);
        //     this.geometries.push(vnHelper);
        //   }
        // }
        // Add perpendicular path?
        if (options.showBasicPerpendiculars) {
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.addPerpendicularPaths(this, dildoGeometry);
        }
        // Show computed dildo normals?
        if (options.previewBumpmap || options.useBumpmap) {
            var collectedVertexNormals = computeVertexNormals_1.computeVertexNormals(dildoGeometry, bufferedGeometry);
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
            if (options.showBumpmapTargets) {
                dildoNormalsMesh.position.y = -100;
                this.addMesh(dildoNormalsMesh);
            }
            console.log("options.useBumpmap", options.useBumpmap, "bumpmap", bumpmap);
            // const heightMap = createHeightMapFromImage( bumpmapTexture ):
            if (options.useBumpmap && bumpmap) {
                for (var y = 0; y < dildoGeometry.vertexMatrix.length; y++) {
                    for (var x = 0; x < dildoGeometry.vertexMatrix[y].length; x++) {
                        var vertIndex = dildoGeometry.vertexMatrix[y][x];
                        var vertex = dildoGeometry.vertices[vertIndex];
                        var yRatio = y / (dildoGeometry.vertexMatrix.length - 1);
                        var xRatio = x / (dildoGeometry.vertexMatrix[y].length - 1);
                        var lerpFactor = bumpmap.getHeightAt(xRatio, yRatio);
                        // if (y < 5 && x < 5) {
                        //   console.log("lerpFactor", lerpFactor, "x", x, "y", y, "xRatio", xRatio, "yRatio", yRatio);
                        // }
                        if (lerpFactor === NaN) {
                            console.log("lerpFactor is NaN", x, y);
                        }
                        if (lerpFactor === undefined) {
                            console.log("lerpFactor is undefined", x, y);
                        }
                        var lerpTarget = dildoNormalGeometry.vertices[vertIndex];
                        vertex.lerp(lerpTarget, lerpFactor);
                    }
                }
                // Override the buffered geometry! (bumpmap has been applied)
                bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry);
                bufferedGeometry.computeVertexNormals();
                // Override the mesh! (bumpmap has been applied)
                dildoMesh = new THREE.Mesh(bufferedGeometry, material);
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
                color: randomWebColor_1.randomWebColor(i, "Mixed") // 0x8800a8
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
                mergeGeometries_1.mergeGeometries(leftSliceGeometry, triangulationGeometry, constants_1.EPS);
                mergeGeometries_1.mergeGeometries(rightSliceGeometry, triangulationGeometry, constants_1.EPS);
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
    DildoGeneration.prototype.generateSTL = function (options) {
        var exporter = new STLExporter_1.STLExporter();
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