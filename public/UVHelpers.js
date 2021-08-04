/**
 * @author  Ikaros Kappler
 * @date    2021-08-03
 * @version 1.0.0
 */

(function (_context) {
  _context.UVHelpers = {
    /**
     * Helper function to create triangular UV Mappings for a triangle.
     *
     * @param {THREE.Geometry} thisGeometry
     * @param {Bounds} shapeBounds
     * @param {number} vertIndexA - The index in the geometry's vertices array.
     * @param {number} vertIndexB - ...
     * @param {number} vertIndexC - ...
     */
    makeFlatTriangleUVs: function (thisGeometry, shapeBounds, vertIndexA, vertIndexB, vertIndexC) {
      var vertA = thisGeometry.vertices[vertIndexA];
      var vertB = thisGeometry.vertices[vertIndexB];
      var vertC = thisGeometry.vertices[vertIndexC];
      // Convert a position vertex { x, y, * } to UV coordinates { u, v }
      var getUVRatios = function (vert) {
        // console.log((vert.x - shapeBounds.min.x) / shapeBounds.width, (vert.y - shapeBounds.min.y) / shapeBounds.height);
        return new THREE.Vector2(
          (vert.x - shapeBounds.min.x) / shapeBounds.width,
          (vert.y - shapeBounds.min.y) / shapeBounds.height
        );
      };
      thisGeometry.faceVertexUvs[0].push([getUVRatios(vertA), getUVRatios(vertB), getUVRatios(vertC)]);
    }
  };
})(globalThis);
