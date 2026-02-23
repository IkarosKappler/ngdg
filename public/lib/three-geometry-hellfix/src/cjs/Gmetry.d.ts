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
import { Box3, BufferGeometry, Color, Matrix4, Sphere, Vector2, Vector3, Vector4 } from "three";
import { Face3 } from "./Face3";
import { MorphNormal, MorphTarget, ThreeFactory } from "./interfaces";
export declare class Gmetry {
    uuid: string;
    name: string;
    type: string;
    vertices: Array<Vector3>;
    colors: Array<Color>;
    faces: Array<Face3>;
    faceVertexUvs: Array<Array<[Vector2, Vector2, Vector2]>>;
    morphTargets: Array<MorphTarget>;
    morphNormals: Array<MorphNormal>;
    skinWeights: Array<Vector4>;
    skinIndices: Array<Vector4>;
    lineDistances: Array<number>;
    boundingBox: Box3;
    boundingSphere: Sphere;
    elementsNeedUpdate: boolean;
    verticesNeedUpdate: boolean;
    uvsNeedUpdate: boolean;
    normalsNeedUpdate: boolean;
    colorsNeedUpdate: boolean;
    lineDistancesNeedUpdate: boolean;
    groupsNeedUpdate: boolean;
    parameters: object;
    isGeometry: boolean;
    private factory;
    private _m1;
    private _obj;
    private _offset;
    /**
     * Construct a new Gmetry.
     *
     * @param {ThreeFactory?} factory - Specify a custom factory if you do not want to use the DefaultFactory.
     */
    constructor(factory?: ThreeFactory);
    applyMatrix4(matrix: Matrix4): Gmetry;
    rotateX(angle: number): Gmetry;
    rotateY(angle: number): Gmetry;
    rotateZ(angle: number): Gmetry;
    translate(x: number, y: number, z: number): Gmetry;
    scale(x: number, y: number, z: number): Gmetry;
    lookAt(vector: Vector3): Gmetry;
    fromBufferGeometry(geometry: BufferGeometry): this;
    center(): Gmetry;
    normalize(): Gmetry;
    computeFaceNormals(): void;
    computeVertexNormals(areaWeighted?: boolean): void;
    computeFlatVertexNormals(): void;
    computeMorphNormals(): void;
    computeBoundingBox(): void;
    computeBoundingSphere(): void;
    merge(geometry: Gmetry, matrix: Matrix4, materialIndexOffset?: number): void;
    mergeMesh(mesh: any): void;
    mergeVertices(precisionPoints?: number): number;
    setFromPoints(points: Array<Vector2 | Vector3>): Gmetry;
    sortFacesByMaterialIndex(): void;
    toJSON(): {
        metadata: {
            version: number;
            type: string;
            generator: string;
        };
        uuid: any;
        type: any;
        name: any;
        data: any;
    };
    clone(): Gmetry;
    copy(source: Gmetry): this;
    toBufferGeometry(): BufferGeometry;
    computeTangents(): void;
    computeLineDistances(): void;
    applyMatrix(matrix: any): Gmetry;
    dispose(): void;
    static createBufferGeometryFromObject(object: any, factory?: ThreeFactory): BufferGeometry;
}
