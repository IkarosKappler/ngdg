/**
 * @author  Ikaros Kappler
 * @date    2021-09-02
 * @version 1.0.0
 */

export const ImageStore = (() => {
  const imageMap: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();

  const Store = {
    getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => {
      // Try to find in store
      let image: HTMLImageElement | undefined = imageMap.get(path);
      if (!image) {
        image = document.createElement("img"); // as HTMLImageElement;
        imageMap.set(path, image);
        image.onload = () => {
          onComplete(image);
        };
        image.setAttribute("src", path);
        // image.src = path;
      }
      console.log("image", path, image);
      return image;
    },

    isImageLoaded: (image: HTMLImageElement) => {
      return image.complete && image.naturalHeight !== 0 && image.naturalHeight !== undefined;
    }
  };

  return Store;
})();
