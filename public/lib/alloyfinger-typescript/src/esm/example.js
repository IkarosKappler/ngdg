/**
 * Example usage of AlloyFinger.
 *
 * @date 2021-02-12
 */
import AlloyFinger from "./index";
new AlloyFinger(document.getElementsByTagName('body')[0], {
    touchStart: (_evt) => console.log('touchStart'),
    touchMove: (evt) => console.log('touchMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4)),
    touchEnd: (_evt) => console.log('touchEnd'),
    tap: (_evt) => console.log('tap'),
    doubleTap: (evt) => console.log('doubleTap', evt.touches[0].clientX.toFixed(4), evt.touches[0].clientY.toFixed(4)),
    longTap: (_evt) => console.log('longTap'),
    singleTap: (_evt) => console.log('singleTap'),
    rotate: (evt) => console.log('rotate', evt.angle),
    pinch: (evt) => console.log('pinch', evt.zoom),
    pressMove: (evt) => console.log('pressMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4)),
    swipe: (evt) => console.log('swipe', evt.direction),
    multipointStart: (_evt) => console.log('multiPointStart'),
    multipointEnd: (_evt) => console.log('multiPointEnd'),
    twoFingerPressMove: (evt) => console.log('twoFingerPressMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4)),
    touchCancel: (_evt) => console.log('touchEnd')
});
//# sourceMappingURL=example.js.map