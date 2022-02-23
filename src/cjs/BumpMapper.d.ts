/**
 * A helper to apply bumpmaps to any rectangular mesh.
 *
 * Currently not in use because it's buggy.
 *
 * @author   Ikaros Kappler
 * @date     2021-09-06
 * @modified 2022-02-22 Replaced Gmetry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.1
 */
import * as THREE from "three";
import { DildoOptions, IBumpmap } from "./interfaces";
import { DildoGeometry } from "./DildoGeometry";
export declare const BumpMapper: {
    applyBumpmap: (dildoGeometry: DildoGeometry, bufferedGeometry: THREE.BufferGeometry, bumpmap: IBumpmap, material: THREE.Material, options: DildoOptions) => {
        dildoMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
        dildoNormalsMesh: THREE.Points<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    };
};
