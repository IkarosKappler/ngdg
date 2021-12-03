"use strict";
/**
 * Example usage of AlloyFinger.
 *
 * @date 2021-02-12
 */
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
new index_1.default(document.getElementsByTagName('body')[0], {
    touchStart: function (_evt) {
        return console.log('touchStart');
    },
    touchMove: function (evt) {
        return console.log('touchMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4));
    },
    touchEnd: function (_evt) {
        return console.log('touchEnd');
    },
    tap: function (_evt) {
        return console.log('tap');
    },
    doubleTap: function (evt) {
        return console.log('doubleTap', evt.touches[0].clientX.toFixed(4), evt.touches[0].clientY.toFixed(4));
    },
    longTap: function (_evt) {
        return console.log('longTap');
    },
    singleTap: function (_evt) {
        return console.log('singleTap');
    },
    rotate: function (evt) {
        return console.log('rotate', evt.angle);
    },
    pinch: function (evt) {
        return console.log('pinch', evt.zoom);
    },
    pressMove: function (evt) {
        return console.log('pressMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4));
    },
    swipe: function (evt) {
        return console.log('swipe', evt.direction);
    },
    multipointStart: function (_evt) {
        return console.log('multiPointStart');
    },
    multipointEnd: function (_evt) {
        return console.log('multiPointEnd');
    },
    twoFingerPressMove: function (evt) {
        return console.log('twoFingerPressMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4));
    },
    touchCancel: function (_evt) {
        return console.log('touchEnd');
    }
});
//# sourceMappingURL=example.js.map