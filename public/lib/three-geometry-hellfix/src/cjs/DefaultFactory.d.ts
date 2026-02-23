/**
 * The default factory to connect to your three library.
 *
 * @author  Ikaros Kappler
 * @date    2022-02-20
 * @version 1.0.0
 */
export declare const DefaultFactory: {
    newVector2: (x?: number, y?: number) => import("three").Vector2;
    newVector3: (x?: number, y?: number, z?: number) => import("three").Vector3;
    newMatrix3: () => import("three").Matrix3;
    newMatrix4: () => import("three").Matrix4;
    newObject3D: () => import("three").Object3D<import("three").Event>;
    newBox3: () => import("three").Box3;
    newSphere: () => import("three").Sphere;
    newBufferGeometry: () => import("three").BufferGeometry;
    generateUUID: () => string;
    newFloat32BufferAttribute: (array: number | Iterable<number> | ArrayLike<number> | ArrayBuffer, itemSize: number, normalized?: boolean) => import("three").Float32BufferAttribute;
    newColor: () => import("three").Color;
    newBufferAttribute: (array: ArrayLike<number>, itemSize: number, normalized?: boolean) => import("three").BufferAttribute;
};
