/**
 * Convert a cubic Bézier path to a polygon of n points.
 *
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2022-01-30
 */

globalThis.bezier2polygon =
  globalThis.bezier2polygon ||
  (function () {
    var b2p = function (path, pointCount) {
      if (pointCount <= 0) {
        throw new Error("pointCount must be larger than zero; is " + pointCount + ".");
      }

      var result = [];
      if (path.bezierCurves.length === 0) {
        return result;
      }

      // Fetch and add the start point from the source polygon
      var polygonPoint = new Vertex(path.bezierCurves[0].startPoint);
      result.push(polygonPoint);
      if (path.bezierCurves.length === 1) {
        return result;
      }

      const perimeter = path.totalArcLength;
      const stepSize = perimeter / (pointCount - 1);
      const n = path.bezierCurves.length;

      let curveIndex = 0;
      let segmentLength = path.bezierCurves[0].arcLength;
      let curSegmentU = stepSize;
      var i = 1;
      while (i < pointCount && curveIndex < n) {
        // Check if next eq point is inside this segment
        if (curSegmentU < segmentLength) {
          var newPoint = path.bezierCurves[curveIndex].getPoint(curSegmentU);
          result.push(newPoint);
          curSegmentU += stepSize;
          i++;
        } else {
          curveIndex++;
          curSegmentU = curSegmentU - segmentLength;
          segmentLength = curveIndex < n ? path.bezierCurves[curveIndex].arcLength : 0;
        }
      }

      result.push(new Vertex(path.bezierCurves[n - 1].endPoint));
      return result;
    };

    return b2p;
  })();
