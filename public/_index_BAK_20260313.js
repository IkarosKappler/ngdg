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
    // Fetch the GET appContext.params
    // var GUP = gup();
    // var appContext.params = new appContext.Params(GUP);
    // var isDarkmode = detectDarkMode(GUP);
    // var isMobile = detectMobileMode(params);
    // console.log("isMobile", isMobile);
    // if (isMobile) {
    //   document.body.classList.add("mobile");
    // }
    var appContext = new AppContext({
      makeSTLExporter: function () {
        return new THREE.STLExporter();
      },
      makeOrbitControls: function (camera, domElement) {
        return new THREE.OrbitControls(camera, domElement);
      },
      makeModal: function () {
        return new Modal();
      },
      saveAs: saveAs // (Blob, filename) => void;
    });
    // var isLocalstorageDisabled = appContext.params.getBoolean("disableLocalStorage", false);

    // All config appContext.params are optional.
    /*
    var pb = new PlotBoilerplate(
      PlotBoilerplate.utils.safeMergeByKeys(
        {
          canvas: document.getElementById("my-canvas"),
          fullSize: true,
          fitToParent: true,
          scaleX: 1.0,
          scaleY: 1.0,
          rasterGrid: appContext.params.getBoolean("rasterGrid", true),
          drawOrigin: appContext.params.getBoolean("drawOrigin", false),
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
          backgroundColor: appContext.isDarkmode ? "rgb(09, 12, 23)" : "#ffffff",
          enableMouse: true,
          enableKeys: true,
          enableTouch: true,
          enableSVGExport: false
        },
        appContext.GUP
      )
    );
    pb.drawConfig.bezier.color = appContext.isDarkmode ? "rgba(128,128,128, 0.8)" : "#000000";
    pb.drawConfig.bezier.lineWidth = 2.0;
    pb.drawConfig.bezier.handleLine.color = appContext.isDarkmode ? "rgba(92,92,92,0.8)" : "rgba(0,0,0,0.35)";
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
      rulerColor: appContext.params.getString(
        "rulerColor",
        appContext.isDarkmode ? "rgba(0,128,192,1.0)" : "rgba(0,128,192,0.5)"
      ),
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
        updateModifiers();
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
        updateModifiers();
      },
      isSilhoutettePreferredView: appContext.params.getBoolean("isSilhoutettePreferredView", true),
      // Functions
      exportSTL: function () {
        exportSTL();
      },
      showPathJSON: function () {
        showPathJSON();
      },
      showSculptmap: function () {
        showSculptmap();
      },
      insertPathJSON: function () {
        insertPathJSON();
      },
      acquireOptimalPathView: function () {
        acquireOptimalPathView(pb, outline);
      },
      fitViewToSilhouette: function () {
        fitViewToSilhouette();
      },
      setDefaultPathJSON: function () {
        setDefaultPathInstance(true);
      }
    };

    var modal = new Modal();

    var DEFAULT_BEZIER_COLOR = pb.drawConfig.bezier.color;
    var DEFAULT_BEZIER_HANDLE_LINE_COLOR = pb.drawConfig.bezier.handleLine.color;

    var dildoGeneration = new ngdg.DildoGeneration("dildo-canvas", {
      makeOrbitControls: function (camera, domElement) {
        return new THREE.OrbitControls(camera, domElement);
      }
    });

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
      var textArea = document.createElement("textarea");
      textArea.style["width"] = "100%";
      textArea.style["height"] = "100%";
      textArea.style["min-height"] = "50vh";
      textArea.innerHTML = outline.toJSON(true);
      modal.setBody(textArea);
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
          // acquireOptimalPathView(pb, outline);
          rebuild()
            .then(function (succeeded) {
              succeeded && acquireOptimalView();
            })
            .catch(function (err) {
              // NOOP: rebuild had been interrupted by new request.
              // Old result has just been dropped.
              err && console.log(err);
            });
        }
      }
    };

    // +---------------------------------------------------------------------------------
    // | Updates the sculpt map by recalculating the image data from the 3d model.
    // +-------------------------------
    var showSculptmap = function () {
      modal.setTitle("Show Sculpt Map");
      modal.setFooter("");
      modal.setActions([Modal.ACTION_CLOSE]);
      // const geometry = dildoGeneration.primaryDildoGeometry;
      // const sculptmap = ngdg.SculptMap.fromDildoGeometry(geometry);
      // const canvas = sculptmap.toCanvas();
      // const dataString = canvas.toDataURL();
      const dataString = getSculptmapDataURL();
      modal.setBody('<div style="height: 60vh; width: 100%;"><img src="' + dataString + '" width="100%" height="100%">');
      modal.open();
    };

    var getSculptmapDataURL = function () {
      const geometry = dildoGeneration.primaryDildoGeometry;
      const sculptmap = ngdg.SculptMap.fromDildoGeometry(geometry);
      const canvas = sculptmap.toCanvas();
      const dataString = canvas.toDataURL();
      return dataString;
    };

    // +---------------------------------------------------------------------------------
    // | Updates the sculpt map by recalculating the image data from the 3d model.
    // +-------------------------------
    var updateSilhouette = function (noRedraw) {
      // TODO: baseShape updating belongs elsewhere!
      const baseRadius = outline.getBounds().width;

      baseShape = ngdg.GeometryGenerationHelpers.mkCircularPolygon(
        baseRadius,
        config.shapeSegmentCount,
        config.baseShapeExcentricity
      );
      // Also draw the bent 2D dildo outline?
      dildoSilhouette = new ngdg.DildoSilhouette2D({
        baseShape: baseShape,
        outline: outline,
        outlineSegmentCount: config.outlineSegmentCount,
        bendAngleRad: config.bendAngle * ngdg.DEG_TO_RAD,
        bendAngleDeg: config.bendAngle,
        isBending: config.isBending
      });
      if (!noRedraw) {
        pb.redraw();
      }
    };

    var fitViewToSilhouette = function () {
      var bounds = dildoSilhouette.getBounds();
      pb.fitToView(scaleBounds(bounds, 1.6));
    };

    var acquireOptimalView = function () {
      // if (params.getBoolean("fitViewToSilhouette", false)) {
      if (config.isSilhoutettePreferredView) {
        fitViewToSilhouette();
      } else {
        acquireOptimalPathView(pb, outline);
      }
    };

    var handlePathVisibilityChanged = function () {
      console.log("handlePathVisibilityChanged");
      // if (!outline) {
      //   return;
      // }
      // console.log("OUTLINE", outline);
      outline.bezierCurves.forEach(function (curve) {
        // console.log("Curve", curve);
        curve.startPoint.attr.visible = config.drawOutline;
        curve.endPoint.attr.visible = config.drawOutline;
        curve.startControlPoint.attr.visible = config.drawOutline;
        curve.endControlPoint.attr.visible = config.drawOutline;
      });
      if (config.drawOutline) {
        // if (!pb.drawables.includes(outline)) {
        //   pb.add(outline);
        // }
        // addPathListeners(outline);
        // setPathInstance(outline);
        pb.drawConfig.bezier.color = DEFAULT_BEZIER_COLOR;
        pb.drawConfig.bezier.handleLine.color = DEFAULT_BEZIER_HANDLE_LINE_COLOR;
        pb.drawConfig.drawHandleLines = true;
      } else {
        // pb.removeAll(); // (outline, true, true); // redraw=true, removeWithVertices=true
        // removePathListeners(outline);
        pb.drawConfig.bezier.color = "rgba(255,255,255,0.0)";
        pb.drawConfig.bezier.handleLine.color = "rgba(255,255,255,0.0)";
        pb.drawConfig.drawHandleLines = false;
      }
      bezierResizer.verticalResizeHandle.attr.visible = config.drawResizeHandleLines;
      bezierResizer.verticalResizeHandle.attr.draggable = config.drawResizeHandleLines;
      bezierResizer.horizontalResizeHandle.attr.visible = config.drawResizeHandleLines;
      bezierResizer.horizontalResizeHandle.attr.draggable = config.drawResizeHandleLines;
      // outline.
      pb.redraw();
    };

    // +---------------------------------------------------------------------------------
    // | Delay the build a bit. And cancel stale builds.
    // | This avoids too many rebuilds (pretty expensive) on mouse drag events.
    // +-------------------------------
    var buildId = null;
    var rebuild = function () {
      return new Promise(function (accept, reject) {
        buildId = new Date().getTime();
        try {
          window.setTimeout(
            (function (bId) {
              return function () {
                if (bId != buildId) {
                  // console.log("Rejecting", bId, buildId);
                  accept(false);
                  return;
                }
                updateSilhouette(false);
                if (config.useBumpmap && ImageStore.isImageLoaded(bumpmapRasterImage)) {
                  // Resize the bumpmap to satisfy the mesh resolution.
                  bumpmap = new RasteredBumpmap(bumpmapRasterImage, config.shapeSegmentCount, config.outlineSegmentCount);
                }
                updateBumpmapPreview(bumpmap, config.useBumpmap && typeof bumpmap !== "undefined" && config.showBumpmapImage);
                // Set the bending flag only if bendAngle if not zero.
                dildoGeneration.rebuild(
                  Object.assign(config, {
                    outline: outline,
                    isBending: config.bendAngle !== 0,
                    bumpmap: bumpmap,
                    baseShape: baseShape
                  })
                );
                updateModifiers();
                accept(true);
              };
            })(buildId),
            50
          ); // END setTimeout
        } catch (e) {
          reject();
        }
      }); // END Promise
    };

    // +---------------------------------------------------------------------------------
    // | Whenever the modifier settings change (post built and post split) apply
    // | them here: rotation and translation.
    // +-------------------------------
    var updateModifiers = function () {
      // Fetch the sliced result (if options tell it was created)
      // and apply some modifiers.
      if (config.performSlice) {
        if (dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_RIGHT]) {
          var rightSliceMesh = dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_RIGHT];
          rightSliceMesh.rotation.x = config.leftSplitMeshRotationX * ngdg.DEG_TO_RAD;
          rightSliceMesh.rotation.y = config.leftSplitMeshRotationY * ngdg.DEG_TO_RAD;
          rightSliceMesh.rotation.z = config.leftSplitMeshRotationZ * ngdg.DEG_TO_RAD;
          rightSliceMesh.position.x = config.leftSplitMeshTranslationX;
          rightSliceMesh.position.y = config.leftSplitMeshTranslationY;
          rightSliceMesh.position.z = config.leftSplitMeshTranslationZ;
        }
        if (dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_LEFT]) {
          var leftSliceMesh = dildoGeneration.splitResults[ngdg.KEY_SLICED_MESH_LEFT];
          leftSliceMesh.rotation.x = config.rightSplitMeshRotationX * ngdg.DEG_TO_RAD;
          leftSliceMesh.rotation.y = config.rightSplitMeshRotationY * ngdg.DEG_TO_RAD;
          leftSliceMesh.rotation.z = config.rightSplitMeshRotationZ * ngdg.DEG_TO_RAD;
          leftSliceMesh.position.x = config.rightSplitMeshTranslationX;
          leftSliceMesh.position.y = config.rightSplitMeshTranslationY;
          leftSliceMesh.position.z = config.rightSplitMeshTranslationZ;
        }
      }
    };
    */

    /**
     * Create a pewview for the used bumpmap.
     *
     * @param {IBumpmap|undefined} bumpmap
     * @param {boolean} isPreviewVisible
     */
    var updateBumpmapPreview = function (bumpmap, isPreviewVisible) {
      // Note: this is currently not in use
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
    // | Each outline vertex requires a drag (end) listener. We need this to update
    // | the 3d mesh on changes, update stats, and resize handle positions.
    // +-------------------------------
    var dragEndListener = function (dragEvent) {
      // Uhm, well, some curve point moved.
      appContext.updatePathResizer();
      appContext.updateOutlineStats();
      appContext.rebuild();
    };
    // +---------------------------------------------------------------------------------
    // | Each outline vertex requires a drag (end) listener. We need this to update
    // | the 2d preview on changes.
    // +-------------------------------
    var dragListener = function (dragEvent) {
      // Uhm, well, some curve point moved.
      appContext.updateSilhouette(false); // noRedraw=false
    };
    var addPathListeners = function (path) {
      BezierPathInteractionHelper.addPathVertexDragEndListeners(path, dragEndListener);
      BezierPathInteractionHelper.addPathVertexDragListeners(path, dragListener);
    };
    var removePathListeners = function (path) {
      BezierPathInteractionHelper.removePathVertexDragEndListeners(path, dragEndListener);
      BezierPathInteractionHelper.removePathVertexDragListeners(path, dragListener);
    };

    // +---------------------------------------------------------------------------------
    // | Draw some stuff before rendering?
    // +-------------------------------
    var preDraw = function (draw, fill) {
      // Draw bounds
      var pathBounds = appContext.outline.getBounds();
      appContext.config.drawPathBounds &&
        draw.rect(pathBounds.min, pathBounds.width, pathBounds.height, appContext.config.pathBoundsColor, 1);

      // Fill inner area
      var polyline = [
        new Vertex(pathBounds.max.x, pathBounds.min.y),
        new Vertex(pathBounds.max.x, pathBounds.max.y),
        new Vertex(pathBounds.min.x, pathBounds.max.y)
      ];
      var pathSteps = 50;
      for (var i = 0; i < pathSteps; i++) {
        polyline.push(appContext.outline.getPointAt(i / pathSteps));
      }
      appContext.config.fillOutline && fill.polyline(polyline, false, appContext.config.bezierFillColor);

      if (appContext.config.showSilhouette && dildoSilhouette) {
        draw.polyline(
          dildoSilhouette.leftPathVertices,
          true,
          appContext.config.silhouetteLineColor,
          appContext.config.silhouetteLineWidth
        );
        draw.polyline(
          dildoSilhouette.rightPathVertices,
          true,
          appContext.config.silhouetteLineColor,
          appContext.config.silhouetteLineWidth
        );
      }

      if (dildoRandomizerDialog) {
        try {
          dildoRandomizerDialog.drawIdealBounds(draw, fill);
        } catch (exc) {
          console.error("Failed to pre-draw the dildoRandomizerDialog's settings.");
          console.error(exc);
        }
      }
    };

    // +---------------------------------------------------------------------------------
    // | Draw the split-indicator (if split position ready).
    // +-------------------------------
    var postDraw = function (draw, fill) {
      drawBezierDistanceLine(draw, fill);
      appContext.config.drawRulers && drawRulers(draw, fill);
      appContext.config.drawResizeHandleLines &&
        drawResizeHandleLines(
          appContext.pb,
          appContext.outline,
          appContext.bezierResizer,
          appContext.config.resizeHandleLineColor
        );
      if (appContext.config.showDiscreteOutlinePoints) {
        drawOutlineToPolygon(draw, fill);
      }
    };

    var drawBezierDistanceLine = function (draw, fill) {
      if (appContext.bezierDistanceLine != null) {
        draw.line(appContext.bezierDistanceLine.a, appContext.bezierDistanceLine.b, "rgba(255,192,0,0.25)", 1);
        // pb.fill.circleHandle(bezierDistanceLine.a, 3.0, "rgb(255,192,0)");
        drawCross(draw, fill, appContext.bezierDistanceLine.a, "rgb(255,192,0)", 1.0);
      }
    };

    // TODO: in plotboilerplate@1.17.0 there will be a function for this.
    var drawCross = function (draw, fill, position, color, lineWidth) {
      draw.line({ x: position.x - 3, y: position.y - 3 }, { x: position.x + 3, y: position.y + 3 }, color, lineWidth);
      draw.line({ x: position.x + 3, y: position.y - 3 }, { x: position.x - 3, y: position.y + 3 }, color, lineWidth);
    };

    var drawRulers = function (draw, fill) {
      Rulers.drawVerticalRuler(draw, fill, appContext.outline, appContext.config.rulerColor);
      Rulers.drawHorizontalRuler(draw, fill, appContext.outline, appContext.config.rulerColor);
    };

    // +---------------------------------------------------------------------------------
    // | Scale a given Bounds instance to a new size (from its center).
    // +-------------------------------
    var scaleBounds = function (bounds, scaleFactor) {
      var center = new Vertex(bounds.min.x + bounds.width / 2.0, bounds.min.y + bounds.height / 2.0);
      return new Bounds(new Vertex(bounds.min).scale(scaleFactor, center), new Vertex(bounds.max).scale(scaleFactor, center));
    };

    var updatePathResizer = function (triggerRedraw) {
      if (bezierResizer) {
        pb.remove([bezierResizer.verticalResizeHandle, bezierResizer.horizontalResizeHandle]);
        bezierResizer.destroy();
        bezierResizer = null;
      }
      // if (config.drawResizeHandleLines) {
      var onUpdate = function () {
        updateOutlineStats();
        updateSilhouette(false); // noRedraw=false
        rebuild();
      };
      bezierResizer = new BezierResizeHelper(pb, outline, onUpdate);
      pb.add([bezierResizer.verticalResizeHandle, bezierResizer.horizontalResizeHandle], triggerRedraw);
      handlePathVisibilityChanged();
      // }
    };

    // appContext.setPathInstance = setPathInstance(appContext)
    // var setPathInstance = function (newOutline) {
    //   if (typeof outline != "undefined") {
    //     pb.removeAll(false, false); // keepVertices=false, triggerRedraw=false
    //   }
    //   outline = newOutline;
    //   addPathListeners(outline);
    //   updatePathResizer(false); // triggerRedraw=false
    //   pb.add(newOutline);
    //   // pb.add(BezierPath.fromJSON(newOutline.toJSON()));

    //   // +---------------------------------------------------------------------------------
    //   // | Install a BÃ©zier interaction helper.
    //   // +-------------------------------
    //   new BezierPathInteractionHelper(pb, [outline], {
    //     maxDetectDistance: 32.0,
    //     autoAdjustPaths: true,
    //     allowPathRemoval: false, // It is not alowed to remove the outline path
    //     onPointerMoved: function (pathIndex, newA, newB, newT) {
    //       if (pathIndex == -1) {
    //         bezierDistanceLine = null;
    //       } else {
    //         bezierDistanceLine = new Line(newA, newB);
    //         bezierDistanceT = newT;
    //       }
    //     },
    //     onVertexInserted: function (pathIndex, insertAfterIndex, newPath, oldPath) {
    //       console.log("[pathIndex=" + pathIndex + "] Vertex inserted after " + insertAfterIndex);
    //       console.log("oldPath", oldPath, "newPath", newPath);
    //       removePathListeners(outline);
    //       outline = newPath;
    //       addPathListeners(outline);
    //       rebuild();
    //     },
    //     onVerticesDeleted: function (pathIndex, deletedVertIndices, newPath, oldPath) {
    //       console.log("[pathIndex=" + pathIndex + "] vertices deleted", deletedVertIndices);
    //       removePathListeners(outline);
    //       outline = newPath;
    //       addPathListeners(outline);
    //       rebuild();
    //     }
    //   });
    // }; // END setPathInstance

    var setDefaultPathInstance = function (doRebuild) {
      setPathInstance(BezierPath.fromJSON(ngdg.DEFAULT_BEZIER_JSON));
      if (doRebuild) {
        rebuild();
      }
    };

    // +---------------------------------------------------------------------------------
    // | Add stats.
    // +-------------------------------
    // var stats = {
    //   mouseX: 0,
    //   mouseY: 0,
    //   width: 0,
    //   height: 0,
    //   diameter: 0,
    //   area: 0
    // };
    // var uiStats = new UIStats(stats);
    // stats = uiStats.proxy;
    // uiStats.add("mouseX").precision(1);
    // uiStats.add("mouseY").precision(1);
    // uiStats.add("width").precision(1).suffix(" mm");
    // uiStats.add("height").precision(1).suffix(" mm");
    // uiStats.add("diameter").precision(1).suffix(" mm");
    // uiStats.add("area").precision(1).suffix(" mm²");

    // Add a mouse listener to track the mouse position.-
    new MouseHandler(appContext.pb.canvas).move(function (e) {
      var relPos = appContext.pb.transformMousePosition(e.params.pos.x, e.params.pos.y);
      appContext.stats.mouseX = relPos.x;
      appContext.stats.mouseY = relPos.y;
    });

    var updateOutlineStats = function () {
      var pathBounds = outline.getBounds();
      stats.width = pathBounds.width * Rulers.mmPerUnit;
      stats.height = pathBounds.height * Rulers.mmPerUnit;
      stats.diameter = 2 * pathBounds.width * Rulers.mmPerUnit;
      // Compute area from outline
      var vertices = outline.getEvenDistributionVertices(100);
      var bounds = outline.getBounds();
      vertices.push(new Vertex(bounds.max));
      var polygon = new Polygon(vertices, false);
      stats.area = polygon.area();
    };

    // THIS IS JUST EXPERIMENTAL
    var drawOutlineToPolygon = function (draw, fill) {
      outline.updateArcLengths();
      // var vertices = bezier2polygon(outline, 50);
      var vertices = outline.getEvenDistributionVertices(50);
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

    // +---------------------------------------------------------------------------------
    // | The base shape that's used for the extrusion geometry part.
    // | By default this is a circular polygon.
    // +-------------------------------
    var baseShape = null; // Polygon

    // +---------------------------------------------------------------------------------
    // | This stores the solhouette on parameter changes :)
    // +-------------------------------
    var dildoSilhouette = null;

    // This will trigger the first initial postDraw/draw/redraw call
    // setPathInstance(BezierPath.fromJSON(initialPathJSON));
    if (appContext.GUP.rbdata) {
      // If you need some test data:
      //    this seems to be the most favourite dildo shape regarding the ranking on Google (2021-10-12)
      //    (plus bendAngle=23.0)
      // [-58.5,243,-59.2,200,-12,217,6.3,196,23.3,176.6,38.7,113,-4.6,76.2,-69.8,20.9,6.2,-65.1,-5.7,-112.6,-30.8,-213,35.4,-243,58.5,-243]
      if (!appContext.GUP.rbdata.endsWith("]")) {
        appContext.GUP.rbdata += "]"; // Twitter hack
      }
      try {
        appContext.setPathInstance(BezierPath.fromReducedListRepresentation(appContext.GUP.rbdata));
      } catch (e) {
        console.error(e);
        modal.setBody("Your Bézier path data could not be parsed: <pre>" + appContext.GUP.rbdata + "</pre>");
        modal.setActions([Modal.ACTION_CLOSE]);
        modal.open();
      }
    } else {
      // setDefaultPathInstance(false);
      // updateSilhouette(false);
      // acquireOptimalPathView(pb, outline);
    }

    // +---------------------------------------------------------------------------------
    // | Load the config from the local storage.
    // | Handle file drop.
    // +-------------------------------
    var fileDrop = new FileDrop(appContext.pb.eventCatcher);
    fileDrop.onFileJSONDropped(function (jsonObject) {
      try {
        appContext.setPathInstance(BezierPath.fromArray(jsonObject));
        appContext.rebuild();
      } catch (e) {
        console.error("Failed to retrieve Bézier path from dropped file.", jsonObject);
        console.log(e);
      }
    });
    // console.log("OUTLINE", outline);
    if (appContext.isLocalstorageDisabled) {
      console.log("[INFO] Localstorage is disabled.");
      // setDefaultPathInstance(false);
    } else {
      var localstorageIO = new ngdg.LocalstorageIO();
      localstorageIO.onPathRestored(
        function (jsonString, bendAngle, twistAngle, baseShapeExcentricity) {
          // This is called when json string was loaded from storage
          if (!appContext.GUP.rbdata) {
            appContext.loadPathJSON(jsonString);
          }
          if (!appContext.GUP.bendAngle) {
            appContext.config.bendAngle = bendAngle;
          }
          if (!appContext.GUP.twistAngle) {
            appContext.config.twistAngle = twistAngle;
          }
          if (!appContext.GUP.baseShapeExcentricity) {
            appContext.config.baseShapeExcentricity = baseShapeExcentricity;
          }
        },
        function () {
          //  return outline ? outline.toJSON() : null;
          return {
            bezierJSON: appContext.getBezierJSON(),
            bendAngle: appContext.config.bendAngle,
            twistAngle: appContext.config.twistAngle,
            baseShapeExcentricity: appContext.config.baseShapeExcentricity
          };
        }
      );
    }

    var getBezierJSON = function () {
      return outline ? outline.toJSON() : null;
    };

    // +---------------------------------------------------------------------------------
    // | Initialize dat.gui
    // +-------------------------------
    initGUI(
      appContext.pb,
      appContext.config,
      appContext.GUP,
      appContext.rebuild,
      appContext.updateModifiers,
      appContext.updateSilhouette,
      appContext.handlePathVisibilityChanged
    );

    appContext.pb.config.preDraw = preDraw;
    appContext.pb.config.postDraw = postDraw;
    if (!appContext.outline) {
      console.log("[INFO] No path retrieved. Using default path.");
      setDefaultPathInstance(true);
      updateSilhouette(false);
      // acquireOptimalPathView(pb, outline);
      acquireOptimalView();
    }
    // pb.fitToView(scaleBounds(outline.getBounds(), 1.6));
    rebuild();

    window.addEventListener("resize", function () {
      var scaledBounds = scaleBounds(appContext.outline.getBounds(), 1.6);
      pb.fitToView(scaledBounds);
    });

    // +---------------------------------------------------------------------------------
    // | Updates the sculpt map by recalculating the image data from the 3d model.
    // +-------------------------------
    var setRandomizedResult = function (result) {
      // setPathInstance(result.outline);
      // TODO: WHY IS PLOTBOILERPLATE NOT RECOGNIZING THE BEZIER INSTANCE???!
      // temp solution: serialize and de-serialize :/
      appContext.setPathInstance(BezierPath.fromJSON(result.outline.toJSON()));
      appContext.config.bendAngle = result.bendAngle;
      appContext.rebuild();
    };
    var dildoRandomizerDialog = new DildoRandomizerDialog(appContext.pb, appContext.modal, appContext.config, {
      outlineChangedCallback: setRandomizedResult,
      onPathVisibilityChanged: appContext.handlePathVisibilityChanged,
      getBezierJSON: appContext.getBezierJSON,
      getSculptmapDataURL: appContext.getSculptmapDataURL,
      getPreviewImageDataURL: function (type) {
        return appContext.dildoGeneration.canvas.toDataURL(type);
      }
    });
    var showDildoRandomizer = function () {
      dildoRandomizerDialog.open();
    };

    // Add action buttons
    // prettier-ignore
    ActionButtons.addNewButton(function() {
      appContext.config.bendAngle = 23.0;
      appContext.config.twistAngle = 0.0;
      appContext.config.baseShapeExcentricity = 1.0;
      appContext.setDefaultPathInstance(true);
      appContext.updateSilhouette(false);
      // acquireOptimalPathView(pb,outline);
      appContext.acquireOptimalView();
    });
    // prettier-ignore
    ActionButtons.addFitToViewButton( function() { appContext.acquireOptimalView() } );
    ActionButtons.addShowSculptMapButton(appContext.showSculptmap);
    ActionButtons.addShowRandomizerButton(showDildoRandomizer);
  });
})(window);
