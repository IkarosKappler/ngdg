/**
 * @author  Ikaros Kappler
 * @date    2021-11-07
 * @version 1.0.0
 *
 * @param {Record<string,string>} GUP
 * @returns {boolean}
 */

function detectDarkMode(GUP) {
  // Respect overrides
  if (typeof GUP !== "undefined" && GUP.hasOwnProperty("darkmode") && GUP["darkmode"]) {
    var overrideValue = GUP["darkmode"];
    if (overrideValue === "0" || overrideValue.toLowerCase() === "false") {
      return false;
    } else if (overrideValue === "1" || overrideValue.toLowerCase() === "true") {
      return true;
    }
  }
  var hours = new Date().getHours();
  var isDayTime = hours > 6 && hours < 18;
  return !isDayTime;
}
