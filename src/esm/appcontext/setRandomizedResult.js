/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-16 Refactored from the global `index.js`.
 */
// +---------------------------------------------------------------------------------
// | Updates the sculpt map by recalculating the image data from the 3d model.
// +-------------------------------
export const setRandomizedResult = (appContext) => {
    return (result) => {
        // setPathInstance(result.outline);
        // TODO: WHY IS PLOTBOILERPLATE NOT RECOGNIZING THE BEZIER INSTANCE???!
        //       Somehow there are two copies of the PlotBoilerplate library, A and B.
        //       A.BezierPath and B.BezierPath are not compatible :(
        // temp solution: serialize and de-serialize :/
        // appContext.setPathInstance(BezierPath.fromJSON(result.outline.toJSON()));
        appContext.setPathInstanceByJSON(result.outline.toJSON(false)); // prettyFormat=false
        appContext.config.bendAngle = result.bendAngle;
        appContext.rebuild();
    };
};
//# sourceMappingURL=setRandomizedResult.js.map