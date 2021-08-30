# Codename NGDG

Because 3d printing, web 3d, and dildos are cool.

## Bugs

- When slicing the mesh with open bottom there are mesh errors.
- Front face, back face and double face switching is not working.
- Add a 'Material' switch/tab.

## Todos:

- Configure webpack to handle type definitions in node_modules correctly.
- Port all vanilla JS parts to Typescript.
- Arrange splits on plane.
- Update to THREE >= r125. Replace all THREE.Geometry and THREE.Face3 instances by proper BufferGeometries
  (not supported any more since r125). See https://sbcode.net/threejs/geometry-to-buffergeometry/ for details.
- Rename base branch to 'main'.
- Create a Typescript port from mapbox/earcut.
- Create a Typescript port from tdhooper/threejs-slice-geometry.
- Add a proper Typescript interface for all available dildo generation options.

### Changelog

- 2021-08-29
  - Ported most of the classes to Typescript.
- 2021-08-04
  - Complete refactor.
  - Using PlotBoilerplate for 2D drawing now.
  - Using AlloyFinger-typescript for touch gestures.
- - BREAK - DID OTHER STUFF IN BETWEEN - AND CORONA WAS/IS THERE -
- 2018-08-30
  - Moved the listener setup to the dildo class.
  - Added drag listeners to last end points and last end control points.
- 2018-08-29
  - Added Vertex.multiplyScalar(scalar) (as in THREE.Vector2.multiplyScalar).
  - Added crosshair draw for vertex positions.
  - Added CubicBezierCurve.translate(amount).
  - Added top path and bottom path.
- 2018-08-28
  - Function for resizing draw canvas to parent now, not full window.
- 2018-08-27
  - Added fecha.js for date formatting.
  - Added the VertexListeners class.
  - Added basic JSON<->Object transform for the Dildo class.
  - Added a basic dialog class.
- 2018-08-26
  - Initial commit.
  - Added a bezier-drag test in ./tests/.
  - Added the VertexAttr class.
  - Added attr (VertexAttr) attribute to the Vertex class.
  - Added a second draw-instace: one is for filling shapes, one is for drawing outlines.
- 2018-08-16
  - Refactored old dildo-generator classes.

###

Dependencies

- HTML5 Canvas
- HTML5 WebGL
- [threejs-slice-geometry](https://github.com/tdhooper/threejs-slice-geometry)

### Used Libraries

- dat.gui
