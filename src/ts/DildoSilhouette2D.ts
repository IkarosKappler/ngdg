/**
 * @date 2026-02-26
 */

import * as THREE from "three";
import { BezierPath, Bounds, Polygon, Vertex } from "plotboilerplate";
import { GeometryGenerationHelpers } from "./GeometryGenerationHelpers";
import { DildoGeometry } from "./DildoGeometry";

export interface IDildoSilhouette2DProps {
  baseShape: Polygon;
  outline: BezierPath;
  outlineSegmentCount: number;
  bendAngleRad: number;
  isBending: boolean;
}

export class DildoSilhouette2D {
  leftPathVertices: Vertex[];
  rightPathVertices: Vertex[];

  constructor(props: IDildoSilhouette2DProps) {
    this.leftPathVertices = [];
    this.rightPathVertices = [];
    // Note: this is very similar to the creation od the 3D model.
    // Duplicate code? refactor?
    const outlineBounds: Bounds = props.outline.getBounds();
    const shapeHeight: number = outlineBounds.height;

    const arcLength: number = shapeHeight;
    const arcRadius: number = arcLength / props.bendAngleRad;
    const isBending: boolean =
      props.isBending &&
      !isNaN(arcRadius) &&
      arcRadius !== Number.POSITIVE_INFINITY &&
      arcRadius !== Number.NEGATIVE_INFINITY &&
      Math.abs(props.bendAngleRad) > 0.01;

    for (var s = 0; s < props.outlineSegmentCount; s++) {
      const t: number = Math.min(1.0, Math.max(0.0, s / (props.outlineSegmentCount - 1)));
      const outlineVert: Vertex = props.outline.getPointAt(t);
      const perpendicularVert: Vertex = props.outline.getPerpendicularAt(t);
      const heightT: number = (outlineBounds.max.y - outlineVert.y) / shapeHeight;
      const outlineT: number = s / (props.outlineSegmentCount - 1);
      const outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
      const shapeTwistAngle: number = 0.0;
      // console.log("s", s, "isBending", isBending);

      // const shapeVert = baseShape.vertices[i];
      const shapeVertLeft: Vertex = outlineVert.clone(); // new Vertex(outlineVert.x, outlineBounds;
      const shapeVertRight: Vertex = outlineVert.clone().addX(2 * outlineBounds.max.x); // new Vertex(outlineVert.x, outlineBounds;
      if (isBending) {
        var vert = new THREE.Vector3(shapeVertLeft.x * outlineXPct, 0, shapeVertLeft.y * outlineXPct);
        // Apply twist
        // GeometryGenerationHelpers.rotateVertY(vert, shapeTwistAngle, 0, 0);
        DildoGeometry._bendVertex(vert, props.bendAngleRad, arcRadius, heightT);
        vert.y += outlineBounds.max.y;
      } else {
        var vert = new THREE.Vector3(shapeVertLeft.x * outlineXPct, outlineVert.y, shapeVertLeft.y * outlineXPct);
        // Apply twist
        GeometryGenerationHelpers.rotateVertY(vert, shapeTwistAngle, 0, 0);
      }
      this.leftPathVertices.push(new Vertex(shapeVertLeft.x, shapeVertLeft.y));
      this.rightPathVertices.push(new Vertex(-shapeVertLeft.x + 2 * outlineBounds.max.x, shapeVertLeft.y));
      // if (isBending) {
      //   var vertLeft = new THREE.Vector3(shapeVertLeft.x * outlineXPct, 0, shapeVertLeft.y * outlineXPct);
      //   var vertRight = new THREE.Vector3(shapeVertRight.x * outlineXPct, 0, shapeVertRight.y * outlineXPct);
      //   // Apply twist
      //   // GeometryGenerationHelpers.rotateVertY(vertLeft, shapeTwistAngle, 0, 0);
      //   // GeometryGenerationHelpers.rotateVertY(vertRight, shapeTwistAngle, 0, 0);
      //   // DildoGeometry._bendVertex(vertLeft, props.bendAngleRad, arcRadius, heightT);
      //   // DildoGeometry._bendVertex(vertRight, props.bendAngleRad, arcRadius, heightT);
      //   vertLeft.y += outlineBounds.max.y;
      //   vertRight.y += outlineBounds.max.y;
      //   this.leftPathVertices.push(new Vertex(vertLeft.x, vertLeft.y));
      //   this.rightPathVertices.push(new Vertex(vertRight.x, vertRight.y));
      // } else {
      //   var vert = new THREE.Vector3(outlineVert.x * outlineXPct, outlineVert.y, outlineVert.y * outlineXPct);
      //   // Apply twist
      //   GeometryGenerationHelpers.rotateVertY(vert, shapeTwistAngle, 0, 0);
      //   this.leftPathVertices.push(new Vertex(vert.x, vert.y));
      //   this.rightPathVertices.push(new Vertex(-vert.x + 2 * outlineBounds.max.x, vert.y));
      // }

      // this.leftPathVertices.push(new Vertex(shapeVert.x, shapeVert.y));
      // this.rightPathVertices.push(new Vertex(-shapeVert.x + 2 * outlineBounds.max.x, shapeVert.y));
      // this.leftPathVertices.push(new Vertex(vert.x, vert.y));
      // this.rightPathVertices.push(new Vertex(-vert.x + 2 * outlineBounds.max.x, vert.y));
    }
  }
}
