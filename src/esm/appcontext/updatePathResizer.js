/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { BezierResizeHelper } from "../BezierResizeHelper";
export const updatePathResizer = (appContext) => {
    return (triggerRedraw) => {
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
        appContext.bezierResizer = new BezierResizeHelper(appContext.pb, appContext.outline, onUpdate);
        appContext.pb.add([appContext.bezierResizer.verticalResizeHandle, appContext.bezierResizer.horizontalResizeHandle], triggerRedraw);
        appContext.handlePathVisibilityChanged();
        // }
    };
};
//# sourceMappingURL=updatePathResizer.js.map