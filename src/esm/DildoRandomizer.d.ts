/**
 * A helper class for generating useful randomized dildo settings.
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */
import { BezierPath, Bounds } from "plotboilerplate";
export interface DildoRandomizerResult {
    outline: BezierPath;
    bendAngle: number;
}
export declare class DildoRandomizer {
    private bounds;
    private minPathSegments;
    private maxPathSegments;
    private minBendAngle;
    private maxBendAngle;
    constructor(bounds: Bounds, minPathSegments: number, maxPathSegments: number, minBendAngle: number, maxBendAngle: number);
    next(): DildoRandomizerResult;
    private randomOutline;
    /**
     * Get a sequence of 'random' vertices inside the bounding box. The vertices will be
     * sorted along the y-axis (from max to min in the bounding box).
     *
     * @param {vertex} vertexCount - The number of desired vertices.
     * @returns {Array<Vetrex>}
     */
    private randomizedPathVertices;
    static randIntInRange(min: number, max: number): number;
    static randFloatInRange(min: number, max: number): number;
}
