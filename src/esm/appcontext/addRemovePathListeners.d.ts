/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 * @param newOutline
 */
import { BezierPath } from "plotboilerplate/src/cjs/BezierPath";
import { AppContext } from "../AppContext";
export declare const addPathListeners: (appContex: AppContext) => (path: BezierPath) => void;
export declare const removePathListeners: (appContex: AppContext) => (path: BezierPath) => void;
