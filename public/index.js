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
    // console.log("UIStats [4]", UIStats);

    var appContext = new ngdg.AppContext({
      makeSTLExporter: function () {
        return new THREE.STLExporter();
      },
      makeOrbitControls: function (camera, domElement) {
        return new THREE.OrbitControls(camera, domElement);
      },
      makeModal: function () {
        return new Modal();
      },
      makeUIStats: function (stats) {
        return new UIStats(stats);
      },
      saveAs: saveAs // (Blob, filename) => void;
    });
    // console.log("UIStats [5]", UIStats);

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

      if (appContext.config.showSilhouette && appContext.dildoSilhouette) {
        draw.polyline(
          appContext.dildoSilhouette.leftPathVertices,
          true,
          appContext.config.silhouetteLineColor,
          appContext.config.silhouetteLineWidth
        );
        draw.polyline(
          appContext.dildoSilhouette.rightPathVertices,
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
      ngdg.Rulers.drawVerticalRuler(draw, fill, appContext.outline, appContext.config.rulerColor);
      ngdg.Rulers.drawHorizontalRuler(draw, fill, appContext.outline, appContext.config.rulerColor);
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
      console.log("[INFO] Localstorage enabled.");

      var localstorageIO = new ngdg.LocalstorageIO();
      localstorageIO.onPathRestored(
        function (jsonString, bendAngle, twistAngle, baseShapeExcentricity) {
          console.log("[INFO] Path restored from localstorage.");
          // This is called when json string was loaded from storage
          if (!appContext.GUP.rbdata) {
            console.log("[INFO] Loading path JSON.");
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

    /* var getBezierJSON = function () {
      return outline ? outline.toJSON() : null;
    }; */

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
      appContext.setDefaultPathInstance(true);
      appContext.updateSilhouette(false);
      // acquireOptimalPathView(pb, outline);
      appContext.acquireOptimalView();
    }
    // pb.fitToView(scaleBounds(outline.getBounds(), 1.6));
    appContext.rebuild();

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
      // appContext.setPathInstance(BezierPath.fromJSON(result.outline.toJSON()));
      appContext.setPathInstanceByJSON(result.outline.toJSON());
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

    // Add a mouse listener to track the mouse position.
    try {
      new MouseHandler(appContext.pb.eventCatcher).move(function (e) {
        var relPos = appContext.pb.transformMousePosition(e.params.pos.x, e.params.pos.y);
        appContext.stats.mouseX = relPos.x;
        appContext.stats.mouseY = relPos.y;
      });
    } catch (exc) {
      console.log("Failed to init stats.", exc);
    }

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
