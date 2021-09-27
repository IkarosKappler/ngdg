/**
 * A helper to apply bumpmaps to any rectangular mesh.
 *
 * @author  Ikaros Kappler
 * @date    2021-09-06
 * @version 1.0.0
 */
import * as THREE from "three";
import { computeVertexNormals } from "./computeVertexNormals";
import { GeometryGenerationHelpers } from "./GeometryGenerationHelpers";
export const BumpMapper = {
    applyBumpmap: (dildoGeometry, bufferedGeometry, bumpmap, material, options) => {
        const collectedVertexNormals = computeVertexNormals(dildoGeometry, bufferedGeometry);
        const dildoNormalGeometry = new THREE.Geometry();
        dildoNormalGeometry.vertices = collectedVertexNormals.map((normalLine) => {
            const endPoint = normalLine.end.clone();
            GeometryGenerationHelpers.normalizeVectorXYZ(normalLine.start, endPoint, options.bumpmapStrength);
            return endPoint;
        });
        const dildoNormalsMesh = new THREE.Points(dildoNormalGeometry, new THREE.PointsMaterial({
            size: 1.4,
            color: 0x00ffff
        }));
        // if (options.showBumpmapTargets) {
        //   dildoNormalsMesh.position.y = -100;
        //   this.addMesh(dildoNormalsMesh);
        // }
        let dildoMesh = null;
        console.log("options.useBumpmap", options.useBumpmap, "bumpmap", bumpmap);
        // const heightMap = createHeightMapFromImage( bumpmapTexture ):
        if (options.useBumpmap && bumpmap) {
            for (var y = 0; y < dildoGeometry.vertexMatrix.length; y++) {
                for (var x = 0; x < dildoGeometry.vertexMatrix[y].length; x++) {
                    const vertIndex = dildoGeometry.vertexMatrix[y][x];
                    const vertex = dildoGeometry.vertices[vertIndex];
                    const yRatio = 1.0 - y / (dildoGeometry.vertexMatrix.length - 1);
                    const xRatio = x / (dildoGeometry.vertexMatrix[y].length - 1);
                    const lerpFactor = bumpmap.getHeightAt(xRatio, yRatio);
                    const lerpTarget = dildoNormalGeometry.vertices[vertIndex];
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
            bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry);
            bufferedGeometry.computeVertexNormals();
            // Override the mesh! (bumpmap has been applied)
            dildoMesh = new THREE.Mesh(bufferedGeometry, material);
        }
        return { dildoMesh, dildoNormalsMesh };
    }
};
//# sourceMappingURL=BumpMapper.js.map