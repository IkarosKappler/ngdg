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
export declare const computeVertexNormals: (unbufferedGeometry: THREE.Geometry, bufferedGeometry: THREE.BufferGeometry) => Array<THREE.Line3>;
