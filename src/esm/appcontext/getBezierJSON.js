/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
export const getBezierJSON = (appContext) => {
    return (prettyFormat) => {
        return appContext.outline ? appContext.outline.toJSON(prettyFormat) : null;
    };
};
//# sourceMappingURL=getBezierJSON.js.map