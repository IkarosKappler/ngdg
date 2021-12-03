/**
 * A basic IO interface for storing and retrieving json data from dropped files and local storage.
 *
 * @author  Ikaros Kappler
 * @date    2021-10-13
 * @version 1.0.0
 */
declare type PathDroppedCallback = (jsonData: string) => void;
declare type PathRequestJSONCallback = () => string;
export declare class ConfigIO {
    /**
     * The 'dropzone' element.
     * @private
     * @memberof ConfigIO
     * @member {HTMLElement}
     */
    private element;
    private pathDroppedCallback;
    /**
     *
     * @param {HTMLElement} element - The element you wish to operate as the drop zone (like <body/>).
     */
    constructor(element: HTMLElement);
    /**
     * Install the drop callback. Note than only one callback can be installed in this
     * implementation. Calling this method multiple times will overwrite previously
     * installed listeners.
     *
     * The callback will receive the dropped files as a string.
     *
     * @param {(data:string)=>void} callback
     */
    onPathDropped(callback: PathDroppedCallback): void;
    /**
     * Install a callback for retrieving the `bezier_path` string from the localstorage.
     *
     * @param {(data:string)=>void} handlePathRestored - The callback to handle the retrieved storage value. Will be called immediately.
     * @param {()=>string} requestPath - Requests the `bezier_path` string value to store; will be called on a 10 second timer interval.
     */
    onPathRestored(handlePathRestored: PathDroppedCallback, requestPath: PathRequestJSONCallback): void;
    private handleDropEvent;
    private handleDragOverEvent;
    private handleDragLeaveEvent;
    destroy(): void;
}
export {};
