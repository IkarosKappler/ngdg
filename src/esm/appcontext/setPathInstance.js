/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { BezierPathInteractionHelper, Line } from "plotboilerplate";
export const setPathInstance = (appContext) => {
    return (newOutline, bendAngle) => {
        if (typeof appContext.outline != "undefined") {
            appContext.pb.removeAll(false, false); // keepVertices=false, triggerRedraw=false
        }
        appContext.outline = newOutline;
        if (typeof bendAngle === "number") {
            appContext.config.bendAngle = bendAngle;
        }
        appContext.addPathListeners(appContext.outline);
        appContext.updateSilhouette(true); // noRedraw=true
        appContext.updatePathResizer(false); // triggerRedraw=false
        appContext.pb.add(newOutline);
        // pb.add(BezierPath.fromJSON(newOutline.toJSON()));
        // +---------------------------------------------------------------------------------
        // | Install a Bézier interaction helper.
        // +-------------------------------
        new BezierPathInteractionHelper(appContext.pb, [appContext.outline], {
            maxDetectDistance: 32.0,
            autoAdjustPaths: true,
            allowPathRemoval: false, // It is not alowed to remove the outline path
            onPointerMoved: function (pathIndex, newA, newB, newT) {
                if (pathIndex == -1) {
                    appContext.bezierDistanceLine = null;
                }
                else {
                    appContext.bezierDistanceLine = new Line(newA, newB);
                    appContext.bezierDistanceT = newT;
                }
            },
            onVertexInserted: function (pathIndex, insertAfterIndex, newPath, oldPath) {
                console.log("[pathIndex=" + pathIndex + "] Vertex inserted after " + insertAfterIndex);
                console.log("oldPath", oldPath, "newPath", newPath);
                appContext.removePathListeners(appContext.outline);
                appContext.outline = newPath;
                appContext.addPathListeners(appContext.outline);
                appContext.rebuild();
            },
            onVerticesDeleted: function (pathIndex, deletedVertIndices, newPath, oldPath) {
                console.log("[pathIndex=" + pathIndex + "] vertices deleted", deletedVertIndices);
                appContext.removePathListeners(appContext.outline);
                appContext.outline = newPath;
                appContext.addPathListeners(appContext.outline);
                appContext.rebuild();
            }
        });
    }; // END setPathInstance
};
//# sourceMappingURL=setPathInstance.js.map