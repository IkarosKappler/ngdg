/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";
import { ImageStore } from "../ImageStore";
import { RasteredBumpmap } from "../RasteredBumpmap";

// +---------------------------------------------------------------------------------
// | Delay the build a bit. And cancel stale builds.
// | This avoids too many rebuilds (pretty expensive) on mouse drag events.
// +-------------------------------
// var buildId = null;
export const rebuild = (appContex: AppContext) => {
  return (): Promise<boolean> => {
    return new Promise(function (accept, reject) {
      appContex.buildId = new Date().getTime();
      try {
        window.setTimeout(
          (function (bId) {
            return function () {
              if (bId != appContex.buildId) {
                // console.log("Rejecting", bId, buildId);
                accept(false);
                return;
              }
              appContex.updateSilhouette(false);
              if (appContex.config.useBumpmap && ImageStore.isImageLoaded(appContex.bumpmapRasterImage)) {
                // Resize the bumpmap to satisfy the mesh resolution.
                appContex.bumpmap = new RasteredBumpmap(
                  appContex.bumpmapRasterImage,
                  appContex.config.shapeSegmentCount,
                  appContex.config.outlineSegmentCount
                );
              }
              appContex.updateBumpmapPreview(
                appContex.bumpmap,
                appContex.config.useBumpmap && typeof appContex.bumpmap !== "undefined" && appContex.config.showBumpmapImage
              );
              // Set the bending flag only if bendAngle if not zero.
              appContex.dildoGeneration.rebuild(
                Object.assign(appContex.config, {
                  outline: appContex.outline,
                  isBending: appContex.config.bendAngle !== 0,
                  bumpmap: appContex.bumpmap,
                  baseShape: appContex.baseShape
                } as any) // TODO: THIS IS NOT TYPE SAFE!!!
              );
              appContex.updateModifiers();
              accept(true);
            };
          })(appContex.buildId),
          50
        ); // END setTimeout
      } catch (e) {
        reject();
      }
    }); // END Promise
  };
};
