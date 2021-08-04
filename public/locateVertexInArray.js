/**
 * @author  Ikaros Kappler
 * @date    2021-07-26
 * @version 1.0.0
 */

(function (_context) {
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
    for (var i in vertArray) {
      var dist = vertArray[i].distanceTo(vertex);
      if (closestIndex === -1 && dist < closestDist && dist < epsilon) {
        closestIndex = i;
        closestDist = dist;
      }
    }
    return closestIndex;
  };

  _context.locateVertexInArray = locateVertexInArray;
})(globalThis);
