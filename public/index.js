/**
 * A script for testing the lib with three.js.
 *
 * @requires PlotBoilerplate
 * @requires Bounds
 * @requires MouseHandler
 * @requires gup
 * @requires dat.gui
 * @requires three.js
 *
 * @author   Ikaros Kappler
 * @date     2019-07-01
 * @version  1.0.0
 **/

(function (_context) {
  "use strict";

  // Fetch the GET params
  let GUP = gup();

  window.addEventListener("load", function () {
    // All config params are optional.
    var pb = new PlotBoilerplate(
      PlotBoilerplate.utils.safeMergeByKeys(
        {
          canvas: document.getElementById("my-canvas"),
          fullSize: true,
          fitToParent: true,
          scaleX: 1.0,
          scaleY: 1.0,
          rasterGrid: true,
          drawOrigin: false,
          rasterAdjustFactor: 2.0,
          redrawOnResize: true,
          defaultCanvasWidth: 1024,
          defaultCanvasHeight: 768,
          canvasWidthFactor: 1.0,
          canvasHeightFactor: 1.0,
          cssScaleX: 1.0,
          cssScaleY: 1.0,
          cssUniformScale: true,
          autoAdjustOffset: true,
          offsetAdjustXPercent: 50,
          offsetAdjustYPercent: 50,
          backgroundColor: "#ffffff",
          enableMouse: true,
          enableKeys: true,
          enableTouch: true,
          enableSVGExport: false
        },
        GUP
      )
    );

    var bezierDistanceT = 0;
    var bezierDistanceLine = null;

    // +---------------------------------------------------------------------------------
    // | A global config that's attached to the dat.gui control interface.
    // +-------------------------------
    var config = PlotBoilerplate.utils.safeMergeByKeys(
      {
        outlineSegmentCount: 128,
        shapeSegmentCount: 64,
        bendAngle: 0,
        closeTop: true,
        closeBottom: true,
        showNormals: false,
        normalsLength: 10.0,
        normalizePerpendiculars: true,
        useTextureImage: true,
        textureImagePath: "wood.png",
        wireframe: false,
        performSlice: false,
        makeHollow: false,
        hollowStrengthX: 15.0, // equivalent for Y is 'normalsLength'
        renderFaces: "double", // "double" or "front" or "back"
        twistAngle: 0.0,
        baseShapeExcentricity: 1.0,
        closeCutAreas: true,
        // Render settings
        showBasicPerpendiculars: false,
        addSpine: false,
        showSplitPane: true,
        showLeftSplit: true,
        showRightSplit: true,
        showSplitShape: true,
        showSplitShapeTriangulation: true,
        addPrecalculatedMassiveFaces: false,
        addPrecalculatedHollowFaces: false,
        addRawIntersectionTriangleMesh: false,
        addPrecalculatedShapeOutlines: false,
        // Functions
        exportSTL: function () {
          exportSTL();
        },
        showPathJSON: function () {
          showPathJSON();
        },
        insertPathJSON: function () {
          insertPathJSON();
        }
      },
      GUP
    );

    var dildoGeneration = new DildoGeneration("dildo-canvas");
    var modal = new Modal();

    // +---------------------------------------------------------------------------------
    // | Export the model as an STL file.
    // +-------------------------------
    var exportSTL = function () {
      function saveFile(data, filename) {
        saveAs(new Blob([data], { type: "application/sla" }), filename);
      }
      modal.setTitle("Export STL");
      modal.setFooter("");
      modal.setActions([
        {
          label: "Cancel",
          action: function () {
            modal.close();
            console.log("canceled");
          }
        }
      ]);
      modal.setBody("Loading ...");
      modal.open();
      try {
        dildoGeneration.generateSTL({
          onComplete: function (stlData) {
            window.setTimeout(function () {
              modal.setBody("File ready.");
              modal.setActions([Modal.ACTION_CLOSE]);
              saveFile(stlData, "dildomodel.stl");
            }, 500);
            // modal.close();
          }
        });
      } catch (e) {
        modal.setBody("Error: " + e);
        modal.setActions([Modal.ACTION_CLOSE]);
      }
    };

    var showPathJSON = function () {
      modal.setTitle("Show Path JSON");
      modal.setFooter("");
      modal.setActions([Modal.ACTION_CLOSE]);
      modal.setBody(outline.toJSON(true));
      modal.open();
    };

    var insertPathJSON = function () {
      var textarea = document.createElement("textarea");
      textarea.style.width = "100%";
      textarea.style.height = "50vh";
      textarea.innerHTML = outline.toJSON(true);
      modal.setTitle("Insert Path JSON");
      modal.setFooter("");
      modal.setActions([
        Modal.ACTION_CANCEL,
        {
          label: "Load JSON",
          action: function () {
            loadPathJSON(textarea.value);
            modal.close();
          }
        }
      ]);
      modal.setBody(textarea);
      modal.open();
    };

    var loadPathJSON = function (jsonData) {
      var newOutline = BezierPath.fromJSON(jsonData);
      setPathInstance(newOutline);
      rebuild();
    };

    // +---------------------------------------------------------------------------------
    // | Delay the build a bit. And cancel stale builds.
    // | This avoids too many rebuilds (pretty expensive) on mouse drag events.
    // +-------------------------------
    var buildId = null;
    var rebuild = function () {
      buildId = new Date().getTime();
      window.setTimeout(
        (function (bId) {
          return function () {
            if (bId == buildId) {
              // Set the bending flag if bendAngle is not zero.
              dildoGeneration.rebuild(Object.assign({ outline: outline, isBending: config.bendAngle !== 0 }, config));
            }
          };
        })(buildId),
        50
      );
    };

    // +---------------------------------------------------------------------------------
    // | Each outline vertex requires a drag (end) listener. Wee need this to update
    // | the 3d mesh on changes.
    // +-------------------------------
    var dragListener = function (dragEvent) {
      // Uhm, well, some curve point moved.
      rebuild();
    };
    var addPathListeners = function (path) {
      BezierPathInteractionHelper.addPathVertexDragEndListeners(path, dragListener);
    };
    var removePathListeners = function (path) {
      BezierPathInteractionHelper.removePathVertexDragEndListeners(path, dragListener);
    };

    // +---------------------------------------------------------------------------------
    // | Draw some stuff before rendering?
    // +-------------------------------
    var preDraw = function () {
      // Draw bounds
      var pathBounds = outline.getBounds();
      pb.draw.rect(pathBounds.min, pathBounds.width, pathBounds.height, "rgba(0,0,0,0.5)", 1);

      // Fill inner area
      var polyline = [
        new Vertex(pathBounds.max.x, pathBounds.min.y),
        new Vertex(pathBounds.max.x, pathBounds.max.y),
        new Vertex(pathBounds.min.x, pathBounds.max.y)
      ];
      var pathSteps = 50;
      for (var i = 0; i < pathSteps; i++) {
        polyline.push(outline.getPointAt(i / pathSteps));
      }
      pb.fill.polyline(polyline, false, "rgba(0,0,0,0.25)");
    };

    // +---------------------------------------------------------------------------------
    // | Draw the split-indicator (if split position ready).
    // +-------------------------------
    var postDraw = function () {
      if (bezierDistanceLine != null) {
        pb.draw.line(bezierDistanceLine.a, bezierDistanceLine.b, "rgb(255,192,0)", 2);
        pb.fill.circleHandle(bezierDistanceLine.a, 3.0, "rgb(255,192,0)");
      }
    };

    // +---------------------------------------------------------------------------------
    // | Add a mouse listener to track the mouse position.
    // +-------------------------------
    new MouseHandler(pb.canvas).move(function (e) {
      var relPos = pb.transformMousePosition(e.params.pos.x, e.params.pos.y);
      var cx = document.getElementById("cx");
      var cy = document.getElementById("cy");
      if (cx) cx.innerHTML = relPos.x.toFixed(2);
      if (cy) cy.innerHTML = relPos.y.toFixed(2);
    });

    // +---------------------------------------------------------------------------------
    // | Scale a given Bounds instance to a new size (from its center).
    // +-------------------------------
    var scaleBounds = function (bounds, scaleFactor) {
      var center = new Vertex(bounds.min.x + bounds.width / 2.0, bounds.min.y + bounds.height / 2.0);
      return new Bounds(new Vertex(bounds.min).scale(scaleFactor, center), new Vertex(bounds.max).scale(scaleFactor, center));
    };

    var setPathInstance = function (newOutline) {
      if (typeof outline != "undefined") {
        pb.removeAll(false); // Do not keep vertices
      }
      outline = newOutline;
      addPathListeners(outline);
      pb.add(newOutline);

      // +---------------------------------------------------------------------------------
      // | Install a Bézier interaction helper.
      // +-------------------------------
      new BezierPathInteractionHelper(pb, [outline], {
        maxDetectDistance: 32.0,
        autoAdjustPaths: true,
        allowPathRemoval: false, // It is not alowed to remove the outline path
        onPointerMoved: function (pathIndex, newA, newB, newT) {
          if (pathIndex == -1) {
            bezierDistanceLine = null;
          } else {
            bezierDistanceLine = new Line(newA, newB);
            bezierDistanceT = newT;
          }
        },
        onVertexInserted: function (pathIndex, insertAfterIndex, newPath, oldPath) {
          console.log("[pathIndex=" + pathIndex + "] Vertex inserted after " + insertAfterIndex);
          console.log("oldPath", oldPath, "newPath", newPath);
          removePathListeners(outline);
          outline = newPath;
          addPathListeners(outline);
          rebuild();
        },
        onVerticesDeleted: function (pathIndex, deletedVertIndices, newPath, oldPath) {
          console.log("[pathIndex=" + pathIndex + "] vertices deleted", deletedVertIndices);
          removePathListeners(outline);
          outline = newPath;
          addPathListeners(outline);
          rebuild();
        }
      });
    }; // END setPathInstance

    // +---------------------------------------------------------------------------------
    // | Create the outline: a Bézier path.
    // +-------------------------------
    var outline = null;
    // This will trigger the first initial postDraw/draw/redraw call
    setPathInstance(BezierPath.fromJSON(DEFAULT_BEZIER_JSON));

    // +---------------------------------------------------------------------------------
    // | Initialize dat.gui
    // +-------------------------------
    {
      // TODO: remove the DatGuiProps again from PB? Not Used? Not Working?
      // See https://stackoverflow.com/questions/25653639/how-do-i-change-the-location-of-the-dat-gui-dropdown
      var gui = pb.createGUI(); // { autoPlace: false });
      gui.domElement.id = "gui";

      var fold0 = gui.addFolder("Mesh");
      // prettier-ignore
      fold0.add(config, "outlineSegmentCount").min(3).max(512).onChange( function() { rebuild() } ).name('outlineSegmentCount').title('The number of segments on the outline.');
      // prettier-ignore
      fold0.add(config, "shapeSegmentCount").min(3).max(256).onChange( function() { rebuild() } ).name('shapeSegmentCount').title('The number of segments on the shape.');
      // prettier-ignore
      fold0.add(config, "bendAngle").min(0).max(180).onChange( function() { rebuild() } ).name('bendAngle').title('The bending angle in degrees.');
      // prettier-ignore
      fold0.add(config, "twistAngle").min(-360.0*3).max(360.0*3).onChange( function() { rebuild() } ).name('twistAngle').title('Twist the mesh along its spine.');
      // prettier-ignore
      fold0.add(config, "baseShapeExcentricity").min(0.1).max(2.0).onChange( function() { rebuild() } ).name('baseShapeExcentricity').title('Make the base shape more elliptic.');
      // prettier-ignore
      fold0.add(config, "closeTop").onChange( function() { rebuild() } ).name('closeTop').title('Close the geometry at the top point (recommended).');
      // prettier-ignore
      fold0.add(config, "closeBottom").onChange( function() { rebuild() } ).name('closeBottom').title('Close the geometry at the bottom point.');

      var fold1 = gui.addFolder("Hollow");
      // prettier-ignore
      fold1.add(config, "makeHollow").onChange( function() { rebuild() } ).name('makeHollow').title('Make a hollow mold?');
      // prettier-ignore
      fold1.add(config, "normalsLength").min(1.0).max(50.0).onChange( function() { rebuild() } ).name('normalsLength').title('The length of rendered normals.');
      // prettier-ignore
      fold1.add(config, "hollowStrengthX").min(0.0).max(50.0).onChange( function() { rebuild() } ).name('hollowStrengthX').title('How thick make the walls?');
      // prettier-ignore
      fold1.add(config, "normalizePerpendiculars").onChange( function() { rebuild() } ).name('normalizePerpendiculars').title('Normalize the XZ perpendiculars (recommended).');

      var fold2 = gui.addFolder("Slice");
      // prettier-ignore
      fold2.add(config, "performSlice").onChange( function() { rebuild() } ).name('performSlice').title('Slice the model along the x axis?');
      // prettier-ignore
      fold2.add(config, "closeCutAreas").onChange( function() { rebuild() } ).name('closeCutAreas').title('Close the open cut areas on the split.');

      var fold3 = gui.addFolder("Render Settings");
      // prettier-ignore
      fold3.add(config, "wireframe").onChange( function() { rebuild() } ).name('wireframe').title('Display the mesh as a wireframe model?');
      // prettier-ignore
      fold3.add(config, "useTextureImage").onChange( function() { rebuild() } ).name('useTextureImage').title('Use a texture image?');
      // prettier-ignore
      fold3.add(config, "renderFaces", ["double","front","back"]).onChange( function() { rebuild() } ).name('renderFaces').title('Render mesh faces double or single sided?');
      // prettier-ignore
      fold3.add(config, "showNormals").onChange( function() { rebuild() } ).name('showNormals').title('Show the vertex normals.');
      // prettier-ignore
      fold3.add(config, "showBasicPerpendiculars").onChange( function() { rebuild() } ).name('showBasicPerpendiculars').title('Show the meshes perpendicular on the XZ plane.');
      // prettier-ignore
      fold3.add(config, "addSpine").onChange( function() { rebuild() } ).name('addSpine').title("Add the model's spine?");
      // prettier-ignore
      fold3.add(config, "addPrecalculatedMassiveFaces").onChange( function() { rebuild() } ).name('addPrecalculatedMassiveFaces').title("Add a pre-calculated massive intersection fill?");
      // prettier-ignore
      fold3.add(config, "addPrecalculatedHollowFaces").onChange( function() { rebuild() } ).name('addPrecalculatedHollowFaces').title("Add a pre-calculated hollow intersection fill?");
      // prettier-ignore
      fold3.add(config, "showSplitPane").onChange( function() { rebuild() } ).name('showSplitPane').title('Show split pane.');
      // prettier-ignore
      fold3.add(config, "showLeftSplit").onChange( function() { rebuild() } ).name('showLeftSplit').title('Show left split.');
      // prettier-ignore
      fold3.add(config, "showRightSplit").onChange( function() { rebuild() } ).name('showRightSplit').title('Show right split.');
      // prettier-ignore
      fold3.add(config, "showSplitShape").onChange( function() { rebuild() } ).name('showSplitShape').title('Show split shape.');
      // prettier-ignore
      fold3.add(config, "showSplitShapeTriangulation").onChange( function() { rebuild() } ).name('showSplitShapeTriangulation').title('Show split shape triangulation?');
      // prettier-ignore
      fold3.add(config, "addRawIntersectionTriangleMesh").onChange( function() { rebuild() } ).name('addRawIntersectionTriangleMesh').title('Show raw unoptimized split face triangulation?');
      // prettier-ignore
      fold3.add(config, "addPrecalculatedShapeOutlines").onChange( function() { rebuild() } ).name('addPrecalculatedShapeOutlines').title('Show raw unoptimized split shape outline(s)?');

      var fold4 = gui.addFolder("Export");
      // prettier-ignore
      fold4.add(config, "exportSTL").name('STL').title('Export an STL file.');
      // prettier-ignore
      fold4.add(config, "showPathJSON").name('Show Path JSON ...').title('Show the path data.');

      var fold5 = gui.addFolder("Import");
      // prettier-ignore
      fold5.add(config, "insertPathJSON").name('Insert Path JSON ...').title('Insert path data as JSON.');

      fold2.open();
    }

    pb.config.preDraw = preDraw;
    pb.config.postDraw = postDraw;
    pb.fitToView(scaleBounds(outline.getBounds(), 1.6));
    rebuild();

    window.addEventListener("resize", function () {
      var scaledBounds = scaleBounds(outline.getBounds(), 1.6);
      pb.fitToView(scaledBounds);
    });
  });
})(window);
