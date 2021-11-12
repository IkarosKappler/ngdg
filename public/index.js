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
    pb.drawConfig.bezier.color = "#000000";
    pb.drawConfig.bezier.lineWidth = 2.0;
    pb.drawConfig.bezier.handleLine.color = "rgba(0,0,0,0.35)";
    pb.drawConfig.bezier.pathVertex.color = "#B400FF";
    pb.drawConfig.bezier.pathVertex.fill = true;
    pb.drawConfig.bezier.controlVertex.color = "#B8D438";
    pb.drawConfig.bezier.controlVertex.fill = true;

    var bezierDistanceT = 0;
    var bezierDistanceLine = null;

    // Note: bumpmapping is not yet finished.
    var bumpmapPath = "./assets/img/bumpmap-blurred-2.png";
    var bumpmap = null;
    var bumpmapRasterImage = ngdg.ImageStore.getImage(bumpmapPath, function (completeImage) {
      rebuild();
    });

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
        textureImagePath: "assets/img/wood.png",
        wireframe: false,
        performSlice: false,
        makeHollow: false,
        hollowStrengthX: 15.0, // equivalent for Y is 'normalsLength'
        renderFaces: "double", // "double" or "front" or "back"
        twistAngle: 0.0,
        baseShapeExcentricity: 1.0,
        closeCutAreas: true,
        // previewBumpmap: false, // TODO: Is this actually in use?
        useBumpmap: false,
        showBumpmapTargets: false,
        showBumpmapImage: false, // Not part of the generator interface
        bumpmap: null, // This is not configurable at the moment and merge in later
        bumpmapStrength: 10.0,
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
        bezierFillColor: "rgba(0,0,0,0.15)",
        // Functions
        exportSTL: function () {
          exportSTL();
        },
        showPathJSON: function () {
          showPathJSON();
        },
        insertPathJSON: function () {
          insertPathJSON();
        },
        acquireOptimalPathView: function () {
          acquireOptimalPathView();
        }
      },
      GUP
    );

    var dildoGeneration = new ngdg.DildoGeneration("dildo-canvas", {
      makeOrbitControls: function (camera, domElement) {
        return new THREE.OrbitControls(camera, domElement);
      }
    });
    var configIO = new ngdg.ConfigIO(document.getElementsByTagName("body")[0]);
    configIO.onPathDropped(function (jsonString) {
      console.log("json string loaded", jsonString);
      loadPathJSON(jsonString);
    });
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
        dildoGeneration.generateSTL(
          {
            onComplete: function (stlData) {
              window.setTimeout(function () {
                modal.setBody("File ready.");
                modal.setActions([Modal.ACTION_CLOSE]);
                saveFile(stlData, "dildomodel.stl");
              }, 500);
              // modal.close();
            }
          },
          new THREE.STLExporter()
        );
      } catch (e) {
        console.error(e);
        modal.setBody("Error: " + e);
        modal.setActions([Modal.ACTION_CLOSE]);
        modal.open();
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
      var newOutline = null;
      try {
        newOutline = BezierPath.fromJSON(jsonData);
      } catch (e) {
        console.log("Error parsing JSON path:", e.getMessage());
      } finally {
        if (newOutline) {
          setPathInstance(newOutline);
          acquireOptimalPathView();
          rebuild();
        }
      }
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
              if (config.useBumpmap && ImageStore.isImageLoaded(bumpmapRasterImage)) {
                // Resize the bumpmap to satisfy the mesh resolution.
                bumpmap = new RasteredBumpmap(bumpmapRasterImage, config.shapeSegmentCount, config.outlineSegmentCount);
              }
              updateBumpmapPreview(bumpmap, config.useBumpmap && typeof bumpmap !== "undefined" && config.showBumpmapImage);
              // Set the bending flag only if bendAngle if not zero.
              dildoGeneration.rebuild(
                Object.assign(config, { outline: outline, isBending: config.bendAngle !== 0, bumpmap: bumpmap })
              );
            }
          };
        })(buildId),
        50
      );
    };

    /**
     * Create a pewview for the used bumpmap.
     *
     * @param {IBumpmap|undefined} bumpmap
     * @param {boolean} isPreviewVisible
     */
    var updateBumpmapPreview = function (bumpmap, isPreviewVisible) {
      var previewWrapper = document.getElementById("bumpmap-preview");
      if (bumpmap && isPreviewVisible) {
        var previewImageElem = bumpmap.createPreviewImage();
        previewImageElem.style["object-fit"] = "contain";
        previewImageElem.style["position"] = "relative";
        previewImageElem.style["box-flex"] = 1;
        previewImageElem.style["flex"] = "1 1 auto";
        previewImageElem.style["width"] = "100%";
        previewImageElem.style["height"] = "100%";
        GeometryGenerationHelpers.removeAllChildNodes(previewWrapper);
        previewWrapper.appendChild(previewImageElem);
        previewWrapper.style.display = "flex";
      } else {
        previewWrapper.style.display = "none";
      }
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
      pb.fill.polyline(polyline, false, config.bezierFillColor);
    };

    // +---------------------------------------------------------------------------------
    // | Draw the split-indicator (if split position ready).
    // +-------------------------------
    var postDraw = function () {
      if (bezierDistanceLine != null) {
        pb.draw.line(bezierDistanceLine.a, bezierDistanceLine.b, "rgb(255,192,0)", 2);
        pb.fill.circleHandle(bezierDistanceLine.a, 3.0, "rgb(255,192,0)");
      }
      // Draw the ruler.
      // console.log("Post draw");
      var bounds = outline.getBounds();
      var color = "rgba(0,128,192,0.5)";
      var mmPerUnit = 0.5;
      var stepSize = 20; // pixels
      var fontSize = 9;
      // Draw vertical ruler
      pb.draw.line({ x: bounds.max.x + 10, y: bounds.min.y }, { x: bounds.max.x + 10, y: bounds.max.y }, color, 0.5);
      var verticalStepCount = bounds.height / stepSize;
      for (var i = 0; i < verticalStepCount; i++) {
        pb.draw.line(
          { x: bounds.max.x + 10 - 3, y: bounds.max.y - i * stepSize },
          { x: bounds.max.x + 10 + 3, y: bounds.max.y - i * stepSize },
          color,
          0.5
        );
        // Draw label?
        if (i % 2 === 0) {
          pb.fill.text(
            Number(i * stepSize * mmPerUnit).toFixed(1) + "mm",
            bounds.max.x + 16,
            bounds.max.y - i * stepSize + fontSize * 0.25,
            { color: color }
          );
        }
      }
      // Draw horizontal ruler
      pb.draw.line({ x: bounds.min.x, y: bounds.max.y + 10 }, { x: bounds.max.x, y: bounds.max.y + 10 }, color, 0.5);
      var horizontalStepCount = bounds.width / stepSize;
      for (var i = 0; i < horizontalStepCount; i++) {
        pb.draw.line(
          { x: bounds.max.x - i * stepSize, y: bounds.max.y + 10 - 3 },
          { x: bounds.max.x - i * stepSize, y: bounds.max.y + 10 + 3 },
          color,
          0.5
        );
        // Draw label?
        if (i % 2 === 0) {
          // TODO: implement rotation as feature
          pb.fill.ctx.rotate(Math.PI / 2); // This only works in CANVAS context
          if (i == 0) console.log("i", i);
          // pb.fill.text(
          //   Number(i * stepSize * mmPerUnit).toFixed(1) + "mm",
          //   bounds.max.y - i * stepSize + fontSize * 0.25,
          //   -bounds.max.x + 16,
          //   { color: color }
          // );
          pb.fill.ctx.fillStyle = color;
          var x = bounds.max.x - i * stepSize - fontSize * 0.25;
          var y = bounds.max.y + 16;
          var x = pb.fill.offset.x + x * pb.fill.scale.x;
          var y = pb.fill.offset.y + y * pb.fill.scale.y;
          pb.fill.ctx.fillText(Number(i * stepSize * mmPerUnit).toFixed(1) + "mm", y, -x);
          // pb.fill.ctx.restore();
          pb.fill.ctx.rotate(-Math.PI / 2);
        }
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

    // +---------------------------------------------------------------------------------
    // | Scale a given Bounds instance to a new size (from its center).
    // +-------------------------------
    var acquireOptimalPathView = function () {
      // var frameSize = new THREE.Vector2(25, 25);
      // Just keep a 10% frame to stay clear of the canvas limits.
      var frameSize = new THREE.Vector2(pb.canvasSize.width * 0.1, pb.canvasSize.height * 0.1);

      // Compute the applicable canvas size, which leaves the passed frame untouched
      var applicableCanvasWidth = pb.canvasSize.width - frameSize.x * 2;
      var applicableCanvasHeight = pb.canvasSize.height - frameSize.y * 2;

      // Move center of bezier polygon to (0,0)
      var bounds = outline.getBounds();
      var ratioX = bounds.width / applicableCanvasWidth;
      var ratioY = bounds.height / applicableCanvasHeight;

      // The minimal match (width or height) is our choice.
      var newZoomFactor = Math.min(1.0 / ratioX, 1.0 / ratioY);
      pb.setZoom(newZoomFactor, newZoomFactor, { x: 0, y: 0 });

      // Set the draw offset position
      var drawOffsetX = frameSize.x + applicableCanvasWidth / 2.0 - (bounds.min.x + bounds.width / 2) * newZoomFactor;
      var drawOffsetY = frameSize.y + applicableCanvasHeight / 2.0 - (bounds.min.y + bounds.height / 2) * newZoomFactor;

      pb.setOffset({ x: drawOffsetX, y: drawOffsetY });

      // Don't forget to redraw
      pb.redraw();
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
    // setPathInstance(BezierPath.fromJSON(initialPathJSON));
    if (GUP.rbdata) {
      // If you need some test data:
      //    this seems to be the most favourite dildo shape regarding the ranking on Google (2021-10-12)
      //    (plus bendAngle=23.0)
      // [-58.5,243,-59.2,200,-12,217,6.3,196,23.3,176.6,38.7,113,-4.6,76.2,-69.8,20.9,6.2,-65.1,-5.7,-112.6,-30.8,-213,35.4,-243,58.5,-243]
      if (!GUP.rbdata.endsWith("]")) {
        GUP.rbdata += "]"; // Twitter hack
      }
      try {
        setPathInstance(BezierPath.fromReducedListRepresentation(GUP.rbdata));
      } catch (e) {
        console.error(e);
        modal.setBody("Your Bézier path data could not be parsed: <pre>" + GUP.rbdata + "</pre>");
        modal.setActions([Modal.ACTION_CLOSE]);
        modal.open();
      }
    } else {
      setPathInstance(BezierPath.fromJSON(ngdg.DEFAULT_BEZIER_JSON));
    }

    // +---------------------------------------------------------------------------------
    // | Initialize dat.gui
    // +-------------------------------
    {
      // TODO: remove the DatGuiProps again from PB? Not Used? Not Working?
      // See https://stackoverflow.com/questions/25653639/how-do-i-change-the-location-of-the-dat-gui-dropdown
      var gui = pb.createGUI(); // { autoPlace: false });
      gui.domElement.id = "gui";

      var fold0 = gui.addFolder("Path");
      // prettier-ignore
      fold0.add( config, "acquireOptimalPathView" );

      var fold1 = gui.addFolder("Mesh");
      // prettier-ignore
      fold1.add(config, "outlineSegmentCount").min(3).max(512).onChange( function() { rebuild() } ).name('outlineSegmentCount').title('The number of segments on the outline.');
      // prettier-ignore
      fold1.add(config, "shapeSegmentCount").min(3).max(256).onChange( function() { rebuild() } ).name('shapeSegmentCount').title('The number of segments on the shape.');
      // prettier-ignore
      fold1.add(config, "bendAngle").min(0).max(180).onChange( function() { rebuild() } ).name('bendAngle').title('The bending angle in degrees.');
      // prettier-ignore
      fold1.add(config, "twistAngle").min(-360.0*3).max(360.0*3).onChange( function() { rebuild() } ).name('twistAngle').title('Twist the mesh along its spine.');
      // prettier-ignore
      fold1.add(config, "baseShapeExcentricity").min(0.1).max(2.0).onChange( function() { rebuild() } ).name('baseShapeExcentricity').title('Make the base shape more elliptic.');
      // prettier-ignore
      fold1.add(config, "closeTop").onChange( function() { rebuild() } ).name('closeTop').title('Close the geometry at the top point (recommended).');
      // prettier-ignore
      fold1.add(config, "closeBottom").onChange( function() { rebuild() } ).name('closeBottom').title('Close the geometry at the bottom point.');
      // prettier-ignore
      // fold0.add(config, "useBumpmap").onChange( function() { rebuild() } ).name('useBumpmap').title('Check wether the mesh should use a bumpmap.');
      // prettier-ignore
      // fold0.add(config, "bumpmapStrength").min(0.0).max(20.0).onChange( function() { rebuild() } ).name('bumpmapStrength').title('How strong should the bumpmap be applied.');

      var fold2 = gui.addFolder("Hollow");
      // prettier-ignore
      fold2.add(config, "makeHollow").onChange( function() { rebuild() } ).name('makeHollow').title('Make a hollow mold?');
      // prettier-ignore
      fold2.add(config, "normalsLength").min(1.0).max(50.0).onChange( function() { rebuild() } ).name('normalsLength').title('The length of rendered normals.');
      // prettier-ignore
      fold2.add(config, "hollowStrengthX").min(0.0).max(50.0).onChange( function() { rebuild() } ).name('hollowStrengthX').title('How thick make the walls?');
      // prettier-ignore
      fold2.add(config, "normalizePerpendiculars").onChange( function() { rebuild() } ).name('normalizePerpendiculars').title('Normalize the XZ perpendiculars (recommended).');

      var fold3 = gui.addFolder("Slice");
      // prettier-ignore
      fold3.add(config, "performSlice").onChange( function() { rebuild() } ).name('performSlice').title('Slice the model along the x axis?');
      // prettier-ignore
      fold3.add(config, "closeCutAreas").onChange( function() { rebuild() } ).name('closeCutAreas').title('Close the open cut areas on the split.');

      var fold4 = gui.addFolder("Render Settings");
      // prettier-ignore
      fold4.add(config, "wireframe").onChange( function() { rebuild() } ).name('wireframe').title('Display the mesh as a wireframe model?');
      // prettier-ignore
      fold4.add(config, "useTextureImage").onChange( function() { rebuild() } ).name('useTextureImage').title('Use a texture image?');
      // TODO: implement this in a proper next step (bumpmapping is still buggy)
      // // prettier-ignore
      // fold3.add(config, "showBumpmapTargets").onChange( function() { rebuild() } ).name('showBumpmapTargets').title('Show the bumpmap maximal lerping hull.');
      // // prettier-ignore
      // fold3.add(config, "showBumpmapImage").onChange( function() { rebuild() } ).name('showBumpmapImage').title('Check if you want to see a preview of the bumpmap image.');
      // prettier-ignore
      fold4.add(config, "renderFaces", ["double","front","back"]).onChange( function() { rebuild() } ).name('renderFaces').title('Render mesh faces double or single sided?');
      // prettier-ignore
      fold4.add(config, "showNormals").onChange( function() { rebuild() } ).name('showNormals').title('Show the vertex normals.');
      // prettier-ignore
      fold4.add(config, "showBasicPerpendiculars").onChange( function() { rebuild() } ).name('showBasicPerpendiculars').title('Show the meshes perpendicular on the XZ plane.');
      // prettier-ignore
      fold4.add(config, "addSpine").onChange( function() { rebuild() } ).name('addSpine').title("Add the model's spine?");
      // prettier-ignore
      fold4.add(config, "addPrecalculatedMassiveFaces").onChange( function() { rebuild() } ).name('addPrecalculatedMassiveFaces').title("Add a pre-calculated massive intersection fill?");
      // prettier-ignore
      fold4.add(config, "addPrecalculatedHollowFaces").onChange( function() { rebuild() } ).name('addPrecalculatedHollowFaces').title("Add a pre-calculated hollow intersection fill?");
      // prettier-ignore
      fold4.add(config, "showSplitPane").onChange( function() { rebuild() } ).name('showSplitPane').title('Show split pane.');
      // prettier-ignore
      fold4.add(config, "showLeftSplit").onChange( function() { rebuild() } ).name('showLeftSplit').title('Show left split.');
      // prettier-ignore
      fold4.add(config, "showRightSplit").onChange( function() { rebuild() } ).name('showRightSplit').title('Show right split.');
      // prettier-ignore
      fold4.add(config, "showSplitShape").onChange( function() { rebuild() } ).name('showSplitShape').title('Show split shape.');
      // prettier-ignore
      fold4.add(config, "showSplitShapeTriangulation").onChange( function() { rebuild() } ).name('showSplitShapeTriangulation').title('Show split shape triangulation?');
      // prettier-ignore
      fold4.add(config, "addRawIntersectionTriangleMesh").onChange( function() { rebuild() } ).name('addRawIntersectionTriangleMesh').title('Show raw unoptimized split face triangulation?');
      // prettier-ignore
      fold4.add(config, "addPrecalculatedShapeOutlines").onChange( function() { rebuild() } ).name('addPrecalculatedShapeOutlines').title('Show raw unoptimized split shape outline(s)?');

      var fold5 = gui.addFolder("Export");
      // prettier-ignore
      fold5.add(config, "exportSTL").name('STL').title('Export an STL file.');
      // prettier-ignore
      fold5.add(config, "showPathJSON").name('Show Path JSON ...').title('Show the path data.');

      var fold6 = gui.addFolder("Import");
      // prettier-ignore
      fold6.add(config, "insertPathJSON").name('Insert Path JSON ...').title('Insert path data as JSON.');

      fold2.open();
      if (!GUP.openGui) {
        gui.close();
      }
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
