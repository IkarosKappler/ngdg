/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/cjs/GeometryBuilder.js":
/*!************************************!*\
  !*** ./src/cjs/GeometryBuilder.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeometryBuilder = void 0;
var faces_from_edges_1 = __webpack_require__(/*! ./faces-from-edges */ "./src/cjs/faces-from-edges.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
var three_geometry_hellfix_1 = __webpack_require__(/*! three-geometry-hellfix */ "./node_modules/three-geometry-hellfix/src/esm/index.js");
var GeometryBuilder = /** @class */ (function () {
    function GeometryBuilder(sourceGeometry, targetGeometry, slicePlane) {
        this.sourceGeometry = sourceGeometry;
        this.targetGeometry = targetGeometry;
        this.slicePlane = slicePlane;
        this.addedVertices = [];
        this.addedIntersections = [];
        this.newEdges = [[]];
    }
    ;
    // TODO: check undfined?
    // This is called without params in line ---67 but param used here as an index??
    GeometryBuilder.prototype.startFace = function (sourceFaceIndex) {
        this.sourceFaceIndex = sourceFaceIndex;
        this.sourceFace = this.sourceGeometry.faces[sourceFaceIndex];
        this.sourceFaceUvs = this.sourceGeometry.faceVertexUvs[0][sourceFaceIndex];
        this.faceIndices = [];
        this.faceNormals = [];
        this.faceUvs = [];
    };
    ;
    GeometryBuilder.prototype.endFace = function () {
        var indices = this.faceIndices.map(function (index, i) {
            return i;
        });
        this.addFace(indices);
    };
    ;
    GeometryBuilder.prototype.closeHoles = function () {
        var _this = this;
        if (!this.newEdges[0].length) {
            return;
        }
        (0, faces_from_edges_1.facesFromEdges)(this.newEdges)
            .forEach(function (faceIndices) {
            var normal = _this.faceNormal(faceIndices);
            if (normal.dot(_this.slicePlane.normal) > .5) {
                faceIndices.reverse();
            }
            _this.startFace();
            _this.faceIndices = faceIndices;
            _this.endFace();
        }, this);
    };
    ;
    GeometryBuilder.prototype.addVertex = function (key) {
        this.addUv(key);
        this.addNormal(key);
        var index = this.sourceFace[key];
        var newIndex;
        if (this.addedVertices.hasOwnProperty(index)) {
            newIndex = this.addedVertices[index];
        }
        else {
            var vertex = this.sourceGeometry.vertices[index];
            this.targetGeometry.vertices.push(vertex);
            newIndex = this.targetGeometry.vertices.length - 1;
            this.addedVertices[index] = newIndex;
        }
        this.faceIndices.push(newIndex);
    };
    ;
    GeometryBuilder.prototype.addIntersection = function (keyA, keyB, distanceA, distanceB) {
        var t = Math.abs(distanceA) / (Math.abs(distanceA) + Math.abs(distanceB));
        this.addIntersectionUv(keyA, keyB, t);
        this.addIntersectionNormal(keyA, keyB, t);
        var indexA = this.sourceFace[keyA];
        var indexB = this.sourceFace[keyB];
        var id = this.intersectionId(indexA, indexB);
        var index;
        if (this.addedIntersections.hasOwnProperty(id)) {
            index = this.addedIntersections[id];
        }
        else {
            var vertexA = this.sourceGeometry.vertices[indexA];
            var vertexB = this.sourceGeometry.vertices[indexB];
            var newVertex = vertexA.clone().lerp(vertexB, t);
            this.targetGeometry.vertices.push(newVertex);
            index = this.targetGeometry.vertices.length - 1;
            this.addedIntersections[id] = index;
        }
        this.faceIndices.push(index);
        this.updateNewEdges(index);
    };
    ;
    GeometryBuilder.prototype.addUv = function (key) {
        if (!this.sourceFaceUvs) {
            return;
        }
        var index = this.keyIndex(key);
        var uv = this.sourceFaceUvs[index];
        this.faceUvs.push(uv);
    };
    ;
    GeometryBuilder.prototype.addIntersectionUv = function (keyA, keyB, t) {
        if (!this.sourceFaceUvs) {
            return;
        }
        var indexA = this.keyIndex(keyA);
        var indexB = this.keyIndex(keyB);
        var uvA = this.sourceFaceUvs[indexA];
        var uvB = this.sourceFaceUvs[indexB];
        var uv = uvA.clone().lerp(uvB, t);
        this.faceUvs.push(uv);
    };
    ;
    GeometryBuilder.prototype.addNormal = function (key) {
        if (!this.sourceFace.vertexNormals.length) {
            return;
        }
        var index = this.keyIndex(key);
        var normal = this.sourceFace.vertexNormals[index];
        this.faceNormals.push(normal);
    };
    ;
    GeometryBuilder.prototype.addIntersectionNormal = function (keyA, keyB, t) {
        if (!this.sourceFace.vertexNormals.length) {
            return;
        }
        var indexA = this.keyIndex(keyA);
        var indexB = this.keyIndex(keyB);
        var normalA = this.sourceFace.vertexNormals[indexA];
        var normalB = this.sourceFace.vertexNormals[indexB];
        var normal = normalA.clone().lerp(normalB, t).normalize();
        this.faceNormals.push(normal);
    };
    ;
    GeometryBuilder.prototype.addFace = function (indices) {
        var _this = this;
        if (indices.length === 3) {
            this.addFacePart(indices[0], indices[1], indices[2]);
            return;
        }
        var pairs = [];
        for (var i = 0; i < indices.length; i++) {
            for (var j = i + 1; j < indices.length; j++) {
                var diff = Math.abs(i - j);
                if (diff > 1 && diff < indices.length - 1) {
                    pairs.push([indices[i], indices[j]]);
                }
            }
        }
        pairs.sort((function (pairA, pairB) {
            var lengthA = _this.faceEdgeLength(pairA[0], pairA[1]);
            var lengthB = _this.faceEdgeLength(pairB[0], pairB[1]);
            return lengthA - lengthB;
        }).bind(this));
        var a = indices.indexOf(pairs[0][0]);
        indices = indices.slice(a).concat(indices.slice(0, a));
        var b = indices.indexOf(pairs[0][1]);
        var indicesA = indices.slice(0, b + 1);
        var indicesB = indices.slice(b).concat(indices.slice(0, 1));
        this.addFace(indicesA);
        this.addFace(indicesB);
    };
    ;
    GeometryBuilder.prototype.addFacePart = function (a, b, c) {
        var normals = null;
        if (this.faceNormals.length) {
            normals = [
                this.faceNormals[a],
                this.faceNormals[b],
                this.faceNormals[c],
            ];
        }
        var face = new three_geometry_hellfix_1.Face3(this.faceIndices[a], this.faceIndices[b], this.faceIndices[c], normals);
        this.targetGeometry.faces.push(face);
        if (!this.sourceFaceUvs) {
            return;
        }
        this.targetGeometry.faceVertexUvs[0].push([
            this.faceUvs[a],
            this.faceUvs[b],
            this.faceUvs[c]
        ]);
    };
    ;
    GeometryBuilder.prototype.faceEdgeLength = function (a, b) {
        var indexA = this.faceIndices[a];
        var indexB = this.faceIndices[b];
        var vertexA = this.targetGeometry.vertices[indexA];
        var vertexB = this.targetGeometry.vertices[indexB];
        return vertexA.distanceToSquared(vertexB);
    };
    ;
    GeometryBuilder.prototype.intersectionId = function (indexA, indexB) {
        return [indexA, indexB].sort().join(',');
    };
    ;
    GeometryBuilder.prototype.keyIndex = function (key) {
        return constants_1.FACE_KEYS.indexOf(key);
    };
    ;
    GeometryBuilder.prototype.updateNewEdges = function (index) {
        var edgeIndex = this.newEdges.length - 1;
        var edge = this.newEdges[edgeIndex];
        if (edge.length < 2) {
            edge.push(index);
        }
        else {
            this.newEdges.push([index]);
        }
    };
    ;
    GeometryBuilder.prototype.faceNormal = function (faceIndices) {
        var _this = this;
        var vertices = faceIndices.map((function (index) {
            return _this.targetGeometry.vertices[index];
        }).bind(this));
        var edgeA = vertices[0].clone().sub(vertices[1]);
        var edgeB = vertices[0].clone().sub(vertices[2]);
        return edgeA.cross(edgeB).normalize();
    };
    ;
    return GeometryBuilder;
}());
exports.GeometryBuilder = GeometryBuilder;
//# sourceMappingURL=GeometryBuilder.js.map

