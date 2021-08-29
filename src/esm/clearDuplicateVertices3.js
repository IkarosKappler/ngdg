/**
 * @author   Ikaros Kappler
 * @date     2021-07-13
 * @modified 2021-08-04 Ported to Typescript from vainlla JS.
 * @version  1.0.1
 **/
const EPS = 0.000001;
/**
 * Filter the array and clear all duplicates.
 *
 * The original array is left unchanged. The vertices in the array are not cloned.
 *
 * @param {THREE.Vector3[]} vertices
 * @param {number=EPS} epsilon
 * @return {THREE.Vector3[]}
 */
export const clearDuplicateVertices3 = (vertices, epsilon) => {
    if (typeof epsilon === "undefined") {
        epsilon = EPS;
    }
    var result = [];
    for (var i = 0; i < vertices.length; i++) {
        if (!containsElementFrom(vertices, vertices[i], i + 1, epsilon)) {
            result.push(vertices[i]);
        }
    }
    return result;
};
/**
 * A distance checker: check if the passed to vertices are no more than 'eps' units apart.
 *
 * @param {THREE.Vector3} vertA
 * @param {THREE.Vector3} vertB
 * @param {number} eps
 * @returns {boolean}
 */
const isCloseTo = (vertA, vertB, eps) => {
    return vertA.distanceTo(vertB) < eps;
};
/**
 * Try to find an element in the given vertex array, starting at a given position (inclusive).
 *
 * @param {THREE.Vector3[]} vertices
 * @param {THREE.Vector3} vertex
 * @param {number} fromIndex
 * @param {number} epsilon
 * @returns {boolan}
 */
const containsElementFrom = (vertices, vertex, fromIndex, epsilon) => {
    for (var i = fromIndex; i < vertices.length; i++) {
        if (isCloseTo(vertices[i], vertex, epsilon)) {
            return true;
        }
    }
    return false;
};
//# sourceMappingURL=clearDuplicateVertices3.js.map