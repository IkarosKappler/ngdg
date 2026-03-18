/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";

// +---------------------------------------------------------------------------------
// | Updates the sculpt map by recalculating the image data from the 3d model.
// +-------------------------------
export const showSculptmap = (appContext: AppContext) => {
  return () => {
    appContext.modal.setTitle("Show Sculpt Map");
    appContext.modal.setFooter("");
    appContext.modal.setActions([appContext.modal.ACTION_CLOSE]);
    // const geometry = dildoGeneration.primaryDildoGeometry;
    // const sculptmap = ngdg.SculptMap.fromDildoGeometry(geometry);
    // const canvas = sculptmap.toCanvas();
    // const dataString = canvas.toDataURL();
    const dataString = appContext.getSculptmapDataURL();
    appContext.modal.setBody('<div style="height: 60vh; width: 100%;"><img src="' + dataString + '" width="100%" height="100%">');
    appContext.modal.open();
  };
};
