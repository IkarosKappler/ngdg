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
    showBumpmapTargets: boolean;
    bumpmap?: IBumpmap;
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
    topIndex: number;
    vertexMatrix: Array<Array<number>>;
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
export interface Dimension {
    width: number;
    height: number;
}
/**
 * A bumpmap stores height information for any rectangular vertex mesh (spheres, cylinders, lathes, dildos, ...).
 */
export interface IBumpmap {
    /**
     * Get the bumpmap's height-value at the given relative coordinates.
     *
     * @param {number} ratioX - A value for the horizontal position, must be in [0..1].
     * @param {number} ratioY - A value for the vertical position, must be in [0..1].
     * @return {number} The bumpmap's height value in the range [0..1].
     */
    getHeightAt(ratioX: number, ratioY: number): number;
    /**
     * Get a preview image to use in the DOM.
     *
     * @return {HTMLImageElement}
     */
    createPreviewImage(): HTMLImageElement;
    /**
     * Get the dimension of the bumpmap (number of columns and number of rows).
     *
     * @return {Dimension}
     */
    getDimension(): Dimension;
}
