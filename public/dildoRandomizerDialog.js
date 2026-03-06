/**
 * @require DildoRandomizer
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */

(function (_context) {
  //   const DEG_TO_RAD = Math.PI / 180.0;

  var DildoRandomizerDialog = function (pb, config, outlineChangedCallback, onPathVisibilityChanged) {
    this.pb = pb;
    this.config = config;
    this.outlineChangedCallback = outlineChangedCallback;
    this.onPathVisibilityChanged = onPathVisibilityChanged;
    this.rootElement = document.createElement("form");
    this.rootElement.setAttribute("id", "randomizerForm");
    this.rootElement.classList.add("randomizerForm");

    this.rootElement.innerHTML = `
    <div class="font-600">
      <div class="flow-containter right">
        <button id="btn-hide-path">Hide Path</button>
        <button id="btn-show-path">Show Path</button>
      </div>
      <div class="flow-containter">
        <div class="grid-w-33"><h4>Outline Path</h4></div>
        <div class="grid-w-33">
          <label for="segmentCountMin">Min Segments</label>
          <input type="number" id="segmentCountMin" min="1" max="24" value="3" name="segmentCountMin" />
        </div>
        <div class="grid-w-33">
          <label for="segmentCountMax">Max Segments</label>
          <input type="number" id="segmentCountMax" min="1" max="24" value="8" name="segmentCountMax" />
        </div>
      </div>
      <div class="flow-containter">
        <div class="grid-w-33"><h4>Mesh bend value (Deg)</h4></div>
        <div class="grid-w-33">
          <label for="bendValueMin">Min Bend Value</label>
          <input type="number" id="bendValueMin" min="0" max="180" value="0" name="bendValueMin" />
        </div>
        <div class="grid-w-33">
          <label for="bendValueMax">Max Bend Value</label>
          <input type="number" id="bendValueMax" min="0" max="180" value="120" name="bendValueMax" />
        </div>
      </div>
      <div class="flow-containter center">
        <div class="grid-w-33"><h4>Target Bounds Size</h4></div>
        <div class="grid-w-33">
          <label for="boundsRatio">Box ratio</label>
          <select id="boundsRatio">
            <option value="2.0">2:1</option>
            <option value="1.333">4:3</option>
            <option value="1.0" selected>1:1</option>
            <option value="0.75">3:4</option>
            <option value="0.5">1:2</option>
          </select>
        </div>
        <div class="grid-w-33">
          <label for="optimalBoxWidthPx">Optimal box width (px)</label>
          <select id="optimalBoxWidthPx">
            <option value="256">256</option>
            <option value="512">512</option>
            <option value="1024" selected>1024</option>
            <option value="2048">2048</option>
          </select>
        </div>
      </div>
    </div> <!-- END small font -->
    <div class="flow-containter center">
      <button id="randomizeButton">Randomize</button>
    </div>
    <div class="flex-flow">
        <label for="isPutEnabled">Store data</label> <input type="checkbox" name="isPutEnabled" id="isPutEnabled" disabled>
        <input type="text" id="putURL" class="putURL" name="putURL" value="http://127.0.0.1:1337/model/put" disabled>
    </div>
    <div class="error-container w-100 error"></div>
`;

    this.rootElement.querySelector("#randomizeButton").addEventListener("click", this._randomizeButtonEventHandler());
    this.rootElement.querySelector("#btn-show-path").addEventListener("click", this._togglePathVisibilityHandler(true));
    this.rootElement.querySelector("#btn-hide-path").addEventListener("click", this._togglePathVisibilityHandler(false));
  };

  DildoRandomizerDialog.prototype._displayError = function (errmsg) {
    const errorContainer = this.rootElement.querySelector(".error-container");
    if (!errorContainer) {
      return;
    }
    errorContainer.innerHTML = errmsg;
  };

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
      // _self.pb.redraw();
    };
  };

  DildoRandomizerDialog.prototype._randomizeButtonEventHandler = function () {
    var _self = this;
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      _self._displayError("");
      var viewport = _self.pb.viewport();
      // var viewportScaled = viewport.clone().getScaled(0.5);
      // // Only the left half of the viewport/bounds should contain outline data.
      // // -> set to half width.
      // var bounds = new Bounds(
      //   viewportScaled.min,
      //   new Vertex(viewportScaled.min.x + viewportScaled.width / 2, viewportScaled.max.y)
      // );
      // var offsetY = viewport.max.y - bounds.max.y;
      // // Move to the lower part to make it easier to see the full result below the dialog.
      // bounds = bounds.getMoved({ x: 0, y: offsetY - 46 });

      var segmentCountMin = Number(_self.rootElement.querySelector("#segmentCountMin").value);
      var segmentCountMax = Number(_self.rootElement.querySelector("#segmentCountMax").value);
      var bendValueMin = Number(_self.rootElement.querySelector("#bendValueMin").value);
      var bendValueMax = Number(_self.rootElement.querySelector("#bendValueMax").value);
      // var boundsRatio = Number(_self.rootElement.querySelector("#boundsRatio option[selected]").value);
      var boundsRatio = Number(getSelectedOption(_self.rootElement, "#boundsRatio", 1.0));
      var optimalBoxWidthPx = Number(getSelectedOption(_self.rootElement, "#optimalBoxWidthPx", 1024));
      console.log("boundsRatio", boundsRatio, "optimalBoxWidthPx", optimalBoxWidthPx);

      // Give the viewport some safe areas to all directions.
      var viewport = _self.pb.viewport().getScaled(0.9);
      var idealBounds = _self._getIdealBounds(viewport, boundsRatio, optimalBoxWidthPx);

      // Only the left half of the viewport/bounds should contain outline data.
      // -> set to half width.
      // var idealLeftHalfBounds = new Bounds(
      //   idealBounds.min,
      //   new Vertex(idealBounds.max.x - idealBounds.width / 2.0, idealBounds.max.y - idealBounds.height / 2.0)
      // );

      // Scale down to roughtly one third to make room for the full model and bent to the right.
      // var idealLeftHalfBounds = idealBounds.getScaled(0.333);
      var idealLeftHalfBounds = new Bounds(
        idealBounds.min,
        new Vertex(idealBounds.min.x + idealBounds.width / 3, idealBounds.max.y)
      );

      // // Move to the lower part to make it easier to see the full result below the dialog.
      // var offsetY = viewport.max.y - idealLeftHalfBounds.max.y;
      // idealLeftHalfBounds = idealLeftHalfBounds.getMoved({ x: 0, y: offsetY - 16 });
      var offsetX = 0.0; // idealLeftHalfBounds.max.x - idealBounds.max.x;
      var offsetY = viewport.max.y - idealLeftHalfBounds.max.y;
      idealLeftHalfBounds = idealLeftHalfBounds.getMoved({ x: offsetX, y: offsetY });

      console.log("Ideal bounds", idealBounds, "idealLeftHalfBounds", idealLeftHalfBounds);
      var dildoRandomizer = new DildoRandomizer(
        idealLeftHalfBounds,
        segmentCountMin,
        segmentCountMax,
        bendValueMin,
        bendValueMax
      );

      var result = dildoRandomizer.next();
      _self.outlineChangedCallback(result);
    };
  };

  DildoRandomizerDialog.prototype._getIdealBounds = function (viewport, boundsRatio, optimalBoxWidthPx) {
    // Get the maximum bounds the final 2D model should ideallically be
    // displayed in.

    var width = Math.min(viewport.width, optimalBoxWidthPx);
    var height = width / boundsRatio;
    console.log("width", width, "height", height, "boundsRatio", boundsRatio);
    if (width < optimalBoxWidthPx) {
      this._displayError(
        `Warning: viewport width ${viewport.width.toFixed(0)} is smaller than optimal width ${optimalBoxWidthPx.toFixed(0)}.`
      );
    }
    var bounds = new Bounds(
      new Vertex(viewport.min.x + (viewport.width - width) / 2.0, viewport.min.y + (viewport.height - height) / 2.0),
      new Vertex(viewport.max.x - (viewport.width - width) / 2.0, viewport.max.y - (viewport.height - height) / 2.0)
    );
    // var offsetY = viewport.max.y - bounds.max.y;
    // // Move to the lower part to make it easier to see the full result below the dialog.
    // bounds = bounds.getMoved({ x: 0, y: offsetY });
    return bounds;
  };

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
