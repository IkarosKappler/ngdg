/**
 * @require DildoRandomizer
 *
 * @author   Ikaros Kappler
 * @date     2026-03-02
 * @modified 2026-03-20 Ported to Typescript/TSX.
 * @version  1.1.0
 */
import { AppContext } from "./AppContext";
import { Axios } from "axios";
export interface IDildoRandomizerDialogOptions {
    axios: Axios;
}
export declare class DildoRandomizerDialog {
    private appContext;
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
    private initialSilhouetteColor;
    private ref_btnRandomize;
    private ref_btnShowPath;
    private ref_btnHidePath;
    private ref_btnStoreNow;
    private ref_slctBoundsRatio;
    private ref_slctOptimalBoxWidthPx;
    private ref_storePreviewContainer_2d;
    private ref_storePreviewContainer_sculptmap;
    private ref_storePreviewContainer_3d;
    /**
     * outlineChangedCallback
     * onPathVisibilityChanged
     * getBezierJSON
     * getSculptmapDataURL
     * getPreviewImageDataURL
     **/
    constructor(appContext: AppContext, callbackOptions: IDildoRandomizerDialogOptions);
    private _onFormChangeHandler;
    private _onSilhouetteColorChangeHandler;
    private __handleSilhouetteColorChange;
    open(): void;
    private __setRunning;
    private _setIterationDisplay;
    private _onCloseHandler;
    drawIdealBounds(draw: any, fill: any): void;
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
    private __create2DPreview;
    private __createSculptmapPreview;
    private __create3DPreview;
    private getCurrentFormSettings;
    private _updateIdealBounds;
}
