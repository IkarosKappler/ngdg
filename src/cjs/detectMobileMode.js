"use strict";
/**
 * Get mobile mode and let it params pass overrides.
 * Also set the 'mobile' class to the body if darkmode is detected.
 *
 * @date     2025-08-08
 * @modified 2025-09-10 Optimized condition check.
 * @modified 2026-03-13 Ported to typescript.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMobileMode = void 0;
var isMobileDevice_1 = require("./isMobileDevice");
/**
 *
 * @param {Params} params
 * @returns
 */
var detectMobileMode = function (params) {
    var isMobile = (0, isMobileDevice_1.isMobileDevice)();
    // Check for manual overrides.
    isMobile = params.getBoolean("isMobile", isMobile);
    console.log("[detectMobileMode] isMobile", isMobile);
    if (isMobile) {
        try {
            document.body.classList.add("mobile");
        }
        catch (exc) {
            console.warn("Warning: failed to add `darkmode` class to the body.", exc);
        }
    }
    return isMobile;
};
exports.detectMobileMode = detectMobileMode;
//# sourceMappingURL=detectMobileMode.js.map