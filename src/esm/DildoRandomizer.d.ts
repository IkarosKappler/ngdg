/**
 * A helper class for generating useful randomized dildo settings.
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */
import { BezierPath, Bounds } from "plotboilerplate";
export declare class DildoRandomizer {
    private bounds;
    private minPathSegments;
    private maxPathSegments;
    constructor(bounds: Bounds, minPathSegments: number, maxPathSegments: number);
    next(): {
        outline: BezierPath;
    };
    private randomPathVertices;
    static randIntInRange(min: number, max: number): number;
    static randFloatInRange(min: number, max: number): number;
}
