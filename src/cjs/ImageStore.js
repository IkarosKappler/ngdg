"use strict";
/**
 * @author  Ikaros Kappler
 * @date    2021-09-02
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageStore = void 0;
exports.ImageStore = (function () {
    var imageMap = new Map();
    var Store = {
        getImage: function (path, onComplete) {
            // Try to find in store
            var image = imageMap.get(path);
            if (!image) {
                image = document.createElement("img"); // as HTMLImageElement;
                imageMap.set(path, image);
                image.onload = function () {
                    onComplete(image);
                };
                image.setAttribute("src", path);
                // image.src = path;
            }
            console.log("image", path, image);
            return image;
        },
        isImageLoaded: function (image) {
            return image.complete && image.naturalHeight !== 0 && image.naturalHeight !== undefined;
        }
    };
    return Store;
})();
//# sourceMappingURL=ImageStore.js.map