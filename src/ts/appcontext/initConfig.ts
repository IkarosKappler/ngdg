/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { AppContext } from "../AppContext";
import { ngdg } from "../ngdg";

export const initConfig = (appContext: AppContext) => {
  // +---------------------------------------------------------------------------------
  // | A global config that's attached to the dat.gui control interface.
  // +-------------------------------
  var config = {
    outlineSegmentCount: appContext.params.getNumber("outlineSegmentCount", 128),
    shapeSegmentCount: appContext.params.getNumber("shapeSegmentCount", 64),
    bendAngle: appContext.params.getNumber("bendAngle", 0.0),
    closeTop: appContext.params.getBoolean("closeTop", true),
    closeBottom: appContext.params.getBoolean("closeBottom", true),
    drawPathBounds: appContext.params.getBoolean("drawPathBounds", true),
    drawResizeHandleLines: appContext.params.getBoolean("drawResizeHandleLines", true),
    drawRulers: appContext.params.getBoolean("drawRulers", true),
    drawOutline: appContext.params.getBoolean("drawOutline", true),
    fillOutline: appContext.params.getBoolean("fillOutline", true),
    showNormals: appContext.params.getBoolean("showNormals", false),
    normalsLength: appContext.params.getNumber("normalsLength", 10.0),
    normalizePerpendiculars: appContext.params.getBoolean("normalizePerpendiculars", true),
    useTextureImage: appContext.params.getBoolean("useTextureImage", true),
    textureImagePath: "assets/img/wood.png",
    wireframe: appContext.params.getBoolean("wireframe", false),
    performSlice: appContext.params.getBoolean("performSlice", false),
    makeHollow: appContext.params.getBoolean("makeHollow", false),
    hollowStrengthX: appContext.params.getNumber("hollowStrengthX", 15.0), // equivalent for Y is 'normalsLength'
    renderFaces: appContext.params.getString("renderFaces", "double"), // "double" or "front" or "back"
    twistAngle: appContext.params.getNumber("twistAngle", 0.0),
    baseShapeExcentricity: appContext.params.getNumber("baseShapeExcentricity", 1.0),
    closeCutAreas: appContext.params.getBoolean("closeCutAreas", true),
    // previewBumpmap: false, // TODO: Is this actually in use?
    useBumpmap: appContext.params.getBoolean("useBumpmap", false),
    showBumpmapTargets: appContext.params.getBoolean("showBumpmapTargets", false),
    showBumpmapImage: appContext.params.getBoolean("showBumpmapImage", false), // Not part of the generator interface
    bumpmap: null, // This is not configurable at the moment and merge in later
    bumpmapStrength: appContext.params.getNumber("bumpmapStrength", 10.0),
    // Render settings
    showBasicPerpendiculars: appContext.params.getBoolean("showBasicPerpendiculars", false),
    addSpine: appContext.params.getBoolean("addSpine", false),
    showSplitPane: appContext.params.getBoolean("showSplitPane", true),
    showLeftSplit: appContext.params.getBoolean("showLeftSplit", true),
    showRightSplit: appContext.params.getBoolean("showRightSplit", true),
    showSplitShape: appContext.params.getBoolean("showSplitShape", true),
    showSplitShapeTriangulation: appContext.params.getBoolean("showSplitShapeTriangulation", true),
    addPrecalculatedMassiveFaces: appContext.params.getBoolean("addPrecalculatedMassiveFaces", false),
    addPrecalculatedHollowFaces: appContext.params.getBoolean("addPrecalculatedHollowFaces", false),
    addRawIntersectionTriangleMesh: appContext.params.getBoolean("addRawIntersectionTriangleMesh", false),
    addPrecalculatedShapeOutlines: appContext.params.getBoolean("addPrecalculatedShapeOutlines", false),
    bezierFillColor: appContext.params.getString(
      "bezierFillColor",
      appContext.isDarkmode ? "rgba(64,64,64,.35)" : "rgba(0,0,0,0.15)"
    ),
    pathBoundsColor: appContext.params.getString(
      "pathBoundsColor",
      appContext.isDarkmode ? "rgba(64,64,64,.5)" : "rgba(0,0,0,0.5)"
    ),
    resizeHandleLineColor: appContext.isDarkmode ? "rgba(192,192,192,0.5)" : "rgba(128,128,128,0.5)",
    rulerColor: appContext.params.getString("rulerColor", appContext.isDarkmode ? "rgba(0,128,192,1.0)" : "rgba(0,128,192,0.5)"),
    showDiscreteOutlinePoints: appContext.params.getBoolean("showDiscreteOutlinePoints", false),
    showSilhouette: appContext.params.getBoolean("showSilhouette", true),
    silhouetteLineColor: appContext.params.getString("silhouetteLineColor", "rgb(255,128,0)"),
    silhouetteLineWidth: appContext.params.getNumber("silhouetteLineWidth", 3.0),
    // Modifiers
    leftSplitMeshRotationX: 180.0, // align properly according to split algorithm
    leftSplitMeshRotationY: 0.0,
    leftSplitMeshRotationZ: 0.0,
    rightSplitMeshRotationX: 180.0, // align properly according to split algorithm
    rightSplitMeshRotationY: 0.0,
    rightSplitMeshRotationZ: 0.0,
    leftSplitMeshTranslationX: ngdg.SPLIT_MESH_OFFSET.x,
    leftSplitMeshTranslationY: ngdg.SPLIT_MESH_OFFSET.y,
    leftSplitMeshTranslationZ: -ngdg.SPLIT_MESH_OFFSET.z, // Important: invert this (as in the algorithm)
    rightSplitMeshTranslationX: ngdg.SPLIT_MESH_OFFSET.x,
    rightSplitMeshTranslationY: ngdg.SPLIT_MESH_OFFSET.y,
    rightSplitMeshTranslationZ: ngdg.SPLIT_MESH_OFFSET.z,
    alignSplitsOnPlane: function () {
      config.leftSplitMeshRotationX = 90;
      config.leftSplitMeshRotationY = 0;
      config.leftSplitMeshRotationZ = 90;
      config.rightSplitMeshRotationX = 90;
      config.rightSplitMeshRotationY = 180;
      config.rightSplitMeshRotationZ = 90;
      config.leftSplitMeshTranslationX = ngdg.SPLIT_MESH_OFFSET.x;
      config.leftSplitMeshTranslationY = ngdg.SPLIT_MESH_OFFSET.y;
      config.leftSplitMeshTranslationZ = -ngdg.SPLIT_MESH_OFFSET.z * 2; // Important: invert this (as in the algorithm)
      config.rightSplitMeshTranslationX = ngdg.SPLIT_MESH_OFFSET.x;
      config.rightSplitMeshTranslationY = ngdg.SPLIT_MESH_OFFSET.y;
      config.rightSplitMeshTranslationZ = ngdg.SPLIT_MESH_OFFSET.z * 2;
      appContext.updateModifiers();
    },
    restoreSplitAlignment: function () {
      config.leftSplitMeshRotationX = 180;
      config.leftSplitMeshRotationY = 0;
      config.leftSplitMeshRotationZ = 0;
      config.rightSplitMeshRotationX = 180;
      config.rightSplitMeshRotationY = 0;
      config.rightSplitMeshRotationZ = 0;
      config.leftSplitMeshTranslationX = ngdg.SPLIT_MESH_OFFSET.x;
      config.leftSplitMeshTranslationY = ngdg.SPLIT_MESH_OFFSET.y;
      config.leftSplitMeshTranslationZ = -ngdg.SPLIT_MESH_OFFSET.z; // Important: invert this (as in the algorithm)
      config.rightSplitMeshTranslationX = ngdg.SPLIT_MESH_OFFSET.x;
      config.rightSplitMeshTranslationY = ngdg.SPLIT_MESH_OFFSET.y;
      config.rightSplitMeshTranslationZ = ngdg.SPLIT_MESH_OFFSET.z;
      appContext.updateModifiers();
    },
    isSilhoutettePreferredView: appContext.params.getBoolean("isSilhoutettePreferredView", true),
    // Functions
    exportSTL: function () {
      appContext.exportSTL();
    },
    showPathJSON: function () {
      appContext.showPathJSON();
    },
    showSculptmap: function () {
      appContext.showSculptmap();
    },
    insertPathJSON: function () {
      appContext.insertPathJSON();
    },
    acquireOptimalPathView: function () {
      appContext.acquireOptimalPathView(appContext.pb, appContext.outline);
    },
    fitViewToSilhouette: function () {
      appContext.fitViewToSilhouette();
    },
    setDefaultPathJSON: function () {
      appContext.setDefaultPathInstance(true);
    }
  };

  return config;
};
