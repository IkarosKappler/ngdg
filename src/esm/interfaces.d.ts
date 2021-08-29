/**
 * All custom global interfaces used in the library.
 *
 * @author  Ikaros Kappler
 * @date    2021-08-28
 * @version 1.0.0
 */
export interface DildoOptions {
    addPrecalculatedMassiveFaces?: boolean;
    addPrecalculatedHollowFaces?: boolean;
    addRawIntersectionTriangleMesh?: boolean;
    showSplitShape?: boolean;
}
export interface IDildoGeneration {
    addMesh: (mesh: THREE.Mesh | THREE.Points | THREE.LineSegments) => void;
}
export interface IDildoGeometry {
    readonly innerPerpLines: Array<THREE.Line3>;
    readonly outerPerpLines: Array<THREE.Line3>;
    getPerpendicularHullLines: () => Array<THREE.Line3>;
    getPerpendicularPathVertices: (includeBottom: boolean, getInner: boolean) => Array<THREE.Vector3>;
}
