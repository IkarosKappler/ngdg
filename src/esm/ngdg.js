/**
 * This defines the globally exported wrapper library.
 *
 * See ./src/cjs/entry.js
 *
 * @author   Ikaros Kappler
 * @version  1.0.0
 * @date     2021-09-27
 * @modified 2022-01-29
 */
import { DEFAULT_BEZIER_JSON } from "./defaults";
import { ImageStore } from "./ImageStore";
import { DildoGeneration } from "./DildoGeneration";
import { LocalstorageIO } from "./LocalstorageIO";
import { isMobileDevice } from "./isMobileDevice";
import { DEG_TO_RAD, KEY_SLICED_MESH_LEFT, KEY_SLICED_MESH_RIGHT, SPLIT_MESH_OFFSET } from "./constants";
import { SculptMap } from "./SculptMap";
import { DildoSilhouette2D } from "./DildoSilhouette2D";
import { GeometryGenerationHelpers } from "./GeometryGenerationHelpers";
import { DildoRandomizer } from "./DildoRandomizer";
import { randomWebColor } from "./randomWebColor";
import { getImageFromCanvas } from "./getImageFromCanvas";
import { detectDarkMode } from "./detectDarkMode";
import { AppContext } from "./AppContext";
import { setPathInstance } from "./appcontext/setPathInstance";
import { Rulers } from "./Rulers";
import { acquireOptimalView } from "./appcontext/acquireOptimalView";
import { addPathListeners, removePathListeners } from "./appcontext/addRemovePathListeners";
import { acquireOptimalPathView } from "./appcontext/acquireOptimalPathView";
import { exportSTL } from "./appcontext/exportSTL";
import { fitViewToSilhouette } from "./appcontext/fitViewToSilhouette";
import { getSculptmapDataURL } from "./appcontext/getSculptmapDataURL";
import { handlePathVisibilityChanged } from "./appcontext/handlePathVisibilityChanged";
import { initConfig } from "./appcontext/initConfig";
import { initStats } from "./appcontext/initStats";
import { insertPathJSON } from "./appcontext/insertPathJSON";
import { rebuild } from "./appcontext/rebuild";
import { loadPathJSON } from "./appcontext/loadPathJSON";
import { setDefaultPathInstance } from "./appcontext/setDefaultPathInstance";
import { showPathJSON } from "./appcontext/showPathJSON";
import { updateBumpmapPreview } from "./appcontext/updateBumpmapPreview";
import { updateModifiers } from "./appcontext/updateModifiers";
import { updateOutlineStats } from "./appcontext/updateOutlineStats";
import { updatePathResizer } from "./appcontext/updatePathResizer";
import { updateSilhouette } from "./appcontext/updateSilhouette";
import { getBezierJSON } from "./appcontext/getBezierJSON";
import { scaleBounds } from "./scaleBounds";
import { filedropHandler } from "./appcontext/filedropHandler";
import { retrieveFromLocalStorage } from "./appcontext/retrieveFromLocalStorage";
// import * as UIStats from "uistats-typescript";
export const ngdg = {
    DEFAULT_BEZIER_JSON,
    DEG_TO_RAD,
    SPLIT_MESH_OFFSET,
    KEY_SLICED_MESH_RIGHT,
    KEY_SLICED_MESH_LEFT,
    AppContext,
    acquireOptimalView,
    addPathListeners,
    removePathListeners,
    acquireOptimalPathView,
    exportSTL,
    filedropHandler,
    fitViewToSilhouette,
    getBezierJSON,
    getSculptmapDataURL,
    handlePathVisibilityChanged,
    initConfig,
    initStats,
    insertPathJSON,
    loadPathJSON,
    rebuild,
    retrieveFromLocalStorage,
    setDefaultPathInstance,
    setPathInstance,
    showPathJSON,
    updateBumpmapPreview,
    updateModifiers,
    updateOutlineStats,
    updatePathResizer,
    updateSilhouette,
    detectDarkMode,
    DildoGeneration,
    DildoRandomizer,
    DildoSilhouette2D,
    GeometryGenerationHelpers,
    getImageFromCanvas,
    ImageStore,
    isMobileDevice,
    LocalstorageIO,
    randomWebColor,
    Rulers,
    scaleBounds,
    SculptMap
    // UIStats
};
//# sourceMappingURL=ngdg.js.map