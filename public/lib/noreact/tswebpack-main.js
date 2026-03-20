/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/cjs/entry.js":
/*!**************************!*\
  !*** ./src/cjs/entry.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

// Expose all your components to the global scope here.

// First variant:
globalThis.MyClass = __webpack_require__(/*! ./myclasses */ "./src/cjs/myclasses.js").MyClass;


// Alternative variant: 
// you might wrap your components into a library.
// This is usually used to keep the gloal scope clean and avoid naming collisions
// with other libraries.
globalThis.MyLibrary = __webpack_require__(/*! ./mylibrary */ "./src/cjs/mylibrary.js").MyLibrary;


/***/ }),

/***/ "./src/cjs/myclasses.js":
/*!******************************!*\
  !*** ./src/cjs/myclasses.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyClass = void 0;
var myconstants_1 = __webpack_require__(/*! ./myconstants */ "./src/cjs/myconstants.js");
var myfunctions_1 = __webpack_require__(/*! ./myfunctions */ "./src/cjs/myfunctions.js");
var MyClass = /** @class */ (function () {
    function MyClass() {
        this.myNum = myconstants_1.CONST_A;
        this.myString = myconstants_1.CONST_B;
    }
    MyClass.prototype.getMe = function () {
        return (0, myfunctions_1.makeMyString)(this);
    };
    MyClass.prototype.getMeDouble = function () {
        return (0, myfunctions_1.makeDoubleString)((0, myfunctions_1.makeMyString)(this));
    };
    MyClass.prototype.printMe = function () {
        console.log(this.getMe());
    };
    MyClass.prototype.printMeDouble = function () {
        console.log(this.getMeDouble());
    };
    return MyClass;
}());
exports.MyClass = MyClass;
//# sourceMappingURL=myclasses.js.map

/***/ }),

/***/ "./src/cjs/myconstants.js":
/*!********************************!*\
  !*** ./src/cjs/myconstants.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CONST_B = exports.CONST_A = void 0;
exports.CONST_A = 1234;
exports.CONST_B = "Test";
//# sourceMappingURL=myconstants.js.map

/***/ }),

/***/ "./src/cjs/myfunctions.js":
/*!********************************!*\
  !*** ./src/cjs/myfunctions.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeDoubleString = exports.makeMyString = void 0;
// Test how external libraries are bundled.
// Note the '* as x' import, this is very important to get a runnable cjs module in the end.
// Don NOT use 
//   'import repeat from "repeat-string";
// that will not work in the end.
var repeat = __webpack_require__(/*! repeat-string */ "./node_modules/repeat-string/index.js");
var makeMyString = function (obj) { return "myNum=" + obj.myNum + " myString=" + obj.myString; };
exports.makeMyString = makeMyString;
var makeDoubleString = function (str) { return repeat(str, 2); };
exports.makeDoubleString = makeDoubleString;
//# sourceMappingURL=myfunctions.js.map

/***/ }),

/***/ "./src/cjs/mylibrary.js":
/*!******************************!*\
  !*** ./src/cjs/mylibrary.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyLibrary = void 0;
var myclasses_1 = __webpack_require__(/*! ./myclasses */ "./src/cjs/myclasses.js");
var myconstants_1 = __webpack_require__(/*! ./myconstants */ "./src/cjs/myconstants.js");
exports.MyLibrary = {
    MyClass: myclasses_1.MyClass,
    CONST_A: myconstants_1.CONST_A,
    CONST_B: myconstants_1.CONST_B
};
//# sourceMappingURL=mylibrary.js.map

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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
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
/******/ 		var chunkLoadingGlobal = self["webpackChunktswebpack"] = self["webpackChunktswebpack"] || [];
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
//# sourceMappingURL=tswebpack-main.js.map