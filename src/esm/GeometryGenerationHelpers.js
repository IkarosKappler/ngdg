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
import * as THREE from "three";
// import { earcut } from "./thirdparty-ported/earcut"; // TODO: fix earcut types, convert to custum library
import { earcut } from "earcut-typescript";
import { Bounds, Polygon, Vertex } from "plotboilerplate";
// import { sliceGeometry } from "./thirdparty-ported/threejs-slice-geometry"; // TODO: convert to custom library
import { sliceGeometry } from "threejs-slice-geometry-typescript"; // TODO: convert to custom library
import { PlaneMeshIntersection } from "./PlaneMeshIntersection";
import { clearDuplicateVertices3 } from "./clearDuplicateVertices3";
import { UVHelpers } from "./UVHelpers";
import { KEY_PLANE_INTERSECTION_TRIANGULATION } from "./constants";
export const GeometryGenerationHelpers = {
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
    makeFace3: (geometry, vertIndexA, vertIndexB, vertIndexC, inverseFaceDirection) => {
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
    makeFace4: (geometry, vertIndexA, vertIndexB, vertIndexC, vertIndexD, inverseFaceDirection) => {
        if (inverseFaceDirection) {
            // Just inverse the winding order of both face3 elements
            GeometryGenerationHelpers.makeFace3(geometry, vertIndexA, vertIndexC, vertIndexB, false);
            GeometryGenerationHelpers.makeFace3(geometry, vertIndexC, vertIndexD, vertIndexB, false);
        }
        else {
            GeometryGenerationHelpers.makeFace3(geometry, vertIndexA, vertIndexB, vertIndexC, false);
            GeometryGenerationHelpers.makeFace3(geometry, vertIndexB, vertIndexD, vertIndexC, false);
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
    addCylindricUV4: (geometry, a, b, c, d, outlineSegmentCount, baseShapeSegmentCount, inverseFaceDirection) => {
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
    addPyramidalBaseUV3: (geometry, a, baseShapeSegmentCount) => {
        // Create a mirrored texture to avoid hard visual cuts
        const ratioA = 1.0 - Math.abs(0.5 - a / baseShapeSegmentCount) * 2;
        const ratioB = 1.0 - Math.abs(0.5 - (a + 1) / baseShapeSegmentCount) * 2;
        geometry.faceVertexUvs[0].push([new THREE.Vector2(ratioA, 0), new THREE.Vector2(0.5, 1), new THREE.Vector2(ratioB, 0)]);
    },
    /**
     * Flatten an array of 2d vertices into a flat array of coordinates.
     * (required by the earcut algorithm for example).
     *
     * @param {Array<XYCoords>} vertices2d
     * @returns {Array<number>}
     */
    flattenVert2dArray: (vertices2d) => {
        // Array<number>
        const coordinates = [];
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
    mkCircularPolygon: (radius, pointCount, excentricity) => {
        if (typeof excentricity === "undefined") {
            excentricity = 1.0;
        }
        const vertices = [];
        let phi;
        for (var i = 0; i < pointCount; i++) {
            phi = Math.PI * 2 * (i / pointCount);
            vertices.push(new Vertex(Math.cos(phi) * radius * excentricity, Math.sin(phi) * radius));
        }
        return new Polygon(vertices, false);
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
    makeSlice: (unbufferedGeometry, plane) => {
        // Slice mesh into two
        // See https://github.com/tdhooper/threejs-slice-geometry
        const closeHoles = false; // This might be configurable in a later version.
        // TODO: cc
        // var sliceMaterial = DildoMaterials.createSliceMaterial(wireframe);
        // var slicedGeometry = sliceGeometry(unbufferedGeometry, plane, closeHoles);
        const slicedGeometry = sliceGeometry(unbufferedGeometry, plane, closeHoles);
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
    makeAndAddPlaneIntersection: (thisGenerator, mesh, unbufferedGeometry, // THREE.Geometry,
    planeGeometry, // THREE.Plane, // THREE.PlaneGeometry, // THREE.Plane ???
    planeGeometryReal, 
    // TODO: use a proper global interface here
    options // { showSplitShape?: boolean }
    ) => {
        // Find the cut path
        const planeMeshIntersection = new PlaneMeshIntersection();
        // Array<THREE.Vector3>  (compatible with XYCoords :)
        const intersectionPoints = planeMeshIntersection.getIntersectionPoints(mesh, unbufferedGeometry, planeGeometry, planeGeometryReal);
        const EPS = 0.000001;
        const uniqueIntersectionPoints = clearDuplicateVertices3(intersectionPoints, EPS);
        const pointGeometry = new THREE.Geometry();
        pointGeometry.vertices = uniqueIntersectionPoints;
        const pointsMaterial = new THREE.PointsMaterial({
            size: 1.4,
            color: 0x00ffff
        });
        const pointsMesh = new THREE.Points(pointGeometry, pointsMaterial);
        if (options.showSplitShape) {
            pointsMesh.position.y = -100;
            pointsMesh.position.z = -50;
            thisGenerator.addMesh(pointsMesh);
        }
        // TODO: convert point set to path
        // Test: make a triangulation to see what the path looks like
        const polygonData = GeometryGenerationHelpers.flattenVert2dArray(uniqueIntersectionPoints);
        // Run Earcut
        const triangleIndices = earcut(polygonData);
        // Process the earcut result;
        //         add the retrieved triangles as geometry faces.
        const triangleGeometry = new THREE.Geometry();
        for (var i = 0; i < uniqueIntersectionPoints.length; i++) {
            triangleGeometry.vertices.push(uniqueIntersectionPoints[i].clone());
        }
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            var a = triangleIndices[i];
            var b = triangleIndices[i + 1];
            var c = triangleIndices[i + 2];
            GeometryGenerationHelpers.makeFace3(triangleGeometry, a, b, c);
        }
        if (options.addRawIntersectionTriangleMesh) {
            // This is more a quick experimental preview feature.
            // The data is often faulty and too unprecise.
            const triangleMesh = new THREE.Mesh(triangleGeometry, new THREE.LineBasicMaterial({
                color: 0xff8800
            }));
            triangleMesh.position.y = -100;
            triangleMesh.position.z = -50;
            thisGenerator.addMesh(triangleMesh);
        }
        // Make the actual models
        // CURRENTLY NOT IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
        if (options.addPrecalculatedMassiveFaces) {
            GeometryGenerationHelpers.makeAndAddMassivePlaneIntersection(thisGenerator, unbufferedGeometry);
        }
        if (options.addPrecalculatedHollowFaces) {
            GeometryGenerationHelpers.makeAndAddHollowPlaneIntersection(thisGenerator, unbufferedGeometry);
        }
        return uniqueIntersectionPoints;
    },
    // CURRENTLY NOT REALLY IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
    makeAndAddMassivePlaneIntersection: (thisGenerator, unbufferedGeometry) => {
        const intersectionPoints = unbufferedGeometry.getPerpendicularPathVertices(true, true); // includeBottom=true, getInner=true
        const pointGeometry = new THREE.Geometry();
        pointGeometry.vertices = intersectionPoints;
        const pointsMaterial = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xff0000,
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });
        // Array<number,number,number,...>
        const polygonData = GeometryGenerationHelpers.flattenVert2dArray(intersectionPoints);
        // Step 3: run Earcut
        const triangleIndices = earcut(polygonData);
        // Step 4: process the earcut result;
        //         add the retrieved triangles as geometry faces.
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            const a = triangleIndices[i];
            const b = triangleIndices[i + 1];
            const c = triangleIndices[i + 2];
            GeometryGenerationHelpers.makeFace3(pointGeometry, a, b, c);
        }
        const pointsMesh = new THREE.Mesh(pointGeometry, pointsMaterial);
        pointsMesh.position.y = -100;
        pointsMesh.position.z = 50;
        pointsMesh.userData["isExportable"] = false;
        thisGenerator.addMesh(pointsMesh);
    },
    // CURRENTLY NOT REALLY IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
    makeAndAddHollowPlaneIntersection: (thisGenerator, unbufferedGeometry) => {
        const pointGeometry = new THREE.Geometry();
        const perpLines = unbufferedGeometry.getPerpendicularHullLines();
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
        const pointsMaterial = new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0xff0000,
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });
        const pointsMesh = new THREE.Mesh(pointGeometry, pointsMaterial);
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
    addSpine: (thisGenerator, spineGeometry) => {
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
    addPerpendicularPaths: (thisGenerator, unbufferedDildoGeometry) => {
        GeometryGenerationHelpers.addPerpendicularPath(thisGenerator, unbufferedDildoGeometry.outerPerpLines, 0xff0000);
        GeometryGenerationHelpers.addPerpendicularPath(thisGenerator, unbufferedDildoGeometry.innerPerpLines, 0x00ff00);
    },
    /**
     * Add the given array of perpendicular lines (perpendicular to the mesh surface along the cut path)
     * as a THREE.LineSegments geometry.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the created line mesh to.
     * @param {Array<THREE.Line3>} perpLines - The lines to
     * @param {number} materialColor - A color for the material to use (like 0xff0000 for red).
     */
    addPerpendicularPath: (thisGenerator, perpLines, materialColor) => {
        const outerPerpGeometry = new THREE.Geometry();
        perpLines.forEach((perpLine) => {
            outerPerpGeometry.vertices.push(perpLine.start.clone());
            outerPerpGeometry.vertices.push(perpLine.end.clone());
        });
        const outerPerpMesh = new THREE.LineSegments(outerPerpGeometry, new THREE.LineBasicMaterial({
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
    makePlaneTriangulation: (generator, sliceGeometry, connectedPath, options) => {
        // Convert the connected paths indices to [x, y, x, y, x, y, ...] coordinates (requied by earcut)
        const currentPathXYData = connectedPath.reduce((earcutInput, vertIndex) => {
            const vert = sliceGeometry.vertices[vertIndex];
            earcutInput.push(vert.x, vert.y);
            return earcutInput;
        }, []);
        // Array<number> : triplets of vertex indices in the plain XY array
        const triangles = earcut(currentPathXYData);
        // Convert triangle indices back to a geometry
        const trianglesGeometry = new THREE.Geometry();
        // We will merge the geometries in the end which will create clones of the vertices.
        // No need to clone here.
        // trianglesGeometry.vertices = leftSliceGeometry.vertices;
        trianglesGeometry.vertices = connectedPath.map((geometryVertexIndex) => {
            return sliceGeometry.vertices[geometryVertexIndex];
        });
        // Array<{x,y}> is compatible with Array<{x,y,z}> here :)
        const flatSideBounds = Bounds.computeFromVertices(trianglesGeometry.vertices.map((vector3) => new Vertex(vector3.x, vector3.y)));
        for (var t = 0; t < triangles.length; t += 3) {
            const a = triangles[t];
            const b = triangles[t + 1];
            const c = triangles[t + 2];
            trianglesGeometry.faces.push(new THREE.Face3(a, b, c));
            // Add UVs
            UVHelpers.makeFlatTriangleUVs(trianglesGeometry, flatSideBounds, a, b, c);
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
        generator.partialResults[KEY_PLANE_INTERSECTION_TRIANGULATION] = trianglesGeometry;
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
    normalizeVectorXY: (base, extend, normalLength) => {
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
    normalizeVectorXYZ: (base, extend, normalLength) => {
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
    removeAllChildNodes: (rootNode) => {
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
    clamp: (n, min, max) => {
        return Math.max(Math.min(n, max), min);
    }
};
//# sourceMappingURL=GeometryGenerationHelpers.js.map