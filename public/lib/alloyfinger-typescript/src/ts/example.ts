/**
 * Example usage of AlloyFinger.
 *
 * @date 2021-02-12
 */


import AlloyFinger, { TouchMoveEvent,
		      TouchPinchEvent,
		      TouchPressMoveEvent,
		      TouchRotateEvent,
		      TouchSwipeEvent } from "./index";

new AlloyFinger( document.getElementsByTagName('body')[0], {
    touchStart: (_evt : TouchEvent) => 
	console.log('touchStart'),

    touchMove: (evt : TouchMoveEvent) =>
	console.log('touchMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4)),
    
    touchEnd: (_evt: TouchEvent) =>
	console.log('touchEnd'),
    
    tap: (_evt : TouchEvent) =>
	console.log('tap'),

    doubleTap: (evt : TouchEvent) =>
	console.log('doubleTap', evt.touches[0].clientX.toFixed(4), evt.touches[0].clientY.toFixed(4)),
    
    longTap:  (_evt : TouchEvent) =>
	console.log('longTap'),

    singleTap: (_evt : TouchEvent) => 
	console.log('singleTap'),
    
    rotate: (evt : TouchRotateEvent) =>
	console.log('rotate', evt.angle ),
    
    pinch: (evt : TouchPinchEvent) =>
	console.log('pinch', evt.zoom),
    
    pressMove: (evt : TouchPressMoveEvent) =>
	console.log('pressMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4)),
    
    swipe: (evt : TouchSwipeEvent) =>
	console.log('swipe', evt.direction ),

    multipointStart: (_evt : TouchEvent) =>
	console.log('multiPointStart'),
    
    multipointEnd: (_evt : TouchEvent) =>
	console.log('multiPointEnd'),
    
    twoFingerPressMove:  (evt: TouchPressMoveEvent) =>
	console.log('twoFingerPressMove', evt.deltaX.toFixed(4), evt.deltaY.toFixed(4)),

    touchCancel: (_evt : TouchEvent) =>
	console.log('touchEnd')

} );
