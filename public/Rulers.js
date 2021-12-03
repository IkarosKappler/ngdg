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
    // TODO: as constants
    var mmPerUnit = 0.5;
    var stepSize = 20; // pixels
    var fontSize = 10;

    var R = {};

    R.drawHorizontalRuler = function (pb, outline) {
      // Draw the ruler.
      var bounds = outline.getBounds();
      var color = "rgba(0,128,192,0.5)";
      // Draw horizontal ruler
      pb.draw.line({ x: bounds.min.x, y: bounds.max.y + 10 }, { x: bounds.max.x, y: bounds.max.y + 10 }, color, 0.5);
      var horizontalStepCount = bounds.width / stepSize;
      for (var i = 0; i < horizontalStepCount; i++) {
        pb.draw.line(
          { x: bounds.max.x - i * stepSize, y: bounds.max.y + 10 - 3 },
          { x: bounds.max.x - i * stepSize, y: bounds.max.y + 10 + 3 },
          color,
          0.5
        );
        // Draw label?
        if (i % 2 === 0) {
          var x = bounds.max.x - i * stepSize; //  - fontSize * 0.25;
          var y = bounds.max.y + 16;
          pb.fill.text(Number(i * stepSize * mmPerUnit).toFixed(0) + "mm", x, y, {
            color: color,
            fontSize: fontSize / pb.fill.scale.x,
            textAlign: "right",
            rotation: -Math.PI / 4
          });
        }
      }
    };

    R.drawVerticalRuler = function (pb, outline) {
      // Draw the ruler.
      // console.log("Post draw");
      var bounds = outline.getBounds();
      var color = "rgba(0,128,192,0.5)";
      //   var mmPerUnit = 0.5;
      //   var stepSize = 20; // pixels
      //   var fontSize = 7;
      // Draw vertical ruler
      pb.draw.line({ x: bounds.max.x + 10, y: bounds.min.y }, { x: bounds.max.x + 10, y: bounds.max.y }, color, 0.5);
      var verticalStepCount = bounds.height / stepSize;
      for (var i = 0; i < verticalStepCount; i++) {
        pb.draw.line(
          { x: bounds.max.x + 10 - 3, y: bounds.max.y - i * stepSize },
          { x: bounds.max.x + 10 + 3, y: bounds.max.y - i * stepSize },
          color,
          0.5
        );
        // Draw label?
        if (i % 2 === 0) {
          pb.fill.text(
            Number(i * stepSize * mmPerUnit).toFixed(0) + "mm",
            bounds.max.x + 16,
            bounds.max.y - i * stepSize + fontSize * 0.25,
            { color: color, fontSize: fontSize / pb.fill.scale.x }
          );
        }
      }
    };

    return R;
  })();
