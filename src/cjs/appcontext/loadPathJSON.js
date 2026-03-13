"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPathJSON = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var loadPathJSON = function (appContext) {
    return function (jsonData) {
        var newOutline = null;
        try {
            newOutline = plotboilerplate_1.BezierPath.fromJSON(jsonData);
        }
        catch (e) {
            console.log("Error parsing JSON path:", e.getMessage());
        }
        finally {
            if (newOutline) {
                appContext.setPathInstance(newOutline);
                // acquireOptimalPathView(pb, outline);
                appContext
                    .rebuild()
                    .then(function (succeeded) {
                    succeeded && appContext.acquireOptimalView();
                })
                    .catch(function (err) {
                    // NOOP: rebuild had been interrupted by new request.
                    // Old result has just been dropped.
                    err && console.log(err);
                });
            }
        }
    };
};
exports.loadPathJSON = loadPathJSON;
//# sourceMappingURL=loadPathJSON.js.map