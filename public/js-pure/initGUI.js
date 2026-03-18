/**
 * It turned out that the initialization of dat.gui grew really large. Let's put it into a
 * separate file.
 *
 * @requires guiSizeToggler
 *
 * @author   Ikaros Kappler
 * @date     2021-12-03
 * @modified 2022-02-03 Added modifiers folder.
 * @modified 2026-03-01 Added two new callbacks: `bendAngleChangedCallback` and `appContext.handlePathVisibilityChanged`.
 * @modified 2026-03-02 Removed the GUI-Size-Toggler: is now part of PlotBoierplate.
 * @modified 2026-03-16 Replaced all pararms by `appContext`.
 * @version  1.2.0
 */

// function initGUI(pb, appContext.config, GUP, rebuildCallback, updateModifiersCallback, bendAngleChangedCallback, appContext.handlePathVisibilityChanged) {
function initGUI(appContext) {
  // TODO: remove the DatGuiProps again from PB? Not Used? Not Working?
  // See https://stackoverflow.com/questions/25653639/how-do-i-change-the-location-of-the-dat-gui-dropdown
  var gui = appContext.pb.createGUI(); // { autoPlace: true });
  // document.getElementsByTagName("body")[0].appendChild(gui.domElement);
  gui.domElement.id = "gui";

  var fold0 = gui.addFolder("Path");
  // prettier-ignore
  fold0.add( appContext.config, "acquireOptimalPathView" );
  // prettier-ignore
  fold0.add( appContext.config, "fitViewToSilhouette" );
  // prettier-ignore
  fold0.add(appContext.config, "showDiscreteOutlinePoints").listen().onChange( function() { appContext.pb.redraw(); } ).name('showDiscreteOutlinePoints').title('Show the outline points used to calculate the area?');
  // prettier-ignore
  fold0.add(appContext.config, "showSilhouette").onChange( function() { appContext.pb.redraw(); } ).name('showSilhouette').title('Show the 2D shilhouette of the dildo.');
  // prettier-ignore
  fold0.addColor(appContext.config, "silhouetteLineColor").onChange( function() { appContext.pb.redraw(); } ).title('The line color of the silhoutette.');
  // prettier-ignore
  fold0.add(appContext.config, "silhouetteLineWidth").onChange( function() { appContext.pb.redraw(); } ).title('The line width of the silhoutette.');

  fold0.close();

  // prettier-ignore
  fold0.add(appContext.config, "drawPathBounds").listen().onChange( function() { appContext.pb.redraw(); } ).name('drawPathBounds').title('Show the Beziér path bounding box.');
  // prettier-ignore
  fold0.add(appContext.config, "drawResizeHandleLines").listen().onChange( function() { appContext.handlePathVisibilityChanged(); appContext.pb.redraw(); } ).name('drawResizeHandleLines').title('Draw resize handle lines (only visible when resizing).');
  // prettier-ignore
  fold0.add(appContext.config, "drawRulers").listen().onChange( function() { appContext.pb.redraw(); } ).name('drawRulers').title('Show the 2D path rulers.');
  // prettier-ignore
  fold0.add(appContext.config, "drawOutline").listen().onChange( function() { appContext.handlePathVisibilityChanged(); appContext.pb.redraw(); } ).name('drawOutline').title('Show the overall Bézier path.');
  // prettier-ignore
  fold0.add(appContext.config, "fillOutline").listen().onChange( function() { appContext.pb.redraw(); } ).name('fillOutline').title('Fill the overall Bézier path area.');

  var fold1 = gui.addFolder("Mesh");
  // prettier-ignore
  fold1.add(appContext.config, "outlineSegmentCount").min(3).step(1).max(512).onChange( function() { appContext.rebuild() } ).name('outlineSegmentCount').title('The number of segments on the outline.');
  // prettier-ignore
  fold1.add(appContext.config, "shapeSegmentCount").min(3).step(1).max(512).onChange( function() { appContext.rebuild()  } ).name('shapeSegmentCount').title('The number of segments on the shape.');
  // prettier-ignore
  fold1.add(appContext.config, "bendAngle").min(0).max(180).onChange( function() { appContext.updateSilhouette(); appContext.rebuild()  } ).name('bendAngle').title('The bending angle in degrees.');
  // prettier-ignore
  fold1.add(appContext.config, "twistAngle").min(-360.0*3).max(360.0*3).onChange( function() { appContext.rebuild()  } ).name('twistAngle').title('Twist the mesh along its spine.');
  // prettier-ignore
  fold1.add(appContext.config, "baseShapeExcentricity").min(0.1).max(2.0).onChange( function() { appContext.rebuild()  } ).name('baseShapeExcentricity').title('Make the base shape more elliptic.');
  // prettier-ignore
  fold1.add(appContext.config, "closeTop").onChange( function() { appContext.rebuild()  } ).name('closeTop').title('Close the geometry at the top point (recommended).');
  // prettier-ignore
  fold1.add(appContext.config, "closeBottom").onChange( function() { appContext.rebuild()  } ).name('closeBottom').title('Close the geometry at the bottom point.');
  // prettier-ignore
  // fold0.add(appContext.config, "useBumpmap").onChange( function() { rebuild() } ).name('useBumpmap').title('Check wether the mesh should use a bumpmap.');
  // prettier-ignore
  // fold0.add(appContext.config, "bumpmapStrength").min(0.0).max(20.0).onChange( function() { rebuild() } ).name('bumpmapStrength').title('How strong should the bumpmap be applied.');
  // fold1.close();

  var fold2 = gui.addFolder("Hollow");
  // prettier-ignore
  fold2.add(appContext.config, "makeHollow").onChange( function() { appContext.rebuild()  } ).name('makeHollow').title('Make a hollow mold?');
  // prettier-ignore
  fold2.add(appContext.config, "normalsLength").min(1.0).max(50.0).onChange( function() { appContext.rebuild()  } ).name('normalsLength').title('The length of rendered normals.');
  // prettier-ignore
  fold2.add(appContext.config, "hollowStrengthX").min(0.0).max(50.0).onChange( function() { appContext.rebuild()  } ).name('hollowStrengthX').title('How thick make the walls?');
  // prettier-ignore
  fold2.add(appContext.config, "normalizePerpendiculars").onChange( function() { appContext.rebuild()  } ).name('normalizePerpendiculars').title('Normalize the XZ perpendiculars (recommended).');
  fold2.close();

  var fold3 = gui.addFolder("Slice");
  // prettier-ignore
  fold3.add(appContext.config, "performSlice").onChange( function() { appContext.rebuild()  } ).name('performSlice').title('Slice the model along the x axis?');
  // prettier-ignore
  fold3.add(appContext.config, "closeCutAreas").onChange( function() { appContext.rebuild()  } ).name('closeCutAreas').title('Close the open cut areas on the split.');
  fold3.close();

  var fold4 = gui.addFolder("Modifiers");
  // prettier-ignore
  fold4.add(appContext.config, "leftSplitMeshRotationX").min(0).max(360).step(1.0).onChange( function() { appContext.updateModifiers() } ).name('left.rot.x').title('(leftSplitMeshRotationX) The x rotation of the left split.');
  // prettier-ignore
  fold4.add(appContext.config, "leftSplitMeshRotationY").min(0).max(360).step(1.0).onChange( function() { appContext.updateModifiers() } ).name('left.rot.y').title('(leftSplitMeshRotationY) The y rotation of the left split.');
  // prettier-ignore
  fold4.add(appContext.config, "leftSplitMeshRotationZ").min(0).max(360).step(1.0).onChange( function() { appContext.updateModifiers() } ).name('left.rot.z').title('(leftSplitMeshRotationZ) The z rotation of the left split.');
  // prettier-ignore
  fold4.add(appContext.config, "rightSplitMeshRotationX").min(0).max(360).step(1.0).onChange( function() { appContext.updateModifiers() } ).name('right.rot.x').title('(rightSplitMeshRotationX) The x rotation of the right split.');
  // prettier-ignore
  fold4.add(appContext.config, "rightSplitMeshRotationY").min(0).max(360).step(1.0).onChange( function() { appContext.updateModifiers() } ).name('right.rot.y').title('(rightSplitMeshRotationY) The y rotation of the right split.');
  // prettier-ignore
  fold4.add(appContext.config, "rightSplitMeshRotationZ").min(0).max(360).step(1.0).onChange( function() { appContext.updateModifiers() } ).name('right.rot.z').title('(rightSplitMeshRotationZ) The z rotation of the right split.');
  // prettier-ignore
  fold4.add(appContext.config, "leftSplitMeshTranslationX").step(1.0).onChange( function() { appContext.updateModifiers() } ).name('left.pos.x').title('(leftSplitMeshTranslationX) The x translation of the left split.');
  // prettier-ignore
  fold4.add(appContext.config, "leftSplitMeshTranslationY").step(1.0).onChange( function() { appContext.updateModifiers() } ).name('left.pos.y').title('(leftSplitMeshTranslationY) The y translation of the left split.');
  // prettier-ignore
  fold4.add(appContext.config, "leftSplitMeshTranslationZ").step(1.0).onChange( function() { appContext.updateModifiers() } ).name('left.pos.y').title('(leftSplitMeshTranslationZ) The z translation of the left split.');
  // prettier-ignore
  fold4.add(appContext.config, "rightSplitMeshTranslationX").step(1.0).onChange( function() { appContext.updateModifiers() } ).name('right.pos.x').title('(rightSplitMeshTranslationX) The x translation of the right split.');
  // prettier-ignore
  fold4.add(appContext.config, "rightSplitMeshTranslationY").step(1.0).onChange( function() { appContext.updateModifiers() } ).name('right.pos.y').title('(rightSplitMeshTranslationY) The y translation of the right split.');
  // prettier-ignore
  fold4.add(appContext.config, "rightSplitMeshTranslationZ").step(1.0).onChange( function() { appContext.updateModifiers() } ).name('right.pos.z').title('(rightSplitMeshTranslationZ) The z translation of the right split.');
  // prettier-ignore
  fold4.add(appContext.config, "alignSplitsOnPlane").name('alignSplitsOnPlane').title('Align splits on plane.');
  // prettier-ignore
  fold4.add(appContext.config, "restoreSplitAlignment").name('restoreSplitAlignment').title('Restore original split alignment.');
  fold4.close();

  var fold5 = gui.addFolder("Render Settings");
  // prettier-ignore
  fold5.add(appContext.config, "wireframe").onChange( function() { appContext.rebuild()  } ).name('wireframe').title('Display the mesh as a wireframe model?');
  // prettier-ignore
  fold5.add(appContext.config, "useTextureImage").onChange( function() { appContext.rebuild()  } ).name('useTextureImage').title('Use a texture image?');
  // TODO: implement this in a proper next step (bumpmapping is still buggy)
  // // prettier-ignore
  // fold3.add(appContext.config, "showBumpmapTargets").onChange( function() { rebuild() } ).name('showBumpmapTargets').title('Show the bumpmap maximal lerping hull.');
  // // prettier-ignore
  // fold3.add(appContext.config, "showBumpmapImage").onChange( function() { rebuild() } ).name('showBumpmapImage').title('Check if you want to see a preview of the bumpmap image.');
  // prettier-ignore
  fold5.add(appContext.config, "renderFaces", ["double","front","back"]).onChange( function() { appContext.rebuild()  } ).name('renderFaces').title('Render mesh faces double or single sided?');
  // prettier-ignore
  fold5.add(appContext.config, "showNormals").onChange( function() { appContext.rebuild()  } ).name('showNormals').title('Show the vertex normals.');
  // prettier-ignore
  fold5.add(appContext.config, "showBasicPerpendiculars").onChange( function() { appContext.rebuild()  } ).name('showBasicPerpendiculars').title('Show the meshes perpendicular on the XZ plane.');
  // prettier-ignore
  fold5.add(appContext.config, "addSpine").onChange( function() { appContext.rebuild()  } ).name('addSpine').title("Add the model's spine?");
  // prettier-ignore
  fold5.add(appContext.config, "addPrecalculatedMassiveFaces").onChange( function() { appContext.rebuild()  } ).name('addPrecalculatedMassiveFaces').title("Add a pre-calculated massive intersection fill?");
  // prettier-ignore
  fold5.add(appContext.config, "addPrecalculatedHollowFaces").onChange( function() { appContext.rebuild()  } ).name('addPrecalculatedHollowFaces').title("Add a pre-calculated hollow intersection fill?");
  // prettier-ignore
  fold5.add(appContext.config, "showSplitPane").onChange( function() { appContext.rebuild()  } ).name('showSplitPane').title('Show split pane.');
  // prettier-ignore
  fold5.add(appContext.config, "showLeftSplit").onChange( function() { appContext.rebuild()  } ).name('showLeftSplit').title('Show left split.');
  // prettier-ignore
  fold5.add(appContext.config, "showRightSplit").onChange( function() { appContext.rebuild()  } ).name('showRightSplit').title('Show right split.');
  // prettier-ignore
  fold5.add(appContext.config, "showSplitShape").onChange( function() { appContext.rebuild()  } ).name('showSplitShape').title('Show split shape.');
  // prettier-ignore
  fold5.add(appContext.config, "showSplitShapeTriangulation").onChange( function() { appContext.rebuild()  } ).name('showSplitShapeTriangulation').title('Show split shape triangulation?');
  // prettier-ignore
  fold5.add(appContext.config, "addRawIntersectionTriangleMesh").onChange( function() { appContext.rebuild()  } ).name('addRawIntersectionTriangleMesh').title('Show raw unoptimized split face triangulation?');
  // prettier-ignore
  fold5.add(appContext.config, "addPrecalculatedShapeOutlines").onChange( function() { appContext.rebuild()  } ).name('addPrecalculatedShapeOutlines').title('Show raw unoptimized split shape outline(s)?');
  fold5.close();

  var fold6 = gui.addFolder("Export");
  // prettier-ignore
  fold6.add(appContext.config, "exportSTL").name('STL').title('Export an STL file.');
  // prettier-ignore
  fold6.add(appContext.config, "showPathJSON").name('Show Path JSON ...').title('Show the path data.');
  // prettier-ignore
  fold6.add(appContext.config, "showSculptmap").name('Show sculpt map ...').title('Show the mesh sculpt map.');
  fold6.close();

  var fold7 = gui.addFolder("Import");
  // prettier-ignore
  fold7.add(appContext.config, "insertPathJSON").name('Insert Path JSON ...').title('Insert path data as JSON.');
  // prettier-ignore
  fold7.add(appContext.config, "setDefaultPathJSON").name('Load default Path JSON ...').title('Load the pre-appContext.configured default path JSON.');
  fold7.close();

  // fold2.open();
  if (!appContext.GUP.openGui) {
    gui.close();
  }
}
