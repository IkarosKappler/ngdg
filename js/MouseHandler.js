/**
 * A simple mouse handler for demos. 
 * Use to avoid load massive libraries like jQuery.
 *
 * Usage: 
 *   new MouseHandler( document.getElementById('mycanvas') )
 *	    .drag( function(e) {
 *		console.log( 'Mouse dragged: ' + JSON.stringify(e) );
 *		if( e.params.leftMouse ) ;
 *		else if( e.params.rightMouse ) ;
 *	    } )
 *	    .move( function(e) {
 *		console.log( 'Mouse moved: ' + JSON.stringify(e.params) );
 *	    } )
 *          .mouseup( function(e) {
 *              console.log( 'Mouse up.' );
 *          } )
 *          .mousedown( function(e) {
 *              console.log( 'Mouse down.' );
 *          } )
 *          .click( function(e) {
 *              console.log( 'Click.' );
 *          } );
 *
 *
 * @author   Ikaros Kappler
 * @date     2018-03-19
 * @modified 2018-04-28 Added the param 'wasDragged'.
 * @modified 2018-08-16 Added the param 'dragAmount'.
 * @modified 2018-08-27 Added the param 'element'.
 * @version  1.0.3
 **/

var MouseHandler = (function() {

    // +----------------------------------------------------------------------
    // | The constructor.
    // |
    // | Pass the DOM element you want to receive mouse events from.
    // +-------------------------------------------------
    function __constructor( element ) {

	// +----------------------------------------------------------------------
	// | Some private vars to store the current mouse/position/button state.
	// +-------------------------------------------------
	var mouseDownPos = null;
	var mouseDragPos = null;
	var mousePos     = null;
	var mouseButton  = -1;
	var listeners    = {};
	var installed    = {};
	var handlers     = {};


	// +----------------------------------------------------------------------
	// | Some private vars to store the current mouse/position/button state.
	// +-------------------------------------------------
	function relPos(e) {
	    return { x : e.pageX - e.target.offsetLeft,
		     y : e.pageY - e.target.offsetTop
		   };
	}
	function mkParams(e,eventName) {
	    var rel = relPos(e);
	    e.params = { element : element, name : eventName, pos : rel, button : mouseButton, leftButton : mouseButton==0, middleButton : mouseButton==1, rightButton : mouseButton==2, mouseDownPos : mouseDownPos, draggedFrom : mouseDragPos, wasDragged : (mouseDownPos!=null&&(mouseDownPos.x!=rel.x||mouseDownPos.y!=rel.y)), dragAmount : (mouseDownPos!=null?{x:rel.x-mouseDragPos.x,y:rel.y-mouseDragPos.y}:{x:0,y:0}) };
	    return e;
	}

	function listenFor( eventName ) {
	    if( installed[eventName] ) return;
	    element.addEventListener(eventName,handlers[eventName]);
	    installed[eventName] = true;
	}

	function unlistenFor( eventName ) {
	    if( !installed[eventName] ) return;
	    element.removeEventListener(eventName,handlers[eventName]);
	    delete installed[eventName];
	}


	// +----------------------------------------------------------------------
	// | Define the internal event handlers.
	// |
	// | They will dispatch the modified event (relative mouse position,
	// | drag offset, ...) to the callbacks.
	// +-------------------------------------------------
	handlers['mousemove'] = function(e) {
	    if( listeners.mousemove ) listeners.mousemove( mkParams(e,'mousemove') );
	    if( mouseDragPos && listeners.drag ) listeners.drag( mkParams(e,'drag') );
	    if( mouseDownPos ) mouseDragPos = relPos(e);
	}
	handlers['mouseup'] = function(e) {
	    if( listeners.mouseup ) listeners.mouseup( mkParams(e,'mouseup') );
	    mouseDragPos = null;
	    mouseDownPos = null;
	    mouseButton  = -1;
	}
	handlers['mousedown'] = function(e) {
	    mouseDragPos = relPos(e);
	    mouseDownPos = relPos(e);
	    mouseButton = e.button;
	    if( listeners.mousedown ) listeners.mousedown( mkParams(e,'mousedown') );
	}
	handlers['click'] = function(e) {
	    if( listeners.click ) listeners.click( mkParams(e,'mousedown') );
	}


	// +----------------------------------------------------------------------
	// | The installer functions.
	// |
	// | Pass your callbacks here.
	// | Note: they support chaining.
	// +-------------------------------------------------
	this.drag = function( callback ) {
	    if( listeners.drag ) throw "This MouseHandler already has a 'drag' callback.";
	    listeners.drag = callback;
	    listenFor('mousedown');
	    listenFor('mousemove');
	    listenFor('mouseup');
	    listeners.drag = callback;
	    return this;
	};
	this.move = function( callback ) {
	    if( listeners.mousemove ) throw "This MouseHandler already has a 'mousemove' callback. To keep the code simple there is only room for one.";
	    listenFor('mousemove');
	    listeners.mousemove = callback;
	    return this;
	};
	this.mouseup = function( callback ) {
	    if( listeners.mouseup ) throw "This MouseHandler already has a 'mouseup' callback. To keep the code simple there is only room for one.";
	    listenFor('mouseup');
	    listeners.mouseup = callback;
	    return this;
	};
	this.mousedown = function( callback ) {
	    if( listeners.mousedown ) throw "This MouseHandler already has a 'mousedown' callback. To keep the code simple there is only room for one.";
	    listenFor('mousedown');
	    listeners.mousedown = callback;
	    return this;
	};
	this.click = function( callback ) {
	    if( listeners.click ) throw "This MouseHandler already has a 'click' callback. To keep the code simple there is only room for one.";
	    listenFor('click');
	    listeners.click = callback;
	    return this;
	};

	
	// +----------------------------------------------------------------------
	// | Call this when your work is done.
	// |
	// | The function will un-install all event listeners.
	// +-------------------------------------------------
	this.destroy = function() {
	    console.log('destroy');
	    unlistenFor('mousedown');
	    unlistenFor('mousemove');
	    unlistenFor('moseup');
	    unlistenFor('click');
	}
    }

    return __constructor;
})();
