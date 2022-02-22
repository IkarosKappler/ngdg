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
import { ThreeFactory } from "./interfaces";
export declare class Face3 {
    a: number;
    b: number;
    c: number;
    normal: THREE.Vector3;
    vertexNormals: Array<THREE.Vector3>;
    color: THREE.Color;
    vertexColors: Array<THREE.Color>;
    materialIndex: number;
    __originalFaceNormal: Vector3;
    __originalVertexNormals: Array<Vector3>;
    _id: any;
    constructor(a: number, b: number, c: number, normal?: Vector3 | Array<Vector3>, color?: Array<Color> | string | number | Color, materialIndex?: number, factory?: ThreeFactory);
    clone(): Face3;
    copy(source: Face3): Face3;
}
