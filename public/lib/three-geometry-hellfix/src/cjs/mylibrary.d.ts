import { DirectGeometry } from "./DirectGeometry";
import { Face3 } from "./Face3";
import { Gmetry } from "./Gmetry";
export declare const ThreeGeometryHellfix: {
    DirectGeometry: typeof DirectGeometry;
    Face3: typeof Face3;
    Gmetry: typeof Gmetry;
    DefaultFactory: {
        newVector2: (x?: number, y?: number) => import("three").Vector2;
        newVector3: (x?: number, y?: number, z?: number) => import("three").Vector3;
        newMatrix3: () => import("three").Matrix3;
        newMatrix4: () => import("three").Matrix4;
        newObject3D: () => import("three").Object3D<import("three").Event>;
        newBox3: () => import("three").Box3;
        newSphere: () => import("three").Sphere;
        newBufferGeometry: () => import("three").BufferGeometry;
        generateUUID: () => string;
        newFloat32BufferAttribute: (array: number | ArrayBuffer | ArrayLike<number> | Iterable<number>, itemSize: number, normalized?: boolean) => import("three").Float32BufferAttribute;
        newColor: () => import("three").Color;
        newBufferAttribute: (array: ArrayLike<number>, itemSize: number, normalized?: boolean) => import("three").BufferAttribute;
    };
};
