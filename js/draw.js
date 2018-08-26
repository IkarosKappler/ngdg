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
    
    _context.drawutils = function( context ) {
	this.ctx = context;
	this.offset = new Vertex(0,0); 
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
    

    
    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    _context.drawutils.prototype.cubicBezierCurve = function( curve ) {
	// Draw handle lines
	this.line( curve.startPoint, curve.startControlPoint, 'lightgrey' );
	this.line( curve.endPoint, curve.endControlPoint, 'lightgrey' );

	// Draw curve
	this.ctx.beginPath();
	this.ctx.moveTo( curve.startPoint.x, curve.startPoint.y );
	this.ctx.bezierCurveTo( curve.startControlPoint.x, curve.startControlPoint.y,
				curve.endControlPoint.x, curve.endControlPoint.y,
				curve.endPoint.x, curve.endPoint.y );
	this.ctx.strokeStyle = '#00a822';
	this.ctx.stroke();

	// Draw handles
	this.point( curve.startPoint, 'rgb(0,32,192)' );
	this.point( curve.endPoint, 'rgb(0,32,192)' );
	this.square( curve.startControlPoint, 5, 'rgb(0,32,192)' );
	this.square( curve.endControlPoint, 5, 'rgb(0,32,192)' );
    };

    
    // +---------------------------------------------------------------------------------
    // | Fill the given point with the specified (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.point = function( p, color ) {
	var radius = 3;
	this.ctx.beginPath();
	this.ctx.arc( p.x, p.y, radius, 0, 2 * Math.PI, false );
	this.ctx.closePath();
	this.ctx.fillStyle = color;
	this.ctx.fill();
    };


    // +---------------------------------------------------------------------------------
    // | Fill the given point with the specified (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.circle = function( center, radius, color ) {
	this.ctx.fillStyle = color;
	this.ctx.beginPath();
	this.ctx.arc( center.x, center.y, radius, 0, Math.PI*2 );
	this.ctx.closePath();
	this.ctx.fill();
    };

    
    // +---------------------------------------------------------------------------------
    // | Fill a square with the given (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.square = function( center, size, color ) {
	this.ctx.fillStyle = color;
	this.ctx.beginPath();
	this.ctx.rect( center.x-size/2.0, center.y-size/2.0, size, size );
	this.ctx.closePath();
	this.ctx.fill();
    };
    
    
})(window ? window : module.export );
