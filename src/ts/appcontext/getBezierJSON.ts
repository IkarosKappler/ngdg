/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";

export const getBezierJSON = (appContext: AppContext) => {
  return (prettyFormat?: boolean) => {
    return appContext.outline ? appContext.outline.toJSON(prettyFormat) : null;
  };
};
