"use strict";
/**
 * @date 2026-02-26
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DildoSilhouette2D = void 0;
var plotboilerplate_1 = require("plotboilerplate");
var GeometryGenerationHelpers_1 = require("./GeometryGenerationHelpers");
var DildoGeometry_1 = require("./DildoGeometry");
var DildoSilhouette2D = /** @class */ (function () {
    function DildoSilhouette2D(props) {
        this.leftPathVertices = [];
        this.rightPathVertices = [];
        var outlineBounds = props.outline.getBounds();
        // Create a new base shape only consisting of two vertices :)
        //  min x extreme and max x extreme.
        var silhouetteBaseShape = GeometryGenerationHelpers_1.GeometryGenerationHelpers.mkCircularPolygon(outlineBounds.width, // 100.0, // baseRadius
        2, // two vertices
        1.0 // baseShapeExcentricity
        );
        var silhouetteDildoGeometry = new DildoGeometry_1.DildoGeometry({
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
            var leftVert = silhouetteDildoGeometry.getVertexAt(0, i);
            var rightVert = silhouetteDildoGeometry.getVertexAt(1, i);
            // Convert 3D vertex to 2D vertex by dropping one dimension.
            // Also move back to the original bounding box.
            this.leftPathVertices.push(new plotboilerplate_1.Vertex(leftVert.x + outlineBounds.max.x, leftVert.y));
            this.rightPathVertices.push(new plotboilerplate_1.Vertex(rightVert.x + outlineBounds.max.x, rightVert.y));
        }
    }
    DildoSilhouette2D.prototype.getBounds = function () {
        return plotboilerplate_1.Bounds.computeFromVertices(__spreadArray(__spreadArray([], this.leftPathVertices, true), this.rightPathVertices, true));
    };
    return DildoSilhouette2D;
}());
exports.DildoSilhouette2D = DildoSilhouette2D;
//# sourceMappingURL=DildoSilhouette2D.js.map