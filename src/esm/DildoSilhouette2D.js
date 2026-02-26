/**
 * @date 2026-02-26
 */
import { Vertex } from "plotboilerplate";
export class DildoSilhouette2D {
    constructor(props) {
        this.leftPathVertices = [];
        this.rightPathVertices = [];
        // Note: this is very similar to the creation od the 3D model.
        // Duplicate code? refactor?
        const outlineBounds = props.outline.getBounds();
        const shapeHeight = outlineBounds.height;
        for (var s = 0; s < props.outlineSegmentCount; s++) {
            const t = Math.min(1.0, Math.max(0.0, s / (props.outlineSegmentCount - 1)));
            const outlineVert = props.outline.getPointAt(t);
            const perpendicularVert = props.outline.getPerpendicularAt(t);
            const heightT = (outlineBounds.max.y - outlineVert.y) / shapeHeight;
            const outlineT = s / (props.outlineSegmentCount - 1);
            this.leftPathVertices.push(new Vertex(outlineVert.x, outlineVert.y));
            this.rightPathVertices.push(new Vertex(-outlineVert.x, outlineVert.y));
        }
    }
}
//# sourceMappingURL=DildoSilhouette2D.js.map