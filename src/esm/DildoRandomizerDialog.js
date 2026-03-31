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
export class DildoRandomizerDialog {
    /**
     * outlineChangedCallback
     * onPathVisibilityChanged
     * getBezierJSON
     * getSculptmapDataURL
     * getPreviewImageDataURL
     **/
    constructor(appContext, callbackOptions) {
        // +---------------------------------------------------------------------------------
        // | Handle path visibility events.
        // +-------------------------------
        this._togglePathVisibilityHandler = function (isVisible) {
            var _self = this;
            return event => {
                event.preventDefault();
                event.stopPropagation();
                // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
                _self._togglePathVisibility(isVisible, true);
            };
        };
        if (!(appContext.pb.canvas instanceof HTMLCanvasElement)) {
            throw new Error("Cannot instantiate DildoRandomizerDialog from plotboilerplate instance: this works only with <canvas> elements!");
        }
        this.appContext = appContext;
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
        this.ref_btnRandomize = NoReact.useRef();
        this.ref_btnShowPath = NoReact.useRef();
        this.ref_btnHidePath = NoReact.useRef();
        this.ref_btnStoreNow = NoReact.useRef();
        this.ref_slctBoundsRatio = NoReact.useRef();
        this.ref_slctOptimalBoxWidthPx = NoReact.useRef();
        this.ref_storePreviewContainer_2d = NoReact.useRef();
        this.ref_storePreviewContainer_sculptmap = NoReact.useRef();
        this.ref_storePreviewContainer_3d = NoReact.useRef();
        this.ref_slctTargetMeshResolution = NoReact.useRef();
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
                    NoReact.createElement("button", { id: "btn-hide-path", ref: this.ref_btnHidePath }, "Hide Path"),
                    NoReact.createElement("button", { id: "btn-show-path", ref: this.ref_btnShowPath }, "Show Path"))),
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
                NoReact.createElement("div", { class: "grid-w-25 flow-containter column" },
                    NoReact.createElement("div", { class: "w-100 flow-containter right center-v" },
                        NoReact.createElement("label", { for: "checkbox-hide-outlines-on-save" }, "Hide outlines on save"),
                        NoReact.createElement("input", { type: "checkbox", name: "checkbox-hide-outlines-on-save", id: "checkbox-hide-outlines-on-save", checked: true })),
                    NoReact.createElement("div", { class: "w-100 flow-containter right center-v" },
                        NoReact.createElement("label", { for: "checkbox-silhouette-black-color", class: "text-right" }, "Use black color for silhouette"),
                        NoReact.createElement("input", { type: "checkbox", name: "checkbox-silhouette-black-color", id: "checkbox-silhouette-black-color", checked: true, onChange: this._onSilhouetteColorChangeHandler() })))),
            NoReact.createElement("div", { class: "flow-containter center" },
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("h4", null, "Target Bounds Size")),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "boundsRatio" }, "Box ratio"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("select", { id: "boundsRatio", ref: this.ref_slctBoundsRatio },
                        NoReact.createElement("option", { value: "2.0" }, "2:1"),
                        NoReact.createElement("option", { value: "1.333" }, "4:3"),
                        NoReact.createElement("option", { value: "1.0", selected: true }, "1:1"),
                        NoReact.createElement("option", { value: "0.75" }, "3:4"),
                        NoReact.createElement("option", { value: "0.5" }, "1:2"))),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "optimalBoxWidthPx" }, "Optimal box width"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("select", { id: "optimalBoxWidthPx", ref: this.ref_slctOptimalBoxWidthPx, onChange: this._onResulutionChangeHandler() },
                        NoReact.createElement("option", { value: "256", selected: true }, "256"),
                        NoReact.createElement("option", { value: "512" }, "512"),
                        NoReact.createElement("option", { value: "1024" }, "1024"),
                        NoReact.createElement("option", { value: "2048" }, "2048")),
                    " ",
                    "px"),
                NoReact.createElement("div", { class: "grid-w-25" },
                    NoReact.createElement("label", { for: "select-target-mesh-resolution" }, "Target Mesh Resolution"),
                    NoReact.createElement("br", null),
                    NoReact.createElement("select", { id: "select-target-mesh-resolution", ref: this.ref_slctTargetMeshResolution, onChange: this._onResulutionChangeHandler() },
                        NoReact.createElement("option", { value: "256", selected: true }, "256"),
                        NoReact.createElement("option", { value: "512" }, "512"),
                        NoReact.createElement("option", { value: "1024" }, "1024"),
                        NoReact.createElement("option", { value: "2048" }, "2048")),
                    " ",
                    "px")),
            NoReact.createElement("div", { class: "flow-containter" },
                NoReact.createElement("div", { class: "grid-w-33" }),
                NoReact.createElement("div", { class: "grid-w-33 flex-flow center" },
                    NoReact.createElement("button", { id: "randomizeButton", ref: this.ref_btnRandomize }, "Randomize")),
                NoReact.createElement("div", { class: "grid-w-33" },
                    NoReact.createElement("div", { class: "flex-flow grid-w-50" },
                        NoReact.createElement("label", { for: "isCreateManyEnabled" }, "Create\u00A0Many"),
                        NoReact.createElement("input", { type: "checkbox", name: "isCreateManyEnabled", id: "isCreateManyEnabled" })),
                    NoReact.createElement("div", { class: "flex-flow grid-w-50" },
                        NoReact.createElement("label", { for: "maxIterationCount" }, "Max\u00A0Iterations"),
                        NoReact.createElement("input", { type: "number", id: "maxIterationCount", name: "maxIterationCount", min: "0", value: "99" })),
                    NoReact.createElement("span", { id: "iterationDisplay" }))),
            NoReact.createElement("div", { class: "flow-container", style: { backgroundColor: "rgba(0,0,0,0.25)" } },
                NoReact.createElement("div", { class: "progressbar w-100" })),
            NoReact.createElement("div", { class: "flow-containter flex-flow center-v" },
                NoReact.createElement("label", { for: "isPutEnabled" }, "Store data"),
                NoReact.createElement("input", { type: "checkbox", name: "isPutEnabled", id: "isPutEnabled" }),
                NoReact.createElement("input", { type: "text", id: "putURL", class: "putURL", name: "putURL", value: "http://127.0.0.1:1337/model/put", disabled: true }),
                NoReact.createElement("button", { id: "btn_store-now", ref: this.ref_btnStoreNow }, "Store Now")),
            NoReact.createElement("div", { class: "status-container w-100 error" }),
            NoReact.createElement("div", { class: "flow-containter right" },
                NoReact.createElement("label", { for: "checkbox-show-preview-before-store" }, "Show preview before storing"),
                NoReact.createElement("input", { type: "checkbox", name: "checkbox-show-preview-before-store", id: "checkbox-show-preview-before-store", checked: true })),
            NoReact.createElement("div", { class: "flow-containter flex-flow" },
                NoReact.createElement("div", { class: "grid-w-33 flex-flow right", ref: this.ref_storePreviewContainer_2d }),
                NoReact.createElement("div", { class: "grid-w-33 flex-flow center", ref: this.ref_storePreviewContainer_sculptmap }),
                NoReact.createElement("div", { class: "grid-w-33 flex-flow left", ref: this.ref_storePreviewContainer_3d }))));
        this.rootElement.appendChild(htmlContent);
        if (!this.ref_btnRandomize.current ||
            !this.ref_btnShowPath.current ||
            !this.ref_btnHidePath.current ||
            !this.ref_btnStoreNow.current) {
            throw Error("Cannot initialize dailog: some buttons are null.");
        }
        // elem_btnRandomize.addEventListener("click", this._randomizeButtonEventHandler());
        this.ref_btnRandomize.current.addEventListener("click", this._randomizeButtonEventHandler());
        this.ref_btnShowPath.current.addEventListener("click", this._togglePathVisibilityHandler(true));
        this.ref_btnHidePath.current.addEventListener("click", this._togglePathVisibilityHandler(false));
        this.ref_btnStoreNow.current.addEventListener("click", this._storeNowHandler());
        // console.log("this.modal.modalElements", this.modal.modalElements);
        this.appContext.modal.modalElements.modal.header.closeBtn.addEventListener("click", this._onCloseHandler());
        if (!this.ref_slctOptimalBoxWidthPx.current || !this.ref_slctBoundsRatio.current) {
            throw Error("Cannot initialize dailog: some select elements are null.");
        }
        var formChangeHandler = this._onFormChangeHandler();
        this.ref_slctOptimalBoxWidthPx.current.addEventListener("click", formChangeHandler);
        this.ref_slctBoundsRatio.current.addEventListener("click", formChangeHandler);
        globalThis.addEventListener("resize", formChangeHandler);
    }
    // +---------------------------------------------------------------------------------
    // | Handle form changes.
    // +-------------------------------
    _onFormChangeHandler() {
        var _self = this;
        return function (event) {
            _self._updateIdealBounds(true);
            _self.appContext.pb.redraw();
        };
    }
    // +---------------------------------------------------------------------------------
    // | Handle form changes.
    // +-------------------------------
    _onSilhouetteColorChangeHandler() {
        var _self = this;
        return function (_event) {
            _self.curSettings = _self.getCurrentFormSettings();
            _self.__handleSilhouetteColorChange();
        };
    }
    // +---------------------------------------------------------------------------------
    // | Handle form changes.
    // +-------------------------------
    _onResulutionChangeHandler() {
        var _self = this;
        return function (_event) {
            _self.curSettings = _self.getCurrentFormSettings();
            if (_self.curSettings.targetMeshResolution != _self.curSettings.optimalBoxWidthPx) {
                _self._displayError("Warning: recommended is using same values for targetMeshResolution and optimalBoxWidthPx.");
            }
            else {
                _self._displayError(null);
            }
        };
    }
    // +---------------------------------------------------------------------------------
    // | Handle silhouette form changes.
    // +-------------------------------
    __handleSilhouetteColorChange() {
        if (this.curSettings.isSilhouetteBlackColor) {
            this.appContext.config.silhouetteLineColor = "rgb(0,0,0)";
        }
        else {
            this.appContext.config.silhouetteLineColor = this.initialSilhouetteColor;
        }
        this.appContext.pb.redraw();
        this.__create2DPreview();
    }
    // +---------------------------------------------------------------------------------
    // | Open the randomizer dialog.
    // +-------------------------------
    open() {
        this.appContext.modal.setTitle("Dildo Randomizer");
        this.appContext.modal.setFooter("");
        this.initialSilhouetteColor = this.appContext.config.silhouetteLineColor;
        this.initialOutlineSegmentCount = this.appContext.config.outlineSegmentCount;
        this.initialShapeSegmentCountegmentCount = this.appContext.config.shapeSegmentCount;
        // this.modal.setActions([Modal.ACTION_CLOSE]);
        var _self = this;
        this.appContext.modal.setActions([
            {
                label: "Close",
                action: function () {
                    console.log("CLOSE ACTION HIT!");
                    _self.appContext.modal.close();
                    _self._onCloseHandler()();
                }
            }
        ]);
        this.appContext.modal.setBody(this.rootElement);
        this.appContext.modal.open();
        this.isOpen = true;
        this._setIterationDisplay("");
        this._displayError("");
        this._updateIdealBounds(true); // reevaluateFormSettings=true
        this.__handleSilhouetteColorChange(); // Initially the color might be set to black
        this.appContext.pb.redraw();
        this.__setRunning(false);
    }
    __setRunning(isRunning) {
        this.isRunning = isRunning;
        const elem_progressBar = this.rootElement.querySelector(".progressbar");
        if (!elem_progressBar) {
            console.warn("Cannot update progress bar: element not found.");
            return;
        }
        this.ref_btnRandomize.current.disabled = isRunning;
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
        elem_iterationDisplay.innerHTML = `${msg}`;
    }
    // +---------------------------------------------------------------------------------
    // | Handle close events.
    // +-------------------------------
    _onCloseHandler() {
        var _self = this;
        return function (_event) {
            _self.isOpen = false;
            _self.appContext.pb.redraw();
            // console.log("Set running = false");
            _self.__setRunning(false);
            _self.appContext.config.silhouetteLineColor = _self.initialSilhouetteColor;
            // _self.__handleSilhouetteColorChange();
            _self.appContext.pb.redraw();
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
    _togglePathVisibility(isVisible, isTriggerRedraw) {
        // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
        this.appContext.config.drawRulers = isVisible;
        this.appContext.config.drawOutline = isVisible;
        this.appContext.config.fillOutline = isVisible;
        this.appContext.config.drawResizeHandleLines = isVisible;
        this.appContext.config.drawPathBounds = isVisible;
        this.isDrawIdealBoundsEnabled = isVisible;
        if (!isVisible) {
            this.appContext.config.showDiscreteOutlinePoints = false;
        }
        // this.callbackOptions.onPathVisibilityChanged();
        this.appContext.handlePathVisibilityChanged(isTriggerRedraw);
    }
    _getPathVisibility() {
        // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
        return (this.appContext.config.drawRulers ||
            this.appContext.config.drawOutline ||
            this.appContext.config.fillOutline ||
            this.appContext.config.drawResizeHandleLines ||
            this.appContext.config.drawPathBounds ||
            this.isDrawIdealBoundsEnabled);
    }
    // +---------------------------------------------------------------------------------
    // | Toggle other paths except the outline on/off.
    // +-------------------------------
    _storeNowHandler() {
        var _self = this;
        return function (event) {
            // console.log("Request to store model (click).");
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
        if (this.curSettings.hideOutlineOnSave == this._getPathVisibility()) {
            this._togglePathVisibility(false, false); // isVisible=false, isTriggerRedraw=false
        }
        // Scale down to roughtly one third to make room for the full model and bent to the right.
        // var idealLeftHalfBounds = idealBounds.getScaled(0.333);
        var idealLeftHalfBounds = new Bounds(this.idealGenerateBounds.min, new Vertex(this.idealGenerateBounds.min.x + this.idealGenerateBounds.width / 3, this.idealGenerateBounds.max.y));
        // console.log("Ideal bounds", this.idealGenerateBounds, "idealLeftHalfBounds", idealLeftHalfBounds);
        var dildoRandomizer = new DildoRandomizer(idealLeftHalfBounds, this.curSettings.segmentCountMin, this.curSettings.segmentCountMax, this.curSettings.bendValueMin, this.curSettings.bendValueMax);
        // Use the mesh target resoluation
        this.appContext.config.outlineSegmentCount = this.curSettings.targetMeshResolution;
        this.appContext.config.shapeSegmentCount = this.curSettings.targetMeshResolution;
        var result = dildoRandomizer.next();
        console.log("Result", result);
        // this.callbackOptions.outlineChangedCallback(result);
        var _self = this;
        this.appContext
            .setRandomizedResult(result)
            .then((buildStatus) => {
            if (!buildStatus) {
                // Means: built process got interrupted by some other/new process.
                console.warn("Stopping. built process got interrupted by some other/new process.");
                return;
            }
            _self
                ._storeCurrentResult(_self.curSettings.isPutEnabled)
                .then(() => {
                if (_self.curSettings.isCreateManyEnabled && _self.isRunning) {
                    // console.log("NEXT ITERATION? isRunning=", _self.isRunning);
                    globalThis.setTimeout(() => {
                        _self._randomizeDildoSettings(curSequenceID);
                    }, 1000);
                }
                else {
                    // console.log("Done ramdomizing.");
                    _self.__setRunning(false);
                }
            })
                .catch(e => {
                console.error(e);
                _self.__setRunning(false);
            });
        })
            .catch((error) => {
            console.error("Failed to build new model.", error);
            _self._displayError("Failed to build new model. Consult error console for details.");
        });
    }
    // +---------------------------------------------------------------------------------
    // | Tries to store the current model, screenshots sculpt map and settings.
    // +-------------------------------
    _storeCurrentResult(isPutEnabled) {
        var _self = this;
        return new Promise((accept, reject) => {
            this.__collectPreviewData().then((previewData) => {
                if (!isPutEnabled) {
                    console.log("Storing data is not allowed by settings/configuration. Returning.");
                    accept(false);
                    return;
                }
                // Retrieve image data
                try {
                    // Use AJAX/Axios
                    _self.callbackOptions.axios
                        .request({
                        method: "post",
                        url: _self.curSettings.putURL, // "/user/12345",
                        data: {
                            hidenfield: "123456",
                            modelName: "My Model",
                            shapeSegmentCount: _self.appContext.config.shapeSegmentCount,
                            outlineSegmentCount: _self.appContext.config.outlineSegmentCount,
                            preview2d_b64: previewData.preview2dImageDataURL,
                            preview3d_b64: previewData.preview3dImageDataURL,
                            sculptmap_b64: previewData.previewSculptmapImageDataURL, // _self.appContext.getSculptmapDataURL(),
                            bezierJSON: _self.appContext.getBezierJSON(), // _self.callbackOptions.getBezierJSON(),
                            bendAngle: _self.appContext.config.bendAngle
                        }
                    })
                        .then(_response => {
                        // response.data.pipe(fs.createWriteStream("ada_lovelace.jpg"));
                        console.log("Succeeded");
                        _self._displaySuccess("Model stored.");
                        accept(true);
                    })
                        .catch(err => {
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
            }); // END then (collectPreviewData)
        });
    }
    __collectPreviewData() {
        const preview2dImageDataURL = this.__create2DPreview();
        const previewSculptmapImageDataURL = this.__createSculptmapPreview();
        const _self = this;
        return new Promise((accept, _reject) => {
            // The last one is asynchronous because we need a short delay to
            // be sure we fetch the most recent 3d data (wait at least one 3d draw cycle).
            // Note: this is pretty dirty as we rely on x milliseconds effective time – but
            //       how can we know when the new data is _really_ available?
            // Task for future me.
            _self.__create3DPreview().then((preview3dImageDataURL) => {
                accept({
                    preview2dImageDataURL: preview2dImageDataURL,
                    previewSculptmapImageDataURL: previewSculptmapImageDataURL,
                    preview3dImageDataURL: preview3dImageDataURL
                });
            });
        });
    }
    // +---------------------------------------------------------------------------------
    // | Create the 2D preview (silhouette) dataURl – and update the preview image inside the dialog,
    // | if requested by settings.
    // +-------------------------------
    __create2DPreview() {
        var boundsToCanvasRect = new Bounds(new Vertex(this.appContext.pb.revertMousePosition(this.idealExportBounds.min.x, this.idealExportBounds.min.y)), new Vertex(this.appContext.pb.revertMousePosition(this.idealExportBounds.max.x, this.idealExportBounds.max.y)));
        // Note: the `getImageFromCanvas` method will crop the rectangle if exceeds canvas bounds.
        //       move one pixel up.
        // var boundsToCanvasRect_safe = new Bounds(new Vertex(boundsToCanvasRect.min).subY(1.0), new Vertex(boundsToCanvasRect.max));
        const preview2dSubImageResult = getImageFromCanvas(this.appContext.pb.canvas, this.appContext.pb.draw.ctx, boundsToCanvasRect);
        const preview2dImageDataURL = preview2dSubImageResult.canvas.toDataURL("image/png");
        if (this.curSettings.isShowPreviewBevoreStore) {
            this.ref_storePreviewContainer_2d.current.innerHTML = '<img class="store-preview" src=' + preview2dImageDataURL + " />";
        }
        else {
            this.ref_storePreviewContainer_2d.current.innerHTML = "";
        }
        return preview2dImageDataURL;
    }
    // +---------------------------------------------------------------------------------
    // | Create the sculptmap preview dataURl – and update the preview image inside the dialog,
    // | if requested by settings.
    // +-------------------------------
    __createSculptmapPreview() {
        const previewScultpmapImageDataURL = this.appContext.getSculptmapDataURL();
        if (this.curSettings.isShowPreviewBevoreStore) {
            this.ref_storePreviewContainer_sculptmap.current.innerHTML =
                '<img class="store-preview" src=' + previewScultpmapImageDataURL + " />";
        }
        else {
            this.ref_storePreviewContainer_sculptmap.current.innerHTML = "";
        }
        return previewScultpmapImageDataURL;
    }
    // +---------------------------------------------------------------------------------
    // | Create the 3D preview dataURl – and update the preview image inside the dialog,
    // | if requested by settings.
    // +-------------------------------
    __create3DPreview() {
        return new Promise((accept, _reject) => {
            globalThis.setTimeout(() => {
                const preview3dImageDataURL = this.appContext.dildoGeneration.canvas.toDataURL("image/png");
                if (this.curSettings.isShowPreviewBevoreStore) {
                    this.ref_storePreviewContainer_3d.current.innerHTML = '<img class="store-preview" src=' + preview3dImageDataURL + " />";
                }
                else {
                    this.ref_storePreviewContainer_3d.current.innerHTML = "";
                }
                // return preview3dImageDataURL;
                accept(preview3dImageDataURL);
            }, 500); // Are 500ms a safe delay?
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
        var elem_isShowPreviewBeforeSaving = this.rootElement.querySelector("#checkbox-show-preview-before-store");
        var elem_targetMeshResolution = this.ref_slctTargetMeshResolution.current;
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
        var isShowPreviewBevoreStore = elem_isShowPreviewBeforeSaving ? Boolean(elem_isShowPreviewBeforeSaving.checked) : false;
        var targetMeshResolution = Number(getSelectedSelectOption(elem_targetMeshResolution, 256));
        // console.log("boundsRatio", boundsRatio, "optimalBoxWidthPx", optimalBoxWidthPx);
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
            isShowPreviewBevoreStore: isShowPreviewBevoreStore,
            putURL: putURL,
            targetMeshResolution: targetMeshResolution
        };
    }
    // +---------------------------------------------------------------------------------
    // | Update the ideal bounds from the current form settings.
    // +-------------------------------
    _updateIdealBounds(reevaluateFormSettings) {
        // Get the maximum bounds the final 2D model should ideallically be
        // displayed in.
        this.viewport = this.appContext.pb.viewport();
        if (reevaluateFormSettings) {
            this.curSettings = this.getCurrentFormSettings();
        }
        // var width = Math.min(this.viewport.width, this.curSettings.optimalBoxWidthPx);
        var canvasWidth = Math.min(this.appContext.pb.canvas.width, this.curSettings.optimalBoxWidthPx);
        var canvasHeight = canvasWidth / this.curSettings.boundsRatio;
        // console.log("XXX canvasWidth", canvasWidth, "canvasHeight", canvasHeight);
        console.log("canvasWidth", canvasWidth, "canvasHeight", canvasHeight, "boundsRatio", this.curSettings.boundsRatio);
        if (canvasWidth < this.curSettings.optimalBoxWidthPx) {
            this._displayError(`Warning: viewport width ${canvasWidth.toFixed(0)} is smaller than optimal width ${this.curSettings.optimalBoxWidthPx.toFixed(0)}.`);
        }
        else {
            this._displaySuccess(`The viewport size satisfies the required box width ${this.curSettings.optimalBoxWidthPx.toFixed(0)}px.`);
        }
        var bounds = new Bounds(new Vertex(this.viewport.min.x + (this.viewport.width - canvasWidth / this.appContext.pb.config.scaleX) / 2.0, this.viewport.min.y + (this.viewport.height - canvasHeight / this.appContext.pb.config.scaleY) / 2.0), new Vertex(this.viewport.max.x - (this.viewport.width - canvasWidth / this.appContext.pb.config.scaleX) / 2.0, this.viewport.max.y - (this.viewport.height - canvasHeight / this.appContext.pb.config.scaleY) / 2.0));
        // console.log("YYY bounds", bounds);
        // Move to the lower part to make it easier to see the full result below the dialog.
        var offsetX = 0.0;
        var offsetY = this.viewport.max.y - bounds.max.y;
        // Note: the `getImageFromCanvas` method will crop the rectangle if exceeds canvas bounds.
        //       move one pixel up.
        bounds = bounds.getMoved({ x: offsetX, y: offsetY - 1 });
        this.idealExportBounds = bounds;
        this.idealGenerateBounds = bounds.getScaled(0.666);
    }
}
// +---------------------------------------------------------------------------------
// | A helper function to retrieve the selected value from an <select> element.
// +-------------------------------
var getSelectedOption = function (rootContainer, selector, fallback) {
    // var e = document.getElementById("elementId");
    const selectElement = rootContainer.querySelector(selector);
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
    return Number(value);
};
// +---------------------------------------------------------------------------------
// | A helper function to retrieve the selected value from an <select> element.
// +-------------------------------
var getSelectedSelectOption = function (selectElement, fallback) {
    if (!selectElement) {
        console.warn("Select element is null. Using fallback", fallback);
        return fallback;
    }
    var value = selectElement.options[selectElement.selectedIndex].value;
    // var text = selectElement.options[selectElement.selectedIndex].text;
    if (!value) {
        console.warn("Select value not available. Using fallback", fallback);
        return fallback;
    }
    return Number(value);
};
//# sourceMappingURL=DildoRandomizerDialog.js.map