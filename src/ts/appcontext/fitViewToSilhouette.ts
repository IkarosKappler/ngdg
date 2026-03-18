/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";
import { scaleBounds } from "../scaleBounds";

export const fitViewToSilhouette = (appContext: AppContext) => {
  return () => {
    var bounds = appContext.dildoSilhouette.getBounds();
    appContext.pb.fitToView(scaleBounds(bounds, 1.6));
  };
};
