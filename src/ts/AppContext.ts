/**
 * Not a context in React style. More a top level wrapper for 'global' stuff.
 *
 * @date 2026-03-13
 */

import { detectDarkMode } from "./detectDarkMode";
import { detectMobileMode } from "./detectMobileMode";
import { BezierPath, DrawConfig, Line, PlotBoilerplate, Polygon, Params, gup } from "plotboilerplate";
import { setPathInstance } from "./appcontext/setPathInstance";
import { addPathListeners, removePathListeners } from "./appcontext/addRemovePathListeners";
import { BezierResizeHelper } from "./BezierResizeHelper";
import { updatePathResizer } from "./appcontext/updatePathResizer";
import { updateSilhouette } from "./appcontext/updateSilhouette";
import { initConfig } from "./appcontext/initConfig";
import { DildoSilhouette2D } from "./DildoSilhouette2D";
import { updateOutlineStats } from "./appcontext/updateOutlineStats";
import { updateModifiers } from "./appcontext/updateModifiers";
import { rebuild } from "./appcontext/rebuild";
import { handlePathVisibilityChanged } from "./appcontext/handlePathVisibilityChanged";
import { initStats } from "./appcontext/initStats";
import { DildoGeneration } from "./DildoGeneration";
import { ngdg } from "./ngdg";
import { updateBumpmapPreview } from "./appcontext/updateBumpmapPreview";
// import * as THREE from "three";
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
import { getBezierJSON } from "./appcontext/getBezierJSON";
// import { UIStats } from "uistats-typescript";
import { filedropHandler } from "./appcontext/filedropHandler";
import { retrieveFromLocalStorage } from "./appcontext/retrieveFromLocalStorage";
import { setRandomizedResult } from "./appcontext/setRandomizedResult";
import { DildoRandomizerDialog } from "./DildoRandomizerDialog";
import { Axios } from "axios";

// import { BezierResizeHelper } from "plotboilerplate/src/cjs/utils/helpers/BezierResizeHelper";

export class AppContext {
  readonly DEFAULT_BEZIER_COLOR: string;
  readonly DEFAULT_BEZIER_HANDLE_LINE_COLOR: string;

  readonly GUP: Record<string, string>;
  readonly params: Params;
  readonly isDarkmode: boolean;
  readonly isMobile: boolean;
  readonly isLocalstorageDisabled: boolean;

  // +---------------------------------------------------------------------------------
  // | Global utility functions.
  // +-------------------------------
  readonly pb: PlotBoilerplate;
  readonly dragEndListener: any;
  readonly dragListener: any;
  readonly addPathListeners: (path: BezierPath) => void;
  readonly removePathListeners: (path: BezierPath) => void;
  readonly updatePathResizer: (triggerRedraw: boolean) => void;
  readonly setPathInstance: (newOutline: BezierPath) => void;
  readonly setPathInstanceByJSON: (pathJSON: string) => void;
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
  readonly getBezierJSON: () => string;
  readonly setRandomizedResult: ReturnType<typeof setRandomizedResult>;
  readonly dildoRandomizerDialog: DildoRandomizerDialog;

  // +---------------------------------------------------------------------------------
  // | The base shape that's used for the extrusion geometry part.
  // | By default this is a circular polygon.
  // +-------------------------------
  baseShape: Polygon;
  // +---------------------------------------------------------------------------------
  // | Create the outline: a Bézier path.
  // +-------------------------------
  outline: BezierPath;
  // +---------------------------------------------------------------------------------
  // | Create the bezier resize helper.
  // +-------------------------------
  bezierResizer: BezierResizeHelper;
  // +---------------------------------------------------------------------------------
  // | This stores the solhouette on parameter changes :)
  // +-------------------------------
  dildoSilhouette: DildoSilhouette2D;
  // +---------------------------------------------------------------------------------
  // | This contains all the geometric logic.
  // +-------------------------------
  dildoGeneration: DildoGeneration;

  modal: Modal;
  saveAs: (blob: Blob, filename: string) => void;

  bezierDistanceT: number = 0;
  bezierDistanceLine: Line = null;

  bumpmapPath: string;
  bumpmap: any;
  bumpmapRasterImage: HTMLImageElement;

  buildId: any;

