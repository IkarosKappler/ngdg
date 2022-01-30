/**
 * Some helpers to draw vertical and horizontal rulers.
 *
 * @author  Ikaros Kappler
 * @date    2021-12-03
 * @version 1.0.0
 */

globalThis.Rulers =
  globalThis.Rulers ||
  (function () {
    var R = {
      mmPerUnit: 0.5,
      stepSize: 20, // pixels
      fontSize: 10
    };

    R.drawHorizontalRuler = function (pb, outline, color) {
      // Draw the ruler.
      var bounds = outline.getBounds();
      // Draw horizontal ruler
      pb.draw.line({ x: bounds.min.x, y: bounds.max.y + 10 }, { x: bounds.max.x, y: bounds.max.y + 10 }, color, 0.5);
      var horizontalStepCount = bounds.width / R.stepSize;
      for (var i = 0; i < horizontalStepCount; i++) {
        pb.draw.line(
          { x: bounds.max.x - i * R.stepSize, y: bounds.max.y + 10 - 3 },
          { x: bounds.max.x - i * R.stepSize, y: bounds.max.y + 10 + 3 },
          color,
          0.5
        );
        // Draw label?
        if (i % 2 === 0) {
          var x = bounds.max.x - i * R.stepSize; //  - fontSize * 0.25;
          var y = bounds.max.y + 16;
          pb.fill.text(Number(i * R.stepSize * R.mmPerUnit).toFixed(0) + "mm", x, y, {
            color: color,
            fontSize: R.fontSize / pb.fill.scale.x,
            textAlign: "right",
            rotation: -Math.PI / 4
          });
        }
      }
    };

    R.drawVerticalRuler = function (pb, outline, color) {
      // Draw the ruler.
      var bounds = outline.getBounds();
      // Draw vertical ruler
      pb.draw.line({ x: bounds.max.x + 10, y: bounds.min.y }, { x: bounds.max.x + 10, y: bounds.max.y }, color, 0.5);
      var verticalStepCount = bounds.height / R.stepSize;
      for (var i = 0; i < verticalStepCount; i++) {
        pb.draw.line(
          { x: bounds.max.x + 10 - 3, y: bounds.max.y - i * R.stepSize },
          { x: bounds.max.x + 10 + 3, y: bounds.max.y - i * R.stepSize },
          color,
          0.5
        );
        // Draw label?
        if (i % 2 === 0) {
          pb.fill.text(
            Number(i * R.stepSize * R.mmPerUnit).toFixed(0) + "mm",
            bounds.max.x + 16,
            bounds.max.y - i * R.stepSize + R.fontSize * 0.25,
            { color: color, fontSize: R.fontSize / pb.fill.scale.x }
          );
        }
      }
    };

    return R;
  })();
