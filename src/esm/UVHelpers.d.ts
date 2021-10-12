/**
 * @author   Ikaros Kappler
 * @date     2021-08-03
 * @modified 2021-08-04 Ported to Typsescript from vanilla JS.
 * @version  1.0.1
 */
import * as THREE from "three";
import { Bounds } from "plotboilerplate";
import { DildoBaseClass } from "./DildoGeometry";
export declare const UVHelpers: {
    /**
     * Helper function to create triangular UV Mappings for a triangle.
     *
     * @param {THREE.Geometry} thisGeometry
     * @param {Bounds} shapeBounds
     * @param {number} vertIndexA - The index in the geometry's vertices array.
     * @param {number} vertIndexB - ...
     * @param {number} vertIndexC - ...
     */
    makeFlatTriangleUVs: (thisGeometry: THREE.Geometry | DildoBaseClass, shapeBounds: Bounds, vertIndexA: number, vertIndexB: number, vertIndexC: number) => void;
};
