/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { ngdg } from "../ngdg";
// +---------------------------------------------------------------------------------
// | Whenever the modifier settings change (post built and post split) apply
// | them here: rotation and translation.
// +-------------------------------
export const updateModifiers = (appContex) => {
    return () => {
        // Fetch the sliced result (if options tell it was created)
        // and apply some modifiers.
        if (appContex.config.performSlice) {
            if (appContex.dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_RIGHT]) {
                var rightSliceMesh = appContex.dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_RIGHT];
                rightSliceMesh.rotation.x = appContex.config.leftSplitMeshRotationX * ngdg.DEG_TO_RAD;
                rightSliceMesh.rotation.y = appContex.config.leftSplitMeshRotationY * ngdg.DEG_TO_RAD;
                rightSliceMesh.rotation.z = appContex.config.leftSplitMeshRotationZ * ngdg.DEG_TO_RAD;
                rightSliceMesh.position.x = appContex.config.leftSplitMeshTranslationX;
                rightSliceMesh.position.y = appContex.config.leftSplitMeshTranslationY;
                rightSliceMesh.position.z = appContex.config.leftSplitMeshTranslationZ;
            }
            if (appContex.dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_LEFT]) {
                var leftSliceMesh = appContex.dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_LEFT];
                leftSliceMesh.rotation.x = appContex.config.rightSplitMeshRotationX * ngdg.DEG_TO_RAD;
                leftSliceMesh.rotation.y = appContex.config.rightSplitMeshRotationY * ngdg.DEG_TO_RAD;
                leftSliceMesh.rotation.z = appContex.config.rightSplitMeshRotationZ * ngdg.DEG_TO_RAD;
                leftSliceMesh.position.x = appContex.config.rightSplitMeshTranslationX;
                leftSliceMesh.position.y = appContex.config.rightSplitMeshTranslationY;
                leftSliceMesh.position.z = appContex.config.rightSplitMeshTranslationZ;
            }
        }
    };
};
//# sourceMappingURL=updateModifiers.js.map