/* Port from AlloyFinger v0.1.15
 * Original by dntzhang
 * Typescript port by Ikaros Kappler
 * Github: https://github.com/IkarosKappler/AlloyFinger-Typescript
 *
 * @date    2021-02-10 (Typescript port)
 * @version 0.1.18
 */
;
/**
 * Tiny math function to calculate the length of a vector in euclidean space.
 *
 * @param {XYCoords} v - The vector in {x,y} notation.
 * @return {number} The length of the vector.
 */
const getLen = (v) => {
    return Math.sqrt(v.x * v.x + v.y * v.y);
};
/**
 * Tiny math function to calculate the dot product of two vectors.
 *
 * @param {XYCoords} v1 - The first vector in {x,y} notation.
 * @param {XYCoords} v2 - The second vector in {x,y} notation.
 * @return {number} The dot product of both vectors.
 */
const dot = (v1, v2) => {
    return v1.x * v2.x + v1.y * v2.y;
};
/**
 * Tiny math function to calculate the angle between two vectors.
 *
 * @param {XYCoords} v1 - The first vector in {x,y} notation.
 * @param {XYCoords} v2 - The second vector in {x,y} notation.
 * @return {number} The angle (in radians) between the two vectors.
 */
const getAngle = (v1, v2) => {
    const mr = getLen(v1) * getLen(v2);
    if (mr === 0)
        return 0;
    var r = dot(v1, v2) / mr;
    if (r > 1)
        r = 1;
    return Math.acos(r);
};
/**
 * Tiny math function to calculate the cross product of two vectors.
 *
 * @param {XYCoords} v1 - The first vector in {x,y} notation.
 * @param {XYCoords} v2 - The second vector in {x,y} notation.
 * @return {number} The cross product of both vectors.
 */
const cross = (v1, v2) => {
    return v1.x * v2.y - v2.x * v1.y;
};
/**
 * Tiny math function to calculate the rotate-angle (in degrees) for two vectors.
 *
 * @param {XYCoords} v1 - The first vector in {x,y} notation.
 * @param {XYCoords} v2 - The second vector in {x,y} notation.
 * @return {number} The rotate-angle in degrees for the two vectors.
 */
const getRotateAngle = (v1, v2) => {
    var angle = getAngle(v1, v2);
    if (cross(v1, v2) > 0) {
        angle *= -1;
    }
    return angle * 180 / Math.PI;
};
/**
 * A HandlerAdmin holds all the added event handlers for one kind of event type.
 */
class HandlerAdmin {
    constructor(el) {
        this.handlers = [];
        this.el = el;
    }
    ;
    add(handler) {
        this.handlers.push(handler);
    }
    ;
    del(handler) {
        if (!handler)
            this.handlers = [];
        for (var i = this.handlers.length; i >= 0; i--) {
            if (this.handlers[i] === handler) {
                this.handlers.splice(i, 1);
            }
        }
    }
    ;
    dispatch(..._args) {
        for (var i = 0, len = this.handlers.length; i < len; i++) {
            const handler = this.handlers[i];
            if (typeof handler === 'function') {
                handler.apply(this.el, arguments);
            }
        }
    }
    ;
} // END class HandlerAdmin
/**
 * A wrapper for handler functions; converts the passed handler function into a HadlerAdmin instance..
 */
const wrapFunc = (el, handler) => {
    const handlerAdmin = new HandlerAdmin(el);
    handlerAdmin.add(handler);
    return handlerAdmin;
};
/**
 * @classdesc The AlloyFinger main class. Use this to add handler functions for
 *            touch events to any HTML- or SVG-Element.
 **/
