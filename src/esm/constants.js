/**
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-08-30
 */
export const EPS = 0.000001;
export const DEG_TO_RAD = Math.PI / 180.0;
// Note: z and -z will be used for left and right split.
export const SPLIT_MESH_OFFSET = { x: 0, y: -100, z: -50 };
export const KEY_LEFT_SLICE_GEOMETRY = "KEY_LEFT_SLICE_GEOMETRY"; // THREE.Geometry
export const KEY_RIGHT_SLICE_GEOMETRY = "KEY_RIGHT_SLICE_GEOMETRY"; // THREE.Geometry
export const KEY_LEFT_SLICE_PLANE = "KEY_LEFT_SLICE_PLANE"; // THREE.Plane
export const KEY_RIGHT_SLICE_PLANE = "KEY_RIGHT_SLICE_PLANE"; // THREE.Plane
export const KEY_SPLIT_PANE_MESH = "KEY_SPLIT_PANE_MESH"; // THREE.Mesh
export const KEY_PLANE_INTERSECTION_POINTS = "KEY_PLANE_INTERSECTION_POINTS"; // Array<Vector3>
export const KEY_PLANE_INTERSECTION_TRIANGULATION = "KEY_PLANE_INTERSECTION_TRIANGULATION"; // THREE.Geometry
export const KEY_SPLIT_TRIANGULATION_GEOMETRIES = "KEY_SPLIT_TRIANGULATION_GEOMETRIES"; // Array<THREE.Geometry>
export const KEY_SLICED_MESH_RIGHT = "KEY_SLICED_MESH_RIGHT"; // THREE.Mesh
export const KEY_SLICED_MESH_LEFT = "KEY_SLICED_MESH_LEFT"; // THREE.Mesh
//# sourceMappingURL=constants.js.map