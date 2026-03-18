/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { AppContext } from "../AppContext";
export declare const exportSTL: (appContext: AppContext, makeSTLExporter: () => STLExporter) => () => void;
