/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { BezierPath } from "plotboilerplate";
import { AppContext } from "../AppContext";

export const loadPathJSON = (appContext: AppContext) => {
  return (jsonData: string) => {
    var newOutline = null;
    try {
      newOutline = BezierPath.fromJSON(jsonData);
    } catch (e) {
      console.log("Error parsing JSON path:", e.getMessage());
    } finally {
      if (newOutline) {
        appContext.setPathInstance(newOutline);
        // acquireOptimalPathView(pb, outline);
        appContext
          .rebuild()
          .then(function (succeeded) {
            succeeded && appContext.acquireOptimalView();
          })
          .catch(function (err) {
            // NOOP: rebuild had been interrupted by new request.
            // Old result has just been dropped.
            err && console.log(err);
          });
      }
    }
  };
};
