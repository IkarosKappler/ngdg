import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Matrix3,
  Matrix4,
  Object3D,
  Sphere,
  Vector2,
  Vector3
} from "three";

export interface VertexNormals {
  a: Vector3;
  b: Vector3;
  c: Vector3;
}

export interface Group {
  start: number;
  materialIndex?: number;
  count: number;
}

export interface MorphTarget {
  name: string;
  vertices: Array<Vector3>;
  normals: Array<Vector3>;
}

export interface MorphNormal {
  vertexNormals: VertexNormals[];
  faceNormals: Array<Vector3>;
  name: string;
}

// Custom interfaces
export interface ThreeFactory {
  newVector2(x?: number, y?: number): Vector2;
  newVector3(x?: number, y?: number, z?: number): Vector3;
  newMatrix3(): Matrix3;
  newMatrix4(): Matrix4;
  newObject3D(): Object3D;
  newBox3(): Box3;
  newSphere(): Sphere;
  newBufferGeometry(): BufferGeometry;
  generateUUID(): string;
  newFloat32BufferAttribute(
    array: number | Iterable<number> | ArrayLike<number> | ArrayBuffer,
    itemSize: number,
    normalized?: boolean
  ): Float32BufferAttribute;
  newColor(): Color;
  newBufferAttribute(array: ArrayLike<number>, itemSize: number, normalized?: boolean): BufferAttribute;
}

// export type Vector2Triplet = [Vector2, Vector2, Vector2];
