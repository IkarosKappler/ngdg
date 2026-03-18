"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-16 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.filedropHandler = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var filedropHandler = function (appContext) {
    // +---------------------------------------------------------------------------------
    // | Load the config from the local storage.
    // | Handle file drop.
    // +-------------------------------
    var fileDrop = new plotboilerplate_1.FileDrop(appContext.pb.eventCatcher);
    fileDrop.onFileJSONDropped(function (jsonObject) {
        try {
            appContext.setPathInstance(plotboilerplate_1.BezierPath.fromArray(jsonObject));
            appContext.rebuild();
        }
        catch (e) {
            console.error("Failed to retrieve Bézier path from dropped file.", jsonObject);
            console.log(e);
        }
    });
};
exports.filedropHandler = filedropHandler;
//# sourceMappingURL=filedropHandler.js.map