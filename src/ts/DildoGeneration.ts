/**
 * A class to manage 3d scenes and the generation of dildo models.
 *
 * @author   Ikaros Kappler
 * @date     2020-07-01
 * @modified 2020-09-11 Added proper texture loading.
 * @modified 2021-06-07 Fixing `removeCachedGeometries`. Adding bending of model.
 * @modified 2021-08-29 Ported this class to Typescript from vanilla JS.
 * @modified 2022-02-03 Added `clearResults` function.
 * @modified 2022-02-22 Replaced Gmetry by ThreeGeometryHellfix.Gmetry.
 * @version  1.2.3
 **/

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { /* DildoBaseClass, */ DildoGeometry } from "./DildoGeometry";
import { DildoMaterials } from "./DildoMaterials";
import { GeometryGenerationHelpers } from "./GeometryGenerationHelpers";
import {
  DildoGenerationOptions,
  DildoOptions,
  ExportOptions,
  ExtendedDildoOptions,
  IBumpmap,
  IDildoGeneration,
  IDildoGeometry
} from "./interfaces";
import { mergeGeometries } from "./mergeGeometries";
import { PathFinder } from "./PathFinder";
import { randomWebColor } from "./randomWebColor";
import {
  EPS,
  SPLIT_MESH_OFFSET,
  KEY_LEFT_SLICE_GEOMETRY,
  KEY_LEFT_SLICE_PLANE,
  KEY_PLANE_INTERSECTION_POINTS,
  KEY_RIGHT_SLICE_GEOMETRY,
  KEY_RIGHT_SLICE_PLANE,
  KEY_SPLIT_PANE_MESH,
  KEY_SPLIT_TRIANGULATION_GEOMETRIES,
  KEY_SLICED_MESH_RIGHT,
  KEY_SLICED_MESH_LEFT
} from "./constants";
import { Polygon } from "plotboilerplate";
import { computeVertexNormals } from "./computeVertexNormals";
import { BumpMapper } from "./BumpMapper";
import { Gmetry } from "three-geometry-hellfix";

export class DildoGeneration implements IDildoGeneration {
  /**
   * @member {HTMLCanvasElement} canvas
   * @memberof DildoGeneration
   *
   */
  canvas: HTMLCanvasElement;
  parent: HTMLElement;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  ambientLightA: THREE.Light; // THREE.AmbientLight?
  ambientLightB: THREE.Light; // THREE.AmbientLight?
  directionalLightA: THREE.DirectionalLight;
  directionalLightB: THREE.DirectionalLight;

  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;

  // Cache all geometries for later removal
  geometries: Array<THREE.Object3D>;

  // Remember partial results
  partialResults: Record<string, object>;
  splitResults: Record<string, THREE.Mesh>;

  constructor(canvasId: string, options: DildoGenerationOptions) {
    this.canvas = document.getElementById(canvasId) as unknown as HTMLCanvasElement;
    this.parent = this.canvas.parentElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.z = 500;

    const lightDistanceFactor: number = 10.0;
    const intensityFactor: number = 1.0;

    this.ambientLightA = new THREE.AmbientLight(0x444444);
    this.ambientLightA.position.set(350, 0, -350).multiplyScalar(lightDistanceFactor * 5);
    // this.ambientLightA = new THREE.PointLight(0xffffff, intensityFactor * 5.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
    // this.ambientLightA.position.set(350, 0, -350).multiplyScalar(lightDistanceFactor);
    this.scene.add(this.ambientLightA);

    this.ambientLightB = new THREE.PointLight(0xffffff, intensityFactor * 5.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
    this.ambientLightB.position.set(-350, 0, 350).multiplyScalar(lightDistanceFactor);
    this.scene.add(this.ambientLightB);

    this.directionalLightA = new THREE.DirectionalLight(0xffffff, intensityFactor * 2.0);
    // this.directionalLightA = new THREE.PointLight(0xffffff, 1.0, 350.0 * lightDistanceFactor, 0.5); // color, intensity, distance, decay);
    this.directionalLightA.position.set(350, 350, 350).multiplyScalar(lightDistanceFactor);
    this.scene.add(this.directionalLightA);
    this.scene.add(this.directionalLightA.target);

    this.directionalLightB = new THREE.DirectionalLight(0xffffff, intensityFactor * 2.0);
    this.directionalLightB.position.set(-350, -350, -50).multiplyScalar(lightDistanceFactor);
    this.scene.add(this.directionalLightB);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      preserveDrawingBuffer: true, // This is required to take screen shots
      antialias: true // false
    });
    // TODO: check if this works!
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls = options.makeOrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    // Cache all geometries for later removal
    this.geometries = [];
    // Remember partial results
    // Record<string,object>
    this.partialResults = {};
    // Record<string.THREE.Mesh>
    this.splitResults = {};

