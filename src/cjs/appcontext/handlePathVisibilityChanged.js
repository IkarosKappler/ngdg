"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePathVisibilityChanged = void 0;
var handlePathVisibilityChanged = function (appContext) {
    return function () {
        console.log("handlePathVisibilityChanged");
        // if (!outline) {
        //   return;
        // }
        // console.log("OUTLINE", outline);
        appContext.outline.bezierCurves.forEach(function (curve) {
            // console.log("Curve", curve);
            curve.startPoint.attr.visible = appContext.config.drawOutline;
            curve.endPoint.attr.visible = appContext.config.drawOutline;
            curve.startControlPoint.attr.visible = appContext.config.drawOutline;
            curve.endControlPoint.attr.visible = appContext.config.drawOutline;
        });
        if (appContext.config.drawOutline) {
            // if (!pb.drawables.includes(outline)) {
            //   pb.add(outline);
            // }
            // addPathListeners(outline);
            // setPathInstance(outline);
            appContext.pb.drawConfig.bezier.color = appContext.DEFAULT_BEZIER_COLOR;
            appContext.pb.drawConfig.bezier.handleLine.color = appContext.DEFAULT_BEZIER_HANDLE_LINE_COLOR;
            appContext.pb.drawConfig.drawHandleLines = true;
        }
        else {
            // pb.removeAll(); // (outline, true, true); // redraw=true, removeWithVertices=true
            // removePathListeners(outline);
            appContext.pb.drawConfig.bezier.color = "rgba(255,255,255,0.0)";
            appContext.pb.drawConfig.bezier.handleLine.color = "rgba(255,255,255,0.0)";
            appContext.pb.drawConfig.drawHandleLines = false;
        }
        appContext.bezierResizer.verticalResizeHandle.attr.visible = appContext.config.drawResizeHandleLines;
        appContext.bezierResizer.verticalResizeHandle.attr.draggable = appContext.config.drawResizeHandleLines;
        appContext.bezierResizer.horizontalResizeHandle.attr.visible = appContext.config.drawResizeHandleLines;
        appContext.bezierResizer.horizontalResizeHandle.attr.draggable = appContext.config.drawResizeHandleLines;
        // outline.
        appContext.pb.redraw();
    };
};
exports.handlePathVisibilityChanged = handlePathVisibilityChanged;
//# sourceMappingURL=handlePathVisibilityChanged.js.map