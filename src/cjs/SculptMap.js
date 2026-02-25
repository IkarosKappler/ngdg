"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SculptMap = void 0;
var SculptMap = /** @class */ (function () {
    function SculptMap(width, height) {
        this.colorMatrix = [];
        this.width = width;
        this.height = height;
    }
    SculptMap.prototype.toCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", "".concat(this.width, "px"));
        canvas.setAttribute("height", "".concat(this.height, "px"));
        var context = canvas.getContext("2d");
        // var id = context.createImageData(1, 1); // only do this once per page
        // var d = id.data; // only do this once per page
        for (var x = 0; x < this.width; x++) {
            var colorRow = [];
            for (var y = 0; y < this.height; y++) {
                var color = this.colorMatrix[y][x];
                // console.log("color", color);
                // d[0] = color.r;
                // d[1] = color.g;
                // d[2] = color.b;
                // d[3] = 0.0; // a
                // context.putImageData(id, x, y);
                context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")";
                console.log("color", "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")");
                context.fillRect(x, y, 1, 1);
            }
        }
        // context.drawImage(image, 0, 0, rasterWidth, rasterHeight);
        // const imageData = context.getImageData(0, 0, rasterWidth, rasterHeight).data;
        return canvas;
    };
    SculptMap.fromDildoGeometry = function (geometry) {
        var w = geometry.getMatrixWidth();
        var h = geometry.getMatrixHeight();
        if (!w || !h) {
            return null;
        }
        var smap = new SculptMap(w, h);
        var bounds = geometry.getBounds();
        for (var y = 0; y < h; y++) {
            var colorRow = [];
            for (var x = 0; x < w; x++) {
                // Get Vertex
                var vert = geometry.getVertexAt(x, y);
                var r = Math.floor(Math.random() * 255);
                var g = Math.floor(Math.random() * 255);
                var b = Math.floor(Math.random() * 255);
                // const color = new Color().setRed(r).setGreen(g).setBlue(b);
                var color = { r: r, g: g, b: b, a: 255 };
                colorRow.push(color);
            }
            smap.colorMatrix.push(colorRow);
        }
        return smap;
    };
    return SculptMap;
}());
exports.SculptMap = SculptMap;
//# sourceMappingURL=SculptMap.js.map