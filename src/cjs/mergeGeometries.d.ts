/**
 * Merge one geometry (all vertices and faces) into the other.
 *
 * @require locateVertexInArray
 *
 * @author   Ikaros Kappler
 * @date     2021-07-26
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @version  1.0.0
 */
import { Geometry } from "three/examples/jsm/deprecated/Geometry";
/**
 * This function tries to merge the 'mergeGeometry' into the 'baseGeometry'.
 * It assumes that both geometries are somehow connected, so it will try to
 * local equal vertices first instead of just copying all 'mergeGeometry' vertices
 * into the other one.
 *
 * The merged vertices will be cloned.
 *
 * @param {THREE.Geometry} baseGeometry
 * @param {THREE.Geometry} mergeGeometry
 */
export declare const mergeGeometries: (baseGeometry: Geometry, mergeGeometry: Geometry, epsilon?: number) => void;
