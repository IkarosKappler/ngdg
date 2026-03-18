"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePathListeners = exports.addPathListeners = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var addPathListeners = function (appContex) {
    return function (path) {
        plotboilerplate_1.BezierPathInteractionHelper.addPathVertexDragEndListeners(path, appContex.dragEndListener);
        plotboilerplate_1.BezierPathInteractionHelper.addPathVertexDragListeners(path, appContex.dragListener);
    };
};
exports.addPathListeners = addPathListeners;
var removePathListeners = function (appContex) {
    return function (path) {
        plotboilerplate_1.BezierPathInteractionHelper.removePathVertexDragEndListeners(path, appContex.dragEndListener);
        plotboilerplate_1.BezierPathInteractionHelper.removePathVertexDragListeners(path, appContex.dragListener);
    };
};
exports.removePathListeners = removePathListeners;
//# sourceMappingURL=addRemovePathListeners.js.map