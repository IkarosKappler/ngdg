"use strict";
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
 * @author  Ikaros Kappler
 * @date    2021-08-31
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeVertexNormals = void 0;
var THREE = require("three");
// export const computeVertexNormals = (geometry: THREE.Geometry | IDildoGeometry): Array<THREE.Line3> => {
//   // Iterate through all faces and collect the face normals for each vertex
//   const collectedVertNormals: Array<THREE.Vector3[]> = collectVertexNormals(geometry);
//   const normals: Array<THREE.Line3> = new Array<THREE.Line3>(geometry.vertices.length);
//   //   console.log("collectedVertNormals", collectedVertNormals);
//   for (var i = 0; i < geometry.vertices.length; i++) {
//     const averageNormal: THREE.Vector3 = computeAverageVector(collectedVertNormals[i]);
//     normals[i] = new THREE.Line3(geometry.vertices[i], averageNormal);
//   }
//   return normals;
// };
var computeVertexNormals = function (unbufferedGeometry, bufferedGeometry) {
    var vertexNormals = bufferedGeometry.getAttribute("normal");
    console.log("normals", vertexNormals);
    console.log("unbufferedGeometry.vertices.length", unbufferedGeometry.vertices.length, "unbufferedGeometry.faces.length", unbufferedGeometry.faces.length, "vertexNormals.array.length/3", vertexNormals.array.length / 3);
    var collectedFaceNormals = Array(unbufferedGeometry.faces.length);
    for (var f = 0; f < unbufferedGeometry.faces.length; f++) {
        var face = unbufferedGeometry.faces[f];
        var faceNormalA = new THREE.Vector3(vertexNormals.array[f * 9 + 0], vertexNormals.array[f * 9 + 1], vertexNormals.array[f * 9 + 2]);
        var faceNormalB = new THREE.Vector3(vertexNormals.array[f * 9 + 3], vertexNormals.array[f * 9 + 4], vertexNormals.array[f * 9 + 5]);
        var faceNormalC = new THREE.Vector3(vertexNormals.array[f * 9 + 6], vertexNormals.array[f * 9 + 7], vertexNormals.array[f * 9 + 8]);
        addVertexNormal(collectedFaceNormals, face.a, faceNormalA);
        addVertexNormal(collectedFaceNormals, face.b, faceNormalB);
        addVertexNormal(collectedFaceNormals, face.c, faceNormalC);
    } // END for
    console.log("collectedFaceNormals", collectedFaceNormals);
    var normals = new Array(unbufferedGeometry.vertices.length);
    for (var i = 0; i < unbufferedGeometry.vertices.length; i++) {
        var averageNormal = computeAverageVector(collectedFaceNormals[i]);
        averageNormal.add(unbufferedGeometry.vertices[i]);
        normals[i] = new THREE.Line3(unbufferedGeometry.vertices[i], averageNormal);
    }
    return normals;
};
exports.computeVertexNormals = computeVertexNormals;
var addVertexNormal = function (buffer, vertIndex, vertexNormal) {
    if (vertIndex >= buffer.length || typeof buffer[vertIndex] === "undefined") {
        buffer[vertIndex] = [];
    }
    buffer[vertIndex].push(vertexNormal);
};
var computeAverageVector = function (normals) {
    var avg = new THREE.Vector3(0, 0, 0);
    if (normals) {
        normals.forEach(function (nrml) {
            avg.add(nrml);
        });
        avg.divideScalar(normals.length);
    }
    return avg;
};
//# sourceMappingURL=computeVertexNormals.js.map