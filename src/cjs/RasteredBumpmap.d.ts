/**
 * @author Ikaros Kappler
 * @version 1.0.0
 * @date    2021-09-02
 */
import { IBumpmap } from "./interfaces";
export declare class RasteredBumpmap implements IBumpmap {
    image: HTMLImageElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    /**
     * Contains the pixel data as a raw array of RGBA values (each pixel has 4 array entries).
     * @member {Uint8ClampedArray} imageData
     * @memberof {Bumpmap}
     */
    imageData: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(image: HTMLImageElement, rasterWidth?: number, rasterHeight?: number);
    /**
     * Get the bumpmap's height-value at the given relative coordinates.
     *
     * @param {number} ratioX - A value for the horizontal position, must be in [0..1].
     * @param {number} ratioY - A value for the vertical position, must be in [0..1].
     * @return {number} The bumpmap's height value in the range [0..1].
     */
    getHeightAt(ratioX: number, ratioY: number): number;
    /**
     * Get a preview image to use in the DOM.
     *
     * @return {HTMLImageElement}
     */
    createPreviewImage(): HTMLImageElement;
}
