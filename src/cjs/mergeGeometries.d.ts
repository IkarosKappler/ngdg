/**
 * Merge one geometry (all vertices and faces) into the other.
 *
 * @require locateVertexInArray
 *
 * @author   Ikaros Kappler
 * @date     2021-07-26
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry (and so Face3).
 * @version  1.0.1
 */
import { Gmetry } from "three-geometry-hellfix";
/**
 * This function tries to merge the 'mergeGeometry' into the 'baseGeometry'.
 * It assumes that both geometries are somehow connected, so it will try to
 * local equal vertices first instead of just copying all 'mergeGeometry' vertices
 * into the other one.
 *
 * The merged vertices will be cloned.
 *
 * @param {ThreeGeometryHellfix.Gmetry} baseGeometry
 * @param {ThreeGeometryHellfix.Gmetry} mergeGeometry
 */
export declare const mergeGeometries: (baseGeometry: Gmetry, mergeGeometry: Gmetry, epsilon?: number) => void;
/**
 * This function merges the vertices from a given geometry into a base geometry.
 * It will ty to locate existing vertices within an epsilon range and keep those. Vertices that
 * have no close existing counterpart in the base geometry will be added.
 *
 * The function returns a mapping of new/merged vertices inside the base geometry, showing
 * which vertex (index) was mapped whereto.
 *
 * @param {THREE-Geometry} baseGeometry
 * @param {THREE-Geometry} mergeGeometry
 * @param {number} epsilon
 * @returns Array<number>
 */
export declare const mergeAndMapVertices: (baseGeometry: Gmetry, mergeGeometry: Gmetry, epsilon: number) => Array<number>;
