"use strict";
/**
 * A helper class for generating useful randomized dildo settings.
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DildoRandomizer = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var plotboilerplate_2 = require("plotboilerplate");
var DildoRandomizer = /** @class */ (function () {
    function DildoRandomizer(bounds, minPathSegments, maxPathSegments, minBendAngle, maxBendAngle) {
        this.bounds = bounds;
        this.minPathSegments = minPathSegments;
        this.maxPathSegments = maxPathSegments;
        this.minBendAngle = minBendAngle;
        this.maxBendAngle = maxBendAngle;
    }
    DildoRandomizer.prototype.next = function () {
        var segmentCount = DildoRandomizer.randIntInRange(this.minPathSegments, this.maxPathSegments);
        // console.log("segmentCount", segmentCount, "minPathSegments", this.minPathSegments, "maxPathSegments", this.maxPathSegments);
        var outline = this.randomOutline(segmentCount);
        return { outline: outline, bendAngle: DildoRandomizer.randFloatInRange(this.minBendAngle, this.maxBendAngle) };
    };
    DildoRandomizer.prototype.randomOutline = function (segmentCount) {
        var pathVertices = this.randomizedPathVertices(segmentCount + 1);
        // Convert to lines Bezier Path
        var curves = [];
        for (var i = 0; i + 1 < pathVertices.length; i++) {
            var startPoint = pathVertices[i];
            var endPoint = pathVertices[i + 1];
            var helperLine = new plotboilerplate_1.Line(startPoint, endPoint);
            // console.log("helperLine", helperLine);
            var startPointRatio = DildoRandomizer.randFloatInRange(0.1, 0.8);
            var endPointRatio = DildoRandomizer.randFloatInRange(startPointRatio, 0.9);
            // console.log("startPointRatio", startPointRatio, "endPointRatio", endPointRatio);
            var startControlPoint = helperLine.vertAt(startPointRatio);
            var endControlPoint = helperLine.vertAt(endPointRatio);
            if (i == 0) {
                // Bottom curve should show straight up.
                startControlPoint.x = startPoint.x; // this.bounds.min.x;
            }
            else if (i + 2 >= pathVertices.length) {
                // Last point (top) should show to the left.
                endControlPoint.y = this.bounds.min.y;
                // And top should not be too spiky.
                endControlPoint.x = this.bounds.max.x - this.bounds.width * 0.333 * Math.random() - this.bounds.width * 0.2;
            }
            else {
                // Other points in the middle.
                // At the moment the controls points are ON the line.
                // To make the outline nice round and smooth: randomize their x-coordinate.
                //  ---> to avoid extreme angles, only move the longest control line of both
                var ANGLE_WIDTH = Math.PI * 0.333;
                var angle = Math.random() * ANGLE_WIDTH - Math.random() * ANGLE_WIDTH * 0.5;
                if (startPoint.distance(startControlPoint) > endPoint.distance(endControlPoint)) {
                    startControlPoint.rotate(angle, startPoint);
                    // Inside bounds?
                    startControlPoint.x = Math.max(this.bounds.min.x, Math.min(this.bounds.max.x, startControlPoint.x));
                }
                else {
                    endControlPoint.rotate(angle, endPoint);
                    // Inside bounds?
                    endControlPoint.x = Math.max(this.bounds.min.x, Math.min(this.bounds.max.x, endControlPoint.x));
                }
            }
            curves.push(new plotboilerplate_2.CubicBezierCurve(startPoint, endPoint, startControlPoint, endControlPoint));
        }
        return plotboilerplate_1.BezierPath.fromArray(curves);
    };
    /**
     * Get a sequence of 'random' vertices inside the bounding box. The vertices will be
     * sorted along the y-axis (from max to min in the bounding box).
     *
     * @param {vertex} vertexCount - The number of desired vertices.
     * @returns {Array<Vetrex>}
     */
    DildoRandomizer.prototype.randomizedPathVertices = function (vertexCount) {
        var pathVertices = [];
        // Create the bottom point
        pathVertices.push(new plotboilerplate_1.Vertex(this.bounds.min.x + Math.random() * this.bounds.width * 0.75, this.bounds.max.y));
        for (var i = 1; i + 1 < vertexCount; i++) {
            //   const segmendBounds = new Bounds(
            //     { x: this.bounds.min.x, y: this.bounds.max.y - i * (this.bounds.height / vertexCount) },
            //     {
            //       x: this.bounds.min.x + i * (this.bounds.width / vertexCount),
            //       y: this.bounds.max.y - (i + 1) * (this.bounds.height / vertexCount)
            //     }
            //   );
            // Bounds in the inner middle 50%.
            var segmendBounds = new plotboilerplate_1.Bounds({ x: this.bounds.min.x + this.bounds.width * 0.25, y: this.bounds.max.y - i * (this.bounds.height / vertexCount) }, {
                x: this.bounds.min.x + this.bounds.width * 0.75,
                y: this.bounds.max.y - (i + 1) * (this.bounds.height / vertexCount)
            });
            var pathVertex = segmendBounds.randomPoint();
            pathVertices.push(pathVertex);
        }
        pathVertices.push(new plotboilerplate_1.Vertex(this.bounds.max.x, this.bounds.min.y));
        return pathVertices;
    };
    DildoRandomizer.randIntInRange = function (min, max) {
        return Math.floor(min + Math.random() * (max - min));
    };
    DildoRandomizer.randFloatInRange = function (min, max) {
        return min + Math.random() * (max - min);
    };
    return DildoRandomizer;
}());
exports.DildoRandomizer = DildoRandomizer;
//# sourceMappingURL=DildoRandomizer.js.map