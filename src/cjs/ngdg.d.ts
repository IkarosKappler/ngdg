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
import { DildoRandomizer } from "./DildoRandomizer";
import { AppContext } from "./AppContext";
import { Rulers } from "./Rulers";
import { DildoRandomizerDialog } from "./DildoRandomizerDialog";
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
    AppContext: typeof AppContext;
    acquireOptimalView: (appContext: AppContext) => () => void;
    addPathListeners: (appContex: AppContext) => (path: import("plotboilerplate").BezierPath) => void;
    removePathListeners: (appContex: AppContext) => (path: import("plotboilerplate").BezierPath) => void;
    acquireOptimalPathView: (appContext: AppContext) => (pb: import("plotboilerplate").PlotBoilerplate, outline: import("plotboilerplate").BezierPath) => void;
    exportSTL: (appContext: AppContext, makeSTLExporter: () => import("three/examples/jsm/exporters/STLExporter").STLExporter) => () => void;
    filedropHandler: (appContext: AppContext) => void;
    fitViewToSilhouette: (appContext: AppContext) => () => void;
    getBezierJSON: (appContext: AppContext) => (prettyFormat?: boolean) => string;
    getSculptmapDataURL: (appContext: AppContext) => () => string;
    handlePathVisibilityChanged: (appContext: AppContext) => (isTriggerRedraw: boolean) => void;
    initConfig: (appContext: AppContext) => {
        outlineSegmentCount: number;
        shapeSegmentCount: number;
        bendAngle: number;
        closeTop: boolean;
        closeBottom: boolean;
        drawPathBounds: boolean;
        drawResizeHandleLines: boolean;
        drawRulers: boolean;
        drawOutline: boolean;
        fillOutline: boolean;
        showNormals: boolean;
        normalsLength: number;
        normalizePerpendiculars: boolean;
        useTextureImage: boolean;
        textureImagePath: string;
        wireframe: boolean;
        performSlice: boolean;
        makeHollow: boolean;
        hollowStrengthX: number;
        renderFaces: string;
        twistAngle: number;
        baseShapeExcentricity: number;
        closeCutAreas: boolean;
        useBumpmap: boolean;
        showBumpmapTargets: boolean;
        showBumpmapImage: boolean;
        bumpmap: any;
        bumpmapStrength: number;
        showBasicPerpendiculars: boolean;
        addSpine: boolean;
        showSplitPane: boolean;
        showLeftSplit: boolean;
        showRightSplit: boolean;
        showSplitShape: boolean;
        showSplitShapeTriangulation: boolean;
        addPrecalculatedMassiveFaces: boolean;
        addPrecalculatedHollowFaces: boolean;
        addRawIntersectionTriangleMesh: boolean;
        addPrecalculatedShapeOutlines: boolean;
        bezierFillColor: string;
        pathBoundsColor: string;
        resizeHandleLineColor: string;
        rulerColor: string;
        showDiscreteOutlinePoints: boolean;
        showSilhouette: boolean;
        silhouetteLineColor: string;
        silhouetteLineWidth: number;
        leftSplitMeshRotationX: number;
        leftSplitMeshRotationY: number;
        leftSplitMeshRotationZ: number;
        rightSplitMeshRotationX: number;
        rightSplitMeshRotationY: number;
        rightSplitMeshRotationZ: number;
        leftSplitMeshTranslationX: number;
        leftSplitMeshTranslationY: number;
        leftSplitMeshTranslationZ: number;
        rightSplitMeshTranslationX: number;
        rightSplitMeshTranslationY: number;
        rightSplitMeshTranslationZ: number;
        alignSplitsOnPlane: () => void;
        restoreSplitAlignment: () => void;
        isSilhoutettePreferredView: boolean;
        exportSTL: () => void;
        showPathJSON: () => void;
        showSculptmap: () => void;
        insertPathJSON: () => void;
        acquireOptimalPathView: () => void;
        fitViewToSilhouette: () => void;
        setDefaultPathJSON: () => void;
    };
    initStats: () => {
        mouseX: number;
        mouseY: number;
        width: number;
        height: number;
        diameter: number;
        area: number;
    };
    insertPathJSON: (appContext: AppContext) => () => void;
    loadPathJSON: (appContext: AppContext) => (jsonData: string) => void;
    rebuild: (appContex: AppContext) => () => Promise<boolean>;
    retrieveFromLocalStorage: (appContext: AppContext) => void;
    setDefaultPathInstance: (appContext: AppContext) => (doRebuild: boolean) => void;
    setPathInstance: (appContext: AppContext) => (newOutline: import("plotboilerplate").BezierPath, bendAngle?: number) => void;
    setRandomizedResult: (appContext: AppContext) => (result: import("./appcontext/setRandomizedResult").RandomizerResult) => Promise<boolean>;
    showPathJSON: (appContext: AppContext) => () => void;
    updateBumpmapPreview: (bumpmap: import("./interfaces").IBumpmap, isPreviewVisible: boolean) => void;
    updateModifiers: (appContex: AppContext) => () => void;
    updateOutlineStats: (appContext: AppContext) => () => void;
    updatePathResizer: (appContext: AppContext) => (isTriggerRedraw: boolean) => void;
    updateSilhouette: (appContext: AppContext) => (noRedraw: boolean) => void;
    detectDarkMode: (GUP: Record<string, string>) => boolean;
    DildoGeneration: typeof DildoGeneration;
    DildoRandomizer: typeof DildoRandomizer;
    DildoRandomizerDialog: typeof DildoRandomizerDialog;
    DildoSilhouette2D: typeof DildoSilhouette2D;
    GeometryGenerationHelpers: {
        makeFace3: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, inverseFaceDirection?: boolean) => void;
        makeFace4: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, vertIndexA: number, vertIndexB: number, vertIndexC: number, vertIndexD: number, inverseFaceDirection?: boolean) => void;
        addCylindricUV4: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, a: number, b: number, c: number, d: number, outlineSegmentCount: number, baseShapeSegmentCount: number, inverseFaceDirection?: boolean) => void;
        addPyramidalBaseUV3: (geometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, a: number, baseShapeSegmentCount: number) => void;
        flattenVert2dArray: (vertices2d: Array<import("plotboilerplate").XYCoords>) => Array<number>;
        mkCircularPolygon: (radius: number, pointCount: number, excentricity?: number) => import("plotboilerplate").Polygon;
        makeSlice: (unbufferedGeometry: import("three-geometry-hellfix").Gmetry | import("./DildoGeometry").DildoGeometry, plane: THREE.Plane) => import("three-geometry-hellfix").Gmetry;
        makeAndAddPlaneIntersection: (thisGenerator: import("./interfaces").IDildoGeneration, mesh: THREE.Mesh, unbufferedGeometry: import("./DildoGeometry").DildoGeometry, planeGeometry: THREE.Mesh, planeGeometryReal: THREE.PlaneGeometry, options: import("./interfaces").DildoOptions) => import("three").Vector3[];
        makeAndAddMassivePlaneIntersection: (thisGenerator: import("./interfaces").IDildoGeneration, unbufferedGeometry: import("./DildoGeometry").DildoGeometry) => void;
        makeAndAddHollowPlaneIntersection: (thisGenerator: import("./interfaces").IDildoGeneration, unbufferedGeometry: import("./DildoGeometry").DildoGeometry) => void;
        addSpine: (thisGenerator: import("./interfaces").IDildoGeneration, spineGeometry: THREE.BufferGeometry) => void;
        addPerpendicularPaths: (thisGenerator: import("./interfaces").IDildoGeneration, unbufferedDildoGeometry: import("./DildoGeometry").DildoGeometry) => void;
        addPerpendicularPath: (thisGenerator: import("./interfaces").IDildoGeneration, perpLines: Array<THREE.Line3>, materialColor: number) => void;
        makePlaneTriangulation: (generator: import("./interfaces").IDildoGeneration, sliceGeometry: import("three-geometry-hellfix").Gmetry, connectedPath: number[], options: import("./interfaces").DildoOptions) => import("three-geometry-hellfix").Gmetry;
        normalizeVectorXY: (base: any, extend: any, normalLength: any) => void;
        normalizeVectorXYZ: (base: THREE.Vector3, extend: THREE.Vector3, normalLength: number) => void;
        removeAllChildNodes: (rootNode: HTMLElement) => void;
        clamp: (n: number, min: number, max: number) => number;
        verticesToBufferGeometry: (vertices: THREE.Vector3[]) => THREE.BufferGeometry;
        rotateVert: (vert: import("three").Vector3, angle: number, xCenter: number, yCenter: number) => import("three").Vector3;
        rotateVertY: (vert: import("three").Vector3, angle: number, xCenter: number, zCenter: number) => import("three").Vector3;
    };
    getImageFromCanvas: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, bounds: import("plotboilerplate").Bounds) => {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        imageData: ImageData;
    };
    ImageStore: {
        getImage: (path: string, onComplete: (completeImage: HTMLImageElement) => void) => HTMLImageElement;
        isImageLoaded: (image: HTMLImageElement) => boolean;
    };
    isMobileDevice: () => boolean;
    LocalstorageIO: typeof LocalstorageIO;
    randomWebColor: (index: number, colorSet?: "Malachite" | "Mixed" | "WebColors") => string;
    Rulers: typeof Rulers;
    scaleBounds: (bounds: import("plotboilerplate").Bounds, scaleFactor: number) => import("plotboilerplate").Bounds;
    SculptMap: typeof SculptMap;
};
