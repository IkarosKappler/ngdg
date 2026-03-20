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
    console.log("NoReact", NoReact);

    // +---------------------------------------------------------------------------------
    // | Initialize the app context.
    // +-------------------------------
    var appContext = new ngdg.AppContext({
      // Initializing the STL exporter in Typescript level leads to import conflicts.
      // -> Pass through.
      makeSTLExporter: function () {
        return new THREE.STLExporter();
      },
      // Initializing the orbit controls in Typescript level leads to import conflicts.
      // -> Pass through.
      makeOrbitControls: function (camera, domElement) {
        return new THREE.OrbitControls(camera, domElement);
      },
      // The modal is currently not implemented in Typescript.
      // -> Pass through.
      makeModal: function () {
        return new Modal();
      },
      // Use a custom `saveAs` function.
      // -> Pass through.
      saveAs: saveAs // (blob:Blob, filename:string) => void;
    });

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
        draw.cross(appContext.bezierDistanceLine.a, 3, "rgb(255,192,0)", 1.0);
      }
    };

    var drawRulers = function (draw, fill) {
      ngdg.Rulers.drawVerticalRuler(draw, fill, appContext.outline, appContext.config.rulerColor);
      ngdg.Rulers.drawHorizontalRuler(draw, fill, appContext.outline, appContext.config.rulerColor);
    };

    // THIS IS JUST EXPERIMENTAL
    var drawOutlineToPolygon = function (draw, fill) {
      appContext.outline.updateArcLengths();
      var vertices = appContext.outline.getEvenDistributionVertices(50);
      // console.log("drawOutlineToPolygon vertices", vertices);
      for (var i = 0; i < vertices.length; i++) {
        draw.circleHandle(vertices[i], 3, "rgba(0,192,128,0.5)");
      }
    };

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
    }

    // +---------------------------------------------------------------------------------
    // | Initialize dat.gui
    // +-------------------------------
    initGUI(appContext);

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
      var scaledBounds = ngdg.scaleBounds(appContext.outline.getBounds(), 1.6);
      appContext.pb.fitToView(scaledBounds);
    });

    var dildoRandomizerDialog = new ngdg.DildoRandomizerDialog(appContext.pb, appContext.modal, appContext.config, {
      outlineChangedCallback: appContext.setRandomizedResult,
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
