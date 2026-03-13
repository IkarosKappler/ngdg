/**
 * A helper function to scale and reposition the view to get optimal sight on an object.
 *
 * @author   Ikaros Kappler
 * @date     2021-12-03
 * @modified 2026-03-13 Ported to Typescript.
 * @version  1.1.0
 */
import { AppContext } from "../AppContext";
import { BezierPath, PlotBoilerplate } from "plotboilerplate";
export declare const acquireOptimalPathView: (appContext: AppContext) => (pb: PlotBoilerplate, outline: BezierPath) => void;
