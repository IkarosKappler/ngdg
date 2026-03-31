/**
 * @require DildoRandomizer
 *
 * @author   Ikaros Kappler
 * @date     2026-03-02
 * @modified 2026-03-20 Ported to Typescript/TSX.
 * @version  1.1.0
 */

import { NoReact, Ref } from "noreact";
import { JsxElement } from "typescript";

import { Bounds, Vertex, drawutils } from "plotboilerplate";
import { AppContext } from "./AppContext";
import { DildoRandomizer } from "./DildoRandomizer";
import { getImageFromCanvas } from "./getImageFromCanvas";
import { Axios } from "axios";

export interface IDildoRandomizerDialogOptions {
  axios: Axios;
}

interface PrewiewData {
  preview2dImageDataURL: string;
  previewSculptmapImageDataURL: string;
  preview3dImageDataURL: string;
}

export class DildoRandomizerDialog {
  private appContext: AppContext;

  private callbackOptions: IDildoRandomizerDialogOptions;
  private rootElement: HTMLFormElement;
  private isOpen: boolean;
  private isDrawIdealBoundsEnabled: boolean;

  // The ideal bounds to export the final image data from.
  private idealExportBounds: Bounds;

  // The real bounds _inside_ the export bounds to generate the outline in.
  private idealGenerateBounds: Bounds;

  private curSettings: ReturnType<typeof DildoRandomizerDialog.prototype.getCurrentFormSettings>;
  private viewport: Bounds;
  private iterationNumber: number;
  private sequenceID: any;
  private isStopRequested: boolean;
  private isRunning: boolean;

  private initialSilhouetteColor: string;
  private initialOutlineSegmentCount: number;
  private initialShapeSegmentCountegmentCount: number;

  private ref_btnRandomize: Ref<HTMLButtonElement>;
  private ref_btnShowPath: Ref<HTMLButtonElement>;
  private ref_btnHidePath: Ref<HTMLButtonElement>;
  private ref_btnStoreNow: Ref<HTMLButtonElement>;
  private ref_slctBoundsRatio: Ref<HTMLButtonElement>;
  private ref_slctOptimalBoxWidthPx: Ref<HTMLButtonElement>;
  private ref_storePreviewContainer_2d: Ref<HTMLDivElement>;
  private ref_storePreviewContainer_sculptmap: Ref<HTMLDivElement>;
  private ref_storePreviewContainer_3d: Ref<HTMLDivElement>;
  private ref_slctTargetMeshResolution: Ref<HTMLSelectElement>;

