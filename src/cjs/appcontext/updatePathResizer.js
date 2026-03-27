"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePathResizer = void 0;
var BezierResizeHelper_1 = require("../BezierResizeHelper");
var updatePathResizer = function (appContext) {
    return function (isTriggerRedraw) {
        if (appContext.bezierResizer) {
            appContext.pb.remove([appContext.bezierResizer.verticalResizeHandle, appContext.bezierResizer.horizontalResizeHandle]);
            appContext.bezierResizer.destroy();
            appContext.bezierResizer = null;
        }
        // if (config.drawResizeHandleLines) {
        var onUpdate = function () {
            appContext.updateOutlineStats();
            appContext.updateSilhouette(false); // noRedraw=false
            appContext.rebuild();
        };
        appContext.bezierResizer = new BezierResizeHelper_1.BezierResizeHelper(appContext.pb, appContext.outline, onUpdate);
        appContext.pb.add([appContext.bezierResizer.verticalResizeHandle, appContext.bezierResizer.horizontalResizeHandle], false // isTriggerRedraw=false
        );
        appContext.handlePathVisibilityChanged(isTriggerRedraw);
        // }
    };
};
exports.updatePathResizer = updatePathResizer;
//# sourceMappingURL=updatePathResizer.js.map