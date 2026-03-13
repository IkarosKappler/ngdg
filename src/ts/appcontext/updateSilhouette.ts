/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";
import { ngdg } from "../ngdg";

// +---------------------------------------------------------------------------------
// | Updates the sculpt map by recalculating the image data from the 3d model.
// +-------------------------------
export const updateSilhouette = (appContext: AppContext) => {
  return (noRedraw: boolean) => {
    // TODO: baseShape updating belongs elsewhere!
    const baseRadius = appContext.outline.getBounds().width;

    appContext.baseShape = ngdg.GeometryGenerationHelpers.mkCircularPolygon(
      baseRadius,
      appContext.config.shapeSegmentCount,
      appContext.config.baseShapeExcentricity
    );
    // Also draw the bent 2D dildo outline?
    appContext.dildoSilhouette = new ngdg.DildoSilhouette2D({
      baseShape: appContext.baseShape,
      outline: appContext.outline,
      outlineSegmentCount: appContext.config.outlineSegmentCount,
      bendAngleRad: appContext.config.bendAngle * ngdg.DEG_TO_RAD,
      bendAngleDeg: appContext.config.bendAngle,
      // TODO: IS THIS REALLY IN USE???s
      isBending: false // appContext.config.isBending
    });
    if (!noRedraw) {
      appContext.pb.redraw();
    }
  };
};
