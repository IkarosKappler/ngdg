/**
 * @author  Ikaros Kappler
 * @date    2021-10-13
 * @version 1.0.0
 */
declare type PathDroppedCallback = (jsonData: string) => void;
export declare class ConfigIO {
    /**
     * The 'dropzone' element.
     * @private
     * @memberof ConfigIO
     * @member {HTMLElement}
     */
    private element;
    private pathDroppedCallback;
    constructor(element: HTMLElement);
    onPathDropped(callback: PathDroppedCallback): void;
    private handleDropEvent;
    private handleDragOverEvent;
    private handleDragLeaveEvent;
    destroy(): void;
}
export {};
