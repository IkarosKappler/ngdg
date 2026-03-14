/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { UIStats } from "uistats-typescript";
export declare const initStats: (makeUIStats: (stats: object) => UIStats) => {
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    diameter: number;
    area: number;
};
