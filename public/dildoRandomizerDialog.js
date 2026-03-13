/**
 * @require DildoRandomizer
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */

(function (_context) {
  //   const DEG_TO_RAD = Math.PI / 180.0;

  // outlineChangedCallback
  // onPathVisibilityChanged
  // getBezierJSON
  // getSculptmapDataURL
  // getPreviewImageDataURL
  var DildoRandomizerDialog = function (pb, modal, config, callbackOptions) {
    // outlineChangedCallback, onPathVisibilityChanged, getBezierJSON) {
    this.pb = pb;
    this.modal = modal;
    this.config = config;
    // this.outlineChangedCallback = outlineChangedCallback;
    // this.onPathVisibilityChanged = onPathVisibilityChanged;
    this.callbackOptions = callbackOptions;
    this.rootElement = document.createElement("form");
    this.rootElement.setAttribute("id", "randomizerForm");
    this.rootElement.classList.add("randomizerForm");
    this.isOpen = false;
    this.isDrawIdealBoundsEnabled = true;

    // The ideal bounds to export the final image data from.
    this.idealExportBounds = null;

    // The real bounds _inside_ the export bounds to generate the outline in.
    this.idealGenerateBounds = null;

    this.curSettings = null;
    this.viewport = null;
    this.iterationNumber = 0;
    this.sequenceID = 0;
    this.isRunning = false;

    this.rootElement.innerHTML = `
    <div class="font-600-desktop">
      <div class="flow-containter">
        <div class="grid-w-25"><h4>Outline Path</h4></div>
        <div class="grid-w-25">
          <label for="segmentCountMin">Min Segments</label><br>
          <input type="number" id="segmentCountMin" min="1" max="24" value="3" name="segmentCountMin" />
        </div>
        <div class="grid-w-25">
          <label for="segmentCountMax">Max Segments</label><br>
          <input type="number" id="segmentCountMax" min="1" max="24" value="8" name="segmentCountMax" />
        </div>
        <div class="grid-w-25 flow-containter right center-v">
          <button id="btn-hide-path">Hide Path</button>
          <button id="btn-show-path">Show Path</button>
        </div>
      </div>
      <div class="flow-containter">
        <div class="grid-w-25"><h4>Mesh bend value (Deg)</h4></div>
        <div class="grid-w-25">
          <label for="bendValueMin">Min Bend Value</label><br>
          <input type="number" id="bendValueMin" min="0" max="180" value="0" name="bendValueMin" />
          °
        </div>
        <div class="grid-w-25">
          <label for="bendValueMax">Max Bend Value</label><br>
          <input type="number" id="bendValueMax" min="0" max="180" value="120" name="bendValueMax" />
          °
        </div>
        <div class="grid-w-25 flow-containter right center-v">
          <label for="checkbox-hide-outlines-on-save">Hide outlines on save</label>
          <input type="checkbox" name="checkbox-hide-outlines-on-save" id="checkbox-hide-outlines-on-save" checked>
        </div>
      </div>
      <div class="flow-containter center">
        <div class="grid-w-25"><h4>Target Bounds Size</h4></div>
        <div class="grid-w-25">
          <label for="boundsRatio">Box ratio</label><br>
          <select id="boundsRatio">
            <option value="2.0">2:1</option>
            <option value="1.333">4:3</option>
            <option value="1.0" selected>1:1</option>
            <option value="0.75">3:4</option>
            <option value="0.5">1:2</option>
          </select>
        </div>
        <div class="grid-w-25">
          <label for="optimalBoxWidthPx">Optimal box width</label><br>
          <select id="optimalBoxWidthPx">
            <option value="256" selected>256</option>
            <option value="512">512</option>
            <option value="1024">1024</option>
            <option value="2048">2048</option>
          </select> px
        </div>
        <div class="grid-w-25 flow-containter right center-v">
          <label for="checkbox-silhouette-black-color">Use black color for silhouette</label>
          <input type="checkbox" name="checkbox-silhouette-black-color" id="checkbox-silhouette-black-color" checked>
        </div>
      </div>
      <div class="flow-containter">
        <div class="grid-w-33"><!-- empty --></div>
        <div class="grid-w-33 flex-flow center">
          <button id="randomizeButton">Randomize</button>
        </div>
        <div class="grid-w-33">
          <div class="flex-flow grid-w-50">
            <label for="isCreateManyEnabled">Create&nbsp;Many</label>
            <input type="checkbox" name="isCreateManyEnabled" id="isCreateManyEnabled">
          </div>
          <div class="flex-flow grid-w-50">
          <label for="maxIterationCount">Max&nbsp;Iterations</label>
            <input type="number" id="maxIterationCount" name="maxIterationCount" min="0" value="99" />
          </div>
          <span id="iterationDisplay"></span>
        </div>
      </div>
      <div class="flow-container" style="background-color: rgba(0,0,0,0.25);">
        <div class="progressbar w-100"></div>
      </div>
      <div class="flow-containter flex-flow">
          <label for="isPutEnabled">Store data</label>
          <input type="checkbox" name="isPutEnabled" id="isPutEnabled">
          <input type="text" id="putURL" class="putURL" name="putURL" value="http://127.0.0.1:1337/model/put" disabled>
          <button id="btn_store-now">Store Now</button>
      </div>
      <div class="status-container w-100 error"></div>
    </div> <!-- END small font -->
`;

    this.rootElement.querySelector("#randomizeButton").addEventListener("click", this._randomizeButtonEventHandler());
    this.rootElement.querySelector("#btn-show-path").addEventListener("click", this._togglePathVisibilityHandler(true));
    this.rootElement.querySelector("#btn-hide-path").addEventListener("click", this._togglePathVisibilityHandler(false));
    this.rootElement.querySelector("#btn_store-now").addEventListener("click", this._storeNowHandler());

    console.log("this.modal.modalElements", this.modal.modalElements);
    this.modal.modalElements.modal.header.closeBtn.addEventListener("click", this._onCloseHandler());

    var formChangeHandler = this._onFormChangeHandler();

    // this.rootElement.querySelector("#segmentCountMin").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#segmentCountMax").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#bendValueMin").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#bendValueMax").addEventListener("click", formChangeHandler);
    this.rootElement.querySelector("#boundsRatio").addEventListener("click", formChangeHandler);
    this.rootElement.querySelector("#optimalBoxWidthPx").addEventListener("click", formChangeHandler);

    globalThis.addEventListener("resize", formChangeHandler);
  };

  // +---------------------------------------------------------------------------------
  // | Handle form changes.
  // +-------------------------------
  DildoRandomizerDialog.prototype._onFormChangeHandler = function () {
    var _self = this;
    return function (event) {
      _self._updateIdealBounds(true);
      _self.pb.redraw();
    };
  };

  // +---------------------------------------------------------------------------------
  // | Open the randomizer dialog.
  // +-------------------------------
  DildoRandomizerDialog.prototype.open = function () {
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
  };

  DildoRandomizerDialog.prototype.__setRunning = function (isRunning) {
    this.isRunning = isRunning;
    if (isRunning) {
      this.rootElement.querySelector(".progressbar").classList.add("animate");
    } else {
      this.rootElement.querySelector(".progressbar").classList.remove("animate");
    }
  };

  // +---------------------------------------------------------------------------------
  // | When iterating many randomized results: set the current iteration message.
  // +-------------------------------
  DildoRandomizerDialog.prototype._setIterationDisplay = function (msg) {
    this.rootElement.querySelector("#iterationDisplay").innerHTML = msg;
  };

  // +---------------------------------------------------------------------------------
  // | Handle close events.
  // +-------------------------------
  DildoRandomizerDialog.prototype._onCloseHandler = function () {
    var _self = this;
    return function (_event) {
      _self.isOpen = false;
      _self.pb.redraw();
      console.log("Set running = false");
      _self.__setRunning(false);
    };
  };

  // +---------------------------------------------------------------------------------
  // | Draw the ideal bounds for randomization.
  // +-------------------------------
  DildoRandomizerDialog.prototype.drawIdealBounds = function (draw, fill) {
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
  };

  // +---------------------------------------------------------------------------------
  // | Internal method for displaying error messages inside the dialog.
  // +-------------------------------
  DildoRandomizerDialog.prototype._displayStatus = function (errmsg, className) {
    const errorContainer = this.rootElement.querySelector(".status-container");
    if (!errorContainer) {
      return;
    }
    errorContainer.classList.remove("error", "success");
    errorContainer.classList.add(className);
    errorContainer.innerHTML = errmsg;
  };

  // +---------------------------------------------------------------------------------
  // | Internal method for displaying error messages inside the dialog.
  // +-------------------------------
  DildoRandomizerDialog.prototype._displayError = function (errmsg) {
    this._displayStatus(errmsg ? `⚠️ ${errmsg}` : "", "error");
  };

  // +---------------------------------------------------------------------------------
  // | Internal method for displaying error messages inside the dialog.
  // +-------------------------------
  DildoRandomizerDialog.prototype._displaySuccess = function (msg) {
    this._displayStatus(msg ? `✅ ${msg}` : "", "success");
  };

  // +---------------------------------------------------------------------------------
  // | Handle path visibility events.
  // +-------------------------------
  DildoRandomizerDialog.prototype._togglePathVisibilityHandler = function (isVisible) {
    var _self = this;
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
      _self._togglePathVisibility(isVisible);
    };
  };

  // +---------------------------------------------------------------------------------
  // | Toggle other paths except the outline on/off.
  // +-------------------------------
  DildoRandomizerDialog.prototype._togglePathVisibility = function (isVisible) {
    // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
    this.config.drawRulers = isVisible;
    this.config.drawOutline = isVisible;
    this.config.fillOutline = isVisible;
    this.config.drawResizeHandleLines = isVisible;
    this.config.drawPathBounds = isVisible;
    this.isDrawIdealBoundsEnabled = isVisible;
    this.callbackOptions.onPathVisibilityChanged();
  };

  DildoRandomizerDialog.prototype._getPathVisibility = function () {
    // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
    return (
      this.config.drawRulers ||
      this.config.drawOutlines ||
      this.config.fillOutlines ||
      this.config.drawResizeHandleLiness ||
      this.config.drawPathBoundss ||
      this.isDrawIdealBoundsEnabled
    );
  };

  // +---------------------------------------------------------------------------------
  // | Toggle other paths except the outline on/off.
  // +-------------------------------
  DildoRandomizerDialog.prototype._storeNowHandler = function () {
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
  };

  // +---------------------------------------------------------------------------------
  // | Randomize the next dildo model from the current settings.
  // +-------------------------------
  DildoRandomizerDialog.prototype._randomizeButtonEventHandler = function () {
    var _self = this;
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      _self.iterationNumber = 0;
      _self.sequenceID = Math.round(Math.random() * 365535);
      _self.__setRunning(true);
      _self._randomizeDildoSettings(_self.sequenceID);
    };
  };

  // +---------------------------------------------------------------------------------
  // | Compute the next randomized dildo settings.
  // +-------------------------------
  DildoRandomizerDialog.prototype._randomizeDildoSettings = function (curSequenceID) {
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
    var idealLeftHalfBounds = new Bounds(
      this.idealGenerateBounds.min,
      new Vertex(this.idealGenerateBounds.min.x + this.idealGenerateBounds.width / 3, this.idealGenerateBounds.max.y)
    );

    console.log("Ideal bounds", this.idealGenerateBounds, "idealLeftHalfBounds", idealLeftHalfBounds);
    var dildoRandomizer = new ngdg.DildoRandomizer(
      idealLeftHalfBounds,
      this.curSettings.segmentCountMin,
      this.curSettings.segmentCountMax,
      this.curSettings.bendValueMin,
      this.curSettings.bendValueMax
    );

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
        } else {
          console.log("Done ramdomizing.");
          _self.__setRunning(false);
        }
      })
      .catch(function (e) {
        console.error(e);
        _self.__setRunning(false);
      });
  };

  // +---------------------------------------------------------------------------------
  // | Tries to store the current model, screenshots sculpt map and settings.
  // +-------------------------------
  DildoRandomizerDialog.prototype._storeCurrentResult = function (isPutEnabled) {
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
        accept();
        return;
      }
      console.log("[_storeCurrentResult] called [1].");
      // Retrieve image data
      try {
        var boundsToCanvasRect = new Bounds(
          new Vertex(_self.pb.revertMousePosition(_self.idealExportBounds.min.x, _self.idealExportBounds.min.y)),
          new Vertex(_self.pb.revertMousePosition(_self.idealExportBounds.max.x, _self.idealExportBounds.max.y))
        );
        // var boundsToCanvasRect = _self.idealExportBounds;
        console.log("boundsToCanvasRect", boundsToCanvasRect);
        const preview2dSubImageResult = ngdg.getImageFromCanvas(_self.pb.canvas, _self.pb.draw.ctx, boundsToCanvasRect);
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
            accept();
          })
          .catch(function (err) {
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
    });
  };

  // +---------------------------------------------------------------------------------
  // | Get the current settings as numbers from the displayed HTML form.
  // +-------------------------------
  DildoRandomizerDialog.prototype.getCurrentFormSettings = function () {
    var segmentCountMin = Number(this.rootElement.querySelector("#segmentCountMin").value);
    var segmentCountMax = Number(this.rootElement.querySelector("#segmentCountMax").value);
    var bendValueMin = Number(this.rootElement.querySelector("#bendValueMin").value);
    var bendValueMax = Number(this.rootElement.querySelector("#bendValueMax").value);
    // var boundsRatio = Number(this.rootElement.querySelector("#boundsRatio option[selected]").value);
    var boundsRatio = Number(getSelectedOption(this.rootElement, "#boundsRatio", 1.0));
    var optimalBoxWidthPx = Number(getSelectedOption(this.rootElement, "#optimalBoxWidthPx", 1024));
    var isCreateManyEnabled = Boolean(this.rootElement.querySelector("#isCreateManyEnabled").checked);
    var maxIterationCount = Number(this.rootElement.querySelector("#maxIterationCount").value);
    var isPutEnabled = Boolean(this.rootElement.querySelector("#isPutEnabled").checked);
    var putURL = this.rootElement.querySelector("#putURL").value;
    var hideOutlineOnSave = Boolean(this.rootElement.querySelector("#checkbox-hide-outlines-on-save").checked);
    var isSilhouetteBlackColor = Boolean(this.rootElement.querySelector("#checkbox-silhouette-black-color").checked);

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
  };

  // +---------------------------------------------------------------------------------
  // | Update the ideal bounds from the current form settings.
  // +-------------------------------
  DildoRandomizerDialog.prototype._updateIdealBounds = function (reevaluateFormSettings) {
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
        this.viewport.min.x + (this.viewport.width - canvasWidth / this.pb.config.scaleX) / 2.0,
        this.viewport.min.y + (this.viewport.height - canvasHeight / this.pb.config.scaleY) / 2.0
      ),
      new Vertex(
        this.viewport.max.x - (this.viewport.width - canvasWidth / this.pb.config.scaleX) / 2.0,
        this.viewport.max.y - (this.viewport.height - canvasHeight / this.pb.config.scaleY) / 2.0
      )
    );

    // Move to the lower part to make it easier to see the full result below the dialog.
    var offsetX = 0.0;
    var offsetY = this.viewport.max.y - bounds.max.y;
    bounds = bounds.getMoved({ x: offsetX, y: offsetY });

    this.idealExportBounds = bounds;
    this.idealGenerateBounds = bounds.getScaled(0.666);
  };

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

  _context.DildoRandomizerDialog = DildoRandomizerDialog;
})(globalThis);
