"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitViewToSilhouette = void 0;
var scaleBounds_1 = require("../scaleBounds");
var fitViewToSilhouette = function (appContext) {
    return function () {
        var bounds = appContext.dildoSilhouette.getBounds();
        appContext.pb.fitToView((0, scaleBounds_1.scaleBounds)(bounds, 1.6));
    };
};
exports.fitViewToSilhouette = fitViewToSilhouette;
//# sourceMappingURL=fitViewToSilhouette.js.map