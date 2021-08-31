/**
 * All custom global interfaces used in the library.
 *
 * @author  Ikaros Kappler
 * @date    2021-08-28
 * @version 1.0.0
 */
import { BezierPath, Polygon } from "plotboilerplate";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export interface DildoGenerationOptions {
    makeOrbitControls: (camera: THREE.Camera, domElement: HTMLCanvasElement) => OrbitControls;
}
export interface DildoOptions {
    outlineSegmentCount: number;
    shapeSegmentCount: number;
    bendAngle: number;
    closeTop: boolean;
    closeBottom: boolean;
    showNormals: boolean;
    normalsLength: number;
    normalizePerpendiculars: boolean;
    useTextureImage: boolean;
    textureImagePath: string;
    wireframe: boolean;
    performSlice: boolean;
    makeHollow: boolean;
    hollowStrengthX: number;
    renderFaces: "double" | "front" | "back";
    twistAngle: number;
    baseShapeExcentricity: number;
    closeCutAreas: boolean;
    previewBumpmap: boolean;
    useBumpmap: boolean;
    bumpmapStrength: number;
    showBasicPerpendiculars: boolean;
    addSpine: boolean;
    showSplitPane: boolean;
    showLeftSplit: boolean;
    showRightSplit: boolean;
    showSplitShape: boolean;
    showSplitShapeTriangulation: boolean;
    addPrecalculatedMassiveFaces: boolean;
    addPrecalculatedHollowFaces: boolean;
    addRawIntersectionTriangleMesh: boolean;
    addPrecalculatedShapeOutlines: boolean;
}
export interface ExtendedDildoOptions extends DildoOptions {
    baseShape: Polygon;
    bumpmapTexture?: THREE.Texture;
    isBending: boolean;
    outline: BezierPath;
}
export interface IDildoGeneration {
    partialResults: Record<string, object>;
    addMesh: (mesh: THREE.Mesh | THREE.Points | THREE.LineSegments) => void;
}
export interface IDildoGeometry {
    vertices: Array<THREE.Vector3>;
    faces: Array<THREE.Face3>;
    faceVertexUvs: Array<Array<[THREE.Vector2, THREE.Vector2, THREE.Vector2]>>;
    uvsNeedUpdate: boolean;
    buffersNeedUpdate: boolean;
    spineVertices: Array<THREE.Vector3>;
    dildoNormals: Array<Array<THREE.Vector3>>;
    readonly innerPerpLines: Array<THREE.Line3>;
    readonly outerPerpLines: Array<THREE.Line3>;
    getPerpendicularHullLines: () => Array<THREE.Line3>;
    getPerpendicularPathVertices: (includeBottom: boolean, getInner: boolean) => Array<THREE.Vector3>;
}
export interface ExportOptions {
    onComplete?: (data: string) => void;
}
