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
import { computeVertexNormals } from "./computeVertexNormals";
import { GeometryGenerationHelpers } from "./GeometryGenerationHelpers";
import { DildoOptions, IBumpmap } from "./interfaces";
import { Gmetry } from "three-geometry-hellfix";
import { DildoGeometry } from "./DildoGeometry";

export const BumpMapper = {
  applyBumpmap: (
    dildoGeometry: DildoGeometry,
    bufferedGeometry: THREE.BufferGeometry,
    bumpmap: IBumpmap,
    material: THREE.Material,
    options: DildoOptions
  ) => {
    const collectedVertexNormals: Array<THREE.Line3> = computeVertexNormals(dildoGeometry as unknown as Gmetry, bufferedGeometry);
    const dildoNormalGeometry = new Gmetry();
    dildoNormalGeometry.vertices = collectedVertexNormals.map((normalLine: THREE.Line3) => {
      const endPoint: THREE.Vector3 = normalLine.end.clone();
      GeometryGenerationHelpers.normalizeVectorXYZ(normalLine.start, endPoint, options.bumpmapStrength);
      return endPoint;
    });
    const dildoNormalsMesh: THREE.Points = new THREE.Points(
      dildoNormalGeometry.toBufferGeometry(),
      new THREE.PointsMaterial({
        size: 1.4,
        color: 0x00ffff
      })
    );
    // if (options.showBumpmapTargets) {
    //   dildoNormalsMesh.position.y = -100;
    //   this.addMesh(dildoNormalsMesh);
    // }

    let dildoMesh: THREE.Mesh | undefined = null;

    console.log("options.useBumpmap", options.useBumpmap, "bumpmap", bumpmap);
    // const heightMap = createHeightMapFromImage( bumpmapTexture ):
    if (options.useBumpmap && bumpmap) {
      for (var y = 0; y < dildoGeometry.vertexMatrix.length; y++) {
        for (var x = 0; x < dildoGeometry.vertexMatrix[y].length; x++) {
          const vertIndex: number = dildoGeometry.vertexMatrix[y][x];
          const vertex: THREE.Vector3 = dildoGeometry.vertices[vertIndex];
          const yRatio: number = 1.0 - y / (dildoGeometry.vertexMatrix.length - 1);
          const xRatio: number = x / (dildoGeometry.vertexMatrix[y].length - 1);
          const lerpFactor: number = bumpmap.getHeightAt(xRatio, yRatio);
          const lerpTarget: THREE.Vector3 = dildoNormalGeometry.vertices[vertIndex];
          vertex.lerp(lerpTarget, lerpFactor);
        }
      }

      // Also lerp top point
      //   const vertIndex: number = dildoGeometry.topIndex;
      //   //   const vertIndex: number = dildoGeometry.vertexMatrix[dildoGeometry.vertexMatrix.length - 1][0];
      //   const vertex: THREE.Vector3 = dildoGeometry.vertices[vertIndex];
      //   const yRatio: number = 0.0;
      //   const xRatio: number = 0.5;
      //   const lerpFactor: number = bumpmap.getHeightAt(xRatio, yRatio);
      //   const lerpTarget: THREE.Vector3 = dildoNormalGeometry.vertices[vertIndex];
      //   vertex.lerp(lerpTarget, lerpFactor);

      // Override the buffered geometry! (bumpmap has been applied)
      // TODO: verify correctness with Gmery
      // bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry as unknown as Gmetry);
      bufferedGeometry = (dildoGeometry as unknown as Gmetry).toBufferGeometry();
      bufferedGeometry.computeVertexNormals();
      // Override the mesh! (bumpmap has been applied)
      dildoMesh = new THREE.Mesh(bufferedGeometry, material);
    }

    return { dildoMesh, dildoNormalsMesh };
  }
};
