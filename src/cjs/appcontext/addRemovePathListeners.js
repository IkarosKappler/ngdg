"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 * @param newOutline
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePathListeners = exports.addPathListeners = void 0;
var BezierPathInteractionHelper_1 = require("plotboilerplate/src/cjs/utils/helpers/BezierPathInteractionHelper");
var addPathListeners = function (appContex) {
    return function (path) {
        BezierPathInteractionHelper_1.BezierPathInteractionHelper.addPathVertexDragEndListeners(path, appContex.dragEndListener);
        BezierPathInteractionHelper_1.BezierPathInteractionHelper.addPathVertexDragListeners(path, appContex.dragListener);
    };
};
exports.addPathListeners = addPathListeners;
var removePathListeners = function (appContex) {
    return function (path) {
        BezierPathInteractionHelper_1.BezierPathInteractionHelper.removePathVertexDragEndListeners(path, appContex.dragEndListener);
        BezierPathInteractionHelper_1.BezierPathInteractionHelper.removePathVertexDragListeners(path, appContex.dragListener);
    };
};
exports.removePathListeners = removePathListeners;
//# sourceMappingURL=addRemovePathListeners.js.map