export class AlloyFinger {
    constructor(el, option) {
        this.element = typeof el == 'string' ? document.querySelector(el) : el;
        // Fancy stuff: change `this` from the start-, move-, end- and cancel-function.
        //    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
        this.start = this.start.bind(this);
        this.move = this.move.bind(this);
        this.end = this.end.bind(this);
        this.cancel = this.cancel.bind(this);
        this.element.addEventListener("touchstart", this.start, false);
        this.element.addEventListener("touchmove", this.move, false);
        this.element.addEventListener("touchend", this.end, false);
        this.element.addEventListener("touchcancel", this.cancel, false);
        this.preV = { x: null, y: null };
        this.pinchStartLen = null;
        this.zoom = 1;
        this.isDoubleTap = false;
        const noop = () => { };
        this.rotate = wrapFunc(this.element, option.rotate || noop);
        this.touchStart = wrapFunc(this.element, option.touchStart || noop);
        this.multipointStart = wrapFunc(this.element, option.multipointStart || noop);
        this.multipointEnd = wrapFunc(this.element, option.multipointEnd || noop);
        this.pinch = wrapFunc(this.element, option.pinch || noop);
        this.swipe = wrapFunc(this.element, option.swipe || noop);
        this.tap = wrapFunc(this.element, option.tap || noop);
        this.doubleTap = wrapFunc(this.element, option.doubleTap || noop);
        this.longTap = wrapFunc(this.element, option.longTap || noop);
        this.singleTap = wrapFunc(this.element, option.singleTap || noop);
        this.pressMove = wrapFunc(this.element, option.pressMove || noop);
        this.twoFingerPressMove = wrapFunc(this.element, option.twoFingerPressMove || noop);
        this.touchMove = wrapFunc(this.element, option.touchMove || noop);
        this.touchEnd = wrapFunc(this.element, option.touchEnd || noop);
        this.touchCancel = wrapFunc(this.element, option.touchCancel || noop);
        this._cancelAllHandler = this.cancelAll.bind(this);
        if (globalThis && typeof globalThis.addEventListener === "function") {
            globalThis.addEventListener('scroll', this._cancelAllHandler);
        }
        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.singleTapTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition = { x: null, y: null };
    }
    ;
    start(evt) {
        if (!evt.touches)
            return;
        const _self = this;
        this.now = Date.now();
        this.x1 = evt.touches[0].pageX;
        this.y1 = evt.touches[0].pageY;
        this.delta = this.now - (this.last || this.now);
        this.touchStart.dispatch(evt, this.element);
        if (this.preTapPosition.x !== null) {
            this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30);
            if (this.isDoubleTap)
                clearTimeout(this.singleTapTimeout);
        }
        this.preTapPosition.x = this.x1;
        this.preTapPosition.y = this.y1;
        this.last = this.now;
        const preV = this.preV;
        const len = evt.touches.length;
        if (len > 1) {
            this._cancelLongTap();
            this._cancelSingleTap();
            const v = { x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1 };
            preV.x = v.x;
            preV.y = v.y;
            this.pinchStartLen = getLen(preV);
            this.multipointStart.dispatch(evt, this.element);
        }
        this._preventTap = false;
        this.longTapTimeout = setTimeout((() => {
            _self.longTap.dispatch(evt, _self.element);
            _self._preventTap = true;
        }).bind(_self), 750);
    }
    ;
    move(event) {
        if (!event.touches)
            return;
        const afEvent = event;
        const preV = this.preV;
        const len = event.touches.length;
        const currentX = event.touches[0].pageX;
        const currentY = event.touches[0].pageY;
        this.isDoubleTap = false;
        if (len > 1) {
            const sCurrentX = afEvent.touches[1].pageX;
            const sCurrentY = afEvent.touches[1].pageY;
            const v = { x: afEvent.touches[1].pageX - currentX, y: afEvent.touches[1].pageY - currentY };
            if (preV.x !== null) {
                if (this.pinchStartLen > 0) {
                    afEvent.zoom = getLen(v) / this.pinchStartLen;
                    this.pinch.dispatch(afEvent, this.element);
                }
                afEvent.angle = getRotateAngle(v, preV);
                this.rotate.dispatch(afEvent, this.element);
            }
            preV.x = v.x;
            preV.y = v.y;
            if (this.x2 !== null && this.sx2 !== null) {
                afEvent.deltaX = (currentX - this.x2 + sCurrentX - this.sx2) / 2;
                afEvent.deltaY = (currentY - this.y2 + sCurrentY - this.sy2) / 2;
            }
            else {
                afEvent.deltaX = 0;
                afEvent.deltaY = 0;
            }
            this.twoFingerPressMove.dispatch(afEvent, this.element);
            this.sx2 = sCurrentX;
            this.sy2 = sCurrentY;
        }
        else {
            if (this.x2 !== null) {
                afEvent.deltaX = currentX - this.x2;
                afEvent.deltaY = currentY - this.y2;
                //move事件中添加对当前触摸点到初始触摸点的判断，
                //如果曾经大于过某个距离(比如10),就认为是移动到某个地方又移回来，应该不再触发tap事件才对。
                //
                // translation:
                //    Add the judgment of the current touch point to the initial touch point in the event,
                //    If it has been greater than a certain distance (such as 10), it is considered to be
                //    moved to a certain place and then moved back, and the tap event should no longer be triggered.
                const movedX = Math.abs(this.x1 - this.x2);
                const movedY = Math.abs(this.y1 - this.y2);
                if (movedX > 10 || movedY > 10) {
                    this._preventTap = true;
                }
            }
            else {
                afEvent.deltaX = 0;
                afEvent.deltaY = 0;
            }
            this.pressMove.dispatch(afEvent, this.element);
        }
        this.touchMove.dispatch(afEvent, this.element);
        this._cancelLongTap();
        this.x2 = currentX;
        this.y2 = currentY;
        if (len > 1) {
            event.preventDefault();
        }
    }
    ; // END move
    end(event) {
        if (!event.changedTouches)
            return;
        const afEvent = event;
        this._cancelLongTap();
        const self = this;
        if (afEvent.touches.length < 2) {
            this.multipointEnd.dispatch(afEvent, this.element);
            this.sx2 = this.sy2 = null;
        }
        //swipe
        if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
            (this.y2 && Math.abs(this.y1 - this.y2) > 30)) {
            afEvent.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
            this.swipeTimeout = setTimeout(function () {
                self.swipe.dispatch(afEvent, self.element);
            }, 0);
        }
        else {
            this.tapTimeout = setTimeout(function () {
                if (!self._preventTap) {
                    self.tap.dispatch(afEvent, self.element);
                }
                // trigger double tap immediately
                if (self.isDoubleTap) {
                    self.doubleTap.dispatch(afEvent, self.element);
                    self.isDoubleTap = false;
                }
            }, 0);
            if (!self.isDoubleTap) {
                self.singleTapTimeout = setTimeout(function () {
                    self.singleTap.dispatch(afEvent, self.element);
                }, 250);
            }
        }
        this.touchEnd.dispatch(afEvent, this.element);
        this.preV.x = 0;
        this.preV.y = 0;
        this.zoom = 1;
        this.pinchStartLen = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
    }
    ; // END end
    cancelAll() {
        this._preventTap = true;
        clearTimeout(this.singleTapTimeout);
        clearTimeout(this.tapTimeout);
        clearTimeout(this.longTapTimeout);
        clearTimeout(this.swipeTimeout);
    }
    ;
    cancel(evt) {
        this.cancelAll();
        this.touchCancel.dispatch(evt, this.element);
    }
    ;
    _cancelLongTap() {
        clearTimeout(this.longTapTimeout);
    }
    ;
    _cancelSingleTap() {
        clearTimeout(this.singleTapTimeout);
    }
    ;
    _swipeDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
    }
    ;
    on(evt, handler) {
        if (this[evt]) {
            // Force the generic parameter into it's expected candidate here ;)
            const admin = this[evt];
            admin.add(handler);
        }
    }
    ;
    off(evt, handler) {
        if (this[evt]) {
            // Force the generic parameter into it's expected candidate here ;)
            const admin = this[evt];
            admin.del(handler);
        }
    }
    ;
    destroy() {
        if (this.singleTapTimeout) {
            clearTimeout(this.singleTapTimeout);
        }
        if (this.tapTimeout) {
            clearTimeout(this.tapTimeout);
        }
        if (this.longTapTimeout) {
            clearTimeout(this.longTapTimeout);
        }
        if (this.swipeTimeout) {
            clearTimeout(this.swipeTimeout);
        }
        this.element.removeEventListener("touchstart", this.start);
        this.element.removeEventListener("touchmove", this.move);
        this.element.removeEventListener("touchend", this.end);
        this.element.removeEventListener("touchcancel", this.cancel);
        this.rotate.del();
        this.touchStart.del();
        this.multipointStart.del();
        this.multipointEnd.del();
        this.pinch.del();
        this.swipe.del();
        this.tap.del();
        this.doubleTap.del();
        this.longTap.del();
        this.singleTap.del();
        this.pressMove.del();
        this.twoFingerPressMove.del();
        this.touchMove.del();
        this.touchEnd.del();
        this.touchCancel.del();
        this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = this.rotate = this.touchStart = this.multipointStart = this.multipointEnd = this.pinch = this.swipe = this.tap = this.doubleTap = this.longTap = this.singleTap = this.pressMove = this.touchMove = this.touchEnd = this.touchCancel = this.twoFingerPressMove = null;
        if (globalThis && typeof globalThis.removeEventListener === "function") {
            globalThis.removeEventListener('scroll', this._cancelAllHandler);
        }
    }
    ; // END destroy
}
;
export default AlloyFinger;
//# sourceMappingURL=alloy_finger.js.map