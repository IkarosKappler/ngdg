/**
 * A helper class for generating useful randomized dildo settings.
 *
 * @author  Ikaros Kappler
 * @date    2026-03-02
 * @version 1.0.0
 */

import { BezierPath, Bounds, Line, Vertex } from "plotboilerplate";
import { CubicBezierCurve } from "plotboilerplate";

export interface DildoRandomizerResult {
  outline: BezierPath;
  bendAngle: number;
}

export class DildoRandomizer {
  private bounds: Bounds;
  private minPathSegments: number;
  private maxPathSegments: number;
  private minBendAngle: number;
  private maxBendAngle: number;

  constructor(bounds: Bounds, minPathSegments: number, maxPathSegments: number, minBendAngle: number, maxBendAngle: number) {
    this.bounds = bounds;
    this.minPathSegments = minPathSegments;
    this.maxPathSegments = maxPathSegments;
    this.minBendAngle = minBendAngle;
    this.maxBendAngle = maxBendAngle;
  }

  next(): DildoRandomizerResult {
    const segmentCount = DildoRandomizer.randIntInRange(this.minPathSegments, this.maxPathSegments);
    // console.log("segmentCount", segmentCount, "minPathSegments", this.minPathSegments, "maxPathSegments", this.maxPathSegments);
    const outline: BezierPath = this.randomOutline(segmentCount);

    return { outline: outline, bendAngle: DildoRandomizer.randFloatInRange(this.minBendAngle, this.maxBendAngle) };
  }

  private randomOutline(segmentCount: number): BezierPath {
    const pathVertices = this.randomizedPathVertices(segmentCount + 1);
    // Convert to lines Bezier Path
    const curves: CubicBezierCurve[] = [];
    for (var i = 0; i + 1 < pathVertices.length; i++) {
      const startPoint = pathVertices[i];
      const endPoint = pathVertices[i + 1];
      const helperLine = new Line(startPoint, endPoint);
      // console.log("helperLine", helperLine);

      const startPointRatio: number = DildoRandomizer.randFloatInRange(0.1, 0.8);
      const endPointRatio: number = DildoRandomizer.randFloatInRange(startPointRatio, 0.9);
      // console.log("startPointRatio", startPointRatio, "endPointRatio", endPointRatio);
      const startControlPoint: Vertex = helperLine.vertAt(startPointRatio);
      const endControlPoint: Vertex = helperLine.vertAt(endPointRatio);
      if (i == 0) {
        // Bottom curve should show straight up.
        startControlPoint.x = startPoint.x; // this.bounds.min.x;
      } else if (i + 2 >= pathVertices.length) {
        // Last point (top) should show to the left.
        endControlPoint.y = this.bounds.min.y;
        // And top should not be too spiky.
        endControlPoint.x = this.bounds.max.x - this.bounds.width * 0.333 * Math.random() - this.bounds.width * 0.2;
      } else {
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
        } else {
          endControlPoint.rotate(angle, endPoint);
          // Inside bounds?
          endControlPoint.x = Math.max(this.bounds.min.x, Math.min(this.bounds.max.x, endControlPoint.x));
        }
      }
      curves.push(new CubicBezierCurve(startPoint, endPoint, startControlPoint, endControlPoint));
    }
    return BezierPath.fromArray(curves);
  }

  /**
   * Get a sequence of 'random' vertices inside the bounding box. The vertices will be
   * sorted along the y-axis (from max to min in the bounding box).
   *
   * @param {vertex} vertexCount - The number of desired vertices.
   * @returns {Array<Vetrex>}
   */
  private randomizedPathVertices(vertexCount: number): Array<Vertex> {
    const pathVertices: Vertex[] = [];
    // Create the bottom point
    pathVertices.push(new Vertex(this.bounds.min.x + Math.random() * this.bounds.width * 0.75, this.bounds.max.y));
    for (var i = 1; i + 1 < vertexCount; i++) {
      //   const segmendBounds = new Bounds(
      //     { x: this.bounds.min.x, y: this.bounds.max.y - i * (this.bounds.height / vertexCount) },
      //     {
      //       x: this.bounds.min.x + i * (this.bounds.width / vertexCount),
      //       y: this.bounds.max.y - (i + 1) * (this.bounds.height / vertexCount)
      //     }
      //   );
      // Bounds in the inner middle 50%.
      const segmendBounds = new Bounds(
        { x: this.bounds.min.x + this.bounds.width * 0.25, y: this.bounds.max.y - i * (this.bounds.height / vertexCount) },
        {
          x: this.bounds.min.x + this.bounds.width * 0.75,
          y: this.bounds.max.y - (i + 1) * (this.bounds.height / vertexCount)
        }
      );
      const pathVertex = segmendBounds.randomPoint();
      pathVertices.push(pathVertex);
    }
    pathVertices.push(new Vertex(this.bounds.max.x, this.bounds.min.y));
    return pathVertices;
  }

  static randIntInRange(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min));
  }

  static randFloatInRange(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
}
