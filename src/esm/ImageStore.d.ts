/**
 * @author  Ikaros Kappler
 * @date    2021-09-02
 * @version 1.0.0
 */
export declare const ImageStore: {
    getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => HTMLImageElement;
    isImageLoaded: (image: HTMLImageElement) => boolean;
};
