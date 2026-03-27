/**
 * Not a context in React style. More a top level wrapper for 'global' stuff.
 *
 * @date 2026-03-13
 */
import { detectDarkMode } from "./detectDarkMode";
import { detectMobileMode } from "./detectMobileMode";
import { BezierPath, PlotBoilerplate, Params, gup } from "plotboilerplate";
import { setPathInstance } from "./appcontext/setPathInstance";
import { addPathListeners, removePathListeners } from "./appcontext/addRemovePathListeners";
import { updatePathResizer } from "./appcontext/updatePathResizer";
import { updateSilhouette } from "./appcontext/updateSilhouette";
import { initConfig } from "./appcontext/initConfig";
import { updateOutlineStats } from "./appcontext/updateOutlineStats";
import { updateModifiers } from "./appcontext/updateModifiers";
import { rebuild } from "./appcontext/rebuild";
import { handlePathVisibilityChanged } from "./appcontext/handlePathVisibilityChanged";
import { initStats } from "./appcontext/initStats";
import { ngdg } from "./ngdg";
import { updateBumpmapPreview } from "./appcontext/updateBumpmapPreview";
import { exportSTL } from "./appcontext/exportSTL";
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
import { filedropHandler } from "./appcontext/filedropHandler";
import { retrieveFromLocalStorage } from "./appcontext/retrieveFromLocalStorage";
import { setRandomizedResult } from "./appcontext/setRandomizedResult";
import { DildoRandomizerDialog } from "./DildoRandomizerDialog";
// import { BezierResizeHelper } from "plotboilerplate/src/cjs/utils/helpers/BezierResizeHelper";
export class AppContext {
    constructor(options) {
        this.bezierDistanceT = 0;
        this.bezierDistanceLine = null;
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
        this.setPathInstanceByJSON = (pathJSON, bendAngle) => {
            this.setPathInstance(BezierPath.fromJSON(pathJSON), bendAngle);
        };
        // Init PB
        // All config appContext.params are optional.
        this.pb = new PlotBoilerplate({
            canvas: document.getElementById("my-canvas"),
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
        }, {} // TODO: FIX IN PlotBoilerpate. This should be optional
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
//# sourceMappingURL=AppContext.js.map