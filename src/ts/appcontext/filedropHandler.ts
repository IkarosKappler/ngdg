/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-16 Refactored from the global `index.js`.
 */

import { BezierPath } from "plotboilerplate";
import { FileDrop } from "plotboilerplate/src/cjs/utils/io/FileDrop";
import { AppContext } from "../AppContext";

export const filedropHandler = (appContext: AppContext) => {
  // +---------------------------------------------------------------------------------
  // | Load the config from the local storage.
  // | Handle file drop.
  // +-------------------------------
  const fileDrop = new FileDrop(appContext.pb.eventCatcher);
  fileDrop.onFileJSONDropped((jsonObject: object) => {
    try {
      appContext.setPathInstance(BezierPath.fromArray(jsonObject));
      appContext.rebuild();
    } catch (e) {
      console.error("Failed to retrieve Bézier path from dropped file.", jsonObject);
      console.log(e);
    }
  });
};
