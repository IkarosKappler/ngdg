/**
 * A collection of helper function used to generate dildo meshes.
 *
 * @require sliceGeometry
 *
 * @author   Ikaros Kappler
 * @date     2021-06-30
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @version  0.0.1-alpha
 */
import * as THREE from "three";
import { Polygon, XYCoords } from "plotboilerplate";
import { DildoOptions, IDildoGeneration, IDildoGeometry } from "./interfaces";
export declare const GeometryGenerationHelpers: {
    /**
     * Create a (right-turning) triangle of the three vertices at index A, B and C.
     *
     * The default direction (right) can be changed to left to pass `invsereFaceDirection=true`.
     *
     * @param {THREE.Geometry} geometry - The geometry to add the face to.
     * @param {number} vertIndexA
     * @param {number} vertIndexB
     * @param {number} vertIndexC
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace3: (geometry: THREE.Geometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, inverseFaceDirection?: boolean) => void;
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
     * @param {THREE.Geometry} geometry - The geometry to add the face to.
     * @param {number} vertIndexA - The first vertex index.
     * @param {number} vertIndexB - The second vertex index.
     * @param {number} vertIndexC - The third vertex index.
     * @param {number} vertIndexD - The fourth vertex index.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    makeFace4: (geometry: THREE.Geometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, vertIndexD: number, inverseFaceDirection?: boolean) => void;
    /**
     * Create texture UV coordinates for the rectangular two  triangles at matrix indices a, b, c and d.
     *
     * @param {THREE.Geometry} geometry - The geometry to add the face to.
     * @param {number} a - The first face-4 vertex index.
     * @param {number} b - The second face-4 vertex index.
     * @param {number} c - The third face-4 vertex index.
     * @param {number} d - The fourth face-4 vertex index.
     * @param {number} outlineSegmentCount - The total number of segments on the outline.
     * @param {number} baseShapeSegmentCount - The total number of segments on the base shape.
     * @param {boolean=false} inverseFaceDirection - If true then the UV mapping is applied in left winding order (instead of right which is the default).
     */
    addCylindricUV4: (geometry: THREE.Geometry, a: number, b: number, c: number, d: number, outlineSegmentCount: number, baseShapeSegmentCount: number, inverseFaceDirection?: boolean) => void;
    /**
     * Create texture UV coordinates for the triangle at matrix indices a, b and c.
     *
     * @param {THREE.Geometry} geometry - The geometry to add the new faces to.
     * @param {number} a - The current base shape segment index, must be inside [0,baseShapeSegmentCount-1].
     * @param {number} baseShapeSegmentCount - The total number of base shape segments.
     */
    addPyramidalBaseUV3: (geometry: THREE.Geometry, a: number, baseShapeSegmentCount: number) => void;
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
     * @param {THREE.Geometry} unbufferedGeometry - The geometry to slice.
     * @param {THREE.PlaneGeometry} plane
     * @return {THREE.Geometry}
     */
    makeSlice: (unbufferedGeometry: THREE.Geometry, plane: THREE.PlaneGeometry) => THREE.Geometry;
    /**
     * This function creates the cut intersection elements to fill the (open) slice meshes.
     *
     * @param {DildoGeneration} thisGenerator
     * @param {THREE.Mesh} mesh
     * @param {IDildoGeometry} unbufferedGeometry
     * @param {THREE.Plane} planeMesh
     * @returns
     */
    makeAndAddPlaneIntersection: (thisGenerator: IDildoGeneration, mesh: THREE.Mesh, unbufferedGeometry: IDildoGeometry, planeMesh: THREE.Plane, options: DildoOptions) => THREE.Vector3[];
    makeAndAddMassivePlaneIntersection: (thisGenerator: IDildoGeneration, unbufferedGeometry: IDildoGeometry) => void;
    makeAndAddHollowPlaneIntersection: (thisGenerator: IDildoGeneration, unbufferedGeometry: IDildoGeometry) => void;
    /**
     * Add an orange colored line mesh from a spine geometry..
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new mesh to.
     * @param {THREE.Geometry} spineGeometry - The spine geometry itself.
     */
    addSpine: (thisGenerator: IDildoGeneration, spineGeometry: THREE.Geometry) => void;
    /**
     * This function creates two line-meshes in red and green indicating the perpendicular cut
     * path along the geometry to be sliced.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the new two meshes to.
     * @param {DildoGeometry} unbufferedDildoGeometry - The dildo geometry to retrieve the perpendicular path from.
     */
    addPerpendicularPaths: (thisGenerator: IDildoGeneration, unbufferedDildoGeometry: IDildoGeometry) => void;
    /**
     * Add the given array of perpendicular lines (perpendicular to the mesh surface along the cut path)
     * as a THREE.LineSegments geometry.
     *
     * @param {DildoGeneration} thisGenerator - The generator to add the created line mesh to.
     * @param {Array<THREE.Line3>} perpLines - The lines to
     * @param {number} materialColor - A color for the material to use (like 0xff0000 for red).
     */
    addPerpendicularPath: (thisGenerator: IDildoGeneration, perpLines: Array<THREE.Line3>, materialColor: number) => void;
};
