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
 * @modified 2022-02-22 Replaced THREE.Geometry by ThreeGeometryHellfix.Gmetry.
 * @version 1.0.1
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
         * @param {ThreeGeometryHellfix.Gmetry} geometry
         * @param {THREE.Mesh} plane
         * @returns {Array<THREE.Vector3>}
         */
        this.getIntersectionPoints = function (mesh, geometry, plane, planeGeometryReal) {
            // Note: this could also work with a directly passed Mesh.Plane object instead a THREE.PlaneGeometry.
            _this.pointsOfIntersection = [];
            var mathPlane = new THREE.Plane();
            var _a = getThreePlanePoints(planeGeometryReal), a = _a[0], b = _a[1], c = _a[2];
            plane.localToWorld(_this.planePointA.copy(a));
            plane.localToWorld(_this.planePointB.copy(b));
            plane.localToWorld(_this.planePointC.copy(c));
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
            var intersectionPoint = plane.intersectLine(line, _this.pointOfIntersection);
            if (intersectionPoint) {
                _this.pointsOfIntersection.push(intersectionPoint.clone());
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
// https://discourse.threejs.org/t/three-geometry-will-be-removed-from-core-with-r125/22401/13
//
// Due to Mugen87 accessing vertices in the BufferGeometry (replacing Geomtry) works like this:
//
// const positionAttribute = MovingCube.geometry.getAttribute( 'position' );
// const localVertex = new THREE.Vector3();
// const globalVertex = new THREE.Vector3();
// for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
// 	localVertex.fromBufferAttribute( positionAttribute, vertexIndex );
// 	globalVertex.copy( localVertex ).applyMatrix4( MovingCube.matrixWorld );
// }
var getThreePlanePoints = function (planeGeometryReal) {
    var positionAttribute = planeGeometryReal.getAttribute("position");
    var localVertex = new THREE.Vector3();
    // const globalVertex = new THREE.Vector3();
    // for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
    // 	localVertex.fromBufferAttribute( positionAttribute, vertexIndex );
    // 	// globalVertex.copy( localVertex ).applyMatrix4( planeGeometryReal.matrixWorld );
    // }
    var a = new THREE.Vector3();
    var b = new THREE.Vector3();
    var c = new THREE.Vector3();
    a.fromBufferAttribute(positionAttribute, 0);
    b.fromBufferAttribute(positionAttribute, 1);
    c.fromBufferAttribute(positionAttribute, 2);
    return [a, b, c];
};
//# sourceMappingURL=PlaneMeshIntersection.js.map