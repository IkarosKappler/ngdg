/**
 * Refactored from some older code from 2020.
 *
 * @requires WebColors
 * @requires WebColorsMalachite
 * @requires WebColorsContrast
 *
 * @author  Ikaros Kappler
 * @date    2021-07-14
 * @version 1.0.0
 */

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
    var maxLen = Math.max(
      typeof WebColorsMalachite !== "undefined" ? WebColorsMalachite.length : 0,
      typeof WebColorsContrast !== "undefined" ? WebColorsContrast.length : 0,
      typeof WebColors !== "undefined" ? WebColors.length : 0
    );
    index = Math.round(Math.random() * maxLen);
  }
  switch (colorSet) {
    case "Malachite":
      if (typeof WebColorsMalachite !== "undefined") {
        return WebColorsMalachite[index % WebColorsMalachite.length].cssRGB();
      } else {
        console.warn("You decided to use the 'WebColorsMalachite' color palette but it is not installed. Falling back.");
      }
    case "Mixed":
      if (typeof WebColorsContrast !== "undefined") {
        return WebColorsContrast[index % WebColorsContrast.length].cssRGB();
      } else {
        console.warn("You decided to use the 'WebColorsContrast' color palette but it is not installed. Falling back.");
      }
    case "WebColors":
    default:
      return WebColors[index % WebColors.length].cssRGB();
  }
};
