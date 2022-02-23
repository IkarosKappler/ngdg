/**
 * A collection of helper function used to generate dildo meshes.
 *
 * @require sliceGeometry
 *
 * @author   Ikaros Kappler
 * @date     2021-06-30
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.1
 */
import * as THREE from "three";
import { Polygon, XYCoords } from "plotboilerplate";
import { Gmetry } from "three-geometry-hellfix";
import { DildoOptions, IDildoGeneration } from "./interfaces";
import { DildoGeometry } from "./DildoGeometry";
import { BufferGeometry, Vector3 } from "three";
export declare const GeometryGenerationHelpers: {
    /**
     * Create a (right-turning) triangle of the three vertices at index A, B and C.
     *
     * The default direction (right) can be changed to left to pass `invsereFaceDirection=true`.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the face to.
     * @param {number} vertIndexA
     * @param {number} vertIndexB
     * @param {number} vertIndexC
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace3: (geometry: Gmetry | DildoGeometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, inverseFaceDirection?: boolean) => void;
    /**
     * Build a triangulated face4 (two face3) for the given vertex indices. The method will create
     * two right-turning triangles by default, or two left-turning triangles if `inverseFaceDirection`.
     *
     * <pre>
     *         A-----B
     *         |   / |
     *         |  /  |
     *         | /   |
     *         C-----D
     * </pre>
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the face to.
     * @param {number} vertIndexA - The first vertex index.
     * @param {number} vertIndexB - The second vertex index.
     * @param {number} vertIndexC - The third vertex index.
     * @param {number} vertIndexD - The fourth vertex index.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace4: (geometry: Gmetry | DildoGeometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, vertIndexD: number, inverseFaceDirection?: boolean) => void;
    /**
     * Create texture UV coordinates for the rectangular two  triangles at matrix indices a, b, c and d.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the face to.
     * @param {number} a - The first face-4 vertex index.
     * @param {number} b - The second face-4 vertex index.
     * @param {number} c - The third face-4 vertex index.
     * @param {number} d - The fourth face-4 vertex index.
     * @param {number} outlineSegmentCount - The total number of segments on the outline.
     * @param {number} baseShapeSegmentCount - The total number of segments on the base shape.
     * @param {boolean=false} inverseFaceDirection - If true then the UV mapping is applied in left winding order (instead of right which is the default).
     */
    addCylindricUV4: (geometry: Gmetry | DildoGeometry, a: number, b: number, c: number, d: number, outlineSegmentCount: number, baseShapeSegmentCount: number, inverseFaceDirection?: boolean) => void;
    /**
     * Create texture UV coordinates for the triangle at matrix indices a, b and c.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The geometry to add the new faces to.
     * @param {number} a - The current base shape segment index, must be inside [0,baseShapeSegmentCount-1].
     * @param {number} baseShapeSegmentCount - The total number of base shape segments.
     */
    addPyramidalBaseUV3: (geometry: Gmetry | DildoGeometry, a: number, baseShapeSegmentCount: number) => void;
    /**
     * Flatten an array of 2d vertices into a flat array of coordinates.
     * (required by the earcut algorithm for example).
     *
     * @param {Array<XYCoords>} vertices2d
     * @returns {Array<number>}
     */
    flattenVert2dArray: (vertices2d: Array<XYCoords>) => Array<number>;
    /**
     * A helper function to create (discrete) circular 2d shapes.
     *
     * @param {number} radius - The radius of the circle.
     * @param {number} pointCount - The number of vertices to construct the circle with.
     * @param {number=1.0} excentricity - To create ellipses (default is 1.0).
     * @returns {Polygon}
     */
    mkCircularPolygon: (radius: number, pointCount: number, excentricity?: number) => Polygon;
    /**
     * Slice a geometry at the given plane and add the remaining part(s).
     *
     * Note that only the right half (on the positive z axis) is kept. To obtain both you
     * need to run the algorithm twice with two flipped planes.
     *
     * Note also that the mesh is open at the cut plane.
     *
     * @param {ThreeGeometryHellfix.Gmetry} unbufferedGeometry - The geometry to slice.
     * @param {THREE.Plane} plane PlaneGeometry???
     * @return {ThreeGeometryHellfix.Gmetry}
     */
    makeSlice: (unbufferedGeometry: Gmetry | DildoGeometry, plane: THREE.Plane) => Gmetry;
    /**
     * This function creates the cut intersection elements to fill the (open) slice meshes.
     *
     * @param {DildoGeneration} thisGenerator
     * @param {THREE.Mesh} mesh
     * @param {IDildoGeometry} unbufferedGeometry
     * @param {THREE.Plane} planeGeometry
     * @returns
     */
    makeAndAddPlaneIntersection: (thisGenerator: IDildoGeneration, mesh: THREE.Mesh, unbufferedGeometry: DildoGeometry, planeGeometry: THREE.Mesh, planeGeometryReal: THREE.PlaneGeometry, options: DildoOptions) => THREE.Vector3[];
    makeAndAddMassivePlaneIntersection: (thisGenerator: IDildoGeneration, unbufferedGeometry: DildoGeometry) => void;
    makeAndAddHollowPlaneIntersection: (thisGenerator: IDildoGeneration, unbufferedGeometry: DildoGeometry) => void;
    /**
     * Add an orange colored line mesh from a spine geometry..
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new mesh to.
     * @param {ThreeGeometryHellfix.Gmetry} spineGeometry - The spine geometry itself.
     */
    addSpine: (thisGenerator: IDildoGeneration, spineGeometry: THREE.BufferGeometry) => void;
    /**
     * This function creates two line-meshes in red and green indicating the perpendicular cut
     * path along the geometry to be sliced.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new two meshes to.
     * @param {DildoGeometry} unbufferedDildoGeometry - The dildo geometry to retrieve the perpendicular path from.
     */
    addPerpendicularPaths: (thisGenerator: IDildoGeneration, unbufferedDildoGeometry: DildoGeometry) => void;
    /**
     * Add the given array of perpendicular lines (perpendicular to the mesh surface along the cut path)
     * as a THREE.LineSegments geometry.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the created line mesh to.
     * @param {Array<THREE.Line3>} perpLines - The lines to
     * @param {number} materialColor - A color for the material to use (like 0xff0000 for red).
     */
    addPerpendicularPath: (thisGenerator: IDildoGeneration, perpLines: Array<THREE.Line3>, materialColor: number) => void;
    /**
     * Make a triangulation of the given path specified by the verted indices.
     *
     * @param {Array<number>} connectedPath - An array of vertex indices.
     * @return {ThreeGeometryHellfix.Gmetry} trianglesMesh
     */
    makePlaneTriangulation: (generator: IDildoGeneration, sliceGeometry: Gmetry, connectedPath: number[], options: DildoOptions) => Gmetry;
    /**
     * Normalize a 2D vector to a given length.
     *
     * @param {XYCoords} base - The start point.
     * @param {XYCoords} extend - The end point.
     * @param {number} normalLength - The desired length
     */
    normalizeVectorXY: (base: any, extend: any, normalLength: any) => void;
    /**
     * Normalize a 2D vector to a given length.
     *
     * @param {XYCoords} base - The start point.
     * @param {XYCoords} extend - The end point.
     * @param {number} normalLength - The desired length
     */
    normalizeVectorXYZ: (base: THREE.Vector3, extend: THREE.Vector3, normalLength: number) => void;
    /**
     * A helper function to clear all child nodes from the given HTML DOM node.
     *
     * @param {HTMLElement} rootNoode
     */
    removeAllChildNodes: (rootNode: HTMLElement) => void;
    /**
     * Clamp the given number into the passed min-max interval.
     *
     * @param {number} n
     * @param {number} min
     * @param {number} max
     * @returns
     */
    clamp: (n: number, min: number, max: number) => number;
    verticesToBufferGeometry: (vertices: THREE.Vector3[]) => THREE.BufferGeometry;
    /**
     * Rotate a 3d vertex around its z axsis.
     *
     * @param {THREE.Vector3} vert - The vertex to rotate (in-place).
     * @param {number} angle - The angle to rotate abount (in radians).
     * @param {number} xCenter - The x component of the z axis to rotate around.
     * @param {number} yCenter - The y component of the z axis to rotate around.
     * @returns {THREE.Vector3} The vertex itself (for chaining).
     */
    rotateVert: (vert: Vector3, angle: number, xCenter: number, yCenter: number) => THREE.Vector3;
    /**
     * Rotate a 3d vector around the y axis (up-down-axis).
     *
     * @param {THREE.Vector3} vert
     * @param {THREE.Vector3} angle
     * @param {number} xCenter
     * @param {number} zCenter
     * @returns
     */
    rotateVertY: (vert: Vector3, angle: number, xCenter: number, zCenter: number) => THREE.Vector3;
};
