"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Face3 = void 0;
var DefaultFactory_1 = require("./DefaultFactory");
var Face3 = /** @class */ (function () {
    function Face3(a, b, c, normal, color, materialIndex, factory) {
        if (materialIndex === void 0) { materialIndex = 0; }
        var fact = factory || DefaultFactory_1.DefaultFactory;
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
    Face3.prototype.clone = function () {
        // TODO: check if new expression is correct
        // return new this.constructor().copy( this );
        return new Face3(this.a, this.b, this.c, this.normal.clone(), this.color.clone(), this.materialIndex).copy(this);
    };
    Face3.prototype.copy = function (source) {
        this.a = source.a;
        this.b = source.b;
        this.c = source.c;
        this.normal.copy(source.normal);
        this.color.copy(source.color);
        this.materialIndex = source.materialIndex;
        for (var i = 0, il = source.vertexNormals.length; i < il; i++) {
            this.vertexNormals[i] = source.vertexNormals[i].clone();
        }
        for (var i = 0, il = source.vertexColors.length; i < il; i++) {
            this.vertexColors[i] = source.vertexColors[i].clone();
        }
        return this;
    };
    return Face3;
}());
exports.Face3 = Face3;
//# sourceMappingURL=Face3.js.map