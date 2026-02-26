/**
 * @date 2026-02-26
 */
import { BezierPath, Polygon, Vertex } from "plotboilerplate";
export interface IDildoSilhouette2DProps {
    baseShape: Polygon;
    outline: BezierPath;
    outlineSegmentCount: number;
    bendAngleRad: number;
    bendAngleDeg: number;
    isBending: boolean;
}
export declare class DildoSilhouette2D {
    leftPathVertices: Vertex[];
    rightPathVertices: Vertex[];
    constructor(props: IDildoSilhouette2DProps);
}
