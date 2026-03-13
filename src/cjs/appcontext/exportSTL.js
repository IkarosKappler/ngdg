"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSTL = void 0;
// +---------------------------------------------------------------------------------
// | Export the model as an STL file.
// +-------------------------------
var exportSTL = function (appContext, makeSTLExporter) {
    return function () {
        function saveFile(data, filename) {
            appContext.saveAs(new Blob([data], { type: "application/sla" }), filename);
        }
        appContext.modal.setTitle("Export STL");
        appContext.modal.setFooter("");
        appContext.modal.setActions([
            {
                label: "Cancel",
                action: function () {
                    appContext.modal.close();
                    console.log("canceled");
                }
            }
        ]);
        appContext.modal.setBody("Loading ...");
        appContext.modal.open();
        try {
            appContext.dildoGeneration.generateSTL({
                onComplete: function (stlData) {
                    window.setTimeout(function () {
                        appContext.modal.setBody("File ready.");
                        appContext.modal.setActions([appContext.modal.ACTION_CLOSE]);
                        saveFile(stlData, "dildomodel.stl");
                    }, 500);
                    // modal.close();
                }
            }, 
            // new THREE.STLExporter()
            makeSTLExporter());
        }
        catch (e) {
            console.error(e);
            appContext.modal.setBody("Error: " + e);
            appContext.modal.setActions([appContext.modal.ACTION_CLOSE]);
            appContext.modal.open();
        }
    };
};
exports.exportSTL = exportSTL;
//# sourceMappingURL=exportSTL.js.map