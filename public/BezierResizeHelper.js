/**
 * A helper to resize bezier paths in horizontal and vertical orientation.
 *
 * @requires PlotBoilerplate
 * @requires BezierPath
 * @requires Vertex
 *
 * @author  Ikaros Kappler
 * @date    2021-12-01
 * @version 1.0.0
 *
 */

// A closure to hide helper functions.
var BezierResizeHelper = (function () {
  /**
   * The constructor.
   *
   * @param {PlotBoilerplate} pb
   * @param {BezierPath} bezierPath
   * @param {function} updateCallback
   */
  var BH = function (pb, bezierPath, updateCallback) {
    this.bezierPath = bezierPath;

    // @public
    this.verticalResizeHandle = new Vertex(0, 0);
    this.horizontalResizeHandle = new Vertex(0, 0);

    // @private
    this.verticalResizeHandleDragStartPosition = null;
    this.horizontalResizeHandleDragStartPosition = null;

    this.__listeners = installListeners(this, pb, bezierPath, updateCallback);
    updateResizeHandles(this, bezierPath);
  };

  /**
   * Destroys this helper by removing all previously installed vertex listeners.
   */
  BH.prototype.destroy = function () {
    this.verticalResizeHandle.listeners.removeDragStartListener(this.__listeners[0]);
    this.verticalResizeHandle.listeners.removeDragEndListener(this.__listeners[1]);
    this.horizontalResizeHandle.listeners.removeDragStartListener(this.__listeners[2]);
    this.horizontalResizeHandle.listeners.removeDragEndListener(this.__listeners[3]);
  };

  /**
   * Install all required drag-start and drag-end listeners.
   */
  installListeners = function (_self, pb, bezierPath, updateCallback) {
    var listeners = [];
    listeners.push(
      _self.verticalResizeHandle.listeners.addDragStartListener(function (e) {
        var relPos = pb.transformMousePosition(e.params.draggedFrom.x, e.params.draggedFrom.y);
        _self.verticalResizeHandleDragStartPosition = relPos;
      })
    );
    listeners.push(
      _self.verticalResizeHandle.listeners.addDragEndListener(function (e) {
        var relTargetPos = pb.transformMousePosition(e.params.pos.x, e.params.pos.y);
        var targetHeightDifference = _self.verticalResizeHandleDragStartPosition.y - relTargetPos.y;
        changePathHeightBy(bezierPath, targetHeightDifference);
        updateResizeHandles(_self, bezierPath);
        _self.verticalResizeHandleDragStartPosition = null;
        updateCallback();
      })
    );

    listeners.push(
      _self.horizontalResizeHandle.listeners.addDragStartListener(function (e) {
        var relPos = pb.transformMousePosition(e.params.draggedFrom.x, e.params.draggedFrom.y);
        _self.horizontalResizeHandleDragStartPosition = relPos;
      })
    );
    listeners.push(
      _self.horizontalResizeHandle.listeners.addDragEndListener(function (e) {
        var relTargetPos = pb.transformMousePosition(e.params.pos.x, e.params.pos.y);
        var targetWidthDifference = _self.horizontalResizeHandleDragStartPosition.x - relTargetPos.x;
        changePathWidthBy(bezierPath, targetWidthDifference);
        updateResizeHandles(_self, bezierPath);
        _self.horizontalResizeHandleDragStartPosition = null;
        updateCallback();
      })
    );
    return listeners;
  };

  /**
   * @param {BezierPath} bezierPath - The path to update.
   * @param {number} heightAmount - The height difference to apply. Can be positive or negative or zero.
   */
  var changePathHeightBy = function (bezierPath, heightAmount) {
    var bounds = bezierPath.getBounds();
    var scaleAnchor = bounds.max;
    var verticalScaleFactor = (bounds.height + heightAmount) / bounds.height;
    bezierPath.scaleXY({ x: 1.0, y: verticalScaleFactor }, scaleAnchor);
  };

  /**
   * @param {BezierPath} bezierPath - The path to update.
   * @param {number} widthAmount - The width difference to apply. Can be positive or negative or zero.
   */
  var changePathWidthBy = function (bezierPath, widthAmount) {
    var bounds = bezierPath.getBounds();
    var scaleAnchor = bounds.max;
    var horizontalScaleFactor = (bounds.width + widthAmount) / bounds.width;
    bezierPath.scaleXY({ x: horizontalScaleFactor, y: 1.0 }, scaleAnchor);
  };

  /**
   * Set the handles to the new position after the path was resized.
   */
  var updateResizeHandles = function (_self, bezierPath) {
    var handleOffset = 0;
    var bounds = bezierPath.getBounds();
    _self.horizontalResizeHandle.set(bounds.min.x - handleOffset, bounds.min.y + bounds.height / 2.0);
    _self.verticalResizeHandle.set(bounds.min.x + bounds.width / 2.0, bounds.min.y - handleOffset);
  };

  return BH;
})();
