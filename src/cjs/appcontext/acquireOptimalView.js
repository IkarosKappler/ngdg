"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireOptimalView = void 0;
var acquireOptimalView = function (appContext) {
    return function () {
        // if (params.getBoolean("fitViewToSilhouette", false)) {
        if (appContext.config.isSilhoutettePreferredView) {
            appContext.fitViewToSilhouette();
        }
        else {
            appContext.acquireOptimalPathView(appContext.pb, appContext.outline);
        }
    };
};
exports.acquireOptimalView = acquireOptimalView;
//# sourceMappingURL=acquireOptimalView.js.map