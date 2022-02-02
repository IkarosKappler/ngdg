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

  window.addEventListener("load", function () {
    // Fetch the GET params
    var GUP = gup();
    var isDarkmode = detectDarkMode(GUP);

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
          backgroundColor: isDarkmode ? "rgb(09, 12, 23)" : "#ffffff",
          enableMouse: true,
          enableKeys: true,
          enableTouch: true,
          enableSVGExport: false
        },
        GUP
      )
    );
    pb.drawConfig.bezier.color = isDarkmode ? "rgba(128,128,128, 0.8)" : "#000000";
    pb.drawConfig.bezier.lineWidth = 2.0;
    pb.drawConfig.bezier.handleLine.color = isDarkmode ? "rgba(92,92,92,0.8)" : "rgba(0,0,0,0.35)";
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
      rebuild && rebuild();
    });
    var bezierPathInteractionHelper = null;

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
        bezierFillColor: isDarkmode ? "rgba(64,64,64,.35)" : "rgba(0,0,0,0.15)",
        pathBoundsColor: isDarkmode ? "rgba(64,64,64,.5)" : "rgba(0,0,0,0.5)",
        resizeHandleLineColor: isDarkmode ? "rgba(192,192,192,0.5)" : "rgba(128,128,128,0.5)",
        rulerColor: isDarkmode ? "rgba(0,128,192,1.0)" : "rgba(0,128,192,0.5)",
        showDiscreteOutlinePoints: false,
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
      updateOutlineStats();
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
      pb.draw.rect(pathBounds.min, pathBounds.width, pathBounds.height, config.pathBoundsColor, 1);

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
    var postDraw = function (draw, fill) {
      drawBezierDistanceLine();
      drawRulers();
      drawResizeHandleLines(pb, outline, bezierResizer, config.resizeHandleLineColor);
      if (config.showDiscreteOutlinePoints) {
        drawOutlineToPolygon(draw, fill);
      }
    };

    var drawBezierDistanceLine = function () {
      if (bezierDistanceLine != null) {
        pb.draw.line(bezierDistanceLine.a, bezierDistanceLine.b, "rgb(255,192,0)", 2);
        pb.fill.circleHandle(bezierDistanceLine.a, 3.0, "rgb(255,192,0)");
      }
    };

    var drawRulers = function () {
      Rulers.drawVerticalRuler(pb, outline, config.rulerColor);
      Rulers.drawHorizontalRuler(pb, outline, config.rulerColor);
    };

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
      var onUpdate = function () {
        updateOutlineStats();
        rebuild();
      };
      bezierResizer = new BezierResizeHelper(pb, outline, onUpdate);
      pb.add([bezierResizer.verticalResizeHandle, bezierResizer.horizontalResizeHandle]);
    };

    // +---------------------------------------------------------------------------------
    // | Set the new path instance and install a Bézier interaction helper.
    // +-------------------------------
    var setPathInstance = function (newOutline, keepOldInteractionHelper) {
      if (outline && typeof outline !== "undefined") {
        removePathListeners(outline);
      }

      if (outline && !keepOldInteractionHelper) {
        // pb.removeAll(false); // Do not keep vertices
        pb.remove(outline, false, true);
        pb.add(newOutline); //, false);
      }

      outline = newOutline;
      updatePathResizer();
      addPathListeners(outline);
      updateOutlineStats();

      // Install a Bézier interaction helper.
      if (!bezierPathInteractionHelper || !keepOldInteractionHelper) {
        console.log("Re-init bezier path interaction helper");

        if (bezierPathInteractionHelper) {
          bezierPathInteractionHelper.destroy();
        }

        bezierPathInteractionHelper = new BezierPathInteractionHelper(pb, [outline], {
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
          onVertexInserted: function (_pathIndex, _insertAfterIndex, newPath, _oldPath) {
            removePathListeners(outline);
            setPathInstance(newPath, true);
            rebuild();
          },
          onVerticesDeleted: function (_pathIndex, _deletedVertIndices, newPath, _oldPath) {
            removePathListeners(outline);
            setPathInstance(newPath, true);
            rebuild();
          }
        });
      }
    }; // END setPathInstance

    var setDefaultPathInstance = function (doRebuild) {
      setPathInstance(BezierPath.fromJSON(ngdg.DEFAULT_BEZIER_JSON));
      if (doRebuild) {
        rebuild();
      }
    };

    // +---------------------------------------------------------------------------------
    // | Add stats.
    // +-------------------------------
    var stats = {
      mouseX: 0,
      mouseY: 0,
      width: 0,
      height: 0,
      diameter: 0,
      area: 0
    };
    var uiStats = new UIStats(stats);
    stats = uiStats.proxy;
    uiStats.add("mouseX").precision(1);
    uiStats.add("mouseY").precision(1);
    uiStats.add("width").precision(1).suffix(" mm");
    uiStats.add("height").precision(1).suffix(" mm");
    uiStats.add("diameter").precision(1).suffix(" mm");
    uiStats.add("area").precision(1).suffix(" mm²");

    // Add a mouse listener to track the mouse position.-
    new MouseHandler(pb.canvas).move(function (e) {
      var relPos = pb.transformMousePosition(e.params.pos.x, e.params.pos.y);
      stats.mouseX = relPos.x;
      stats.mouseY = relPos.y;
    });

    var updateOutlineStats = function () {
      var pathBounds = outline.getBounds();
      stats.width = pathBounds.width * Rulers.mmPerUnit;
      stats.height = pathBounds.height * Rulers.mmPerUnit;
      stats.diameter = 2 * pathBounds.height * Rulers.mmPerUnit;
      // stats.area = outline.toPolygon();
    };

    // THIS IS JUST EXPERIMENTAL
    var drawOutlineToPolygon = function (draw, fill) {
      outline.updateArcLengths();
      var vertices = bezier2polygon(outline, 50);
      // console.log("drawOutlineToPolygon vertices", vertices);
      for (var i = 0; i < vertices.length; i++) {
        draw.circleHandle(vertices[i], 3, "rgba(0,192,128,0.5)");
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
    // TODO: restore!!!
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
    ActionButtons.addNewButton(function() { setDefaultPathInstance(true); acquireOptimalPathView(pb,outline ) });
    // prettier-ignore
    ActionButtons.addFitToViewButton( function() { acquireOptimalPathView(pb, outline); } );
  });
})(window);
