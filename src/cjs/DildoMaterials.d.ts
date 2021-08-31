/**
 * A collection of materials and material making functions.
 *
 * @require THREE
 *
 * @author Ikaros Kappler
 * @date 2021-07-02
 * @modified 2021-08-04 Ported to Typescript from vanilla JS.
 * @version 1.0.1
 */
import * as THREE from "three";
export declare const DildoMaterials: {
    /**
     * Create a new mesh material from the given parameters.
     *
     * @param {boolean} useTextureImage - Load and use the given texture (at `textureImagePath`) if set to true.
     * @param {boolean} wireframe - Create a wireframe material if true.
     * @param {string} textureImagePath - The texture path to use (if useTextureImage is set to true).
     * @param {THREE.DoubleSide|THREE.FrontSide|THREE.Backside} doubleSingleSide - Wether to display one one or both face sides.
     * @returns
     */
    createMainMaterial: (useTextureImage: boolean, wireframe: boolean, textureImagePath: string, doubleSingleSide: number) => THREE.Material;
    createSliceMaterial: (useTextureImage: boolean, wireframe: boolean, textureImagePath: string) => THREE.Material;
    /**
     * Load a texture or get it from the internal buffer if it was already loaded before.
     *
     * @param {string} path - The path (absolute or relative) to the texture image to load.
     * @returns {THREE.Texture}
     */
    loadTextureImage: (path: string) => THREE.Texture;
};
