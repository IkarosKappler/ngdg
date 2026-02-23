"use strict";
/**
 * The image store is centralized soft-database (key-value-store) to
 * store image files.
 *
 * It is used to keep images in memory once they were loaded to avoid
 * multiple GET requests.
 *
 * @author  Ikaros Kappler
 * @date    2021-09-02
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageStore = void 0;
exports.ImageStore = (function () {
    var imageMap = new Map();
    var Store = {
        /**
         * Fetch an image from the given path. This can be a relative file path
         * or an URL.
         *
         * @param {string} path - The image path to fetch.
         * @param {function} onComplete - Called when the image source was successfully loaded.
         * @returns {HTMLImageElement} The image element itself (unattached).
         */
        getImage: function (path, onComplete) {
            // Try to find in store
            var image = imageMap.get(path);
            if (!image) {
                image = document.createElement("img");
                imageMap.set(path, image);
                image.onload = function () {
                    onComplete(image);
                };
                image.setAttribute("src", path);
            }
            return image;
        },
        /**
         * Check wether the given image element is completely loaded.
         *
         * @param {HTMLImageElement} image - The image element to check.
         * @returns {boolean}
         */
        isImageLoaded: function (image) {
            return image.complete && image.naturalHeight !== 0 && image.naturalHeight !== undefined;
        }
    };
    return Store;
})();
//# sourceMappingURL=ImageStore.js.map