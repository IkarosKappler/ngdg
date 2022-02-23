"use strict";
/**
 * A collection of helper function used to generate dildo meshes.
 *
 * @require sliceGeometry
 *
 * @author   Ikaros Kappler
 * @date     2021-06-30
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryGenerationHelpers = void 0;
var THREE = require("three");
var earcut_typescript_1 = require("earcut-typescript");
var plotboilerplate_1 = require("plotboilerplate");
var threejs_slice_geometry_typescript_1 = require("threejs-slice-geometry-typescript");
var PlaneMeshIntersection_1 = require("./PlaneMeshIntersection");
var clearDuplicateVertices3_1 = require("./clearDuplicateVertices3");
var three_geometry_hellfix_1 = require("three-geometry-hellfix");
var UVHelpers_1 = require("./UVHelpers");
var constants_1 = require("./constants");
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
        var pointGeometry = exports.GeometryGenerationHelpers.verticesToBufferGeometry(uniqueIntersectionPoints);
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
    },
    /**
     * Rotate a 3d vertex around its z axsis.
     *
     * @param {THREE.Vector3} vert - The vertex to rotate (in-place).
     * @param {number} angle - The angle to rotate abount (in radians).
     * @param {number} xCenter - The x component of the z axis to rotate around.
     * @param {number} yCenter - The y component of the z axis to rotate around.
     * @returns {THREE.Vector3} The vertex itself (for chaining).
     */
    rotateVert: function (vert, angle, xCenter, yCenter) {
        var axis = new THREE.Vector3(0, 0, 1);
        vert.x -= xCenter;
        vert.y -= yCenter;
        vert.applyAxisAngle(axis, angle);
        vert.x += xCenter;
        vert.y += yCenter;
        return vert;
    },
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
    rotateVertY: function (vert, angle, xCenter, zCenter) {
        var axis = new THREE.Vector3(0, 1, 0);
        vert.x -= xCenter;
        vert.z -= zCenter;
        vert.applyAxisAngle(axis, angle);
        vert.x += xCenter;
        vert.z += zCenter;
        return vert;
    }
};
//# sourceMappingURL=GeometryGenerationHelpers.js.map