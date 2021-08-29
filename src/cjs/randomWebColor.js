"use strict";
/**
 * Refactored from some older code from 2020.
 *
 * @requires WebColors
 * @requires WebColorsMalachite
 * @requires WebColorsContrast
 *
 * @author   Ikaros Kappler
 * @date     2021-07-14
 * @modified 2021-08-29 Ported to Typescript from vanilla Js.
 * @version  1.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomWebColor = void 0;
var WebColorsMalachite_1 = require("plotboilerplate/src/esm/utils/WebColorsMalachite");
var WebColorsContrast_1 = require("plotboilerplate/src/esm/utils/WebColorsContrast");
var WebColors_1 = require("plotboilerplate/src/esm/utils/WebColors");
/**
 * Pick a color from the WebColors array.
 *
 * All params are optional.
 *
 * @param {number=undefined} index
 * @param {"Malachite"|"Mixed"|"WebColors"} colorSet
 **/
var randomWebColor = function (index, colorSet) {
    if (typeof index === "undefined") {
        var maxLen = Math.max(typeof WebColorsMalachite_1.WebColorsMalachite !== "undefined" ? WebColorsMalachite_1.WebColorsMalachite.length : 0, typeof WebColorsContrast_1.WebColorsContrast !== "undefined" ? WebColorsContrast_1.WebColorsContrast.length : 0, typeof WebColors_1.WebColors !== "undefined" ? WebColors_1.WebColors.length : 0);
        index = Math.round(Math.random() * maxLen);
    }
    switch (colorSet) {
        case "Malachite":
            if (typeof WebColorsMalachite_1.WebColorsMalachite !== "undefined") {
                return WebColorsMalachite_1.WebColorsMalachite[index % WebColorsMalachite_1.WebColorsMalachite.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsMalachite' color palette but it is not installed. Falling back.");
            }
        case "Mixed":
            if (typeof WebColorsContrast_1.WebColorsContrast !== "undefined") {
                return WebColorsContrast_1.WebColorsContrast[index % WebColorsContrast_1.WebColorsContrast.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsContrast' color palette but it is not installed. Falling back.");
            }
        case "WebColors":
        default:
            return WebColors_1.WebColors[index % WebColors_1.WebColors.length].cssRGB();
    }
};
exports.randomWebColor = randomWebColor;
//# sourceMappingURL=randomWebColor.js.map