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
          acquireOptimalPathView(pb, outline);
        },
        setDefaultPathJSON: function () {
          setDefaultPathInstance(true);
        }
      },
      GUP
    );

    var dildoGeneration = new ngdg.DildoGeneration("dildo-canvas", {
      makeOrbitControls: function (camera, domElement) {
        return new THREE.OrbitControls(camera, domElement);
      }
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
          acquireOptimalPathView(pb, outline);
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
      // if (typeof outline === "undefined" || typeof dildoGeneration === "undefined") {
      //   // Not yet fully initialized.
      //   console.log("Not yet fully initialized.");
      //   return;
      // }
      buildId = new Date().getTime();
      window.setTimeout(
        (function (bId) {
          return function () {
            if (bId === buildId) {
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
      drawBezierDistanceLine();
      drawRulers();
      drawResizeHandleLines(pb, outline, bezierResizer);
    };

    var drawBezierDistanceLine = function () {
      if (bezierDistanceLine != null) {
        pb.draw.line(bezierDistanceLine.a, bezierDistanceLine.b, "rgb(255,192,0)", 2);
        pb.fill.circleHandle(bezierDistanceLine.a, 3.0, "rgb(255,192,0)");
      }
    };

    var drawRulers = function () {
      Rulers.drawVerticalRuler(pb, outline);
      Rulers.drawHorizontalRuler(pb, outline);
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

    var updatePathResizer = function () {
      if (bezierResizer) {
        pb.remove([bezierResizer.verticalResizeHandle, bezierResizer.horizontalResizeHandle]);
        bezierResizer.destroy();
        bezierResizer = null;
      }
      bezierResizer = new BezierResizeHelper(pb, outline, rebuild);
      pb.add([bezierResizer.verticalResizeHandle, bezierResizer.horizontalResizeHandle]);
    };

    // +---------------------------------------------------------------------------------
    // | Set the new path instance and install a Bézier interaction helper.
    // +-------------------------------
    var setPathInstance = function (newOutline) {
      if (outline && typeof outline !== "undefined") {
        removePathListeners(outline);
        pb.removeAll(false); // Do not keep vertices
      }
      outline = newOutline;
      updatePathResizer();
      addPathListeners(outline);
      pb.add(newOutline, false);

      // Install a Bézier interaction helper.
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
          // console.log("[pathIndex=" + pathIndex + "] Vertex inserted after " + insertAfterIndex);
          // console.log("oldPath", oldPath, "newPath", newPath);
          setPathInstance(newPath);
          rebuild();
        },
        onVerticesDeleted: function (pathIndex, deletedVertIndices, newPath, oldPath) {
          // console.log("[pathIndex=" + pathIndex + "] vertices deleted", deletedVertIndices);
          setPathInstance(newPath);
          rebuild();
        }
      });
    }; // END setPathInstance

    var setDefaultPathInstance = function (doRebuild) {
      setPathInstance(BezierPath.fromJSON(ngdg.DEFAULT_BEZIER_JSON));
      if (doRebuild) {
        rebuild();
      }
    };

    // +---------------------------------------------------------------------------------
    // | Create the bezier resize helper.
    // +-------------------------------
    var bezierResizer = null;

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
      setDefaultPathInstance(false);
    }

    // +---------------------------------------------------------------------------------
    // | Load the config from the local storage.
    // | Handle file drop.
    // +-------------------------------
    var configIO = new ngdg.ConfigIO(document.getElementsByTagName("body")[0]);
    configIO.onPathDropped(function (jsonString) {
      // This is called when a json string was loaded by drop (from a file)
      loadPathJSON(jsonString);
    });
    configIO.onPathRestored(
      function (jsonString) {
        // This is called when json string was loaded from storage
        if (!GUP.rbdata) {
          loadPathJSON(jsonString);
        }
      },
      function () {
        return outline ? outline.toJSON() : null;
      }
    );

    // +---------------------------------------------------------------------------------
    // | Initialize dat.gui
    // +-------------------------------
    initGUI(pb, config, GUP, rebuild);

    pb.config.preDraw = preDraw;
    pb.config.postDraw = postDraw;
    pb.fitToView(scaleBounds(outline.getBounds(), 1.6));
    rebuild();

    window.addEventListener("resize", function () {
      var scaledBounds = scaleBounds(outline.getBounds(), 1.6);
      pb.fitToView(scaledBounds);
    });

    // Add action buttons
    // prettier-ignore
    ActionButtons.addNewButton(function() { setDefaultPathInstance(true); acquireOptimalPathView() });
    // prettier-ignore
    ActionButtons.addFitToViewButton( function() { acquireOptimalPathView(pb, outline); } );
  });
})(window);
