/**
 * This defines the globally exported wrapper library.
 *
 * See ./src/cjs/entry.js
 *
 * @author   Ikaros Kappler
 * @version  1.0.0
 * @date     2021-09-27
 * @modified 2022-01-29
 */
import { DildoGeneration } from "./DildoGeneration";
import { LocalstorageIO } from "./LocalstorageIO";
import { SculptMap } from "./SculptMap";
import { DildoSilhouette2D } from "./DildoSilhouette2D";
export declare const ngdg: {
    DEFAULT_BEZIER_JSON: string;
    DEG_TO_RAD: number;
    SPLIT_MESH_OFFSET: {
        x: number;
        y: number;
        z: number;
    };
    KEY_SLICED_MESH_RIGHT: string;
    KEY_SLICED_MESH_LEFT: string;
    DildoGeneration: typeof DildoGeneration;
    DildoSilhouette2D: typeof DildoSilhouette2D;
    GeometryGenerationHelpers: {
        makeFace3: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, inverseFaceDirection?: boolean) => void;
        makeFace4: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, vertIndexD: number, inverseFaceDirection?: boolean) => void;
        addCylindricUV4: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, a: number, b: number, c: number, d: number, outlineSegmentCount: number, baseShapeSegmentCount: number, inverseFaceDirection?: boolean) => void;
        addPyramidalBaseUV3: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, a: number, baseShapeSegmentCount: number) => void;
        flattenVert2dArray: (vertices2d: import("plotboilerplate").XYCoords[]) => number[];
        mkCircularPolygon: (radius: number, pointCount: number, excentricity?: number) => import("plotboilerplate").Polygon;
        makeSlice: (unbufferedGeometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, plane: import("three").Plane) => import("three-geometry-hellfix").Gmetry;
        makeAndAddPlaneIntersection: (thisGenerator: import("./interfaces").IDildoGeneration, mesh: import("three").Mesh<import("three").BufferGeometry, import("three").Material | import("three").Material[]>, unbufferedGeometry: import("./DildoGeometry").DildoGeometry, planeGeometry: import("three").Mesh<import("three").BufferGeometry, import("three").Material | import("three").Material[]>, planeGeometryReal: import("three").PlaneGeometry, options: import("./interfaces").DildoOptions) => import("three").Vector3[];
        makeAndAddMassivePlaneIntersection: (thisGenerator: import("./interfaces").IDildoGeneration, unbufferedGeometry: import("./DildoGeometry").DildoGeometry) => void;
        makeAndAddHollowPlaneIntersection: (thisGenerator: import("./interfaces").IDildoGeneration, unbufferedGeometry: import("./DildoGeometry").DildoGeometry) => void;
        addSpine: (thisGenerator: import("./interfaces").IDildoGeneration, spineGeometry: import("three").BufferGeometry) => void;
        addPerpendicularPaths: (thisGenerator: import("./interfaces").IDildoGeneration, unbufferedDildoGeometry: import("./DildoGeometry").DildoGeometry) => void;
        addPerpendicularPath: (thisGenerator: import("./interfaces").IDildoGeneration, perpLines: import("three").Line3[], materialColor: number) => void;
        makePlaneTriangulation: (generator: import("./interfaces").IDildoGeneration, sliceGeometry: import("three-geometry-hellfix").Gmetry, connectedPath: number[], options: import("./interfaces").DildoOptions) => import("three-geometry-hellfix").Gmetry;
        normalizeVectorXY: (base: any, extend: any, normalLength: any) => void;
        normalizeVectorXYZ: (base: import("three").Vector3, extend: import("three").Vector3, normalLength: number) => void;
        removeAllChildNodes: (rootNode: HTMLElement) => void;
        clamp: (n: number, min: number, max: number) => number;
        verticesToBufferGeometry: (vertices: import("three").Vector3[]) => import("three").BufferGeometry;
        rotateVert: (vert: import("three").Vector3, angle: number, xCenter: number, yCenter: number) => import("three").Vector3;
        rotateVertY: (vert: import("three").Vector3, angle: number, xCenter: number, zCenter: number) => import("three").Vector3;
    };
    ImageStore: {
        getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => HTMLImageElement;
        isImageLoaded: (image: HTMLImageElement) => boolean;
    };
    isMobileDevice: () => boolean;
    LocalstorageIO: typeof LocalstorageIO;
    SculptMap: typeof SculptMap;
};