/***/ }),

/***/ "./src/cjs/constants.js":
/*!******************************!*\
  !*** ./src/cjs/constants.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FACE_KEYS = exports.ON = exports.BACK = exports.FRONT = void 0;
exports.FRONT = 'front';
exports.BACK = 'back';
exports.ON = 'on';
exports.FACE_KEYS = ['a', 'b', 'c'];
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./src/cjs/entry.js":
/*!**************************!*\
  !*** ./src/cjs/entry.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/** Expose the main function */

globalThis.sliceGeometry = __webpack_require__(/*! ./slice */ "./src/cjs/slice.js").sliceGeometry;

/***/ }),

/***/ "./src/cjs/faces-from-edges.js":
/*!*************************************!*\
  !*** ./src/cjs/faces-from-edges.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.facesFromEdges = void 0;
var facesFromEdges = function (edges) {
    var chains = joinEdges(edges).filter(validFace);
    var faces = chains.map(function (chain) {
        return chain.map(function (edge) {
            return edge[0];
        });
    });
    return faces;
};
exports.facesFromEdges = facesFromEdges;
var joinEdges = function (edges) {
    var changes = true;
    var chains = edges.map(function (edge) {
        return [edge];
    });
    while (changes) {
        changes = connectChains(chains);
    }
    chains = chains.filter(function (chain) {
        return chain.length;
    });
    return chains;
};
var connectChains = function (chains) {
    chains.forEach(function (chainA, i) {
        chains.forEach(function (chainB, j) {
            var merged = mergeChains(chainA, chainB);
            if (merged) {
                delete chains[j];
                return true;
            }
        });
    });
    return false;
};
var mergeChains = function (chainA, chainB) {
    if (chainA === chainB) {
        return false;
    }
    if (chainStart(chainA) === chainEnd(chainB)) {
        chainA.unshift.apply(chainA, chainB);
        return true;
    }
    if (chainStart(chainA) === chainStart(chainB)) {
        reverseChain(chainB);
        chainA.unshift.apply(chainA, chainB);
        return true;
    }
    if (chainEnd(chainA) === chainStart(chainB)) {
        chainA.push.apply(chainA, chainB);
        return true;
    }
    if (chainEnd(chainA) === chainEnd(chainB)) {
        reverseChain(chainB);
        chainA.push.apply(chainA, chainB);
        return true;
    }
    return false;
};
var chainStart = function (chain) {
    return chain[0][0];
};
var chainEnd = function (chain) {
    return chain[chain.length - 1][1];
};
var reverseChain = function (chain) {
    chain.reverse();
    chain.forEach(function (edge) {
        edge.reverse();
    });
};
var validFace = function (chain) {
    return chainStart(chain) === chainEnd(chain) ? 1 : 0;
};
//# sourceMappingURL=faces-from-edges.js.map

/***/ }),

