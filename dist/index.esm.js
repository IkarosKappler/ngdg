import * as THREE from 'three';

/**
 * @author   Ikaros Kappler
 * @date     2021-07-13
 * @modified 2021-08-04 Ported to Typescript from vainlla JS.
 * @version  1.0.1
 **/
const EPS = 0.000001;
/**
 * Filter the array and clear all duplicates.
 *
 * The original array is left unchanged. The vertices in the array are not cloned.
 *
 * @param {THREE.Vector3[]} vertices
 * @param {number=EPS} epsilon
 * @return {THREE.Vector3[]}
 */
const clearDuplicateVertices3 = (vertices, epsilon) => {
    if (typeof epsilon === "undefined") {
        epsilon = EPS;
    }
    var result = [];
    for (var i = 0; i < vertices.length; i++) {
        if (!containsElementFrom(vertices, vertices[i], i + 1, epsilon)) {
            result.push(vertices[i]);
        }
    }
    return result;
};
const isCloseTo = (vertA, vertB, eps) => {
    return vertA.distanceTo(vertB) < eps;
};
const containsElementFrom = (vertices, vertex, fromIndex, epsilon) => {
    for (var i = fromIndex; i < vertices.length; i++) {
        if (isCloseTo(vertices[i], vertex, epsilon)) {
            return true;
        }
    }
    return false;
};

// Refactored from dildo-generator
const DEFAULT_BEZIER_JSON = "[ { \"startPoint\" : [-122,77.80736634304651], \"endPoint\" : [-65.59022229786551,21.46778533702511], \"startControlPoint\": [-121.62058129515852,25.08908859418696], \"endControlPoint\" : [-79.33419353770395,48.71529293460728] }, { \"startPoint\" : [-65.59022229786551,21.46778533702511], \"endPoint\" : [-65.66917273472913,-149.23537680826058], \"startControlPoint\": [-52.448492057756646,-4.585775770903305], \"endControlPoint\" : [-86.1618869001374,-62.11613821618976] }, { \"startPoint\" : [-65.66917273472913,-149.23537680826058], \"endPoint\" : [-61.86203591980055,-243.8368165606738], \"startControlPoint\": [-53.701578771473564,-200.1123697454778], \"endControlPoint\" : [-69.80704300441666,-205.36451303641783] }, { \"startPoint\" : [-61.86203591980055,-243.8368165606738], \"endPoint\" : [-21.108966092052256,-323], \"startControlPoint\": [-54.08681426887413,-281.486963896856], \"endControlPoint\" : [-53.05779349623559,-323] } ]";

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
const DildoMaterials = (() => {
    /**
     * Map<string,texture>
     */
    var textureStore = new Map();
    const DildoMaterials = {
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
                    //   flatShading: false,
                    depthTest: true,
                    opacity: 1.0,
                    // side: THREE.DoubleSide,
                    side: doubleSingleSide,
                    visible: true,
                    emissive: 0x0,
                    reflectivity: 1.0,
                    refractionRatio: 0.89,
                    map: loadTextureImage(textureImagePath)
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
            }
            else {
                return new THREE.MeshLambertMaterial({
                    color: useTextureImage ? 0x888888 : 0xa1848a8,
                    wireframe: false,
                    // flatShading: false,
                    depthTest: true,
                    opacity: 1.0,
                    side: THREE.DoubleSide,
                    // side: doubleSingleSide,
                    visible: true,
                    emissive: 0x0,
                    reflectivity: 1.0,
                    refractionRatio: 0.89,
                    map: useTextureImage ? loadTextureImage(textureImagePath) : null,
                    vertexColors: false
                });
            }
        },
    };
    /**
     * Load a texture or get it from the internal buffer if it was already loaded before.
     *
     * @param {string} path - The path (absolute or relative) to the texture image to load.
     * @returns {THREE.Texture}
     */
    const loadTextureImage = function (path) {
        var texture = textureStore.get(path);
        if (!texture) {
            var loader = new THREE.TextureLoader();
            var texture = loader.load(path);
            textureStore.set(path, texture);
        }
        return texture;
    };
    return DildoMaterials;
})();

/**
 * @author   Ikaros Kappler
 * @date     2021-08-03
 * @modified 2021-08-04 Ported to Typsescript from vanilla JS.
 * @version  1.0.1
 */
const UVHelpers = {
    /**
     * Helper function to create triangular UV Mappings for a triangle.
     *
     * @param {THREE.Geometry} thisGeometry
     * @param {Bounds} shapeBounds
     * @param {number} vertIndexA - The index in the geometry's vertices array.
     * @param {number} vertIndexB - ...
     * @param {number} vertIndexC - ...
     */
    makeFlatTriangleUVs: (thisGeometry, // THREE.Geometry does not longer exist since r125 and will be replaced by BufferGeometry
    shapeBounds, vertIndexA, vertIndexB, vertIndexC) => {
        var vertA = thisGeometry.vertices[vertIndexA];
        var vertB = thisGeometry.vertices[vertIndexB];
        var vertC = thisGeometry.vertices[vertIndexC];
        // Convert a position vertex { x, y, * } to UV coordinates { u, v }
        var getUVRatios = (vert) => {
            // console.log((vert.x - shapeBounds.min.x) / shapeBounds.width, (vert.y - shapeBounds.min.y) / shapeBounds.height);
            return new THREE.Vector2((vert.x - shapeBounds.min.x) / shapeBounds.width, (vert.y - shapeBounds.min.y) / shapeBounds.height);
        };
        thisGeometry.faceVertexUvs[0].push([getUVRatios(vertA), getUVRatios(vertB), getUVRatios(vertC)]);
    }
};

export { DEFAULT_BEZIER_JSON, DildoMaterials, UVHelpers, clearDuplicateVertices3 };
//# sourceMappingURL=index.esm.js.map
