/**
 * This is the central class for generating dildo base geometries.
 *
 * @require ThreeGeometryHellfix.Gmetry
 *
 * @author   Ikaros Kappler
 * @date     2020-07-08
 * @modified 2021-06-11 Fixing top and bottom points; preparing slicing of mesh.
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry (and Face3).
 * @version  1.0.3
 **/
// TODOs
// + Add cut-plane faces when hollow
// + Move vertex-creating helper functions out of the class
// + Move face-creating helper functions out of the class
// + Move UV-creating helper functions out of the class
import { Polygon, Vertex } from "plotboilerplate";
import * as THREE from "three";
import { GeometryGenerationHelpers } from "./GeometryGenerationHelpers";
import { earcut } from "earcut-typescript";
import { UVHelpers } from "./UVHelpers";
import { Face3, Gmetry } from "three-geometry-hellfix/src/cjs";
import { DEG_TO_RAD } from "./constants";
export class DildoGeometry extends Gmetry {
    /**
     * Create a new dildo geometry from the passed options..
     *
     * @param {Polygon} options.baseShape - The base shape to use (this is usually some regular polygon).
     * @param {BezierPath} options.outline - The lathe outline to use.
     * @param {number} options.bendAngle - A bend angle (in degrees!). Will only be applied if isBending=true.
     * @param {number} options.outlineSegmentCount (>= 2).
     * @param {boolean} options.isBending - Switch bending on/off no matter what the bend angle says.
     * @param {boolean} options.makeHollow - Make a hollow mold.
     **/
    constructor(options) {
        super();
        // TODO: verify
        Gmetry.call(this);
        this.vertexMatrix = []; // Array<Array<number>>
        this.topIndex = -1;
        this.bottomIndex = -1;
        this.spineVertices = []; // Array<THREE.Vector>
        this.outerPerpLines = []; // Array<Three.Line3>
        this.innerPerpLines = []; // Array<Three.Line3>
        this.flatSidePolygon = null; // Polygon (2d)
        this.leftFlatIndices = []; // Array<number>
        this.rightFlatIndices = []; // Array<number>
        this.leftFlatTriangleIndices = []; // Array[[number,number,number]]
        this.rightFlatTriangleIndices = []; // Array[[number,number,number]]
        this.flatSideBounds = null; // Bounds
        // The four corner vertices from the hollow shell plus the bottom vertex indices left and right
        this.hollowBottomEdgeVertIndices = []; // [number,number,number,number, number, number]
        this.hollowBottomTriagles = []; // Array<[number,number,number]>
        this.dildoNormals = [];
        this._buildVertices(options);
        this._buildFaces(options);
        this._buildUVMapping(options);
        // Fill up missing UVs to avoid warnings
        // This is a bit dirty, but not in call cases it is useful to create UV mappings
        // while (this.faceVertexUvs[0].length < this.faces.length) {
        //   this.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0.5, 1)]);
        // }
        if (options.useBumpmap) {
            if (options.bumpmapTexture) {
                this.__applyBumpmap(options.bumpmapTexture);
            }
            else {
                console.warn(`Cannot apply bumpmap as desired, because the bumpmap texture is null or undefined.`);
            }
        }
    }
    /**
     *
     * @param {Polygon} baseShape
     * @param {Vertex} shapeCenter
     * @param {Bounds} outlineBounds
     * @param {THREE.Vector3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @param {number=0} shapeTwistAngle - The angle to twist this particular shape around the y axis.
     * @return { yMin: number, yMax : number }
     */
    __buildSlice(baseShape, outlineBounds, outlineVert, sliceIndex, heightT, isBending, bendAngle, arcRadius, shapeTwistAngle) {
        var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
        // TODO: are these is use?
        var yMin, yMax;
        for (var i = 0; i < baseShape.vertices.length; i++) {
            var shapeVert = baseShape.vertices[i];
            if (isBending) {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, 0, shapeVert.y * outlineXPct);
                // Apply twist
                GeometryGenerationHelpers.rotateVertY(vert, shapeTwistAngle, 0, 0);
                this._bendVertex(vert, bendAngle, arcRadius, heightT);
                vert.y += outlineBounds.max.y;
            }
            else {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, outlineVert.y, shapeVert.y * outlineXPct);
                // Apply twist
                GeometryGenerationHelpers.rotateVertY(vert, shapeTwistAngle, 0, 0);
            }
            this.vertexMatrix[sliceIndex][i] = this.vertices.length;
            this.vertices.push(vert);
            if (sliceIndex == 0) {
                if (i == 0)
                    yMin = vert.y;
                if (i + 1 == baseShape.vertices.length)
                    yMax = vert.y;
            }
        } // END for
    }
    /**
     *
     * @param {Polygon} baseShape
     * @param {Vertex} shapeCenter
     * @param {Bounds} outlineBounds
     * @param {THREE.Vertex3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @return { yMin: number, yMax : number }
     */
    __buildSpine(shapeCenter, outlineBounds, outlineVert, heightT, isBending, bendAngle, arcRadius) {
        var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
        // Find shape's center point to construct a spine
        var spineVert = shapeCenter.clone();
        if (isBending) {
            var vert = new THREE.Vector3(spineVert.x * outlineXPct, 0, spineVert.y * outlineXPct);
            this._bendVertex(vert, bendAngle, arcRadius, heightT);
            vert.y += outlineBounds.max.y;
        }
        else {
            var vert = new THREE.Vector3(spineVert.x * outlineXPct, outlineVert.y, spineVert.y * outlineXPct);
        }
        this.spineVertices.push(vert);
    }
    /**
     *
     * @param {Polygon} baseShape
     * @param {Bounds} outlineBounds
     * @param {THREE.Vertex3} outlineVert
     * @param {number} sliceIndex
     * @param {number} heightT A value between 0.0 and 1.0 (inclusive) to indicate the height position.
     * @param {boolean} isBending
     * @param {number=} bendAngle Must not be null, NaN or infinity if `isBending==true`
     * @param {number=} arcRadius
     * @param {boolean=} normalizePerpendiculars
     * @param {number=} normalsLength
     * @return { yMin: number, yMax : number }
     */
    __buildPerps(baseShape, outlineBounds, outlineVert, // THREE.Vector3?
    perpendicularVert, heightT, isBending, bendAngle, arcRadius, normalizePerpendiculars, normalsLength) {
        var outlineXPct = (outlineBounds.max.x - outlineVert.x) / outlineBounds.width;
        var halfIndices = [0, Math.floor(baseShape.vertices.length / 2)];
        for (var j = 0; j < halfIndices.length; j++) {
            var i = halfIndices[j];
            var shapeVert = baseShape.vertices[i];
            if (isBending) {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, 0, shapeVert.y * outlineXPct);
                this._bendVertex(vert, bendAngle, arcRadius, heightT);
                vert.y += outlineBounds.max.y;
            }
            else {
                var vert = new THREE.Vector3(shapeVert.x * outlineXPct, outlineVert.y, shapeVert.y * outlineXPct);
            }
            var perpDifference = new THREE.Vector3(outlineVert.x - perpendicularVert.x, outlineVert.y - perpendicularVert.y, 0);
            // TODO: check (this is in both cases the same)
            if (i == 0)
                var endVert = new THREE.Vector3(vert.x - perpendicularVert.x, vert.y + perpendicularVert.y, 0);
            else
                var endVert = new THREE.Vector3(vert.x + perpendicularVert.x, vert.y + perpendicularVert.y, 0);
            GeometryGenerationHelpers.rotateVert(endVert, bendAngle * heightT, vert.x, vert.y);
            var outerPerpVert = vert.clone();
            outerPerpVert.x += perpDifference.x;
            outerPerpVert.y += perpDifference.y;
            outerPerpVert.z += perpDifference.z;
            if (normalizePerpendiculars) {
                GeometryGenerationHelpers.normalizeVectorXY(vert, endVert, normalsLength);
            }
            if (i == 0) {
                this.outerPerpLines.push(new THREE.Line3(vert, endVert));
            }
            else {
                this.innerPerpLines.push(new THREE.Line3(vert, endVert));
            }
        } // END for
    }
    /**
     * Pre: perpLines are already built.
     *
     * Note: the last indices in the array will show to the point equivalent to the bottom point.
     *
     * @param {*} options
     */
    __makeFlatSideVertices(shapeRadius) {
        // We are using the earcut algorithm later
        //  + create an outline of the perpendicular end points
        //  + shift the outline to the left bound of the mesh
        //  + [LATER] run earcut
        //  + [LATER] add all triangle faces
        //  + [LATER] create a copy of the vertices and the triangulation the the right side
        // Step 1: serialize the 2d vertex data along the perpendicular path
        // var polygon = new Polygon(this.getPerpendicularPathVertices(true), false);
        this.flatSidePolygon = new Polygon(this.getPerpendicularPathVertices(true).map(vert => new Vertex(vert)), false);
        this.flatSideBounds = this.flatSidePolygon.getBounds();
        // Step 2: Add the 3d vertices to this geometry (and store positions in left-/rightFlatIndices array)
        for (var i = 0; i < this.flatSidePolygon.vertices.length; i++) {
            var nextIndex = this.vertices.length;
            this.leftFlatIndices.push(nextIndex);
            this.vertices.push(new THREE.Vector3(this.flatSidePolygon.vertices[i].x, this.flatSidePolygon.vertices[i].y, shapeRadius));
            if (i === 0 || i + 1 === this.flatSidePolygon.vertices.length || i + 2 === this.flatSidePolygon.vertices.length) {
                // Keep track of the four corner points (two left, two right)
                this.hollowBottomEdgeVertIndices.push(nextIndex);
            }
        }
        for (var i = 0; i < this.flatSidePolygon.vertices.length; i++) {
            var nextIndex = this.vertices.length;
            this.rightFlatIndices.push(nextIndex);
            this.vertices.push(new THREE.Vector3(this.flatSidePolygon.vertices[i].x, this.flatSidePolygon.vertices[i].y, -shapeRadius));
            if (i === 0 || i + 1 === this.flatSidePolygon.vertices.length || i + 2 === this.flatSidePolygon.vertices.length) {
                // Keep track of the four corner points (two left, two right)
                this.hollowBottomEdgeVertIndices.push(nextIndex);
            }
        }
    }
    /**
     * Pre: perpLines are already built.
     *
     * Note: the last indices in the array will show to the point equivalent to the bottom point.
     *
     * @param {*}
     */
    __makeFlatSideFaces() {
        // We are using the earcut algorithm here
        //  + [DONE before] create an outline of the perpendicular end points
        //  + [DONE before] shift the outline to the left bound of the mesh
        //  + run earcut
        //  + add all triangle faces
        //  + create a copy of the vertices and the triangulation the the right side
        var _self = this;
        // Array<THREE.Vector3>  (compatible with XYCoords :)
        var polygonVertices = this.leftFlatIndices.map(function (flatSideIndex) {
            return _self.vertices[flatSideIndex];
        });
        var polygonData = GeometryGenerationHelpers.flattenVert2dArray(polygonVertices);
        // Step 3: run Earcut
        var triangleIndices = earcut(polygonData);
        // Step 4: process the earcut result;
        //         add the retrieved triangles as geometry faces.
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            var a = triangleIndices[i];
            var b = triangleIndices[i + 1];
            var c = triangleIndices[i + 2];
            GeometryGenerationHelpers.makeFace3(this, this.leftFlatIndices[a], this.leftFlatIndices[b], this.leftFlatIndices[c]);
            this.leftFlatTriangleIndices.push([this.leftFlatIndices[a], this.leftFlatIndices[b], this.leftFlatIndices[c]]);
        }
        for (var i = 0; i + 2 < triangleIndices.length; i += 3) {
            var a = triangleIndices[i];
            var b = triangleIndices[i + 1];
            var c = triangleIndices[i + 2];
            GeometryGenerationHelpers.makeFace3(this, this.rightFlatIndices[a], this.rightFlatIndices[c], this.rightFlatIndices[b]);
            this.rightFlatTriangleIndices.push([this.rightFlatIndices[a], this.rightFlatIndices[b], this.rightFlatIndices[c]]);
        }
    }
    getPerpendicularPathVertices(includeBottomVert, getInner) {
        // Compatible with: Array<XYCoords>
        // All elements are located on a plane with constant z value.
        var polygonVertices = [];
        for (var i = 0; i < this.innerPerpLines.length; i++) {
            polygonVertices.push(getInner ? this.innerPerpLines[i].start : this.innerPerpLines[i].end);
        }
        // Reverse the outer path segment (both begin at bottom and meet at the top)
        for (var i = this.outerPerpLines.length - 1; i >= 0; i--) {
            polygonVertices.push(getInner ? this.outerPerpLines[i].start : this.outerPerpLines[i].end);
        }
        // Also add base point at last index
        if (includeBottomVert) {
            polygonVertices.push(this.vertices[this.bottomIndex]);
        }
        // return polygonVertices; //.map( vert => ({ x : vert.x, y : vert.y } as));
        return polygonVertices;
    }
    getPerpendicularHullLines() {
        var perpLines = [];
        for (var i = 0; i < this.innerPerpLines.length; i++) {
            perpLines.push(this.innerPerpLines[i]);
        }
        // Reverse the outer path segment (both begin at bottom and meet at the top)
        for (var i = this.outerPerpLines.length - 1; i >= 0; i--) {
            perpLines.push(this.outerPerpLines[i]);
        }
        return perpLines;
    }
    /**
     * Construct the top vertex that's used to closed the cylinder geometry at the top.
     *
     * @param {plotboilerplate.Bounds} outlineBounds
     * @param {boolean} isBending
     * @param {number|NaN|undefined} bendAngle
     * @param {number|undefined} arcRadius
     * @returns THREE.Vector
     */
    _getTopVertex(outlineBounds, isBending, bendAngle, arcRadius) {
        if (isBending) {
            var topPoint = new THREE.Vector3(0, 0, 0);
            this._bendVertex(topPoint, bendAngle, arcRadius, 1.0);
            topPoint.y += outlineBounds.max.y;
            return topPoint;
        }
        else {
            return new THREE.Vector3(0, outlineBounds.min.y, 0);
        }
    }
    /**
     * Construct the bottom vertex that's used to closed the cylinder geometry at the bottom.
     *
     * @param {plotboilerplate.Bounds} outlineBounds
     * @returns THREE.Vector
     */
    _getBottomVertex(outlineBounds) {
        var bottomPoint = new THREE.Vector3(0, outlineBounds.max.y, 0);
        // No need to bend the bottom point (no effect)
        return bottomPoint;
    }
    /**
     * A helper function to 'bend' a vertex position around the desired bend axis (angle + radius).
     * @private
     * @param {THREE.Vector3} vert
     * @param {number} bendAngle
     * @param {number} arcRadius
     * @param {number} heightT
     */
    _bendVertex(vert, bendAngle, arcRadius, heightT) {
        var axis = new THREE.Vector3(0, 0, 1);
        var angle = bendAngle * heightT;
        // Move slice point along radius, rotate, then move back
        // (equivalent to rotation around arc center)
        vert.x -= arcRadius;
        vert.applyAxisAngle(axis, angle);
        vert.x += arcRadius;
    }
    // TODO
    applyBumpMap(bumpMapTexture) {
        // Build normals
        // for (var i = 0; i < this.vertexMatrix.length; i++) {
        //   for (var j = 0; j < this.vertexMatrix[i].length; j++) {
        //     var vertIndex = this.vertexMatrix[i][j];
        //     var vertex = this.vertices[vertIndex];
        //   }
        // }
    }
    /**
     * Build up the faces for this geometry.
     * @param {ExtendedDildoOptions} options
     */
    _buildFaces(options) {
        const baseShape = options.baseShape;
        const outlineSegmentCount = options.outlineSegmentCount;
        const closeTop = Boolean(options.closeTop);
        const closeBottom = Boolean(options.closeBottom);
        const makeHollow = Boolean(options.makeHollow);
        const baseShapeSegmentCount = baseShape.vertices.length;
        this.faceVertexUvs[0] = [];
        for (var s = 0; s < outlineSegmentCount; s++) {
            for (var i = 0; i < baseShapeSegmentCount; i++) {
                if (s > 0) {
                    if (i > 0) {
                        this.addFace4ByIndices(s, i - 1, s - 1, i, makeHollow);
                        if (i + 1 == baseShape.vertices.length) {
                            // Close the gap on the shape
                            this.addFace4ByIndices(s, i, s - 1, 0, makeHollow);
                        }
                    }
                }
            } // END for
        } // END for
        if (makeHollow) {
            this.__makeFlatSideFaces();
            this.__makeBackFrontFaces();
        }
        if (closeBottom) {
            if (makeHollow)
                this._buildHollowBottomFaces();
            else
                this._buildEndFaces(this.bottomIndex, 0, baseShapeSegmentCount, false);
        }
        if (closeTop) {
            this._buildEndFaces(this.topIndex, this.vertexMatrix.length - 1, baseShapeSegmentCount, makeHollow);
        }
    }
    _buildHollowBottomFaces() {
        const _self = this;
        const edgeVertices = this.hollowBottomEdgeVertIndices.map((edgeVertIndex) => {
            return _self.vertices[edgeVertIndex];
        });
        const findClosestEdgeIndex = (vert) => {
            let index = 0;
            let distance = Number.MAX_VALUE;
            let tmpDist;
            for (var i = 0; i < edgeVertices.length; i++) {
                var tmpIndex = _self.hollowBottomEdgeVertIndices[i];
                if ((tmpDist = edgeVertices[i].distanceTo(vert)) < distance) {
                    index = tmpIndex;
                    distance = tmpDist;
                }
            }
            return index;
        };
        // 'Last index' starts at last point at all : )
        var n = this.vertexMatrix[0].length;
        var lastIndex = findClosestEdgeIndex(this.vertices[n - 1]);
        var triangleIndices;
        // Use first slice (at bottom position)
        for (var i = 0; i < n; i++) {
            var curIndex = findClosestEdgeIndex(this.vertices[this.vertexMatrix[0][i]]);
            // Close gap to last (different shell index)
            triangleIndices = [lastIndex, this.vertexMatrix[0][i == 0 ? n - 1 : i - 1], this.vertexMatrix[0][i]];
            this.faces.push(new Face3(triangleIndices[0], triangleIndices[1], triangleIndices[2])); // Same?
            this.hollowBottomTriagles.push(triangleIndices);
            if (lastIndex !== curIndex) {
                // Add normal triangle to same shell index
                triangleIndices = [curIndex, lastIndex, this.vertexMatrix[0][i]];
                this.faces.push(new Face3(triangleIndices[0], triangleIndices[1], triangleIndices[2]));
                this.hollowBottomTriagles.push(triangleIndices);
            }
            lastIndex = curIndex;
        }
    }
    /**
     * Build the face and the top or bottom end of the geometry. Imagine the dildo geometry
     * as a closed cylinder: this function created the top or the bottom 'circle'.
     *
     * @param {number} endVertexIndex - This should be `this.topIndex` or `this.bottomIndex`.
     * @param {number} shapeIndex - This should be `0` (top) or `outlineSegmentCount-1` (bottom).
     * @param {number} baseShapeSegmentCount - The number of shape segments.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    _buildEndFaces(endVertexIndex, shapeIndex, baseShapeSegmentCount, inverseFaceDirection) {
        // Close at top.
        for (var i = 1; i < baseShapeSegmentCount; i++) {
            GeometryGenerationHelpers.makeFace3(this, this.vertexMatrix[shapeIndex][i - 1], endVertexIndex, this.vertexMatrix[shapeIndex][i], inverseFaceDirection);
            if (i + 1 == baseShapeSegmentCount) {
                GeometryGenerationHelpers.makeFace3(this, this.vertexMatrix[shapeIndex][i], endVertexIndex, this.vertexMatrix[shapeIndex][0], inverseFaceDirection);
            }
        }
    }
    /**
     * Pre: flatSides are made
     */
    __makeBackFrontFaces() {
        // Connect left and right side (important: ignore bottom vertex at last index)
        for (var i = 1; i + 1 < this.flatSidePolygon.vertices.length; i++) {
            GeometryGenerationHelpers.makeFace4(this, this.leftFlatIndices[i], this.leftFlatIndices[i - 1], this.rightFlatIndices[i], this.rightFlatIndices[i - 1]);
        }
    }
    /**
     * Build the texture UV mapping for all faces.
     *
     * @param {ExtendedDildoOptions} options
     */
    _buildUVMapping(options) {
        var baseShape = options.baseShape;
        var outlineSegmentCount = options.outlineSegmentCount;
        var baseShapeSegmentCount = baseShape.vertices.length;
        var closeTop = Boolean(options.closeTop);
        var closeBottom = Boolean(options.closeBottom);
        var makeHollow = Boolean(options.makeHollow);
        // https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
        for (var s = 1; s < outlineSegmentCount; s++) {
            for (var i = 1; i < baseShape.vertices.length; i++) {
                GeometryGenerationHelpers.addCylindricUV4(this, s, i - 1, s - 1, i, outlineSegmentCount, baseShapeSegmentCount, makeHollow);
                if (i + 1 == baseShape.vertices.length) {
                    // Close the gap on the shape
                    GeometryGenerationHelpers.addCylindricUV4(this, s, i - 1, s - 1, i, outlineSegmentCount, baseShapeSegmentCount, makeHollow);
                }
            }
        }
        if (makeHollow) {
            // Make flat side UVS (left)
            // Note: left flat side and right flat side have the same number of polygon vertices
            for (var i = 0; i < this.leftFlatTriangleIndices.length; i++) {
                var leftA = this.leftFlatTriangleIndices[i][0];
                var leftB = this.leftFlatTriangleIndices[i][1];
                var leftC = this.leftFlatTriangleIndices[i][2];
                UVHelpers.makeFlatTriangleUVs(this, this.flatSideBounds, leftA, leftB, leftC);
            }
            // Make flat side UVS (right)
            for (var i = 0; i < this.rightFlatTriangleIndices.length; i++) {
                // NOTE: as the triangles are computed on the left flat side -> for the right side
                //          change the winding order!!!
                var rightA = this.rightFlatTriangleIndices[i][0];
                var rightB = this.rightFlatTriangleIndices[i][2];
                var rightC = this.rightFlatTriangleIndices[i][1];
                UVHelpers.makeFlatTriangleUVs(this, this.flatSideBounds, rightA, rightB, rightC);
            }
            // TODO: add these as function
            for (var i = 1; i + 1 < this.flatSidePolygon.vertices.length; i++) {
                var ratioI = (i - 1) / (this.flatSidePolygon.vertices.length - 1);
                var ratioJ = i / (this.flatSidePolygon.vertices.length - 1);
                this.faceVertexUvs[0].push([
                    new THREE.Vector2(0.0, ratioJ),
                    new THREE.Vector2(0.0, ratioI),
                    new THREE.Vector2(1.0, ratioJ)
                ]);
                this.faceVertexUvs[0].push([
                    new THREE.Vector2(0.0, ratioI),
                    new THREE.Vector2(1.0, ratioI),
                    new THREE.Vector2(1.0, ratioJ)
                ]);
            }
        } // END if[makeHollow]
        // Build UV mapping for the bottom (base)
        if (closeBottom) {
            if (makeHollow) {
                UVHelpers.makeHollowBottomUVs(this, this.hollowBottomEdgeVertIndices, this.hollowBottomTriagles);
            }
            else {
                for (var i = 1; i < baseShapeSegmentCount; i++) {
                    GeometryGenerationHelpers.addPyramidalBaseUV3(this, i - 1, baseShapeSegmentCount);
                    if (i + 1 == baseShapeSegmentCount) {
                        // Close the gap on the shape
                        GeometryGenerationHelpers.addPyramidalBaseUV3(this, i - 1, baseShapeSegmentCount);
                    }
                }
            }
        }
        // Build UV mapping for the top (closing element)
        if (closeTop) {
            var lastIndex = outlineSegmentCount - 1;
            for (var i = 1; i < baseShapeSegmentCount; i++) {
                GeometryGenerationHelpers.addPyramidalBaseUV3(this, i - 1, baseShapeSegmentCount);
                if (i + 1 == baseShapeSegmentCount) {
                    // Close the gap on the shape
                    GeometryGenerationHelpers.addPyramidalBaseUV3(this, lastIndex, baseShapeSegmentCount);
                }
            }
        }
        this.uvsNeedUpdate = true;
    }
    /**
     * Build a triangulated face4 (two face3) for the given matrix index pairs. The method will create
     * two right-turning triangles.
     *
     * <pre>
     *       (a,b)---(c,b)
     *         |    /  |
     *         |   /   |
     *         |  /    |
     *       (a,d)---(c,d)
     * </pre>
     *
     * @param {number} a - The first primary index in the `vertexMatrix` array.
     * @param {number} b - The first seconday index in the `vertexMatrix[a]` array.
     * @param {number} c - The second primary index in the `vertexMatrix` array.
     * @param {number} d - The second seconday index in the `vertexMatrix[c]` array.
     * @param {boolean=false} inverseFaceDirection - If true then the face will have left winding order (instead of right which is the default).
     */
    addFace4ByIndices(a, b, c, d, inverseFaceDirection) {
        GeometryGenerationHelpers.makeFace4(this, this.vertexMatrix[a][b], this.vertexMatrix[c][b], this.vertexMatrix[a][d], this.vertexMatrix[c][d], inverseFaceDirection);
    }
    /**
     * Build up the vertices in this geometry.
     *
     * @param {} options
     */
    _buildVertices(options) {
        const baseShape = options.baseShape;
        const outline = options.outline;
        const outlineSegmentCount = options.outlineSegmentCount;
        const makeHollow = Boolean(options.makeHollow);
        const bendAngleRad = (options.bendAngle / 180) * Math.PI;
        const hollowStrengthX = options.hollowStrengthX; // default=15.0? // TODO: hollow strength as param
        const twistAngle = options.twistAngle * DEG_TO_RAD;
        const normalizePerpendiculars = Boolean(options.normalizePerpendiculars);
        const normalsLength = typeof options.normalsLength !== "undefined" ? options.normalsLength : 10.0;
        const outlineBounds = outline.getBounds();
        const shapeHeight = outlineBounds.height;
        const shapeBounds = baseShape.getBounds();
        const shapeCenter = shapeBounds.getCenter();
        const arcLength = shapeHeight;
        const arcRadius = arcLength / bendAngleRad;
        const isBending = options.isBending &&
            !isNaN(arcRadius) &&
            arcRadius !== Number.POSITIVE_INFINITY &&
            arcRadius !== Number.NEGATIVE_INFINITY &&
            Math.abs(bendAngleRad) > 0.01;
        for (var s = 0; s < outlineSegmentCount; s++) {
            const t = Math.min(1.0, Math.max(0.0, s / (outlineSegmentCount - 1)));
            this.vertexMatrix[s] = [];
            const outlineVert = outline.getPointAt(t);
            const perpendicularVert = outline.getPerpendicularAt(t);
            const heightT = (outlineBounds.max.y - outlineVert.y) / shapeHeight;
            const outlineT = s / (outlineSegmentCount - 1);
            this.__buildSlice(baseShape, outlineBounds, outlineVert, s, heightT, isBending, bendAngleRad, arcRadius, twistAngle * outlineT);
            this.__buildSpine(shapeCenter, outlineBounds, outlineVert, heightT, isBending, bendAngleRad, arcRadius);
            this.__buildPerps(baseShape, outlineBounds, outlineVert, perpendicularVert, heightT, isBending, bendAngleRad, arcRadius, normalizePerpendiculars, normalsLength);
        } // END for
        const topVertex = this._getTopVertex(outlineBounds, isBending, bendAngleRad, arcRadius);
        const bottomVertex = this._getBottomVertex(outlineBounds);
        this.topIndex = this.vertices.length;
        this.vertices.push(topVertex);
        this.bottomIndex = this.vertices.length;
        this.vertices.push(bottomVertex);
        if (makeHollow) {
            // Construct the left and the right flat bounds (used to make a casting mould)
            this.__makeFlatSideVertices(Math.max(shapeBounds.width, shapeBounds.height) / 2.0 + hollowStrengthX);
        }
    }
    // TODO: this function currently does nothing
    __applyBumpmap(bumpmapTexture) {
        // const tmp: Gmetry = this as unknown as Gmetry;
        // for (var i = 0; i < this.vertexMatrix.length; i++) {
        //   for (var j = 0; j < this.vertexMatrix[i].length; j++) {
        //     // apply local bump map
        //   }
        // }
    }
} // END class
//# sourceMappingURL=DildoGeometry.js.map