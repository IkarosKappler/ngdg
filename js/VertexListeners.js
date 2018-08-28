/**
 * An event listeners wrapper.
 *
 * @author  Ikaros Kappler
 * @date    2018-08-27
 * @version 1.0.0
 **/

(function(_context) {
    "use strict";

    // +------------------------------------------------------------
    // | The constructor.
    // +-------------------------------------------------------
    var VertexListeners = function() {
	this.drag = [];
	this.dragStart = [];
	this.dragEnd = [];
    };

    // +------------------------------------------------------------
    // | Add a drag listener.
    // |
    // | @param listener:function(e) The drag listener to add. 
    // +-------------------------------------------------------
    VertexListeners.prototype.addDragListener = function( listener ) {
	this.drag.push( listener );
    };

    // +------------------------------------------------------------
    // | Add a dragStart listener.
    // |
    // | @param listener:function(e) The dragStart listener to add. 
    // +-------------------------------------------------------
    VertexListeners.prototype.addDragStartListener = function( listener ) {
	this.dragStart.push( listener );
    };

    // +------------------------------------------------------------
    // | Add a dragEnd listener.
    // |
    // | @param listener:function(e) The dragEnd listener to add. 
    // +-------------------------------------------------------
    VertexListeners.prototype.addDragEndListener = function( listener ) {
	this.dragEnd.push( listener );
    };

    // +------------------------------------------------------------
    // | Fire a drag event with the given event instance to all
    // | installed drag listeners.
    // |
    // | @param e:AnyEvent This event will be fired to all drag listeners. 
    // +-------------------------------------------------------
    VertexListeners.prototype.fireDragEvent = function( e ) {
	_fireEvent(this.drag,e);
    };

    // +------------------------------------------------------------
    // | Fire a dragStart event with the given event instance to all
    // | installed drag listeners.
    // |
    // | @param e:AnyEvent This event will be fired to all dragStart listeners. 
    // +-------------------------------------------------------
    VertexListeners.prototype.fireDragStartEvent = function( e ) {
	_fireEvent(this.dragStart,e);
    };

    // +------------------------------------------------------------
    // | Fire a dragEnd event with the given event instance to all
    // | installed drag listeners.
    // |
    // | @param e:AnyEvent This event will be fired to all dragEnd listeners. 
    // +-------------------------------------------------------
    VertexListeners.prototype.fireDragEndEvent = function( e ) {
	_fireEvent(this.dragEnd,e);
    };

    var _fireEvent = function( listeners, e ) {
	for( var i in listeners ) {
	    listeners[i]( e );
	}
    };

    // Export constructor to context.
    _context.VertexListeners = VertexListeners;
    
})(window);
