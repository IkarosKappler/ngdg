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
  // console.log("drawResizeHandleLines", bezierResizer.verticalResizeHandleDragStartPosition);
  var bounds = outline.getBounds();
  if (bezierResizer.verticalResizeHandleDragStartPosition) {
    pb.draw.line(
      { x: bounds.min.x, y: bezierResizer.verticalResizeHandle.y },
      { x: bounds.max.x, y: bezierResizer.verticalResizeHandle.y },
      lineColor,
      1.0,
      { dashOffset: 0.0, dashArray: [5, 5] }
    );
  }
  if (bezierResizer.horizontalResizeHandleDragStartPosition) {
    pb.draw.line(
      { x: bezierResizer.horizontalResizeHandle.x, y: bounds.min.y },
      { x: bezierResizer.horizontalResizeHandle.x, y: bounds.max.y },
      lineColor,
      1.0,
      { dashOffset: 0.0, dashArray: [5, 5] }
    );
  }
};
