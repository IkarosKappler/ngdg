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
import { WebColorsMalachite } from "plotboilerplate/src/esm/utils/WebColorsMalachite";
import { WebColorsContrast } from "plotboilerplate/src/esm/utils/WebColorsContrast";
import { WebColors } from "plotboilerplate/src/esm/utils/WebColors";
/**
 * Pick a color from the WebColors array.
 *
 * All params are optional.
 *
 * @param {number=undefined} index
 * @param {"Malachite"|"Mixed"|"WebColors"} colorSet
 **/
export const randomWebColor = (index, colorSet) => {
    if (typeof index === "undefined") {
        var maxLen = Math.max(typeof WebColorsMalachite !== "undefined" ? WebColorsMalachite.length : 0, typeof WebColorsContrast !== "undefined" ? WebColorsContrast.length : 0, typeof WebColors !== "undefined" ? WebColors.length : 0);
        index = Math.round(Math.random() * maxLen);
    }
    switch (colorSet) {
        case "Malachite":
            if (typeof WebColorsMalachite !== "undefined") {
                return WebColorsMalachite[index % WebColorsMalachite.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsMalachite' color palette but it is not installed. Falling back.");
            }
        case "Mixed":
            if (typeof WebColorsContrast !== "undefined") {
                return WebColorsContrast[index % WebColorsContrast.length].cssRGB();
            }
            else {
                console.warn("You decided to use the 'WebColorsContrast' color palette but it is not installed. Falling back.");
            }
        case "WebColors":
        default:
            return WebColors[index % WebColors.length].cssRGB();
    }
};
//# sourceMappingURL=randomWebColor.js.map