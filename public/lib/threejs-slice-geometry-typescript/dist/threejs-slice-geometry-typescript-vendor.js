"use strict";
(self["webpackChunkthreejs_slice_geometry_typescript"] = self["webpackChunkthreejs_slice_geometry_typescript"] || []).push([["vendor"],{

/***/ "./node_modules/three-geometry-hellfix/src/esm/DefaultFactory.js":
/*!***********************************************************************!*\
  !*** ./node_modules/three-geometry-hellfix/src/esm/DefaultFactory.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DefaultFactory": () => (/* binding */ DefaultFactory)
/* harmony export */ });
/**
 * The default factory to connect to your three library.
 *
 * @author  Ikaros Kappler
 * @date    2022-02-20
 * @version 1.0.0
 */
const DefaultFactory = {
    newVector2: (x, y) => { return new window["THREE"].Vector2(x, y); },
    newVector3: (x, y, z) => { return new window["THREE"].Vector3(x, y, z); },
    newMatrix3: () => { return new window["THREE"].Matrix3(); },
    newMatrix4: () => { return new window["THREE"].Matrix4(); },
    newObject3D: () => { return new window["THREE"].Object3D(); },
    newBox3: () => { return new window["THREE"].Box3(); },
    newSphere: () => { return new window["THREE"].Sphere(); },
    newBufferGeometry: () => { return new window["THREE"].BufferGeometry(); },
    generateUUID: () => { return window["THREE"].MathUtils.generateUUID(); },
    newFloat32BufferAttribute: (array, itemSize, normalized) => { return new window["THREE"].Float32BufferAttribute(array, itemSize, normalized); },
    newColor: () => { return new window["THREE"].Color; },
    newBufferAttribute: (array, itemSize, normalized) => { return new window["THREE"].BufferAttribute(array, itemSize, normalized); }
};
//# sourceMappingURL=DefaultFactory.js.map

/***/ }),

/***/ "./node_modules/three-geometry-hellfix/src/esm/DirectGeometry.js":
/*!***********************************************************************!*\
  !*** ./node_modules/three-geometry-hellfix/src/esm/DirectGeometry.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DirectGeometry": () => (/* binding */ DirectGeometry)
/* harmony export */ });
/* harmony import */ var _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DefaultFactory */ "./node_modules/three-geometry-hellfix/src/esm/DefaultFactory.js");
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

class DirectGeometry {
    constructor(factory) {
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
        this.factory = factory || _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__.DefaultFactory;
    }
    computeGroups(geometry) {
        const groups = [];
        let group;
        let i;
        let materialIndex = undefined;
        const faces = geometry.faces;
        for (i = 0; i < faces.length; i++) {
            const face = faces[i];
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
    }
    fromGeometry(geometry) {
        const faces = geometry.faces;
        const vertices = geometry.vertices;
        const faceVertexUvs = geometry.faceVertexUvs;
        const hasFaceVertexUv = faceVertexUvs[0] && faceVertexUvs[0].length > 0;
        const hasFaceVertexUv2 = faceVertexUvs[1] && faceVertexUvs[1].length > 0;
        // morphs
        const morphTargets = geometry.morphTargets;
        const morphTargetsLength = morphTargets.length;
        let morphTargetsPosition;
        if (morphTargetsLength > 0) {
            morphTargetsPosition = [];
            for (let i = 0; i < morphTargetsLength; i++) {
                morphTargetsPosition[i] = {
                    name: morphTargets[i].name,
                    data: []
                };
            }
            // TODO: here seems to be something wrong with the types
            this.morphTargets.position = morphTargetsPosition;
        }
        const morphNormals = geometry.morphNormals;
        const morphNormalsLength = morphNormals.length;
        let morphTargetsNormal;
        if (morphNormalsLength > 0) {
            morphTargetsNormal = [];
            for (let i = 0; i < morphNormalsLength; i++) {
                morphTargetsNormal[i] = {
                    name: morphNormals[i].name,
                    data: []
                };
            }
            this.morphTargets.normal = morphTargetsNormal;
        }
        // skins
        const skinIndices = geometry.skinIndices;
        const skinWeights = geometry.skinWeights;
        const hasSkinIndices = skinIndices.length === vertices.length;
        const hasSkinWeights = skinWeights.length === vertices.length;
        //
        if (vertices.length > 0 && faces.length === 0) {
            console.error("THREE.DirectGeometry: Faceless geometries are not supported.");
        }
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            this.vertices.push(vertices[face.a], vertices[face.b], vertices[face.c]);
            const vertexNormals = face.vertexNormals;
            if (vertexNormals.length === 3) {
                this.normals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
            }
            else {
                const normal = face.normal;
                this.normals.push(normal, normal, normal);
            }
            const vertexColors = face.vertexColors;
            if (vertexColors.length === 3) {
                this.colors.push(vertexColors[0], vertexColors[1], vertexColors[2]);
            }
            else {
                const color = face.color;
                this.colors.push(color, color, color);
            }
            if (hasFaceVertexUv === true) {
                const vertexUvs = faceVertexUvs[0][i];
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
                const vertexUvs = faceVertexUvs[1][i];
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
            for (let j = 0; j < morphTargetsLength; j++) {
                const morphTarget = morphTargets[j].vertices;
                morphTargetsPosition[j].data.push(morphTarget[face.a], morphTarget[face.b], morphTarget[face.c]);
            }
            for (let j = 0; j < morphNormalsLength; j++) {
                const morphNormal = morphNormals[j].vertexNormals[i];
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
    }
}
//# sourceMappingURL=DirectGeometry.js.map

/***/ }),

/***/ "./node_modules/three-geometry-hellfix/src/esm/Face3.js":
/*!**************************************************************!*\
  !*** ./node_modules/three-geometry-hellfix/src/esm/Face3.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Face3": () => (/* binding */ Face3)
