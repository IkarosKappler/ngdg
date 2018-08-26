/**
 * Refactored the BoundingBox2.
 *
 * @requires Vertex
 * 
 * @author Ikaros Kappler
 * @date 2013-08-22
 * @modified 2018-08-16 Added closure. Removed the 'IKRS' wrapper.
 * @version 1.0.1
 **/


(function(_context) {
    "use strict";

    var BoundingBox = function( _xMin,
			    _xMax,
			    _yMin,
			    _yMax ) {
	
	IKRS.Object.call( this );
	
	this.xMin = _xMin;
	this.xMax = _xMax;
	this.yMin = _yMin;
	this.yMax = _yMax;
    }

    BoundingBox.prototype = new Object();
    BoundingBox.prototype.constructor = BoundingBox;

    BoundingBox.prototype.toString = function() {
	return "BoundingBox={ xMin: " + this.xMin + ", xMax: " + this.xMax + ", yMin: " + this.yMin + ", yMax: " + this.yMax + ", width: " + this.getWidth() + ", height: " + this.getHeight() + " }";
    }


    BoundingBox.prototype.getXMax = function() {
	return this.xMax;
    }

    BoundingBox.prototype.getXMin = function() {
	return this.xMin;
    }

    BoundingBox.prototype.getYMax = function() {
	return this.yMax;
    }

    BoundingBox.prototype.getYMin = function() {
	return this.yMin;
    }

    BoundingBox.prototype.getWidth = function() {
	return this.xMax - this.xMin;
    }

    BoundingBox.prototype.getHeight = function() {
	return this.yMax - this.yMin;
    }

    BoundingBox.prototype.getLeftUpperPoint = function() {
	return new Vertex( this.xMin, this.yMin );
    }

    BoundingBox.prototype.getRightUpperPoint = function() {
	return new Vertex( this.xMax, this.yMin );
    }

    BoundingBox.prototype.getRightLowerPoint = function() {
	return new Vertex( this.xMax, this.yMax );
    }

    BoundingBox.prototype.getLeftLowerPoint = function() {
	return new Vertex( this.xMin, this.yMax );
    }


    BoundingBox.prototype._toString = function() {
	return "[IKRS.BoundingBox2]={ xMin=" + this.xMin + ", xMax=" + this.xMax + ", yMin=" + this.yMin + ", yMax=" + this.yMax + ", width=" + this.getWidth() + ", height=" + this.getHeight() + " }";
    }


    // A static function
    BoundingBox.computeFromPoints = function( points ) {

	if( !points )
	    points = [];
	
	if( points.length == 0 )
	    return new BoundingBox( 0, 0, 0, 0 );

	var xMin = points[0].x;
	var xMax = points[0].x;
	var yMin = points[0].y;
	var yMax = points[0].y;
	
	for( var i = 1; i < points.length; i++ ) {

	    var point = points[ i ];
	    xMin = Math.min( xMin, point.x );
	    xMax = Math.max( xMax, point.x );
	    yMin = Math.min( yMin, point.y );
	    yMax = Math.max( yMax, point.y );

	}

	return new BoundingBox( xMin, xMax, yMin, yMax );

    }

    _context.BoundingBox = BoundingBox;
})(window);
