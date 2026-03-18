"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSilhouette = void 0;
var ngdg_1 = require("../ngdg");
// +---------------------------------------------------------------------------------
// | Updates the sculpt map by recalculating the image data from the 3d model.
// +-------------------------------
var updateSilhouette = function (appContext) {
    return function (noRedraw) {
        // TODO: baseShape updating belongs elsewhere!
        var baseRadius = appContext.outline.getBounds().width;
        appContext.baseShape = ngdg_1.ngdg.GeometryGenerationHelpers.mkCircularPolygon(baseRadius, appContext.config.shapeSegmentCount, appContext.config.baseShapeExcentricity);
        // Also draw the bent 2D dildo outline?
        appContext.dildoSilhouette = new ngdg_1.ngdg.DildoSilhouette2D({
            baseShape: appContext.baseShape,
            outline: appContext.outline,
            outlineSegmentCount: appContext.config.outlineSegmentCount,
            bendAngleRad: appContext.config.bendAngle * ngdg_1.ngdg.DEG_TO_RAD,
            bendAngleDeg: appContext.config.bendAngle,
            // TODO: IS THIS REALLY IN USE???s
            isBending: false // appContext.config.isBending
        });
        if (!noRedraw) {
            appContext.pb.redraw();
        }
    };
};
exports.updateSilhouette = updateSilhouette;
//# sourceMappingURL=updateSilhouette.js.map