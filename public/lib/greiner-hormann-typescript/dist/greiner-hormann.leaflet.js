/**
 * greiner-hormann v1.4.1
 * Greiner-Hormann clipping algorithm; Typescript port.
 *
 * @author Alexander Milevski <info@w8r.name>
 * @license MIT
 * @preserve
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.greinerHormann = {})));
}(this, (function (exports) { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var vertex = createCommonjsModule(function (module, exports) {
	/**
	 * TypeScript port by Ikaros Kappler.
	 *
	 * Original file https://github.com/w8r/GreinerHormann/blob/master/src/vertex.js
	 *
	 * @date 2020-11-30
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * Vertex representation.
	 */
	var Vertex = /** @class */ (function () {
	    /**
	     * Construct a new vertex.
	     *
	     * @constructor
	     * @param {Number|Array.<Number>} x
	     * @param {Number=}               y
	     */
	    function Vertex(x, y) {
	        if (arguments.length === 1) {
	            // Coords
	            if (Array.isArray(x)) {
	                this.y = x[1];
	                this.x = x[0];
	            }
	            else if (typeof x !== "number" && typeof x.x === "number" && typeof x.y === "number") {
	                this.y = x.y;
	                this.x = x.x;
	            }
	        }
	        else if (typeof x === "number" && typeof y === "number") {
	            this.x = x;
	            this.y = y;
	        }
	        else {
	            throw "Illegal vertex constrctor call: (" + typeof x + ", " + typeof y + ").";
	        }
	        this.next = null;
	        this.prev = null;
	        this._corresponding = null;
	        this._distance = 0.0;
	        this._isEntry = true;
	        this._isIntersection = false;
	        this._visited = false;
	    }
	    /**
	     * Creates intersection vertex
	     * @param  {Number} x
	     * @param  {Number} y
	     * @param  {Number} distance
	     * @return {Vertex}
	     */
	    Vertex.createIntersection = function (x, y, distance) {
	        var vertex = new Vertex(x, y);
	        vertex._distance = distance;
	        vertex._isIntersection = true;
	        vertex._isEntry = false;
	        return vertex;
	    };
	    /**
	     * Mark as visited
	     */
	    Vertex.prototype.visit = function () {
	        this._visited = true;
	        if (this._corresponding !== null && !this._corresponding._visited) {
	            this._corresponding.visit();
	        }
	    };
	    /**
	     * Convenience
	     * @param  {Vertex}  v
	     * @return {Boolean}
	     */
	    Vertex.prototype.equals = function (v) {
	        return this.x === v.x && this.y === v.y;
	    };
	    /**
	     * Check if vertex is inside a polygon by odd-even rule:
	     * If the number of intersections of a ray out of the point and polygon
	     * segments is odd - the point is inside.
	     * @param {Polygon} poly
	     * @return {Boolean}
	     */
	    Vertex.prototype.isInside = function (poly) {
	        var oddNodes = false;
	        var b;
	        var vertex = poly.first;
	        var next = vertex.next;
	        var x = this.x;
	        var y = this.y;
	        do {
	            if ((vertex.y < y && next.y >= y ||
	                next.y < y && vertex.y >= y) &&
	                (vertex.x <= x || next.x <= x)) {
	                // Hint: XOR does not really exist on boolean.
	                b = (vertex.x + (y - vertex.y) /
	                    (next.y - vertex.y) * (next.x - vertex.x) < x);
	                oddNodes = (!oddNodes && b) || (oddNodes && !b);
	            }
	            vertex = vertex.next;
	            next = vertex.next || poly.first;
	        } while (!vertex.equals(poly.first));
	        return oddNodes;
	    };
	    return Vertex;
	}()); // END class
	exports.default = Vertex;

	});

	unwrapExports(vertex);

	var intersection = createCommonjsModule(function (module, exports) {
	/**
	 * TypeScript port by Ikaros Kappler.
	 *
	 * Original file https://github.com/w8r/GreinerHormann/blob/master/src/intersection.js
	 *
	 * @date 2020-11-30
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * Defines an edge intersection.
	 */
	var Intersection = /** @class */ (function () {
	    /**
	     * @constructor
	     * @param {Vertex} s1 - Source edge vertex 1.
	     * @param {Vertex} s2 - Source edge vertex 2.
	     * @param {Vertex} c1 - Clip edge vertex 1.
	     * @param {Vertex} c2 - Clip edge vertex 2.
	     */
	    function Intersection(s1, s2, c1, c2) {
	        this.x = 0.0;
	        this.y = 0.0;
	        this.toSource = 0.0;
	        this.toClip = 0.0;
	        var d = (c2.y - c1.y) * (s2.x - s1.x) - (c2.x - c1.x) * (s2.y - s1.y);
	        if (d === 0)
	            { return; }
	        this.toSource = ((c2.x - c1.x) * (s1.y - c1.y) - (c2.y - c1.y) * (s1.x - c1.x)) / d;
	        this.toClip = ((s2.x - s1.x) * (s1.y - c1.y) - (s2.y - s1.y) * (s1.x - c1.x)) / d;
	        if (this.valid()) {
	            this.x = s1.x + this.toSource * (s2.x - s1.x);
	            this.y = s1.y + this.toSource * (s2.y - s1.y);
	        }
	    }
	    /**
	     * @return {Boolean}
	     */
	    Intersection.prototype.valid = function () {
	        return (0 < this.toSource && this.toSource < 1) && (0 < this.toClip && this.toClip < 1);
	    };
	    return Intersection;
	}());
	exports.default = Intersection;

	});

	unwrapExports(intersection);

	var polygon = createCommonjsModule(function (module, exports) {
	/**
	 * TypeScript port by Ikaros Kappler.
	 *
	 * Original file https://github.com/w8r/GreinerHormann/blob/master/src/polygon.js
	 *
	 * @date 2020-11-30
	 */
	Object.defineProperty(exports, "__esModule", { value: true });


	/**
	 * Polygon representation
	 */
	var Polygon = /** @class */ (function () {
	    /**
	     * Construct a new polygon.
	     *
	     * @constructor
	     * @param {Array.<Array.<Number>>} p
	     * @param {Boolean=}               arrayVertices
	     */
	    function Polygon(p, arrayVertices) {
	        this.first = null;
	        this.vertices = 0;
	        this._lastUnprocessed = null;
	        this._arrayVertices = (typeof arrayVertices === "undefined") ?
	            Array.isArray(p[0]) :
	            arrayVertices;
	        for (var i = 0, len = p.length; i < len; i++) {
	            this.addVertex(new vertex.default(p[i]));
	        }
	    }
	    /**
	     * Add a vertex object to the polygon
	     * (vertex is added at the 'end' of the list')
	     *
	     * @param vertex
	     */
	    Polygon.prototype.addVertex = function (vertex$$1) {
	        if (this.first === null) {
	            this.first = vertex$$1;
	            this.first.next = vertex$$1;
	            this.first.prev = vertex$$1;
	        }
	        else {
	            var next = this.first;
	            var prev = next.prev;
	            next.prev = vertex$$1;
	            vertex$$1.next = next;
	            vertex$$1.prev = prev;
	            prev.next = vertex$$1;
	        }
	        this.vertices++;
	    };
	    /**
	     * Inserts a vertex inbetween start and end
	     *
	     * @param {Vertex} vertex
	     * @param {Vertex} start
	     * @param {Vertex} end
	     */
	    Polygon.prototype.insertVertex = function (vertex$$1, start, end) {
	        var prev, curr = start;
	        while (!curr.equals(end) && curr._distance < vertex$$1._distance) {
	            curr = curr.next;
	        }
	        vertex$$1.next = curr;
	        prev = curr.prev;
	        vertex$$1.prev = prev;
	        prev.next = vertex$$1;
	        curr.prev = vertex$$1;
	        this.vertices++;
	    };
	    /**
	     * Get next non-intersection point
	     * @param  {Vertex} v
	     * @return {Vertex}
	     */
	    Polygon.prototype.getNext = function (v) {
	        var c = v;
	        while (c._isIntersection)
	            { c = c.next; }
	        return c;
	    };
	    /**
	     * Unvisited intersection
	     * @return {Vertex}
	     */
	    Polygon.prototype.getFirstIntersect = function () {
	        var v = this._firstIntersect || this.first;
	        do {
	            if (v._isIntersection && !v._visited)
	                { break; }
	            v = v.next;
	        } while (!v.equals(this.first));
	        this._firstIntersect = v;
	        return v;
	    };
	    /**
	     * Does the polygon have unvisited vertices
	     * @return {Boolean} [description]
	     */
	    Polygon.prototype.hasUnprocessed = function () {
	        var v = this._lastUnprocessed || this.first;
	        do {
	            if (v._isIntersection && !v._visited) {
	                this._lastUnprocessed = v;
	                return true;
	            }
	            v = v.next;
	        } while (!v.equals(this.first));
	        this._lastUnprocessed = null;
	        return false;
	    };
	    /**
	     * The output depends on what you put in, arrays or objects
	     * @return {Array.<Array<Number>|Array.<Object>}
	     */
	    // TODO: what type?
	    Polygon.prototype.getPoints = function () {
	        var points = [];
	        var v = this.first;
	        if (this._arrayVertices) {
	            do {
	                points.push([v.x, v.y]);
	                v = v.next;
	            } while (v !== this.first);
	        }
	        else {
	            do {
	                points.push({
	                    x: v.x,
	                    y: v.y
	                });
	                v = v.next;
	            } while (v !== this.first);
	        }
	        return points;
	    };
	    /**
	     * Clip polygon against another one.
	     * Result depends on algorithm direction:
	     *
	     * Intersection: forwards forwards
	     * Union:        backwars backwards
	     * Diff:         backwards forwards
	     *
	     * @param {Polygon} clip
	     * @param {Boolean} sourceForwards
	     * @param {Boolean} clipForwards
	     */
	    Polygon.prototype.clip = function (clip, sourceForwards, clipForwards) {
	        var sourceVertex = this.first;
	        var clipVertex = clip.first;
	        var sourceInClip;
	        var clipInSource;
	        var isUnion = !sourceForwards && !clipForwards;
	        var isIntersection = sourceForwards && clipForwards;
	        // calculate and mark intersections
	        do {
	            if (!sourceVertex._isIntersection) {
	                do {
	                    if (!clipVertex._isIntersection) {
	                        var i = new intersection.default(sourceVertex, this.getNext(sourceVertex.next), clipVertex, clip.getNext(clipVertex.next));
	                        if (i.valid()) {
	                            var sourceIntersection = vertex.default.createIntersection(i.x, i.y, i.toSource);
	                            var clipIntersection = vertex.default.createIntersection(i.x, i.y, i.toClip);
	                            sourceIntersection._corresponding = clipIntersection;
	                            clipIntersection._corresponding = sourceIntersection;
	                            this.insertVertex(sourceIntersection, sourceVertex, this.getNext(sourceVertex.next));
	                            clip.insertVertex(clipIntersection, clipVertex, clip.getNext(clipVertex.next));
	                        }
	                    }
	                    clipVertex = clipVertex.next;
	                } while (!clipVertex.equals(clip.first));
	            }
	            sourceVertex = sourceVertex.next;
	        } while (!sourceVertex.equals(this.first));
	        // phase two - identify entry/exit points
	        sourceVertex = this.first;
	        clipVertex = clip.first;
	        sourceInClip = sourceVertex.isInside(clip);
	        clipInSource = clipVertex.isInside(this);
	        // Hint: XOR does not really exists on boolean values and is not type safe in TypeScript
	        sourceForwards = (sourceForwards && !sourceInClip) || (!sourceForwards && sourceInClip);
	        clipForwards = (clipForwards && !clipInSource) || (!clipForwards && clipInSource);
	        do {
	            if (sourceVertex._isIntersection) {
	                sourceVertex._isEntry = sourceForwards;
	                sourceForwards = !sourceForwards;
	            }
	            sourceVertex = sourceVertex.next;
	        } while (!sourceVertex.equals(this.first));
	        do {
	            if (clipVertex._isIntersection) {
	                clipVertex._isEntry = clipForwards;
	                clipForwards = !clipForwards;
	            }
	            clipVertex = clipVertex.next;
	        } while (!clipVertex.equals(clip.first));
	        // phase three - construct a list of clipped polygons
	        var list = [];
	        while (this.hasUnprocessed()) {
	            var current = this.getFirstIntersect();
	            // keep format
	            var clipped = new Polygon([], this._arrayVertices);
	            clipped.addVertex(new vertex.default(current.x, current.y));
	            do {
	                current.visit();
	                if (current._isEntry) {
	                    do {
	                        current = current.next;
	                        clipped.addVertex(new vertex.default(current.x, current.y));
	                    } while (!current._isIntersection);
	                }
	                else {
	                    do {
	                        current = current.prev;
	                        clipped.addVertex(new vertex.default(current.x, current.y));
	                    } while (!current._isIntersection);
	                }
	                current = current._corresponding;
	            } while (!current._visited);
	            list.push(clipped.getPoints());
	        }
	        if (list.length === 0) {
	            if (isUnion) {
	                if (sourceInClip)
	                    { list.push(clip.getPoints()); }
	                else if (clipInSource)
	                    { list.push(this.getPoints()); }
	                else
	                    { list.push(this.getPoints(), clip.getPoints()); }
	            }
	            else if (isIntersection) { // intersection
	                if (sourceInClip)
	                    { list.push(this.getPoints()); }
	                else if (clipInSource)
	                    { list.push(clip.getPoints()); }
	            }
	            else { // diff
	                if (sourceInClip)
	                    { list.push(clip.getPoints(), this.getPoints()); }
	                else if (clipInSource)
	                    { list.push(this.getPoints(), clip.getPoints()); }
	                else
	                    { list.push(this.getPoints()); }
	            }
	            if (list.length === 0)
	                { list = null; }
	        }
	        return list;
	    };
	    return Polygon;
	}());
	exports.default = Polygon;

	});

	unwrapExports(polygon);

	var clip = createCommonjsModule(function (module, exports) {
	/**
	 * TypeScript port by Ikaros Kappler.
	 *
	 * Original file https://github.com/w8r/GreinerHormann/blob/master/src/clip.js
	 *
	 * @date 2020-11-30
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	/**
	 * Clip driver. Not that the type `Array<Array<number>>` in this case matches `IArrayVertex`.
	 * @param  {Array.<Array.<Number>>} polygonA
	 * @param  {Array.<Array.<Number>>} polygonB
	 * @param  {Boolean}                sourceForwards
	 * @param  {Boolean}                clipForwards
	 * @return {Array.<Array.<Number>>}
	 */
	exports.default = (function (polygonA, polygonB, eA, eB) {
	    var source = new polygon.default(polygonA);
	    var clip = new polygon.default(polygonB);
	    // We rely that, when Array Vertices are put in, then Array Vertices come out (not Object Vertices)
	    return source.clip(clip, eA, eB);
	});

	});

	unwrapExports(clip);

	var js = createCommonjsModule(function (module, exports) {
	/**
	 * TypeScript port by Ikaros Kappler.
	 *
	 * Original file https://github.com/w8r/GreinerHormann/blob/master/src/clip.leaflet.js
	 *
	 * @date 2020-11-30
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.clip = exports.diff = exports.intersection = exports.union = void 0;

	/**
	 * @param  {Array.<Array.<Number>|Array.<Object>} polygonA
	 * @param  {Array.<Array.<Number>|Array.<Object>} polygonB
	 * @return {Array.<Array.<Number>>|Array.<Array.<Object>|Null}
	 */
	var union = function (polygonA, polygonB) {
	    return clip.default(polygonA, polygonB, false, false);
	};
	exports.union = union;
	/**
	 * @param  {Array.<Array.<Number>|Array.<Object>} polygonA
	 * @param  {Array.<Array.<Number>|Array.<Object>} polygonB
	 * @return {Array.<Array.<Number>>|Array.<Array.<Object>>|Null}
	 */
	var intersection = function (polygonA, polygonB) {
	    return clip.default(polygonA, polygonB, true, true);
	};
	exports.intersection = intersection;
	/**
	 * @param  {Array.<Array.<Number>|Array.<Object>} polygonA
	 * @param  {Array.<Array.<Number>|Array.<Object>} polygonB
	 * @return {Array.<Array.<Number>>|Array.<Array.<Object>>|Null}
	 */
	var diff = function (polygonA, polygonB) {
	    return clip.default(polygonA, polygonB, false, true);
	};
	exports.diff = diff;
	exports.clip = clip.default;

	});

	var index = unwrapExports(js);
	var js_1 = js.clip;
	var js_2 = js.diff;
	var js_3 = js.intersection;
	var js_4 = js.union;

	exports.default = index;
	exports.clip = js_1;
	exports.diff = js_2;
	exports.intersection = js_3;
	exports.union = js_4;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=greiner-hormann.leaflet.js.map
