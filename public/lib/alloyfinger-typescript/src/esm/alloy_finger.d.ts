/**
 * A basic vector interface {x,y}. Used to identify points on the plane.
 */
interface XYCoords {
    x: number;
    y: number;
}
/**
 * Constants identifying swipe directions, as their names say.
 */
declare type SwipeDirection = "Up" | "Right" | "Left" | "Down";
/**
 * These are the supported event names and exactly match the event handlers in `this`.
 * This allows direct handler access by name respecting Typescript's type restrictions.
 */
declare type EventName = "rotate" | "touchStart" | "multipointStart" | "multipointEnd" | "pinch" | "swipe" | "tap" | "doubleTap" | "longTap" | "singleTap" | "pressMove" | "twoFingerPressMove" | "touchMove" | "touchEnd" | "touchCancel";
/**
 * A basic (extended) touch event interface for different AlloyFinger event types.
 */
interface AFTouchGenericEvent<N extends EventName> extends TouchEvent {
    _ename: N;
    angle: number;
    zoom: number;
    deltaX: number;
    deltaY: number;
    direction: SwipeDirection;
}
/** A simple touch event. Nothing special. */
export interface AFTouchEvent<N extends EventName> extends Pick<AFTouchGenericEvent<N>, "touches"> {
}
/** A 'touchRotate' touch event. Has. */
export interface TouchRotateEvent extends Omit<AFTouchGenericEvent<"rotate">, "_ename" | "zoom" | "deltaX" | "deltaY" | "direction"> {
}
export interface TouchPinchEvent extends Omit<AFTouchGenericEvent<"pinch">, "_ename" | "angle" | "deltaX" | "deltaY" | "direction"> {
}
export interface TouchMoveEvent extends Omit<AFTouchGenericEvent<"touchMove">, "_ename" | "angle" | "zoom" | "direction"> {
}
export interface TouchPressMoveEvent extends Omit<AFTouchGenericEvent<"pressMove">, "_ename" | "angle" | "zoom" | "direction"> {
}
export interface TouchSwipeEvent extends Omit<AFTouchGenericEvent<"swipe">, "_ename" | "angle" | "zoom" | "deltaX" | "deltaY"> {
}
export declare type TouchCallback<E> = (evt: E) => void;
export interface AlloyFingerOptions {
    rotate?: TouchCallback<TouchRotateEvent>;
    touchStart?: TouchCallback<AFTouchEvent<"touchStart">>;
    multipointStart?: TouchCallback<AFTouchEvent<"multipointStart">>;
    multipointEnd?: TouchCallback<AFTouchEvent<"multipointEnd">>;
    pinch?: TouchCallback<TouchPinchEvent>;
    swipe?: TouchCallback<TouchSwipeEvent>;
    tap?: TouchCallback<AFTouchEvent<"tap">>;
    doubleTap?: TouchCallback<AFTouchEvent<"doubleTap">>;
    longTap?: TouchCallback<AFTouchEvent<"longTap">>;
    singleTap?: TouchCallback<AFTouchEvent<"singleTap">>;
    pressMove?: TouchCallback<TouchPressMoveEvent>;
    twoFingerPressMove?: TouchCallback<TouchPressMoveEvent>;
    touchMove?: TouchCallback<TouchMoveEvent>;
    touchEnd?: TouchCallback<AFTouchEvent<"touchEnd">>;
    touchCancel?: TouchCallback<AFTouchEvent<"touchCancel">>;
}
export declare type Handler<N extends EventName, E extends AFTouchEvent<N>> = (evt: E) => void;
declare type Timer = ReturnType<typeof setTimeout>;
/**
 * A HandlerAdmin holds all the added event handlers for one kind of event type.
 */
declare class HandlerAdmin<N extends EventName> {
    private handlers;
    private el;
    constructor(el: HTMLElement | SVGElement);
    add(handler: Handler<N, AFTouchEvent<N>>): void;
    del(handler?: Handler<N, AFTouchEvent<N>>): void;
    dispatch(..._args: any[]): void;
}
/**
 * @classdesc The AlloyFinger main class. Use this to add handler functions for
 *            touch events to any HTML- or SVG-Element.
 **/
export declare class AlloyFinger {
    element: HTMLElement | SVGElement;
    preV: XYCoords;
    pinchStartLen: number;
    zoom: number;
    isDoubleTap: boolean;
    rotate: HandlerAdmin<"rotate">;
    touchStart: HandlerAdmin<"touchStart">;
    multipointStart: HandlerAdmin<"multipointStart">;
    multipointEnd: HandlerAdmin<"multipointEnd">;
    pinch: HandlerAdmin<"pinch">;
    swipe: HandlerAdmin<"swipe">;
    tap: HandlerAdmin<"tap">;
    doubleTap: HandlerAdmin<"doubleTap">;
    longTap: HandlerAdmin<"longTap">;
    singleTap: HandlerAdmin<"singleTap">;
    pressMove: HandlerAdmin<"pressMove">;
    twoFingerPressMove: HandlerAdmin<"twoFingerPressMove">;
    touchMove: HandlerAdmin<"touchMove">;
    touchEnd: HandlerAdmin<"touchEnd">;
    touchCancel: HandlerAdmin<"touchCancel">;
    _cancelAllHandler: () => void;
    delta: number;
    last: number;
    now: number;
    tapTimeout: Timer;
    singleTapTimeout: Timer;
    longTapTimeout: Timer;
    swipeTimeout: Timer;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    preTapPosition: XYCoords;
    _preventTap: boolean;
    sx2: number;
    sy2: number;
    constructor(el: HTMLElement | SVGElement, option: AlloyFingerOptions);
    start(evt: TouchEvent): void;
    move(event: TouchEvent): void;
    end(event: TouchEvent): void;
    cancelAll(): void;
    cancel(evt: TouchEvent): void;
    private _cancelLongTap;
    private _cancelSingleTap;
    private _swipeDirection;
    on<N extends EventName>(evt: N, handler: Handler<N, AFTouchEvent<N>>): void;
    off<N extends EventName>(evt: N, handler: Handler<N, AFTouchEvent<N>>): void;
    destroy(): void;
}
export default AlloyFinger;