  constructor(options: {
    makeSTLExporter: () => STLExporter;
    makeOrbitControls: (camera: THREE.Camera, domElement: HTMLCanvasElement) => any;
    makeModal: () => Modal;
    axios: Axios;
    saveAs: (Blob, filename) => void;
  }) {
    this.GUP = gup();
    this.params = new Params(this.GUP);
    this.isDarkmode = detectDarkMode(this.GUP);
    this.isMobile = detectMobileMode(this.params);
    this.isLocalstorageDisabled = this.params.getBoolean("disableLocalStorage", false);
    this.config = initConfig(this);
    this.stats = initStats();

    // TODO: Move to appcontex/...
    // +---------------------------------------------------------------------------------
    // | Each outline vertex requires a drag (end) listener. We need this to update
    // | the 3d mesh on changes, update stats, and resize handle positions.
    // +-------------------------------
    const _self = this;
    this.dragEndListener = function (dragEvent) {
      // Uhm, well, some curve point moved.
      _self.updatePathResizer(false);
      _self.updateOutlineStats();
      _self.rebuild();
    };
    // +---------------------------------------------------------------------------------
    // | Each outline vertex requires a drag (end) listener. We need this to update
    // | the 2d preview on changes.
    // +-------------------------------
    this.dragListener = function (dragEvent) {
      // Uhm, well, some curve point moved.
      _self.updateSilhouette(false); // noRedraw=false
    };

    /**
     * If there are multiple instance of PB present, then it might be easier
     * to just pass the JSON string instead of the BezierPath instance.
     */
    this.setPathInstanceByJSON = (pathJSON: string) => {
      this.setPathInstance(BezierPath.fromJSON(pathJSON));
    };

    // Init PB
    // All config appContext.params are optional.
    this.pb = new PlotBoilerplate(
      {
        canvas: document.getElementById("my-canvas") as HTMLCanvasElement,
        fullSize: true,
        fitToParent: true,
        scaleX: 1.0,
        scaleY: 1.0,
        rasterGrid: this.params.getBoolean("rasterGrid", true),
        drawOrigin: this.params.getBoolean("drawOrigin", false),
        rasterAdjustFactor: 2.0,
        redrawOnResize: true,
        defaultCanvasWidth: 1024,
        defaultCanvasHeight: 768,
        canvasWidthFactor: 1.0,
        canvasHeightFactor: 1.0,
        cssScaleX: 1.0,
        cssScaleY: 1.0,
        cssUniformScale: true,
        autoAdjustOffset: true,
        offsetAdjustXPercent: 50,
        offsetAdjustYPercent: 50,
        backgroundColor: this.isDarkmode ? "rgb(09, 12, 23)" : "#ffffff",
        // offsetX: 0.0,
        // offsetY: 0.0,
        // drawRaster: true,
        // rasterScaleX: 1.0,
        // rasterScaleY: 1.0,
        // enableMouseWheel: true,
        // enableZoom: true,
        // enablePan: true,
        // autoDetectRetina: true,
        // enableMouse: true,
        // enableKeys: true,
        // enableTouch: true,
        enableSVGExport: false
      } as any,
      {} as any as DrawConfig // TODO: FIX IN PlotBoilerpate. This should be optional
    );
    this.pb.drawConfig.bezier.color = this.isDarkmode ? "rgba(128,128,128, 0.8)" : "#000000";
    this.pb.drawConfig.bezier.lineWidth = 2.0;
    this.pb.drawConfig.bezier.handleLine.color = this.isDarkmode ? "rgba(92,92,92,0.8)" : "rgba(0,0,0,0.35)";
    this.pb.drawConfig.bezier.pathVertex.color = "#B400FF";
    this.pb.drawConfig.bezier.pathVertex.fill = true;
    this.pb.drawConfig.bezier.controlVertex.color = "#B8D438";
    this.pb.drawConfig.bezier.controlVertex.fill = true;

    this.DEFAULT_BEZIER_COLOR = this.pb.drawConfig.bezier.color;
    this.DEFAULT_BEZIER_HANDLE_LINE_COLOR = this.pb.drawConfig.bezier.handleLine.color;

    this.bumpmapPath = "./assets/img/bumpmap-blurred-2.png";
    this.bumpmap = null;
    // const _self = this;
    this.bumpmapRasterImage = ngdg.ImageStore.getImage(this.bumpmapPath, _completeImage => {
      _self.rebuild && _self.rebuild();
    });

    this.dildoGeneration = new ngdg.DildoGeneration("dildo-canvas", {
      makeOrbitControls: options.makeOrbitControls
      //   makeOrbitControls: function (camera, domElement) {
      //     return new THREE.OrbitControls(camera, domElement);
      //   }
    });

    this.modal = options.makeModal();
    this.saveAs = options.saveAs;

    this.addPathListeners = addPathListeners(this);
    this.removePathListeners = removePathListeners(this);
    this.setPathInstance = setPathInstance(this);
    this.updatePathResizer = updatePathResizer(this);
    this.updateSilhouette = updateSilhouette(this);
    this.updateModifiers = updateModifiers(this);
    this.updateOutlineStats = updateOutlineStats(this);
    this.rebuild = rebuild(this);
    this.handlePathVisibilityChanged = handlePathVisibilityChanged(this);
    this.updateBumpmapPreview = updateBumpmapPreview;
    this.exportSTL = exportSTL(this, options.makeSTLExporter);
    this.showPathJSON = showPathJSON(this);
    this.showSculptmap = showSculptmap(this);
    this.getSculptmapDataURL = getSculptmapDataURL(this);
    this.insertPathJSON = insertPathJSON(this);
    this.loadPathJSON = loadPathJSON(this);
    this.fitViewToSilhouette = fitViewToSilhouette(this);
    this.acquireOptimalView = acquireOptimalView(this);
    this.acquireOptimalPathView = acquireOptimalPathView(this);
    this.setDefaultPathInstance = setDefaultPathInstance(this);
    this.getBezierJSON = getBezierJSON(this);
    this.setRandomizedResult = setRandomizedResult(this);
    this.dildoRandomizerDialog = new DildoRandomizerDialog(this, {
      axios: options.axios
    });

    // +---------------------------------------------------------------------------------
    // | Handle file drop.
    // +-------------------------------
    const filedrop = filedropHandler(this);

    retrieveFromLocalStorage(this);
  }
}
