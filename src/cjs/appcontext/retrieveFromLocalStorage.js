"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-16 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveFromLocalStorage = void 0;
var ngdg_1 = require("../ngdg");
var retrieveFromLocalStorage = function (appContext) {
    // +---------------------------------------------------------------------------------
    // | Load the config from the local storage.
    // +-------------------------------
    // console.log("OUTLINE", outline);
    if (appContext.isLocalstorageDisabled) {
        console.log("[INFO] Localstorage is disabled.");
        // setDefaultPathInstance(false);
    }
    else {
        console.log("[INFO] Localstorage enabled.");
        var localstorageIO = new ngdg_1.ngdg.LocalstorageIO();
        localstorageIO.onPathRestored(function (jsonString, bendAngle, twistAngle, baseShapeExcentricity) {
            console.log("[INFO] Path restored from localstorage.");
            // This is called when json string was loaded from storage
            if (!appContext.GUP.rbdata) {
                console.log("[INFO] Loading path JSON.");
                appContext.loadPathJSON(jsonString);
            }
            if (!appContext.GUP.bendAngle) {
                appContext.config.bendAngle = bendAngle;
            }
            if (!appContext.GUP.twistAngle) {
                appContext.config.twistAngle = twistAngle;
            }
            if (!appContext.GUP.baseShapeExcentricity) {
                appContext.config.baseShapeExcentricity = baseShapeExcentricity;
            }
        }, function () {
            //  return outline ? outline.toJSON() : null;
            return {
                bezierJSON: appContext.getBezierJSON(),
                bendAngle: appContext.config.bendAngle,
                twistAngle: appContext.config.twistAngle,
                baseShapeExcentricity: appContext.config.baseShapeExcentricity
            };
        });
    }
};
exports.retrieveFromLocalStorage = retrieveFromLocalStorage;
//# sourceMappingURL=retrieveFromLocalStorage.js.map