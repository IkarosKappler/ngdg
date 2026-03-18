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
var plotboilerplate_1 = require("plotboilerplate");
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
        var maxLen = Math.max(typeof plotboilerplate_1.WebColorsMalachite !== "undefined" ? plotboilerplate_1.WebColorsMalachite.length : 0, typeof plotboilerplate_1.WebColorsContrast !== "undefined" ? plotboilerplate_1.WebColorsContrast.length : 0, typeof plotboilerplate_1.WebColors !== "undefined" ? plotboilerplate_1.WebColors.length : 0);
        index = Math.round(Math.random() * maxLen);
    }
    switch (colorSet) {
        case "Malachite":
            if (typeof plotboilerplate_1.WebColorsMalachite !== "undefined") {
                return plotboilerplate_1.WebColorsMalachite[index % plotboilerplate_1.WebColorsMalachite.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsMalachite' color palette but it is not installed. Falling back.");
            }
        case "Mixed":
            if (typeof plotboilerplate_1.WebColorsContrast !== "undefined") {
                return plotboilerplate_1.WebColorsContrast[index % plotboilerplate_1.WebColorsContrast.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsContrast' color palette but it is not installed. Falling back.");
            }
        case "WebColors":
        default:
            return plotboilerplate_1.WebColors[index % plotboilerplate_1.WebColors.length].cssRGB();
    }
};
exports.randomWebColor = randomWebColor;
//# sourceMappingURL=randomWebColor.js.map