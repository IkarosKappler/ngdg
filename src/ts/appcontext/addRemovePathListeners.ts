/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 * @param newOutline
 */

import { BezierPath } from "plotboilerplate/src/cjs/BezierPath";
import { BezierPathInteractionHelper } from "plotboilerplate/src/cjs/utils/helpers/BezierPathInteractionHelper";
import { AppContext } from "../AppContext";

export const addPathListeners = (appContex: AppContext) => {
  return (path: BezierPath) => {
    BezierPathInteractionHelper.addPathVertexDragEndListeners(path, appContex.dragEndListener);
    BezierPathInteractionHelper.addPathVertexDragListeners(path, appContex.dragListener);
  };
};

export const removePathListeners = (appContex: AppContext) => {
  return (path: BezierPath) => {
    BezierPathInteractionHelper.removePathVertexDragEndListeners(path, appContex.dragEndListener);
    BezierPathInteractionHelper.removePathVertexDragListeners(path, appContex.dragListener);
  };
};
