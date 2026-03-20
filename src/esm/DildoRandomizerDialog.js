/**
 * @require DildoRandomizer
 *
 * @author   Ikaros Kappler
 * @date     2026-03-02
 * @modified 2026-03-20 Ported to Typescript/TSX.
 * @version  1.1.0
 */
import { NoReact } from "noreact";
import { Bounds, Vertex } from "plotboilerplate";
import { DildoRandomizer } from "./DildoRandomizer";
import { getImageFromCanvas } from "./getImageFromCanvas";
import axios from "axios";
export class DildoRandomizerDialog {
    /**
     * outlineChangedCallback
     * onPathVisibilityChanged
     * getBezierJSON
     * getSculptmapDataURL
     * getPreviewImageDataURL
     **/
    constructor(pb, modal, config, callbackOptions) {
        // +---------------------------------------------------------------------------------
        // | Handle path visibility events.
        // +-------------------------------
        this._togglePathVisibilityHandler = function (isVisible) {
            var _self = this;
            return function (event) {
                event.preventDefault();
                event.stopPropagation();
                // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
                _self._togglePathVisibility(isVisible);
            };
        };
        if (!(pb.canvas instanceof HTMLCanvasElement)) {
            throw new Error("Cannot instantiate DildoRandomizerDialog from plotboilerplate instance: this works only with <canvas> elements!");
        }
        this.pb = pb;
        this.modal = modal;
        this.config = config;
        this.callbackOptions = callbackOptions;
        this.rootElement = document.createElement("form");
        this.rootElement.setAttribute("id", "randomizerForm");
        this.rootElement.classList.add("randomizerForm");
        this.isOpen = false;
        this.isDrawIdealBoundsEnabled = true;
        // The ideal bounds to export the final image data from.
        this.idealExportBounds = new Bounds(new Vertex(), new Vertex());
        // The real bounds _inside_ the export bounds to generate the outline in.
        this.idealGenerateBounds = new Bounds(new Vertex(), new Vertex());
        this.viewport = null;
        this.iterationNumber = 0;
        this.sequenceID = 0;
        this.isRunning = false;
        this.curSettings = null; // this.getCurrentFormSettings();
        const ref_btnRandomize = NoReact.useRef();
        const ref_btnShowPath = NoReact.useRef();
        const ref_btnHidePath = NoReact.useRef();
        const ref_btnStoreNow = NoReact.useRef();
        const ref_slctBoundsRatio = NoReact.useRef();
        const ref_slctOptimalBoxWidthPx = NoReact.useRef();
        const htmlContent = (NoReact.createElement("div", { class: "font-600-desktop" },
            NoReact.createElement("div", { class: "flow-containter" },
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("h4", null, "Outline Path")),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "segmentCountMin" }, "Min Segments"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("input", { type: "number", id: "segmentCountMin", min: "1", max: "24", value: "3", name: "segmentCountMin" })),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "segmentCountMax" }, "Max Segments"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("input", { type: "number", id: "segmentCountMax", min: "1", max: "24", value: "8", name: "segmentCountMax" })),
                NoReact.createElement("div", { class: "grid-w-25 flow-containter right center-v" },
                    NoReact.createElement("button", { id: "btn-hide-path", ref: ref_btnHidePath }, "Hide Path"),
                    NoReact.createElement("button", { id: "btn-show-path", ref: ref_btnShowPath }, "Show Path"))),
            NoReact.createElement("div", { class: "flow-containter" },
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("h4", null, "Mesh bend value (Deg)")),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "bendValueMin" }, "Min Bend Value"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("input", { type: "number", id: "bendValueMin", min: "0", max: "180", value: "0", name: "bendValueMin" }),
                    "\u00B0"),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "bendValueMax" }, "Max Bend Value"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("input", { type: "number", id: "bendValueMax", min: "0", max: "180", value: "120", name: "bendValueMax" }),
                    "\u00B0"),
                NoReact.createElement("div", { class: "grid-w-25 flow-containter right center-v" },
                    NoReact.createElement("label", { for: "checkbox-hide-outlines-on-save" }, "Hide outlines on save"),
                    NoReact.createElement("input", { type: "checkbox", name: "checkbox-hide-outlines-on-save", id: "checkbox-hide-outlines-on-save", checked: true }))),
            NoReact.createElement("div", { class: "flow-containter center" },
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("h4", null, "Target Bounds Size")),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "boundsRatio" }, "Box ratio"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("select", { id: "boundsRatio", ref: ref_slctBoundsRatio },
                        NoReact.createElement("option", { value: "2.0" }, "2:1"),
                        NoReact.createElement("option", { value: "1.333" }, "4:3"),
                        NoReact.createElement("option", { value: "1.0", selected: true }, "1:1"),
                        NoReact.createElement("option", { value: "0.75" }, "3:4"),
                        NoReact.createElement("option", { value: "0.5" }, "1:2"))),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "optimalBoxWidthPx" }, "Optimal box width"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("select", { id: "optimalBoxWidthPx" },
                        NoReact.createElement("option", { value: "256", ref: ref_slctOptimalBoxWidthPx, selected: true }, "256"),
                        NoReact.createElement("option", { value: "512" }, "512"),
                        NoReact.createElement("option", { value: "1024" }, "1024"),
                        NoReact.createElement("option", { value: "2048" }, "2048")),
                    " ",
                    "px"),
                NoReact.createElement("div", { class: "grid-w-25 flow-containter right center-v" },
                    NoReact.createElement("label", { for: "checkbox-silhouette-black-color" }, "Use black color for silhouette"),
                    NoReact.createElement("input", { type: "checkbox", name: "checkbox-silhouette-black-color", id: "checkbox-silhouette-black-color", checked: true }))),
            NoReact.createElement("div", { class: "flow-containter" },
                NoReact.createElement("div", { class: "grid-w-33" }),
                NoReact.createElement("div", { class: "grid-w-33 flex-flow center" },
                    NoReact.createElement("button", { id: "randomizeButton", ref: ref_btnRandomize }, "Randomize")),
                NoReact.createElement("div", { class: "grid-w-33" },
                    NoReact.createElement("div", { class: "flex-flow grid-w-50" },
                        NoReact.createElement("label", { for: "isCreateManyEnabled" }, "Create\u00A0Many"),
                        NoReact.createElement("input", { type: "checkbox", name: "isCreateManyEnabled", id: "isCreateManyEnabled" })),
                    NoReact.createElement("div", { class: "flex-flow grid-w-50" },
                        NoReact.createElement("label", { for: "maxIterationCount" }, "Max\u00A0Iterations"),
                        NoReact.createElement("input", { type: "number", id: "maxIterationCount", name: "maxIterationCount", min: "0", value: "99" })),
                    NoReact.createElement("span", { id: "iterationDisplay" }))),
            NoReact.createElement("div", { class: "flow-container", style: "background-color: rgba(0,0,0,0.25);" },
                NoReact.createElement("div", { class: "progressbar w-100" })),
            NoReact.createElement("div", { class: "flow-containter flex-flow" },
                NoReact.createElement("label", { for: "isPutEnabled" }, "Store data"),
                NoReact.createElement("input", { type: "checkbox", name: "isPutEnabled", id: "isPutEnabled" }),
                NoReact.createElement("input", { type: "text", id: "putURL", class: "putURL", name: "putURL", value: "http://127.0.0.1:1337/model/put", disabled: true }),
                NoReact.createElement("button", { id: "btn_store-now", ref: ref_btnStoreNow }, "Store Now")),
            NoReact.createElement("div", { class: "status-container w-100 error" })));
        this.rootElement.appendChild(htmlContent);
        if (!ref_btnRandomize.current || !ref_btnShowPath.current || !ref_btnHidePath.current || !ref_btnStoreNow.current) {
            throw Error("Cannot initialize dailog: some buttons are null.");
        }
        // elem_btnRandomize.addEventListener("click", this._randomizeButtonEventHandler());
        ref_btnRandomize.current.addEventListener("click", this._randomizeButtonEventHandler());
        ref_btnShowPath.current.addEventListener("click", this._togglePathVisibilityHandler(true));
        ref_btnHidePath.current.addEventListener("click", this._togglePathVisibilityHandler(false));
        ref_btnStoreNow.current.addEventListener("click", this._storeNowHandler());
        // console.log("this.modal.modalElements", this.modal.modalElements);
        this.modal.modalElements.modal.header.closeBtn.addEventListener("click", this._onCloseHandler());
        if (!ref_slctOptimalBoxWidthPx.current || !ref_slctBoundsRatio.current) {
            throw Error("Cannot initialize dailog: some select elements are null.");
        }
        var formChangeHandler = this._onFormChangeHandler();
        ref_slctOptimalBoxWidthPx.current.addEventListener("click", formChangeHandler);
        ref_slctBoundsRatio.current.addEventListener("click", formChangeHandler);
        globalThis.addEventListener("resize", formChangeHandler);
    }
    // +---------------------------------------------------------------------------------
    // | Handle form changes.
    // +-------------------------------
    _onFormChangeHandler() {
        var _self = this;
        return function (event) {
            _self._updateIdealBounds(true);
            _self.pb.redraw();
        };
    }
    // +---------------------------------------------------------------------------------
    // | Open the randomizer dialog.
    // +-------------------------------
    open() {
        this.modal.setTitle("Dildo Randomizer");
        this.modal.setFooter("");
        // this.modal.setActions([Modal.ACTION_CLOSE]);
        var _self = this;
        this.modal.setActions([
            {
                label: "Close",
                action: function () {
                    console.log("CLOSE ACTION HIT!");
                    _self.modal.close();
                    // _self.__setRunning(false);
                    _self._onCloseHandler()();
                }
            }
        ]);
        this.modal.setBody(this.rootElement);
        this.modal.open();
        this.isOpen = true;
        this._setIterationDisplay("");
        this._displayError("");
        this._updateIdealBounds(true); // reevaluateFormSettings=true
        this.pb.redraw();
        this.__setRunning(false);
    }
    __setRunning(isRunning) {
        this.isRunning = isRunning;
        const elem_progressBar = this.rootElement.querySelector(".progressbar");
        if (!elem_progressBar) {
            console.warn("Cannot update progress bar: element not found.");
            return;
        }
        if (isRunning) {
            elem_progressBar.classList.add("animate");
        }
        else {
            elem_progressBar.classList.remove("animate");
        }
    }
    // +---------------------------------------------------------------------------------
    // | When iterating many randomized results: set the current iteration message.
    // +-------------------------------
    _setIterationDisplay(msg) {
        const elem_iterationDisplay = this.rootElement.querySelector("#iterationDisplay");
        if (!elem_iterationDisplay) {
            console.warn("Cannot update iteration display: element not found.");
            return;
        }
        elem_iterationDisplay.innerHTML = msg;
    }
    // +---------------------------------------------------------------------------------
    // | Handle close events.
    // +-------------------------------
    _onCloseHandler() {
        var _self = this;
        return function (_event) {
            _self.isOpen = false;
            _self.pb.redraw();
            console.log("Set running = false");
            _self.__setRunning(false);
        };
    }
    // +---------------------------------------------------------------------------------
    // | Draw the ideal bounds for randomization.
    // +-------------------------------
    drawIdealBounds(draw, fill) {
        if (!this.isOpen || this.isRunning || !this.isDrawIdealBoundsEnabled) {
            return;
        }
        if (this.idealExportBounds) {
            draw.rect(this.idealExportBounds.min, this.idealExportBounds.width, this.idealExportBounds.height, "orange", 2.0, {
                dashArray: [5, 5]
            });
        }
        if (this.idealGenerateBounds) {
            draw.rect(this.idealGenerateBounds.min, this.idealGenerateBounds.width, this.idealGenerateBounds.height, "yellow", 2.0, {
                dashArray: [5, 5]
            });
        }
    }
    // +---------------------------------------------------------------------------------
    // | Internal method for displaying error messages inside the dialog.
    // +-------------------------------
    _displayStatus(errmsg, className) {
        const errorContainer = this.rootElement.querySelector(".status-container");
        if (!errorContainer) {
            return;
        }
        errorContainer.classList.remove("error", "success");
        errorContainer.classList.add(className);
        errorContainer.innerHTML = errmsg;
    }
    // +---------------------------------------------------------------------------------
    // | Internal method for displaying error messages inside the dialog.
    // +-------------------------------
    _displayError(errmsg) {
        this._displayStatus(errmsg ? `⚠️ ${errmsg}` : "", "error");
    }
    // +---------------------------------------------------------------------------------
    // | Internal method for displaying error messages inside the dialog.
    // +-------------------------------
    _displaySuccess(msg) {
        this._displayStatus(msg ? `✅ ${msg}` : "", "success");
    }
    // +---------------------------------------------------------------------------------
    // | Toggle other paths except the outline on/off.
    // +-------------------------------
    _togglePathVisibility(isVisible) {
        // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
        this.config.drawRulers = isVisible;
        this.config.drawOutline = isVisible;
        this.config.fillOutline = isVisible;
        this.config.drawResizeHandleLines = isVisible;
        this.config.drawPathBounds = isVisible;
        this.isDrawIdealBoundsEnabled = isVisible;
        if (!isVisible) {
            this.config.showDiscreteOutlinePoints = false;
        }
        this.callbackOptions.onPathVisibilityChanged();
    }
    _getPathVisibility() {
        // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
        return (this.config.drawRulers ||
            this.config.drawOutline ||
            this.config.fillOutline ||
            this.config.drawResizeHandleLines ||
            this.config.drawPathBounds ||
            this.isDrawIdealBoundsEnabled);
    }
    // +---------------------------------------------------------------------------------
    // | Toggle other paths except the outline on/off.
    // +-------------------------------
    _storeNowHandler() {
        var _self = this;
        return function (event) {
            console.log("Request to store model (click).");
            event.preventDefault();
            event.stopPropagation();
            _self
                ._storeCurrentResult(true) // isPutEnabled=true
                .then(function () {
                // NOOP (message is already displayed)
            })
                .catch(function (e) {
                // NOOP (message is already displayed)
            });
        };
    }
    // +---------------------------------------------------------------------------------
    // | Randomize the next dildo model from the current settings.
    // +-------------------------------
    _randomizeButtonEventHandler() {
        var _self = this;
        return function (event) {
            event.preventDefault();
            event.stopPropagation();
            _self.iterationNumber = 0;
            _self.sequenceID = Math.round(Math.random() * 365535);
            _self.__setRunning(true);
            _self._randomizeDildoSettings(_self.sequenceID);
        };
    }
    // +---------------------------------------------------------------------------------
    // | Compute the next randomized dildo settings.
    // +-------------------------------
    _randomizeDildoSettings(curSequenceID) {
        this._displayError("");
        this.curSettings = this.getCurrentFormSettings();
        if (this.iterationNumber >= this.curSettings.maxIterationCount) {
            // Max number of models to generate in this sequence reached.
            console.log("Max number of models to generate in this sequence reached.");
            this.__setRunning(false);
            return;
        }
        if (this.sequenceID != curSequenceID) {
            // A new sequence has started. Stop this one immediately!
            console.log("A new sequence has started. Stopping.");
            this.__setRunning(false);
            return;
        }
        // _self.__setRunning(true);
        this.iterationNumber++;
        this._setIterationDisplay(`${this.iterationNumber}/${this.curSettings.maxIterationCount}`);
        // Give the viewport some safe areas to all directions.
        this._updateIdealBounds(false); // reevaluateFormSettings=false
        // Scale down to roughtly one third to make room for the full model and bent to the right.
        // var idealLeftHalfBounds = idealBounds.getScaled(0.333);
        var idealLeftHalfBounds = new Bounds(this.idealGenerateBounds.min, new Vertex(this.idealGenerateBounds.min.x + this.idealGenerateBounds.width / 3, this.idealGenerateBounds.max.y));
        console.log("Ideal bounds", this.idealGenerateBounds, "idealLeftHalfBounds", idealLeftHalfBounds);
        var dildoRandomizer = new DildoRandomizer(idealLeftHalfBounds, this.curSettings.segmentCountMin, this.curSettings.segmentCountMax, this.curSettings.bendValueMin, this.curSettings.bendValueMax);
        var result = dildoRandomizer.next();
        console.log("Result", result);
        this.callbackOptions.outlineChangedCallback(result);
        var _self = this;
        this._storeCurrentResult(_self.curSettings.isPutEnabled)
            .then(function () {
            if (_self.curSettings.isCreateManyEnabled && _self.isRunning) {
                console.log("NEXT ITERATION? isRunning=", _self.isRunning);
                globalThis.setTimeout(function () {
                    _self._randomizeDildoSettings(curSequenceID);
                }, 1000);
            }
            else {
                console.log("Done ramdomizing.");
                _self.__setRunning(false);
            }
        })
            .catch(function (e) {
            console.error(e);
            _self.__setRunning(false);
        });
    }
    // +---------------------------------------------------------------------------------
    // | Tries to store the current model, screenshots sculpt map and settings.
    // +-------------------------------
    _storeCurrentResult(isPutEnabled) {
        if (isPutEnabled && this.curSettings.hideOutlineOnSave && this._getPathVisibility()) {
            if (this.curSettings.isSilhouetteBlackColor) {
                this.config.silhouetteLineColor = "rgb(0,0,0)";
            }
            this._togglePathVisibility(false);
        }
        var _self = this;
        return new Promise(function (accept, reject) {
            console.log("[_storeCurrentResult] called [0].");
            if (!isPutEnabled) {
                console.log("Storing data is not allowed by settings/configuration. Returning.");
                accept(false);
                return;
            }
            console.log("[_storeCurrentResult] called [1].");
            // Retrieve image data
            try {
                var boundsToCanvasRect = new Bounds(new Vertex(_self.pb.revertMousePosition(_self.idealExportBounds.min.x, _self.idealExportBounds.min.y)), new Vertex(_self.pb.revertMousePosition(_self.idealExportBounds.max.x, _self.idealExportBounds.max.y)));
                // var boundsToCanvasRect = _self.idealExportBounds;
                console.log("boundsToCanvasRect", boundsToCanvasRect);
                const preview2dSubImageResult = getImageFromCanvas(_self.pb.canvas, _self.pb.draw.ctx, boundsToCanvasRect);
                const preview2dImageDataURL = preview2dSubImageResult.canvas.toDataURL("image/png");
                const preview3dImageDataURL = _self.callbackOptions.getPreviewImageDataURL("image/png");
                // Use AJAX/Axios
                console.log("Sending data to ", _self.curSettings.putURL);
                axios({
                    method: "post",
                    url: _self.curSettings.putURL, // "/user/12345",
                    data: {
                        hidenfield: "123456",
                        modelName: "My Model",
                        shapeSegmentCount: _self.config.shapeSegmentCount,
                        outlineSegmentCount: _self.config.outlineSegmentCount,
                        preview2d_b64: preview2dImageDataURL,
                        preview3d_b64: preview3dImageDataURL,
                        sculptmap_b64: _self.callbackOptions.getSculptmapDataURL(),
                        bezierJSON: _self.callbackOptions.getBezierJSON(),
                        bendAngle: _self.config.bendAngle
                    }
                })
                    .then(function (response) {
                    // response.data.pipe(fs.createWriteStream("ada_lovelace.jpg"));
                    console.log("Succeeded");
                    _self._displaySuccess("Model stored.");
                    accept(true);
                })
                    .catch(function (err) {
                    console.error(err);
                    _self._displayError("Failed to store model. See error console for details." +
                        (err &&
                            err.response &&
                            err.response.data &&
                            err.response.data.message &&
                            " Message from server: " + err.response.data.message));
                    reject();
                });
            }
            catch (exc) {
                console.log("Failed to prepare/send axios request.", exc);
                _self._displayError("Failed to prepare/send axios request. See error console for details.");
                reject(exc);
            }
        });
    }
    // +---------------------------------------------------------------------------------
    // | Get the current settings as numbers from the displayed HTML form.
    // +-------------------------------
    getCurrentFormSettings() {
        var elem_segmentCountMin = this.rootElement.querySelector("#segmentCountMin");
        var elem_segmentCountMax = this.rootElement.querySelector("#segmentCountMax");
        var elem_bendValueMin = this.rootElement.querySelector("#bendValueMin");
        var elem_bendValueMax = this.rootElement.querySelector("#bendValueMax");
        // var boundsRatio = Number(this.rootElement.querySelector("#boundsRatio option[selected]").value);
        // var elem_boundsRatio : HTMLInputElement = getSelectedOption(this.rootElement, "#boundsRatio", 1.0);
        // var elem_optimalBoxWidthPx : HTMLInputElement = getSelectedOption(this.rootElement, "#optimalBoxWidthPx", 1024);
        var elem_isCreateManyEnabled = this.rootElement.querySelector("#isCreateManyEnabled");
        var elem_maxIterationCount = this.rootElement.querySelector("#maxIterationCount");
        var elem_isPutEnabled = this.rootElement.querySelector("#isPutEnabled");
        var elem_putURL = this.rootElement.querySelector("#putURL");
        var elem_hideOutlineOnSave = this.rootElement.querySelector("#checkbox-hide-outlines-on-save");
        var elem_isSilhouetteBlackColor = this.rootElement.querySelector("#checkbox-silhouette-black-color");
        var segmentCountMin = elem_segmentCountMin ? Number(elem_segmentCountMin.value) : NaN;
        var segmentCountMax = elem_segmentCountMax ? Number(elem_segmentCountMax.value) : NaN;
        var bendValueMin = elem_bendValueMin ? Number(elem_bendValueMin.value) : NaN;
        var bendValueMax = elem_bendValueMax ? Number(elem_bendValueMax.value) : NaN;
        // var boundsRatio = Number(this.rootElement.querySelector("#boundsRatio option[selected]").value);
        var boundsRatio = Number(getSelectedOption(this.rootElement, "#boundsRatio", 1.0));
        var optimalBoxWidthPx = Number(getSelectedOption(this.rootElement, "#optimalBoxWidthPx", 1024));
        var isCreateManyEnabled = elem_isCreateManyEnabled ? Boolean(elem_isCreateManyEnabled.checked) : false;
        var maxIterationCount = elem_maxIterationCount ? Number(elem_maxIterationCount.value) : 0;
        var isPutEnabled = elem_isPutEnabled ? Boolean(elem_isPutEnabled.checked) : false;
        var putURL = elem_putURL ? elem_putURL.value : "";
        var hideOutlineOnSave = elem_hideOutlineOnSave ? Boolean(elem_hideOutlineOnSave.checked) : false;
        var isSilhouetteBlackColor = elem_isSilhouetteBlackColor ? Boolean(elem_isSilhouetteBlackColor.checked) : false;
        // var segmentCountMin = Number(this.rootElement.querySelector("#segmentCountMin").value);
        // var segmentCountMax = Number(this.rootElement.querySelector("#segmentCountMax").value);
        // var bendValueMin = Number(this.rootElement.querySelector("#bendValueMin").value);
        // var bendValueMax = Number(this.rootElement.querySelector("#bendValueMax").value);
        // // var boundsRatio = Number(this.rootElement.querySelector("#boundsRatio option[selected]").value);
        // var boundsRatio = Number(getSelectedOption(this.rootElement, "#boundsRatio", 1.0));
        // var optimalBoxWidthPx = Number(getSelectedOption(this.rootElement, "#optimalBoxWidthPx", 1024));
        // var isCreateManyEnabled = Boolean(this.rootElement.querySelector("#isCreateManyEnabled").checked);
        // var maxIterationCount = Number(this.rootElement.querySelector("#maxIterationCount").value);
        // var isPutEnabled = Boolean(this.rootElement.querySelector("#isPutEnabled").checked);
        // var putURL = this.rootElement.querySelector("#putURL").value;
        // var hideOutlineOnSave = Boolean(this.rootElement.querySelector("#checkbox-hide-outlines-on-save").checked);
        // var isSilhouetteBlackColor = Boolean(this.rootElement.querySelector("#checkbox-silhouette-black-color").checked);
        console.log("boundsRatio", boundsRatio, "optimalBoxWidthPx", optimalBoxWidthPx);
        return {
            segmentCountMin: segmentCountMin,
            segmentCountMax: segmentCountMax,
            bendValueMin: bendValueMin,
            bendValueMax: bendValueMax,
            boundsRatio: boundsRatio,
            optimalBoxWidthPx: optimalBoxWidthPx,
            isCreateManyEnabled: isCreateManyEnabled,
            maxIterationCount: maxIterationCount,
            isPutEnabled: isPutEnabled,
            hideOutlineOnSave: hideOutlineOnSave,
            isSilhouetteBlackColor: isSilhouetteBlackColor,
            putURL: putURL
        };
    }
    // +---------------------------------------------------------------------------------
    // | Update the ideal bounds from the current form settings.
    // +-------------------------------
    _updateIdealBounds(reevaluateFormSettings) {
        // Get the maximum bounds the final 2D model should ideallically be
        // displayed in.
        this.viewport = this.pb.viewport();
        if (reevaluateFormSettings) {
            this.curSettings = this.getCurrentFormSettings();
        }
        // var width = Math.min(this.viewport.width, this.curSettings.optimalBoxWidthPx);
        var canvasWidth = Math.min(this.pb.canvas.width, this.curSettings.optimalBoxWidthPx);
        // var height = canvasWidth / this.curSettings.boundsRatio;
        var canvasHeight = canvasWidth / this.curSettings.boundsRatio;
        // var widthInPhysicalPixels = this.pb.canvas.width;
        // var widthInPhysicalPixels = width * this.pb.config.scaleX;
        console.log("canvasWidth", canvasWidth, "canvasHeight", canvasHeight, "boundsRatio", this.curSettings.boundsRatio);
        if (canvasWidth < this.curSettings.optimalBoxWidthPx) {
            this._displayError(`Warning: viewport width ${canvasWidth.toFixed(0)} is smaller than optimal width ${this.curSettings.optimalBoxWidthPx.toFixed(0)}.`);
        }
        else {
            this._displaySuccess(`The viewport size satisfies the required box width ${this.curSettings.optimalBoxWidthPx.toFixed(0)}px.`);
        }
        var bounds = new Bounds(new Vertex(this.viewport.min.x + (this.viewport.width - canvasWidth / this.pb.config.scaleX) / 2.0, this.viewport.min.y + (this.viewport.height - canvasHeight / this.pb.config.scaleY) / 2.0), new Vertex(this.viewport.max.x - (this.viewport.width - canvasWidth / this.pb.config.scaleX) / 2.0, this.viewport.max.y - (this.viewport.height - canvasHeight / this.pb.config.scaleY) / 2.0));
        // Move to the lower part to make it easier to see the full result below the dialog.
        var offsetX = 0.0;
        var offsetY = this.viewport.max.y - bounds.max.y;
        bounds = bounds.getMoved({ x: offsetX, y: offsetY });
        this.idealExportBounds = bounds;
        this.idealGenerateBounds = bounds.getScaled(0.666);
    }
}
// +---------------------------------------------------------------------------------
// | A helper function to retrieve the selected value from an <select> element.
// +-------------------------------
var getSelectedOption = function (rootContainer, selector, fallback) {
    // var e = document.getElementById("elementId");
    var selectElement = rootContainer.querySelector(selector);
    if (!selectElement) {
        console.warn("Select element not found. Using fallback", selector, fallback);
        return fallback;
    }
    var value = selectElement.options[selectElement.selectedIndex].value;
    // var text = selectElement.options[selectElement.selectedIndex].text;
    if (!value) {
        console.warn("Select value not available. Using fallback", fallback);
        return fallback;
    }
    return value;
};
//# sourceMappingURL=DildoRandomizerDialog.js.map