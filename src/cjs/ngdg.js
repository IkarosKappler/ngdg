"use strict";
/**
 * This defines the globally exported wrapper library.
 *
 * See ./src/cjs/entry.js
 *
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-09-27
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngdg = void 0;
var defaults_1 = require("./defaults");
var ImageStore_1 = require("./ImageStore");
var DildoGeneration_1 = require("./DildoGeneration");
var ConfigIO_1 = require("./ConfigIO");
exports.ngdg = {
    DEFAULT_BEZIER_JSON: defaults_1.DEFAULT_BEZIER_JSON,
    DildoGeneration: DildoGeneration_1.DildoGeneration,
    ImageStore: ImageStore_1.ImageStore,
    ConfigIO: ConfigIO_1.ConfigIO
};
//# sourceMappingURL=ngdg.js.map