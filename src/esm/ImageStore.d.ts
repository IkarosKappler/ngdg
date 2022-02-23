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
export declare const ImageStore: {
    /**
     * Fetch an image from the given path. This can be a relative file path
     * or an URL.
     *
     * @param {string} path - The image path to fetch.
     * @param {function} onComplete - Called when the image source was successfully loaded.
     * @returns {HTMLImageElement} The image element itself (unattached).
     */
    getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => HTMLImageElement;
    /**
     * Check wether the given image element is completely loaded.
     *
     * @param {HTMLImageElement} image - The image element to check.
     * @returns {boolean}
     */
    isImageLoaded: (image: HTMLImageElement) => boolean;
};
