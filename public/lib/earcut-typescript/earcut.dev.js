(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.earcut = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// Original algorithm by https://github.com/mapbox/earcut
//
// Ported to TypeScript by Ikaros Kappler
// @date 2020-12-08
Object.defineProperty(exports, "__esModule", { value: true });
exports.earcut = void 0;
;
exports.earcut = (function () {
    /**
     * Nodes of a linked list, each node representing a vertex of a ring (a polygon).
     */
    var Node = /** @class */ (function () {
        function Node(i, x, y) {
            // vertex index in coordinates array
            this.i = i;
            // vertex coordinates
            this.x = x;
            this.y = y;
            // previous and next vertex nodes in a polygon ring
            this.prev = null;
            this.next = null;
            // z-order curve value
            this.z = null;
            // previous and next nodes in z-order
            this.prevZ = null;
            this.nextZ = null;
            // indicates whether this is a steiner point
            this.steiner = false;
        }
        return Node;
    }());
    ;
    var earcut = function (data, holeIndices, dim) {
        if (dim === void 0) { dim = 2; }
        dim = dim || 2;
        var hasHoles = holeIndices && holeIndices.length > 0;
        var outerLen = hasHoles ? holeIndices[0] * dim : data.length;
        var outerNode = linkedList(data, 0, outerLen, dim, true);
        var triangles = []; // [t0a, t0b, t0c,  t1a, t2a, t3a, ... ]
        if (!outerNode || outerNode.next === outerNode.prev)
            return triangles;
        var minX;
        var minY;
        var maxX;
        var maxY;
        var x;
        var y;
        var invSize;
        if (hasHoles) {
            outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
        }
        // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
        // TODO: use Bounds class for calculation?
        if (data.length > 80 * dim) {
            minX = maxX = data[0];
            minY = maxY = data[1];
            for (var i = dim; i < outerLen; i += dim) {
                x = data[i];
                y = data[i + 1];
                if (x < minX)
                    minX = x;
                if (y < minY)
                    minY = y;
                if (x > maxX)
                    maxX = x;
                if (y > maxY)
                    maxY = y;
            }
            // minX, minY and invSize are later used to transform coords into integers for z-order calculation
            invSize = Math.max(maxX - minX, maxY - minY);
            invSize = invSize !== 0 ? 1 / invSize : 0;
        }
        earcutLinked(outerNode, triangles, dim, minX, minY, invSize);
        return triangles;
    };
    // create a circular doubly linked list from polygon points in the specified winding order
    var linkedList = function (data, start, end, dim, clockwise) {
        var i;
        var last;
        if (clockwise === (signedArea(data, start, end, dim) > 0)) {
            for (i = start; i < end; i += dim) {
                last = insertNode(i, data[i], data[i + 1], last);
            }
        }
        else {
            for (i = end - dim; i >= start; i -= dim) {
                last = insertNode(i, data[i], data[i + 1], last);
            }
        }
        if (last && equals(last, last.next)) {
            removeNode(last);
            last = last.next;
        }
        return last;
    };
    // eliminate colinear or duplicate points
    var filterPoints = function (start, end) {
        if (!start)
            return start;
        if (!end)
            end = start;
        // Remember starting node
        var p = start;
        var again = false;
        do {
            // TODO: move into 'else' branch?
            again = false;
            if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
                removeNode(p);
                p = end = p.prev;
                if (p === p.next)
                    break;
                again = true;
            }
            else {
                p = p.next;
            }
        } while (again || p !== end);
        return end;
    };
    // main ear slicing loop which triangulates a polygon (given as a linked list)
    var earcutLinked = function (ear, triangles, dim, minX, minY, invSize, pass) {
        if (!ear)
            return;
        // interlink polygon nodes in z-order
        if (!pass && invSize) {
            indexCurve(ear, minX, minY, invSize);
        }
        var stop = ear;
        var prev;
        var next;
        // iterate through ears, slicing them one by one
        while (ear.prev !== ear.next) {
            prev = ear.prev;
            next = ear.next;
            if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
                // cut off the triangle
                triangles.push(prev.i / dim);
                triangles.push(ear.i / dim);
                triangles.push(next.i / dim);
                removeNode(ear);
                // skipping the next vertex leads to less sliver triangles
                ear = next.next;
                stop = next.next;
                continue;
            }
            ear = next;
            // if we looped through the whole remaining polygon and can't find any more ears
            if (ear === stop) {
                // try filtering points and slicing again
                if (!pass) {
                    earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
                    // if this didn't work, try curing all small self-intersections locally
                }
                else if (pass === 1) {
                    ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
                    earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
                    // as a last resort, try splitting the remaining polygon into two
                }
                else if (pass === 2) {
                    splitEarcut(ear, triangles, dim, minX, minY, invSize);
                }
                break;
            }
        }
    }; // END earcutLinked
    // check whether a polygon node forms a valid ear with adjacent nodes
    var isEar = function (ear) {
        var a = ear.prev;
        var b = ear;
        var c = ear.next;
        if (area(a, b, c) >= 0)
            return false; // reflex, can't be an ear
        // now make sure we don't have other points inside the potential ear
        var p = ear.next.next;
        while (p !== ear.prev) {
            if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                area(p.prev, p, p.next) >= 0)
                return false;
            p = p.next;
        }
        return true;
    };
    var isEarHashed = function (ear, minX, minY, invSize) {
        var a = ear.prev;
        var b = ear;
        var c = ear.next;
        if (area(a, b, c) >= 0)
            return false; // reflex, can't be an ear
        // triangle bbox; min & max are calculated like this for speed
        // TODO: use Triangle.bounds
        var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x), minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y), maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x), maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);
        // z-order range for the current triangle bbox;
        var minZ = zOrder(minTX, minTY, minX, minY, invSize), maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);
        var p = ear.prevZ, n = ear.nextZ;
        // look for points inside the triangle in both directions
        while (p && p.z >= minZ && n && n.z <= maxZ) {
            if (p !== ear.prev && p !== ear.next &&
                // TODO: use Triangle.utils.pointIsInTriangle
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                area(p.prev, p, p.next) >= 0)
                return false;
            p = p.prevZ;
            if (n !== ear.prev && n !== ear.next &&
                // TODO: use Triangle.utils.pointIsInTriangle
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
                area(n.prev, n, n.next) >= 0)
                return false;
            n = n.nextZ;
        }
        // look for remaining points in decreasing z-order
        while (p && p.z >= minZ) {
            if (p !== ear.prev && p !== ear.next &&
                // TODO: use Triangle.utils.pointIsInTriangle
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                area(p.prev, p, p.next) >= 0)
                return false;
            p = p.prevZ;
        }
        // look for remaining points in increasing z-order
        while (n && n.z <= maxZ) {
            if (n !== ear.prev && n !== ear.next &&
                // TODO: use Triangle.utils.pointIsInTriangle
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
                area(n.prev, n, n.next) >= 0)
                return false;
            n = n.nextZ;
        }
        return true;
    };
    // go through all polygon nodes and cure small local self-intersections
    var cureLocalIntersections = function (start, triangles, dim) {
        var p = start;
        do {
            var a = p.prev;
            var b = p.next.next;
            if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
                triangles.push(a.i / dim);
                triangles.push(p.i / dim);
                triangles.push(b.i / dim);
                // remove two nodes involved
                removeNode(p);
                removeNode(p.next);
                p = start = b;
            }
            p = p.next;
        } while (p !== start);
        return filterPoints(p);
    };
    // try splitting polygon into two and triangulate them independently
    var splitEarcut = function (start, triangles, dim, minX, minY, invSize) {
        // look for a valid diagonal that divides the polygon into two
        var a = start;
        do {
            var b = a.next.next;
            while (b !== a.prev) {
                if (a.i !== b.i && isValidDiagonal(a, b)) {
                    // split the polygon in two by the diagonal
                    var c = splitPolygon(a, b);
                    // filter colinear points around the cuts
                    a = filterPoints(a, a.next);
                    c = filterPoints(c, c.next);
                    // run earcut on each half
                    earcutLinked(a, triangles, dim, minX, minY, invSize);
                    earcutLinked(c, triangles, dim, minX, minY, invSize);
                    return;
                }
                b = b.next;
            }
            a = a.next;
        } while (a !== start);
    };
    // link every hole into the outer loop, producing a single-ring polygon without holes
    var eliminateHoles = function (data, holeIndices, outerNode, dim) {
        var queue = [];
        var i;
        var len = holeIndices.length;
        var start;
        var end;
        var list;
        for (i = 0; i < len; i++) {
            start = holeIndices[i] * dim;
            end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            list = linkedList(data, start, end, dim, false);
            if (list === list.next)
                list.steiner = true;
            queue.push(getLeftmost(list));
        }
        queue.sort(compareX);
        // process holes from left to right
        for (i = 0; i < queue.length; i++) {
            eliminateHole(queue[i], outerNode);
            outerNode = filterPoints(outerNode, outerNode.next);
        }
        return outerNode;
    };
    var compareX = function (a, b) {
        return a.x - b.x;
    };
    // find a bridge between vertices that connects hole with an outer ring and and link it
    var eliminateHole = function (hole, outerNode) {
        var bridge = findHoleBridge(hole, outerNode);
        if (!bridge) {
            return outerNode;
        }
        var bridgeReverse = splitPolygon(bridge, hole);
        // filter collinear points around the cuts
        var filteredBridge = filterPoints(bridge, bridge.next);
        filterPoints(bridgeReverse, bridgeReverse.next);
        // Check if input node was removed by the filtering
        return outerNode === bridge ? filteredBridge : outerNode;
        // }
    };
    // David Eberly's algorithm for finding a bridge between hole and outer polygon
    var findHoleBridge = function (hole, outerNode) {
        var p = outerNode;
        var hx = hole.x;
        var hy = hole.y;
        var qx = -Infinity;
        var m;
        // find a segment intersected by a ray from the hole's leftmost point to the left;
        // segment's endpoint with lesser x will be potential connection point
        do {
            if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
                var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
                if (x <= hx && x > qx) {
                    qx = x;
                    if (x === hx) {
                        if (hy === p.y)
                            return p;
                        if (hy === p.next.y)
                            return p.next;
                    }
                    m = p.x < p.next.x ? p : p.next;
                }
            }
            p = p.next;
        } while (p !== outerNode);
        if (!m) {
            return null;
        }
        if (hx === qx) {
            return m; // hole touches outer segment; pick leftmost endpoint
        }
        // look for points inside the triangle of hole point, segment intersection and endpoint;
        // if there are no points found, we have a valid connection;
        // otherwise choose the point of the minimum angle with the ray as connection point
        var stop = m;
        var mx = m.x;
        var my = m.y;
        var tanMin = Infinity;
        var tan;
        p = m;
        do {
            if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
                tan = Math.abs(hy - p.y) / (hx - p.x); // tangential
                if (locallyInside(p, hole) &&
                    (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
                    m = p;
                    tanMin = tan;
                }
            }
            p = p.next;
        } while (p !== stop);
        return m;
    };
    // whether sector in vertex m contains sector in vertex p in the same coordinates
    var sectorContainsSector = function (m, p) {
        return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
    };
    // interlink polygon nodes in z-order
    var indexCurve = function (start, minX, minY, invSize) {
        var p = start;
        do {
            if (p.z === null)
                p.z = zOrder(p.x, p.y, minX, minY, invSize);
            p.prevZ = p.prev;
            p.nextZ = p.next;
            p = p.next;
        } while (p !== start);
        p.prevZ.nextZ = null;
        p.prevZ = null;
        sortLinked(p);
    };
    // Simon Tatham's linked list merge sort algorithm
    // http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
    var sortLinked = function (list) {
        var i;
        var p;
        var q;
        var e;
        var tail;
        var numMerges;
        var pSize;
        var qSize;
        var inSize = 1;
        do {
            p = list;
            list = null;
            tail = null;
            numMerges = 0;
            while (p) {
                numMerges++;
                q = p;
                pSize = 0;
                for (i = 0; i < inSize; i++) {
                    pSize++;
                    q = q.nextZ;
                    if (!q)
                        break;
                }
                qSize = inSize;
                while (pSize > 0 || (qSize > 0 && q)) {
                    if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                        e = p;
                        p = p.nextZ;
                        pSize--;
                    }
                    else {
                        e = q;
                        q = q.nextZ;
                        qSize--;
                    }
                    if (tail)
                        tail.nextZ = e;
                    else
                        list = e;
                    e.prevZ = tail;
                    tail = e;
                }
                p = q;
            }
            tail.nextZ = null;
            inSize *= 2;
        } while (numMerges > 1);
        return list;
    };
    // z-order of a point given coords and inverse of the longer side of data bbox
    var zOrder = function (x, y, minX, minY, invSize) {
        // coords are transformed into non-negative 15-bit integer range
        x = 32767 * (x - minX) * invSize;
        y = 32767 * (y - minY) * invSize;
        x = (x | (x << 8)) & 0x00FF00FF;
        x = (x | (x << 4)) & 0x0F0F0F0F;
        x = (x | (x << 2)) & 0x33333333;
        x = (x | (x << 1)) & 0x55555555;
        y = (y | (y << 8)) & 0x00FF00FF;
        y = (y | (y << 4)) & 0x0F0F0F0F;
        y = (y | (y << 2)) & 0x33333333;
        y = (y | (y << 1)) & 0x55555555;
        return x | (y << 1);
    };
    // find the leftmost node of a polygon ring
    var getLeftmost = function (start) {
        var p = start;
        var leftmost = start;
        do {
            if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) {
                leftmost = p;
            }
            p = p.next;
        } while (p !== start);
        return leftmost;
    };
    // check if a point lies within a convex triangle
    // TODO: use Triangle.containsPoint
    var pointInTriangle = function (ax, ay, bx, by, cx, cy, px, py) {
        return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
            (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
            (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
    };
    // check if a diagonal between two polygon nodes is valid (lies in polygon interior)
    var isValidDiagonal = function (a, b) {
        return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
            (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
                (area(a.prev, a, b.prev) != 0 || area(a, b.prev, b)) != 0 || // does not create opposite-facing sectors
                equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0); // special zero-length case
    };
    // signed area of a triangle
    var area = function (p, q, r) {
        return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    };
    // check if two points are equal
    // TODO: as member function of vertex
    var equals = function (p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    };
    // check if two segments intersect
    // TODO: use Line.intersects
    var intersects = function (p1, q1, p2, q2) {
        var o1 = sign(area(p1, q1, p2));
        var o2 = sign(area(p1, q1, q2));
        var o3 = sign(area(p2, q2, p1));
        var o4 = sign(area(p2, q2, q1));
        if (o1 !== o2 && o3 !== o4)
            return true; // general case
        if (o1 === 0 && onSegment(p1, p2, q1))
            return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
        if (o2 === 0 && onSegment(p1, q2, q1))
            return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
        if (o3 === 0 && onSegment(p2, p1, q2))
            return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
        if (o4 === 0 && onSegment(p2, q1, q2))
            return true; // p2, q2 and q1 are collinear and q1 lies on p2q2
        return false;
    };
    // for collinear points p, q, r, check if point q lies on segment pr
    var onSegment = function (p, q, r) {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    };
    var sign = function (num) {
        return num > 0 ? 1 : num < 0 ? -1 : 0;
    };
    // check if a polygon diagonal intersects any polygon segments
    var intersectsPolygon = function (a, b) {
        var p = a;
        do {
            if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) {
                return true;
            }
            p = p.next;
        } while (p !== a);
        return false;
    };
    // check if a polygon diagonal is locally inside the polygon
    var locallyInside = function (a, b) {
        return area(a.prev, a, a.next) < 0 ?
            area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
            area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
    };
    // check if the middle point of a polygon diagonal is inside the polygon
    var middleInside = function (a, b) {
        var p = a;
        var inside = false;
        var px = (a.x + b.x) / 2;
        var py = (a.y + b.y) / 2;
        // TODO: call Polygon.contains here?
        do {
            if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
                inside = !inside;
            p = p.next;
        } while (p !== a);
        return inside;
    };
    // link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
    // if one belongs to the outer ring and another to a hole, it merges it into a single ring
    var splitPolygon = function (a, b) {
        var a2 = new Node(a.i, a.x, a.y);
        var b2 = new Node(b.i, b.x, b.y);
        var an = a.next;
        var bp = b.prev;
        a.next = b;
        b.prev = a;
        a2.next = an;
        an.prev = a2;
        b2.next = a2;
        a2.prev = b2;
        bp.next = b2;
        b2.prev = bp;
        return b2;
    };
    // create a node and optionally link it with previous one (in a circular doubly linked list)
    var insertNode = function (i, x, y, last) {
        var p = new Node(i, x, y);
        if (!last) {
            p.prev = p;
            p.next = p;
        }
        else {
            p.next = last.next;
            p.prev = last;
            last.next.prev = p;
            last.next = p;
        }
        return p;
    };
    var removeNode = function (p) {
        p.next.prev = p.prev;
        p.prev.next = p.next;
        if (p.prevZ)
            p.prevZ.nextZ = p.nextZ;
        if (p.nextZ)
            p.nextZ.prevZ = p.prevZ;
    };
    var signedArea = function (data, start, end, dim) {
        var sum = 0;
        for (var i = start, j = end - dim; i < end; i += dim) {
            sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
            j = i;
        }
        return sum;
    };
    return earcut;
})();

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2pzL2VhcmN1dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBPcmlnaW5hbCBhbGdvcml0aG0gYnkgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9lYXJjdXRcbi8vXG4vLyBQb3J0ZWQgdG8gVHlwZVNjcmlwdCBieSBJa2Fyb3MgS2FwcGxlclxuLy8gQGRhdGUgMjAyMC0xMi0wOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5lYXJjdXQgPSB2b2lkIDA7XG47XG5leHBvcnRzLmVhcmN1dCA9IChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogTm9kZXMgb2YgYSBsaW5rZWQgbGlzdCwgZWFjaCBub2RlIHJlcHJlc2VudGluZyBhIHZlcnRleCBvZiBhIHJpbmcgKGEgcG9seWdvbikuXG4gICAgICovXG4gICAgdmFyIE5vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIE5vZGUoaSwgeCwgeSkge1xuICAgICAgICAgICAgLy8gdmVydGV4IGluZGV4IGluIGNvb3JkaW5hdGVzIGFycmF5XG4gICAgICAgICAgICB0aGlzLmkgPSBpO1xuICAgICAgICAgICAgLy8gdmVydGV4IGNvb3JkaW5hdGVzXG4gICAgICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgICAgIC8vIHByZXZpb3VzIGFuZCBuZXh0IHZlcnRleCBub2RlcyBpbiBhIHBvbHlnb24gcmluZ1xuICAgICAgICAgICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgICAgICAvLyB6LW9yZGVyIGN1cnZlIHZhbHVlXG4gICAgICAgICAgICB0aGlzLnogPSBudWxsO1xuICAgICAgICAgICAgLy8gcHJldmlvdXMgYW5kIG5leHQgbm9kZXMgaW4gei1vcmRlclxuICAgICAgICAgICAgdGhpcy5wcmV2WiA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm5leHRaID0gbnVsbDtcbiAgICAgICAgICAgIC8vIGluZGljYXRlcyB3aGV0aGVyIHRoaXMgaXMgYSBzdGVpbmVyIHBvaW50XG4gICAgICAgICAgICB0aGlzLnN0ZWluZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm9kZTtcbiAgICB9KCkpO1xuICAgIDtcbiAgICB2YXIgZWFyY3V0ID0gZnVuY3Rpb24gKGRhdGEsIGhvbGVJbmRpY2VzLCBkaW0pIHtcbiAgICAgICAgaWYgKGRpbSA9PT0gdm9pZCAwKSB7IGRpbSA9IDI7IH1cbiAgICAgICAgZGltID0gZGltIHx8IDI7XG4gICAgICAgIHZhciBoYXNIb2xlcyA9IGhvbGVJbmRpY2VzICYmIGhvbGVJbmRpY2VzLmxlbmd0aCA+IDA7XG4gICAgICAgIHZhciBvdXRlckxlbiA9IGhhc0hvbGVzID8gaG9sZUluZGljZXNbMF0gKiBkaW0gOiBkYXRhLmxlbmd0aDtcbiAgICAgICAgdmFyIG91dGVyTm9kZSA9IGxpbmtlZExpc3QoZGF0YSwgMCwgb3V0ZXJMZW4sIGRpbSwgdHJ1ZSk7XG4gICAgICAgIHZhciB0cmlhbmdsZXMgPSBbXTsgLy8gW3QwYSwgdDBiLCB0MGMsICB0MWEsIHQyYSwgdDNhLCAuLi4gXVxuICAgICAgICBpZiAoIW91dGVyTm9kZSB8fCBvdXRlck5vZGUubmV4dCA9PT0gb3V0ZXJOb2RlLnByZXYpXG4gICAgICAgICAgICByZXR1cm4gdHJpYW5nbGVzO1xuICAgICAgICB2YXIgbWluWDtcbiAgICAgICAgdmFyIG1pblk7XG4gICAgICAgIHZhciBtYXhYO1xuICAgICAgICB2YXIgbWF4WTtcbiAgICAgICAgdmFyIHg7XG4gICAgICAgIHZhciB5O1xuICAgICAgICB2YXIgaW52U2l6ZTtcbiAgICAgICAgaWYgKGhhc0hvbGVzKSB7XG4gICAgICAgICAgICBvdXRlck5vZGUgPSBlbGltaW5hdGVIb2xlcyhkYXRhLCBob2xlSW5kaWNlcywgb3V0ZXJOb2RlLCBkaW0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHRoZSBzaGFwZSBpcyBub3QgdG9vIHNpbXBsZSwgd2UnbGwgdXNlIHotb3JkZXIgY3VydmUgaGFzaCBsYXRlcjsgY2FsY3VsYXRlIHBvbHlnb24gYmJveFxuICAgICAgICAvLyBUT0RPOiB1c2UgQm91bmRzIGNsYXNzIGZvciBjYWxjdWxhdGlvbj9cbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gODAgKiBkaW0pIHtcbiAgICAgICAgICAgIG1pblggPSBtYXhYID0gZGF0YVswXTtcbiAgICAgICAgICAgIG1pblkgPSBtYXhZID0gZGF0YVsxXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBkaW07IGkgPCBvdXRlckxlbjsgaSArPSBkaW0pIHtcbiAgICAgICAgICAgICAgICB4ID0gZGF0YVtpXTtcbiAgICAgICAgICAgICAgICB5ID0gZGF0YVtpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKHggPCBtaW5YKVxuICAgICAgICAgICAgICAgICAgICBtaW5YID0geDtcbiAgICAgICAgICAgICAgICBpZiAoeSA8IG1pblkpXG4gICAgICAgICAgICAgICAgICAgIG1pblkgPSB5O1xuICAgICAgICAgICAgICAgIGlmICh4ID4gbWF4WClcbiAgICAgICAgICAgICAgICAgICAgbWF4WCA9IHg7XG4gICAgICAgICAgICAgICAgaWYgKHkgPiBtYXhZKVxuICAgICAgICAgICAgICAgICAgICBtYXhZID0geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG1pblgsIG1pblkgYW5kIGludlNpemUgYXJlIGxhdGVyIHVzZWQgdG8gdHJhbnNmb3JtIGNvb3JkcyBpbnRvIGludGVnZXJzIGZvciB6LW9yZGVyIGNhbGN1bGF0aW9uXG4gICAgICAgICAgICBpbnZTaXplID0gTWF0aC5tYXgobWF4WCAtIG1pblgsIG1heFkgLSBtaW5ZKTtcbiAgICAgICAgICAgIGludlNpemUgPSBpbnZTaXplICE9PSAwID8gMSAvIGludlNpemUgOiAwO1xuICAgICAgICB9XG4gICAgICAgIGVhcmN1dExpbmtlZChvdXRlck5vZGUsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcbiAgICAgICAgcmV0dXJuIHRyaWFuZ2xlcztcbiAgICB9O1xuICAgIC8vIGNyZWF0ZSBhIGNpcmN1bGFyIGRvdWJseSBsaW5rZWQgbGlzdCBmcm9tIHBvbHlnb24gcG9pbnRzIGluIHRoZSBzcGVjaWZpZWQgd2luZGluZyBvcmRlclxuICAgIHZhciBsaW5rZWRMaXN0ID0gZnVuY3Rpb24gKGRhdGEsIHN0YXJ0LCBlbmQsIGRpbSwgY2xvY2t3aXNlKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgbGFzdDtcbiAgICAgICAgaWYgKGNsb2Nrd2lzZSA9PT0gKHNpZ25lZEFyZWEoZGF0YSwgc3RhcnQsIGVuZCwgZGltKSA+IDApKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSBkaW0pIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gaW5zZXJ0Tm9kZShpLCBkYXRhW2ldLCBkYXRhW2kgKyAxXSwgbGFzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGkgPSBlbmQgLSBkaW07IGkgPj0gc3RhcnQ7IGkgLT0gZGltKSB7XG4gICAgICAgICAgICAgICAgbGFzdCA9IGluc2VydE5vZGUoaSwgZGF0YVtpXSwgZGF0YVtpICsgMV0sIGxhc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChsYXN0ICYmIGVxdWFscyhsYXN0LCBsYXN0Lm5leHQpKSB7XG4gICAgICAgICAgICByZW1vdmVOb2RlKGxhc3QpO1xuICAgICAgICAgICAgbGFzdCA9IGxhc3QubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGFzdDtcbiAgICB9O1xuICAgIC8vIGVsaW1pbmF0ZSBjb2xpbmVhciBvciBkdXBsaWNhdGUgcG9pbnRzXG4gICAgdmFyIGZpbHRlclBvaW50cyA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gICAgICAgIGlmICghc3RhcnQpXG4gICAgICAgICAgICByZXR1cm4gc3RhcnQ7XG4gICAgICAgIGlmICghZW5kKVxuICAgICAgICAgICAgZW5kID0gc3RhcnQ7XG4gICAgICAgIC8vIFJlbWVtYmVyIHN0YXJ0aW5nIG5vZGVcbiAgICAgICAgdmFyIHAgPSBzdGFydDtcbiAgICAgICAgdmFyIGFnYWluID0gZmFsc2U7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8vIFRPRE86IG1vdmUgaW50byAnZWxzZScgYnJhbmNoP1xuICAgICAgICAgICAgYWdhaW4gPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICghcC5zdGVpbmVyICYmIChlcXVhbHMocCwgcC5uZXh0KSB8fCBhcmVhKHAucHJldiwgcCwgcC5uZXh0KSA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVOb2RlKHApO1xuICAgICAgICAgICAgICAgIHAgPSBlbmQgPSBwLnByZXY7XG4gICAgICAgICAgICAgICAgaWYgKHAgPT09IHAubmV4dClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgYWdhaW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcCA9IHAubmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoYWdhaW4gfHwgcCAhPT0gZW5kKTtcbiAgICAgICAgcmV0dXJuIGVuZDtcbiAgICB9O1xuICAgIC8vIG1haW4gZWFyIHNsaWNpbmcgbG9vcCB3aGljaCB0cmlhbmd1bGF0ZXMgYSBwb2x5Z29uIChnaXZlbiBhcyBhIGxpbmtlZCBsaXN0KVxuICAgIHZhciBlYXJjdXRMaW5rZWQgPSBmdW5jdGlvbiAoZWFyLCB0cmlhbmdsZXMsIGRpbSwgbWluWCwgbWluWSwgaW52U2l6ZSwgcGFzcykge1xuICAgICAgICBpZiAoIWVhcilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gaW50ZXJsaW5rIHBvbHlnb24gbm9kZXMgaW4gei1vcmRlclxuICAgICAgICBpZiAoIXBhc3MgJiYgaW52U2l6ZSkge1xuICAgICAgICAgICAgaW5kZXhDdXJ2ZShlYXIsIG1pblgsIG1pblksIGludlNpemUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdG9wID0gZWFyO1xuICAgICAgICB2YXIgcHJldjtcbiAgICAgICAgdmFyIG5leHQ7XG4gICAgICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCBlYXJzLCBzbGljaW5nIHRoZW0gb25lIGJ5IG9uZVxuICAgICAgICB3aGlsZSAoZWFyLnByZXYgIT09IGVhci5uZXh0KSB7XG4gICAgICAgICAgICBwcmV2ID0gZWFyLnByZXY7XG4gICAgICAgICAgICBuZXh0ID0gZWFyLm5leHQ7XG4gICAgICAgICAgICBpZiAoaW52U2l6ZSA/IGlzRWFySGFzaGVkKGVhciwgbWluWCwgbWluWSwgaW52U2l6ZSkgOiBpc0VhcihlYXIpKSB7XG4gICAgICAgICAgICAgICAgLy8gY3V0IG9mZiB0aGUgdHJpYW5nbGVcbiAgICAgICAgICAgICAgICB0cmlhbmdsZXMucHVzaChwcmV2LmkgLyBkaW0pO1xuICAgICAgICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKGVhci5pIC8gZGltKTtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZXMucHVzaChuZXh0LmkgLyBkaW0pO1xuICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoZWFyKTtcbiAgICAgICAgICAgICAgICAvLyBza2lwcGluZyB0aGUgbmV4dCB2ZXJ0ZXggbGVhZHMgdG8gbGVzcyBzbGl2ZXIgdHJpYW5nbGVzXG4gICAgICAgICAgICAgICAgZWFyID0gbmV4dC5uZXh0O1xuICAgICAgICAgICAgICAgIHN0b3AgPSBuZXh0Lm5leHQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlYXIgPSBuZXh0O1xuICAgICAgICAgICAgLy8gaWYgd2UgbG9vcGVkIHRocm91Z2ggdGhlIHdob2xlIHJlbWFpbmluZyBwb2x5Z29uIGFuZCBjYW4ndCBmaW5kIGFueSBtb3JlIGVhcnNcbiAgICAgICAgICAgIGlmIChlYXIgPT09IHN0b3ApIHtcbiAgICAgICAgICAgICAgICAvLyB0cnkgZmlsdGVyaW5nIHBvaW50cyBhbmQgc2xpY2luZyBhZ2FpblxuICAgICAgICAgICAgICAgIGlmICghcGFzcykge1xuICAgICAgICAgICAgICAgICAgICBlYXJjdXRMaW5rZWQoZmlsdGVyUG9pbnRzKGVhciksIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhpcyBkaWRuJ3Qgd29yaywgdHJ5IGN1cmluZyBhbGwgc21hbGwgc2VsZi1pbnRlcnNlY3Rpb25zIGxvY2FsbHlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocGFzcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBlYXIgPSBjdXJlTG9jYWxJbnRlcnNlY3Rpb25zKGZpbHRlclBvaW50cyhlYXIpLCB0cmlhbmdsZXMsIGRpbSk7XG4gICAgICAgICAgICAgICAgICAgIGVhcmN1dExpbmtlZChlYXIsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYXMgYSBsYXN0IHJlc29ydCwgdHJ5IHNwbGl0dGluZyB0aGUgcmVtYWluaW5nIHBvbHlnb24gaW50byB0d29cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocGFzcyA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBzcGxpdEVhcmN1dChlYXIsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9OyAvLyBFTkQgZWFyY3V0TGlua2VkXG4gICAgLy8gY2hlY2sgd2hldGhlciBhIHBvbHlnb24gbm9kZSBmb3JtcyBhIHZhbGlkIGVhciB3aXRoIGFkamFjZW50IG5vZGVzXG4gICAgdmFyIGlzRWFyID0gZnVuY3Rpb24gKGVhcikge1xuICAgICAgICB2YXIgYSA9IGVhci5wcmV2O1xuICAgICAgICB2YXIgYiA9IGVhcjtcbiAgICAgICAgdmFyIGMgPSBlYXIubmV4dDtcbiAgICAgICAgaWYgKGFyZWEoYSwgYiwgYykgPj0gMClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gcmVmbGV4LCBjYW4ndCBiZSBhbiBlYXJcbiAgICAgICAgLy8gbm93IG1ha2Ugc3VyZSB3ZSBkb24ndCBoYXZlIG90aGVyIHBvaW50cyBpbnNpZGUgdGhlIHBvdGVudGlhbCBlYXJcbiAgICAgICAgdmFyIHAgPSBlYXIubmV4dC5uZXh0O1xuICAgICAgICB3aGlsZSAocCAhPT0gZWFyLnByZXYpIHtcbiAgICAgICAgICAgIGlmIChwb2ludEluVHJpYW5nbGUoYS54LCBhLnksIGIueCwgYi55LCBjLngsIGMueSwgcC54LCBwLnkpICYmXG4gICAgICAgICAgICAgICAgYXJlYShwLnByZXYsIHAsIHAubmV4dCkgPj0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBwID0gcC5uZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgdmFyIGlzRWFySGFzaGVkID0gZnVuY3Rpb24gKGVhciwgbWluWCwgbWluWSwgaW52U2l6ZSkge1xuICAgICAgICB2YXIgYSA9IGVhci5wcmV2O1xuICAgICAgICB2YXIgYiA9IGVhcjtcbiAgICAgICAgdmFyIGMgPSBlYXIubmV4dDtcbiAgICAgICAgaWYgKGFyZWEoYSwgYiwgYykgPj0gMClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gcmVmbGV4LCBjYW4ndCBiZSBhbiBlYXJcbiAgICAgICAgLy8gdHJpYW5nbGUgYmJveDsgbWluICYgbWF4IGFyZSBjYWxjdWxhdGVkIGxpa2UgdGhpcyBmb3Igc3BlZWRcbiAgICAgICAgLy8gVE9ETzogdXNlIFRyaWFuZ2xlLmJvdW5kc1xuICAgICAgICB2YXIgbWluVFggPSBhLnggPCBiLnggPyAoYS54IDwgYy54ID8gYS54IDogYy54KSA6IChiLnggPCBjLnggPyBiLnggOiBjLngpLCBtaW5UWSA9IGEueSA8IGIueSA/IChhLnkgPCBjLnkgPyBhLnkgOiBjLnkpIDogKGIueSA8IGMueSA/IGIueSA6IGMueSksIG1heFRYID0gYS54ID4gYi54ID8gKGEueCA+IGMueCA/IGEueCA6IGMueCkgOiAoYi54ID4gYy54ID8gYi54IDogYy54KSwgbWF4VFkgPSBhLnkgPiBiLnkgPyAoYS55ID4gYy55ID8gYS55IDogYy55KSA6IChiLnkgPiBjLnkgPyBiLnkgOiBjLnkpO1xuICAgICAgICAvLyB6LW9yZGVyIHJhbmdlIGZvciB0aGUgY3VycmVudCB0cmlhbmdsZSBiYm94O1xuICAgICAgICB2YXIgbWluWiA9IHpPcmRlcihtaW5UWCwgbWluVFksIG1pblgsIG1pblksIGludlNpemUpLCBtYXhaID0gek9yZGVyKG1heFRYLCBtYXhUWSwgbWluWCwgbWluWSwgaW52U2l6ZSk7XG4gICAgICAgIHZhciBwID0gZWFyLnByZXZaLCBuID0gZWFyLm5leHRaO1xuICAgICAgICAvLyBsb29rIGZvciBwb2ludHMgaW5zaWRlIHRoZSB0cmlhbmdsZSBpbiBib3RoIGRpcmVjdGlvbnNcbiAgICAgICAgd2hpbGUgKHAgJiYgcC56ID49IG1pblogJiYgbiAmJiBuLnogPD0gbWF4Wikge1xuICAgICAgICAgICAgaWYgKHAgIT09IGVhci5wcmV2ICYmIHAgIT09IGVhci5uZXh0ICYmXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogdXNlIFRyaWFuZ2xlLnV0aWxzLnBvaW50SXNJblRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgcG9pbnRJblRyaWFuZ2xlKGEueCwgYS55LCBiLngsIGIueSwgYy54LCBjLnksIHAueCwgcC55KSAmJlxuICAgICAgICAgICAgICAgIGFyZWEocC5wcmV2LCBwLCBwLm5leHQpID49IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcCA9IHAucHJldlo7XG4gICAgICAgICAgICBpZiAobiAhPT0gZWFyLnByZXYgJiYgbiAhPT0gZWFyLm5leHQgJiZcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB1c2UgVHJpYW5nbGUudXRpbHMucG9pbnRJc0luVHJpYW5nbGVcbiAgICAgICAgICAgICAgICBwb2ludEluVHJpYW5nbGUoYS54LCBhLnksIGIueCwgYi55LCBjLngsIGMueSwgbi54LCBuLnkpICYmXG4gICAgICAgICAgICAgICAgYXJlYShuLnByZXYsIG4sIG4ubmV4dCkgPj0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBuID0gbi5uZXh0WjtcbiAgICAgICAgfVxuICAgICAgICAvLyBsb29rIGZvciByZW1haW5pbmcgcG9pbnRzIGluIGRlY3JlYXNpbmcgei1vcmRlclxuICAgICAgICB3aGlsZSAocCAmJiBwLnogPj0gbWluWikge1xuICAgICAgICAgICAgaWYgKHAgIT09IGVhci5wcmV2ICYmIHAgIT09IGVhci5uZXh0ICYmXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogdXNlIFRyaWFuZ2xlLnV0aWxzLnBvaW50SXNJblRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgcG9pbnRJblRyaWFuZ2xlKGEueCwgYS55LCBiLngsIGIueSwgYy54LCBjLnksIHAueCwgcC55KSAmJlxuICAgICAgICAgICAgICAgIGFyZWEocC5wcmV2LCBwLCBwLm5leHQpID49IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcCA9IHAucHJldlo7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbG9vayBmb3IgcmVtYWluaW5nIHBvaW50cyBpbiBpbmNyZWFzaW5nIHotb3JkZXJcbiAgICAgICAgd2hpbGUgKG4gJiYgbi56IDw9IG1heFopIHtcbiAgICAgICAgICAgIGlmIChuICE9PSBlYXIucHJldiAmJiBuICE9PSBlYXIubmV4dCAmJlxuICAgICAgICAgICAgICAgIC8vIFRPRE86IHVzZSBUcmlhbmdsZS51dGlscy5wb2ludElzSW5UcmlhbmdsZVxuICAgICAgICAgICAgICAgIHBvaW50SW5UcmlhbmdsZShhLngsIGEueSwgYi54LCBiLnksIGMueCwgYy55LCBuLngsIG4ueSkgJiZcbiAgICAgICAgICAgICAgICBhcmVhKG4ucHJldiwgbiwgbi5uZXh0KSA+PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIG4gPSBuLm5leHRaO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgcG9seWdvbiBub2RlcyBhbmQgY3VyZSBzbWFsbCBsb2NhbCBzZWxmLWludGVyc2VjdGlvbnNcbiAgICB2YXIgY3VyZUxvY2FsSW50ZXJzZWN0aW9ucyA9IGZ1bmN0aW9uIChzdGFydCwgdHJpYW5nbGVzLCBkaW0pIHtcbiAgICAgICAgdmFyIHAgPSBzdGFydDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgdmFyIGEgPSBwLnByZXY7XG4gICAgICAgICAgICB2YXIgYiA9IHAubmV4dC5uZXh0O1xuICAgICAgICAgICAgaWYgKCFlcXVhbHMoYSwgYikgJiYgaW50ZXJzZWN0cyhhLCBwLCBwLm5leHQsIGIpICYmIGxvY2FsbHlJbnNpZGUoYSwgYikgJiYgbG9jYWxseUluc2lkZShiLCBhKSkge1xuICAgICAgICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKGEuaSAvIGRpbSk7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGVzLnB1c2gocC5pIC8gZGltKTtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZXMucHVzaChiLmkgLyBkaW0pO1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0d28gbm9kZXMgaW52b2x2ZWRcbiAgICAgICAgICAgICAgICByZW1vdmVOb2RlKHApO1xuICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUocC5uZXh0KTtcbiAgICAgICAgICAgICAgICBwID0gc3RhcnQgPSBiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcCA9IHAubmV4dDtcbiAgICAgICAgfSB3aGlsZSAocCAhPT0gc3RhcnQpO1xuICAgICAgICByZXR1cm4gZmlsdGVyUG9pbnRzKHApO1xuICAgIH07XG4gICAgLy8gdHJ5IHNwbGl0dGluZyBwb2x5Z29uIGludG8gdHdvIGFuZCB0cmlhbmd1bGF0ZSB0aGVtIGluZGVwZW5kZW50bHlcbiAgICB2YXIgc3BsaXRFYXJjdXQgPSBmdW5jdGlvbiAoc3RhcnQsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplKSB7XG4gICAgICAgIC8vIGxvb2sgZm9yIGEgdmFsaWQgZGlhZ29uYWwgdGhhdCBkaXZpZGVzIHRoZSBwb2x5Z29uIGludG8gdHdvXG4gICAgICAgIHZhciBhID0gc3RhcnQ7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHZhciBiID0gYS5uZXh0Lm5leHQ7XG4gICAgICAgICAgICB3aGlsZSAoYiAhPT0gYS5wcmV2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGEuaSAhPT0gYi5pICYmIGlzVmFsaWREaWFnb25hbChhLCBiKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzcGxpdCB0aGUgcG9seWdvbiBpbiB0d28gYnkgdGhlIGRpYWdvbmFsXG4gICAgICAgICAgICAgICAgICAgIHZhciBjID0gc3BsaXRQb2x5Z29uKGEsIGIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgY29saW5lYXIgcG9pbnRzIGFyb3VuZCB0aGUgY3V0c1xuICAgICAgICAgICAgICAgICAgICBhID0gZmlsdGVyUG9pbnRzKGEsIGEubmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGMgPSBmaWx0ZXJQb2ludHMoYywgYy5uZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gcnVuIGVhcmN1dCBvbiBlYWNoIGhhbGZcbiAgICAgICAgICAgICAgICAgICAgZWFyY3V0TGlua2VkKGEsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcbiAgICAgICAgICAgICAgICAgICAgZWFyY3V0TGlua2VkKGMsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiID0gYi5uZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IGEubmV4dDtcbiAgICAgICAgfSB3aGlsZSAoYSAhPT0gc3RhcnQpO1xuICAgIH07XG4gICAgLy8gbGluayBldmVyeSBob2xlIGludG8gdGhlIG91dGVyIGxvb3AsIHByb2R1Y2luZyBhIHNpbmdsZS1yaW5nIHBvbHlnb24gd2l0aG91dCBob2xlc1xuICAgIHZhciBlbGltaW5hdGVIb2xlcyA9IGZ1bmN0aW9uIChkYXRhLCBob2xlSW5kaWNlcywgb3V0ZXJOb2RlLCBkaW0pIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgbGVuID0gaG9sZUluZGljZXMubGVuZ3RoO1xuICAgICAgICB2YXIgc3RhcnQ7XG4gICAgICAgIHZhciBlbmQ7XG4gICAgICAgIHZhciBsaXN0O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gaG9sZUluZGljZXNbaV0gKiBkaW07XG4gICAgICAgICAgICBlbmQgPSBpIDwgbGVuIC0gMSA/IGhvbGVJbmRpY2VzW2kgKyAxXSAqIGRpbSA6IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgbGlzdCA9IGxpbmtlZExpc3QoZGF0YSwgc3RhcnQsIGVuZCwgZGltLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAobGlzdCA9PT0gbGlzdC5uZXh0KVxuICAgICAgICAgICAgICAgIGxpc3Quc3RlaW5lciA9IHRydWU7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGdldExlZnRtb3N0KGxpc3QpKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZS5zb3J0KGNvbXBhcmVYKTtcbiAgICAgICAgLy8gcHJvY2VzcyBob2xlcyBmcm9tIGxlZnQgdG8gcmlnaHRcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBlbGltaW5hdGVIb2xlKHF1ZXVlW2ldLCBvdXRlck5vZGUpO1xuICAgICAgICAgICAgb3V0ZXJOb2RlID0gZmlsdGVyUG9pbnRzKG91dGVyTm9kZSwgb3V0ZXJOb2RlLm5leHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRlck5vZGU7XG4gICAgfTtcbiAgICB2YXIgY29tcGFyZVggPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYS54IC0gYi54O1xuICAgIH07XG4gICAgLy8gZmluZCBhIGJyaWRnZSBiZXR3ZWVuIHZlcnRpY2VzIHRoYXQgY29ubmVjdHMgaG9sZSB3aXRoIGFuIG91dGVyIHJpbmcgYW5kIGFuZCBsaW5rIGl0XG4gICAgdmFyIGVsaW1pbmF0ZUhvbGUgPSBmdW5jdGlvbiAoaG9sZSwgb3V0ZXJOb2RlKSB7XG4gICAgICAgIHZhciBicmlkZ2UgPSBmaW5kSG9sZUJyaWRnZShob2xlLCBvdXRlck5vZGUpO1xuICAgICAgICBpZiAoIWJyaWRnZSkge1xuICAgICAgICAgICAgcmV0dXJuIG91dGVyTm9kZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYnJpZGdlUmV2ZXJzZSA9IHNwbGl0UG9seWdvbihicmlkZ2UsIGhvbGUpO1xuICAgICAgICAvLyBmaWx0ZXIgY29sbGluZWFyIHBvaW50cyBhcm91bmQgdGhlIGN1dHNcbiAgICAgICAgdmFyIGZpbHRlcmVkQnJpZGdlID0gZmlsdGVyUG9pbnRzKGJyaWRnZSwgYnJpZGdlLm5leHQpO1xuICAgICAgICBmaWx0ZXJQb2ludHMoYnJpZGdlUmV2ZXJzZSwgYnJpZGdlUmV2ZXJzZS5uZXh0KTtcbiAgICAgICAgLy8gQ2hlY2sgaWYgaW5wdXQgbm9kZSB3YXMgcmVtb3ZlZCBieSB0aGUgZmlsdGVyaW5nXG4gICAgICAgIHJldHVybiBvdXRlck5vZGUgPT09IGJyaWRnZSA/IGZpbHRlcmVkQnJpZGdlIDogb3V0ZXJOb2RlO1xuICAgICAgICAvLyB9XG4gICAgfTtcbiAgICAvLyBEYXZpZCBFYmVybHkncyBhbGdvcml0aG0gZm9yIGZpbmRpbmcgYSBicmlkZ2UgYmV0d2VlbiBob2xlIGFuZCBvdXRlciBwb2x5Z29uXG4gICAgdmFyIGZpbmRIb2xlQnJpZGdlID0gZnVuY3Rpb24gKGhvbGUsIG91dGVyTm9kZSkge1xuICAgICAgICB2YXIgcCA9IG91dGVyTm9kZTtcbiAgICAgICAgdmFyIGh4ID0gaG9sZS54O1xuICAgICAgICB2YXIgaHkgPSBob2xlLnk7XG4gICAgICAgIHZhciBxeCA9IC1JbmZpbml0eTtcbiAgICAgICAgdmFyIG07XG4gICAgICAgIC8vIGZpbmQgYSBzZWdtZW50IGludGVyc2VjdGVkIGJ5IGEgcmF5IGZyb20gdGhlIGhvbGUncyBsZWZ0bW9zdCBwb2ludCB0byB0aGUgbGVmdDtcbiAgICAgICAgLy8gc2VnbWVudCdzIGVuZHBvaW50IHdpdGggbGVzc2VyIHggd2lsbCBiZSBwb3RlbnRpYWwgY29ubmVjdGlvbiBwb2ludFxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBpZiAoaHkgPD0gcC55ICYmIGh5ID49IHAubmV4dC55ICYmIHAubmV4dC55ICE9PSBwLnkpIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHAueCArIChoeSAtIHAueSkgKiAocC5uZXh0LnggLSBwLngpIC8gKHAubmV4dC55IC0gcC55KTtcbiAgICAgICAgICAgICAgICBpZiAoeCA8PSBoeCAmJiB4ID4gcXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcXggPSB4O1xuICAgICAgICAgICAgICAgICAgICBpZiAoeCA9PT0gaHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoeSA9PT0gcC55KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh5ID09PSBwLm5leHQueSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcC5uZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG0gPSBwLnggPCBwLm5leHQueCA/IHAgOiBwLm5leHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcCA9IHAubmV4dDtcbiAgICAgICAgfSB3aGlsZSAocCAhPT0gb3V0ZXJOb2RlKTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaHggPT09IHF4KSB7XG4gICAgICAgICAgICByZXR1cm4gbTsgLy8gaG9sZSB0b3VjaGVzIG91dGVyIHNlZ21lbnQ7IHBpY2sgbGVmdG1vc3QgZW5kcG9pbnRcbiAgICAgICAgfVxuICAgICAgICAvLyBsb29rIGZvciBwb2ludHMgaW5zaWRlIHRoZSB0cmlhbmdsZSBvZiBob2xlIHBvaW50LCBzZWdtZW50IGludGVyc2VjdGlvbiBhbmQgZW5kcG9pbnQ7XG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBubyBwb2ludHMgZm91bmQsIHdlIGhhdmUgYSB2YWxpZCBjb25uZWN0aW9uO1xuICAgICAgICAvLyBvdGhlcndpc2UgY2hvb3NlIHRoZSBwb2ludCBvZiB0aGUgbWluaW11bSBhbmdsZSB3aXRoIHRoZSByYXkgYXMgY29ubmVjdGlvbiBwb2ludFxuICAgICAgICB2YXIgc3RvcCA9IG07XG4gICAgICAgIHZhciBteCA9IG0ueDtcbiAgICAgICAgdmFyIG15ID0gbS55O1xuICAgICAgICB2YXIgdGFuTWluID0gSW5maW5pdHk7XG4gICAgICAgIHZhciB0YW47XG4gICAgICAgIHAgPSBtO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBpZiAoaHggPj0gcC54ICYmIHAueCA+PSBteCAmJiBoeCAhPT0gcC54ICYmXG4gICAgICAgICAgICAgICAgcG9pbnRJblRyaWFuZ2xlKGh5IDwgbXkgPyBoeCA6IHF4LCBoeSwgbXgsIG15LCBoeSA8IG15ID8gcXggOiBoeCwgaHksIHAueCwgcC55KSkge1xuICAgICAgICAgICAgICAgIHRhbiA9IE1hdGguYWJzKGh5IC0gcC55KSAvIChoeCAtIHAueCk7IC8vIHRhbmdlbnRpYWxcbiAgICAgICAgICAgICAgICBpZiAobG9jYWxseUluc2lkZShwLCBob2xlKSAmJlxuICAgICAgICAgICAgICAgICAgICAodGFuIDwgdGFuTWluIHx8ICh0YW4gPT09IHRhbk1pbiAmJiAocC54ID4gbS54IHx8IChwLnggPT09IG0ueCAmJiBzZWN0b3JDb250YWluc1NlY3RvcihtLCBwKSkpKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbSA9IHA7XG4gICAgICAgICAgICAgICAgICAgIHRhbk1pbiA9IHRhbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwID0gcC5uZXh0O1xuICAgICAgICB9IHdoaWxlIChwICE9PSBzdG9wKTtcbiAgICAgICAgcmV0dXJuIG07XG4gICAgfTtcbiAgICAvLyB3aGV0aGVyIHNlY3RvciBpbiB2ZXJ0ZXggbSBjb250YWlucyBzZWN0b3IgaW4gdmVydGV4IHAgaW4gdGhlIHNhbWUgY29vcmRpbmF0ZXNcbiAgICB2YXIgc2VjdG9yQ29udGFpbnNTZWN0b3IgPSBmdW5jdGlvbiAobSwgcCkge1xuICAgICAgICByZXR1cm4gYXJlYShtLnByZXYsIG0sIHAucHJldikgPCAwICYmIGFyZWEocC5uZXh0LCBtLCBtLm5leHQpIDwgMDtcbiAgICB9O1xuICAgIC8vIGludGVybGluayBwb2x5Z29uIG5vZGVzIGluIHotb3JkZXJcbiAgICB2YXIgaW5kZXhDdXJ2ZSA9IGZ1bmN0aW9uIChzdGFydCwgbWluWCwgbWluWSwgaW52U2l6ZSkge1xuICAgICAgICB2YXIgcCA9IHN0YXJ0O1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBpZiAocC56ID09PSBudWxsKVxuICAgICAgICAgICAgICAgIHAueiA9IHpPcmRlcihwLngsIHAueSwgbWluWCwgbWluWSwgaW52U2l6ZSk7XG4gICAgICAgICAgICBwLnByZXZaID0gcC5wcmV2O1xuICAgICAgICAgICAgcC5uZXh0WiA9IHAubmV4dDtcbiAgICAgICAgICAgIHAgPSBwLm5leHQ7XG4gICAgICAgIH0gd2hpbGUgKHAgIT09IHN0YXJ0KTtcbiAgICAgICAgcC5wcmV2Wi5uZXh0WiA9IG51bGw7XG4gICAgICAgIHAucHJldlogPSBudWxsO1xuICAgICAgICBzb3J0TGlua2VkKHApO1xuICAgIH07XG4gICAgLy8gU2ltb24gVGF0aGFtJ3MgbGlua2VkIGxpc3QgbWVyZ2Ugc29ydCBhbGdvcml0aG1cbiAgICAvLyBodHRwOi8vd3d3LmNoaWFyay5ncmVlbmVuZC5vcmcudWsvfnNndGF0aGFtL2FsZ29yaXRobXMvbGlzdHNvcnQuaHRtbFxuICAgIHZhciBzb3J0TGlua2VkID0gZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBwO1xuICAgICAgICB2YXIgcTtcbiAgICAgICAgdmFyIGU7XG4gICAgICAgIHZhciB0YWlsO1xuICAgICAgICB2YXIgbnVtTWVyZ2VzO1xuICAgICAgICB2YXIgcFNpemU7XG4gICAgICAgIHZhciBxU2l6ZTtcbiAgICAgICAgdmFyIGluU2l6ZSA9IDE7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHAgPSBsaXN0O1xuICAgICAgICAgICAgbGlzdCA9IG51bGw7XG4gICAgICAgICAgICB0YWlsID0gbnVsbDtcbiAgICAgICAgICAgIG51bU1lcmdlcyA9IDA7XG4gICAgICAgICAgICB3aGlsZSAocCkge1xuICAgICAgICAgICAgICAgIG51bU1lcmdlcysrO1xuICAgICAgICAgICAgICAgIHEgPSBwO1xuICAgICAgICAgICAgICAgIHBTaXplID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5TaXplOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcFNpemUrKztcbiAgICAgICAgICAgICAgICAgICAgcSA9IHEubmV4dFo7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxU2l6ZSA9IGluU2l6ZTtcbiAgICAgICAgICAgICAgICB3aGlsZSAocFNpemUgPiAwIHx8IChxU2l6ZSA+IDAgJiYgcSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBTaXplICE9PSAwICYmIChxU2l6ZSA9PT0gMCB8fCAhcSB8fCBwLnogPD0gcS56KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZSA9IHA7XG4gICAgICAgICAgICAgICAgICAgICAgICBwID0gcC5uZXh0WjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBTaXplLS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gcTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHEgPSBxLm5leHRaO1xuICAgICAgICAgICAgICAgICAgICAgICAgcVNpemUtLTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGFpbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhaWwubmV4dFogPSBlO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0ID0gZTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2WiA9IHRhaWw7XG4gICAgICAgICAgICAgICAgICAgIHRhaWwgPSBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwID0gcTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhaWwubmV4dFogPSBudWxsO1xuICAgICAgICAgICAgaW5TaXplICo9IDI7XG4gICAgICAgIH0gd2hpbGUgKG51bU1lcmdlcyA+IDEpO1xuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICB9O1xuICAgIC8vIHotb3JkZXIgb2YgYSBwb2ludCBnaXZlbiBjb29yZHMgYW5kIGludmVyc2Ugb2YgdGhlIGxvbmdlciBzaWRlIG9mIGRhdGEgYmJveFxuICAgIHZhciB6T3JkZXIgPSBmdW5jdGlvbiAoeCwgeSwgbWluWCwgbWluWSwgaW52U2l6ZSkge1xuICAgICAgICAvLyBjb29yZHMgYXJlIHRyYW5zZm9ybWVkIGludG8gbm9uLW5lZ2F0aXZlIDE1LWJpdCBpbnRlZ2VyIHJhbmdlXG4gICAgICAgIHggPSAzMjc2NyAqICh4IC0gbWluWCkgKiBpbnZTaXplO1xuICAgICAgICB5ID0gMzI3NjcgKiAoeSAtIG1pblkpICogaW52U2l6ZTtcbiAgICAgICAgeCA9ICh4IHwgKHggPDwgOCkpICYgMHgwMEZGMDBGRjtcbiAgICAgICAgeCA9ICh4IHwgKHggPDwgNCkpICYgMHgwRjBGMEYwRjtcbiAgICAgICAgeCA9ICh4IHwgKHggPDwgMikpICYgMHgzMzMzMzMzMztcbiAgICAgICAgeCA9ICh4IHwgKHggPDwgMSkpICYgMHg1NTU1NTU1NTtcbiAgICAgICAgeSA9ICh5IHwgKHkgPDwgOCkpICYgMHgwMEZGMDBGRjtcbiAgICAgICAgeSA9ICh5IHwgKHkgPDwgNCkpICYgMHgwRjBGMEYwRjtcbiAgICAgICAgeSA9ICh5IHwgKHkgPDwgMikpICYgMHgzMzMzMzMzMztcbiAgICAgICAgeSA9ICh5IHwgKHkgPDwgMSkpICYgMHg1NTU1NTU1NTtcbiAgICAgICAgcmV0dXJuIHggfCAoeSA8PCAxKTtcbiAgICB9O1xuICAgIC8vIGZpbmQgdGhlIGxlZnRtb3N0IG5vZGUgb2YgYSBwb2x5Z29uIHJpbmdcbiAgICB2YXIgZ2V0TGVmdG1vc3QgPSBmdW5jdGlvbiAoc3RhcnQpIHtcbiAgICAgICAgdmFyIHAgPSBzdGFydDtcbiAgICAgICAgdmFyIGxlZnRtb3N0ID0gc3RhcnQ7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmIChwLnggPCBsZWZ0bW9zdC54IHx8IChwLnggPT09IGxlZnRtb3N0LnggJiYgcC55IDwgbGVmdG1vc3QueSkpIHtcbiAgICAgICAgICAgICAgICBsZWZ0bW9zdCA9IHA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwID0gcC5uZXh0O1xuICAgICAgICB9IHdoaWxlIChwICE9PSBzdGFydCk7XG4gICAgICAgIHJldHVybiBsZWZ0bW9zdDtcbiAgICB9O1xuICAgIC8vIGNoZWNrIGlmIGEgcG9pbnQgbGllcyB3aXRoaW4gYSBjb252ZXggdHJpYW5nbGVcbiAgICAvLyBUT0RPOiB1c2UgVHJpYW5nbGUuY29udGFpbnNQb2ludFxuICAgIHZhciBwb2ludEluVHJpYW5nbGUgPSBmdW5jdGlvbiAoYXgsIGF5LCBieCwgYnksIGN4LCBjeSwgcHgsIHB5KSB7XG4gICAgICAgIHJldHVybiAoY3ggLSBweCkgKiAoYXkgLSBweSkgLSAoYXggLSBweCkgKiAoY3kgLSBweSkgPj0gMCAmJlxuICAgICAgICAgICAgKGF4IC0gcHgpICogKGJ5IC0gcHkpIC0gKGJ4IC0gcHgpICogKGF5IC0gcHkpID49IDAgJiZcbiAgICAgICAgICAgIChieCAtIHB4KSAqIChjeSAtIHB5KSAtIChjeCAtIHB4KSAqIChieSAtIHB5KSA+PSAwO1xuICAgIH07XG4gICAgLy8gY2hlY2sgaWYgYSBkaWFnb25hbCBiZXR3ZWVuIHR3byBwb2x5Z29uIG5vZGVzIGlzIHZhbGlkIChsaWVzIGluIHBvbHlnb24gaW50ZXJpb3IpXG4gICAgdmFyIGlzVmFsaWREaWFnb25hbCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLm5leHQuaSAhPT0gYi5pICYmIGEucHJldi5pICE9PSBiLmkgJiYgIWludGVyc2VjdHNQb2x5Z29uKGEsIGIpICYmIC8vIGRvbmVzJ3QgaW50ZXJzZWN0IG90aGVyIGVkZ2VzXG4gICAgICAgICAgICAobG9jYWxseUluc2lkZShhLCBiKSAmJiBsb2NhbGx5SW5zaWRlKGIsIGEpICYmIG1pZGRsZUluc2lkZShhLCBiKSAmJiAvLyBsb2NhbGx5IHZpc2libGVcbiAgICAgICAgICAgICAgICAoYXJlYShhLnByZXYsIGEsIGIucHJldikgIT0gMCB8fCBhcmVhKGEsIGIucHJldiwgYikpICE9IDAgfHwgLy8gZG9lcyBub3QgY3JlYXRlIG9wcG9zaXRlLWZhY2luZyBzZWN0b3JzXG4gICAgICAgICAgICAgICAgZXF1YWxzKGEsIGIpICYmIGFyZWEoYS5wcmV2LCBhLCBhLm5leHQpID4gMCAmJiBhcmVhKGIucHJldiwgYiwgYi5uZXh0KSA+IDApOyAvLyBzcGVjaWFsIHplcm8tbGVuZ3RoIGNhc2VcbiAgICB9O1xuICAgIC8vIHNpZ25lZCBhcmVhIG9mIGEgdHJpYW5nbGVcbiAgICB2YXIgYXJlYSA9IGZ1bmN0aW9uIChwLCBxLCByKSB7XG4gICAgICAgIHJldHVybiAocS55IC0gcC55KSAqIChyLnggLSBxLngpIC0gKHEueCAtIHAueCkgKiAoci55IC0gcS55KTtcbiAgICB9O1xuICAgIC8vIGNoZWNrIGlmIHR3byBwb2ludHMgYXJlIGVxdWFsXG4gICAgLy8gVE9ETzogYXMgbWVtYmVyIGZ1bmN0aW9uIG9mIHZlcnRleFxuICAgIHZhciBlcXVhbHMgPSBmdW5jdGlvbiAocDEsIHAyKSB7XG4gICAgICAgIHJldHVybiBwMS54ID09PSBwMi54ICYmIHAxLnkgPT09IHAyLnk7XG4gICAgfTtcbiAgICAvLyBjaGVjayBpZiB0d28gc2VnbWVudHMgaW50ZXJzZWN0XG4gICAgLy8gVE9ETzogdXNlIExpbmUuaW50ZXJzZWN0c1xuICAgIHZhciBpbnRlcnNlY3RzID0gZnVuY3Rpb24gKHAxLCBxMSwgcDIsIHEyKSB7XG4gICAgICAgIHZhciBvMSA9IHNpZ24oYXJlYShwMSwgcTEsIHAyKSk7XG4gICAgICAgIHZhciBvMiA9IHNpZ24oYXJlYShwMSwgcTEsIHEyKSk7XG4gICAgICAgIHZhciBvMyA9IHNpZ24oYXJlYShwMiwgcTIsIHAxKSk7XG4gICAgICAgIHZhciBvNCA9IHNpZ24oYXJlYShwMiwgcTIsIHExKSk7XG4gICAgICAgIGlmIChvMSAhPT0gbzIgJiYgbzMgIT09IG80KVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIGdlbmVyYWwgY2FzZVxuICAgICAgICBpZiAobzEgPT09IDAgJiYgb25TZWdtZW50KHAxLCBwMiwgcTEpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIHAxLCBxMSBhbmQgcDIgYXJlIGNvbGxpbmVhciBhbmQgcDIgbGllcyBvbiBwMXExXG4gICAgICAgIGlmIChvMiA9PT0gMCAmJiBvblNlZ21lbnQocDEsIHEyLCBxMSkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gcDEsIHExIGFuZCBxMiBhcmUgY29sbGluZWFyIGFuZCBxMiBsaWVzIG9uIHAxcTFcbiAgICAgICAgaWYgKG8zID09PSAwICYmIG9uU2VnbWVudChwMiwgcDEsIHEyKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBwMiwgcTIgYW5kIHAxIGFyZSBjb2xsaW5lYXIgYW5kIHAxIGxpZXMgb24gcDJxMlxuICAgICAgICBpZiAobzQgPT09IDAgJiYgb25TZWdtZW50KHAyLCBxMSwgcTIpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIHAyLCBxMiBhbmQgcTEgYXJlIGNvbGxpbmVhciBhbmQgcTEgbGllcyBvbiBwMnEyXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIC8vIGZvciBjb2xsaW5lYXIgcG9pbnRzIHAsIHEsIHIsIGNoZWNrIGlmIHBvaW50IHEgbGllcyBvbiBzZWdtZW50IHByXG4gICAgdmFyIG9uU2VnbWVudCA9IGZ1bmN0aW9uIChwLCBxLCByKSB7XG4gICAgICAgIHJldHVybiBxLnggPD0gTWF0aC5tYXgocC54LCByLngpICYmIHEueCA+PSBNYXRoLm1pbihwLngsIHIueCkgJiYgcS55IDw9IE1hdGgubWF4KHAueSwgci55KSAmJiBxLnkgPj0gTWF0aC5taW4ocC55LCByLnkpO1xuICAgIH07XG4gICAgdmFyIHNpZ24gPSBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIHJldHVybiBudW0gPiAwID8gMSA6IG51bSA8IDAgPyAtMSA6IDA7XG4gICAgfTtcbiAgICAvLyBjaGVjayBpZiBhIHBvbHlnb24gZGlhZ29uYWwgaW50ZXJzZWN0cyBhbnkgcG9seWdvbiBzZWdtZW50c1xuICAgIHZhciBpbnRlcnNlY3RzUG9seWdvbiA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHZhciBwID0gYTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaWYgKHAuaSAhPT0gYS5pICYmIHAubmV4dC5pICE9PSBhLmkgJiYgcC5pICE9PSBiLmkgJiYgcC5uZXh0LmkgIT09IGIuaSAmJiBpbnRlcnNlY3RzKHAsIHAubmV4dCwgYSwgYikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHAgPSBwLm5leHQ7XG4gICAgICAgIH0gd2hpbGUgKHAgIT09IGEpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICAvLyBjaGVjayBpZiBhIHBvbHlnb24gZGlhZ29uYWwgaXMgbG9jYWxseSBpbnNpZGUgdGhlIHBvbHlnb25cbiAgICB2YXIgbG9jYWxseUluc2lkZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhcmVhKGEucHJldiwgYSwgYS5uZXh0KSA8IDAgP1xuICAgICAgICAgICAgYXJlYShhLCBiLCBhLm5leHQpID49IDAgJiYgYXJlYShhLCBhLnByZXYsIGIpID49IDAgOlxuICAgICAgICAgICAgYXJlYShhLCBiLCBhLnByZXYpIDwgMCB8fCBhcmVhKGEsIGEubmV4dCwgYikgPCAwO1xuICAgIH07XG4gICAgLy8gY2hlY2sgaWYgdGhlIG1pZGRsZSBwb2ludCBvZiBhIHBvbHlnb24gZGlhZ29uYWwgaXMgaW5zaWRlIHRoZSBwb2x5Z29uXG4gICAgdmFyIG1pZGRsZUluc2lkZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHZhciBwID0gYTtcbiAgICAgICAgdmFyIGluc2lkZSA9IGZhbHNlO1xuICAgICAgICB2YXIgcHggPSAoYS54ICsgYi54KSAvIDI7XG4gICAgICAgIHZhciBweSA9IChhLnkgKyBiLnkpIC8gMjtcbiAgICAgICAgLy8gVE9ETzogY2FsbCBQb2x5Z29uLmNvbnRhaW5zIGhlcmU/XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmICgoKHAueSA+IHB5KSAhPT0gKHAubmV4dC55ID4gcHkpKSAmJiBwLm5leHQueSAhPT0gcC55ICYmXG4gICAgICAgICAgICAgICAgKHB4IDwgKHAubmV4dC54IC0gcC54KSAqIChweSAtIHAueSkgLyAocC5uZXh0LnkgLSBwLnkpICsgcC54KSlcbiAgICAgICAgICAgICAgICBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICAgICAgcCA9IHAubmV4dDtcbiAgICAgICAgfSB3aGlsZSAocCAhPT0gYSk7XG4gICAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgfTtcbiAgICAvLyBsaW5rIHR3byBwb2x5Z29uIHZlcnRpY2VzIHdpdGggYSBicmlkZ2U7IGlmIHRoZSB2ZXJ0aWNlcyBiZWxvbmcgdG8gdGhlIHNhbWUgcmluZywgaXQgc3BsaXRzIHBvbHlnb24gaW50byB0d287XG4gICAgLy8gaWYgb25lIGJlbG9uZ3MgdG8gdGhlIG91dGVyIHJpbmcgYW5kIGFub3RoZXIgdG8gYSBob2xlLCBpdCBtZXJnZXMgaXQgaW50byBhIHNpbmdsZSByaW5nXG4gICAgdmFyIHNwbGl0UG9seWdvbiA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHZhciBhMiA9IG5ldyBOb2RlKGEuaSwgYS54LCBhLnkpO1xuICAgICAgICB2YXIgYjIgPSBuZXcgTm9kZShiLmksIGIueCwgYi55KTtcbiAgICAgICAgdmFyIGFuID0gYS5uZXh0O1xuICAgICAgICB2YXIgYnAgPSBiLnByZXY7XG4gICAgICAgIGEubmV4dCA9IGI7XG4gICAgICAgIGIucHJldiA9IGE7XG4gICAgICAgIGEyLm5leHQgPSBhbjtcbiAgICAgICAgYW4ucHJldiA9IGEyO1xuICAgICAgICBiMi5uZXh0ID0gYTI7XG4gICAgICAgIGEyLnByZXYgPSBiMjtcbiAgICAgICAgYnAubmV4dCA9IGIyO1xuICAgICAgICBiMi5wcmV2ID0gYnA7XG4gICAgICAgIHJldHVybiBiMjtcbiAgICB9O1xuICAgIC8vIGNyZWF0ZSBhIG5vZGUgYW5kIG9wdGlvbmFsbHkgbGluayBpdCB3aXRoIHByZXZpb3VzIG9uZSAoaW4gYSBjaXJjdWxhciBkb3VibHkgbGlua2VkIGxpc3QpXG4gICAgdmFyIGluc2VydE5vZGUgPSBmdW5jdGlvbiAoaSwgeCwgeSwgbGFzdCkge1xuICAgICAgICB2YXIgcCA9IG5ldyBOb2RlKGksIHgsIHkpO1xuICAgICAgICBpZiAoIWxhc3QpIHtcbiAgICAgICAgICAgIHAucHJldiA9IHA7XG4gICAgICAgICAgICBwLm5leHQgPSBwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcC5uZXh0ID0gbGFzdC5uZXh0O1xuICAgICAgICAgICAgcC5wcmV2ID0gbGFzdDtcbiAgICAgICAgICAgIGxhc3QubmV4dC5wcmV2ID0gcDtcbiAgICAgICAgICAgIGxhc3QubmV4dCA9IHA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfTtcbiAgICB2YXIgcmVtb3ZlTm9kZSA9IGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHAubmV4dC5wcmV2ID0gcC5wcmV2O1xuICAgICAgICBwLnByZXYubmV4dCA9IHAubmV4dDtcbiAgICAgICAgaWYgKHAucHJldlopXG4gICAgICAgICAgICBwLnByZXZaLm5leHRaID0gcC5uZXh0WjtcbiAgICAgICAgaWYgKHAubmV4dFopXG4gICAgICAgICAgICBwLm5leHRaLnByZXZaID0gcC5wcmV2WjtcbiAgICB9O1xuICAgIHZhciBzaWduZWRBcmVhID0gZnVuY3Rpb24gKGRhdGEsIHN0YXJ0LCBlbmQsIGRpbSkge1xuICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0LCBqID0gZW5kIC0gZGltOyBpIDwgZW5kOyBpICs9IGRpbSkge1xuICAgICAgICAgICAgc3VtICs9IChkYXRhW2pdIC0gZGF0YVtpXSkgKiAoZGF0YVtpICsgMV0gKyBkYXRhW2ogKyAxXSk7XG4gICAgICAgICAgICBqID0gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtO1xuICAgIH07XG4gICAgcmV0dXJuIGVhcmN1dDtcbn0pKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1lYXJjdXQuanMubWFwIl19
