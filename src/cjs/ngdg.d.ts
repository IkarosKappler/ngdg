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
import { SculptMap } from "./SculptMap";
import { DildoSilhouette2D } from "./DildoSilhouette2D";
export declare const ngdg: {
    DEFAULT_BEZIER_JSON: string;
    DEG_TO_RAD: number;
    SPLIT_MESH_OFFSET: {
        x: number;
        y: number;
        z: number;
    };
    KEY_SLICED_MESH_RIGHT: string;
    KEY_SLICED_MESH_LEFT: string;
    DildoGeneration: typeof DildoGeneration;
    DildoSilhouette2D: typeof DildoSilhouette2D;
    ImageStore: {
        getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => HTMLImageElement;
        isImageLoaded: (image: HTMLImageElement) => boolean;
    };
    isMobileDevice: () => boolean;
    LocalstorageIO: typeof LocalstorageIO;
    SculptMap: typeof SculptMap;
};