/* harmony export */ });
/* harmony import */ var _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DefaultFactory */ "./node_modules/three-geometry-hellfix/src/esm/DefaultFactory.js");
/**
 * THE ORIGINAL SOURCE COOE IS HERE:
 *    https://github.com/mrdoob/three.js/blob/dev/examples/jsm/deprecated/Geometry.js
 *
 * This is a backport of the old (deprecated) THREE.Face3 class.
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

class Face3 {
    constructor(a, b, c, normal, color, materialIndex = 0, factory) {
        var fact = factory || _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__.DefaultFactory;
        this.a = a;
        this.b = b;
        this.c = c;
        // this.normal = ( normal && normal.isVector3 ) ? normal : new THREE.Vector3();
        // this.vertexNormals = Array.isArray( normal ) ? normal : [];
        // TODO: verify correctness
        // this.normal = ( normal && (normal instanceof Vector3 && normal.isVector3) ) ? normal : new Vector3();
        // TODO: use DefaultFactory here
        // this.normal = ( normal && (normal instanceof Vector3 && normal.isVector3) ) ? normal : new (window["THREE"]).Vector3();
        this.normal = normal && normal.isVector3 ? normal : fact.newVector3();
        this.vertexNormals = Array.isArray(normal) ? normal : [];
        // this.color = ( color && color.isColor ) ? color : new THREE.Color();
        // this.color = ( color && ( color instanceof Color && color.isColor)  ) ? color : new Color(); // TODO: verify correctness
        // TODO: use DefaultFactory here
        this.color = color && color.isColor ? color : fact.newColor(); // TODO: verify correctness
        this.vertexColors = Array.isArray(color) ? color : [];
        this.materialIndex = materialIndex;
    }
    clone() {
        // TODO: check if new expression is correct
        // return new this.constructor().copy( this );
        return new Face3(this.a, this.b, this.c, this.normal.clone(), this.color.clone(), this.materialIndex).copy(this);
    }
    copy(source) {
        this.a = source.a;
        this.b = source.b;
        this.c = source.c;
        this.normal.copy(source.normal);
        this.color.copy(source.color);
        this.materialIndex = source.materialIndex;
        for (let i = 0, il = source.vertexNormals.length; i < il; i++) {
            this.vertexNormals[i] = source.vertexNormals[i].clone();
        }
        for (let i = 0, il = source.vertexColors.length; i < il; i++) {
            this.vertexColors[i] = source.vertexColors[i].clone();
        }
        return this;
    }
}
//# sourceMappingURL=Face3.js.map

/***/ }),

/***/ "./node_modules/three-geometry-hellfix/src/esm/Gmetry.js":
/*!***************************************************************!*\
  !*** ./node_modules/three-geometry-hellfix/src/esm/Gmetry.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Gmetry": () => (/* binding */ Gmetry)
