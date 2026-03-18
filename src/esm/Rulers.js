/**
 * Some helpers to draw vertical and horizontal rulers.
 *
 * @author   Ikaros Kappler
 * @date     2021-12-03
 * @modified 2026-03-13 Ported to Typescript.
 * @version  1.1.0
 */
export class Rulers {
    static drawHorizontalRuler(draw, fill, outline, color) {
        // Draw the ruler.
        var bounds = outline.getBounds();
        // Draw horizontal ruler
        draw.line({ x: bounds.min.x, y: bounds.max.y + 10 }, { x: bounds.max.x, y: bounds.max.y + 10 }, color, 0.5);
        var horizontalStepCount = bounds.width / Rulers.stepSize;
        for (var i = 0; i < horizontalStepCount; i++) {
            draw.line({ x: bounds.max.x - i * Rulers.stepSize, y: bounds.max.y + 10 - 3 }, { x: bounds.max.x - i * Rulers.stepSize, y: bounds.max.y + 10 + 3 }, color, 0.5);
            // Draw label?
            if (i % 2 === 0) {
                var x = bounds.max.x - i * Rulers.stepSize; //  - fontSize * 0.25;
                var y = bounds.max.y + 16;
                fill.text(Number(i * Rulers.stepSize * Rulers.mmPerUnit).toFixed(0) + "mm", x, y, {
                    color: color,
                    fontSize: Rulers.fontSize / fill.scale.x,
                    textAlign: "right",
                    rotation: -Math.PI / 4
                });
            }
        }
    }
    static drawVerticalRuler(draw, fill, outline, color) {
        // Draw the ruler.
        var bounds = outline.getBounds();
        // Draw vertical ruler
        draw.line({ x: bounds.max.x + 10, y: bounds.min.y }, { x: bounds.max.x + 10, y: bounds.max.y }, color, 0.5);
        var verticalStepCount = bounds.height / Rulers.stepSize;
        for (var i = 0; i < verticalStepCount; i++) {
            draw.line({ x: bounds.max.x + 10 - 3, y: bounds.max.y - i * Rulers.stepSize }, { x: bounds.max.x + 10 + 3, y: bounds.max.y - i * Rulers.stepSize }, color, 0.5);
            // Draw label?
            if (i % 2 === 0) {
                fill.text(Number(i * Rulers.stepSize * Rulers.mmPerUnit).toFixed(0) + "mm", bounds.max.x + 16, bounds.max.y - i * Rulers.stepSize + Rulers.fontSize * 0.25, { color: color, fontSize: Rulers.fontSize / fill.scale.x });
            }
        }
    }
} // END class
Rulers.mmPerUnit = 0.5;
Rulers.stepSize = 20; // pixels
Rulers.fontSize = 10;
//# sourceMappingURL=Rulers.js.map