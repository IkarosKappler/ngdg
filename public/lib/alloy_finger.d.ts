/**
 * Needed the d.ts file for alloy_finger but could not find it.
 * So I wrote one myself.
 * 
 * https://www.npmjs.com/package/alloyfinger
 *
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-02-08
 */

interface Touch {
    altitudeAngle : number;
    azimuthAngle : number;
    clientX : number;
    clientY : number;
    force : number;
    identifier : number;
    pageX : number;
    pageY : number;
    radiusX : number;
    radiusY : number;
    rotationAngle : number;
    screenX : number;
    screenY : number;
    target : Element;
    touchType : number;
}

interface TouchList extends Array<Touch> {
    item : (index:number)=>Touch;
}

interface AFTouchEvent {
    touches: TouchList;
}

export interface TouchRotateEvent extends AFTouchEvent {
    angle : number;
}

export interface TouchPinchEvent extends AFTouchEvent  {
    zoom : number;
}

export interface TouchMoveEvent extends AFTouchEvent  {
    deltaX : number;
    deltaY : number;
}

export interface TouchPressMoveEvent extends AFTouchEvent  {
    deltaX : number;
    deltaY : number;
}

export interface TouchSwipeEvent extends AFTouchEvent  {
    direction : number;
}

export declare class AlloyFinger {
    constructor(element:Element, params:{
	touchStart?: (evt:TouchEvent)=>void,
	touchMove?: (evt:TouchEvent)=>void,
	touchEnd?: (evt:TouchEvent)=>void,
	touchCancel?: (evt:TouchEvent)=>void,
	multipointStart?: (evt:TouchEvent)=>void,
	multipointEnd?: (evt:TouchEvent)=>void,
	tap?: (evt:TouchEvent)=>void,
	doubleTap?: (evt:TouchEvent)=>void,
	longTap?: (evt:TouchEvent)=>void,
	singleTap?: (evt:TouchEvent)=>void,
	rotate?: (evt:TouchRotateEvent)=>void,
	pinch?: (evt:TouchPinchEvent)=>void,
	pressMove?: (evt:TouchPressMoveEvent)=>void,
	swipe?: (evt:TouchSwipeEvent)=>void
    } );
}
