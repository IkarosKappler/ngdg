/**
 * Get mobile mode and let it params pass overrides.
 * Also set the 'mobile' class to the body if darkmode is detected.
 *
 * @date     2025-08-08
 * @modified 2025-09-10 Optimized condition check.
 * @modified 2026-03-13 Ported to typescript.
 */
import { isMobileDevice } from "./isMobileDevice";
/**
 *
 * @param {Params} params
 * @returns
 */
export const detectMobileMode = (params) => {
    var isMobile = isMobileDevice();
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
//# sourceMappingURL=detectMobileMode.js.map