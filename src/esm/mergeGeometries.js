/**
 * Merge one geometry (all vertices and faces) into the other.
 *
 * @require locateVertexInArray
 *
 * @author   Ikaros Kappler
 * @date     2021-07-26
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @version  1.0.0
 */
import * as THREE from "three";
// import { Geometry, Face3 } from "three/examples/jsm/deprecated/Geometry";
import { locateVertexInArray } from "./locateVertexInArray";
const EPS = 0.000001;
// import { EPS } from "./constants";
/**
 * This function tries to merge the 'mergeGeometry' into the 'baseGeometry'.
 * It assumes that both geometries are somehow connected, so it will try to
 * local equal vertices first instead of just copying all 'mergeGeometry' vertices
 * into the other one.
 *
 * The merged vertices will be cloned.
 *
 * @param {THREE.Geometry} baseGeometry
 * @param {THREE.Geometry} mergeGeometry
 */
export const mergeGeometries = (baseGeometry, mergeGeometry, epsilon) => {
    if (typeof epsilon === "undefined") {
        epsilon = EPS;
    }
    var vertexMap = mergeAndMapVertices(baseGeometry, mergeGeometry, epsilon);
    for (var f = 0; f < mergeGeometry.faces.length; f++) {
        var face = mergeGeometry.faces[f];
        var a = vertexMap[face.a];
        var b = vertexMap[face.b];
        var c = vertexMap[face.c];
        // baseGeometry.faces.push(new THREE.Face3(a, b, c));
        // TODO: how to use this here?
        // Face3 is not a constructor!!! Just a type!!!
        baseGeometry.faces.push(new THREE.Face3(a, b, c));
        if (mergeGeometry.faceVertexUvs.length > 0 && f < mergeGeometry.faceVertexUvs[0].length) {
            var uvData = mergeGeometry.faceVertexUvs[0][f]; // [Vector2,Vector2,Vector2]
            baseGeometry.faceVertexUvs[0].push([uvData[0].clone(), uvData[1].clone(), uvData[2].clone()]);
        }
        else {
            baseGeometry.faceVertexUvs[0].push([new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.0, 1.0), new THREE.Vector2(1.0, 0.5)]);
        }
    }
};
/**
 * This function merges the vertices from a given geometry into a base geometry.
 * It will ty to locate existing vertices within an epsilon range and keep those. Vertices that
 * have no close existing counterpart in the base geometry will be added.
 *
 * The function returns a mapping of new/merged vertices inside the base geometry, showing
 * which vertex (index) was mapped whereto.
 *
 * @param {THREE-Geometry} baseGeometry
 * @param {THREE-Geometry} mergeGeometry
 * @param {number} epsilon
 * @returns Array<number>
 */
export const mergeAndMapVertices = (baseGeometry, mergeGeometry, epsilon) => {
    const vertexMap = [];
    for (var v = 0; v < mergeGeometry.vertices.length; v++) {
        const mergeVert = mergeGeometry.vertices[v];
        const indexInBase = locateVertexInArray(baseGeometry.vertices, mergeVert, epsilon);
        if (indexInBase === -1) {
            // The current vertex cannot be found in the base geometry.
            //  -> add to geometry and remember new index.
            vertexMap.push(baseGeometry.vertices.length);
            baseGeometry.vertices.push(mergeVert.clone());
        }
        else {
            vertexMap.push(indexInBase);
        }
    }
    return vertexMap;
};
//# sourceMappingURL=mergeGeometries.js.map