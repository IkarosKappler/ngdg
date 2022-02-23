/**
 * UV coordinate helper functions.
 *
 * @author   Ikaros Kappler
 * @date     2021-08-03
 * @modified 2021-08-04 Ported to Typsescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.2
 */
import { Bounds } from "plotboilerplate";
import { Gmetry } from "three-geometry-hellfix";
import { DildoGeometry } from "./DildoGeometry";
export declare const UVHelpers: {
    /**
     * Helper function to create triangular UV Mappings for a triangle. The passed shape bounds
     * will be used as reference rectangle.
     *
     * Not that the bounds should contain all triangle vertices; otherwise the generated
     * UV coordinated will be out of bounds (less than 0.0 or larger than 1.0) and might not be
     * rendered properly.
     *
     * The new UV coordinates will be added to the end of the geometry's `faceVertexUvs` array.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The base geometry to add the UV coordinates to.
     * @param {Bounds} shapeBounds - The reference bounds.
     * @param {number} vertIndexA - The triangle's first index in the geometry's vertices array.
     * @param {number} vertIndexB - The triangle's second index in the geometry's vertices array.
     * @param {number} vertIndexC - The triangle's third index in the geometry's vertices array.
     */
    makeFlatTriangleUVs: (geometry: Gmetry | DildoGeometry, shapeBounds: Bounds, vertIndexA: number, vertIndexB: number, vertIndexC: number) => void;
    /**
     *
     * @param {ThreeGeometryHellfix.Gmetry} thisGeometry
     * @param {Array<number>} containingPolygonIndices
     * @param {Array<[number,number,number]>} triangles
     */
    makeHollowBottomUVs: (thisGeometry: Gmetry, containingPolygonIndices: Array<number>, triangles: Array<[number, number, number]>) => void;
};
