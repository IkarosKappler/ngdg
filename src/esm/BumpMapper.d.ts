/**
 * A helper to apply bumpmaps to any rectangular mesh.
 *
 * @author  Ikaros Kappler
 * @date    2021-09-06
 * @modified 2022-02-22 Replaced Gmetry by ThreeGeometryHellfix.Gmetry.
 * @version 1.0.1
 */
import * as THREE from "three";
import { DildoOptions, IBumpmap, IDildoGeometry } from "./interfaces";
export declare const BumpMapper: {
    applyBumpmap: (dildoGeometry: IDildoGeometry, bufferedGeometry: THREE.BufferGeometry, bumpmap: IBumpmap, material: THREE.Material, options: DildoOptions) => {
        dildoMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
        dildoNormalsMesh: THREE.Points<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    };
};
