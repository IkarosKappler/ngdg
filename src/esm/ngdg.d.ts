/**
 * This defines the globally exported wrapper library.
 *
 * See ./src/cjs/entry.js
 *
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-09-27
 */
import { DildoGeneration } from "./DildoGeneration";
export declare const ngdg: {
    DEFAULT_BEZIER_JSON: string;
    DildoGeneration: typeof DildoGeneration;
    ImageStore: {
        getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => HTMLImageElement;
        isImageLoaded: (image: HTMLImageElement) => boolean;
    };
};
