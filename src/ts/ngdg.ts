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

export const ngdg = {
  DEFAULT_BEZIER_JSON,

  DEG_TO_RAD,
  SPLIT_MESH_OFFSET,
  KEY_SLICED_MESH_RIGHT,
  KEY_SLICED_MESH_LEFT,

  AppContext,
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
  SculptMap,
  setPathInstance
};
