"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.showPathJSON = void 0;
var showPathJSON = function (appContext) {
    return function () {
        appContext.modal.setTitle("Show Path JSON");
        appContext.modal.setFooter("");
        appContext.modal.setActions([appContext.modal.ACTION_CLOSE]);
        var textArea = document.createElement("textarea");
        textArea.style["width"] = "100%";
        textArea.style["height"] = "100%";
        textArea.style["min-height"] = "50vh";
        textArea.innerHTML = appContext.outline.toJSON(true);
        appContext.modal.setBody(textArea);
        appContext.modal.open();
    };
};
exports.showPathJSON = showPathJSON;
//# sourceMappingURL=showPathJSON.js.map