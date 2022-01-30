/**
 * A helper function to draw resize handles.
 *
 * Don't want to have this in the main file.
 *
 * @author  Ikaros Kappler
 * @date    2021-12-03
 * @version 1.0.0
 */

var drawResizeHandleLines = function (pb, outline, bezierResizer, lineColor) {
  var bounds = outline.getBounds();
  if (bezierResizer.verticalResizeHandleDragStartPosition) {
    // TODO: draw a dashed line? : )
    pb.draw.line(
      { x: bounds.min.x, y: bezierResizer.verticalResizeHandle.y },
      { x: bounds.max.x, y: bezierResizer.verticalResizeHandle.y },
      lineColor,
      1.0
    );
  }
  if (bezierResizer.horizontalResizeHandleDragStartPosition) {
    // TODO: draw a dashed line? : )
    pb.draw.line(
      { x: bezierResizer.horizontalResizeHandle.x, y: bounds.min.y },
      { x: bezierResizer.horizontalResizeHandle.x, y: bounds.max.y },
      lineColor,
      1.0
    );
  }
};
