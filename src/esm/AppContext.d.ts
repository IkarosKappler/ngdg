/**
 * Not a context in React style. More a top level wrapper for 'global' stuff.
 *
 * @date 2026-03-13
 */
import { Params } from "plotboilerplate/src/esm/utils/Params";
import { BezierPath, Line, PlotBoilerplate, Polygon } from "plotboilerplate";
import { BezierResizeHelper } from "./BezierResizeHelper";
import { initConfig } from "./appcontext/initConfig";
import { DildoSilhouette2D } from "./DildoSilhouette2D";
import { initStats } from "./appcontext/initStats";
import { DildoGeneration } from "./DildoGeneration";
import { updateBumpmapPreview } from "./appcontext/updateBumpmapPreview";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { exportSTL } from "./appcontext/exportSTL";
import { Modal } from "./Modal";
import { showPathJSON } from "./appcontext/showPathJSON";
import { showSculptmap } from "./appcontext/showSculptMap";
import { getSculptmapDataURL } from "./appcontext/getSculptmapDataURL";
import { insertPathJSON } from "./appcontext/insertPathJSON";
import { loadPathJSON } from "./appcontext/loadPathJSON";
import { fitViewToSilhouette } from "./appcontext/fitViewToSilhouette";
import { acquireOptimalView } from "./appcontext/acquireOptimalView";
import { acquireOptimalPathView } from "./appcontext/acquireOptimalPathView";
import { setDefaultPathInstance } from "./appcontext/setDefaultPathInstance";
export declare class AppContext {
    readonly DEFAULT_BEZIER_COLOR: string;
    readonly DEFAULT_BEZIER_HANDLE_LINE_COLOR: string;
    readonly GUP: Record<string, string>;
    readonly params: Params;
    readonly isDarkmode: boolean;
    readonly isMobile: boolean;
    readonly isLocalstorageDisabled: boolean;
    readonly pb: PlotBoilerplate;
    readonly dragEndListener: any;
    readonly dragListener: any;
    readonly addPathListeners: (path: BezierPath) => void;
    readonly removePathListeners: (path: BezierPath) => void;
    readonly updatePathResizer: (triggerRedraw: boolean) => void;
    readonly setPathInstance: (newOutline: BezierPath) => void;
    readonly updateSilhouette: (noRedraw: boolean) => void;
    readonly updateOutlineStats: () => void;
    readonly updateModifiers: () => void;
    readonly config: ReturnType<typeof initConfig>;
    readonly rebuild: () => Promise<boolean>;
    readonly handlePathVisibilityChanged: () => void;
    readonly stats: ReturnType<typeof initStats>;
    readonly updateBumpmapPreview: typeof updateBumpmapPreview;
    readonly exportSTL: ReturnType<typeof exportSTL>;
    readonly showPathJSON: ReturnType<typeof showPathJSON>;
    readonly showSculptmap: ReturnType<typeof showSculptmap>;
    readonly getSculptmapDataURL: ReturnType<typeof getSculptmapDataURL>;
    readonly insertPathJSON: ReturnType<typeof insertPathJSON>;
    readonly loadPathJSON: ReturnType<typeof loadPathJSON>;
    readonly fitViewToSilhouette: ReturnType<typeof fitViewToSilhouette>;
    readonly acquireOptimalView: ReturnType<typeof acquireOptimalView>;
    readonly acquireOptimalPathView: ReturnType<typeof acquireOptimalPathView>;
    readonly setDefaultPathInstance: ReturnType<typeof setDefaultPathInstance>;
    readonly getBezierJSON: () => void;
    baseShape: Polygon;
    outline: BezierPath;
    bezierResizer: BezierResizeHelper;
    dildoSilhouette: DildoSilhouette2D;
    dildoGeneration: DildoGeneration;
    modal: Modal;
    saveAs: (blob: Blob, filename: string) => void;
    bezierDistanceT: number;
    bezierDistanceLine: Line;
    bumpmapPath: string;
    bumpmap: any;
    bumpmapRasterImage: HTMLImageElement;
    buildId: any;
    constructor(options: {
        makeSTLExporter: () => STLExporter;
        makeOrbitControls: (camera: THREE.Camera, domElement: HTMLCanvasElement) => any;
        makeModal: () => Modal;
        saveAs: (Blob: any, filename: any) => void;
    });
}
