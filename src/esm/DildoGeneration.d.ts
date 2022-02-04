/**
 * A class to manage 3d scenes and the generation of dildo models.
 *
 * @author   Ikaros Kappler
 * @date     2020-07-01
 * @modified 2020-09-11 Added proper texture loading.
 * @modified 2021-06-07 Fixing `removeCachedGeometries`. Adding bending of model.
 * @modified 2021-08-29 Ported this class to Typescript from vanilla JS.
 * @modified 2022-02-03 Added `clearResults` function.
 * @version  1.2.2
 **/
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { DildoGenerationOptions, DildoOptions, ExportOptions, ExtendedDildoOptions, IDildoGeneration, IDildoGeometry } from "./interfaces";
export declare class DildoGeneration implements IDildoGeneration {
    /**
     * @member {HTMLCanvasElement} canvas
     * @memberof DildoGeneration
     *
     */
    canvas: HTMLCanvasElement;
    parent: HTMLElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    ambientLightA: THREE.Light;
    ambientLightB: THREE.Light;
    directionalLightA: THREE.DirectionalLight;
    directionalLightB: THREE.DirectionalLight;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    geometries: Array<THREE.Object3D>;
    partialResults: Record<string, object>;
    splitResults: Record<string, THREE.Mesh>;
    constructor(canvasId: string, options: DildoGenerationOptions);
    /**
     * Resize the 3d canvas to fit its container.
     */
    resizeCanvas(): void;
    /**
     * Clears the current scene and rebuilds everything from scratch according to the
     * mesh options being passed.
     *
     * @param {BezierPath} options.outline
     * @param {number}     options.segmentCount
     * @param {number}     options.outlineSegmentCount (>= 2).
     * @param {number}     options.bendAngle The bending angle in degrees (!).
     * @param {boolean}    options.performSlice
     * @param {boolean?}   options.useTextureImage
     * @param {string?}    options.textureImagePath
     * @param {boolean?}   options.wireframe
     * @param {string}     options.renderFaces - "double" or "front" (default) or "back"
     **/
    rebuild(options: ExtendedDildoOptions): void;
    /**
     * Perform the actual slice operation.
     *
     * This will create several new meshes:
     *  * a left geometry slice (along the z- axis).
     *  * a right geometry slice (along the z+ axis).
     *  * an inner slice cut geometry (inside the dildo model, cutting it into two halves).
     *  * an outer slice cut geometry (inside the mould model, cutting that one into two halves).
     *
     * These will always be generated, even if the options tell different; if so then they are set
     * to be invisible.
     *
     * @param {THREE.Geometry} latheMesh - The buffered dildo geometry (required to perform the slice operation).
     * @param {DildoGeometry} latheUnbufferedGeometry - The unbuffered dildo geometry (required to obtain the perpendicular path lines).
     * @param {boolean} wireframe
     */
    __performPlaneSlice(latheMesh: THREE.Mesh, latheUnbufferedGeometry: IDildoGeometry, wireframe: boolean, useTextureImage: boolean, textureImagePath: string, options: DildoOptions): void;
    /**
     * Add a mesh to the underlying scene.
     *
     * The function will make some modifications to the rotation of the meshes.
     * @param {THREE.Mesh} mesh
     */
    addMesh(mesh: any): void;
    removeCachedGeometries(): void;
    clearResults(): void;
    /**
     * Generate an STL string from the (exportable) meshes that are currently stored inside this generator.
     *
     * @param {function(string)} options.onComplete
     **/
    generateSTL(options: ExportOptions, exporter: STLExporter): void;
}
