/**
 * The PathFinger tool will find the connected path on a mesh surface, given by a set
 * of vertices that lay on the geometry's surface.
 *
 * Each vertex in the path elements array must be at some gometry vertex position. The position
 * does not necessarily need to be exact, some epsilon is used (default epsilon is 0.000001).
 *
 * @author   Ikaros Kappler
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @date     2021-07-06
 * @version  1.0.0
 */
export declare class PathFinder {
    /**
     * Remembers all vertex indices that were already visited.
     *
     * @member {Set<number>}
     * @memberof PathFinder
     * @type {Set<number>}
     * @instance
     */
    private visitedVertices;
    /**
     * Keeps track of all vertex indices that were not yet visited.
     *
     * @member {Set<number>}
     * @memberof PathFinder
     * @type {Set<number>}
     * @instance
     */
    private unvisitedVertIndices;
    /**
     * Count the number of already visited vertices.
     *
     * @member {number}
     * @memberof PathFinder
     * @type {number}
     * @instance
     */
    private numVisitedVertices;
    /**
     * The epsilon to use (max distance) to find 'equal' points.
     *
     * @member {number}
     * @memberof PathFinder
     * @type {number}
     * @instance
     */
    private epsilon;
    /**
     * Construct a new PathFinder.
     *
     * @param {number=0.000001} epsilon - (optional) Specity any custom epsilon here if the default epsilon is too large/small. Must be >= 0.
     */
    constructor(epsilon?: number);
    /**
     * Find all connected paths specified by the path vertex array, that lay on the geometry's surface.
     *
     * If the vertices depict more than one path, then the returned array will contain
     * multiple paths, too.
     *
     * The pathVertices array must not contain duplicates.
     *
     * @param {THREE.Geometry} unbufferedGeometry - The geometry itself containing the path vertices.
     * @param {THREE.Vector3[]} pathVertices - The unsorted vertices (must form a connected path on the geometry).
     * @return {Array<number[]>} An array of paths; each path consists of an array of path vertex indices in the `pathVertices` param.
     */
    findAllPathsOnMesh(unbufferedGeometry: THREE.Geometry, pathVertices: Array<THREE.Vector3>): Array<number[]>;
    /**
     * Find the next sequence unvisited path (indices) of vertices that are directly connected
     * via some faces on the geometry's surface.
     *
     * Be aware that path detection only works in one direction, so you will probably end up
     * in several paths that can still be connected, if you start with some random vertex
     * index.
     *
     * @param {THREE.Geometry} unbufferedGeometry - The geometry to use to find connected vertices (use it's faces).
     * @param {Array<number>} pathVertIndices - The indices of all vertices that form the path(s). Each index must match a vertex in the geometry's `vertices` array.
     * @param {number} unvisitedIndex - The path vertex (index) to start with. This can be picked randomly.
     * @returns {Array<number>} The indices of the found path in an array (index sequence).
     */
    findUnvisitedPaths(unbufferedGeometry: THREE.Geometry, pathVertIndices: Array<number>, unvisitedIndex: number): Array<number>;
    /**
     * Find the next unvisited vertex index that connects the given (unvisited) vertex
     * index of the path.
     *
     * To find that the geometry's faces will be used.
     *
     * @param {THREE.Geometry} unbufferedGeometry
     * @param {Array<number>} pathVertIndices
     * @param {number} unvisitedIndex
     * @returns {number} The next adjacent face index or -1 if none can be found.
     */
    findAdjacentFace(unbufferedGeometry: THREE.Geometry, pathVertIndices: Array<number>, unvisitedIndex: number): number;
    /**
     * Checks if the given vertex index (one of the path vertices) was already
     * marked as being visited.
     *
     * @param {number} vertIndex
     * @returns {boolean}
     */
    private isVisited;
    /**
     * Find adjacent paths and connect them.
     *
     * @param {Array<number[]>} collectedPaths
     * @param {THREE.Geometry} unbufferedGeometry
     * @param {THREE.Vector3[]} pathVertices
     * @return {Array<number[]>} A new sequence of paths (a path is an array of vertex indices).
     */
    private combineAdjacentPaths;
}
