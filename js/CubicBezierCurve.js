/**
 * A refactored cubic bezier curve class.
 *
 * @requires Vertex
 *
 * @author Ikaros Kappler
 * @date 2013-08-15
 * @modified 2018-08-16 Added a closure. Removed the wrapper class 'IKRS'. Replaced class THREE.Vector2 by Vertex class.
 * @version 1.0.1
 **/


(function(_context) {
    "use strict";

    var CubicBezierCurve = function ( p_startPoint,        // THREE.Vector2
				      p_endPoint,          // THREE.Vector2
				      p_startControlPoint, // THREE.Vector2
				      p_endControlPoint    // THREE.Vector2
				    ) {
	
	
	// Call super constructor
	Object.call( this );
	
	
	this.startPoint         = p_startPoint;
	this.startControlPoint  = p_startControlPoint;
	this.endPoint           = p_endPoint;
	this.endControlPoint    = p_endControlPoint;
	
	
	this.curveIntervals     = 30;
	
	// An array of points
	this.segmentCache       = [];

	// An array of floats
	this.segmentLengths     = [];
	
	// float
	this.arcLength          = null;
	
	
	this.updateArcLengths();
    };

    CubicBezierCurve.START_POINT         = 0;
    CubicBezierCurve.START_CONTROL_POINT = 1;
    CubicBezierCurve.END_CONTROL_POINT   = 2;
    CubicBezierCurve.END_POINT           = 3;
    
    CubicBezierCurve.prototype = new Object();
    CubicBezierCurve.prototype.constructor = CubicBezierCurve; 
    
    CubicBezierCurve.prototype.START_POINT         = 0;
    CubicBezierCurve.prototype.START_CONTROL_POINT = 1;
    CubicBezierCurve.prototype.END_CONTROL_POINT   = 2;
    CubicBezierCurve.prototype.END_POINT           = 3;

    

    CubicBezierCurve.prototype.moveCurvePoint = function( pointID,           // int
							  moveAmount,        // Vertex
							  moveControlPoint,  // boolean
							  updateArcLengths   // boolean
							) {
	if( pointID == this.START_POINT ) {

	    this.getStartPoint().add( moveAmount );	
	    if( moveControlPoint )
		this.getStartControlPoint().add( moveAmount );

	} else if( pointID == this.START_CONTROL_POINT ) {

	    this.getStartControlPoint().add( moveAmount );

	} else if( pointID == this.END_CONTROL_POINT ) {
	    
	    this.getEndControlPoint().add( moveAmount );

	} else if( pointID == this.END_POINT ) {

	    this.getEndPoint().add( moveAmount );
	    if( moveControlPoint )
		this.getEndControlPoint().add( moveAmount );

	} else {

	    console.log( "[IKRS.CubicBezierCurve.moveCurvePoint] pointID '" + pointID +"' invalid." );

	}


	
	if( updateArcLengths )
	    this.updateArcLengths();
    }


    // +---------------------------------------------------------------------------------
    // | Translate the whole curve by the given {x,y} amount.
    // |
    // | @param amount:Vertex The amount to translate this curve by.
    // | @return CubicBezierCurve (this curve for chaining).
    // +-------------------------------
    CubicBezierCurve.prototype.translate = function( amount ) {
	this.startPoint.add( amount );
	this.startControlPoint.add( amount );
	this.endControlPoint.add( amount );
	this.endPoint.add( amount );   
    };
    

    CubicBezierCurve._scalePoint = function( point,   // Vector2
					     anchor,  // Vector2
					     scaling  // Vector2
					   ) {
	// Move point to origin
	point.sub( anchor );
	// Apply scaling
	point.setX( point.x * scaling.x );
	point.setY( point.y * scaling.y );
	// Move back to original position
	point.add( anchor );
	
    };

    CubicBezierCurve.prototype.getLength = function() {
	return this.arcLength;
    };

    /**
     * This function computes the area size of this bezier curve in an y-axis 
     * integrational approach.
     *
     * For each bezier segment (which are linear segments) the distance to a given
     * relative Y axis is computed (position of Y axis specified by 'relativeX'
     * parameter).
     *
     * Each resulting sub area has a determined segment height and thus a determined
     * area size. The sum of all segment area sizes is returned.
     **/
    CubicBezierCurve.prototype.computeVerticalAreaSize = function( relativeX,
								   deltaSize, 
								   useAbsoluteValues 
								 ) {
	
	if( deltaSize == 0 )
	    throw "Cannot compute bezier curve's vertical area size with delta=0.";
	
	if( this.segmentCache.length <= 1 )
	    return 0.0;


	var size = 0.0;
	for( var i = 0; i+1 < this.segmentCache.length; i++ ) {

	    size += this._computeVerticalAreaSizeForSegment( relativeX,
							     deltaSize,
							     useAbsoluteValues,
							     i
							   );

	}

	return size;
    };

    /**
     * This helper function computes the area size of the given segment (param segmentIndex).
     **/
    CubicBezierCurve.prototype._computeVerticalAreaSizeForSegment = function( relativeX,
									      deltaSize, 
									      useAbsoluteValues, 
									      segmentIndex 
									    ) {

	// Two points make a segment.
	// So at least two points must be available. Otherwise there is no area (size=0).
	if( segmentIndex+1 >= this.segmentCache.length )
	    return 0.0;

	var segmentA      = this.segmentCache[ segmentIndex ];
	var segmentB      = this.segmentCache[ segmentIndex+1 ];
	var segmentHeight = segmentB.y - segmentA.y;
	
	
	var relativeA = relativeX - segmentA.x;
	var relativeB = relativeX - segmentB.x;
	var averageX = relativeB + (relativeA - relativeB) / 2.0;
        
	if( useAbsoluteValues )
	    return Math.abs( segmentHeight * averageX );
	else
	    return segmentHeight * averageX;              // May be negative
	
    };


    /**
     * This function computes the volume size of that revolution solid which outline
     * is determined by the bezier curve.
     *
     * The calculation uses the segments area sizes to compute each layer's volume.
     **/
    CubicBezierCurve.prototype.computeVerticalRevolutionVolumeSize = function( relativeX,
									       //deltaSize, 
									       useAbsoluteValues 
									     ) {
		
	if( this.segmentCache.length <= 1 )
	    return 0.0;


	var volume = 0.0;
	for( var i = 0; i+1 < this.segmentCache.length; i++ ) {

	    volume += this._computeVerticalRevolutionVolumeSizeForSegment( relativeX,
									   //deltaSize,
									   useAbsoluteValues,
									   i
									 );

	}

	return volume;
    };

    /**
     * This helper function computes the area size of the given segment (param segmentIndex).
     **/
    CubicBezierCurve.prototype._computeVerticalRevolutionVolumeSizeForSegment = function( relativeX,
											  //deltaSize, 
											  useAbsoluteValues, 
											  segmentIndex 
											) {

	// Two points make a segment.
	// So at least two points must be available. Otherwise there is no area (size=0).
	if( segmentIndex+1 >= this.segmentCache.length )
	    return 0.0;

	var segmentA      = this.segmentCache[ segmentIndex ];
	var segmentB      = this.segmentCache[ segmentIndex+1 ];
	var segmentHeight = segmentB.y - segmentA.y;
	
	
	var relativeA = relativeX - segmentA.x;
	var relativeB = relativeX - segmentB.x;
	//var averageX  = relativeB + (relativeA - relativeB) / 2.0;
	var averageX  = (relativeA + relativeB) / 2.0;

	// Volume is PI * square(radius) * height
	var volume    = Math.PI * Math.pow(averageX,2) * segmentHeight;

	if( useAbsoluteValues )
	    return Math.abs( volume );
	else
	    return volume;              // May be negative
	
    };


    CubicBezierCurve.prototype.updateArcLengths = function() {
	var 
	pointA = new Vertex( this.startPoint.x,
				    this.startPoint.y
				  ),
	pointB = new Vertex( 0, 0 ),
	curveStep = 1.0/this.curveIntervals;
	
	var   u = curveStep; 

	// Clear segment cache
	this.segmentCache = [];
	// Push start point into buffer
	this.segmentCache.push( this.startPoint );
	
	this.segmentLengths = [];
	
	this.arcLength = 0.0;

	//var point;
	for( var i = 0; i < this.curveIntervals; i++) {
	    
	    pointB = this.getPoint( (i+1) * curveStep );  // parameter is 'u' (not 't')
	    
	    
	    // Store point into cache
	    this.segmentCache.push( pointB ); // new THREE.Vector2(x2,y2) );

	    // Calculate segment length
	    //var tmpLength = Math.sqrt( Math.pow(x1-x2,2) + Math.pow(y1-y2,2) );
	    var tmpLength = Math.sqrt( Math.pow(pointA.x-pointB.x,2) + Math.pow(pointA.y-pointB.y,2) );
	    this.segmentLengths.push( tmpLength );
	    this.arcLength += tmpLength;
	    
	    pointA = pointB;
            u += curveStep;
	} // END for


    }; // END function


    CubicBezierCurve.prototype.getStartPoint = function() {
	return this.startPoint;
    };

    CubicBezierCurve.prototype.getEndPoint = function() {
	return this.endPoint;
    };

    CubicBezierCurve.prototype.getStartControlPoint = function() {
	return this.startControlPoint;
    };

    CubicBezierCurve.prototype.getEndControlPoint = function() {
	return this.endControlPoint;
    };

    CubicBezierCurve.prototype.getPointByID = function( id ) {
	if( id == this.START_POINT ) return this.startPoint;
	if( id == this.END_POINT ) return this.endPoint;
	if( id == this.START_CONTROL_POINT ) return this.startControlPoint;
	if( id == this.END_CONTROL_POINT ) return this.endControlPoint;
	throw "Invalid point ID '" + id +"'.";
    };

    CubicBezierCurve.prototype.getPoint = function( t ) {
	
	// Perform some powerful math magic
	var x = this.startPoint.x * Math.pow(1.0-t,3) + this.startControlPoint.x*3*t*Math.pow(1.0-t,2)
	    + this.endControlPoint.x*3*Math.pow(t,2)*(1.0-t)+this.endPoint.x*Math.pow(t,3);
	
	var y = this.startPoint.y*Math.pow(1.0-t,3)+this.startControlPoint.y*3*t*Math.pow(1.0-t,2)
	    + this.endControlPoint.y*3*Math.pow(t,2)*(1.0-t)+this.endPoint.y*Math.pow(t,3);
	
	return new Vertex( x, y );
    };

    CubicBezierCurve.prototype.getPointAt = function( u ) {  
	
	//return this.getPointAt( t * this.arcLength );
	return this.getPoint( u / this.arcLength );
    };


    CubicBezierCurve.prototype.getTangent = function( t ) {

	var a = this.getStartPoint();
	var b = this.getStartControlPoint();
	var c = this.getEndControlPoint();
	var d = this.getEndPoint();  
	

	// This is the shortened one
	var t2 = t * t;
	var t3 = t * t2;
	// (1 - t)^2 = (1-t)*(1-t) = 1 - t - t + t^2 = 1 - 2*t + t^2
	var nt2 = 1 - 2*t + t2;

	var tX = -3 * a.x * nt2 + 
	    b.x * (3 * nt2 - 6 *(t-t2) ) +
	    c.x * (6 *(t-t2) - 3*t2) +
	    3*d.x*t2;
	var tY = -3 * a.y * nt2 + 
	    b.y * (3 * nt2 - 6 *(t-t2) ) +
	    c.y * (6 *(t-t2) - 3*t2) +
	    3*d.y*t2;
	
	// Note: my implementation does NOT normalize tangent vectors!
	return new Vertex( tX, tY );
	
    }

    CubicBezierCurve.prototype.convertU2T = function( u ) {

	return Math.max( 0.0, 
			 Math.min( 1.0, 
				   ( u / this.arcLength ) 
				 )
		       );

    }

    CubicBezierCurve.prototype.getTangentAt = function( u ) {

	return this.getTangent( this.convertU2T(u) );
	
    }

    CubicBezierCurve.prototype.getPerpendicularAt = function( u ) {

	return this.getPerpendicular( this.convertU2T(u) );
	

    }

    CubicBezierCurve.prototype.getPerpendicular = function( t ) {

	var tangentVector = this.getTangent( t );
	var perpendicular = new Vertex( tangentVector.y, - tangentVector.x );
	return perpendicular;

    }


    CubicBezierCurve.prototype.computeBoundingBox = function() {

	return BoundingBox2.computeFromPoints( this.segmentCache );
    }


    CubicBezierCurve.prototype.clone = function() {

	var curve = new CubicBezierCurve( this.getStartPoint().clone(),
					  this.getEndPoint().clone(),
					  this.getStartControlPoint().clone(),
					  this.getEndControlPoint().clone()
					);
	//curve.updateArcLengths();
	return curve;
    }

    CubicBezierCurve.prototype.equals = function( curve ) {
	
	if( !curve )
	    return false;
	
	if( !curve.startPoint ||
	    !curve.endPoint ||
	    !curve.startControlPoint ||
	    !curve.endControlPoint )
	    return false;

	
	return this.startPoint.equals(curve.startPoint) 
	    && this.endPoint.equals(curve.endPoint)
	    && this.startControlPoint.equals(curve.startControlPoint)
	    && this.endControlPoint.equals(curve.endControlPoint);
	
    }


    CubicBezierCurve.prototype.toJSON = function( prettyFormat ) {
	
	var jsonString = "{ " + // begin object
            ( prettyFormat ? "\n\t" : "" ) +
	    "\"startPoint\" : [" + this.getStartPoint().x + "," + this.getStartPoint().y + "], " +
	    ( prettyFormat ? "\n\t" : "" ) +
	    "\"endPoint\" : [" + this.getEndPoint().x + "," + this.getEndPoint().y + "], " +
	    ( prettyFormat ? "\n\t" : "" ) +
	    "\"startControlPoint\": [" + this.getStartControlPoint().x + "," + this.getStartControlPoint().y + "], " +
	    ( prettyFormat ? "\n\t" : "" ) +
	    "\"endControlPoint\" : [" + this.getEndControlPoint().x + "," + this.getEndControlPoint().y + "]" +
	    ( prettyFormat ? "\n\t" : "" ) +
	    " }";  // end object
	    
	return jsonString;
    }


    CubicBezierCurve.fromJSON = function( jsonString ) {
	
	var obj = JSON.parse( jsonString );
	return CubicBezierCurve.fromObject( obj );
    }


    CubicBezierCurve.fromObject = function( obj ) {
	
	if( typeof obj !== "object" ) 
	    throw "[IKRS.CubicBezierCurve.fromArray] Can only build from object.";


	if( !obj.startPoint )
	    throw "[IKRS.CubicBezierCurve.fromObject] Object member \"startPoint\" missing.";
	if( !obj.endPoint )
	    throw "[IKRS.CubicBezierCurve.fromObject] Object member \"endPoint\" missing.";
	if( !obj.startControlPoint )
	    throw "[IKRS.CubicBezierCurve.fromObject] Object member \"startControlPoint\" missing.";
	if( !obj.endControlPoint )
	    throw "[IKRS.CubicBezierCurve.fromObject] Object member \"endControlPoint\" missing.";
	
	return new CubicBezierCurve( new Vertex(obj.startPoint[0],        obj.startPoint[1]),
				     new Vertex(obj.endPoint[0],          obj.endPoint[1]),
				     new Vertex(obj.startControlPoint[0], obj.startControlPoint[1]),
				     new Vertex(obj.endControlPoint[0],   obj.endControlPoint[1])
				   );
    };

    _context.CubicBezierCurve = CubicBezierCurve;
    
})(window); // END closure