  /**
   * outlineChangedCallback
   * onPathVisibilityChanged
   * getBezierJSON
   * getSculptmapDataURL
   * getPreviewImageDataURL
   **/
  constructor(appContext: AppContext, callbackOptions: IDildoRandomizerDialogOptions) {
    if (!(appContext.pb.canvas instanceof HTMLCanvasElement)) {
      throw new Error(
        "Cannot instantiate DildoRandomizerDialog from plotboilerplate instance: this works only with <canvas> elements!"
      );
    }
    this.appContext = appContext;
    this.callbackOptions = callbackOptions;
    this.rootElement = document.createElement("form");
    this.rootElement.setAttribute("id", "randomizerForm");
    this.rootElement.classList.add("randomizerForm");
    this.isOpen = false;
    this.isDrawIdealBoundsEnabled = true;

    const i18n = {
      targetMeshResolution:
        "The number of shape segements and outline segments in the target mesh. For LLM training reasons these two should be equal to get a square data image."
    };

    // The ideal bounds to export the final image data from.
    this.idealExportBounds = new Bounds(new Vertex(), new Vertex());

    // The real bounds _inside_ the export bounds to generate the outline in.
    this.idealGenerateBounds = new Bounds(new Vertex(), new Vertex());

    this.viewport = null;
    this.iterationNumber = 0;
    this.sequenceID = 0;
    this.isRunning = false;
    this.isStopRequested = false;
    this.curSettings = null; // this.getCurrentFormSettings();

    this.ref_btnRandomize = NoReact.useRef<HTMLButtonElement>();
    this.ref_btnShowPath = NoReact.useRef<HTMLButtonElement>();
    this.ref_btnHidePath = NoReact.useRef<HTMLButtonElement>();
    this.ref_btnStoreNow = NoReact.useRef<HTMLButtonElement>();
    this.ref_slctBoundsRatio = NoReact.useRef<HTMLButtonElement>();
    this.ref_slctOptimalBoxWidthPx = NoReact.useRef<HTMLButtonElement>();
    this.ref_storePreviewContainer_2d = NoReact.useRef<HTMLDivElement>();
    this.ref_storePreviewContainer_sculptmap = NoReact.useRef<HTMLDivElement>();
    this.ref_storePreviewContainer_3d = NoReact.useRef<HTMLDivElement>();
    this.ref_slctTargetMeshResolution = NoReact.useRef<HTMLSelectElement>();
    const htmlContent: HTMLElement = (
      <div class="font-600-desktop">
        <div class="flow-containter">
          <div class="grid-w-25">
            <h4>Outline Path</h4>
          </div>
          <div class="grid-w-25">
            <label for="segmentCountMin">Min Segments</label>
            <br />
            <input type="number" id="segmentCountMin" min="1" max="24" value="3" name="segmentCountMin" />
          </div>
          <div class="grid-w-25">
            <label for="segmentCountMax">Max Segments</label>
            <br />
            <input type="number" id="segmentCountMax" min="1" max="24" value="8" name="segmentCountMax" />
          </div>
          <div class="grid-w-25 flow-containter right center-v">
            <button id="btn-hide-path" ref={this.ref_btnHidePath}>
              Hide Path
            </button>
            <button id="btn-show-path" ref={this.ref_btnShowPath}>
              Show Path
            </button>
          </div>
        </div>
        <div class="flow-containter">
          <div class="grid-w-25">
            <h4>Mesh bend value (Deg)</h4>
          </div>
          <div class="grid-w-25">
            <label for="bendValueMin">Min Bend Value</label>
            <br />
            <input type="number" id="bendValueMin" min="0" max="180" value="0" name="bendValueMin" />°
          </div>
          <div class="grid-w-25">
            <label for="bendValueMax">Max Bend Value</label>
            <br />
            <input type="number" id="bendValueMax" min="0" max="180" value="120" name="bendValueMax" />°
          </div>
          <div class="grid-w-25 flow-containter column">
            <div class="w-100 flow-containter right center-v">
              <label for="checkbox-hide-outlines-on-save">Hide outlines on save</label>
              <input type="checkbox" name="checkbox-hide-outlines-on-save" id="checkbox-hide-outlines-on-save" checked />
            </div>
            <div class="w-100 flow-containter right center-v">
              <label for="checkbox-silhouette-black-color" class="text-right">
                Use black color for silhouette
              </label>
              <input
                type="checkbox"
                name="checkbox-silhouette-black-color"
                id="checkbox-silhouette-black-color"
                checked
                onChange={this._onSilhouetteColorChangeHandler()}
              />
            </div>
          </div>
        </div>
        <div class="flow-containter center">
          <div class="grid-w-25">
            <h4>Target Bounds Size</h4>
          </div>
          <div class="grid-w-25">
            <label for="boundsRatio">Box ratio</label>
            <br />
            <select id="boundsRatio" ref={this.ref_slctBoundsRatio}>
              <option value="2.0">2:1</option>
              <option value="1.333">4:3</option>
              <option value="1.0" selected>
                1:1
              </option>
              <option value="0.75">3:4</option>
              <option value="0.5">1:2</option>
            </select>
          </div>
          <div class="grid-w-25">
            <label for="optimalBoxWidthPx">Optimal box width</label>
            <br />
            <select id="optimalBoxWidthPx" ref={this.ref_slctOptimalBoxWidthPx} onChange={this._onResulutionChangeHandler()}>
              <option value="256" selected>
                256
              </option>
              <option value="512">512</option>
              <option value="1024">1024</option>
              <option value="2048">2048</option>
            </select>{" "}
            px
          </div>
          <div class="grid-w-25">
            {this.__renderInfoButton("select-target-mesh-resolution", "Target Mesh Resolution", i18n.targetMeshResolution)}
            <select
              id="select-target-mesh-resolution"
              ref={this.ref_slctTargetMeshResolution}
              onChange={this._onResulutionChangeHandler()}
            >
              <option value="256" selected>
                256
              </option>
              <option value="512">512</option>
              <option value="1024">1024</option>
              <option value="2048">2048</option>
            </select>{" "}
            px
          </div>
        </div>
        <div class="flow-containter">
          <div class="grid-w-33">{/* empty */}</div>
          <div class="grid-w-33 flex-flow center">
            <button id="randomizeButton" ref={this.ref_btnRandomize}>
              Randomize
            </button>
          </div>
          <div class="grid-w-33">
            <div class="flex-flow grid-w-50">
              <label for="isCreateManyEnabled">Create&nbsp;Many</label>
              <input type="checkbox" name="isCreateManyEnabled" id="isCreateManyEnabled" />
            </div>
            <div class="flex-flow grid-w-50">
              <label for="maxIterationCount">Max&nbsp;Iterations</label>
              <input type="number" id="maxIterationCount" name="maxIterationCount" min="0" value="99" />
            </div>
            <span id="iterationDisplay"></span>
          </div>
        </div>
        <div class="flow-container" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
          <div class="progressbar w-100"></div>
        </div>
        <div class="flow-containter flex-flow center-v">
          <label for="isPutEnabled">Store data</label>
          <input type="checkbox" name="isPutEnabled" id="isPutEnabled" />
          <input type="text" id="putURL" class="putURL" name="putURL" value="http://127.0.0.1:1337/model/put" disabled />
          <button id="btn_store-now" ref={this.ref_btnStoreNow}>
            Store Now
          </button>
        </div>
        <div class="status-container w-100 error"></div>
        <div class="flow-containter right">
          <label for="checkbox-show-preview-before-store">Show preview before storing</label>
          <input type="checkbox" name="checkbox-show-preview-before-store" id="checkbox-show-preview-before-store" checked />
        </div>
        <div class="flow-containter flex-flow">
          <div class="grid-w-33 flex-flow right" ref={this.ref_storePreviewContainer_2d}>
            {/* empty */}
          </div>
          <div class="grid-w-33 flex-flow center" ref={this.ref_storePreviewContainer_sculptmap}>
            {/* empty */}
          </div>
          <div class="grid-w-33 flex-flow left" ref={this.ref_storePreviewContainer_3d}>
            {/* empty */}
          </div>
        </div>
      </div>
    );

    this.rootElement.appendChild(htmlContent);

    if (
      !this.ref_btnRandomize.current ||
      !this.ref_btnShowPath.current ||
      !this.ref_btnHidePath.current ||
      !this.ref_btnStoreNow.current
    ) {
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
  } // END constructor

  // +---------------------------------------------------------------------------------
  // | Render a label with an info button.
  // +-------------------------------
  private __renderInfoButton(labelForId: string, labelText: string, infoText: string) {
    // <label for="select-target-mesh-resolution">Target Mesh Resolution</label>
    return (
      <div class="label-with-info">
        <label for={labelForId}>{labelText}</label>
        <span class="infosign tooltip">
          🛈
          <span class="tooltiptext tooltip-left">{infoText}</span>
        </span>
      </div>
    );
  }

  // +---------------------------------------------------------------------------------
  // | Handle form changes.
  // +-------------------------------
  private _onFormChangeHandler() {
    var _self = this;
    return function (event: Event) {
      _self._updateIdealBounds(true);
      _self.appContext.pb.redraw();
    };
  }

  // +---------------------------------------------------------------------------------
  // | Handle form changes.
  // +-------------------------------
  private _onSilhouetteColorChangeHandler() {
    var _self = this;
    return function (_event: Event) {
      _self.curSettings = _self.getCurrentFormSettings();
      _self.__handleSilhouetteColorChange();
    };
  }

  // +---------------------------------------------------------------------------------
  // | Handle form changes.
  // +-------------------------------
  private _onResulutionChangeHandler() {
    var _self = this;
    return function (_event: Event) {
      _self.curSettings = _self.getCurrentFormSettings();
      if (_self.curSettings.targetMeshResolution != _self.curSettings.optimalBoxWidthPx) {
        _self._displayError("Warning: recommended is using same values for targetMeshResolution and optimalBoxWidthPx.");
      } else {
        _self._displayError(null);
      }
    };
  }

  // +---------------------------------------------------------------------------------
  // | Handle silhouette form changes.
  // +-------------------------------
  private __handleSilhouetteColorChange() {
    if (this.curSettings.isSilhouetteBlackColor) {
      this.appContext.config.silhouetteLineColor = "rgb(0,0,0)";
    } else {
      this.appContext.config.silhouetteLineColor = this.initialSilhouetteColor;
    }
    this.appContext.pb.redraw();
    this.__create2DPreview();
  }

  // +---------------------------------------------------------------------------------
  // | Open the randomizer dialog.
  // +-------------------------------
  public open() {
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

  private __setRunning(isRunning) {
    this.isRunning = isRunning;
    this.isStopRequested = false;
    const elem_progressBar = this.rootElement.querySelector(".progressbar");
    if (!elem_progressBar) {
      console.warn("Cannot update progress bar: element not found.");
      return;
    }
    // this.ref_btnRandomize.current.disabled = isRunning;
    if (isRunning) {
      this.ref_btnRandomize.current.innerHTML = "Stop";
      elem_progressBar.classList.add("animate");
    } else {
      this.ref_btnRandomize.current.innerHTML = "Randomize";
      elem_progressBar.classList.remove("animate");
    }
    this.ref_btnRandomize.current.disabled = false;
  }

  // +---------------------------------------------------------------------------------
  // | When iterating many randomized results: set the current iteration message.
  // +-------------------------------
  private _setIterationDisplay(msg: string | number) {
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
  private _onCloseHandler() {
    var _self = this;
    return function (_event?: Event) {
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
  public drawIdealBounds(draw, fill) {
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
  private _displayStatus(errmsg, className) {
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
  private _displayError(errmsg) {
    this._displayStatus(errmsg ? `⚠️ ${errmsg}` : "", "error");
  }

  // +---------------------------------------------------------------------------------
  // | Internal method for displaying error messages inside the dialog.
  // +-------------------------------
  private _displaySuccess(msg) {
    this._displayStatus(msg ? `✅ ${msg}` : "", "success");
  }

  // +---------------------------------------------------------------------------------
  // | Handle path visibility events.
  // +-------------------------------
  private _togglePathVisibilityHandler = function (isVisible: boolean) {
    var _self = this;
    return event => {
      event.preventDefault();
      event.stopPropagation();
      // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
      _self._togglePathVisibility(isVisible, true);
    };
  };

  // +---------------------------------------------------------------------------------
  // | Toggle other paths except the outline on/off.
  // +-------------------------------
  private _togglePathVisibility(isVisible: boolean, isTriggerRedraw: boolean) {
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

  private _getPathVisibility() {
    // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
    return (
      this.appContext.config.drawRulers ||
      this.appContext.config.drawOutline ||
      this.appContext.config.fillOutline ||
      this.appContext.config.drawResizeHandleLines ||
      this.appContext.config.drawPathBounds ||
      this.isDrawIdealBoundsEnabled
    );
  }

  // +---------------------------------------------------------------------------------
  // | Toggle other paths except the outline on/off.
  // +-------------------------------
  private _storeNowHandler() {
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
  private _randomizeButtonEventHandler() {
    var _self = this;
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (_self.isRunning) {
        // _self.__setRunning(false);
        _self.isStopRequested = true;
        _self.ref_btnRandomize.current.disabled = true;
      } else {
        _self.iterationNumber = 0;
        _self.sequenceID = Math.round(Math.random() * 365535);
        _self.__setRunning(true);
        _self._randomizeDildoSettings(_self.sequenceID);
      }
    };
  }

  // +---------------------------------------------------------------------------------
  // | Compute the next randomized dildo settings.
  // +-------------------------------
  private _randomizeDildoSettings(curSequenceID) {
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
    if (this.isStopRequested) {
      // A new sequence has started. Stop this one immediately!
      console.log("Top was requested.");
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
    var idealLeftHalfBounds = new Bounds(
      this.idealGenerateBounds.min,
      new Vertex(this.idealGenerateBounds.min.x + this.idealGenerateBounds.width / 3, this.idealGenerateBounds.max.y)
    );

    // console.log("Ideal bounds", this.idealGenerateBounds, "idealLeftHalfBounds", idealLeftHalfBounds);
    var dildoRandomizer = new DildoRandomizer(
      idealLeftHalfBounds,
      this.curSettings.segmentCountMin,
      this.curSettings.segmentCountMax,
      this.curSettings.bendValueMin,
      this.curSettings.bendValueMax
    );

    // Use the mesh target resoluation
    this.appContext.config.outlineSegmentCount = this.curSettings.targetMeshResolution;
    this.appContext.config.shapeSegmentCount = this.curSettings.targetMeshResolution;

    var result = dildoRandomizer.next();
    console.log("Result", result);
    // this.callbackOptions.outlineChangedCallback(result);
    var _self = this;
    this.appContext
      .setRandomizedResult(result)
      .then((buildStatus: boolean) => {
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
            } else {
              // console.log("Done ramdomizing.");
              _self.__setRunning(false);
            }
          })
          .catch(e => {
            console.error(e);
            _self.__setRunning(false);
          });
      })
      .catch((error: any) => {
        console.error("Failed to build new model.", error);
        _self._displayError("Failed to build new model. Consult error console for details.");
      });
  }

  // +---------------------------------------------------------------------------------
  // | Tries to store the current model, screenshots sculpt map and settings.
  // +-------------------------------
  private _storeCurrentResult(isPutEnabled: boolean) {
    var _self = this;
    return new Promise<boolean>((accept, reject) => {
      this.__collectPreviewData().then((previewData: PrewiewData) => {
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
              _self._displayError(
                "Failed to store model. See error console for details." +
                  (err &&
                    err.response &&
                    err.response.data &&
                    err.response.data.message &&
                    " Message from server: " + err.response.data.message)
              );
              reject();
            });
        } catch (exc) {
          console.log("Failed to prepare/send axios request.", exc);
          _self._displayError("Failed to prepare/send axios request. See error console for details.");
          reject(exc);
        }
      }); // END then (collectPreviewData)
    });
  }

  private __collectPreviewData(): Promise<PrewiewData> {
    const preview2dImageDataURL = this.__create2DPreview();
    const previewSculptmapImageDataURL = this.__createSculptmapPreview();
    const _self = this;
    return new Promise<PrewiewData>((accept, _reject) => {
      // The last one is asynchronous because we need a short delay to
      // be sure we fetch the most recent 3d data (wait at least one 3d draw cycle).
      // Note: this is pretty dirty as we rely on x milliseconds effective time – but
      //       how can we know when the new data is _really_ available?
      // Task for future me.
      _self.__create3DPreview().then((preview3dImageDataURL: string) => {
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
  private __create2DPreview() {
    var boundsToCanvasRect = new Bounds(
      new Vertex(this.appContext.pb.revertMousePosition(this.idealExportBounds.min.x, this.idealExportBounds.min.y)),
      new Vertex(this.appContext.pb.revertMousePosition(this.idealExportBounds.max.x, this.idealExportBounds.max.y))
    );
    // Note: the `getImageFromCanvas` method will crop the rectangle if exceeds canvas bounds.
    //       move one pixel up.
    // var boundsToCanvasRect_safe = new Bounds(new Vertex(boundsToCanvasRect.min).subY(1.0), new Vertex(boundsToCanvasRect.max));
    const preview2dSubImageResult = getImageFromCanvas(
      this.appContext.pb.canvas as HTMLCanvasElement,
      (this.appContext.pb.draw as drawutils).ctx,
      boundsToCanvasRect
    );
    const preview2dImageDataURL = preview2dSubImageResult.canvas.toDataURL("image/png");
    if (this.curSettings.isShowPreviewBevoreStore) {
      this.ref_storePreviewContainer_2d.current.innerHTML = '<img class="store-preview" src=' + preview2dImageDataURL + " />";
    } else {
      this.ref_storePreviewContainer_2d.current.innerHTML = "";
    }
    return preview2dImageDataURL;
  }

  // +---------------------------------------------------------------------------------
  // | Create the sculptmap preview dataURl – and update the preview image inside the dialog,
  // | if requested by settings.
  // +-------------------------------
  private __createSculptmapPreview() {
    const previewScultpmapImageDataURL = this.appContext.getSculptmapDataURL();
    if (this.curSettings.isShowPreviewBevoreStore) {
      this.ref_storePreviewContainer_sculptmap.current.innerHTML =
        '<img class="store-preview" src=' + previewScultpmapImageDataURL + " />";
    } else {
      this.ref_storePreviewContainer_sculptmap.current.innerHTML = "";
    }
    return previewScultpmapImageDataURL;
  }

  // +---------------------------------------------------------------------------------
  // | Create the 3D preview dataURl – and update the preview image inside the dialog,
  // | if requested by settings.
  // +-------------------------------
  private __create3DPreview(): Promise<string> {
    return new Promise<string>((accept, _reject) => {
      globalThis.setTimeout(() => {
        const preview3dImageDataURL = this.appContext.dildoGeneration.canvas.toDataURL("image/png");
        if (this.curSettings.isShowPreviewBevoreStore) {
          this.ref_storePreviewContainer_3d.current.innerHTML = '<img class="store-preview" src=' + preview3dImageDataURL + " />";
        } else {
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
  private getCurrentFormSettings() {
    var elem_segmentCountMin: HTMLInputElement | null = this.rootElement.querySelector("#segmentCountMin");
    var elem_segmentCountMax: HTMLInputElement | null = this.rootElement.querySelector("#segmentCountMax");
    var elem_bendValueMin: HTMLInputElement | null = this.rootElement.querySelector("#bendValueMin");
    var elem_bendValueMax: HTMLInputElement | null = this.rootElement.querySelector("#bendValueMax");
    // var boundsRatio = Number(this.rootElement.querySelector("#boundsRatio option[selected]").value);
    // var elem_boundsRatio : HTMLInputElement = getSelectedOption(this.rootElement, "#boundsRatio", 1.0);
    // var elem_optimalBoxWidthPx : HTMLInputElement = getSelectedOption(this.rootElement, "#optimalBoxWidthPx", 1024);
    var elem_isCreateManyEnabled: HTMLInputElement | null = this.rootElement.querySelector("#isCreateManyEnabled");
    var elem_maxIterationCount: HTMLInputElement | null = this.rootElement.querySelector("#maxIterationCount");
    var elem_isPutEnabled: HTMLInputElement | null = this.rootElement.querySelector("#isPutEnabled");
    var elem_putURL: HTMLInputElement | null = this.rootElement.querySelector("#putURL");
    var elem_hideOutlineOnSave: HTMLInputElement | null = this.rootElement.querySelector("#checkbox-hide-outlines-on-save");
    var elem_isSilhouetteBlackColor: HTMLInputElement | null = this.rootElement.querySelector("#checkbox-silhouette-black-color");
    var elem_isShowPreviewBeforeSaving: HTMLInputElement | null = this.rootElement.querySelector(
      "#checkbox-show-preview-before-store"
    );
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
  private _updateIdealBounds(reevaluateFormSettings) {
    // Get the maximum bounds the final 2D model should ideallically be
    // displayed in.

    this.viewport = this.appContext.pb.viewport();
    if (reevaluateFormSettings) {
      this.curSettings = this.getCurrentFormSettings();
    }

    // var width = Math.min(this.viewport.width, this.curSettings.optimalBoxWidthPx);
    var canvasWidth = Math.min((this.appContext.pb.canvas as HTMLCanvasElement).width, this.curSettings.optimalBoxWidthPx);
    var canvasHeight = canvasWidth / this.curSettings.boundsRatio;
    // console.log("XXX canvasWidth", canvasWidth, "canvasHeight", canvasHeight);

    console.log("canvasWidth", canvasWidth, "canvasHeight", canvasHeight, "boundsRatio", this.curSettings.boundsRatio);
    if (canvasWidth < this.curSettings.optimalBoxWidthPx) {
      this._displayError(
        `Warning: viewport width ${canvasWidth.toFixed(
          0
        )} is smaller than optimal width ${this.curSettings.optimalBoxWidthPx.toFixed(0)}.`
      );
    } else {
      this._displaySuccess(
        `The viewport size satisfies the required box width ${this.curSettings.optimalBoxWidthPx.toFixed(0)}px.`
      );
    }
    var bounds = new Bounds(
      new Vertex(
        this.viewport.min.x + (this.viewport.width - canvasWidth / this.appContext.pb.config.scaleX) / 2.0,
        this.viewport.min.y + (this.viewport.height - canvasHeight / this.appContext.pb.config.scaleY) / 2.0
      ),
      new Vertex(
        this.viewport.max.x - (this.viewport.width - canvasWidth / this.appContext.pb.config.scaleX) / 2.0,
        this.viewport.max.y - (this.viewport.height - canvasHeight / this.appContext.pb.config.scaleY) / 2.0
      )
    );
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
var getSelectedOption = function (rootContainer: HTMLElement, selector: string, fallback: number): number {
  // var e = document.getElementById("elementId");
  const selectElement: HTMLSelectElement = rootContainer.querySelector(selector);
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
var getSelectedSelectOption = function (selectElement: HTMLSelectElement, fallback: number): number {
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
