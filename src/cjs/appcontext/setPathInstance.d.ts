/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { BezierPath } from "plotboilerplate";
import { AppContext } from "../AppContext";
export declare const setPathInstance: (appContext: AppContext) => (newOutline: BezierPath, bendAngle?: number) => void;
