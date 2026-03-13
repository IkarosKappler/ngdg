"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStats = void 0;
var uistats_typescript_1 = require("uistats-typescript");
var initStats = function () {
    // +---------------------------------------------------------------------------------
    // | Add stats.
    // +-------------------------------
    var stats = {
        mouseX: 0,
        mouseY: 0,
        width: 0,
        height: 0,
        diameter: 0,
        area: 0
    };
    var uiStats = new uistats_typescript_1.UIStats(stats);
    stats = uiStats.proxy;
    uiStats.add("mouseX").precision(1);
    uiStats.add("mouseY").precision(1);
    uiStats.add("width").precision(1).suffix(" mm");
    uiStats.add("height").precision(1).suffix(" mm");
    uiStats.add("diameter").precision(1).suffix(" mm");
    uiStats.add("area").precision(1).suffix(" mm²");
    return stats;
};
exports.initStats = initStats;
//# sourceMappingURL=initStats.js.map