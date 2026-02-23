/**
 * This is the central class for generating dildo base geometries.
 *
 * @require ThreeGeometryHellfix.Gmetry
 *
 * @author   Ikaros Kappler
 * @date     2020-07-08
 * @modified 2021-06-11 Fixing top and bottom points; preparing slicing of mesh.
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry (and Face3).
 * @version  1.0.3
 **/
import { Bounds, Polygon, Vertex } from "plotboilerplate";
import * as THREE from "three";
import { ExtendedDildoOptions } from "./interfaces";
import { Gmetry } from "three-geometry-hellfix/src/cjs";
export declare class DildoGeometry extends Gmetry {
    vertexMatrix: Array<Array<number>>;
    topIndex: number;
    bottomIndex: number;
    spineVertices: Array<THREE.Vector3>;
    outerPerpLines: Array<THREE.Line3>;
    innerPerpLines: Array<THREE.Line3>;
    flatSidePolygon: Polygon;
    leftFlatIndices: Array<number>;
    rightFlatIndices: Array<number>;
    leftFlatTriangleIndices: Array<[number, number, number]>;
    rightFlatTriangleIndices: Array<[number, number, number]>;
    flatSideBounds: Bounds;
    hollowBottomEdgeVertIndices: Array<number>;
    hollowBottomTriagles: Array<[number, number, number]>;
    dildoNormals: Array<Array<THREE.Vector3>>;
    /**
     * Create a new dildo geometry from the passed options..
     *
     * @param {Polygon} options.baseShape - The base shape to use (this is usually some regular polygon).
     * @param {BezierPath} options.outline - The lathe outline to use.
     * @param {number} options.bendAngle - A bend angle (in degrees!). Will only be applied if isBending=true.
     * @param {number} options.outlineSegmentCount (>= 2).
     * @param {boolean} options.isBending - Switch bending on/off no matter what the bend angle says.
     * @param {boolean} options.makeHollow - Make a hollow mold.
     **/
    constructor(options: ExtendedDildoOptions);
    /**
     *
     * @param {Polygon} baseShape
     * @param {Vertex} shapeCenter
     * @param {Bounds} outlineBounds
     * @param {THREE.Vector3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @param {number=0} shapeTwistAngle - The angle to twist this particular shape around the y axis.
     * @return { yMin: number, yMax : number }
     */
    private __buildSlice;
    /**
     *
     * @param {Polygon} baseShape
     * @param {Vertex} shapeCenter
     * @param {Bounds} outlineBounds
     * @param {THREE.Vertex3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @return { yMin: number, yMax : number }
     */
    private __buildSpine;
    /**
     *
     * @param {Polygon} baseShape
     * @param {Bounds} outlineBounds
     * @param {THREE.Vertex3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @return { yMin: number, yMax : number }
     */
    __buildPerps(baseShape: Polygon, outlineBounds: Bounds, outlineVert: Vertex, // THREE.Vector3?
    perpendicularVert: Vertex, heightT: number, isBending: boolean, bendAngle: number, arcRadius: number, normalizePerpendiculars: boolean, normalsLength: number): void;
    /**
     * Pre: perpLines are already built.
     *
     * Note: the last indices in the array will show to the point equivalent to the bottom point.
     *
     * @param {*} options
     */
    __makeFlatSideVertices(shapeRadius: any): void;
    /**
     * Pre: perpLines are already built.
     *
     * Note: the last indices in the array will show to the point equivalent to the bottom point.
     *
     * @param {*}
     */
    private __makeFlatSideFaces;
    getPerpendicularPathVertices(includeBottomVert: boolean, getInner?: boolean): THREE.Vector3[];
    getPerpendicularHullLines(): THREE.Line3[];
    /**
     * Construct the top vertex that's used to closed the cylinder geometry at the top.
     *
     * @param {plotboilerplate.Bounds} outlineBounds
     * @param {boolean} isBending
     * @param {number|NaN|undefined} bendAngle
     * @param {number|undefined} arcRadius
     * @returns THREE.Vector
     */
    _getTopVertex(outlineBounds: Bounds, isBending: boolean, bendAngle: number, arcRadius: number): THREE.Vector3;
    /**
     * Construct the bottom vertex that's used to closed the cylinder geometry at the bottom.
     *
     * @param {plotboilerplate.Bounds} outlineBounds
     * @returns THREE.Vector
     */
    _getBottomVertex(outlineBounds: Bounds): THREE.Vector3;
    /**
     * A helper function to 'bend' a vertex position around the desired bend axis (angle + radius).
     * @private
     * @param {THREE.Vector3} vert
     * @param {number} bendAngle
     * @param {number} arcRadius
     * @param {number} heightT
     */
    _bendVertex(vert: THREE.Vector3, bendAngle: number, arcRadius: number, heightT: number): void;
    applyBumpMap(bumpMapTexture: THREE.Texture): void;
    /**
     * Build up the faces for this geometry.
     * @param {ExtendedDildoOptions} options
     */
    private _buildFaces;
    _buildHollowBottomFaces(): void;
    /**
     * Build the face and the top or bottom end of the geometry. Imagine the dildo geometry
     * as a closed cylinder: this function created the top or the bottom 'circle'.
     *
     * @param {number} endVertexIndex - This should be `this.topIndex` or `this.bottomIndex`.
     * @param {number} shapeIndex - This should be `0` (top) or `outlineSegmentCount-1` (bottom).
     * @param {number} baseShapeSegmentCount - The number of shape segments.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    _buildEndFaces(endVertexIndex: number, shapeIndex: number, baseShapeSegmentCount: number, inverseFaceDirection: boolean): void;
    /**
     * Pre: flatSides are made
     */
    private __makeBackFrontFaces;
    /**
     * Build the texture UV mapping for all faces.
     *
     * @param {ExtendedDildoOptions} options
     */
    private _buildUVMapping;
    /**
     * Build a triangulated face4 (two face3) for the given matrix index pairs. The method will create
     * two right-turning triangles.
     *
     * <pre>
     *       (a,b)---(c,b)
     *         |    /  |
     *         |   /   |
     *         |  /    |
     *       (a,d)---(c,d)
     * </pre>
     *
     * @param {number} a - The first primary index in the `vertexMatrix` array.
     * @param {number} b - The first seconday index in the `vertexMatrix[a]` array.
     * @param {number} c - The second primary index in the `vertexMatrix` array.
     * @param {number} d - The second seconday index in the `vertexMatrix[c]` array.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    addFace4ByIndices(a: number, b: number, c: number, d: number, inverseFaceDirection: boolean): void;
    /**
     * Build up the vertices in this geometry.
     *
     * @param {} options
     */
    private _buildVertices;
    private __applyBumpmap;
}
