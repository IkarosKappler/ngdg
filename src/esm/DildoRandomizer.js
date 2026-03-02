/**
 * A helper class for generating useful randomized dildo settings.
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */
import { BezierPath, Bounds, Line, Vertex } from "plotboilerplate";
import { CubicBezierCurve } from "plotboilerplate";
export class DildoRandomizer {
    constructor(bounds, minPathSegments, maxPathSegments) {
        this.bounds = bounds;
        this.minPathSegments = minPathSegments;
        this.maxPathSegments = maxPathSegments;
    }
    next() {
        const segmentCount = DildoRandomizer.randIntInRange(this.minPathSegments, this.maxPathSegments);
        console.log("segmentCount", segmentCount);
        const pathVertices = this.randomPathVertices(segmentCount + 1);
        // Convert to lines Bezier Path
        const curves = [];
        for (var i = 0; i + 1 < segmentCount; i++) {
            const startPoint = pathVertices[i];
            const endPoint = pathVertices[i + 1];
            const helperLine = new Line(startPoint, endPoint);
            const startPointRatio = DildoRandomizer.randFloatInRange(0.1, 0.8);
            const endPointRatio = DildoRandomizer.randFloatInRange(startPointRatio, 0.9);
            console.log("startPointRatio", startPointRatio, "endPointRatio", endPointRatio);
            const startControlPoint = helperLine.vertAt(startPointRatio);
            const endControlPoint = helperLine.vertAt(endPointRatio);
            curves.push(new CubicBezierCurve(startPoint, endPoint, startControlPoint, endControlPoint));
        }
        return { outline: BezierPath.fromArray(curves) };
    }
    randomPathVertices(segmentCount) {
        const pathVertices = [];
        // Create the bottom point
        pathVertices.push(new Vertex(DildoRandomizer.randFloatInRange(this.bounds.min.x, this.bounds.max.x), this.bounds.min.y));
        for (var i = 0; i < segmentCount; i++) {
            const segmendBounds = new Bounds({ x: this.bounds.min.x, y: this.bounds.min.y + i * (this.bounds.height / segmentCount) }, { x: this.bounds.max.x, y: (i + 1) * (this.bounds.height / segmentCount) });
            //   var x = DildoRandomizer.randFloatInRange( segmendBounds.min.x. segmentBounds);
            //   var y =
            const pathVertex = segmendBounds.randomPoint();
        }
        pathVertices.push(new Vertex(DildoRandomizer.randFloatInRange(this.bounds.min.x, this.bounds.max.x), this.bounds.max.y));
        return pathVertices;
    }
    static randIntInRange(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }
    static randFloatInRange(min, max) {
        return min + Math.random() * (max - min);
    }
}
//# sourceMappingURL=DildoRandomizer.js.map