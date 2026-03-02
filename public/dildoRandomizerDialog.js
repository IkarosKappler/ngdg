/**
 * @require DildoRandomizer
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */

(function (_context) {
  //   const DEG_TO_RAD = Math.PI / 180.0;

  var DildoRandomizerDialog = function (pb, outlineChangedCallback) {
    this.pb = pb;
    this.outlineChangedCallback = outlineChangedCallback;
    this.rootElement = document.createElement("form");
    this.rootElement.setAttribute("id", "randomizerForm");
    this.rootElement.classList.add("randomizerForm");

    this.rootElement.innerHTML = `
    <h4>Outline Path</h4>
    <label for="segmentCountMin">Min Segments</label>
    <input type="number" id="segmentCountMin" min="1" max="24" value="3" name="segmentCountMin" />
    <label for="segmentCountMax">Max Segments</label>
    <input type="number" id="segmentCountMax" min="1" max="24" value="8" name="segmentCountMax" />
    <br>
    <h4>Mesh bend value (Deg)</h4>
    <label for="bendValueMin">Min Bend Value</label>
    <input type="number" id="bendValueMin" min="0" max="180" value="0" name="bendValueMin" />
    <label for="bendValueMax">Max Bend Value</label>
    <input type="number" id="bendValueMax" min="0" max="180" value="120" name="bendValueMax" />
    <br>
    <br>
    <button id="randomizeButton">Randomize</button>
    <br>
    <div class="flex-flow">
        Store data <input type="checkbox" name="isPutEnabled" id="isPutEnabled" disabled>
        <input type="text" id="putURL" class="putURL" name="putURL" value="http://127.0.0.1:1337/model/put" disabled>
    </div>
`;

    this.rootElement.querySelector("#randomizeButton").addEventListener("click", this._buttonEventHandler());
  };

  DildoRandomizerDialog.prototype._buttonEventHandler = function () {
    var _self = this;
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      var viewport = _self.pb.viewport();
      var viewportScaled = viewport.clone().getScaled(0.5);
      // Only the left half of the viewport/bounds should contain outline data.
      // -> set to half width.
      var bounds = new Bounds(
        viewportScaled.min,
        new Vertex(viewportScaled.min.x + viewportScaled.width / 2, viewportScaled.max.y)
      );
      var offsetY = viewport.max.y - bounds.max.y;
      // Move to the lower part to make it easier to see the full result below the dialog.
      bounds = bounds.getMoved({ x: 0, y: offsetY - 46 });

      var segmentCountMin = Number(_self.rootElement.querySelector("#segmentCountMin").value);
      var segmentCountMax = Number(_self.rootElement.querySelector("#segmentCountMax").value);
      var bendValueMin = Number(_self.rootElement.querySelector("#bendValueMin").value);
      var bendValueMax = Number(_self.rootElement.querySelector("#bendValueMax").value);
      var dildoRandomizer = new DildoRandomizer(bounds, segmentCountMin, segmentCountMax, bendValueMin, bendValueMax);

      var result = dildoRandomizer.next();
      _self.outlineChangedCallback(result);
    };
  };

  _context.DildoRandomizerDialog = DildoRandomizerDialog;
})(globalThis);
