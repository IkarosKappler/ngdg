/**
 * Compute the intersection of a mesh and a plane.
 *
 * Inspired by
 *    https://stackoverflow.com/questions/42348495/three-js-find-all-points-where-a-mesh-intersects-a-plane
 *    https://jsfiddle.net/prisoner849/8uxw667m/
 *
 * @co-author Ikaros Kappler
 * @date 2021-06-11
 * @modified 2021-08-29 Ported to Typescript from vanilla JS.
 * @version 1.0.0
 */

import * as THREE from "three";
import { IDildoGeometry } from "./interfaces";

export class PlaneMeshIntersection {
  pointsOfIntersection: Array<THREE.Vector3>;
  a: THREE.Vector3;
  b: THREE.Vector3;
  c: THREE.Vector3;
  planePointA: THREE.Vector3;
  planePointB: THREE.Vector3;
  planePointC: THREE.Vector3;
  lineAB: THREE.Line3;
  lineBC: THREE.Line3;
  lineCA: THREE.Line3;
  pointOfIntersection: THREE.Vector3;

  /**
   * Constructor.
   */
  constructor() {
    //   Vector3[]
    this.pointsOfIntersection = [];

    this.a = new THREE.Vector3();
    this.b = new THREE.Vector3();
    this.c = new THREE.Vector3();
    this.planePointA = new THREE.Vector3();
    this.planePointB = new THREE.Vector3();
    this.planePointC = new THREE.Vector3();
    this.lineAB = new THREE.Line3();
    this.lineBC = new THREE.Line3();
    this.lineCA = new THREE.Line3();

    this.pointOfIntersection = new THREE.Vector3();
  }

  /**
   *
   * @param {THREE.Mesh} mesh
   * @param {THREE.Geometry} geometry
   * @param {THREE.Mesh} plane {THREE.PlaneGeometry ???
   * @returns {Array<THREE.Vector3>}
   */
  // TODO: plane type???
  getIntersectionPoints = (
    mesh: THREE.Mesh,
    geometry: THREE.Geometry | IDildoGeometry,
    plane: THREE.Mesh,
    planeGeometryReal: THREE.PlaneGeometry
  ): Array<THREE.Vector3> => {
    // Note: this could also work with a directly passed Mesh.Plane object instead a THREE.PlaneGeometry.
    this.pointsOfIntersection = [];
    var mathPlane = new THREE.Plane();
    // var planeGeometry : THREE.Geometry = (plane as unknown).geometry;
    // plane.localToWorld(this.planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
    // plane.localToWorld(this.planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
    // plane.localToWorld(this.planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
    plane.localToWorld(this.planePointA.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].a]));
    plane.localToWorld(this.planePointB.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].b]));
    plane.localToWorld(this.planePointC.copy(planeGeometryReal.vertices[planeGeometryReal.faces[0].c]));
    mathPlane.setFromCoplanarPoints(this.planePointA, this.planePointB, this.planePointC);

    var _self = this;
    geometry.faces.forEach(function (face) {
      mesh.localToWorld(_self.a.copy(geometry.vertices[face.a]));
      mesh.localToWorld(_self.b.copy(geometry.vertices[face.b]));
      mesh.localToWorld(_self.c.copy(geometry.vertices[face.c]));
      _self.lineAB = new THREE.Line3(_self.a, _self.b);
      _self.lineBC = new THREE.Line3(_self.b, _self.c);
      _self.lineCA = new THREE.Line3(_self.c, _self.a);
      _self.__setPointOfIntersection(_self.lineAB, mathPlane);
      _self.__setPointOfIntersection(_self.lineBC, mathPlane);
      _self.__setPointOfIntersection(_self.lineCA, mathPlane);
    });

    return this.pointsOfIntersection;
  };

  private __setPointOfIntersection = function (line: THREE.Line3, plane: THREE.Plane) {
    var intersectionPoint = plane.intersectLine(line, this.pointOfIntersection);
    if (intersectionPoint) {
      this.pointsOfIntersection.push(intersectionPoint.clone());
    }
  };
}
