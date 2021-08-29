/**
 * This is a quick-port of mapbox's earcut algorithm.
 *
 * TODO: make a propert typescript port.
 *
 * https://github.com/mapbox/earcut
 * @co-author Ikaros Kappler
 * @date 2021-08-29
 */
export declare const earcut: {
    (data: any, holeIndices?: any, dim?: any): number[];
    deviation(data: any, holeIndices: any, dim: any, triangles: any): number;
    flatten(data: any): {
        vertices: any[];
        holes: any[];
        dimensions: any;
    };
};
