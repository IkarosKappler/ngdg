/**
 * @author  Ikaros Kappler
 * @date    2021-07-13
 * @version 1.0.0
 **/

(function (_context) {
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
    // THREE.Vector3[]
    var result = [];
    for (var i = 0; i < vertices.length; i++) {
      if (!containsElementFrom(vertices, vertices[i], i + 1, epsilon)) {
        result.push(vertices[i]);
      }
    }
    return result;
  };

  var isCloseTo = function (vertA, vertB, eps) {
    return vertA.distanceTo(vertB) < eps;
  };

  var containsElementFrom = function (vertices, vertex, fromIndex, epsilon) {
    for (var i = fromIndex; i < vertices.length; i++) {
      if (isCloseTo(vertices[i], vertex, epsilon)) {
        return true;
      }
    }
  };

  _context.clearDuplicateVertices3 = clearDuplicateVertices3;
})(globalThis);
