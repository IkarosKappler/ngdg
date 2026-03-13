/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 * @param newOutline
 */
import { BezierPathInteractionHelper } from "plotboilerplate/src/cjs/utils/helpers/BezierPathInteractionHelper";
export const addPathListeners = (appContex) => {
    return (path) => {
        BezierPathInteractionHelper.addPathVertexDragEndListeners(path, appContex.dragEndListener);
        BezierPathInteractionHelper.addPathVertexDragListeners(path, appContex.dragListener);
    };
};
export const removePathListeners = (appContex) => {
    return (path) => {
        BezierPathInteractionHelper.removePathVertexDragEndListeners(path, appContex.dragEndListener);
        BezierPathInteractionHelper.removePathVertexDragListeners(path, appContex.dragListener);
    };
};
//# sourceMappingURL=addRemovePathListeners.js.map