/***/ "./src/cjs/slice.js":
/*!**************************!*\
  !*** ./src/cjs/slice.js ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sliceGeometry = void 0;
var GeometryBuilder_1 = __webpack_require__(/*! ./GeometryBuilder */ "./src/cjs/GeometryBuilder.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/cjs/constants.js");
var three_geometry_hellfix_1 = __webpack_require__(/*! three-geometry-hellfix */ "./node_modules/three-geometry-hellfix/src/esm/index.js");
var sliceGeometry = function (geometry, plane, closeHoles) {
    var sliced = new three_geometry_hellfix_1.Gmetry();
    var builder = new GeometryBuilder_1.GeometryBuilder(geometry, sliced, plane);
    var distances = [];
    var positions = [];
    geometry.vertices.forEach(function (vertex) {
        var distance = findDistance(vertex, plane);
        var position = distanceAsPosition(distance);
        distances.push(distance);
        positions.push(position);
    });
    geometry.faces.forEach(function (face, faceIndex) {
        var facePositions = constants_1.FACE_KEYS.map(function (key) {
            return positions[face[key]];
        });
        if (facePositions.indexOf(constants_1.FRONT) === -1 &&
            facePositions.indexOf(constants_1.BACK) !== -1) {
            return;
        }
        builder.startFace(faceIndex);
        var lastKey = constants_1.FACE_KEYS[constants_1.FACE_KEYS.length - 1];
        var lastIndex = face[lastKey];
        var lastDistance = distances[lastIndex];
        var lastPosition = positions[lastIndex];
        constants_1.FACE_KEYS.map(function (key) {
            var index = face[key];
            var distance = distances[index];
            var position = positions[index];
            if (position === constants_1.FRONT) {
                if (lastPosition === constants_1.BACK) {
                    builder.addIntersection(lastKey, key, lastDistance, distance);
                    builder.addVertex(key);
                }
                else {
                    builder.addVertex(key);
                }
            }
            if (position === constants_1.ON) {
                builder.addVertex(key);
            }
            if (position === constants_1.BACK && lastPosition === constants_1.FRONT) {
                builder.addIntersection(lastKey, key, lastDistance, distance);
            }
            lastKey = key;
            lastIndex = index;
            lastPosition = position;
            lastDistance = distance;
        });
        builder.endFace();
    });
    if (closeHoles) {
        builder.closeHoles();
    }
    return sliced;
};
exports.sliceGeometry = sliceGeometry;
var distanceAsPosition = function (distance) {
    if (distance < 0) {
        return constants_1.BACK;
    }
    if (distance > 0) {
        return constants_1.FRONT;
    }
    return constants_1.ON;
};
var findDistance = function (vertex, plane) {
    return plane.distanceToPoint(vertex);
};
//# sourceMappingURL=slice.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkthreejs_slice_geometry_typescript"] = self["webpackChunkthreejs_slice_geometry_typescript"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/cjs/entry.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=threejs-slice-geometry-typescript-main.js.map