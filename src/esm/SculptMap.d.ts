/**
 * A sculpt map for storing any mesh that's toplogical equivalent to a sphere inside
 * a recangular image.
 *
 * As each color color channel only has 8 bits the conversion is not lossless.
 *
 * @author Ikaros Kappler
 * @date   2026-02-25
 * @version 1.0.0
 */
import { DildoGeometry } from "./DildoGeometry";
export declare class SculptMap {
    private colorMatrix;
    private width;
    private height;
    private constructor();
    toCanvas(): HTMLCanvasElement;
    static fromDildoGeometry(geometry: DildoGeometry): SculptMap;
}
