/**
 * This defines the globally exported wrapper library.
 *
 * See ./src/cjs/entry.js
 *
 * @author   Ikaros Kappler
 * @version  1.0.0
 * @date     2021-09-27
 * @modified 2022-01-29
 */
import { DildoGeneration } from "./DildoGeneration";
import { LocalstorageIO } from "./LocalstorageIO";
export declare const ngdg: {
    DEFAULT_BEZIER_JSON: string;
    LocalstorageIO: typeof LocalstorageIO;
    DildoGeneration: typeof DildoGeneration;
    ImageStore: {
        getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => HTMLImageElement;
        isImageLoaded: (image: HTMLImageElement) => boolean;
    };
    isMobileDevice: () => boolean;
};