/* harmony export */ });
/* harmony import */ var _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DefaultFactory */ "./node_modules/three-geometry-hellfix/src/esm/DefaultFactory.js");
/* harmony import */ var _DirectGeometry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DirectGeometry */ "./node_modules/three-geometry-hellfix/src/esm/DirectGeometry.js");
/* harmony import */ var _Face3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Face3 */ "./node_modules/three-geometry-hellfix/src/esm/Face3.js");
/**
 * THE ORIGINAL SOURCE COOE IS HERE:
 *    https://github.com/mrdoob/three.js/blob/dev/examples/jsm/deprecated/Geometry.js
 *
 * This is a backport of the old (deprecated) THREE.Face3 class.
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



class Gmetry {
    /**
     * Construct a new Gmetry.
     *
     * @param {ThreeFactory?} factory - Specify a custom factory if you do not want to use the DefaultFactory.
     */
    constructor(factory) {
        this.name = "";
        this.type = "Geometry";
        this.vertices = [];
        this.colors = [];
        this.faces = [];
        this.faceVertexUvs = [[]];
        this.morphTargets = [];
        this.morphNormals = [];
        this.skinWeights = [];
        this.skinIndices = [];
        this.lineDistances = [];
        this.boundingBox = null;
        this.boundingSphere = null;
        // update flags
        this.elementsNeedUpdate = false;
        this.verticesNeedUpdate = false;
        this.uvsNeedUpdate = false;
        this.normalsNeedUpdate = false;
        this.colorsNeedUpdate = false;
        this.lineDistancesNeedUpdate = false;
        this.groupsNeedUpdate = false;
        this.isGeometry = true;
        this.factory = factory || _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__.DefaultFactory;
        this.uuid = this.factory.generateUUID();
        this._m1 = this.factory.newMatrix4();
        this._obj = this.factory.newObject3D();
        this._offset = this.factory.newVector3();
    }
    applyMatrix4(matrix) {
        const normalMatrix = this.factory.newMatrix3().getNormalMatrix(matrix);
        for (let i = 0, il = this.vertices.length; i < il; i++) {
            const vertex = this.vertices[i];
            vertex.applyMatrix4(matrix);
        }
        for (let i = 0, il = this.faces.length; i < il; i++) {
            const face = this.faces[i];
            face.normal.applyMatrix3(normalMatrix).normalize();
            for (let j = 0, jl = face.vertexNormals.length; j < jl; j++) {
                face.vertexNormals[j].applyMatrix3(normalMatrix).normalize();
            }
        }
        if (this.boundingBox !== null) {
            this.computeBoundingBox();
        }
        if (this.boundingSphere !== null) {
            this.computeBoundingSphere();
        }
        this.verticesNeedUpdate = true;
        this.normalsNeedUpdate = true;
        return this;
    }
    rotateX(angle) {
        // rotate geometry around world x-axis
        this._m1.makeRotationX(angle);
        this.applyMatrix4(this._m1);
        return this;
    }
    rotateY(angle) {
        // rotate geometry around world y-axis
        this._m1.makeRotationY(angle);
        this.applyMatrix4(this._m1);
        return this;
    }
    rotateZ(angle) {
        // rotate geometry around world z-axis
        this._m1.makeRotationZ(angle);
        this.applyMatrix4(this._m1);
        return this;
    }
    translate(x, y, z) {
        // translate geometry
        this._m1.makeTranslation(x, y, z);
        this.applyMatrix4(this._m1);
        return this;
    }
    scale(x, y, z) {
        // scale geometry
        this._m1.makeScale(x, y, z);
        this.applyMatrix4(this._m1);
        return this;
    }
    lookAt(vector) {
        this._obj.lookAt(vector);
        this._obj.updateMatrix();
        this.applyMatrix4(this._obj.matrix);
        return this;
    }
    fromBufferGeometry(geometry) {
        const scope = this;
        const index = geometry.index !== null ? geometry.index : undefined;
        const attributes = geometry.attributes;
        if (attributes.position === undefined) {
            console.error("THREE.Geometry.fromBufferGeometry(): Position attribute required for conversion.");
            return this;
        }
        const position = attributes.position;
        const normal = attributes.normal;
        const color = attributes.color;
        const uv = attributes.uv;
        const uv2 = attributes.uv2;
        if (uv2 !== undefined)
            this.faceVertexUvs[1] = [];
        for (let i = 0; i < position.count; i++) {
            scope.vertices.push(this.factory.newVector3().fromBufferAttribute(position, i));
            if (color !== undefined) {
                scope.colors.push(this.factory.newColor().fromBufferAttribute(color, i));
            }
        }
        const factory = this.factory;
        // TODO: put to helper functions
        const addFace = (a, b, c, materialIndex) => {
            const vertexColors = color === undefined ? [] : [scope.colors[a].clone(), scope.colors[b].clone(), scope.colors[c].clone()];
            const vertexNormals = normal === undefined
                ? []
                : [
                    factory.newVector3().fromBufferAttribute(normal, a),
                    factory.newVector3().fromBufferAttribute(normal, b),
                    factory.newVector3().fromBufferAttribute(normal, c)
                ];
            const face = new _Face3__WEBPACK_IMPORTED_MODULE_2__.Face3(a, b, c, vertexNormals, vertexColors, materialIndex);
            scope.faces.push(face);
            if (uv !== undefined) {
                scope.faceVertexUvs[0].push([
                    factory.newVector2().fromBufferAttribute(uv, a),
                    factory.newVector2().fromBufferAttribute(uv, b),
                    factory.newVector2().fromBufferAttribute(uv, c)
                ]);
            }
            if (uv2 !== undefined) {
                scope.faceVertexUvs[1].push([
                    factory.newVector2().fromBufferAttribute(uv2, a),
                    factory.newVector2().fromBufferAttribute(uv2, b),
                    factory.newVector2().fromBufferAttribute(uv2, c)
                ]);
            }
        };
        const groups = geometry.groups;
        if (groups.length > 0) {
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                const start = group.start;
                const count = group.count;
                for (let j = start, jl = start + count; j < jl; j += 3) {
                    if (index !== undefined) {
                        addFace(index.getX(j), index.getX(j + 1), index.getX(j + 2), group.materialIndex);
                    }
                    else {
                        addFace(j, j + 1, j + 2, group.materialIndex);
                    }
                }
            }
        }
        else {
            if (index !== undefined) {
                for (let i = 0; i < index.count; i += 3) {
                    addFace(index.getX(i), index.getX(i + 1), index.getX(i + 2));
                }
            }
            else {
                for (let i = 0; i < position.count; i += 3) {
                    addFace(i, i + 1, i + 2);
                }
            }
        }
        this.computeFaceNormals();
        if (geometry.boundingBox !== null) {
            this.boundingBox = geometry.boundingBox.clone();
        }
        if (geometry.boundingSphere !== null) {
            this.boundingSphere = geometry.boundingSphere.clone();
        }
        return this;
    }
    center() {
        this.computeBoundingBox();
        this.boundingBox.getCenter(this._offset).negate();
        this.translate(this._offset.x, this._offset.y, this._offset.z);
        return this;
    }
    normalize() {
        this.computeBoundingSphere();
        const center = this.boundingSphere.center;
        const radius = this.boundingSphere.radius;
        const s = radius === 0 ? 1 : 1.0 / radius;
        const matrix = this.factory.newMatrix4();
        matrix.set(s, 0, 0, -s * center.x, 0, s, 0, -s * center.y, 0, 0, s, -s * center.z, 0, 0, 0, 1);
        this.applyMatrix4(matrix);
        return this;
    }
    computeFaceNormals() {
        const cb = this.factory.newVector3(), ab = this.factory.newVector3();
        for (let f = 0, fl = this.faces.length; f < fl; f++) {
            const face = this.faces[f];
            const vA = this.vertices[face.a];
            const vB = this.vertices[face.b];
            const vC = this.vertices[face.c];
            cb.subVectors(vC, vB);
            ab.subVectors(vA, vB);
            cb.cross(ab);
            cb.normalize();
            face.normal.copy(cb);
        }
    }
    computeVertexNormals(areaWeighted = true) {
        const vertices = new Array(this.vertices.length);
        for (let v = 0, vl = this.vertices.length; v < vl; v++) {
            // TODO: verify
            // vertices[ v ] = new Vector3();
            vertices[v] = this.factory.newVector3();
        }
        if (areaWeighted) {
            // vertex normals weighted by triangle areas
            // http://www.iquilezles.org/www/articles/normals/normals.htm
            // TODO: verify
            // const cb = new Vector3(), ab = new Vector3();
            const cb = this.factory.newVector3(), ab = this.factory.newVector3();
            for (let f = 0, fl = this.faces.length; f < fl; f++) {
                const face = this.faces[f];
                const vA = this.vertices[face.a];
                const vB = this.vertices[face.b];
                const vC = this.vertices[face.c];
                cb.subVectors(vC, vB);
                ab.subVectors(vA, vB);
                cb.cross(ab);
                vertices[face.a].add(cb);
                vertices[face.b].add(cb);
                vertices[face.c].add(cb);
            }
        }
        else {
            this.computeFaceNormals();
            for (let f = 0, fl = this.faces.length; f < fl; f++) {
                const face = this.faces[f];
                vertices[face.a].add(face.normal);
                vertices[face.b].add(face.normal);
                vertices[face.c].add(face.normal);
            }
        }
        for (let v = 0, vl = this.vertices.length; v < vl; v++) {
            vertices[v].normalize();
        }
        for (let f = 0, fl = this.faces.length; f < fl; f++) {
            const face = this.faces[f];
            const vertexNormals = face.vertexNormals;
            if (vertexNormals.length === 3) {
                vertexNormals[0].copy(vertices[face.a]);
                vertexNormals[1].copy(vertices[face.b]);
                vertexNormals[2].copy(vertices[face.c]);
            }
            else {
                vertexNormals[0] = vertices[face.a].clone();
                vertexNormals[1] = vertices[face.b].clone();
                vertexNormals[2] = vertices[face.c].clone();
            }
        }
        if (this.faces.length > 0) {
            this.normalsNeedUpdate = true;
        }
    }
    computeFlatVertexNormals() {
        this.computeFaceNormals();
        for (let f = 0, fl = this.faces.length; f < fl; f++) {
            const face = this.faces[f];
            const vertexNormals = face.vertexNormals;
            if (vertexNormals.length === 3) {
                vertexNormals[0].copy(face.normal);
                vertexNormals[1].copy(face.normal);
                vertexNormals[2].copy(face.normal);
            }
            else {
                vertexNormals[0] = face.normal.clone();
                vertexNormals[1] = face.normal.clone();
                vertexNormals[2] = face.normal.clone();
            }
        }
        if (this.faces.length > 0) {
            this.normalsNeedUpdate = true;
        }
    }
    computeMorphNormals() {
        // save original normals
        // - create temp variables on first access
        //   otherwise just copy (for faster repeated calls)
        for (let f = 0, fl = this.faces.length; f < fl; f++) {
            const face = this.faces[f];
            if (!face.__originalFaceNormal) {
                face.__originalFaceNormal = face.normal.clone();
            }
            else {
                face.__originalFaceNormal.copy(face.normal);
            }
            if (!face.__originalVertexNormals)
                face.__originalVertexNormals = [];
            for (let i = 0, il = face.vertexNormals.length; i < il; i++) {
                if (!face.__originalVertexNormals[i]) {
                    face.__originalVertexNormals[i] = face.vertexNormals[i].clone();
                }
                else {
                    face.__originalVertexNormals[i].copy(face.vertexNormals[i]);
                }
            }
        }
        // use temp geometry to compute face and vertex normals for each morph
        const tmpGeo = new Gmetry(this.factory);
        tmpGeo.faces = this.faces;
        for (let i = 0, il = this.morphTargets.length; i < il; i++) {
            // create on first access
            if (!this.morphNormals[i]) {
                this.morphNormals[i] = {}; // TODO: check
                this.morphNormals[i].faceNormals = [];
                this.morphNormals[i].vertexNormals = [];
                const dstNormalsFace = this.morphNormals[i].faceNormals;
                const dstNormalsVertex = this.morphNormals[i].vertexNormals;
                for (let f = 0, fl = this.faces.length; f < fl; f++) {
                    const faceNormal = this.factory.newVector3();
                    const vertexNormals = { a: this.factory.newVector3(), b: this.factory.newVector3(), c: this.factory.newVector3() };
                    dstNormalsFace.push(faceNormal);
                    dstNormalsVertex.push(vertexNormals);
                }
            }
            const morphNormals = this.morphNormals[i];
            // set vertices to morph target
            tmpGeo.vertices = this.morphTargets[i].vertices;
            // compute morph normals
            tmpGeo.computeFaceNormals();
            tmpGeo.computeVertexNormals();
            // store morph normals
            for (let f = 0, fl = this.faces.length; f < fl; f++) {
                const face = this.faces[f];
                const faceNormal = morphNormals.faceNormals[f];
                const vertexNormals = morphNormals.vertexNormals[f];
                faceNormal.copy(face.normal);
                vertexNormals.a.copy(face.vertexNormals[0]);
                vertexNormals.b.copy(face.vertexNormals[1]);
                vertexNormals.c.copy(face.vertexNormals[2]);
            }
        }
        // restore original normals
        for (let f = 0, fl = this.faces.length; f < fl; f++) {
            const face = this.faces[f];
            face.normal = face.__originalFaceNormal;
            face.vertexNormals = face.__originalVertexNormals;
        }
    }
    computeBoundingBox() {
        if (this.boundingBox === null) {
            this.boundingBox = this.factory.newBox3();
        }
        this.boundingBox.setFromPoints(this.vertices);
    }
    computeBoundingSphere() {
        if (this.boundingSphere === null) {
            this.boundingSphere = this.factory.newSphere();
        }
        this.boundingSphere.setFromPoints(this.vertices);
    }
    merge(geometry, matrix, materialIndexOffset = 0) {
        if (!(geometry && geometry.isGeometry)) {
            console.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.", geometry);
            return;
        }
        let normalMatrix;
        const vertexOffset = this.vertices.length, vertices1 = this.vertices, vertices2 = geometry.vertices, faces1 = this.faces, faces2 = geometry.faces, colors1 = this.colors, colors2 = geometry.colors;
        if (matrix !== undefined) {
            normalMatrix = this.factory.newMatrix3().getNormalMatrix(matrix);
        }
        // vertices
        for (let i = 0, il = vertices2.length; i < il; i++) {
            const vertex = vertices2[i];
            const vertexCopy = vertex.clone();
            if (matrix !== undefined) {
                vertexCopy.applyMatrix4(matrix);
            }
            vertices1.push(vertexCopy);
        }
        // colors
        for (let i = 0, il = colors2.length; i < il; i++) {
            colors1.push(colors2[i].clone());
        }
        // faces
        for (let i = 0, il = faces2.length; i < il; i++) {
            const face = faces2[i];
            let normal;
            let color;
            const faceVertexNormals = face.vertexNormals, faceVertexColors = face.vertexColors;
            const faceCopy = new _Face3__WEBPACK_IMPORTED_MODULE_2__.Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
            faceCopy.normal.copy(face.normal);
            if (normalMatrix !== undefined) {
                faceCopy.normal.applyMatrix3(normalMatrix).normalize();
            }
            for (let j = 0, jl = faceVertexNormals.length; j < jl; j++) {
                normal = faceVertexNormals[j].clone();
                if (normalMatrix !== undefined) {
                    normal.applyMatrix3(normalMatrix).normalize();
                }
                faceCopy.vertexNormals.push(normal);
            }
            faceCopy.color.copy(face.color);
            for (let j = 0, jl = faceVertexColors.length; j < jl; j++) {
                color = faceVertexColors[j];
                faceCopy.vertexColors.push(color.clone());
            }
            faceCopy.materialIndex = face.materialIndex + materialIndexOffset;
            faces1.push(faceCopy);
        }
        // uvs
        for (let i = 0, il = geometry.faceVertexUvs.length; i < il; i++) {
            const faceVertexUvs2 = geometry.faceVertexUvs[i];
            if (this.faceVertexUvs[i] === undefined) {
                this.faceVertexUvs[i] = [];
            }
            for (let j = 0, jl = faceVertexUvs2.length; j < jl; j++) {
                const uvs2 = faceVertexUvs2[j], uvsCopy = [];
                for (let k = 0, kl = uvs2.length; k < kl; k++) {
                    uvsCopy.push(uvs2[k].clone());
                }
                this.faceVertexUvs[i].push(uvsCopy); // TODO: check
            }
        }
    }
    // TODO: the new version of Mesh operates on BufferGeometry
    mergeMesh(mesh) {
        if (!(mesh && mesh.isMesh)) {
            console.error("THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.", mesh);
            return;
        }
        if (mesh.matrixAutoUpdate) {
            mesh.updateMatrix();
        }
        this.merge(mesh.geometry, mesh.matrix);
    }
    /*
     * Checks for duplicate vertices with hashmap.
     * Duplicated vertices are removed
     * and faces' vertices are updated.
     */
    mergeVertices(precisionPoints = 4) {
        const verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
        const unique = [], changes = [];
        const precision = Math.pow(10, precisionPoints);
        for (let i = 0, il = this.vertices.length; i < il; i++) {
            const v = this.vertices[i];
            const key = Math.round(v.x * precision) + "_" + Math.round(v.y * precision) + "_" + Math.round(v.z * precision);
            if (verticesMap[key] === undefined) {
                verticesMap[key] = i;
                unique.push(this.vertices[i]);
                changes[i] = unique.length - 1;
            }
            else {
                //console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
                changes[i] = changes[verticesMap[key]];
            }
        }
        // if faces are completely degenerate after merging vertices, we
        // have to remove them from the geometry.
        const faceIndicesToRemove = [];
        for (let i = 0, il = this.faces.length; i < il; i++) {
            const face = this.faces[i];
            face.a = changes[face.a];
            face.b = changes[face.b];
            face.c = changes[face.c];
            const indices = [face.a, face.b, face.c];
            // if any duplicate vertices are found in a Face3
            // we have to remove the face as nothing can be saved
            for (let n = 0; n < 3; n++) {
                if (indices[n] === indices[(n + 1) % 3]) {
                    faceIndicesToRemove.push(i);
                    break;
                }
            }
        }
        for (let i = faceIndicesToRemove.length - 1; i >= 0; i--) {
            const idx = faceIndicesToRemove[i];
            this.faces.splice(idx, 1);
            for (let j = 0, jl = this.faceVertexUvs.length; j < jl; j++) {
                this.faceVertexUvs[j].splice(idx, 1);
            }
        }
        // Use unique set of vertices
        const diff = this.vertices.length - unique.length;
        this.vertices = unique;
        return diff;
    }
    setFromPoints(points) {
        this.vertices = [];
        for (let i = 0, l = points.length; i < l; i++) {
            const point = points[i];
            // TODO: verify
            // this.vertices.push( new Vector3( point.x, point.y, point.z || 0 ) );
            //   this.vertices.push(this.factory.newVector3(point.x, point.y, point.z || 0));
            this.vertices.push(this.factory.newVector3(point.x, point.y, point.z || 0));
        }
        return this;
    }
    sortFacesByMaterialIndex() {
        const faces = this.faces;
        const length = faces.length;
        // tag faces
        for (let i = 0; i < length; i++) {
            faces[i]._id = i;
        }
        // sort faces
        function materialIndexSort(a, b) {
            return a.materialIndex - b.materialIndex;
        }
        faces.sort(materialIndexSort);
        // sort uvs
        const uvs1 = this.faceVertexUvs[0];
        const uvs2 = this.faceVertexUvs[1];
        let newUvs1, newUvs2;
        if (uvs1 && uvs1.length === length) {
            newUvs1 = [];
        }
        if (uvs2 && uvs2.length === length) {
            newUvs2 = [];
        }
        for (let i = 0; i < length; i++) {
            const id = faces[i]._id;
            if (newUvs1)
                newUvs1.push(uvs1[id]);
            if (newUvs2)
                newUvs2.push(uvs2[id]);
        }
        if (newUvs1) {
            this.faceVertexUvs[0] = newUvs1;
        }
        if (newUvs2) {
            this.faceVertexUvs[1] = newUvs2;
        }
    }
    toJSON() {
        const data = {
            metadata: {
                version: 4.5,
                type: "Geometry",
                generator: "Geometry.toJSON"
            },
            // TODO: check
            uuid: null,
            type: null,
            name: null,
            data: null
        };
        // standard Geometry serialization
        data.uuid = this.uuid;
        data.type = this.type;
        if (this.name !== "")
            data.name = this.name;
        if (this.parameters !== undefined) {
            const parameters = this.parameters;
            for (const key in parameters) {
                if (parameters[key] !== undefined)
                    data[key] = parameters[key];
            }
            return data;
        }
        const vertices = [];
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex = this.vertices[i];
            vertices.push(vertex.x, vertex.y, vertex.z);
        }
        const faces = [];
        const normals = [];
        const normalsHash = {};
        const colors = [];
        const colorsHash = {};
        const uvs = [];
        const uvsHash = {};
        for (let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i];
            const hasMaterial = true;
            const hasFaceUv = false; // deprecated
            const hasFaceVertexUv = this.faceVertexUvs[0][i] !== undefined;
            const hasFaceNormal = face.normal.length() > 0;
            const hasFaceVertexNormal = face.vertexNormals.length > 0;
            const hasFaceColor = face.color.r !== 1 || face.color.g !== 1 || face.color.b !== 1;
            const hasFaceVertexColor = face.vertexColors.length > 0;
            let faceType = 0;
            // TODO: move to helpers?
            const setBit = (value, position, enabled) => {
                return enabled ? value | (1 << position) : value & ~(1 << position);
            };
            // TODO: move to helpers?
            const getNormalIndex = (normal) => {
                const hash = normal.x.toString() + normal.y.toString() + normal.z.toString();
                if (normalsHash[hash] !== undefined) {
                    return normalsHash[hash];
                }
                normalsHash[hash] = normals.length / 3;
                normals.push(normal.x, normal.y, normal.z);
                return normalsHash[hash];
            };
            // TODO: move to helpers?
            const getColorIndex = (color) => {
                const hash = color.r.toString() + color.g.toString() + color.b.toString();
                if (colorsHash[hash] !== undefined) {
                    return colorsHash[hash];
                }
                colorsHash[hash] = colors.length;
                colors.push(color.getHex());
                return colorsHash[hash];
            };
            // TODO: move to helpers?
            const getUvIndex = (uv) => {
                const hash = uv.x.toString() + uv.y.toString();
                if (uvsHash[hash] !== undefined) {
                    return uvsHash[hash];
                }
                uvsHash[hash] = uvs.length / 2;
                uvs.push(uv.x, uv.y);
                return uvsHash[hash];
            };
            faceType = setBit(faceType, 0, 0); // isQuad
            faceType = setBit(faceType, 1, hasMaterial);
            faceType = setBit(faceType, 2, hasFaceUv);
            faceType = setBit(faceType, 3, hasFaceVertexUv);
            faceType = setBit(faceType, 4, hasFaceNormal);
            faceType = setBit(faceType, 5, hasFaceVertexNormal);
            faceType = setBit(faceType, 6, hasFaceColor);
            faceType = setBit(faceType, 7, hasFaceVertexColor);
            faces.push(faceType);
            faces.push(face.a, face.b, face.c);
            faces.push(face.materialIndex);
            if (hasFaceVertexUv) {
                const faceVertexUvs = this.faceVertexUvs[0][i];
                faces.push(getUvIndex(faceVertexUvs[0]), getUvIndex(faceVertexUvs[1]), getUvIndex(faceVertexUvs[2]));
            }
            if (hasFaceNormal) {
                faces.push(getNormalIndex(face.normal));
            }
            if (hasFaceVertexNormal) {
                const vertexNormals = face.vertexNormals;
                faces.push(getNormalIndex(vertexNormals[0]), getNormalIndex(vertexNormals[1]), getNormalIndex(vertexNormals[2]));
            }
            if (hasFaceColor) {
                faces.push(getColorIndex(face.color));
            }
            if (hasFaceVertexColor) {
                const vertexColors = face.vertexColors;
                faces.push(getColorIndex(vertexColors[0]), getColorIndex(vertexColors[1]), getColorIndex(vertexColors[2]));
            }
        }
        // // TODO: move to helpers?
        // const setBit = (value: number, position: number, enabled: boolean | number) => {
        //   return enabled ? value | (1 << position) : value & ~(1 << position);
        // };
        // // TODO: move to helpers?
        // const getNormalIndex = (normal: Vector3) => {
        //   const hash = normal.x.toString() + normal.y.toString() + normal.z.toString();
        //   if (normalsHash[hash] !== undefined) {
        //     return normalsHash[hash];
        //   }
        //   normalsHash[hash] = normals.length / 3;
        //   normals.push(normal.x, normal.y, normal.z);
        //   return normalsHash[hash];
        // };
        // // TODO: move to helpers?
        // const getColorIndex = (color: Color) => {
        //   const hash = color.r.toString() + color.g.toString() + color.b.toString();
        //   if (colorsHash[hash] !== undefined) {
        //     return colorsHash[hash];
        //   }
        //   colorsHash[hash] = colors.length;
        //   colors.push(color.getHex());
        //   return colorsHash[hash];
        // };
        // // TODO: move to helpers?
        // const getUvIndex = (uv: Vector2) => {
        //   const hash = uv.x.toString() + uv.y.toString();
        //   if (uvsHash[hash] !== undefined) {
        //     return uvsHash[hash];
        //   }
        //   uvsHash[hash] = uvs.length / 2;
        //   uvs.push(uv.x, uv.y);
        //   return uvsHash[hash];
        // };
        data.data = {};
        data.data.vertices = vertices;
        data.data.normals = normals;
        if (colors.length > 0) {
            data.data.colors = colors;
        }
        if (uvs.length > 0) {
            data.data.uvs = [uvs]; // temporal backward compatibility
        }
        data.data.faces = faces;
        return data;
    }
    clone() {
        /*
             // Handle primitives
    
             const parameters = this.parameters;
    
             if ( parameters !== undefined ) {
    
             const values = [];
    
             for ( const key in parameters ) {
    
             values.push( parameters[ key ] );
    
             }
    
             const geometry = Object.create( this.constructor.prototype );
             this.constructor.apply( geometry, values );
             return geometry;
    
             }
    
             return new this.constructor().copy( this );
             */
        // return new Geometry().copy( this ); // BEFORE
        return new Gmetry(this.factory).copy(this);
    }
    copy(source) {
        // reset
        this.vertices = [];
        this.colors = [];
        this.faces = [];
        this.faceVertexUvs = [[]];
        this.morphTargets = [];
        this.morphNormals = [];
        this.skinWeights = [];
        this.skinIndices = [];
        this.lineDistances = [];
        this.boundingBox = null;
        this.boundingSphere = null;
        // name
        this.name = source.name;
        // vertices
        const vertices = source.vertices;
        for (let i = 0, il = vertices.length; i < il; i++) {
            this.vertices.push(vertices[i].clone());
        }
        // colors
        const colors = source.colors;
        for (let i = 0, il = colors.length; i < il; i++) {
            this.colors.push(colors[i].clone());
        }
        // faces
        const faces = source.faces;
        for (let i = 0, il = faces.length; i < il; i++) {
            this.faces.push(faces[i].clone());
        }
        // face vertex uvs
        for (let i = 0, il = source.faceVertexUvs.length; i < il; i++) {
            const faceVertexUvs = source.faceVertexUvs[i];
            if (this.faceVertexUvs[i] === undefined) {
                this.faceVertexUvs[i] = [];
            }
            for (let j = 0, jl = faceVertexUvs.length; j < jl; j++) {
                const uvs = faceVertexUvs[j], uvsCopy = [];
                for (let k = 0, kl = uvs.length; k < kl; k++) {
                    const uv = uvs[k];
                    uvsCopy.push(uv.clone());
                }
                this.faceVertexUvs[i].push(uvsCopy); // TODO: check
            }
        }
        // morph targets
        const morphTargets = source.morphTargets;
        for (let i = 0, il = morphTargets.length; i < il; i++) {
            const morphTarget = {}; // // TODO: check
            morphTarget.name = morphTargets[i].name;
            // vertices
            if (morphTargets[i].vertices !== undefined) {
                morphTarget.vertices = [];
                for (let j = 0, jl = morphTargets[i].vertices.length; j < jl; j++) {
                    morphTarget.vertices.push(morphTargets[i].vertices[j].clone());
                }
            }
            // normals
            if (morphTargets[i].normals !== undefined) {
                morphTarget.normals = [];
                for (let j = 0, jl = morphTargets[i].normals.length; j < jl; j++) {
                    morphTarget.normals.push(morphTargets[i].normals[j].clone());
                }
            }
            this.morphTargets.push(morphTarget);
        }
        // morph normals
        const morphNormals = source.morphNormals;
        for (let i = 0, il = morphNormals.length; i < il; i++) {
            const morphNormal = {};
            // vertex normals
            if (morphNormals[i].vertexNormals !== undefined) {
                morphNormal.vertexNormals = [];
                for (let j = 0, jl = morphNormals[i].vertexNormals.length; j < jl; j++) {
                    const srcVertexNormal = morphNormals[i].vertexNormals[j];
                    // TODO: add type
                    const destVertexNormal = { a: null, b: null, c: null };
                    destVertexNormal.a = srcVertexNormal.a.clone();
                    destVertexNormal.b = srcVertexNormal.b.clone();
                    destVertexNormal.c = srcVertexNormal.c.clone();
                    morphNormal.vertexNormals.push(destVertexNormal);
                }
            }
            // face normals
            if (morphNormals[i].faceNormals !== undefined) {
                morphNormal.faceNormals = [];
                for (let j = 0, jl = morphNormals[i].faceNormals.length; j < jl; j++) {
                    morphNormal.faceNormals.push(morphNormals[i].faceNormals[j].clone());
                }
            }
            this.morphNormals.push(morphNormal);
        }
        // skin weights
        const skinWeights = source.skinWeights;
        for (let i = 0, il = skinWeights.length; i < il; i++) {
            this.skinWeights.push(skinWeights[i].clone());
        }
        // skin indices
        const skinIndices = source.skinIndices;
        for (let i = 0, il = skinIndices.length; i < il; i++) {
            this.skinIndices.push(skinIndices[i].clone());
        }
        // line distances
        const lineDistances = source.lineDistances;
        for (let i = 0, il = lineDistances.length; i < il; i++) {
            this.lineDistances.push(lineDistances[i]);
        }
        // bounding box
        const boundingBox = source.boundingBox;
        if (boundingBox !== null) {
            this.boundingBox = boundingBox.clone();
        }
        // bounding sphere
        const boundingSphere = source.boundingSphere;
        if (boundingSphere !== null) {
            this.boundingSphere = boundingSphere.clone();
        }
        // update flags
        this.elementsNeedUpdate = source.elementsNeedUpdate;
        this.verticesNeedUpdate = source.verticesNeedUpdate;
        this.uvsNeedUpdate = source.uvsNeedUpdate;
        this.normalsNeedUpdate = source.normalsNeedUpdate;
        this.colorsNeedUpdate = source.colorsNeedUpdate;
        this.lineDistancesNeedUpdate = source.lineDistancesNeedUpdate;
        this.groupsNeedUpdate = source.groupsNeedUpdate;
        return this;
    }
    toBufferGeometry() {
        const geometry = new _DirectGeometry__WEBPACK_IMPORTED_MODULE_1__.DirectGeometry(this.factory).fromGeometry(this);
        // TODO: verify
        // const buffergeometry = new BufferGeometry();
        const buffergeometry = this.factory.newBufferGeometry();
        const positions = new Float32Array(geometry.vertices.length * 3);
        // TODO: verfify
        // buffergeometry.setAttribute( 'position', new BufferAttribute( positions, 3 ).copyVector3sArray( geometry.vertices ) );
        buffergeometry.setAttribute("position", this.factory.newBufferAttribute(positions, 3).copyVector3sArray(geometry.vertices));
        if (geometry.normals.length > 0) {
            const normals = new Float32Array(geometry.normals.length * 3);
            // TODO: verfify
            // buffergeometry.setAttribute( 'normal', new BufferAttribute( normals, 3 ).copyVector3sArray( geometry.normals ) );
            buffergeometry.setAttribute("normal", this.factory.newBufferAttribute(normals, 3).copyVector3sArray(geometry.normals));
        }
        if (geometry.colors.length > 0) {
            const colors = new Float32Array(geometry.colors.length * 3);
            // TODO: verfify
            // buffergeometry.setAttribute( 'color', new BufferAttribute( colors, 3 ).copyColorsArray( geometry.colors ) );
            buffergeometry.setAttribute("color", this.factory.newBufferAttribute(colors, 3).copyColorsArray(geometry.colors));
        }
        if (geometry.uvs.length > 0) {
            const uvs = new Float32Array(geometry.uvs.length * 2);
            // TODO: verfify
            // buffergeometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ).copyVector2sArray( geometry.uvs ) );
            buffergeometry.setAttribute("uv", this.factory.newBufferAttribute(uvs, 2).copyVector2sArray(geometry.uvs));
        }
        if (geometry.uvs2.length > 0) {
            const uvs2 = new Float32Array(geometry.uvs2.length * 2);
            // TODO: verfify
            // buffergeometry.setAttribute( 'uv2', new BufferAttribute( uvs2, 2 ).copyVector2sArray( geometry.uvs2 ) );
            buffergeometry.setAttribute("uv2", this.factory.newBufferAttribute(uvs2, 2).copyVector2sArray(geometry.uvs2));
        }
        // groups
        buffergeometry.groups = geometry.groups;
        // morphs
        for (const name in geometry.morphTargets) {
            const array = [];
            const morphTargets = geometry.morphTargets[name];
            for (let i = 0, l = morphTargets.length; i < l; i++) {
                const morphTarget = morphTargets[i];
                // TODO: verify
                // const attribute = new Float32BufferAttribute( morphTarget.data.length * 3, 3 );
                const attribute = this.factory.newFloat32BufferAttribute(morphTarget.data.length * 3, 3);
                attribute.name = morphTarget.name;
                array.push(attribute.copyVector3sArray(morphTarget.data));
            }
            buffergeometry.morphAttributes[name] = array;
        }
        // skinning
        if (geometry.skinIndices.length > 0) {
            const skinIndices = this.factory.newFloat32BufferAttribute(geometry.skinIndices.length * 4, 4);
            buffergeometry.setAttribute("skinIndex", skinIndices.copyVector4sArray(geometry.skinIndices));
        }
        if (geometry.skinWeights.length > 0) {
            const skinWeights = this.factory.newFloat32BufferAttribute(geometry.skinWeights.length * 4, 4);
            buffergeometry.setAttribute("skinWeight", skinWeights.copyVector4sArray(geometry.skinWeights));
        }
        //
        if (geometry.boundingSphere !== null) {
            buffergeometry.boundingSphere = geometry.boundingSphere.clone();
        }
        if (geometry.boundingBox !== null) {
            buffergeometry.boundingBox = geometry.boundingBox.clone();
        }
        return buffergeometry;
    }
    computeTangents() {
        console.error("THREE.Geometry: .computeTangents() has been removed.");
    }
    computeLineDistances() {
        console.error("THREE.Geometry: .computeLineDistances() has been removed. Use THREE.Line.computeLineDistances() instead.");
    }
    applyMatrix(matrix) {
        console.warn("THREE.Geometry: .applyMatrix() has been renamed to .applyMatrix4().");
        return this.applyMatrix4(matrix);
    }
    dispose() {
        // This is not required when used outside of THREE.
        // this.dispatchEvent( { type: 'dispose' } );
    }
    // TODO: can we specify and types for 'object' here?
    static createBufferGeometryFromObject(object, factory) {
        const fact = factory || _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__.DefaultFactory;
        let buffergeometry = fact.newBufferGeometry();
        const geometry = object.geometry;
        if (object.isPoints || object.isLine) {
            const positions = fact.newFloat32BufferAttribute(geometry.vertices.length * 3, 3);
            const colors = fact.newFloat32BufferAttribute(geometry.colors.length * 3, 3);
            buffergeometry.setAttribute("position", positions.copyVector3sArray(geometry.vertices));
            buffergeometry.setAttribute("color", colors.copyColorsArray(geometry.colors));
            if (geometry.lineDistances && geometry.lineDistances.length === geometry.vertices.length) {
                const lineDistances = fact.newFloat32BufferAttribute(geometry.lineDistances.length, 1);
                buffergeometry.setAttribute("lineDistance", lineDistances.copyArray(geometry.lineDistances));
            }
            if (geometry.boundingSphere !== null) {
                buffergeometry.boundingSphere = geometry.boundingSphere.clone();
            }
            if (geometry.boundingBox !== null) {
                buffergeometry.boundingBox = geometry.boundingBox.clone();
            }
        }
        else if (object.isMesh) {
            buffergeometry = geometry.toBufferGeometry();
        }
        return buffergeometry;
    }
}
//# sourceMappingURL=Gmetry.js.map

