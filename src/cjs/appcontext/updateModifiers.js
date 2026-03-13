"use strict";
/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModifiers = void 0;
var ngdg_1 = require("../ngdg");
// +---------------------------------------------------------------------------------
// | Whenever the modifier settings change (post built and post split) apply
// | them here: rotation and translation.
// +-------------------------------
var updateModifiers = function (appContex) {
    return function () {
        // Fetch the sliced result (if options tell it was created)
        // and apply some modifiers.
        if (appContex.config.performSlice) {
            if (appContex.dildoGeneration.splitResults[ngdg_1.ngdg.KEY_SLICED_MESH_RIGHT]) {
                var rightSliceMesh = appContex.dildoGeneration.splitResults[ngdg_1.ngdg.KEY_SLICED_MESH_RIGHT];
                rightSliceMesh.rotation.x = appContex.config.leftSplitMeshRotationX * ngdg_1.ngdg.DEG_TO_RAD;
                rightSliceMesh.rotation.y = appContex.config.leftSplitMeshRotationY * ngdg_1.ngdg.DEG_TO_RAD;
                rightSliceMesh.rotation.z = appContex.config.leftSplitMeshRotationZ * ngdg_1.ngdg.DEG_TO_RAD;
                rightSliceMesh.position.x = appContex.config.leftSplitMeshTranslationX;
                rightSliceMesh.position.y = appContex.config.leftSplitMeshTranslationY;
                rightSliceMesh.position.z = appContex.config.leftSplitMeshTranslationZ;
            }
            if (appContex.dildoGeneration.splitResults[ngdg_1.ngdg.KEY_SLICED_MESH_LEFT]) {
                var leftSliceMesh = appContex.dildoGeneration.splitResults[ngdg_1.ngdg.KEY_SLICED_MESH_LEFT];
                leftSliceMesh.rotation.x = appContex.config.rightSplitMeshRotationX * ngdg_1.ngdg.DEG_TO_RAD;
                leftSliceMesh.rotation.y = appContex.config.rightSplitMeshRotationY * ngdg_1.ngdg.DEG_TO_RAD;
                leftSliceMesh.rotation.z = appContex.config.rightSplitMeshRotationZ * ngdg_1.ngdg.DEG_TO_RAD;
                leftSliceMesh.position.x = appContex.config.rightSplitMeshTranslationX;
                leftSliceMesh.position.y = appContex.config.rightSplitMeshTranslationY;
                leftSliceMesh.position.z = appContex.config.rightSplitMeshTranslationZ;
            }
        }
    };
};
exports.updateModifiers = updateModifiers;
//# sourceMappingURL=updateModifiers.js.map