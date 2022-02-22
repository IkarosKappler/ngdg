"use strict";
/**
 * THE ORIGINAL SOURCE COOE IS HERE:
 *    https://github.com/mrdoob/three.js/blob/dev/examples/jsm/deprecated/Geometry.js
 *
 * This is a backport of the old (deprecated) THREE.DirectGeometry class.
 *
 * It got deprecated in version r125 and was announced to be completely dropped in future versions.
 *
 * As it was a very useful class I wanted to preserve it for some of my projects which depend on it.
 *
 * And here this is a Typescript port, too. Enjoy!
 *    - Ikaros Kappler
 *
 * @date 2022-02-11
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectGeometry = void 0;
var DefaultFactory_1 = require("./DefaultFactory");
var DirectGeometry = /** @class */ (function () {
    function DirectGeometry(factory) {
        this.vertices = [];
        this.normals = [];
        this.colors = [];
        this.uvs = [];
        this.uvs2 = [];
        this.groups = [];
        this.morphTargets = {};
        this.skinWeights = [];
        this.skinIndices = [];
        // this.lineDistances = [];
        this.boundingBox = null;
        this.boundingSphere = null;
        // update flags
        this.verticesNeedUpdate = false;
        this.normalsNeedUpdate = false;
        this.colorsNeedUpdate = false;
        this.uvsNeedUpdate = false;
        this.groupsNeedUpdate = false;
        // this.isGeometry = true;
        this.factory = factory || DefaultFactory_1.DefaultFactory;
    }
    DirectGeometry.prototype.computeGroups = function (geometry) {
        var groups = [];
        var group;
        var i;
        var materialIndex = undefined;
        var faces = geometry.faces;
        for (i = 0; i < faces.length; i++) {
            var face = faces[i];
            // materials
            if (face.materialIndex !== materialIndex) {
                materialIndex = face.materialIndex;
                if (group !== undefined) {
                    group.count = i * 3 - group.start;
                    groups.push(group);
                }
                group = {
                    start: i * 3,
                    materialIndex: materialIndex
                };
            }
        }
        if (group !== undefined) {
            group.count = i * 3 - group.start;
            groups.push(group);
        }
        this.groups = groups;
    };
    DirectGeometry.prototype.fromGeometry = function (geometry) {
        var faces = geometry.faces;
        var vertices = geometry.vertices;
        var faceVertexUvs = geometry.faceVertexUvs;
        var hasFaceVertexUv = faceVertexUvs[0] && faceVertexUvs[0].length > 0;
        var hasFaceVertexUv2 = faceVertexUvs[1] && faceVertexUvs[1].length > 0;
        // morphs
        var morphTargets = geometry.morphTargets;
        var morphTargetsLength = morphTargets.length;
        var morphTargetsPosition;
        if (morphTargetsLength > 0) {
            morphTargetsPosition = [];
            for (var i = 0; i < morphTargetsLength; i++) {
                morphTargetsPosition[i] = {
                    name: morphTargets[i].name,
                    data: []
                };
            }
            // TODO: here seems to be something wrong with the types
            this.morphTargets.position = morphTargetsPosition;
        }
        var morphNormals = geometry.morphNormals;
        var morphNormalsLength = morphNormals.length;
        var morphTargetsNormal;
        if (morphNormalsLength > 0) {
            morphTargetsNormal = [];
            for (var i = 0; i < morphNormalsLength; i++) {
                morphTargetsNormal[i] = {
                    name: morphNormals[i].name,
                    data: []
                };
            }
            this.morphTargets.normal = morphTargetsNormal;
        }
        // skins
        var skinIndices = geometry.skinIndices;
        var skinWeights = geometry.skinWeights;
        var hasSkinIndices = skinIndices.length === vertices.length;
        var hasSkinWeights = skinWeights.length === vertices.length;
        //
        if (vertices.length > 0 && faces.length === 0) {
            console.error("THREE.DirectGeometry: Faceless geometries are not supported.");
        }
        for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            this.vertices.push(vertices[face.a], vertices[face.b], vertices[face.c]);
            var vertexNormals = face.vertexNormals;
            if (vertexNormals.length === 3) {
                this.normals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
            }
            else {
                var normal = face.normal;
                this.normals.push(normal, normal, normal);
            }
            var vertexColors = face.vertexColors;
            if (vertexColors.length === 3) {
                this.colors.push(vertexColors[0], vertexColors[1], vertexColors[2]);
            }
            else {
                var color = face.color;
                this.colors.push(color, color, color);
            }
            if (hasFaceVertexUv === true) {
                var vertexUvs = faceVertexUvs[0][i];
                if (vertexUvs !== undefined) {
                    this.uvs.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
                }
                else {
                    console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv ", i);
                    // TODO: verify
                    // this.uvs.push( new Vector2(), new Vector2(), new Vector2() );
                    this.uvs.push(this.factory.newVector2(), this.factory.newVector2(), this.factory.newVector2());
                }
            }
            if (hasFaceVertexUv2 === true) {
                var vertexUvs = faceVertexUvs[1][i];
                if (vertexUvs !== undefined) {
                    this.uvs2.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
                }
                else {
                    console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv2 ", i);
                    // TODO: verify
                    // this.uvs2.push( new Vector2(), new Vector2(), new Vector2() );
                    this.uvs2.push(this.factory.newVector2(), this.factory.newVector2(), this.factory.newVector2());
                }
            }
            // morphs
            for (var j = 0; j < morphTargetsLength; j++) {
                var morphTarget = morphTargets[j].vertices;
                morphTargetsPosition[j].data.push(morphTarget[face.a], morphTarget[face.b], morphTarget[face.c]);
            }
            for (var j = 0; j < morphNormalsLength; j++) {
                var morphNormal = morphNormals[j].vertexNormals[i];
                morphTargetsNormal[j].data.push(morphNormal.a, morphNormal.b, morphNormal.c);
            }
            // skins
            if (hasSkinIndices) {
                this.skinIndices.push(skinIndices[face.a], skinIndices[face.b], skinIndices[face.c]);
            }
            if (hasSkinWeights) {
                this.skinWeights.push(skinWeights[face.a], skinWeights[face.b], skinWeights[face.c]);
            }
        }
        this.computeGroups(geometry);
        this.verticesNeedUpdate = geometry.verticesNeedUpdate;
        this.normalsNeedUpdate = geometry.normalsNeedUpdate;
        this.colorsNeedUpdate = geometry.colorsNeedUpdate;
        this.uvsNeedUpdate = geometry.uvsNeedUpdate;
        this.groupsNeedUpdate = geometry.groupsNeedUpdate;
        if (geometry.boundingSphere !== null) {
            this.boundingSphere = geometry.boundingSphere.clone();
        }
        if (geometry.boundingBox !== null) {
            this.boundingBox = geometry.boundingBox.clone();
        }
        return this;
    };
    return DirectGeometry;
}());
exports.DirectGeometry = DirectGeometry;
//# sourceMappingURL=DirectGeometry.js.map