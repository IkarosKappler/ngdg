"use strict";
/**
 * @date    2026-03-10
 * @version 0.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageFromCanvas = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var getImageFromCanvas = function (canvas, context, bounds) {
    var w = canvas.width;
    var h = canvas.height;
    var safeBounds = new plotboilerplate_1.Bounds(new plotboilerplate_1.Vertex(Math.max(bounds.min.x, 0), Math.min(bounds.min.y, h)), new plotboilerplate_1.Vertex(Math.max(bounds.max.x, 0), Math.min(bounds.max.y, h)));
    //   var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var imageData = context.getImageData(safeBounds.min.x, safeBounds.min.y, safeBounds.width, safeBounds.height);
    var subCanvas = document.createElement("canvas"); // new HTMLCanvasElement();
    subCanvas.setAttribute("width", "".concat(safeBounds.width));
    subCanvas.setAttribute("height", "".concat(safeBounds.height));
    var subContext = subCanvas.getContext("2d");
    subContext.putImageData(imageData, 0, 0);
    return { canvas: subCanvas, context: subContext, imageData: imageData };
};
exports.getImageFromCanvas = getImageFromCanvas;
//# sourceMappingURL=getImageFromCanvas.js.map