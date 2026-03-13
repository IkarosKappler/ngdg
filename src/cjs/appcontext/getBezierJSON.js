"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBezierJSON = void 0;
var getBezierJSON = function (appContext) {
    return function (prettyFormat) {
        return appContext.outline ? appContext.outline.toJSON(prettyFormat) : null;
    };
};
exports.getBezierJSON = getBezierJSON;
//# sourceMappingURL=getBezierJSON.js.map