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

import { Color, Vector3 } from "three";
import { DefaultFactory } from "./DefaultFactory";
import { ThreeFactory } from "./interfaces";

export class Face3 {
  a: number;
  b: number;
  c: number;
  normal: THREE.Vector3;
  vertexNormals: Array<THREE.Vector3>;
  color: THREE.Color;
  vertexColors: Array<THREE.Color>;
  materialIndex: number;

  // THIS IS USED BY GEOMETRY ... IS THERE A BETTER WAY?
  __originalFaceNormal: Vector3;
  __originalVertexNormals: Array<Vector3>;
  _id: any;

  constructor(
    a: number,
    b: number,
    c: number,
    normal?: Vector3 | Array<Vector3>,
    color?: Array<Color> | string | number | Color,
    materialIndex: number = 0,
    factory?: ThreeFactory
  ) {
    var fact = factory || DefaultFactory;

    this.a = a;
    this.b = b;
    this.c = c;

    // this.normal = ( normal && normal.isVector3 ) ? normal : new THREE.Vector3();
    // this.vertexNormals = Array.isArray( normal ) ? normal : [];
    // TODO: verify correctness
    // this.normal = ( normal && (normal instanceof Vector3 && normal.isVector3) ) ? normal : new Vector3();
    // TODO: use DefaultFactory here
    // this.normal = ( normal && (normal instanceof Vector3 && normal.isVector3) ) ? normal : new (window["THREE"]).Vector3();
    this.normal = normal && (normal as any).isVector3 ? (normal as Vector3) : fact.newVector3();
    this.vertexNormals = Array.isArray(normal) ? normal : [];

    // this.color = ( color && color.isColor ) ? color : new THREE.Color();
    // this.color = ( color && ( color instanceof Color && color.isColor)  ) ? color : new Color(); // TODO: verify correctness
    // TODO: use DefaultFactory here
    this.color = color && (color as any).isColor ? (color as Color) : fact.newColor(); // TODO: verify correctness
    this.vertexColors = Array.isArray(color) ? color : [];

    this.materialIndex = materialIndex;
  }

  clone(): Face3 {
    // TODO: check if new expression is correct
    // return new this.constructor().copy( this );
    return new Face3(this.a, this.b, this.c, this.normal.clone(), this.color.clone(), this.materialIndex).copy(this);
  }

  copy(source: Face3): Face3 {
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
