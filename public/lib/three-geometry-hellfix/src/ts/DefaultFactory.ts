/**
 * The default factory to connect to your three library.
 * 
 * @author  Ikaros Kappler
 * @date    2022-02-20
 * @version 1.0.0
 */

export const DefaultFactory = {
    newVector2 : (x?:number, y?:number) => { return new window["THREE"].Vector2(x,y); },
    newVector3 : (x?:number, y?:number, z?:number) => { return new window["THREE"].Vector3(x,y,z); },
    newMatrix3 : () => { return new window["THREE"].Matrix3(); },
    newMatrix4 : () => { return new window["THREE"].Matrix4(); },
    newObject3D : () => { return new window["THREE"].Object3D(); },
    newBox3 : () => { return new window["THREE"].Box3(); },
    newSphere : () => { return new window["THREE"].Sphere(); },
    newBufferGeometry : () => { return new window["THREE"].BufferGeometry(); },
    generateUUID: () => { return window["THREE"].MathUtils.generateUUID(); },
    newFloat32BufferAttribute : (array: number | Iterable<number> | ArrayLike<number> | ArrayBuffer, itemSize: number, normalized?: boolean) => { return new window["THREE"].Float32BufferAttribute(array,itemSize,normalized); },
    newColor: () => { return new window["THREE"].Color; },
    newBufferAttribute: (array: ArrayLike<number>, itemSize: number, normalized?: boolean) => { return new window["THREE"].BufferAttribute(array,itemSize,normalized );}
 }