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
var THREE = require("three");
var three_geometry_hellfix_1 = require("three-geometry-hellfix");
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
                // console.log("color", "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")");
                context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a / 255 + ")";
                context.fillRect(x, y, 1, 1);
            }
        }
        // context.drawImage(image, 0, 0, rasterWidth, rasterHeight);
        // const imageData = context.getImageData(0, 0, rasterWidth, rasterHeight).data;
        return canvas;
    };
    SculptMap.prototype.toGeometry = function (dimension) {
        var gmetry = new three_geometry_hellfix_1.Gmetry();
        // Create cylinder geometry
        var indexMatrix = [];
        var geometrySize = dimension || {
            width: 1.0,
            height: 1.0,
            depth: 1.0
        };
        for (var y = 0; y < this.height; y++) {
            var row = [];
            for (var x = 0; x < this.width; x++) {
                var vertIndex = gmetry.vertices.length;
                var vert = new THREE.Vector3();
                var color = this.colorMatrix[y][x];
                vert.x = (color.r / 255.0) * geometrySize.width;
                vert.y = (color.g / 255.0) * geometrySize.height;
                vert.z = (color.b / 255.0) * geometrySize.depth;
                gmetry.vertices.push(vert);
                row.push(vertIndex);
            }
            indexMatrix.push(row);
        }
        // Connect?
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                if (y > 0 && x > 0) {
                    gmetry.faces.push(new three_geometry_hellfix_1.Face3(indexMatrix[y][x], indexMatrix[y - 1][x], indexMatrix[y][x - 1]));
                }
            }
        }
        return gmetry.toBufferGeometry();
    };
    /**
     * Create a sculpt map from the given dildo geometry.
     *
     * @param {DildoGeometry} geometry
     * @returns {SculptMap}
     */
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
                var r = ((vert.x - bounds.min.x) / (bounds.max.x - bounds.min.x)) * 255;
                var g = ((vert.y - bounds.min.y) / (bounds.max.y - bounds.min.y)) * 255;
                var b = ((vert.z - bounds.min.z) / (bounds.max.z - bounds.min.z)) * 255;
                var color = { r: r, g: g, b: b, a: 255 };
                colorRow.push(color);
            }
            smap.colorMatrix.push(colorRow);
        }
        return smap;
    };
    SculptMap.fromPixelData = function (pixelData) {
        var w = pixelData.width;
        var h = pixelData.height;
        var sculptMap = new SculptMap(w, h);
        // sculptMap.colorMatrix = []; // Array(h);
        for (var y = 0; y < h; y++) {
            var row = [];
            for (var x = 0; x < w; x++) {
                row.push({ r: NaN, g: NaN, b: NaN, a: NaN });
            }
            sculptMap.colorMatrix.push(row);
        }
        // Loop over each pixel and invert the color.
        var data = pixelData.data;
        var dataLength = data.length;
        var x = 0;
        var y = 0;
        for (var i = 0, n = dataLength; i < n && x < w && y < h; i += 4) {
            var color = sculptMap.colorMatrix[y][x];
            color.r = 255 - data[i];
            color.g = 255 - data[i + 1];
            color.b = 255 - data[i + 2];
            color.a = 255 - data[i + 3]; // Not really in use
            x++;
            if (x >= w) {
                x = 0;
                y++;
            }
        }
        console.log("sculptMap.colorMatrix", sculptMap.colorMatrix);
        return sculptMap;
    };
    return SculptMap;
}());
exports.SculptMap = SculptMap;
//# sourceMappingURL=SculptMap.js.map