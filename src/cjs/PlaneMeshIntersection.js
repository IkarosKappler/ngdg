"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaneMeshIntersection = void 0;
var THREE = require("three");
var PlaneMeshIntersection = /** @class */ (function () {
    /**
     * Constructor.
     */
    function PlaneMeshIntersection() {
        var _this = this;
        /**
         *
         * @param {THREE.Mesh} mesh
         * @param {THREE.Geometry} geometry
         * @param {THREE.PlaneGeometry} plane
         * @returns {Array<THREE.Vector3>}
         */
        this.getIntersectionPoints = function (mesh, geometry, plane) {
            // Note: this could also work with a directly passed Mesh.Plane object instead a THREE.PlaneGeometry.
            _this.pointsOfIntersection = [];
            var mathPlane = new THREE.Plane();
            plane.localToWorld(_this.planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
            plane.localToWorld(_this.planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
            plane.localToWorld(_this.planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
            mathPlane.setFromCoplanarPoints(_this.planePointA, _this.planePointB, _this.planePointC);
            var _self = _this;
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
            return _this.pointsOfIntersection;
        };
        this.__setPointOfIntersection = function (line, plane) {
            var intersectionPoint = plane.intersectLine(line, this.pointOfIntersection);
            if (intersectionPoint) {
                this.pointsOfIntersection.push(intersectionPoint.clone());
            }
        };
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
    return PlaneMeshIntersection;
}());
exports.PlaneMeshIntersection = PlaneMeshIntersection;
//# sourceMappingURL=PlaneMeshIntersection.js.map