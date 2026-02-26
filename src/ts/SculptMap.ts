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
// import { Color } from "plotboilerplate/src/ts/utils/datastructures/Color";

interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class SculptMap {
  private colorMatrix: IColor[][];
  private width: number;
  private height: number;

  private constructor(width: number, height: number) {
    this.colorMatrix = [];
    this.width = width;
    this.height = height;
  }

  toCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", `${this.width}px`);
    canvas.setAttribute("height", `${this.height}px`);
    const context = canvas.getContext("2d");

    // var id = context.createImageData(1, 1); // only do this once per page
    // var d = id.data; // only do this once per page

    for (var x = 0; x < this.width; x++) {
      const colorRow: IColor[] = [];
      for (var y = 0; y < this.height; y++) {
        const color = this.colorMatrix[y][x];
        // console.log("color", color);
        // d[0] = color.r;
        // d[1] = color.g;
        // d[2] = color.b;
        // d[3] = 0.0; // a
        // context.putImageData(id, x, y);
        // console.log("color", "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")");
        context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")";
        context.fillRect(x, y, 1, 1);
      }
    }
    // context.drawImage(image, 0, 0, rasterWidth, rasterHeight);
    // const imageData = context.getImageData(0, 0, rasterWidth, rasterHeight).data;

    return canvas;
  }

  static fromDildoGeometry(geometry: DildoGeometry): SculptMap {
    const w = geometry.getMatrixWidth();
    const h = geometry.getMatrixHeight();

    if (!w || !h) {
      return null;
    }

    const smap = new SculptMap(w, h);
    const bounds = geometry.getBounds();

    for (var y = 0; y < h; y++) {
      const colorRow: IColor[] = [];
      for (var x = 0; x < w; x++) {
        // Get Vertex
        const vert = geometry.getVertexAt(x, y);
        const r = ((vert.x - bounds.min.x) / (bounds.max.x - bounds.min.x)) * 255;
        const g = ((vert.y - bounds.min.y) / (bounds.max.y - bounds.min.y)) * 255;
        const b = ((vert.z - bounds.min.z) / (bounds.max.z - bounds.min.z)) * 255;
        const color = { r: r, g: g, b: b, a: 255 };
        colorRow.push(color);
      }
      smap.colorMatrix.push(colorRow);
    }

    return smap;
  }
}
