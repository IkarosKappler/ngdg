/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { Bounds, Vertex } from "plotboilerplate";

// +---------------------------------------------------------------------------------
// | Scale a given Bounds instance to a new size (from its center).
// +-------------------------------
export const scaleBounds = (bounds: Bounds, scaleFactor: number) => {
  var center = new Vertex(bounds.min.x + bounds.width / 2.0, bounds.min.y + bounds.height / 2.0);
  return new Bounds(new Vertex(bounds.min).scale(scaleFactor, center), new Vertex(bounds.max).scale(scaleFactor, center));
};