    const _self = this;
    window.addEventListener("resize", () => {
      _self.resizeCanvas();
    });
    this.resizeCanvas();

    const animate = () => {
      requestAnimationFrame(animate);
      _self.controls.update();
      _self.renderer.render(_self.scene, _self.camera);
    };
    animate();
  }

  /**
   * Resize the 3d canvas to fit its container.
   */
  resizeCanvas() {
    let width: number = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let height: number = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = "" + width + "px";
    this.canvas.style.height = "" + height + "px";
    this.canvas.setAttribute("width", "" + width + "px");
    this.canvas.setAttribute("height", height + "px");
    this.renderer.setSize(width, height);
    // What am I doing here?
    this.camera.setViewOffset(width, height, width / 4, height / 20, width, height);
  }

  /**
   * Clears the current scene and rebuilds everything from scratch according to the
   * mesh options being passed.
   *
   * @param {BezierPath} options.outline
   * @param {number}     options.segmentCount
   * @param {number}     options.outlineSegmentCount (>= 2).
   * @param {number}     options.bendAngle The bending angle in degrees (!).
   * @param {boolean}    options.performSlice
   * @param {boolean?}   options.useTextureImage
   * @param {string?}    options.textureImagePath
   * @param {boolean?}   options.wireframe
   * @param {string}     options.renderFaces - "double" or "front" (default) or "back"
   **/
  rebuild(options: ExtendedDildoOptions) {
    this.removeCachedGeometries();
    this.clearResults();

    const baseRadius: number = options.outline.getBounds().width;
    const baseShape: Polygon = GeometryGenerationHelpers.mkCircularPolygon(
      baseRadius,
      options.shapeSegmentCount,
      options.baseShapeExcentricity
    );
    const useBumpmap: boolean = typeof options.useBumpmap !== "undefined" ? options.useBumpmap : false;
    // const bumpmapPath = "./assets/img/bumpmap.png";
    // const bumpmapTexture: THREE.Texture | null = useBumpmap ? DildoMaterials.loadTextureImage(bumpmapPath) : null;
    const bumpmap: IBumpmap | null = useBumpmap && options.bumpmap ? options.bumpmap : null;
    const dildoGeometry: DildoGeometry = new DildoGeometry(
      Object.assign({ baseShape: baseShape /*, bumpmapTexture: bumpmapTexture */ }, options)
    );
    const useTextureImage: boolean = options.useTextureImage && typeof options.textureImagePath !== "undefined";
    const textureImagePath: string = typeof options.textureImagePath !== "undefined" ? options.textureImagePath : null;
    const doubleSingleSide: THREE.Side =
      options.renderFaces === "double" ? THREE.DoubleSide : options.renderFaces === "back" ? THREE.BackSide : THREE.FrontSide;
    const wireframe: boolean = typeof options.wireframe !== "undefined" ? options.wireframe : false;

    const material: THREE.Material = DildoMaterials.createMainMaterial(
      useTextureImage,
      wireframe,
      textureImagePath,
      doubleSingleSide
    );
    // This can be overriden in later steps! (after bumpmap was applied)
    // let bufferedGeometry: THREE.BufferGeometry = new THREE.BufferGeometry().fromGeometry(
    //   dildoGeometry as unknown as Gmetry
    // );
    // TODO: verify correctness
    let bufferedGeometry: THREE.BufferGeometry = (dildoGeometry as unknown as Gmetry).toBufferGeometry();

    bufferedGeometry.computeVertexNormals();
    // This can be overriden in later steps! (after bumpmap was applied)
    let dildoMesh: THREE.Mesh = new THREE.Mesh(bufferedGeometry, material);
    this.camera.lookAt(new THREE.Vector3(20, 0, 150));
    this.camera.lookAt(dildoMesh.position);

    const spineGeometry: Gmetry = new Gmetry();
    dildoGeometry.spineVertices.forEach(function (spineVert) {
      spineGeometry.vertices.push(spineVert.clone());
    });

    if (options.addSpine) {
      GeometryGenerationHelpers.addSpine(this, spineGeometry);
    }

    // Add perpendicular path?
    if (options.showBasicPerpendiculars) {
      GeometryGenerationHelpers.addPerpendicularPaths(this, dildoGeometry);
    }

    // Show computed dildo normals?
    // if (options.previewBumpmap || options.useBumpmap) {
    if (options.useBumpmap) {
      // const collectedVertexNormals: Array<THREE.Line3> = computeVertexNormals(
      //   dildoGeometry as unknown as Gmetry,
      //   bufferedGeometry
      // );
      // const dildoNormalGeometry = new Gmetry();
      // dildoNormalGeometry.vertices = collectedVertexNormals.map((normalLine: THREE.Line3) => {
      //   const endPoint: THREE.Vector3 = normalLine.end.clone();
      //   GeometryGenerationHelpers.normalizeVectorXYZ(normalLine.start, endPoint, options.bumpmapStrength);
      //   return endPoint;
      // });
      // const dildoNormalsMesh: THREE.Points = new THREE.Points(
      //   dildoNormalGeometry,
      //   new THREE.PointsMaterial({
      //     size: 1.4,
      //     color: 0x00ffff
      //   })
      // );
      // if (options.showBumpmapTargets) {
      //   dildoNormalsMesh.position.y = -100;
      //   this.addMesh(dildoNormalsMesh);
      // }

      // console.log("options.useBumpmap", options.useBumpmap, "bumpmap", bumpmap);
      // // const heightMap = createHeightMapFromImage( bumpmapTexture ):
      // if (options.useBumpmap && bumpmap) {
      //   for (var y = 0; y < dildoGeometry.vertexMatrix.length; y++) {
      //     for (var x = 0; x < dildoGeometry.vertexMatrix[y].length; x++) {
      //       const vertIndex: number = dildoGeometry.vertexMatrix[y][x];
      //       const vertex: THREE.Vector3 = dildoGeometry.vertices[vertIndex];
      //       const yRatio: number = y / (dildoGeometry.vertexMatrix.length - 1);
      //       const xRatio: number = x / (dildoGeometry.vertexMatrix[y].length - 1);
      //       const lerpFactor: number = bumpmap.getHeightAt(xRatio, yRatio);
      //       const lerpTarget: THREE.Vector3 = dildoNormalGeometry.vertices[vertIndex];
      //       vertex.lerp(lerpTarget, lerpFactor);
      //     }
      //   }

      //   // Override the buffered geometry! (bumpmap has been applied)
      //   bufferedGeometry = new THREE.BufferGeometry().fromGeometry(dildoGeometry as unknown as Gmetry);
      //   bufferedGeometry.computeVertexNormals();
      //   // Override the mesh! (bumpmap has been applied)
      //   dildoMesh = new THREE.Mesh(bufferedGeometry, material);
      // }

      const { dildoMesh: bumpmappedDildoMesh, dildoNormalsMesh } = BumpMapper.applyBumpmap(
        dildoGeometry,
        bufferedGeometry,
        bumpmap,
        material,
        options
      );
      dildoMesh = bumpmappedDildoMesh;
      if (options.showBumpmapTargets) {
        // dildoNormalsMesh.position.y = -100;
        dildoNormalsMesh.position.y = SPLIT_MESH_OFFSET.y;
        this.addMesh(dildoNormalsMesh);
      }
    }

    if (options.performSlice) {
      this.__performPlaneSlice(dildoMesh, dildoGeometry, wireframe, useTextureImage, textureImagePath, options);
      // The CSG operations are not reliable.
      // this.__performCsgSlice(latheMesh, geometry, material);
    } else {
      // dildoMesh.position.y = -100;
      dildoMesh.position.y = SPLIT_MESH_OFFSET.y;
      dildoMesh.userData["isExportable"] = true;
      this.addMesh(dildoMesh);

      if (options.showNormals) {
        var vnHelper = new VertexNormalsHelper(dildoMesh, options.normalsLength, 0x00ff00); // Fourth param 1?
        // TODO: use addMesh() here?
        this.scene.add(vnHelper);
        this.geometries.push(vnHelper);
      }
    }
  }

  /**
   * Perform the actual slice operation.
   *
   * This will create several new meshes:
   *  * a left geometry slice (along the z- axis).
   *  * a right geometry slice (along the z+ axis).
   *  * an inner slice cut geometry (inside the dildo model, cutting it into two halves).
   *  * an outer slice cut geometry (inside the mould model, cutting that one into two halves).
   *
   * These will always be generated, even if the options tell different; if so then they are set
   * to be invisible.
   *
   * @param {ThreeGeometryHellfix.Gmetry} latheMesh - The buffered dildo geometry (required to perform the slice operation).
   * @param {DildoGeometry} latheUnbufferedGeometry - The unbuffered dildo geometry (required to obtain the perpendicular path lines).
   * @param {boolean} wireframe
   */
  __performPlaneSlice(
    latheMesh: THREE.Mesh,
    latheUnbufferedGeometry: DildoGeometry,
    wireframe: boolean,
    useTextureImage: boolean,
    textureImagePath: string,
    options: DildoOptions
  ) {
    // var epsilon = 0.000001;
    const leftPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const leftSliceGeometry: Gmetry = GeometryGenerationHelpers.makeSlice(latheUnbufferedGeometry, leftPlane);

    const rightPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    const rightSliceGeometry: Gmetry = GeometryGenerationHelpers.makeSlice(latheUnbufferedGeometry, rightPlane);

    const sliceMaterial: THREE.Material = DildoMaterials.createSliceMaterial(useTextureImage, wireframe, textureImagePath);
    // Find points on intersection path (this is a single path in this configuration)
    const planeGeom: THREE.PlaneGeometry = new THREE.PlaneGeometry(300, 500);
    const planeMesh: THREE.Mesh = new THREE.Mesh(
      planeGeom,
      new THREE.MeshBasicMaterial({
        color: 0x484848,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      })
    );
    planeMesh.rotation.x = Math.PI / 5;
    this.partialResults[KEY_SPLIT_PANE_MESH] = planeMesh;
    if (options.showSplitPane) {
      planeMesh.position.z = 0.5;
      this.addMesh(planeMesh);
    }
    const planeIntersectionPoints: Array<THREE.Vector3> = GeometryGenerationHelpers.makeAndAddPlaneIntersection(
      this,
      latheMesh,
      latheUnbufferedGeometry,
      planeMesh,
      planeGeom,
      options
    );

    // Find the connected path (there is only one if you choose the cut plane properly)
    // Note that it doesn't matter which slice geometry we use as left and right match
    // perfectly together at their cut plane.
    // Array<number[]>
    const connectedPaths: Array<number[]> = new PathFinder().findAllPathsOnMesh(leftSliceGeometry, planeIntersectionPoints);
    // TEST what the connected paths look like
    // TODO: add an option and only add to scene if desired.
    for (var p = 0; p < connectedPaths.length; p++) {
      // TODO: verify
      // const geometry: Gmetry = new Gmetry();
      // geometry.vertices = connectedPaths[p].map(function (geometryVertexIndex) {
      //   return leftSliceGeometry.vertices[geometryVertexIndex];
      // });
      const vertices = connectedPaths[p].map(function (geometryVertexIndex) {
        return leftSliceGeometry.vertices[geometryVertexIndex];
      });
      const geometry = GeometryGenerationHelpers.verticesToBufferGeometry(vertices);
      const linesMesh: THREE.Line = new THREE.Line(
        geometry, // .toBufferGeometry(),
        new THREE.LineBasicMaterial({
          color: randomWebColor(i, "Mixed") // 0x8800a8
        })
      );
      // linesMesh.position.y = -100;
      linesMesh.position.y = SPLIT_MESH_OFFSET.y;
      // linesMesh.position.z = -50;
      this.addMesh(linesMesh);
    }

    if (options.addPrecalculatedShapeOutlines) {
      // TEST what the line mesh looks like
      const pointGeometry: Gmetry = new Gmetry();
      pointGeometry.vertices = planeIntersectionPoints;
      var linesMesh = new THREE.Line(
        pointGeometry.toBufferGeometry(),
        new THREE.LineBasicMaterial({
          color: 0x8800a8
        })
      );
      // linesMesh.position.y = -100;
      // linesMesh.position.z = -50;
      linesMesh.position.y = SPLIT_MESH_OFFSET.y;
      linesMesh.position.z = SPLIT_MESH_OFFSET.z;
      this.addMesh(linesMesh);
    }

    // Triangulate connected paths
    const triangulatedGeometries: Array<Gmetry> = [];
    for (var i = 0; i < connectedPaths.length; i++) {
      const triangulationGeometry: Gmetry = GeometryGenerationHelpers.makePlaneTriangulation(
        this,
        leftSliceGeometry,
        connectedPaths[i],
        options
      );
      triangulatedGeometries.push(triangulationGeometry);
      // Merge together left and right slice geometry with the triangulated
      // cut faces.
      if (options.closeCutAreas) {
        mergeGeometries(leftSliceGeometry, triangulationGeometry, EPS);
        mergeGeometries(rightSliceGeometry, triangulationGeometry, EPS);
      }
    }

    // const arrangeSplitsOnPlane = true;

    if (options.showLeftSplit) {
      leftSliceGeometry.uvsNeedUpdate = true;
      // TODO: check if this is still required
      (leftSliceGeometry as unknown as any).buffersNeedUpdate = true;
      leftSliceGeometry.computeVertexNormals();
      const slicedMeshLeft: THREE.Mesh = new THREE.Mesh(leftSliceGeometry.toBufferGeometry(), sliceMaterial);
      // slicedMeshLeft.position.y = -100;
      // slicedMeshLeft.position.z = -50;
      slicedMeshLeft.position.y = SPLIT_MESH_OFFSET.y;
      slicedMeshLeft.position.z = SPLIT_MESH_OFFSET.z;
      // if (arrangeSplitsOnPlane) {
      //   // slicedMeshLeft.rotation.x = -Math.PI / 2;
      //   slicedMeshLeft.rotation.y = -Math.PI / 2.0;
      //   slicedMeshLeft.rotation.z = Math.PI / 2.0;
      // }
      slicedMeshLeft.userData["isExportable"] = true;
      this.addMesh(slicedMeshLeft);
      this.splitResults[KEY_SLICED_MESH_LEFT] = slicedMeshLeft;

      if (options.showNormals) {
        var vnHelper = new VertexNormalsHelper(slicedMeshLeft, options.normalsLength, 0x00ff00);
        this.scene.add(vnHelper);
        this.geometries.push(vnHelper);
      }
    }
    if (options.showRightSplit) {
      rightSliceGeometry.uvsNeedUpdate = true;
      // TODO: check if this is still required
      (rightSliceGeometry as unknown as any).buffersNeedUpdate = true;
      rightSliceGeometry.computeVertexNormals();
      const slicedMeshRight: THREE.Mesh = new THREE.Mesh(rightSliceGeometry.toBufferGeometry(), sliceMaterial);
      // slicedMeshRight.position.y = -100;
      // slicedMeshRight.position.z = 50;
      slicedMeshRight.position.y = SPLIT_MESH_OFFSET.y;
      slicedMeshRight.position.z = -SPLIT_MESH_OFFSET.z; // Important: use inverse value here!
      slicedMeshRight.userData["isExportable"] = true;
      this.addMesh(slicedMeshRight);
      this.splitResults[KEY_SLICED_MESH_RIGHT] = slicedMeshRight;

      if (options.showNormals) {
        var vnHelper = new VertexNormalsHelper(slicedMeshRight, options.normalsLength, 0x00ff00);
        this.scene.add(vnHelper);
        this.geometries.push(vnHelper);
      }
    }

    // Remember everything
    this.partialResults[KEY_LEFT_SLICE_PLANE] = leftPlane;
    this.partialResults[KEY_LEFT_SLICE_GEOMETRY] = leftSliceGeometry;
    this.partialResults[KEY_RIGHT_SLICE_PLANE] = rightPlane;
    this.partialResults[KEY_RIGHT_SLICE_GEOMETRY] = rightSliceGeometry;
    this.partialResults[KEY_PLANE_INTERSECTION_POINTS] = planeIntersectionPoints;
    this.partialResults[KEY_SPLIT_TRIANGULATION_GEOMETRIES] = triangulatedGeometries;
  }

  //   /**
  //    * Make a triangulation of the given path specified by the verted indices.
  //    *
  //    * @param {Array<number>} connectedPath - An array of vertex indices.
  //    * @return {ThreeGeometryHellfix.Gmetry} trianglesMesh
  //    */
  //   var makePlaneTriangulation = function (generator, sliceGeometry, connectedPath, options) {
  //     // Convert the connected paths indices to [x, y, x, y, x, y, ...] coordinates (requied by earcut)
  //     var currentPathXYData = connectedPath.reduce(function (earcutInput, vertIndex) {
  //       var vert = sliceGeometry.vertices[vertIndex];
  //       earcutInput.push(vert.x, vert.y);
  //       return earcutInput;
  //     }, []);
  //     // Array<number> : triplets of vertex indices in the plain XY array
  //     var triangles = earcut(currentPathXYData);

  //     // Convert triangle indices back to a geometry
  //     var trianglesGeometry = new Gmetry();
  //     // We will merge the geometries in the end which will create clones of the vertices.
  //     // No need to clone here.
  //     // trianglesGeometry.vertices = leftSliceGeometry.vertices;
  //     trianglesGeometry.vertices = connectedPath.map(function (geometryVertexIndex) {
  //       return sliceGeometry.vertices[geometryVertexIndex];
  //     });

  //     // Array<{x,y}> is compatible with Array<{x,y,z}> here :)
  //     var flatSideBounds = Bounds.computeFromVertices(trianglesGeometry.vertices);
  //     for (var t = 0; t < triangles.length; t += 3) {
  //       var a = triangles[t];
  //       var b = triangles[t + 1];
  //       var c = triangles[t + 2];
  //       trianglesGeometry.faces.push(new THREE.Face3(a, b, c));
  //       // Add UVs
  //       UVHelpers.makeFlatTriangleUVs(trianglesGeometry, flatSideBounds, a, b, c);
  //     }
  //     trianglesGeometry.uvsNeedUpdate = true;
  //     trianglesGeometry.buffersNeedUpdate = true;
  //     trianglesGeometry.computeVertexNormals();
  //     var trianglesMesh = new THREE.Mesh(
  //       trianglesGeometry,
  //       new THREE.MeshBasicMaterial({
  //         color: 0x0048ff,
  //         transparent: true,
  //         opacity: 0.55,
  //         side: THREE.DoubleSide
  //       })
  //     );
  //     trianglesMesh.position.y = -100;
  //     // trianglesMesh.position.z += 1.0; // Avoid Moiré with plane mesh?
  //     trianglesMesh.userData["isExportable"] = false;
  //     generator.partialResults[KEY_PLANE_INTERSECTION_TRIANGULATION] = trianglesGeometry;
  //     if (options.showSplitShapeTriangulation) {
  //       generator.addMesh(trianglesMesh);
  //     }
  //     return trianglesGeometry;
  //   };

  /**
   * Add a mesh to the underlying scene.
   *
   * The function will make some modifications to the rotation of the meshes.
   * @param {THREE.Mesh} mesh
   */
  addMesh(mesh) {
    mesh.rotation.x = Math.PI;
    this.scene.add(mesh);
    this.geometries.push(mesh);
  }

  removeCachedGeometries() {
    for (var i = 0; i < this.geometries.length; i++) {
      const old: THREE.Object3D = this.geometries[i];
      // Remove old object.
      //  A better way would be to update the lathe in-place. Possible?
      this.scene.remove(old);
      //   if (typeof old.dispose == "function") old.dispose();
      //   if (typeof old.material != "undefined" && typeof old.material.dispose == "function") old.material.dispose();
      if (old instanceof THREE.Mesh) {
        old.geometry.dispose();
        old.material.dispose();
      }
    }
    this.geometries = [];
  }

  clearResults() {
    this.splitResults[KEY_SLICED_MESH_RIGHT] = null;
    this.splitResults[KEY_SLICED_MESH_LEFT] = null;

    this.partialResults[KEY_LEFT_SLICE_PLANE] = null;
    this.partialResults[KEY_LEFT_SLICE_GEOMETRY] = null;
    this.partialResults[KEY_RIGHT_SLICE_PLANE] = null;
    this.partialResults[KEY_RIGHT_SLICE_GEOMETRY] = null;
    this.partialResults[KEY_PLANE_INTERSECTION_POINTS] = null;
    this.partialResults[KEY_SPLIT_TRIANGULATION_GEOMETRIES] = null;
  }

  /**
   * Generate an STL string from the (exportable) meshes that are currently stored inside this generator.
   *
   * @param {function(string)} options.onComplete
   **/
  generateSTL(options: ExportOptions, exporter: STLExporter) {
    // const exporter: STLExporter = new STLExporter();
    const stlBuffer: Array<string> = [];
    // TODO: merge all exportable geometries together and export as one.
    for (var i in this.geometries) {
      if (this.geometries[i].userData["isExportable"] === true) {
        const stlData: string = exporter.parse(this.geometries[i]);
        stlBuffer.push(stlData);
      }
    }
    if (typeof options.onComplete === "function") {
      options.onComplete(stlBuffer.join("\n\n"));
    } else {
      console.warn("STL data was generated but no 'onComplete' callback was defined.");
    }
  }
} // END class
