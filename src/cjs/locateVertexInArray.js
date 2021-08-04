"use strict";
/**
 * @author   Ikaros Kappler
 * @date     2021-07-26
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.locateVertexInArray = void 0;
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
    for (var i = 0; i < vertArray.length; i++) {
        var dist = vertArray[i].distanceTo(vertex);
        if (closestIndex === -1 && dist < closestDist && dist < epsilon) {
            closestIndex = i;
            closestDist = dist;
        }
    }
    return closestIndex;
};
exports.locateVertexInArray = locateVertexInArray;
//# sourceMappingURL=locateVertexInArray.js.map