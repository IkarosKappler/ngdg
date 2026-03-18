"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleBounds = void 0;
var plotboilerplate_1 = require("plotboilerplate");
// +---------------------------------------------------------------------------------
// | Scale a given Bounds instance to a new size (from its center).
// +-------------------------------
var scaleBounds = function (bounds, scaleFactor) {
    var center = new plotboilerplate_1.Vertex(bounds.min.x + bounds.width / 2.0, bounds.min.y + bounds.height / 2.0);
    return new plotboilerplate_1.Bounds(new plotboilerplate_1.Vertex(bounds.min).scale(scaleFactor, center), new plotboilerplate_1.Vertex(bounds.max).scale(scaleFactor, center));
};
exports.scaleBounds = scaleBounds;
//# sourceMappingURL=scaleBounds.js.map