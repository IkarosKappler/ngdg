/**
 * @author Ikaros Kappler
 * @version 1.0.0
 * @date    2021-09-02
 */

import { IBumpmap } from "./interfaces";

interface IPixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class RasteredBumpmap implements IBumpmap {
  image: HTMLImageElement;
  context: CanvasRenderingContext2D;

  /**
   * Contains the pixel data as a raw array of RGBA values (each pixel has 4 array entries).
   * @member {Uint8ClampedArray} imageData
   * @memberof {Bumpmap}
   */
  imageData: Uint8ClampedArray;

  width: number;
  height: number;

  constructor(image: HTMLImageElement) {
    // TODO ...
    console.log("Creating Bumpmap", image, image.naturalWidth, image.naturalHeight);

    // var img = new Image();
    // img.src = url;
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.setAttribute("width", `${image.naturalWidth}px`);
    canvas.setAttribute("height", `${image.naturalHeight}px`);
    this.context = canvas.getContext("2d");
    this.context.drawImage(image, 0, 0);
    this.imageData = this.context.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
    this.image = image;
    this.width = this.image.naturalWidth;
    this.height = this.image.naturalHeight;

    // document.getElementById("testoutput").appendChild(canvas);
    // document.getElementById("testoutput").style.display = "block";
  }

  /**
   * Get the bumpmap's height-value at the given relative coordinates.
   *
   * @param {number} ratioX - A value for the horizontal position, must be in [0..1].
   * @param {number} ratioY - A value for the vertical position, must be in [0..1].
   * @return {number} The bumpmap's height value in the range [0..1].
   */
  getHeightAt(ratioX: number, ratioY: number): number {
    const x: number = Math.floor((this.width - 1) * clamp(ratioX, 0.0, 1.0));
    const y: number = Math.floor((this.height - 1) * clamp(ratioY, 0.0, 1.0));
    const offset: number = (y * this.width + x) * 4;
    // const offset: number = y * this.width + x;
    // Each pixel value must a byte, so each component is in [0..255]
    var pixel: IPixel = {
      r: this.imageData[offset],
      g: this.imageData[offset + 1],
      b: this.imageData[offset + 2],
      a: this.imageData[offset + 3] // Ignore alpha channel?
    };
    // Convert rgb pixel data to `radiant intensity`
    // https://computergraphics.stackexchange.com/questions/5085/light-intensity-of-an-rgb-value
    const brightness: number = (0.21 * pixel.r + 0.72 * pixel.g + 0.07 * pixel.b) / 255;
    return brightness;
  }
}

const clamp = (n: number, min: number, max: number) => {
  return Math.max(Math.min(n, max), min);
};
