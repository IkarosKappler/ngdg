/**
 * A collection of helper function used to generate dildo meshes.
 *
 * @require sliceGeometry
 *
 * @author Ikaros Kappler
 * @date 2021-06-30
 * @version 0.0.1-alpha
 */

(function (_context) {
  _context.GeometryGenerationHelpers = {
    /**
     * Create a (right-turning) triangle of the three vertices at index A, B and C.
     *
     * @param {number} vertIndexA
     * @param {number} vertIndexB
     * @param {number} vertIndexC
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace3: function (geometry, vertIndexA, vertIndexB, vertIndexC, inverseFaceDirection) {
      // console.log("inverseFaceDirection", inverseFaceDirection);
      if (inverseFaceDirection) {
        geometry.faces.push(new THREE.Face3(vertIndexC, vertIndexB, vertIndexA));
        // this.faces.push(new THREE.Face3(vertIndexA, vertIndexB, vertIndexC));
      } else {
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
     * @param {number} vertIndexA - The first vertex index.
     * @param {number} vertIndexB - The second vertex index.
     * @param {number} vertIndexC - The third vertex index.
     * @param {number} vertIndexD - The fourth vertex index.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace4: function (geometry, vertIndexA, vertIndexB, vertIndexC, vertIndexD, inverseFaceDirection) {
      if (inverseFaceDirection) {
        // Just inverse the winding order of both face3 elements
        GeometryGenerationHelpers.makeFace3(geometry, vertIndexA, vertIndexC, vertIndexB, false);
        GeometryGenerationHelpers.makeFace3(geometry, vertIndexC, vertIndexD, vertIndexB, false);
      } else {
        GeometryGenerationHelpers.makeFace3(geometry, vertIndexA, vertIndexB, vertIndexC, false);
        GeometryGenerationHelpers.makeFace3(geometry, vertIndexB, vertIndexD, vertIndexC, false);
      }
    },

    /**
     * Create texture UV coordinates for the rectangular two  triangles at matrix indices a, b, c and d.
     *
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @param {number} d
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
      } else {
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
     * @param {THREE.PlaneGeometry} plane
     */
    makeSlice: function (unbufferedGeometry, plane) {
      // Slice mesh into two
      // See https://github.com/tdhooper/threejs-slice-geometry
      var closeHoles = false;
      // var sliceMaterial = DildoMaterials.createSliceMaterial(wireframe);
      var slicedGeometry = sliceGeometry(unbufferedGeometry, plane, closeHoles);
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
     * @param {THREE.Geometry} unbufferedGeometry
     * @param {THREE.Plane} planeMesh
     * @returns
     */
    makeAndAddPlaneIntersection: function (thisGenerator, mesh, unbufferedGeometry, planeMesh, options) {
      // Find the cut path
      var planeMeshIntersection = new PlaneMeshIntersection();
      // Array<THREE.Vector3>  (compatible with XYCoords :)
      var intersectionPoints = planeMeshIntersection.getIntersectionPoints(mesh, unbufferedGeometry, planeMesh);
      var EPS = 0.000001;
      var uniqueIntersectionPoints = clearDuplicateVertices3(intersectionPoints, EPS);
      // console.log("found #intersectionPoints", intersectionPoints.length, "# unique", uniqueIntersectionPoints.length);

      var pointGeometry = new THREE.Geometry();
      pointGeometry.vertices = uniqueIntersectionPoints;
      var pointsMaterial = new THREE.PointsMaterial({
        size: 1.4,
        color: 0x00ffff
      });
      var pointsMesh = new THREE.Points(pointGeometry, pointsMaterial);

      if (options.showSplitShape) {
        // Also add triangulated mesh (is probably faulty)
        // var linesMesh = new THREE.LineSegments(
        //   pointGeometry,
        //   new THREE.LineBasicMaterial({
        //     color: 0xff8800
        //   })
        // );
        // linesMesh.position.y = -100;
        // linesMesh.position.z = -50;
        // thisGenerator.addMesh(linesMesh);
        pointsMesh.position.y = -100;
        pointsMesh.position.z = -50;
        thisGenerator.addMesh(pointsMesh);
      }

      // TODO: convert point set to path
      // Test: make a triangulation to see what the path looks like
      var polygonData = GeometryGenerationHelpers.flattenVert2dArray(uniqueIntersectionPoints);
      // Run Earcut
      var triangleIndices = earcut(polygonData);
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
        GeometryGenerationHelpers.makeFace3(triangleGeometry, a, b, c);
      }
      if (options.addRawIntersectionTriangleMesh) {
        // This is more a quick experimental preview feature.
        // The data is often faulty and too unprecise.
        var triangleMesh = new THREE.Mesh(
          triangleGeometry,
          new THREE.LineBasicMaterial({
            color: 0xff8800
          })
        );
        triangleMesh.position.y = -100;
        triangleMesh.position.z = -50;
        thisGenerator.addMesh(triangleMesh);
      }

      // // Find the connected path (there is only one if the choose the cut plane properly)
      // // Array<number[]>
      // var connectedPaths = new PathFinder().findAllPathsOnMesh(unbufferedGeometry, uniqueIntersectionPoints);
      // consolel.log("connectedPaths", connectedPaths);
      // END Test

      // Make the actual models
      // CURRENTLY NOT IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
      if (options.addPrecalculatedMassiveFaces) {
        GeometryGenerationHelpers.makeAndAddMassivePlaneIntersection(thisGenerator, mesh, unbufferedGeometry, planeMesh);
      }
      if (options.addPrecalculatedHollowFaces) {
        GeometryGenerationHelpers.makeAndAddHollowPlaneIntersection(thisGenerator, mesh, unbufferedGeometry, planeMesh);
      }

      return uniqueIntersectionPoints;
      // return pointGeometry;
    },

    // CURRENTLY NOT REALLY IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
    makeAndAddMassivePlaneIntersection: function (thisGenerator, mesh, unbufferedGeometry, planeMesh) {
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
      var polygonData = GeometryGenerationHelpers.flattenVert2dArray(intersectionPoints);

      // Step 3: run Earcut
      var triangleIndices = earcut(polygonData);

      // Step 4: process the earcut result;
      //         add the retrieved triangles as geometry faces.
      for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
        var a = triangleIndices[i];
        var b = triangleIndices[i + 1];
        var c = triangleIndices[i + 2];
        GeometryGenerationHelpers.makeFace3(pointGeometry, a, b, c);
      }

      var pointsMesh = new THREE.Mesh(pointGeometry, pointsMaterial);
      pointsMesh.position.y = -100;
      pointsMesh.position.z = 50;
      pointsMesh.userData["isExportable"] = false;
      thisGenerator.addMesh(pointsMesh);
    },

    // CURRENTLY NOT REALLY IN USE. THE UNDERLYING MODEL IS A NON-TWISTED ONE.
    makeAndAddHollowPlaneIntersection: function (thisGenerator, mesh, unbufferedGeometry, planeMesh) {
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
      var spineMesh = new THREE.LineSegments(
        spineGeometry,
        new THREE.LineBasicMaterial({
          color: 0xff8800
        })
      );
      spineMesh.position.y = -100;
      thisGenerator.addMesh(spineMesh);
    },

    /**
     * This function creates two line-meshes in red and green indicating the perpendicular cut
     * path along the geometry to be sliced.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new two meshes to.
     * @param {DildoGeometry} unbufferedLatheGeometry - The dildo geometry to retrieve the perpendicular path from.
     */
    addPerpendicularPaths: function (thisGenerator, unbufferedLatheGeometry) {
      GeometryGenerationHelpers.addPerpendicularPath(thisGenerator, unbufferedLatheGeometry.outerPerpLines, 0xff0000);
      GeometryGenerationHelpers.addPerpendicularPath(thisGenerator, unbufferedLatheGeometry.innerPerpLines, 0x00ff00);
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
      var outerPerpMesh = new THREE.LineSegments(
        outerPerpGeometry,
        new THREE.LineBasicMaterial({
          color: materialColor
        })
      );
      outerPerpMesh.position.y = -100;
      thisGenerator.addMesh(outerPerpMesh);
    }
  };
})(globalThis);
