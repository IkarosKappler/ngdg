"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultPathInstance = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var ngdg_1 = require("../ngdg");
var setDefaultPathInstance = function (appContext) {
    return function (doRebuild) {
        appContext.setPathInstance(plotboilerplate_1.BezierPath.fromJSON(ngdg_1.ngdg.DEFAULT_BEZIER_JSON));
        if (doRebuild) {
            appContext.rebuild();
        }
    };
};
exports.setDefaultPathInstance = setDefaultPathInstance;
//# sourceMappingURL=setDefaultPathInstance.js.map