"use strict";
/**
 * @date 2026-02-26
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DildoSilhouette2D = void 0;
var THREE = require("three");
var plotboilerplate_1 = require("plotboilerplate");
var GeometryGenerationHelpers_1 = require("./GeometryGenerationHelpers");
var DildoGeometry_1 = require("./DildoGeometry");
var DildoSilhouette2D = /** @class */ (function () {
    function DildoSilhouette2D(props) {
        this.leftPathVertices = [];
        this.rightPathVertices = [];
        // Note: this is very similar to the creation od the 3D model.
        // Duplicate code? refactor?
        var outlineBounds = props.outline.getBounds();
        // const shapeHeight: number = outlineBounds.height;
        // const arcLength: number = shapeHeight;
        // const arcRadius: number = arcLength / props.bendAngleRad;
        // const isBending: boolean =
        //   props.isBending &&
        //   !isNaN(arcRadius) &&
        //   arcRadius !== Number.POSITIVE_INFINITY &&
        //   arcRadius !== Number.NEGATIVE_INFINITY &&
        //   Math.abs(props.bendAngleRad) > 0.01;
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
            this.leftPathVertices.push(new plotboilerplate_1.Vertex(leftVert.x, leftVert.y));
            this.rightPathVertices.push(new plotboilerplate_1.Vertex(rightVert.x, rightVert.y));
        }
    }
    DildoSilhouette2D.prototype.___test = function (props) {
        this.leftPathVertices = [];
        this.rightPathVertices = [];
        // Note: this is very similar to the creation od the 3D model.
        // Duplicate code? refactor?
        var outlineBounds = props.outline.getBounds();
        var shapeHeight = outlineBounds.height;
        var arcLength = shapeHeight;
        var arcRadius = arcLength / props.bendAngleRad;
        var isBending = props.isBending &&
            !isNaN(arcRadius) &&
            arcRadius !== Number.POSITIVE_INFINITY &&
            arcRadius !== Number.NEGATIVE_INFINITY &&
            Math.abs(props.bendAngleRad) > 0.01;
        // Just pick a
        var shapeVert = props.outline.getPointAt(0).setX(outlineBounds.min.x);
        for (var s = 0; s < props.outlineSegmentCount; s++) {
            var t = Math.min(1.0, Math.max(0.0, s / (props.outlineSegmentCount - 1)));
            var outlineVert = props.outline.getPointAt(t);
            var perpendicularVert = props.outline.getPerpendicularAt(t);
            var heightT = (outlineBounds.max.y - outlineVert.y) / shapeHeight;
            var outlineT = s / (props.outlineSegmentCount - 1);
            var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
            var shapeTwistAngle = 0.0;
            console.log("s", s, "isBending", isBending);
            // const shapeVert = baseShape.vertices[i];
            var shapeVertLeft = outlineVert.clone(); // new Vertex(outlineVert.x, outlineBounds;
            // const shapeVertRight: Vertex = outlineVert.clone().addX(2 * outlineBounds.max.x); // new Vertex(outlineVert.x, outlineBounds;
            var shapeVertRight = new plotboilerplate_1.Vertex(-outlineVert.x + 2 * outlineBounds.max.x, outlineVert.y); // new Vertex(outlineVert.x, outlineBounds;
            if (isBending) {
                var vertL = new THREE.Vector3(shapeVert.x * outlineXPct, 0, shapeVert.y * outlineXPct);
                var vertR = new THREE.Vector3(shapeVertRight.x * outlineXPct, 0, shapeVertRight.y * outlineXPct);
                // var vert = new THREE.Vector3(shapeVertLeft.x * outlineXPct, 0, shapeVertLeft.y * outlineXPct);
                // var vertL = new THREE.Vector3(shapeVertLeft.x, 0, shapeVertLeft.y);
                // var vertR = new THREE.Vector3(shapeVertRight.x, 0, shapeVertRight.y);
                // Apply twist
                // GeometryGenerationHelpers.rotateVertY(vert, shapeTwistAngle, 0, 0);
                // DildoGeometry._bendVertex(vert, props.bendAngleRad, arcRadius, heightT);
                DildoGeometry_1.DildoGeometry._bendVertex(vertL, props.bendAngleRad, arcRadius, heightT);
                DildoGeometry_1.DildoGeometry._bendVertex(vertR, props.bendAngleRad, arcRadius, heightT);
                // vert.y += outlineBounds.max.y;
                vertL.y += outlineBounds.max.y;
                vertR.y += outlineBounds.max.y;
                this.leftPathVertices.push(new plotboilerplate_1.Vertex(vertL.x, vertL.z));
                this.rightPathVertices.push(new plotboilerplate_1.Vertex(vertR.x, vertR.z));
                // this.leftPathVertices.push(new Vertex(shapeVertLeft.x, shapeVertLeft.y));
                // this.rightPathVertices.push(new Vertex(-shapeVertLeft.x + 2 * outlineBounds.max.x, shapeVertLeft.y));
            }
            else {
                console.log("Not bend");
                // var vert = new THREE.Vector3(shapeVertLeft.x * outlineXPct, outlineVert.y, shapeVertLeft.y * outlineXPct);
                var vert = new THREE.Vector3(shapeVertLeft.x, outlineVert.y, shapeVertLeft.y);
                // Apply twist
                // GeometryGenerationHelpers.rotateVertY(vert, shapeTwistAngle, 0, 0);
                this.leftPathVertices.push(new plotboilerplate_1.Vertex(shapeVertLeft.x, shapeVertLeft.y));
                // this.rightPathVertices.push(new Vertex(-shapeVertLeft.x + 2 * outlineBounds.max.x, shapeVertLeft.y));
                this.rightPathVertices.push(new plotboilerplate_1.Vertex(shapeVertRight.x, shapeVertRight.y));
            }
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
    };
    return DildoSilhouette2D;
}());
exports.DildoSilhouette2D = DildoSilhouette2D;
//# sourceMappingURL=DildoSilhouette2D.js.map