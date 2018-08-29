/**
 * Moved some draw functions to this wrapper.
 *
 * @require Vertex
 *
 * @author   Ikaros Kappler
 * @date     2018-04-22
 * @modified 2018-08-16 Added the curve() function to draw cubic bézier curves.
 * @version  1.0.1
 **/

(function(_context) {
    "use strict";
    
    _context.drawutils = function( context, fillShapes ) {
	this.ctx = context;
	this.offset = new Vertex(0,0);
	this.fillShapes = fillShapes;
    };

    // +---------------------------------------------------------------------------------
    // | Draw the given line (between the two points) with the specified (CSS-) color.
    // +-------------------------------
    // CURRENTLY NOT IN USE
    _context.drawutils.prototype.line = function( zA, zB, color ) {
	    this.ctx.beginPath();
	    this.ctx.moveTo( this.offset.x+zA.x, this.offset.y+zA.y );
	    this.ctx.lineTo( this.offset.x+zB.x, this.offset.y+zB.y );
	    this.ctx.strokeStyle = color;
	    this.ctx.lineWidth = 1;
	    this.ctx.stroke();
    };


    _context.drawutils.prototype._fillOrDraw = function( color ) {
	if( this.fillShapes ) {
	    this.ctx.fillStyle = color;
	    this.ctx.fill();
	} else {
	    this.ctx.strokeStyle = color;
	    this.ctx.stroke();
	}
    };
    

    
    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    _context.drawutils.prototype.cubicBezierCurve = function( curve ) {
	// Draw curve
	this.ctx.beginPath();
	this.ctx.moveTo( curve.startPoint.x, curve.startPoint.y );
	this.ctx.bezierCurveTo( curve.startControlPoint.x, curve.startControlPoint.y,
				curve.endControlPoint.x, curve.endControlPoint.y,
				curve.endPoint.x, curve.endPoint.y );
	this._fillOrDraw( '#00a822' );

    };


    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    _context.drawutils.prototype.cubicBezierHandles = function( curve ) {
	// Draw handles
	this.point( curve.startPoint, 'rgb(0,32,192)' );
	this.point( curve.endPoint, 'rgb(0,32,192)' );
	this.square( curve.startControlPoint, 5, 'rgba(0,128,192,0.5)' );
	this.square( curve.endControlPoint, 5, 'rgba(0,128,192,0.5)' );
    };


    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    _context.drawutils.prototype.cubicBezierHandleLines = function( curve ) {
	// Draw handle lines
	this.line( curve.startPoint, curve.startControlPoint, 'lightgrey' );
	this.line( curve.endPoint, curve.endControlPoint, 'lightgrey' );
    };



    
    // +---------------------------------------------------------------------------------
    // | Fill the given point with the specified (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.point = function( p, color ) {
	var radius = 3;
	this.ctx.beginPath();
	this.ctx.arc( p.x, p.y, radius, 0, 2 * Math.PI, false );
	this.ctx.closePath();
	this._fillOrDraw( color );
    };


    // +---------------------------------------------------------------------------------
    // | Fill the given point with the specified (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.circle = function( center, radius, color ) {
	this.ctx.beginPath();
	this.ctx.arc( center.x, center.y, radius, 0, Math.PI*2 );
	this.ctx.closePath();
	this._fillOrDraw( color );
    };

    
    // +---------------------------------------------------------------------------------
    // | Fill a square with the given (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.square = function( center, size, color ) {
	this.ctx.beginPath();
	this.ctx.rect( center.x-size/2.0, center.y-size/2.0, size, size );
	this.ctx.closePath();
	this._fillOrDraw( color );
    };


    // +---------------------------------------------------------------------------------
    // | Draw a crosshair with given radius and color at the given position.
    // +-------------------------------
    _context.drawutils.prototype.crosshair = function( center, radius, color ) {
	this.ctx.beginPath();
	this.ctx.moveTo( center.x-radius, center.y );
	this.ctx.lineTo( center.x+radius, center.y );
	this.ctx.moveTo( center.x, center.y-radius );
	this.ctx.lineTo( center.x, center.y+radius );
	this.ctx.strokeStyle = color;
	this.ctx.lineWidth = 0.5;
	this.ctx.stroke();
	this.ctx.closePath();
    };

    _context.drawutils.prototype.string = function( text, x, y ) {
	if( this.fillShapes ) {
	    this.ctx.fillStyle = 'black';
	    this.ctx.fillText( text, x, y );
	} else {
	    this.ctx.strokeStyle = 'black';
	    this.ctx.strokeText( text, x, y, );
	}
    };
    
    
})(window ? window : module.export );
