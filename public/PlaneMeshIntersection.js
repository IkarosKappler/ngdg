/**
 * Compute the intersection of a mesh and a plane.
 *
 * Inspired by
 *    https://stackoverflow.com/questions/42348495/three-js-find-all-points-where-a-mesh-intersects-a-plane
 *    https://jsfiddle.net/prisoner849/8uxw667m/
 *
 * @co-author Ikaros Kappler
 * @date 2021-06-11
 * @version 1.0.0
 */
(function (context, THREE) {
  /**
   * Constructor.
   */
  var PlaneMeshIntersection = function () {
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
  };

  /**
   *
   * @param {THREE.Mesh} mesh
   * @param {THREE.Geometry} geometry
   * @param {THREE.PlaneGeometry} plane
   * @returns {Array<THREE.Vector3>}
   */
  PlaneMeshIntersection.prototype.getIntersectionPoints = function (mesh, geometry, plane) {
    // Note: this could also work with a directly passed Mesh.Plane object instead a THREE.PlaneGeometry.
    this.pointsOfIntersection = [];
    var mathPlane = new THREE.Plane();
    plane.localToWorld(this.planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
    plane.localToWorld(this.planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
    plane.localToWorld(this.planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
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

  PlaneMeshIntersection.prototype.__setPointOfIntersection = function (line, plane) {
    var intersectionPoint = plane.intersectLine(line, this.pointOfIntersection);
    if (intersectionPoint) {
      this.pointsOfIntersection.push(intersectionPoint.clone());
    }
  };

  context.PlaneMeshIntersection = PlaneMeshIntersection;
})(globalThis, THREE);
