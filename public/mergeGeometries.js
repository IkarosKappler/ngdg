/**
 * @require locateVertexInArray
 *
 * @author  Ikaros Kappler
 * @date    2021-07-26
 * @version 0.0.1
 */

(function (_context) {
  var EPS = 0.000001;

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
    var vertexMap = mergeAndMapVertices(baseGeometry, mergeGeometry, epsilon);
    // TODO: finished merge algorithm
    // Merge faces
    for (var f in mergeGeometry.faces) {
      var face = mergeGeometry.faces[f];
      var a = vertexMap[face.a];
      var b = vertexMap[face.b];
      var c = vertexMap[face.c];
      baseGeometry.faces.push(new THREE.Face3(a, b, c));
      if (mergeGeometry.faceVertexUvs.length > 0 && f < mergeGeometry.faceVertexUvs[0].length) {
        var uvData = mergeGeometry.faceVertexUvs[0][f]; // [Vector2,Vector2,Vector2]
        baseGeometry.faceVertexUvs[0].push([uvData[0].clone(), uvData[1].clone(), uvData[2].clone()]);
        // console.log(uvData);
      } else {
        baseGeometry.faceVertexUvs[0].push([
          new THREE.Vector2(0.0, 0.0),
          new THREE.Vector2(0.0, 1.0),
          new THREE.Vector2(1.0, 0.5)
        ]);
      }
    }
  };

  var mergeAndMapVertices = function (baseGeometry, mergeGeometry, epsilon) {
    var vertexMap = []; // Array<number>
    for (var v = 0; v < mergeGeometry.vertices.length; v++) {
      var mergeVert = mergeGeometry.vertices[v];
      var indexInBase = locateVertexInArray(baseGeometry.vertices, mergeVert, epsilon);
      if (indexInBase === -1) {
        // The current vertex cannot be found in the base geometry.
        //  -> add to geometry and remember new index.
        vertexMap.push(baseGeometry.vertices.length);
        baseGeometry.vertices.push(mergeVert.clone());
      } else {
        vertexMap.push(indexInBase);
      }
    }
    return vertexMap;
  };

  _context.mergeGeometries = mergeGeometries;
})(globalThis);
