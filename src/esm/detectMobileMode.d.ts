/**
 * Get mobile mode and let it params pass overrides.
 * Also set the 'mobile' class to the body if darkmode is detected.
 *
 * @date     2025-08-08
 * @modified 2025-09-10 Optimized condition check.
 * @modified 2026-03-13 Ported to typescript.
 */
import { Params } from "plotboilerplate/src/ts/utils/Params";
/**
 *
 * @param {Params} params
 * @returns
 */
export declare const detectMobileMode: (params: Params) => boolean;
