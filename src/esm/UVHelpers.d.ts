/**
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
     * Helper function to create triangular UV Mappings for a triangle.
     *
     * @param {ThreeGeometryHellfix.Gmetry} thisGeometry
     * @param {Bounds} shapeBounds
     * @param {number} vertIndexA - The index in the geometry's vertices array.
     * @param {number} vertIndexB - ...
     * @param {number} vertIndexC - ...
     */
    makeFlatTriangleUVs: (thisGeometry: Gmetry | DildoGeometry, shapeBounds: Bounds, vertIndexA: number, vertIndexB: number, vertIndexC: number) => void;
};
