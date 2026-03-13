"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSculptmapDataURL = void 0;
var ngdg_1 = require("../ngdg");
var getSculptmapDataURL = function (appContext) {
    return function () {
        var geometry = appContext.dildoGeneration.primaryDildoGeometry;
        var sculptmap = ngdg_1.ngdg.SculptMap.fromDildoGeometry(geometry);
        var canvas = sculptmap.toCanvas();
        var dataString = canvas.toDataURL();
        return dataString;
    };
};
exports.getSculptmapDataURL = getSculptmapDataURL;
//# sourceMappingURL=getSculptmapDataURL.js.map