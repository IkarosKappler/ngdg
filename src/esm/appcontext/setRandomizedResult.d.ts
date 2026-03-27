/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-16 Refactored from the global `index.js`.
 */
import { BezierPath } from "plotboilerplate";
import { AppContext } from "../AppContext";
export interface RandomizerResult {
    outline: BezierPath;
    bendAngle: number;
}
export declare const setRandomizedResult: (appContext: AppContext) => (result: RandomizerResult) => Promise<boolean>;
