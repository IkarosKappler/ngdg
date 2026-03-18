/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";
import { Vertex, Polygon } from "plotboilerplate";
import { Rulers } from "../Rulers";

export const updateOutlineStats = (appContext: AppContext) => {
  return () => {
    var pathBounds = appContext.outline.getBounds();
    appContext.stats.width = pathBounds.width * Rulers.mmPerUnit;
    appContext.stats.height = pathBounds.height * Rulers.mmPerUnit;
    appContext.stats.diameter = 2 * pathBounds.width * Rulers.mmPerUnit;
    // Compute area from outline
    var vertices = appContext.outline.getEvenDistributionVertices(100);
    var bounds = appContext.outline.getBounds();
    vertices.push(new Vertex(bounds.max));
    var polygon = new Polygon(vertices, false);
    appContext.stats.area = polygon.area();
  };
};
