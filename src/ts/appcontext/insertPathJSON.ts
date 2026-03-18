/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";

export const insertPathJSON = (appContext: AppContext) => {
  return () => {
    var textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "50vh";
    textarea.innerHTML = appContext.outline.toJSON(true);
    appContext.modal.setTitle("Insert Path JSON");
    appContext.modal.setFooter("");
    appContext.modal.setActions([
      appContext.modal.ACTION_CANCEL,
      {
        label: "Load JSON",
        action: function () {
          appContext.loadPathJSON(textarea.value);
          appContext.modal.close();
        }
      }
    ]);
    appContext.modal.setBody(textarea);
    appContext.modal.open();
  };
};
