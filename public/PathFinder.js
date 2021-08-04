/**
 * The PathFinger tool will find the connected path on a mesh surface, given by a set
 * of vertices that lay on the geometry's surface.
 *
 * Each vertex in the path elements array must be at some gometry vertex position. The position
 * does not necessarily need to be exact, some epsilon is used (default epsilon is 0.000001).
 *
 * @date 2021-07-06
 */

(function (_context) {
  var EPS = 0.000001;

  /**
   * Construct a new PathFinder.
   *
   * @param {number=0.000001} epsilon - (optional) Specity any custom epsilon here if the default epsilon is too large/small. Must be >= 0.
   */
  var PathFinder = function (epsilon) {
    this.visitedVertices = new Set();
    this.unvisitedVertIndices = new Set(); // <number>
    this.numVisitedVertices = 0;
    this.epsilon = typeof epsilon !== "undefined" && epsilon >= 0 ? epsilon : EPS;
  };

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
    this.unvisitedVertIndices = new Set(
      pathVertIndices.map(function (_pathVert, index) {
        return index;
      })
    );
    // As long as there are path vertices unvisited, there are sill portions of the path(s)
    // to be processed.
    while (this.numVisitedVertices < n) {
      var nextUnvisitedIndex = this.unvisitedVertIndices.values().next().value;
      // Array<number>
      var path = this.findUnvisitedPaths(unbufferedGeometry, pathVertIndices, nextUnvisitedIndex);
      collectedPaths.push(path);
    }

    // Try to find adjacent paths to connect them.
    return this.combineAdjacentPaths(collectedPaths, unbufferedGeometry, pathVertices);
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
   * @returns
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
   * A simple check to determine if a face of the geometry (given by the face index)
   * is adjacent to the given vertex index (a vertex index in the geometry.).
   *
   * @param {*} unbufferedGeometry
   * @param {*} f
   * @param {*} geometryVertexIndex
   * @returns
   */
  var faceHasVertIndex = function (unbufferedGeometry, f, geometryVertexIndex) {
    var face = unbufferedGeometry.faces[f];
    return face.a === geometryVertexIndex || face.b === geometryVertexIndex || face.c === geometryVertexIndex;
  };

  /**
   * Get an array of vertex indices inside the geometry that represent the given path vertices,
   *
   * If no equivalent geometry vertex can be found (for a path vertex) then the path vertex
   * will be skipped.
   * So the returned array might be shorter than the path – and thus, have gaps.
   *
   * @param {THREE.Geometry} unbufferedGeometry
   * @param {Array<THREE.Vector3>} pathVertices
   * @returns
   */
  var mapVerticesToGeometryIndices = function (unbufferedGeometry, pathVertices, epsilon) {
    var pathVertIndices = []; // number[]
    for (var i = 0; i < pathVertices.length; i++) {
      var pathVert = pathVertices[i];
      var foundIndex = -1;
      var foundDist = epsilon; // EPS;
      for (var j = 0; j < unbufferedGeometry.vertices.length; j++) {
        var curDist = unbufferedGeometry.vertices[j].distanceTo(pathVert);
        if (curDist <= foundDist) {
          // Remember geometry index if closest to path vertex
          if (
            foundIndex === -1 ||
            // By convention use smalled vertex index if multiple found
            (foundIndex !== -1 && unbufferedGeometry.vertices[foundIndex].distanceTo(pathVert) >= curDist && foundIndex > j)
          ) {
            foundIndex = j;
            foundDist = curDist;
          }
        }
      }
      if (foundIndex === -1) {
        console.warn(
          "PathFinder.mapVerticesToGeometryIndices could not find a matching geometry vertex for path point " +
            i +
            ". The final result might be locally broken."
        );
      } else {
        // Note: it may be possible that NO MATCHING GEOMETRY VERT was found (foundIndex = -1).
        pathVertIndices.push(foundIndex);
      }
    } // END for i
    return pathVertIndices;
  };

  /**
   * Find adjacent paths and connect them.
   *
   * @param {Array<number[]>} collectedPaths
   * @param {THREE.Geometry} unbufferedGeometry
   * @param {THREE.Vector3[]} pathVertices
   * @return {Array<number[]>} A new sequence of paths (a path is an array of vertex indices).
   */
  PathFinder.prototype.combineAdjacentPaths = function (collectedPaths, unbufferedGeometry, pathVertices) {
    // Array<number[]>
    var resultPaths = [];
    // First build up an unvisited path set (set of path indices)
    // Set<number>
    var unvisitedPathIndexSet = new Set(
      collectedPaths.map(function (_path, index) {
        return index;
      })
    );

    while (unvisitedPathIndexSet.size > 0) {
      var currentPathIndex = unvisitedPathIndexSet.values().next().value;
      unvisitedPathIndexSet.delete(currentPathIndex);
      var currentPath = collectedPaths[currentPathIndex];
      var nextPath = null;
      // var c = 32;
      do {
        nextPath = findAdjacentPath(
          collectedPaths,
          currentPath[currentPath.length - 1],
          unvisitedPathIndexSet,
          unbufferedGeometry
        );
        if (!nextPath && currentPath.length > 1) {
          // If path's end point has no connection try reversed path
          currentPath = currentPath.reverse();
          nextPath = findAdjacentPath(
            collectedPaths,
            currentPath[currentPath.length - 1],
            unvisitedPathIndexSet,
            unbufferedGeometry
          );
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
          } else if (faceHasVertIndex(unbufferedGeometry, f, nextPath[nextPath.length - 1])) {
            // Concat backwards
            unvisitedPathIndexSet.delete(p);
            return nextPath.reverse();
          }
        }
      }
    }
  };

  _context.PathFinder = PathFinder;
})(globalThis);
