# Codename NGDG
Because 3d printing, web 3d, and dildos are cool.

## Bugs
* When slicing the mesh with open bottom there are mesh errors.


## Todos:
* Arrange splits on plane.


### Changelog
* 2021-08-04
  * Complete refactor.
  * Using PlotBoilerplate for 2D drawing now.
  * Using AlloyFinger-typescript for touch gestures.
* -break-
* 2018-08-30
  * Moved the listener setup to the dildo class.
  * Added drag listeners to last end points and last end control points.
* 2018-08-29
  * Added Vertex.multiplyScalar(scalar) (as in THREE.Vector2.multiplyScalar).
  * Added crosshair draw for vertex positions.
  * Added CubicBezierCurve.translate(amount).
  * Added top path and bottom path.
* 2018-08-28
  * Function for resizing draw canvas to parent now, not full window.
* 2018-08-27
  * Added fecha.js for date formatting.
  * Added the VertexListeners class.
  * Added basic JSON<->Object transform for the Dildo class.
  * Added a basic dialog class.
* 2018-08-26
  * Initial commit.
  * Added a bezier-drag test in ./tests/.
  * Added the VertexAttr class.
  * Added attr (VertexAttr) attribute to the Vertex class.
  * Added a second draw-instace: one is for filling shapes, one is for drawing outlines.
* 2018-08-16
  * Refactored old dildo-generator classes.



###
Dependencies
* HTML5 Canvas
* HTML5 WebGL



### Used Libraries
* dat.gui
