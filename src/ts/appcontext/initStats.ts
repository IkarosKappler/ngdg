/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { UIStats } from "uistats-typescript";
// import UIStats from "uistats-typescript/src/js/index.js";
// import UIStats from "uistats-typescript/src/js/index";

// console.log("UIStatd [static]", UIStats);

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
  console.log("UIStats", UIStats);
  try {
    var uiStats = new UIStats(stats);
    // stats = uiStats.proxy;
    uiStats.add("mouseX").precision(1);
    uiStats.add("mouseY").precision(1);
    uiStats.add("width").precision(1).suffix(" mm");
    uiStats.add("height").precision(1).suffix(" mm");
    uiStats.add("diameter").precision(1).suffix(" mm");
    uiStats.add("area").precision(1).suffix(" mm²");

    return uiStats.proxy as any as typeof stats;
  } catch (exc) {
    console.error("Failed to initialize UIStats.", exc);
    return stats;
  }
};
