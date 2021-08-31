/**
 * @author   Ikaros Kappler
 * @date     2021-08-03
 * @modified 2021-08-04 Ported to Typsescript from vanilla JS.
 * @version  1.0.1
 */

import * as THREE from "three";
import { Bounds } from "plotboilerplate";
import { DildoBaseClass } from "./DildoGeometry";

export const UVHelpers = {
  /**
   * Helper function to create triangular UV Mappings for a triangle.
   *
   * @param {THREE.Geometry} thisGeometry
   * @param {Bounds} shapeBounds
   * @param {number} vertIndexA - The index in the geometry's vertices array.
   * @param {number} vertIndexB - ...
   * @param {number} vertIndexC - ...
   */
  makeFlatTriangleUVs: (
    thisGeometry: THREE.Geometry | DildoBaseClass, // THREE.Geometry does not longer exist since r125 and will be replaced by BufferGeometry
    shapeBounds: Bounds,
    vertIndexA: number,
    vertIndexB: number,
    vertIndexC: number
  ): void => {
    var vertA = thisGeometry.vertices[vertIndexA];
    var vertB = thisGeometry.vertices[vertIndexB];
    var vertC = thisGeometry.vertices[vertIndexC];
    // Convert a position vertex { x, y, * } to UV coordinates { u, v }
    var getUVRatios = (vert: THREE.Vector3) => {
      return new THREE.Vector2(
        (vert.x - shapeBounds.min.x) / shapeBounds.width,
        (vert.y - shapeBounds.min.y) / shapeBounds.height
      );
    };
    thisGeometry.faceVertexUvs[0].push([getUVRatios(vertA), getUVRatios(vertB), getUVRatios(vertC)]);
  }
};
