"use strict";
/**
 * Not a context in React style. More a top level wrapper for 'global' stuff.
 *
 * @date 2026-03-13
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContext = void 0;
// import { BezierPath, Bounds, Polygon, Vertex } from "plotboilerplate";
var Params_1 = require("plotboilerplate/src/esm/utils/Params");
var gup_1 = require("plotboilerplate/src/esm/utils/gup");
var detectDarkMode_1 = require("./detectDarkMode");
var detectMobileMode_1 = require("./detectMobileMode");
var plotboilerplate_1 = require("plotboilerplate");
var setPathInstance_1 = require("./appcontext/setPathInstance");
var addRemovePathListeners_1 = require("./appcontext/addRemovePathListeners");
var updatePathResizer_1 = require("./appcontext/updatePathResizer");
var updateSilhouette_1 = require("./appcontext/updateSilhouette");
var initConfig_1 = require("./appcontext/initConfig");
var updateOutlineStats_1 = require("./appcontext/updateOutlineStats");
var updateModifiers_1 = require("./appcontext/updateModifiers");
var rebuild_1 = require("./appcontext/rebuild");
var handlePathVisibilityChanged_1 = require("./appcontext/handlePathVisibilityChanged");
var initStats_1 = require("./appcontext/initStats");
var ngdg_1 = require("./ngdg");
var updateBumpmapPreview_1 = require("./appcontext/updateBumpmapPreview");
var exportSTL_1 = require("./appcontext/exportSTL");
var showPathJSON_1 = require("./appcontext/showPathJSON");
var showSculptMap_1 = require("./appcontext/showSculptMap");
var getSculptmapDataURL_1 = require("./appcontext/getSculptmapDataURL");
var insertPathJSON_1 = require("./appcontext/insertPathJSON");
var loadPathJSON_1 = require("./appcontext/loadPathJSON");
var fitViewToSilhouette_1 = require("./appcontext/fitViewToSilhouette");
var acquireOptimalView_1 = require("./appcontext/acquireOptimalView");
var acquireOptimalPathView_1 = require("./appcontext/acquireOptimalPathView");
var setDefaultPathInstance_1 = require("./appcontext/setDefaultPathInstance");
var getBezierJSON_1 = require("./appcontext/getBezierJSON");
// import { UIStats } from "uistats-typescript";
var filedropHandler_1 = require("./appcontext/filedropHandler");
var retrieveFromLocalStorage_1 = require("./appcontext/retrieveFromLocalStorage");
var setRandomizedResult_1 = require("./appcontext/setRandomizedResult");
// import { BezierResizeHelper } from "plotboilerplate/src/cjs/utils/helpers/BezierResizeHelper";
var AppContext = /** @class */ (function () {
    function AppContext(options) {
        var _this = this;
        this.bezierDistanceT = 0;
        this.bezierDistanceLine = null;
        this.GUP = (0, gup_1.gup)();
        this.params = new Params_1.Params(this.GUP);
        this.isDarkmode = (0, detectDarkMode_1.detectDarkMode)(this.GUP);
        this.isMobile = (0, detectMobileMode_1.detectMobileMode)(this.params);
        this.isLocalstorageDisabled = this.params.getBoolean("disableLocalStorage", false);
        this.config = (0, initConfig_1.initConfig)(this);
        this.stats = (0, initStats_1.initStats)();
        // TODO: Move to appcontex/...
        // +---------------------------------------------------------------------------------
        // | Each outline vertex requires a drag (end) listener. We need this to update
        // | the 3d mesh on changes, update stats, and resize handle positions.
        // +-------------------------------
        var _self = this;
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
        this.setPathInstanceByJSON = function (pathJSON) {
            _this.setPathInstance(plotboilerplate_1.BezierPath.fromJSON(pathJSON));
        };
        // Init PB
        // All config appContext.params are optional.
        this.pb = new plotboilerplate_1.PlotBoilerplate({
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
        this.bumpmapRasterImage = ngdg_1.ngdg.ImageStore.getImage(this.bumpmapPath, function (_completeImage) {
            _self.rebuild && _self.rebuild();
        });
        this.dildoGeneration = new ngdg_1.ngdg.DildoGeneration("dildo-canvas", {
            makeOrbitControls: options.makeOrbitControls
            //   makeOrbitControls: function (camera, domElement) {
            //     return new THREE.OrbitControls(camera, domElement);
            //   }
        });
        this.modal = options.makeModal();
        this.saveAs = options.saveAs;
        this.addPathListeners = (0, addRemovePathListeners_1.addPathListeners)(this);
        this.removePathListeners = (0, addRemovePathListeners_1.removePathListeners)(this);
        this.setPathInstance = (0, setPathInstance_1.setPathInstance)(this);
        this.updatePathResizer = (0, updatePathResizer_1.updatePathResizer)(this);
        this.updateSilhouette = (0, updateSilhouette_1.updateSilhouette)(this);
        this.updateModifiers = (0, updateModifiers_1.updateModifiers)(this);
        this.updateOutlineStats = (0, updateOutlineStats_1.updateOutlineStats)(this);
        this.rebuild = (0, rebuild_1.rebuild)(this);
        this.handlePathVisibilityChanged = (0, handlePathVisibilityChanged_1.handlePathVisibilityChanged)(this);
        this.updateBumpmapPreview = updateBumpmapPreview_1.updateBumpmapPreview;
        this.exportSTL = (0, exportSTL_1.exportSTL)(this, options.makeSTLExporter);
        this.showPathJSON = (0, showPathJSON_1.showPathJSON)(this);
        this.showSculptmap = (0, showSculptMap_1.showSculptmap)(this);
        this.getSculptmapDataURL = (0, getSculptmapDataURL_1.getSculptmapDataURL)(this);
        this.insertPathJSON = (0, insertPathJSON_1.insertPathJSON)(this);
        this.loadPathJSON = (0, loadPathJSON_1.loadPathJSON)(this);
        this.fitViewToSilhouette = (0, fitViewToSilhouette_1.fitViewToSilhouette)(this);
        this.acquireOptimalView = (0, acquireOptimalView_1.acquireOptimalView)(this);
        this.acquireOptimalPathView = (0, acquireOptimalPathView_1.acquireOptimalPathView)(this);
        this.setDefaultPathInstance = (0, setDefaultPathInstance_1.setDefaultPathInstance)(this);
        this.getBezierJSON = (0, getBezierJSON_1.getBezierJSON)(this);
        this.setRandomizedResult = (0, setRandomizedResult_1.setRandomizedResult)(this);
        // +---------------------------------------------------------------------------------
        // | Handle file drop.
        // +-------------------------------
        var filedrop = (0, filedropHandler_1.filedropHandler)(this);
        (0, retrieveFromLocalStorage_1.retrieveFromLocalStorage)(this);
    }
    return AppContext;
}());
exports.AppContext = AppContext;
//# sourceMappingURL=AppContext.js.map