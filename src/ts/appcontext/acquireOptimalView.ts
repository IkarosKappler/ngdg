/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";

export const acquireOptimalView = (appContext: AppContext) => {
  return () => {
    // if (params.getBoolean("fitViewToSilhouette", false)) {
    if (appContext.config.isSilhoutettePreferredView) {
      appContext.fitViewToSilhouette();
    } else {
      appContext.acquireOptimalPathView(appContext.pb, appContext.outline);
    }
  };
};
