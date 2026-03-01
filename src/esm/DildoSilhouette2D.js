/**
 * @date 2026-02-26
 */
import { Bounds, Vertex } from "plotboilerplate";
import { GeometryGenerationHelpers } from "./GeometryGenerationHelpers";
import { DildoGeometry } from "./DildoGeometry";
export class DildoSilhouette2D {
    constructor(props) {
        this.leftPathVertices = [];
        this.rightPathVertices = [];
        const outlineBounds = props.outline.getBounds();
        // Create a new base shape only consisting of two vertices :)
        //  min x extreme and max x extreme.
        const silhouetteBaseShape = GeometryGenerationHelpers.mkCircularPolygon(outlineBounds.width, // 100.0, // baseRadius
        2, // two vertices
        1.0 // baseShapeExcentricity
        );
        const silhouetteDildoGeometry = new DildoGeometry({
            baseShape: silhouetteBaseShape,
            isBending: true,
            bendAngle: props.bendAngleDeg,
            outline: props.outline,
            outlineSegmentCount: props.outlineSegmentCount,
            useBumpmap: false,
            bumpmap: null,
            bumpmapTexture: null,
            closeTop: false,
            closeBottom: false,
            makeHollow: false,
            hollowStrengthX: 0.0,
            twistAngle: 0.0,
            normalizePerpendiculars: true,
            normalsLength: 100.0
        });
        // Retrieve silhouette vertices from geometry
        for (var i = 0; i < silhouetteDildoGeometry.vertexMatrix.length; i++) {
            const leftVert = silhouetteDildoGeometry.getVertexAt(0, i);
            const rightVert = silhouetteDildoGeometry.getVertexAt(1, i);
            // Convert 3D vertex to 2D vertex by dropping one dimension.
            // Also move back to the original bounding box.
            this.leftPathVertices.push(new Vertex(leftVert.x + outlineBounds.max.x, leftVert.y));
            this.rightPathVertices.push(new Vertex(rightVert.x + outlineBounds.max.x, rightVert.y));
        }
    }
    getBounds() {
        return Bounds.computeFromVertices([...this.leftPathVertices, ...this.rightPathVertices]);
    }
}
//# sourceMappingURL=DildoSilhouette2D.js.map