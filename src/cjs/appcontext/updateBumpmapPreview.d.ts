/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { IBumpmap } from "../interfaces";
/**
 * Create a pewview for the used bumpmap.
 *
 * @param {IBumpmap|undefined} bumpmap
 * @param {boolean} isPreviewVisible
 */
export declare const updateBumpmapPreview: (bumpmap: IBumpmap, isPreviewVisible: boolean) => void;
