/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { UIStats } from "uistats-typescript";
export const initStats = () => {
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
    var uiStats = new UIStats(stats);
    stats = uiStats.proxy;
    uiStats.add("mouseX").precision(1);
    uiStats.add("mouseY").precision(1);
    uiStats.add("width").precision(1).suffix(" mm");
    uiStats.add("height").precision(1).suffix(" mm");
    uiStats.add("diameter").precision(1).suffix(" mm");
    uiStats.add("area").precision(1).suffix(" mm²");
    return stats;
};
//# sourceMappingURL=initStats.js.map