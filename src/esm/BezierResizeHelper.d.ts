/**
 * A helper to resize bezier paths in horizontal and vertical orientation.
 *
 * @requires PlotBoilerplate
 * @requires BezierPath
 * @requires Vertex
 *
 * @author   Ikaros Kappler
 * @date     2021-12-01
 * @modified 2026-03-13 Ported to Typescript.
 * @version  1.1.0
 *
 */
import { BezierPath } from "plotboilerplate";
import { Vertex } from "plotboilerplate";
export declare class BezierResizeHelper {
    bezierPath: BezierPath;
    verticalResizeHandle: Vertex;
    horizontalResizeHandle: Vertex;
    private verticalResizeHandleDragStartPosition;
    private horizontalResizeHandleDragStartPosition;
    private __listeners;
    /**
     * The constructor.
     *
     * @param {PlotBoilerplate} pb
     * @param {BezierPath} bezierPath
     * @param {function} updateCallback
     */
    constructor(pb: any, bezierPath: any, updateCallback: any);
    /**
     * Destroys this helper by removing all previously installed vertex listeners.
     */
    destroy: () => void;
}
