"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOutlineStats = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var Rulers_1 = require("../Rulers");
var updateOutlineStats = function (appContext) {
    return function () {
        var pathBounds = appContext.outline.getBounds();
        appContext.stats.width = pathBounds.width * Rulers_1.Rulers.mmPerUnit;
        appContext.stats.height = pathBounds.height * Rulers_1.Rulers.mmPerUnit;
        appContext.stats.diameter = 2 * pathBounds.width * Rulers_1.Rulers.mmPerUnit;
        // Compute area from outline
        var vertices = appContext.outline.getEvenDistributionVertices(100);
        var bounds = appContext.outline.getBounds();
        vertices.push(new plotboilerplate_1.Vertex(bounds.max));
        var polygon = new plotboilerplate_1.Polygon(vertices, false);
        appContext.stats.area = polygon.area();
    };
};
exports.updateOutlineStats = updateOutlineStats;
//# sourceMappingURL=updateOutlineStats.js.map