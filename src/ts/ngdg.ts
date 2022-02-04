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

export const ngdg = {
  DEFAULT_BEZIER_JSON,

  DEG_TO_RAD,
  SPLIT_MESH_OFFSET,
  KEY_SLICED_MESH_RIGHT,
  KEY_SLICED_MESH_LEFT,

  LocalstorageIO,
  DildoGeneration,
  ImageStore,
  isMobileDevice
};
