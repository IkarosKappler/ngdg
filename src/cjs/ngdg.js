"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngdg = void 0;
var defaults_1 = require("./defaults");
var ImageStore_1 = require("./ImageStore");
var DildoGeneration_1 = require("./DildoGeneration");
var LocalstorageIO_1 = require("./LocalstorageIO");
var isMobileDevice_1 = require("./isMobileDevice");
var constants_1 = require("./constants");
var SculptMap_1 = require("./SculptMap");
var DildoSilhouette2D_1 = require("./DildoSilhouette2D");
var GeometryGenerationHelpers_1 = require("./GeometryGenerationHelpers");
var DildoRandomizer_1 = require("./DildoRandomizer");
var randomWebColor_1 = require("./randomWebColor");
var getImageFromCanvas_1 = require("./getImageFromCanvas");
var detectDarkMode_1 = require("./detectDarkMode");
var AppContext_1 = require("./AppContext");
var setPathInstance_1 = require("./appcontext/setPathInstance");
var Rulers_1 = require("./Rulers");
var acquireOptimalView_1 = require("./appcontext/acquireOptimalView");
var addRemovePathListeners_1 = require("./appcontext/addRemovePathListeners");
var acquireOptimalPathView_1 = require("./appcontext/acquireOptimalPathView");
var exportSTL_1 = require("./appcontext/exportSTL");
var fitViewToSilhouette_1 = require("./appcontext/fitViewToSilhouette");
var getSculptmapDataURL_1 = require("./appcontext/getSculptmapDataURL");
var handlePathVisibilityChanged_1 = require("./appcontext/handlePathVisibilityChanged");
var initConfig_1 = require("./appcontext/initConfig");
var initStats_1 = require("./appcontext/initStats");
var insertPathJSON_1 = require("./appcontext/insertPathJSON");
var rebuild_1 = require("./appcontext/rebuild");
var loadPathJSON_1 = require("./appcontext/loadPathJSON");
var setDefaultPathInstance_1 = require("./appcontext/setDefaultPathInstance");
var showPathJSON_1 = require("./appcontext/showPathJSON");
var updateBumpmapPreview_1 = require("./appcontext/updateBumpmapPreview");
var updateModifiers_1 = require("./appcontext/updateModifiers");
var updateOutlineStats_1 = require("./appcontext/updateOutlineStats");
var updatePathResizer_1 = require("./appcontext/updatePathResizer");
var updateSilhouette_1 = require("./appcontext/updateSilhouette");
var getBezierJSON_1 = require("./appcontext/getBezierJSON");
var scaleBounds_1 = require("./scaleBounds");
var filedropHandler_1 = require("./appcontext/filedropHandler");
var retrieveFromLocalStorage_1 = require("./appcontext/retrieveFromLocalStorage");
// import * as UIStats from "uistats-typescript";
exports.ngdg = {
    DEFAULT_BEZIER_JSON: defaults_1.DEFAULT_BEZIER_JSON,
    DEG_TO_RAD: constants_1.DEG_TO_RAD,
    SPLIT_MESH_OFFSET: constants_1.SPLIT_MESH_OFFSET,
    KEY_SLICED_MESH_RIGHT: constants_1.KEY_SLICED_MESH_RIGHT,
    KEY_SLICED_MESH_LEFT: constants_1.KEY_SLICED_MESH_LEFT,
    AppContext: AppContext_1.AppContext,
    acquireOptimalView: acquireOptimalView_1.acquireOptimalView,
    addPathListeners: addRemovePathListeners_1.addPathListeners,
    removePathListeners: addRemovePathListeners_1.removePathListeners,
    acquireOptimalPathView: acquireOptimalPathView_1.acquireOptimalPathView,
    exportSTL: exportSTL_1.exportSTL,
    filedropHandler: filedropHandler_1.filedropHandler,
    fitViewToSilhouette: fitViewToSilhouette_1.fitViewToSilhouette,
    getBezierJSON: getBezierJSON_1.getBezierJSON,
    getSculptmapDataURL: getSculptmapDataURL_1.getSculptmapDataURL,
    handlePathVisibilityChanged: handlePathVisibilityChanged_1.handlePathVisibilityChanged,
    initConfig: initConfig_1.initConfig,
    initStats: initStats_1.initStats,
    insertPathJSON: insertPathJSON_1.insertPathJSON,
    loadPathJSON: loadPathJSON_1.loadPathJSON,
    rebuild: rebuild_1.rebuild,
    retrieveFromLocalStorage: retrieveFromLocalStorage_1.retrieveFromLocalStorage,
    setDefaultPathInstance: setDefaultPathInstance_1.setDefaultPathInstance,
    setPathInstance: setPathInstance_1.setPathInstance,
    showPathJSON: showPathJSON_1.showPathJSON,
    updateBumpmapPreview: updateBumpmapPreview_1.updateBumpmapPreview,
    updateModifiers: updateModifiers_1.updateModifiers,
    updateOutlineStats: updateOutlineStats_1.updateOutlineStats,
    updatePathResizer: updatePathResizer_1.updatePathResizer,
    updateSilhouette: updateSilhouette_1.updateSilhouette,
    detectDarkMode: detectDarkMode_1.detectDarkMode,
    DildoGeneration: DildoGeneration_1.DildoGeneration,
    DildoRandomizer: DildoRandomizer_1.DildoRandomizer,
    DildoSilhouette2D: DildoSilhouette2D_1.DildoSilhouette2D,
    GeometryGenerationHelpers: GeometryGenerationHelpers_1.GeometryGenerationHelpers,
    getImageFromCanvas: getImageFromCanvas_1.getImageFromCanvas,
    ImageStore: ImageStore_1.ImageStore,
    isMobileDevice: isMobileDevice_1.isMobileDevice,
    LocalstorageIO: LocalstorageIO_1.LocalstorageIO,
    randomWebColor: randomWebColor_1.randomWebColor,
    Rulers: Rulers_1.Rulers,
    scaleBounds: scaleBounds_1.scaleBounds,
    SculptMap: SculptMap_1.SculptMap
    // UIStats
};
//# sourceMappingURL=ngdg.js.map