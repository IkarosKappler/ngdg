/**
 * Calculate the vertex normals of a mesh from the pre-calculated face normals.
 *
 * jkmott writing about this challenge:
 *   >> If you have a large complex mesh with small faces you can get away with
 *   >> computing the vertex normals by taking the average of the face normals
 *   >> that surround it, and that’s a fine strategy.
 *
 * https://meshola.wordpress.com/2016/07/24/three-js-vertex-normals/
 *
 * @author   Ikaros Kappler
 * @date     2021-08-31
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.1
 */
import * as THREE from "three";
/**
 * Compute the vertex normals of a base geometry and its buffered counterpart (both parts are required here).
 *
 * Note that unbufferedGeometry.computeVertexNormals() must have been called for this to work.
 *
 * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The base geometry.
 * @param {THREE.BufferedGeometry} bufferedGeometry - The buffered geometry.
 * @returns
 */
export const computeVertexNormals = (unbufferedGeometry, bufferedGeometry) => {
    // Fetch the face normals from the buffers.
    const vertexNormals = bufferedGeometry.getAttribute("normal");
    const collectedFaceNormals = Array(unbufferedGeometry.faces.length);
    // For each face get the three face normals, each of which consists of 3 float values itself.
    // So each face consumes 9 floats from the array buffer.
    for (var f = 0; f < unbufferedGeometry.faces.length; f++) {
        const face = unbufferedGeometry.faces[f];
        var faceNormalA = new THREE.Vector3(vertexNormals.array[f * 9 + 0], vertexNormals.array[f * 9 + 1], vertexNormals.array[f * 9 + 2]);
        var faceNormalB = new THREE.Vector3(vertexNormals.array[f * 9 + 3], vertexNormals.array[f * 9 + 4], vertexNormals.array[f * 9 + 5]);
        var faceNormalC = new THREE.Vector3(vertexNormals.array[f * 9 + 6], vertexNormals.array[f * 9 + 7], vertexNormals.array[f * 9 + 8]);
        addVertexNormal(collectedFaceNormals, face.a, faceNormalA);
        addVertexNormal(collectedFaceNormals, face.b, faceNormalB);
        addVertexNormal(collectedFaceNormals, face.c, faceNormalC);
    } // END for
    //   console.log("collectedFaceNormals", collectedFaceNormals);
    const normals = new Array(unbufferedGeometry.vertices.length);
    for (var i = 0; i < unbufferedGeometry.vertices.length; i++) {
        const averageNormal = computeAverageVector(collectedFaceNormals[i]);
        averageNormal.add(unbufferedGeometry.vertices[i]);
        normals[i] = new THREE.Line3(unbufferedGeometry.vertices[i], averageNormal);
    }
    return normals;
};
/**
 * Add the computed face normal to the given vertex normal buffer.
 *
 * Each vertex normal buffer ends up with multiple face normals associated with it (from the
 * adjacent faces). The aim is to calculate the average vector from all.
 *
 * @param {Array<THREE.Vector3[]>} buffer
 * @param {number} vertIndex
 * @param {THREE.Vector3} vertexNormal
 */
const addVertexNormal = (buffer, vertIndex, vertexNormal) => {
    if (vertIndex >= buffer.length || typeof buffer[vertIndex] === "undefined") {
        buffer[vertIndex] = [];
    }
    buffer[vertIndex].push(vertexNormal);
};
/**
 * Compute the average vector from a sequence of (nromal) vectors.
 *
 * @param {Array<THREE.Vector3>} vectors - The vectors to get the average vector for.
 * @returns {THREE.Vector3} The average vector from all given.
 */
const computeAverageVector = (vectors) => {
    const avg = new THREE.Vector3(0, 0, 0);
    if (vectors) {
        vectors.forEach((nrml) => {
            avg.add(nrml);
        });
        avg.divideScalar(vectors.length);
    }
    return avg;
};
//# sourceMappingURL=computeVertexNormals.js.map