/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { BezierPath } from "plotboilerplate";
import { AppContext } from "../AppContext";
import { ngdg } from "../ngdg";

export const setDefaultPathInstance = (appContext: AppContext) => {
  return (doRebuild: boolean) => {
    appContext.setPathInstance(BezierPath.fromJSON(ngdg.DEFAULT_BEZIER_JSON));
    if (doRebuild) {
      appContext.rebuild();
    }
  };
};
