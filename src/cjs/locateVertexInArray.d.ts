/**
 * @author   Ikaros Kappler
 * @date     2021-07-26
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @version  1.0.1
 */
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
export declare const locateVertexInArray: (vertArray: Array<THREE.Vector3>, vertex: THREE.Vector3, epsilon: number) => number;
