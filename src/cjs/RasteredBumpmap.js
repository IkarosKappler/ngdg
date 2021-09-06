"use strict";
/**
 * @author Ikaros Kappler
 * @version 1.0.0
 * @date    2021-09-02
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RasteredBumpmap = void 0;
var RasteredBumpmap = /** @class */ (function () {
    function RasteredBumpmap(image) {
        // TODO ...
        console.log("Creating Bumpmap", image, image.naturalWidth, image.naturalHeight);
        // var img = new Image();
        // img.src = url;
        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", image.naturalWidth + "px");
        canvas.setAttribute("height", image.naturalHeight + "px");
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
    RasteredBumpmap.prototype.getHeightAt = function (ratioX, ratioY) {
        var x = Math.floor((this.width - 1) * clamp(ratioX, 0.0, 1.0));
        var y = Math.floor((this.height - 1) * clamp(ratioY, 0.0, 1.0));
        var offset = (y * this.width + x) * 4;
        // const offset: number = y * this.width + x;
        // Each pixel value must a byte, so each component is in [0..255]
        var pixel = {
            r: this.imageData[offset],
            g: this.imageData[offset + 1],
            b: this.imageData[offset + 2],
            a: this.imageData[offset + 3] // Ignore alpha channel?
        };
        // Convert rgb pixel data to `radiant intensity`
        // https://computergraphics.stackexchange.com/questions/5085/light-intensity-of-an-rgb-value
        var brightness = (0.21 * pixel.r + 0.72 * pixel.g + 0.07 * pixel.b) / 255;
        return brightness;
    };
    return RasteredBumpmap;
}());
exports.RasteredBumpmap = RasteredBumpmap;
var clamp = function (n, min, max) {
    return Math.max(Math.min(n, max), min);
};
//# sourceMappingURL=RasteredBumpmap.js.map