/**
 * Compute the intersection of a mesh and a plane.
 *
 * Inspired by
 *    https://stackoverflow.com/questions/42348495/three-js-find-all-points-where-a-mesh-intersects-a-plane
 *    https://jsfiddle.net/prisoner849/8uxw667m/
 *
 * @co-author Ikaros Kappler
 * @date 2021-06-11
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @version 1.0.0
 */
import * as THREE from "three";
export declare class PlaneMeshIntersection {
    pointsOfIntersection: Array<THREE.Vector3>;
    a: THREE.Vector3;
    b: THREE.Vector3;
    c: THREE.Vector3;
    planePointA: THREE.Vector3;
    planePointB: THREE.Vector3;
    planePointC: THREE.Vector3;
    lineAB: THREE.Line3;
    lineBC: THREE.Line3;
    lineCA: THREE.Line3;
    pointOfIntersection: THREE.Vector3;
    /**
     * Constructor.
     */
    constructor();
    /**
     *
     * @param {THREE.Mesh} mesh
     * @param {THREE.Geometry} geometry
     * @param {THREE.PlaneGeometry} plane
     * @returns {Array<THREE.Vector3>}
     */
    getIntersectionPoints: (mesh: any, geometry: any, plane: any) => Array<THREE.Vector3>;
    private __setPointOfIntersection;
}
