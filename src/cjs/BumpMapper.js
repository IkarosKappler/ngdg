"use strict";
/**
 * A helper to apply bumpmaps to any rectangular mesh.
 *
 * @author  Ikaros Kappler
 * @date    2021-09-06
 * @modified 2022-02-22 Replaced Gmetry by ThreeGeometryHellfix.Gmetry.
 * @version 1.0.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BumpMapper = void 0;
var THREE = require("three");
var computeVertexNormals_1 = require("./computeVertexNormals");
var GeometryGenerationHelpers_1 = require("./GeometryGenerationHelpers");
var three_geometry_hellfix_1 = require("three-geometry-hellfix");
exports.BumpMapper = {
    applyBumpmap: function (dildoGeometry, bufferedGeometry, bumpmap, material, options) {
        var collectedVertexNormals = (0, computeVertexNormals_1.computeVertexNormals)(dildoGeometry, bufferedGeometry);
        var dildoNormalGeometry = new three_geometry_hellfix_1.Gmetry();
        dildoNormalGeometry.vertices = collectedVertexNormals.map(function (normalLine) {
            var endPoint = normalLine.end.clone();
            GeometryGenerationHelpers_1.GeometryGenerationHelpers.normalizeVectorXYZ(normalLine.start, endPoint, options.bumpmapStrength);
            return endPoint;
        });
        var dildoNormalsMesh = new THREE.Points(dildoNormalGeometry.toBufferGeometry(), new THREE.PointsMaterial({
            size: 1.4,
            color: 0x00ffff
        }));
        // if (options.showBumpmapTargets) {
        //   dildoNormalsMesh.position.y = -100;
        //   this.addMesh(dildoNormalsMesh);
        // }
        var dildoMesh = null;
        console.log("options.useBumpmap", options.useBumpmap, "bumpmap", bumpmap);
        // const heightMap = createHeightMapFromImage( bumpmapTexture ):
        if (options.useBumpmap && bumpmap) {
            for (var y = 0; y < dildoGeometry.vertexMatrix.length; y++) {
                for (var x = 0; x < dildoGeometry.vertexMatrix[y].length; x++) {
                    var vertIndex = dildoGeometry.vertexMatrix[y][x];
                    var vertex = dildoGeometry.vertices[vertIndex];
                    var yRatio = 1.0 - y / (dildoGeometry.vertexMatrix.length - 1);
                    var xRatio = x / (dildoGeometry.vertexMatrix[y].length - 1);
                    var lerpFactor = bumpmap.getHeightAt(xRatio, yRatio);
                    var lerpTarget = dildoNormalGeometry.vertices[vertIndex];
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
            bufferedGeometry = dildoGeometry.toBufferGeometry();
            bufferedGeometry.computeVertexNormals();
            // Override the mesh! (bumpmap has been applied)
            dildoMesh = new THREE.Mesh(bufferedGeometry, material);
        }
        return { dildoMesh: dildoMesh, dildoNormalsMesh: dildoNormalsMesh };
    }
};
//# sourceMappingURL=BumpMapper.js.map