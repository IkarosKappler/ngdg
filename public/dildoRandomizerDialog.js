/**
 * @require DildoRandomizer
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */

(function (_context) {
  //   const DEG_TO_RAD = Math.PI / 180.0;

  var DildoRandomizerDialog = function (pb, modal, config, outlineChangedCallback, onPathVisibilityChanged) {
    // this.appContext = appContext;
    this.pb = pb;
    this.modal = modal;
    this.config = config;
    this.outlineChangedCallback = outlineChangedCallback;
    this.onPathVisibilityChanged = onPathVisibilityChanged;
    this.rootElement = document.createElement("form");
    this.rootElement.setAttribute("id", "randomizerForm");
    this.rootElement.classList.add("randomizerForm");
    this.isOpen = false;

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
    <div class="font-600">
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
        <div class="grid-w-25 flow-containter right">
          <button id="btn-hide-path">Hide Path</button>
          <button id="btn-show-path">Show Path</button>
        </div>
      </div>
      <div class="flow-containter">
        <div class="grid-w-25"><h4>Mesh bend value (Deg)</h4></div>
        <div class="grid-w-25">
          <label for="bendValueMin">Min Bend Value</label><br>
          <input type="number" id="bendValueMin" min="0" max="180" value="0" name="bendValueMin" />
        </div>
        <div class="grid-w-25">
          <label for="bendValueMax">Max Bend Value</label><br>
          <input type="number" id="bendValueMax" min="0" max="180" value="120" name="bendValueMax" />
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
          <label for="optimalBoxWidthPx">Optimal box width (px)</label><br>
          <select id="optimalBoxWidthPx">
            <option value="256">256</option>
            <option value="512">512</option>
            <option value="1024" selected>1024</option>
            <option value="2048">2048</option>
          </select>
        </div>
      </div>
      <div class="flow-containter">
        <div class="grid-w-33"></div>
        <div class="grid-w-33 flex-flow center">
          <button id="randomizeButton">Randomize</button>
        </div>
        <div class="grid-w-33">
          <label for="isCreateManyEnabled">Create Many</label>
          <input type="checkbox" name="isCreateManyEnabled" id="isCreateManyEnabled"><br>
          <div class="flow-containter">
            <input type="number" id="maxIterationCount" name="maxIterationCount" min="0" value="99" />
            <label for="maxIterationCount">Max Iterations</label><br>
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
      </div>
      <div class="error-container w-100 error"></div>
    </div> <!-- END small font -->
`;

    this.rootElement.querySelector("#randomizeButton").addEventListener("click", this._randomizeButtonEventHandler());
    this.rootElement.querySelector("#btn-show-path").addEventListener("click", this._togglePathVisibilityHandler(true));
    this.rootElement.querySelector("#btn-hide-path").addEventListener("click", this._togglePathVisibilityHandler(false));

    console.log("this.modal.modalElements", this.modal.modalElements);
    this.modal.modalElements.modal.header.closeBtn.addEventListener("click", this._onCloseHandler());

    // var formChangeHandler = this._onFormChangeHandler();

    // this.rootElement.querySelector("#segmentCountMin").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#segmentCountMax").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#bendValueMin").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#bendValueMax").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#boundsRatio").addEventListener("click", formChangeHandler);
    // this.rootElement.querySelector("#optimalBoxWidthPx").addEventListener("click", formChangeHandler);
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
          _self.modal.close();
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
    return function (event) {
      _self.isOpen = false;
      _self.pb.redraw();
      _self.__setRunning(false);
    };
  };

  // +---------------------------------------------------------------------------------
  // | Draw the ideal bounds for randomization.
  // +-------------------------------
  DildoRandomizerDialog.prototype.drawIdealBounds = function (draw, fill) {
    if (!this.isOpen || this.isRunning) {
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
  DildoRandomizerDialog.prototype._displayError = function (errmsg) {
    const errorContainer = this.rootElement.querySelector(".error-container");
    if (!errorContainer) {
      return;
    }
    errorContainer.innerHTML = errmsg;
  };

  // +---------------------------------------------------------------------------------
  // | Toggle other paths except the outline on/off.
  // +-------------------------------
  DildoRandomizerDialog.prototype._togglePathVisibilityHandler = function (isVisible) {
    var _self = this;
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      // drawRulers=1&drawOutline=1&fillOutline=1&drawResizeHandleLines=1&drawPathBounds=1&outlineSegmentCount=256&shapeSegmentCount=128&&disableLocalStorage=1
      _self.config.drawRulers = isVisible;
      _self.config.drawOutline = isVisible;
      _self.config.fillOutline = isVisible;
      _self.config.drawResizeHandleLines = isVisible;
      _self.config.drawPathBounds = isVisible;
      _self.onPathVisibilityChanged();
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
    this.__setRunning(true);
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
    var dildoRandomizer = new DildoRandomizer(
      idealLeftHalfBounds,
      this.curSettings.segmentCountMin,
      this.curSettings.segmentCountMax,
      this.curSettings.bendValueMin,
      this.curSettings.bendValueMax
    );

    var result = dildoRandomizer.next();
    this.outlineChangedCallback(result);

    if (this.curSettings.isPutEnabled) {
      // TODO: Store result
      // ...
    }
    if (this.curSettings.isCreateManyEnabled) {
      var _self = this;
      globalThis.setTimeout(function () {
        _self._randomizeDildoSettings(curSequenceID);
      }, 1000);
    } else {
      this.__setRunning(false);
    }
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
      putURL: putURL
    };
  };

  // +---------------------------------------------------------------------------------
  // | Update the ideal bounds from the current form settings.
  // +-------------------------------
  DildoRandomizerDialog.prototype._updateIdealBounds = function (reevaluateFormSettings) {
    // viewport, boundsRatio, optimalBoxWidthPx) {
    // Get the maximum bounds the final 2D model should ideallically be
    // displayed in.

    // var viewport = this.pb.viewport();
    // var viewport = this.pb.viewport().getScaled(0.9);
    this.viewport = this.pb.viewport(); // viewport;
    if (reevaluateFormSettings) {
      this.curSettings = this.getCurrentFormSettings();
    }

    var width = Math.min(this.viewport.width, this.curSettings.optimalBoxWidthPx);
    var height = width / this.curSettings.boundsRatio;
    console.log("width", width, "height", height, "boundsRatio", this.curSettings.boundsRatio);
    if (width < this.curSettings.optimalBoxWidthPx) {
      this._displayError(
        `Warning: viewport width ${this.viewport.width.toFixed(
          0
        )} is smaller than optimal width ${this.curSettings.optimalBoxWidthPx.toFixed(0)}.`
      );
    }
    var bounds = new Bounds(
      new Vertex(
        this.viewport.min.x + (this.viewport.width - width) / 2.0,
        this.viewport.min.y + (this.viewport.height - height) / 2.0
      ),
      new Vertex(
        this.viewport.max.x - (this.viewport.width - width) / 2.0,
        this.viewport.max.y - (this.viewport.height - height) / 2.0
      )
    );

    // // Move to the lower part to make it easier to see the full result below the dialog.
    // var offsetY = viewport.max.y - idealLeftHalfBounds.max.y;
    // idealLeftHalfBounds = idealLeftHalfBounds.getMoved({ x: 0, y: offsetY - 16 });
    var offsetX = 0.0; // idealLeftHalfBounds.max.x - idealBounds.max.x;
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
