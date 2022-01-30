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
import { ConfigIO } from "./ConfigIO";
import { isMobileDevice } from "./isMobileDevice";

export const ngdg = {
  DEFAULT_BEZIER_JSON,

  ConfigIO,
  DildoGeneration,
  ImageStore,
  isMobileDevice
};
