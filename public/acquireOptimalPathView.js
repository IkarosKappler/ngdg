/**
 * A helper function to scale and reposition the view to get optimal sight on an object.
 *
 * @author  Ikaros Kappler
 * @date    2021-12-03
 * @version 1.0.0
 */

// +---------------------------------------------------------------------------------
// | Scale a given Bounds instance to a new size (from its center).
// +-------------------------------
var acquireOptimalPathView = function (pb, outline) {
  // var frameSize = new THREE.Vector2(25, 25);
  // Just keep a 10% frame to stay clear of the canvas limits.
  var frameSize = new THREE.Vector2(pb.canvasSize.width * 0.1, pb.canvasSize.height * 0.1);

  // Compute the applicable canvas size, which leaves the passed frame untouched
  var applicableCanvasWidth = pb.canvasSize.width - frameSize.x * 2;
  var applicableCanvasHeight = pb.canvasSize.height - frameSize.y * 2;

  // Move center of bezier polygon to (0,0)
  var bounds = outline.getBounds();
  var ratioX = bounds.width / applicableCanvasWidth;
  var ratioY = bounds.height / applicableCanvasHeight;

  // The minimal match (width or height) is our choice.
  var newZoomFactor = Math.min(1.0 / ratioX, 1.0 / ratioY);
  pb.setZoom(newZoomFactor, newZoomFactor, { x: 0, y: 0 });

  // Set the draw offset position
  var drawOffsetX = frameSize.x + applicableCanvasWidth / 2.0 - (bounds.min.x + bounds.width / 2) * newZoomFactor;
  var drawOffsetY = frameSize.y + applicableCanvasHeight / 2.0 - (bounds.min.y + bounds.height / 2) * newZoomFactor;

  pb.setOffset({ x: drawOffsetX, y: drawOffsetY });

  // Don't forget to redraw
  pb.redraw();
};
