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
exports.ngdg = {
    DEFAULT_BEZIER_JSON: defaults_1.DEFAULT_BEZIER_JSON,
    DEG_TO_RAD: constants_1.DEG_TO_RAD,
    SPLIT_MESH_OFFSET: constants_1.SPLIT_MESH_OFFSET,
    KEY_SLICED_MESH_RIGHT: constants_1.KEY_SLICED_MESH_RIGHT,
    KEY_SLICED_MESH_LEFT: constants_1.KEY_SLICED_MESH_LEFT,
    AppContext: AppContext_1.AppContext,
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
    SculptMap: SculptMap_1.SculptMap
};
//# sourceMappingURL=ngdg.js.map