/***/ }),

/***/ "./node_modules/three-geometry-hellfix/src/esm/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/three-geometry-hellfix/src/esm/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DirectGeometry": () => (/* reexport safe */ _DirectGeometry__WEBPACK_IMPORTED_MODULE_0__.DirectGeometry),
/* harmony export */   "Face3": () => (/* reexport safe */ _Face3__WEBPACK_IMPORTED_MODULE_1__.Face3),
/* harmony export */   "Gmetry": () => (/* reexport safe */ _Gmetry__WEBPACK_IMPORTED_MODULE_2__.Gmetry),
/* harmony export */   "ThreeGeometryHellfix": () => (/* reexport safe */ _mylibrary__WEBPACK_IMPORTED_MODULE_3__.ThreeGeometryHellfix)
/* harmony export */ });
/* harmony import */ var _DirectGeometry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DirectGeometry */ "./node_modules/three-geometry-hellfix/src/esm/DirectGeometry.js");
/* harmony import */ var _Face3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Face3 */ "./node_modules/three-geometry-hellfix/src/esm/Face3.js");
/* harmony import */ var _Gmetry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Gmetry */ "./node_modules/three-geometry-hellfix/src/esm/Gmetry.js");
/* harmony import */ var _mylibrary__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mylibrary */ "./node_modules/three-geometry-hellfix/src/esm/mylibrary.js");




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/three-geometry-hellfix/src/esm/mylibrary.js":
/*!******************************************************************!*\
  !*** ./node_modules/three-geometry-hellfix/src/esm/mylibrary.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ThreeGeometryHellfix": () => (/* binding */ ThreeGeometryHellfix)
/* harmony export */ });
/* harmony import */ var _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DefaultFactory */ "./node_modules/three-geometry-hellfix/src/esm/DefaultFactory.js");
/* harmony import */ var _DirectGeometry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DirectGeometry */ "./node_modules/three-geometry-hellfix/src/esm/DirectGeometry.js");
/* harmony import */ var _Face3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Face3 */ "./node_modules/three-geometry-hellfix/src/esm/Face3.js");
/* harmony import */ var _Gmetry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Gmetry */ "./node_modules/three-geometry-hellfix/src/esm/Gmetry.js");




const ThreeGeometryHellfix = {
    DirectGeometry: _DirectGeometry__WEBPACK_IMPORTED_MODULE_1__.DirectGeometry,
    Face3: _Face3__WEBPACK_IMPORTED_MODULE_2__.Face3,
    Gmetry: _Gmetry__WEBPACK_IMPORTED_MODULE_3__.Gmetry,
    DefaultFactory: _DefaultFactory__WEBPACK_IMPORTED_MODULE_0__.DefaultFactory
};
//# sourceMappingURL=mylibrary.js.map

/***/ })

}]);
//# sourceMappingURL=threejs-slice-geometry-typescript-vendor.js.map