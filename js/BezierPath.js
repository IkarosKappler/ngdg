/**
 * A refactored BezierPath class.
 *
 * @author Ikaros Kappler
 * @date 2013-08-19
 * @modified 2018-08-16 Added  closure. Removed the 'IKRS' wrapper.
 * @version 1.0.1
 **/


(function(_context) {
    "use strict";

    // +---------------------------------------------------------------------------------
    // | The constructor.
    // |
    // | You may consider just construction empty paths and then add more curves later using
    // | the addCurve() function.
    // |
    // | @param pathPoints:array An array of path vertices. The constructor will approximate
    // |                         the location of controls points by picking some between the points.
    // +-------------------------------
    var BezierPath = function( pathPoints ) {
	Object.call( this );
	
	if( !pathPoints )
	    pathPoints = [];

	this.totalArcLength = 0.0;
	this.bezierCurves = [];
	for( var i = 1; i < pathPoints.length; i++ ) {

	    var bounds = new THREE.Box2( pathPoints[i].x - pathPoints[i-1].x, 
					 pathPoints[i].y - pathPoints[i-1].y
				       );

	    // Create a new Bezier curve inside the box
	    var bCurve =  new CubicBezierCurve( pathPoints[i-1],
						pathPoints[i],
						new Vertex( pathPoints[i-1].x, 
								   pathPoints[i-1].y - bounds.min/2
								 ),
						// This control point will be auto-adjusted in the next step
						new Vertex( pathPoints[i].x + bounds.max/2,
								   pathPoints[i].y 
								 )
					      );
	    this.bezierCurves.push( bCurve );
	    this.totalArcLength += bCurve.getLength();
	    
	    // Auto adjust the second control point (should be on a linear sub-space)
	    if( this.bezierCurves.length >= 2 ) {
		this.adjustSuccessorControlPoint( this.bezierCurves.length-2, // curveIndex, 
						  true,                       // obtain handle length?
						  true                        // update arc lengths
						);
	    }
	}
    };

    BezierPath.prototype = new Object();
    BezierPath.prototype.constructor = BezierPath;

    // +---------------------------------------------------------------------------------
    // | These constants equal the values from CubicBezierCurve.
    // +-------------------------------
    BezierPath.prototype.START_POINT         = 0;
    BezierPath.prototype.START_CONTROL_POINT = 1;
    BezierPath.prototype.END_CONTROL_POINT   = 2;
    BezierPath.prototype.END_POINT           = 3;


    // +---------------------------------------------------------------------------------
    // | Add a cubic bezier curve to the end of this path.
    // |
    // | @param curve:CubicBezierCurve The curve to be added.
    // +-------------------------------
    BezierPath.prototype.addCurve = function( curve ) {
	if( curve == null || typeof curve == 'undefined' )
	    throw "Cannot add null curve to bézier path.";
	this.bezierCurves.push( curve );
	if( this.bezierCurves.length > 1 ) {
	    curve.startPoint = this.bezierCurves[this.bezierCurves.length-2].endPoint;
	    this.adjustSuccessorControlPoint( this.bezierCurves.length-2, // curveIndex,          // int
					      true, // obtainHandleLength,  // boolean
					      true  // updateArcLengths     // boolean
					    );
	
	    } else {
		//this.updateArcLengths();
		this.totalArcLength += curve.getLength();
	    }
    };

    
    // +---------------------------------------------------------------------------------
    // | Get the total length of this path.
    // +-------------------------------
    BezierPath.prototype.getLength = function() {
	return this.totalArcLength;
    };


    // +---------------------------------------------------------------------------------
    // | computeVerticalAreaSize()
    // |
    // | @experimental
    // +-------------------------------
    BezierPath.prototype.computeVerticalAreaSize = function( deltaSize, useAbsoluteValues ) {

	var bounds    = this.computeBoundingBox();
	var relativeX = bounds.xMax;

	var size = 0.0;
	for( var i = 0; i < this.bezierCurves.length; i++ ) {

	    size += this.bezierCurves[i].computeVerticalAreaSize( relativeX,         // An imaginary x-axis at the right bound
								  deltaSize, 
								  useAbsoluteValues 
								);

	}

	return size;
    };


    // +---------------------------------------------------------------------------------
    // | computeVerticalRevolutionVolumeSize()
    // |
    // | @experimental
    // +-------------------------------
    BezierPath.prototype.computeVerticalRevolutionVolumeSize = function( useAbsoluteValues ) {
	
	var bounds    = this.computeBoundingBox();
	var relativeX = bounds.xMax;
	
	//window.alert( "relativeX=" + relativeX );

	var volume = 0.0;
	for( var i = 0; i < this.bezierCurves.length; i++ ) {

	    volume += this.bezierCurves[i].computeVerticalRevolutionVolumeSize( relativeX,         // An imaginary x-axis at the right bound
										//deltaSize, 
										useAbsoluteValues 
									      );
	    
	}

	return volume;
    };


    // +---------------------------------------------------------------------------------
    // | This function is internally called whenever the curve or path configuration
    // | changed. It updates the attribute that stores the path length information.
    // +-------------------------------
    BezierPath.prototype.updateArcLengths = function() {

	this.totalArcLength = 0.0;
	for( var i = 0; i < this.bezierCurves.length; i++ ) {

	    this.bezierCurves[ i ].updateArcLengths();
	    this.totalArcLength += this.bezierCurves[ i ].getLength();

	}

    }


    // +---------------------------------------------------------------------------------
    // | Get the number of curves in this path.
    // |
    // | @return int
    // +-------------------------------
    BezierPath.prototype.getCurveCount = function() {
	return this.bezierCurves.length;
    }


    // +---------------------------------------------------------------------------------
    // | Get the cubic bezier curve at the given index.
    // |
    // | @return CubicBezierCurve
    // +-------------------------------
    BezierPath.prototype.getCurveAt = function( curveIndex ) {
	return this.bezierCurves[ curveIndex ];
    }


    // +---------------------------------------------------------------------------------
    // | Remove the end point of this path (which removes the last curve from this path).
    // |
    // | Please note that this function does never remove the first curve, thus the path
    // | cannot be empty after this call.
    // |
    // | @return boolean Indicating if the last curve was removed.
    // +-------------------------------
    BezierPath.prototype.removeEndPoint = function() {

	if( this.bezierCurves.length <= 1 )
	    return false;

	var newArray = [ this.bezierCurves.length-1 ];
	for( var i = 0; i < this.bezierCurves.length-1; i++ ) {

	    newArray[i] = this.bezierCurves[i];

	}
	
	// Update arc length
	this.totalArcLength -= this.bezierCurves[ this.bezierCurves.length-1 ].getLength();
	this.bezierCurves = newArray;
	
	return true;
    }


    // +---------------------------------------------------------------------------------
    // | Remove the start point of this path (which removes the first curve from this path).
    // |
    // | Please note that this function does never remove the last curve, thus the path
    // | cannot be empty after this call.
    // |
    // | @return boolean Indicating if the first curve was removed.
    // +-------------------------------
    BezierPath.prototype.removeStartPoint = function() {

	if( this.bezierCurves.length <= 1 )
	    return false;

	var newArray = [ this.bezierCurves.length-1 ];
	for( var i = 1; i < this.bezierCurves.length; i++ ) {

	    newArray[i-1] = this.bezierCurves[i];

	}
	
	// Update arc length
	this.totalArcLength -= this.bezierCurves[ 0 ].getLength();
	this.bezierCurves = newArray;
	
	return true;
    }

    // +---------------------------------------------------------------------------------
    // | This function joins the bezier curve at the given index with
    // | its predecessor.
    // |
    // | @param curveIndex:int The index of the curve to join with it's predecessor.
    // +------------------------------- 
    BezierPath.prototype.joinAt = function( curveIndex ) {

	if( curveIndex < 0 || curveIndex >= this.bezierCurves.length )
	    return false;
	
	var leftCurve  = this.bezierCurves[ curveIndex-1 ];
	var rightCurve = this.bezierCurves[ curveIndex ];

	// Make the length of the new handle double that long
	var leftControlPoint = leftCurve.getStartControlPoint().clone();
	leftControlPoint.sub( leftCurve.getStartPoint() );
	leftControlPoint.multiplyScalar( 2.0 );
	leftControlPoint.add( leftCurve.getStartPoint() );
	
	var rightControlPoint = rightCurve.getEndControlPoint().clone();
	rightControlPoint.sub( rightCurve.getEndPoint() );
	rightControlPoint.multiplyScalar( 2.0 );
	rightControlPoint.add( rightCurve.getEndPoint() );	

	var newCurve = new IKRS.CubicBezierCurve( leftCurve.getStartPoint(),
						  rightCurve.getEndPoint(),
						  leftControlPoint,
						  rightControlPoint 
						);	
	// Place into array
	var newArray = [ this.bezierCurves.length - 1 ];

	for( var i = 0; i < curveIndex-1; i++ ) 
	    newArray[ i ] = this.bezierCurves[i];
	
	newArray[ curveIndex-1 ] = newCurve;
	
	// Shift trailing curves left
	for( var i = curveIndex; i+1 < this.bezierCurves.length; i++ ) 
	    newArray[ i ] = this.bezierCurves[ i+1 ];
		
	this.bezierCurves = newArray;
	this.updateArcLengths();

	return true;
    }


    // +---------------------------------------------------------------------------------
    // | This function splits the bezier curve at the given index and given
    // | curve segment index.
    // |
    // | @param curveIndex:int The index of the curve to split.
    // | @param segmentIndex:int The index of the curve segment to split at.
    // +------------------------------- 
    BezierPath.prototype.splitAt = function( curveIndex,
					     segmentIndex 
					   ) {
	// Must be a valid curve index
	if( curveIndex < 0 || curveIndex >= this.bezierCurves.length )
	    return false;

	var oldCurve = this.bezierCurves[ curveIndex ];

	// Segment must be an INNER point!
	// (the outer points are already bezier end/start points!)
	if( segmentIndex < 1 || segmentIndex-1 >= oldCurve.segmentCache.length )
	    return false;

	// Make room for a new curve
	for( var c = this.bezierCurves.length; c > curveIndex; c-- ) {
	    // Move one position to the right
	    this.bezierCurves[ c ] = this.bezierCurves[ c-1 ];	    
	}

	// Accumulate segment lengths
	var u = 0;
	for( var i = 0; i < segmentIndex; i++ )
	    u += oldCurve.segmentLengths[i];
	var tangent = oldCurve.getTangentAt( u );
	tangent = tangent.multiplyScalar( 0.25 ); 

	var leftEndControlPoint = oldCurve.segmentCache[ segmentIndex ].clone();
	leftEndControlPoint.sub( tangent );
	
	var rightStartControlPoint = oldCurve.segmentCache[ segmentIndex ].clone();
	rightStartControlPoint.add( tangent );
	
	// Make the old existing handles a quarter that long
	var leftStartControlPoint = oldCurve.getStartControlPoint().clone();
	// move to (0,0)
	leftStartControlPoint.sub( oldCurve.getStartPoint() );
	leftStartControlPoint.multiplyScalar( 0.25 );
	leftStartControlPoint.add( oldCurve.getStartPoint() );

	var rightEndControlPoint = oldCurve.getEndControlPoint().clone(); 
	// move to (0,0)
	rightEndControlPoint.sub( oldCurve.getEndPoint() );
	rightEndControlPoint.multiplyScalar( 0.25 );
	rightEndControlPoint.add( oldCurve.getEndPoint() );

	var newLeft  = new CubicBezierCurve( oldCurve.getStartPoint(),                      // old start point
					     oldCurve.segmentCache[ segmentIndex ],         // new end point
					     leftStartControlPoint,                         // old start control point 
					     leftEndControlPoint                            // new end control point
					   );
	var newRight = new CubicBezierCurve( oldCurve.segmentCache[ segmentIndex ],         // new start point
					     oldCurve.getEndPoint(),                        // old end point
					     rightStartControlPoint,                        // new start control point 
					     rightEndControlPoint                           // old end control point
					   );
	

	// Insert split curve(s) at free index
	this.bezierCurves[ curveIndex ]     = newLeft;
	this.bezierCurves[ curveIndex + 1 ] = newRight;

	
	// Update total arc length, even if there is only a very little change!
	this.totalArcLength -= oldCurve.getLength();

	this.totalArcLength += newLeft.getLength();
	this.totalArcLength += newRight.getLength();


	return true;
    };


    // +---------------------------------------------------------------------------------
    // | Move the whole bezier path by the given (x,y)-amount.
    // |
    // | @param amount:Vertex The amount to be added (amount.x and amount.y).
    // +------------------------------- 
    BezierPath.prototype.translate = function( amount ) {  // Vertex
	
	for( var i = 0; i < this.bezierCurves.length; i++ ) {
	    var curve = this.bezierCurves[ i ];	    
	    curve.getStartPoint().add( amount );
	    curve.getStartControlPoint().add( amount );
	    curve.getEndControlPoint().add( amount );    
	}
	
	// Don't forget to translate the last curve's last point
	var curve = this.bezierCurves[ this.bezierCurves.length-1 ];
	curve.getEndPoint().add( amount );

	this.updateArcLengths();
    };


    // +---------------------------------------------------------------------------------
    // | Scale the whole bezier path by the given (x,y)-factors.
    // |
    // | @param anchor:Vertex The scale center.
    // | @param scaling:Vertex The scalars to be multiplied with (ascaling.x and scaling.y).
    // +------------------------------- 
    BezierPath.prototype.scale = function( anchor,  // Vertex
					   scaling  // Vertex
					 ) {
	
	for( var i = 0; i < this.bezierCurves.length; i++ ) {

	    var curve = this.bezierCurves[ i ];
	    
	    BezierPath._scalePoint( curve.getStartPoint(),        anchor, scaling );
	    BezierPath._scalePoint( curve.getStartControlPoint(), anchor, scaling );
	    BezierPath._scalePoint( curve.getEndControlPoint(),   anchor, scaling );
	    // Do NOT scale the end point here!
	    // Don't forget that the curves are connected and on curve's end point
	    // the the successor's start point (same instance)!

	}
	
	// Finally move the last end point (was not scaled yet)
	if( this.bezierCurves.length > 0 ) {
	    BezierPath._scalePoint( this.bezierCurves[ this.bezierCurves.length-1 ].getEndPoint(),
				    anchor,
				    scaling
				  );
	}
	
	this.updateArcLengths();	
    };


    // +---------------------------------------------------------------------------------
    // | A helper function for scaling points.
    // |
    // | @param point:Vertex 
    // | @param anchor:Vertex
    // | @param scaling:Vertex
    // +------------------------------- 
    BezierPath._scalePoint = function( point,   // Vertex
				       anchor,  // Vertex
				       scaling  // Vertex
				     ) {
	// Move point to origin
	point.sub( anchor );
	// Apply scaling
	point.setX( point.x * scaling.x );
	point.setY( point.y * scaling.y );
	// Move back to original position
	point.add( anchor );
	
    }


    // +---------------------------------------------------------------------------------
    // | Get the point on the bézier path at the given path location.
    // |
    // | @param u:float 0 <= u <= this.getLength() 
    // +------------------------------- 
    BezierPath.prototype.getPointAt = function( u ) {

	if( u < 0 || u > this.totalArcLength ) {
	    console.log( "[IKRS.BezierPath.getPointAt(u)] u is out of bounds: " + u + "." );
	    return null;
	}

	// Find the spline to extract the value from
	var i = 0;
	var uTemp = 0.0;
	
	while( i < this.bezierCurves.length &&
	       (uTemp + this.bezierCurves[i].getLength()) < u 
	     ) {
	    
	    uTemp += this.bezierCurves[ i ].getLength();
	    i++;

	}
	
	// if u == arcLength
	//   -> i is max
	if( i >= this.bezierCurves.length )
	    return this.bezierCurves[ this.bezierCurves.length-1 ].getEndPoint().clone();
	
	var bCurve    = this.bezierCurves[ i ];
	var relativeU = u - uTemp;
	return bCurve.getPointAt( relativeU );
    }

    // +---------------------------------------------------------------------------------
    // | Get the point on the bézier path at the given path fraction.
    // |
    // | @param t:float 0.0 <= t <= 1.0 
    // +------------------------------- 
    BezierPath.prototype.getPoint = function( t ) {
	return this.getPointAt( t * this.totalArcLength );
    }

    // +---------------------------------------------------------------------------------
    // | Get the tangent of the bézier path at the given path fraction.
    // |
    // | @param t:float 0.0 <= t <= 1.0 
    // +------------------------------- 
    BezierPath.prototype.getTangent = function( t ) {
	return this.getTangentAt( t * this.totalArcLength );
    }

    // +---------------------------------------------------------------------------------
    // | Get the tangent of the bézier path at the given path location.
    // |
    // | @param u:float 0.0 <= u <= this.getLength() 
    // +------------------------------- 
    BezierPath.prototype.getTangentAt = function( u ) {


	if( u < 0 || u > this.totalArcLength ) {
	    console.warn( "[BezierPath.getTangentAt(u)] u is out of bounds: " + u + "." );
	    return null;
	}

	// Find the spline to extract the value from
	var i = 0;
	var uTemp = 0.0;
	
	while( i < this.bezierCurves.length &&
	       (uTemp + this.bezierCurves[i].getLength()) < u 
	     ) {
	    
	    uTemp += this.bezierCurves[ i ].getLength();
	    i++;

	}

	var bCurve    = this.bezierCurves[ i ];
	var relativeU = u - uTemp;
	return bCurve.getTangentAt( relativeU );
    }


    BezierPath.prototype.getPerpendicular = function( t ) {

	return this.getPerpendicularAt( t * this.totalArcLength );

    }

    BezierPath.prototype.getPerpendicularAt = function( u ) {


	if( u < 0 || u > this.totalArcLength ) {
	    console.log( "[IKRS.BezierPath.getPerpendicularAt(u)] u is out of bounds: " + u + "." );
	    return null;
	}

	// Find the spline to extract the value from
	var i = 0;
	var uTemp = 0.0;
	
	while( i < this.bezierCurves.length &&
	       (uTemp + this.bezierCurves[i].getLength()) < u 
	     ) {
	    
	    uTemp += this.bezierCurves[ i ].getLength();
	    i++;

	}

	var bCurve    = this.bezierCurves[ i ];
	var relativeU = u - uTemp;

	return bCurve.getPerpendicularAt( relativeU );
    }


    BezierPath.prototype.computeBoundingBox = function() {

	if( this.bezierCurves.length == 0 ) {
	    
	    // Empty box
	    return new BoundingBox( 0, 0, 0, 0 );

	}
	

	var boundingBox = this.bezierCurves[ 0 ].computeBoundingBox();
	for( var i = 1; i < this.bezierCurves.length; i++ ) {

	    var tmpBounds = this.bezierCurves[ i ].computeBoundingBox();
	    boundingBox.xMin = Math.min( boundingBox.xMin, tmpBounds.xMin );
	    boundingBox.xMax = Math.max( boundingBox.xMax, tmpBounds.xMax );
	    boundingBox.yMin = Math.min( boundingBox.yMin, tmpBounds.yMin );
	    boundingBox.yMax = Math.max( boundingBox.yMax, tmpBounds.yMax );
	    
	}
	
	return boundingBox;
    }

    BezierPath.prototype.moveCurvePoint = function( curveIndex,      // int
						    pointID,         // int
						    moveAmount       // Vertex
						  ) {
	var bCurve = this.getCurveAt( curveIndex );
	bCurve.moveCurvePoint( pointID,
			       moveAmount,
			       true,       // move control point, too
			       true        // updateArcLengths
			     );

	// If inner point and NOT control point
	//  --> move neightbour
	if( pointID == this.START_POINT && curveIndex > 0 ) {

	    // Set predecessor's control point!
	    var predecessor = this.getCurveAt( curveIndex-1 );
	    predecessor.moveCurvePoint( this.END_CONTROL_POINT, 
					moveAmount,
					true,                    // move control point, too
					false                    // updateArcLengths
				      );

	} else if( pointID == this.END_POINT && curveIndex+1 < this.bezierCurves.length ) {
	    // Set successcor
	    var successor = this.getCurveAt( curveIndex+1 );
	    successor.moveCurvePoint( this.START_CONTROL_POINT, 
				      moveAmount, 
				      true,                  // move control point, too
				      false                  // updateArcLengths
				    );
	    

	} else if( pointID == this.START_CONTROL_POINT && curveIndex > 0 ) {
	    
	    this.adjustPredecessorControlPoint( curveIndex, 
						true,            // obtain handle length?
						false            // update arc lengths
					      );
	    
	} else if( pointID == this.END_CONTROL_POINT && curveIndex+1 < this.getCurveCount() ) {
	    
	    this.adjustSuccessorControlPoint( curveIndex, 
					      true,            // obtain handle length?
					      false            // update arc lengths
					    );
	    
	}

	// Don't forget to update the arc lengths!
	// Note: this can be optimized as only two curves have changed their lengths!
	this.updateArcLengths();

    }


    BezierPath.prototype.adjustPredecessorControlPoint = function( curveIndex,          // int
								   obtainHandleLength,  // boolean
								   updateArcLengths     // boolean
								 ) {
	
	if( curveIndex <= 0 )
	    return false;

	var mainCurve      = this.getCurveAt( curveIndex );
	var neighbourCurve = this.getCurveAt( curveIndex-1 );
	return this.adjustNeighbourControlPoint( mainCurve,
						 neighbourCurve,
						 mainCurve.getStartPoint(),            // the reference point
						 mainCurve.getStartControlPoint(),     // the dragged control point
						 neighbourCurve.getEndPoint(),         // the neighbour's point
						 neighbourCurve.getEndControlPoint(),  // the neighbour's control point to adjust
						 obtainHandleLength,
						 updateArcLengths
					       );
    }

    BezierPath.prototype.adjustSuccessorControlPoint = function( curveIndex,          // int
								 obtainHandleLength,  // boolean
								 updateArcLengths     // boolean
							       ) {
	
	if( curveIndex+1 > this.getCurveCount() )
	    return false;


	var mainCurve      = this.getCurveAt( curveIndex );
	var neighbourCurve = this.getCurveAt( curveIndex+1 );
	return this.adjustNeighbourControlPoint( mainCurve,
						 neighbourCurve,
						 mainCurve.getEndPoint(),                // the reference point
						 mainCurve.getEndControlPoint(),         // the dragged control point
						 neighbourCurve.getStartPoint(),         // the neighbour's point
						 neighbourCurve.getStartControlPoint(),  // the neighbour's control point to adjust
						 obtainHandleLength,
						 updateArcLengths
					       );
    }

    // private
    BezierPath.prototype.adjustNeighbourControlPoint = function( mainCurve,
								 neighbourCurve,
								 mainPoint,
								 mainControlPoint,
								 neighbourPoint,
								 neighbourControlPoint,
								 obtainHandleLengths,  // boolean
								 updateArcLengths
							       ) {

	// Calculate start handle length
	var mainHandleBounds        = new Vertex( mainControlPoint.x - mainPoint.x,
						  mainControlPoint.y - mainPoint.y
						);
	var neighbourHandleBounds   = new Vertex( neighbourControlPoint.x - neighbourPoint.x,
						  neighbourControlPoint.y - neighbourPoint.y
						);
	var mainHandleLength        = Math.sqrt( Math.pow(mainHandleBounds.x,2) + Math.pow(mainHandleBounds.y,2) );
	var neighbourHandleLength   = Math.sqrt( Math.pow(neighbourHandleBounds.x,2) + Math.pow(neighbourHandleBounds.y,2) );

	if( mainHandleLength <= 0.1 ) 
	    return; // no secure length available for division
	
	
	// Just invert the main handle	
	neighbourControlPoint.set( neighbourPoint.x - mainHandleBounds.x * (neighbourHandleLength/mainHandleLength),
				   neighbourPoint.y - mainHandleBounds.y * (neighbourHandleLength/mainHandleLength)
				 );
	neighbourCurve.updateArcLengths();

    }


    BezierPath.prototype.clone = function() {

	var path = new BezierPath( null );
	for( var i = 0; i < this.bezierCurves.length; i++ ) {
	    
	    path.bezierCurves.push( this.bezierCurves[i].clone() );
	    
	    // Connect splines
	    if( i > 0 )
		path.bezierCurves[i-1].endPoint = path.bezierCurves[i].startPoint;
	    
	}

	path.updateArcLengths();

	return path;
    }

    BezierPath.prototype.equals = function( path ) {

	if( !path )
	    return false;
	
	// Check if path contains the credentials
	if( !path.bezierCurves )
	    return false;

	if( typeof path.bezierCurves.length == "undefined" )
	    return false;

	if( path.bezierCurves.length != this.bezierCurves.length )
	    return false;

	for( var i = 0; i < this.bezierCurves.length; i++ ) {

	    if( !this.bezierCurves[i].equals(path.bezierCurves[i]) )
		return false;

	}

	return true;
    }

    BezierPath.prototype.toJSON = function( prettyFormat ) {

	var buffer = [];
	buffer.push( "[" ); // array begin
	for( var i = 0; i < this.bezierCurves.length; i++ ) {

	    if( i > 0 ) 
		buffer.push( "," );

	    if( prettyFormat)
		buffer.push( "\n\t" );
	    else
		buffer.push( " " );
	    
	    buffer.push( this.bezierCurves[i].toJSON( prettyFormat ) );

	}
	if( this.bezierCurves.length != 0 )
	    buffer.push( " " );
	buffer.push( "]" ); // array end
	
	return buffer.join( "" ); // Convert to string, with empty separator.
    }

    BezierPath.fromJSON = function( jsonString ) {

	var obj = JSON.parse( jsonString );

	return IKRS.BezierPath.fromArray( obj );
    }

    BezierPath.fromArray = function( arr ) {

	if( !Array.isArray(arr) )
	    throw "[IKRS.BezierPath.fromArray] Passed object must be an array.";
	
	if( arr.length < 1 )
	    throw "[IKRS.BezierPath.fromArray] Passed array must contain at least one bezier curve (has " + arr.length + ").";
	
	// Create an empty bezier path
	var bPath = new BezierPath( null );
	var lastCurve = null;
	for( var i = 0; i < arr.length; i++ ) {
	    
	    // Convert object to bezier curve
	    var bCurve = CubicBezierCurve.fromObject( arr[i] );
	    // Set curve start point?
	    // (avoid duplicate point instances!)
	    if( lastCurve )
		bCurve.startPoint = lastCurve.endPoint;
	    
	    // Add to path's internal list
	    bPath.bezierCurves.push( bCurve );
	    bPath.totalArcLength += bCurve.getLength();
	    
	    
	    lastCurve = bCurve;
	}   
	// Bezier segments added.
	// Recalculate length?
	//bPath.updateArcLengths();
	
	// Done
	

	return bPath;
    }

    /**
     * This function converts the bezier path into a string containing
     * integer values only.
     * The points' float values are rounded to 1 digit after the comma.
     *
     * The returned string represents a JSON array (with leading '[' and
     * trailing ']', the separator is ',').
     **/
    BezierPath.prototype.toReducedListRepresentation = function( digits ) {
	
	if( typeof digits == "undefined" )
	    digits = 1;
	
	var buffer = [];
	//var digits = 1;
	buffer.push( "[" ); // array begin
	for( var i = 0; i < this.bezierCurves.length; i++ ) {
	    
	    var curve = this.bezierCurves[i];
	    buffer.push( BezierPath._roundToDigits(curve.getStartPoint().x,digits,false) );
	    buffer.push( "," );
	    buffer.push( BezierPath._roundToDigits(curve.getStartPoint().y,digits,false) );
	    buffer.push( "," );

	    buffer.push( BezierPath._roundToDigits(curve.getStartControlPoint().x,digits,false) );
	    buffer.push( "," );
	    buffer.push( IKRS.BezierPath._roundToDigits(curve.getStartControlPoint().y,digits,false) );
	    buffer.push( "," );
	    
	    buffer.push( BezierPath._roundToDigits(curve.getEndControlPoint().x,digits,false) );
	    buffer.push( "," );
	    buffer.push( BezierPath._roundToDigits(curve.getEndControlPoint().y,digits,false) );
	    buffer.push( "," );		

	}
	if( this.bezierCurves.length != 0 ) {
	    var curve = this.bezierCurves[ this.bezierCurves.length-1 ];
	    buffer.push( BezierPath._roundToDigits(curve.getEndPoint().x,digits,false) );
	    buffer.push( "," );
	    buffer.push( BezierPath._roundToDigits(curve.getEndPoint().y,digits,false) );
	}
	buffer.push( "]" ); // array end
	
	return buffer.join( "" ); // Convert to string, with empty separator.
    };


    /**
     * The passed string must represent a JSON array containing numbers only.
     **/
    BezierPath.fromReducedListRepresentation = function( listJSON ) {

	// Parse the array
	var pointArray = JSON.parse( listJSON );

	if( !pointArray.length ) {
	    console.log( "Cannot parse bezier path from non-array object nor from empty point list." );
	    throw "Cannot parse bezier path from non-array object nor from empty point list.";
	}
	
	if( pointArray.length < 8 ) {
	    console.log( "Cannot build bezier path. The passed array must contain at least 8 elements (numbers)." );
	    throw "Cannot build bezier path. The passed array must contain at least 8 elements (numbers).";
	}

	// Convert to object
	var bezierPath = new BezierPath( null ); // No points yet
        
	var startPoint        = null; // new THREE.Vector2( pointArray[i], pointArray[i+1] );
	var startControlPoint = null; // new THREE.Vector2( pointArray[i+2], pointArray[i+3] );
	var endControlPoint   = null; // new THREE.Vector2( pointArray[i+4], pointArray[i+5] );
	var endPoint          = null; // new THREE.Vector2( pointArray[i+6], pointArray[i+7] );
	var i = 0;

	//for( var i = 0; i < pointArray.length; i+=3 ) {
	do {
	    
	    if( i == 0 )
		startPoint        = new Vertex( pointArray[i], pointArray[i+1] );
	    startControlPoint = new Vertex( pointArray[i+2], pointArray[i+3] );
	    endControlPoint   = new Vertex( pointArray[i+4], pointArray[i+5] );
	    endPoint          = new Vertex( pointArray[i+6], pointArray[i+7] );

	    var bCurve =  new CubicBezierCurve( startPoint,
						endPoint,
						startControlPoint,
						endControlPoint
					      );
	    bezierPath.bezierCurves.push( bCurve );

	    startPoint = endPoint;
	    
	    i += 6;

	} while( i+2 < pointArray.length );

	bezierPath.updateArcLengths();


	return bezierPath;
    };



    BezierPath._roundToDigits = function( number, digits, enforceInvisibleDigits ) {
	if( digits <= 0 )
	    return Math.round(number); 

	var magnitude = Math.pow( 10, digits ); // This could be LARGE :/
	number = Math.round( number * magnitude );
	var result = "" + (number  /  magnitude);
	var index = result.lastIndexOf(".");
	if( index == -1 ) {	
	    //result += ".0";
	    index = result.length;
	}
	if( enforceInvisibleDigits ) {
	    var digitsAfterPoint = result.length - index - 1;
	    var digitsMissing    = enforceInvisibleDigits - digitsAfterPoint;
	    while( digitsMissing-- > 0 )
		result += "&nbsp;";
	}
	
	return result;
    };

    _context.BezierPath = BezierPath;
})(window);
