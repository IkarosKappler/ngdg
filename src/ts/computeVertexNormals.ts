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

import * as THREE from "three";

/**
 * Compute the vertex normals of a base geometry and its buffered counterpart (both parts are required here).
 *
 * Note that unbufferedGeometry.computeVertexNormals() must have been called for this to work.
 *
 * @param {THREE.Geometry} unbufferedGeometry - The base geometry.
 * @param {THREE.BufferedGeometry} bufferedGeometry - The buffered geometry.
 * @returns
 */
export const computeVertexNormals = (
  unbufferedGeometry: THREE.Geometry,
  bufferedGeometry: THREE.BufferGeometry
): Array<THREE.Line3> => {
  // Fetch the face normals from the buffers.
  const vertexNormals: THREE.BufferAttribute | THREE.InterleavedBufferAttribute = bufferedGeometry.getAttribute("normal");
  //   console.log("normals", vertexNormals);
  //   console.log(
  //     "unbufferedGeometry.vertices.length",
  //     unbufferedGeometry.vertices.length,
  //     "unbufferedGeometry.faces.length",
  //     unbufferedGeometry.faces.length,
  //     "vertexNormals.array.length/3",
  //     vertexNormals.array.length / 3
  //   );
  const collectedFaceNormals: Array<THREE.Vector3[]> = Array<THREE.Vector3[]>(unbufferedGeometry.faces.length);
  // For each face get the three face normals, each of which consists of 3 float values itself.
  // So each face consumes 9 floats from the array buffer.
  for (var f = 0; f < unbufferedGeometry.faces.length; f++) {
    const face = unbufferedGeometry.faces[f];
    var faceNormalA: THREE.Vector3 = new THREE.Vector3(
      vertexNormals.array[f * 9 + 0],
      vertexNormals.array[f * 9 + 1],
      vertexNormals.array[f * 9 + 2]
    );
    var faceNormalB: THREE.Vector3 = new THREE.Vector3(
      vertexNormals.array[f * 9 + 3],
      vertexNormals.array[f * 9 + 4],
      vertexNormals.array[f * 9 + 5]
    );
    var faceNormalC: THREE.Vector3 = new THREE.Vector3(
      vertexNormals.array[f * 9 + 6],
      vertexNormals.array[f * 9 + 7],
      vertexNormals.array[f * 9 + 8]
    );
    addVertexNormal(collectedFaceNormals, face.a, faceNormalA);
    addVertexNormal(collectedFaceNormals, face.b, faceNormalB);
    addVertexNormal(collectedFaceNormals, face.c, faceNormalC);
  } // END for
  //   console.log("collectedFaceNormals", collectedFaceNormals);
  const normals: Array<THREE.Line3> = new Array<THREE.Line3>(unbufferedGeometry.vertices.length);
  for (var i = 0; i < unbufferedGeometry.vertices.length; i++) {
    const averageNormal: THREE.Vector3 = computeAverageVector(collectedFaceNormals[i]);
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
const addVertexNormal = (buffer: Array<THREE.Vector3[]>, vertIndex: number, vertexNormal: THREE.Vector3): void => {
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
const computeAverageVector = (vectors: Array<THREE.Vector3> | undefined): THREE.Vector3 => {
  const avg: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  if (vectors) {
    vectors.forEach((nrml: THREE.Vector3) => {
      avg.add(nrml);
    });
    avg.divideScalar(vectors.length);
  }
  return avg;
};
