/**
 * Get mobile mode and let it params pass overrides.
 *
 * @date     2025-08-08
 * @modified 2025-09-10 Optimized condition check.
 */

/**
 *
 * @param {Params} params
 * @returns
 */
function detectMobileMode(params) {
  var isMobile = isMobileDevice();

  // Check for overrides.
  return params.getBoolean("isMobile", isMobile);
}
