/**
 * @author  Ikaros Kappler
 * @date    2021-09-02
 * @version 1.0.0
 */
export const ImageStore = (() => {
    const imageMap = new Map();
    const Store = {
        getImage: (path, onComplete) => {
            // Try to find in store
            let image = imageMap.get(path);
            if (!image) {
                image = document.createElement("img"); // as HTMLImageElement;
                imageMap.set(path, image);
                image.onload = () => {
                    onComplete(image);
                };
                image.setAttribute("src", path);
            }
            return image;
        },
        isImageLoaded: (image) => {
            return image.complete && image.naturalHeight !== 0 && image.naturalHeight !== undefined;
        }
    };
    return Store;
})();
//# sourceMappingURL=ImageStore.js.map