"use strict";
/**
 * @author   Ikaros Kappler
 * @date     2021-07-13
 * @modified 2021-08-04 Ported to Typescript from vainlla JS.
 * @version  1.0.1
 **/
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDuplicateVertices3 = void 0;
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
    var result = [];
    for (var i = 0; i < vertices.length; i++) {
        if (!containsElementFrom(vertices, vertices[i], i + 1, epsilon)) {
            result.push(vertices[i]);
        }
    }
    return result;
};
exports.clearDuplicateVertices3 = clearDuplicateVertices3;
/**
 * A distance checker: check if the passed to vertices are no more than 'eps' units apart.
 *
 * @param {THREE.Vector3} vertA
 * @param {THREE.Vector3} vertB
 * @param {number} eps
 * @returns {boolean}
 */
var isCloseTo = function (vertA, vertB, eps) {
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
var containsElementFrom = function (vertices, vertex, fromIndex, epsilon) {
    for (var i = fromIndex; i < vertices.length; i++) {
        if (isCloseTo(vertices[i], vertex, epsilon)) {
            return true;
        }
    }
    return false;
};
//# sourceMappingURL=clearDuplicateVertices3.js.map