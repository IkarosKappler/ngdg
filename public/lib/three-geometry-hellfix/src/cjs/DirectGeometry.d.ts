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
import { Box3, Color, Sphere, Vector2, Vector3 } from "three";
import { Gmetry } from ".";
import { Group, ThreeFactory } from "./interfaces";
export declare class DirectGeometry {
    vertices: Array<Vector3>;
    normals: Array<Vector3>;
    colors: Array<Color>;
    uvs: Array<Vector2>;
    uvs2: Array<Vector2>;
    groups: Array<Group>;
    morphTargets: {
        position: Vector3;
        normal: Vector3;
    };
    skinWeights: Array<any>;
    skinIndices: Array<any>;
    boundingBox: Box3;
    boundingSphere: Sphere;
    verticesNeedUpdate: boolean;
    normalsNeedUpdate: boolean;
    colorsNeedUpdate: boolean;
    uvsNeedUpdate: boolean;
    groupsNeedUpdate: boolean;
    private factory;
    constructor(factory: ThreeFactory);
    computeGroups(geometry: Gmetry): void;
    fromGeometry(geometry: Gmetry): this;
}
