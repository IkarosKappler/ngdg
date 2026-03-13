"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.showSculptmap = void 0;
// +---------------------------------------------------------------------------------
// | Updates the sculpt map by recalculating the image data from the 3d model.
// +-------------------------------
var showSculptmap = function (appContext) {
    return function () {
        appContext.modal.setTitle("Show Sculpt Map");
        appContext.modal.setFooter("");
        appContext.modal.setActions([appContext.modal.ACTION_CLOSE]);
        // const geometry = dildoGeneration.primaryDildoGeometry;
        // const sculptmap = ngdg.SculptMap.fromDildoGeometry(geometry);
        // const canvas = sculptmap.toCanvas();
        // const dataString = canvas.toDataURL();
        var dataString = appContext.getSculptmapDataURL();
        appContext.modal.setBody('<div style="height: 60vh; width: 100%;"><img src="' + dataString + '" width="100%" height="100%">');
        appContext.modal.open();
    };
};
exports.showSculptmap = showSculptmap;
//# sourceMappingURL=showSculptMap.js.map