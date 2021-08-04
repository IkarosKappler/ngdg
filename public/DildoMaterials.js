/**
 * A collection of materials and material making functions.
 *
 * @require THREE
 *
 * @author Ikaros Kappler
 * @date 2021-07-02
 * @version 1.0.0
 */

(function (_context) {
  /**
   * Map<string,texture>
   */
  var textureStore = new Map();

  globalThis.DildoMaterials = {
    /**
     * Create a new mesh material from the given parameters.
     *
     * @param {boolean} useTextureImage - Load and use the given texture (at `textureImagePath`) if set to true.
     * @param {boolean} wireframe - Create a wireframe material if true.
     * @param {string} textureImagePath - The texture path to use (if useTextureImage is set to true).
     * @param {THREE.DoubleSide|THREE.FrontSide|THREE.Backside} doubleSingleSide - Wether to display one one or both face sides.
     * @returns
     */
    createMainMaterial: function (useTextureImage, wireframe, textureImagePath, doubleSingleSide) {
      return useTextureImage
        ? new THREE.MeshLambertMaterial({
            color: 0xffffff,
            wireframe: wireframe,
            flatShading: false,
            depthTest: true,
            opacity: 1.0,
            // side: THREE.DoubleSide,
            side: doubleSingleSide,
            visible: true,
            emissive: 0x0,
            reflectivity: 1.0,
            refractionRatio: 0.89,
            map: DildoMaterials.loadTextureImage(textureImagePath)
          })
        : new THREE.MeshPhongMaterial({
            color: 0x3838ff,
            wireframe: wireframe,
            flatShading: false,
            depthTest: true,
            opacity: 1.0,
            // side: THREE.DoubleSide,
            side: doubleSingleSide,
            visible: true,
            emissive: 0x0,
            reflectivity: 1.0,
            refractionRatio: 0.89,
            map: null
          });
    },

    createSliceMaterial: function (useTextureImage, wireframe, textureImagePath) {
      if (wireframe) {
        return new THREE.MeshBasicMaterial({ wireframe: true });
        // return new THREE.MeshStandardMaterial({ wireframe: true });
      } else {
        return new THREE.MeshLambertMaterial({
          color: useTextureImage ? 0x888888 : 0xa1848a8, // == blue
          wireframe: false,
          flatShading: false,
          depthTest: true,
          opacity: 1.0,
          side: THREE.DoubleSide,
          // side: doubleSingleSide,
          visible: true,
          emissive: 0x0,
          reflectivity: 1.0,
          refractionRatio: 0.89,
          map: useTextureImage ? DildoMaterials.loadTextureImage(textureImagePath) : null,
          vertexColors: false
        });
      }
    },

    /**
     * Load a texture or get it from the internal buffer if it was already loaded before.
     *
     * @param {string} path - The path (absolute or relative) to the texture image to load.
     * @returns {THREE.Texture}
     */
    loadTextureImage: function (path) {
      var texture = textureStore.get(path);
      if (!texture) {
        var loader = new THREE.TextureLoader();
        var texture = loader.load(path);
        textureStore.set(path, texture);
      }
      return texture;
    }
  };
})(globalThis);
