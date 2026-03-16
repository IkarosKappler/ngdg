/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-16 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";
import { ngdg } from "../ngdg";

export const retrieveFromLocalStorage = (appContext: AppContext) => {
  // +---------------------------------------------------------------------------------
  // | Load the config from the local storage.
  // +-------------------------------
  // console.log("OUTLINE", outline);
  if (appContext.isLocalstorageDisabled) {
    console.log("[INFO] Localstorage is disabled.");
    // setDefaultPathInstance(false);
  } else {
    console.log("[INFO] Localstorage enabled.");

    const localstorageIO = new ngdg.LocalstorageIO();
    localstorageIO.onPathRestored(
      (jsonString, bendAngle, twistAngle, baseShapeExcentricity) => {
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
      },
      () => {
        //  return outline ? outline.toJSON() : null;
        return {
          bezierJSON: appContext.getBezierJSON(),
          bendAngle: appContext.config.bendAngle,
          twistAngle: appContext.config.twistAngle,
          baseShapeExcentricity: appContext.config.baseShapeExcentricity
        };
      }
    );
  }
};
