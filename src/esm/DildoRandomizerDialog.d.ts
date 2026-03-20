/**
 * @require DildoRandomizer
 *
 * @author   Ikaros Kappler
 * @date     2026-03-02
 * @modified 2026-03-20 Ported to Typescript/TSX.
 * @version  1.1.0
 */
import { PlotBoilerplate } from "plotboilerplate";
import { Modal } from "./Modal";
import { AppContext } from "./AppContext";
import { DildoRandomizerResult } from "./DildoRandomizer";
export interface ICallbackOptions {
    outlineChangedCallback: (result: DildoRandomizerResult) => void;
    onPathVisibilityChanged: () => void;
    getBezierJSON: () => void;
    getSculptmapDataURL: () => void;
    getPreviewImageDataURL: (mimetype: string) => void;
}
export declare class DildoRandomizerDialog {
    private pb;
    private modal;
    private config;
    private callbackOptions;
    private rootElement;
    private isOpen;
    private isDrawIdealBoundsEnabled;
    private idealExportBounds;
    private idealGenerateBounds;
    private curSettings;
    private viewport;
    private iterationNumber;
    private sequenceID;
    private isRunning;
    /**
     * outlineChangedCallback
     * onPathVisibilityChanged
     * getBezierJSON
     * getSculptmapDataURL
     * getPreviewImageDataURL
     **/
    constructor(pb: PlotBoilerplate, modal: Modal, config: typeof AppContext.prototype.config, callbackOptions: ICallbackOptions);
    private _onFormChangeHandler;
    open(): void;
    private __setRunning;
    private _setIterationDisplay;
    private _onCloseHandler;
    private drawIdealBounds;
    private _displayStatus;
    private _displayError;
    private _displaySuccess;
    private _togglePathVisibilityHandler;
    private _togglePathVisibility;
    private _getPathVisibility;
    private _storeNowHandler;
    private _randomizeButtonEventHandler;
    private _randomizeDildoSettings;
    private _storeCurrentResult;
    private getCurrentFormSettings;
    private _updateIdealBounds;
}
