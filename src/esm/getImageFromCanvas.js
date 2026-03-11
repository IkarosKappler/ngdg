/**
 * @date    2026-03-10
 * @version 0.0.1
 */
import { Bounds, Vertex } from "plotboilerplate";
export const getImageFromCanvas = (canvas, context, bounds) => {
    const w = canvas.width;
    const h = canvas.height;
    const safeBounds = new Bounds(new Vertex(Math.max(bounds.min.x, 0), Math.min(bounds.min.y, h)), new Vertex(Math.max(bounds.max.x, 0), Math.min(bounds.max.y, h)));
    //   var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var imageData = context.getImageData(safeBounds.min.x, safeBounds.min.y, safeBounds.width, safeBounds.height);
    var subCanvas = document.createElement("canvas"); // new HTMLCanvasElement();
    subCanvas.setAttribute("width", `${safeBounds.width}`);
    subCanvas.setAttribute("height", `${safeBounds.height}`);
    const subContext = subCanvas.getContext("2d");
    subContext.putImageData(imageData, 0, 0);
    return { canvas: subCanvas, context: subContext, imageData: imageData };
};
//# sourceMappingURL=getImageFromCanvas.js.map