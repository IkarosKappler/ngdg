/**
 * UV coordinate helper functions.
 *
 * @author   Ikaros Kappler
 * @date     2021-08-03
 * @modified 2021-08-04 Ported to Typsescript from vanilla JS.
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version  1.0.2
 */
import * as THREE from "three";
import { Bounds, Vertex } from "plotboilerplate";
export const UVHelpers = {
    /**
     * Helper function to create triangular UV Mappings for a triangle. The passed shape bounds
     * will be used as reference rectangle.
     *
     * Not that the bounds should contain all triangle vertices; otherwise the generated
     * UV coordinated will be out of bounds (less than 0.0 or larger than 1.0) and might not be
     * rendered properly.
     *
     * The new UV coordinates will be added to the end of the geometry's `faceVertexUvs` array.
     *
     * @param {ThreeGeometryHellfix.Gmetry} geometry - The base geometry to add the UV coordinates to.
     * @param {Bounds} shapeBounds - The reference bounds.
     * @param {number} vertIndexA - The triangle's first index in the geometry's vertices array.
     * @param {number} vertIndexB - The triangle's second index in the geometry's vertices array.
     * @param {number} vertIndexC - The triangle's third index in the geometry's vertices array.
     */
    makeFlatTriangleUVs: (geometry, shapeBounds, vertIndexA, vertIndexB, vertIndexC) => {
        var vertA = geometry.vertices[vertIndexA];
        var vertB = geometry.vertices[vertIndexB];
        var vertC = geometry.vertices[vertIndexC];
        // Convert a position vertex { x, y, * } to UV coordinates { u, v }
        var getUVRatios = (vert) => {
            return new THREE.Vector2((vert.x - shapeBounds.min.x) / shapeBounds.width, (vert.y - shapeBounds.min.y) / shapeBounds.height);
        };
        geometry.faceVertexUvs[0].push([getUVRatios(vertA), getUVRatios(vertB), getUVRatios(vertC)]);
    },
    /**
     *
     * @param {ThreeGeometryHellfix.Gmetry} thisGeometry
     * @param {Array<number>} containingPolygonIndices
     * @param {Array<[number,number,number]>} triangles
     */
    makeHollowBottomUVs: (thisGeometry, containingPolygonIndices, triangles) => {
        // Compute polyon bounds
        var polygonBounds = Bounds.computeFromVertices(containingPolygonIndices.map(function (vertIndex) {
            return new Vertex(thisGeometry.vertices[vertIndex].x, thisGeometry.vertices[vertIndex].z);
        }));
        var getUVRatios = function (vert) {
            return new THREE.Vector2((vert.x - polygonBounds.min.x) / polygonBounds.width, (vert.z - polygonBounds.min.y) / polygonBounds.height);
        };
        // ON the x-z-plane {x, *, z}
        for (var t = 0; t < triangles.length; t++) {
            var vertA = thisGeometry.vertices[triangles[t][0]];
            var vertB = thisGeometry.vertices[triangles[t][1]];
            var vertC = thisGeometry.vertices[triangles[t][2]];
            thisGeometry.faceVertexUvs[0].push([getUVRatios(vertA), getUVRatios(vertB), getUVRatios(vertC)]);
        }
    }
};
//# sourceMappingURL=UVHelpers.js.map