/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { BezierResizeHelper } from "../BezierResizeHelper";
export const updatePathResizer = (appContext) => {
    return (isTriggerRedraw) => {
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
        appContext.pb.add([appContext.bezierResizer.verticalResizeHandle, appContext.bezierResizer.horizontalResizeHandle], false // isTriggerRedraw=false
        );
        appContext.handlePathVisibilityChanged(isTriggerRedraw);
        // }
    };
};
//# sourceMappingURL=updatePathResizer.js.map