/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-16 Refactored from the global `index.js`.
 */
import { BezierPath, FileDrop } from "plotboilerplate";
export const filedropHandler = (appContext) => {
    // +---------------------------------------------------------------------------------
    // | Load the config from the local storage.
    // | Handle file drop.
    // +-------------------------------
    const fileDrop = new FileDrop(appContext.pb.eventCatcher);
    fileDrop.onFileJSONDropped((jsonObject) => {
        try {
            appContext.setPathInstance(BezierPath.fromArray(jsonObject));
            appContext.rebuild();
        }
        catch (e) {
            console.error("Failed to retrieve Bézier path from dropped file.", jsonObject);
            console.log(e);
        }
    });
};
//# sourceMappingURL=filedropHandler.js.map