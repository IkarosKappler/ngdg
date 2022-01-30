/**
 * It turned out that the initialization of dat.gui grew really large. Let's put it into a
 * separate file.
 *
 * @author  Ikaros Kappler
 * @date    2021-12-03
 * @version 1.0.0
 */

function initGUI(pb, config, GUP, rebuildCallback) {
  // TODO: remove the DatGuiProps again from PB? Not Used? Not Working?
  // See https://stackoverflow.com/questions/25653639/how-do-i-change-the-location-of-the-dat-gui-dropdown
  var gui = pb.createGUI({ autoPlace: false });
  document.getElementsByTagName("body")[0].appendChild(gui.domElement);
  gui.domElement.id = "gui";

  var fold0 = gui.addFolder("Path");
  // prettier-ignore
  fold0.add( config, "acquireOptimalPathView" );

  var fold1 = gui.addFolder("Mesh");
  // prettier-ignore
  fold1.add(config, "outlineSegmentCount").min(3).max(512).onChange( function() { rebuildCallback() } ).name('outlineSegmentCount').title('The number of segments on the outline.');
  // prettier-ignore
  fold1.add(config, "shapeSegmentCount").min(3).max(256).onChange( function() { rebuildCallback() } ).name('shapeSegmentCount').title('The number of segments on the shape.');
  // prettier-ignore
  fold1.add(config, "bendAngle").min(0).max(180).onChange( function() { rebuildCallback() } ).name('bendAngle').title('The bending angle in degrees.');
  // prettier-ignore
  fold1.add(config, "twistAngle").min(-360.0*3).max(360.0*3).onChange( function() { rebuildCallback() } ).name('twistAngle').title('Twist the mesh along its spine.');
  // prettier-ignore
  fold1.add(config, "baseShapeExcentricity").min(0.1).max(2.0).onChange( function() { rebuildCallback() } ).name('baseShapeExcentricity').title('Make the base shape more elliptic.');
  // prettier-ignore
  fold1.add(config, "closeTop").onChange( function() { rebuildCallback() } ).name('closeTop').title('Close the geometry at the top point (recommended).');
  // prettier-ignore
  fold1.add(config, "closeBottom").onChange( function() { rebuildCallback() } ).name('closeBottom').title('Close the geometry at the bottom point.');
  // prettier-ignore
  // fold0.add(config, "useBumpmap").onChange( function() { rebuild() } ).name('useBumpmap').title('Check wether the mesh should use a bumpmap.');
  // prettier-ignore
  // fold0.add(config, "bumpmapStrength").min(0.0).max(20.0).onChange( function() { rebuild() } ).name('bumpmapStrength').title('How strong should the bumpmap be applied.');

  var fold2 = gui.addFolder("Hollow");
  // prettier-ignore
  fold2.add(config, "makeHollow").onChange( function() { rebuildCallback() } ).name('makeHollow').title('Make a hollow mold?');
  // prettier-ignore
  fold2.add(config, "normalsLength").min(1.0).max(50.0).onChange( function() { rebuildCallback() } ).name('normalsLength').title('The length of rendered normals.');
  // prettier-ignore
  fold2.add(config, "hollowStrengthX").min(0.0).max(50.0).onChange( function() { rebuildCallback() } ).name('hollowStrengthX').title('How thick make the walls?');
  // prettier-ignore
  fold2.add(config, "normalizePerpendiculars").onChange( function() { rebuildCallback() } ).name('normalizePerpendiculars').title('Normalize the XZ perpendiculars (recommended).');

  var fold3 = gui.addFolder("Slice");
  // prettier-ignore
  fold3.add(config, "performSlice").onChange( function() { rebuildCallback() } ).name('performSlice').title('Slice the model along the x axis?');
  // prettier-ignore
  fold3.add(config, "closeCutAreas").onChange( function() { rebuildCallback() } ).name('closeCutAreas').title('Close the open cut areas on the split.');

  var fold4 = gui.addFolder("Render Settings");
  // prettier-ignore
  fold4.add(config, "wireframe").onChange( function() { rebuildCallback() } ).name('wireframe').title('Display the mesh as a wireframe model?');
  // prettier-ignore
  fold4.add(config, "useTextureImage").onChange( function() { rebuildCallback() } ).name('useTextureImage').title('Use a texture image?');
  // TODO: implement this in a proper next step (bumpmapping is still buggy)
  // // prettier-ignore
  // fold3.add(config, "showBumpmapTargets").onChange( function() { rebuild() } ).name('showBumpmapTargets').title('Show the bumpmap maximal lerping hull.');
  // // prettier-ignore
  // fold3.add(config, "showBumpmapImage").onChange( function() { rebuild() } ).name('showBumpmapImage').title('Check if you want to see a preview of the bumpmap image.');
  // prettier-ignore
  fold4.add(config, "renderFaces", ["double","front","back"]).onChange( function() { rebuildCallback() } ).name('renderFaces').title('Render mesh faces double or single sided?');
  // prettier-ignore
  fold4.add(config, "showNormals").onChange( function() { rebuildCallback() } ).name('showNormals').title('Show the vertex normals.');
  // prettier-ignore
  fold4.add(config, "showBasicPerpendiculars").onChange( function() { rebuildCallback() } ).name('showBasicPerpendiculars').title('Show the meshes perpendicular on the XZ plane.');
  // prettier-ignore
  fold4.add(config, "addSpine").onChange( function() { rebuildCallback() } ).name('addSpine').title("Add the model's spine?");
  // prettier-ignore
  fold4.add(config, "addPrecalculatedMassiveFaces").onChange( function() { rebuildCallback() } ).name('addPrecalculatedMassiveFaces').title("Add a pre-calculated massive intersection fill?");
  // prettier-ignore
  fold4.add(config, "addPrecalculatedHollowFaces").onChange( function() { rebuildCallback() } ).name('addPrecalculatedHollowFaces').title("Add a pre-calculated hollow intersection fill?");
  // prettier-ignore
  fold4.add(config, "showSplitPane").onChange( function() { rebuildCallback() } ).name('showSplitPane').title('Show split pane.');
  // prettier-ignore
  fold4.add(config, "showLeftSplit").onChange( function() { rebuildCallback() } ).name('showLeftSplit').title('Show left split.');
  // prettier-ignore
  fold4.add(config, "showRightSplit").onChange( function() { rebuildCallback() } ).name('showRightSplit').title('Show right split.');
  // prettier-ignore
  fold4.add(config, "showSplitShape").onChange( function() { rebuildCallback() } ).name('showSplitShape').title('Show split shape.');
  // prettier-ignore
  fold4.add(config, "showSplitShapeTriangulation").onChange( function() { rebuildCallback() } ).name('showSplitShapeTriangulation').title('Show split shape triangulation?');
  // prettier-ignore
  fold4.add(config, "addRawIntersectionTriangleMesh").onChange( function() { rebuildCallback() } ).name('addRawIntersectionTriangleMesh').title('Show raw unoptimized split face triangulation?');
  // prettier-ignore
  fold4.add(config, "addPrecalculatedShapeOutlines").onChange( function() { rebuildCallback() } ).name('addPrecalculatedShapeOutlines').title('Show raw unoptimized split shape outline(s)?');

  var fold5 = gui.addFolder("Export");
  // prettier-ignore
  fold5.add(config, "exportSTL").name('STL').title('Export an STL file.');
  // prettier-ignore
  fold5.add(config, "showPathJSON").name('Show Path JSON ...').title('Show the path data.');

  var fold6 = gui.addFolder("Import");
  // prettier-ignore
  fold6.add(config, "insertPathJSON").name('Insert Path JSON ...').title('Insert path data as JSON.');
  // prettier-ignore
  fold6.add(config, "setDefaultPathJSON").name('Load default Path JSON ...').title('Load the pre-configured default path JSON.');

  fold2.open();
  if (!GUP.openGui) {
    gui.close();
  }
}
