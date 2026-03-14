/**
 * @author   Ikaros Kappler
 * @date     2021-11-07
 * @modified 2026-03-13 Ported to typescript.
 * @version  1.1.0
 *
 * @param {Record<string,string>} GUP
 * @returns {boolean}
 */

export const detectDarkMode = (GUP: Record<string, string>) => {
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
  const darkmode = !isDayTime;
  if (darkmode) {
    document.body.classList.add("darkmode");
  }
  return darkmode;
};
