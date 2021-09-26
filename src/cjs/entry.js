"use strict";
/* Imports for webpack */
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.DildoMaterials = void 0;

const DildoMaterials = require("./DildoMaterials").DildoMaterials;
globalThis.DildoMaterials = DildoMaterials;
// globalThis.DildoMaterials = require("./DildoMaterials").DildoMaterials;
globalThis.DEFAULT_BEZIER_JSON = require("./defaults").DEFAULT_BEZIER_JSON;
globalThis.clearDuplicateVertices3 = require("./clearDuplicateVertices3").clearDuplicateVertices3;
globalThis.UVHelpers = require("./UVHelpers").UVHelpers;
globalThis.locateVertexInArray = require("./locateVertexInArray").locateVertexInArray;

globalThis.earcut = require("./thirdparty-ported/earcut").earcut;
globalThis.sliceGeometry = require("./thirdparty-ported/threejs-slice-geometry").sliceGeometry;
globalThis.BumpMapper = require("./BumpMapper").BumpMapper;
globalThis.computeVertexNormals = require("./computeVertexNormals").computeVertexNormals;
// globalThis.DEG_TO_RAD = require("./constants").DEG_TO_RAD;
// globalThis.EPS = require("./constants").EPS;
// globalThis.KEY_LEFT_SLICE_GEOMETRY = require("./constants").KEY_LEFT_SLICE_GEOMETRY;
// globalThis.KEY_LEFT_SLICE_PLANE = require("./constants").KEY_LEFT_SLICE_PLANE;
// globalThis.KEY_PLANE_INTERSECTION_POINTS = require("./constants").KEY_PLANE_INTERSECTION_POINTS;
// globalThis.KEY_PLANE_INTERSECTION_TRIANGULATION = require("./constants").KEY_PLANE_INTERSECTION_TRIANGULATION;
// globalThis.KEY_RIGHT_SLICE_GEOMETRY = require("./constants").KEY_RIGHT_SLICE_GEOMETRY;
// globalThis.KEY_RIGHT_SLICE_PLANE = require("./constants").KEY_RIGHT_SLICE_PLANE;
// globalThis.KEY_SPLIT_PANE_MESH = require("./constants").KEY_SPLIT_PANE_MESH;
// globalThis.KEY_SPLIT_TRIANGULATION_GEOMETRIES = require("./constants").KEY_SPLIT_TRIANGULATION_GEOMETRIES;
// globalThis.DEFAULT_BEZIER_JSON = require("./constants").DEFAULT_BEZIER_JSON;
const constants = require("./constants");
globalThis.DEG_TO_RAD = constants.DEG_TO_RAD;
globalThis.EPS = constants.EPS;
globalThis.KEY_LEFT_SLICE_GEOMETRY = constants.KEY_LEFT_SLICE_GEOMETRY;
globalThis.KEY_LEFT_SLICE_PLANE = constants.KEY_LEFT_SLICE_PLANE;
globalThis.KEY_PLANE_INTERSECTION_POINTS = constants.KEY_PLANE_INTERSECTION_POINTS;
globalThis.KEY_PLANE_INTERSECTION_TRIANGULATION = constants.KEY_PLANE_INTERSECTION_TRIANGULATION;
globalThis.KEY_RIGHT_SLICE_GEOMETRY = constants.KEY_RIGHT_SLICE_GEOMETRY;
globalThis.KEY_RIGHT_SLICE_PLANE = constants.KEY_RIGHT_SLICE_PLANE;
globalThis.KEY_SPLIT_PANE_MESH = constants.KEY_SPLIT_PANE_MESH;
globalThis.KEY_SPLIT_TRIANGULATION_GEOMETRIES = constants.KEY_SPLIT_TRIANGULATION_GEOMETRIES;
globalThis.DEFAULT_BEZIER_JSON = constants.DEFAULT_BEZIER_JSON;
globalThis.DildoGeneration = require("./DildoGeneration").DildoGeneration;
globalThis.GeometryGenerationHelpers = require("./GeometryGenerationHelpers").GeometryGenerationHelpers;
globalThis.ImageStore = require("./ImageStore").ImageStore;
// globalThis.DildoMaterials = require("./index ?
// globalThis.DildoMaterials = require("./interfaces ?
globalThis.mergeGeometries = require("./mergeGeometries").mergeGeometries;
globalThis.PathFinder = require("./PathFinder").PathFinder;
globalThis.PlaneMeshIntersection = require("./PlaneMeshIntersection").PlaneMeshIntersection;
globalThis.randomWebColor = require("./randomWebColor").randomWebColor;
globalThis.RasteredBumpmap = require("./RasteredBumpmap").RasteredBumpmap;
globalThis.UVHelpers = require("./UVHelpers").UVHelpers;

// exports.DildoMaterials = DildoMaterials;
// export {};
