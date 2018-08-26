/**
 * A simple voronoi cell (part of a voronoi diagram), stored as an array of 
 * adjacent triangles.
 *
 * @requires Triangle
 *
 * @author   Ikaros Kappler
 * @date     2018-04-11
 * @modified 2018-05-04 Added the 'sharedVertex' param to the constructor. Extended open cells into 'infinity'.
 * @version  1.0.1
 **/

(function(context) {
    "strict mode";
    
    // +---------------------------------------------------------------------------------
    // | The constructor.
    // |
    // | @param triangles:Array{Triangle} The passed triangle array must contain an ordered sequence of
    // |                                  adjacent triangles.
    // | @param sharedVertex:Vertex       This is the 'center' of the voronoi cell; all triangles must share
    // |                                  that vertex.
    // | 
    // +-------------------------------
    context.VoronoiCell = function( triangles, sharedVertex ) {
	if( typeof triangles == 'undefined' )
	    triangles = [];
	if( typeof sharedVertex == 'undefined' )
	    sharedVertex = new Vertex(0,0);
	this.triangles = triangles;
	this.sharedVertex = sharedVertex;
    };

    
    // +--------------------------------------------------------------------------------
    // | Check if the first and the last triangle in the path are NOT connected.
    // +-------------------------------
    context.VoronoiCell.prototype.isOpen = function() {
	// There must be at least three triangles
	return this.triangles.length < 3 || !this.triangles[0].isAdjacent(this.triangles[this.triangles.length-1]);	   
    };


    // +---------------------------------------------------------------------------------
    // | Convert the voronoi cell path data to an SVG polygon data string.
    // |
    // | "x0,y0 x1,y1 x2,y2 ..." 
    // +-------------------------------
    context.VoronoiCell.prototype.toPathSVGString = function() {
	if( this.triangles.length == 0 )
	    return "";	
	var arr = this.toPathArray();
	return arr.map( function(vert) { return ''+vert.x+','+vert.y; } ).join(' '); 
    };

    
    // +---------------------------------------------------------------------------------
    // | Convert the voronoi cell path data to an array.
    // |
    // | [vertex0, vertex1, vertex2, ... ] 
    // +-------------------------------
    context.VoronoiCell.prototype.toPathArray = function() {
	//console.log( 'to path array' );
	
	if( this.triangles.length == 0 )
	    return [];
	if( this.triangles.length == 1 )
	    return [ this.triangles[0].getCircumcircle() ];
	
	var arr = [];

	// Working for path begin
	if( false && this.isOpen() ) 
	    arr.push( _calcOpenEdgePoint( this.triangles[0], this.triangles[1], this.sharedVertex ) );
	
	for( var t = 0; t < this.triangles.length; t++ ) {
	    var cc = this.triangles[t].getCircumcircle();
	    arr.push( cc.center );
	}

	// Urgh, this is not working right now.
	if( false && this.isOpen() ) 
	    arr.push( _calcOpenEdgePoint( this.triangles[ this.triangles.length-1 ], this.triangles[ this.triangles.length-2 ], this.sharedVertex ) );
	
	
	return arr;
    }


    // +---------------------------------------------------------------------------------
    // | Calculate the 'infinite' open edge point based on the open path triangle
    // | 'tri' and its neighbour 'neigh'.
    // |
    // | This function is used to determine outer hull points.
    // |
    // | @return Vertex
    // +-------------------------------
    var _calcOpenEdgePoint = function( tri, neigh, sharedVertex ) {
	console.log( "Adding opening point ..." );
	// Open voronoi cells are infite. Find the infinite edge on the
	//  OPENING side.
	//var tri     = this.triangles[0];
	//var neigh   = this.triangles[1];
	var center  = tri.getCircumcircle().center;
	// Find non-adjacent edge (=outer edge)
	var edgePoint = _findOuterEdgePoint( tri, neigh, sharedVertex );
	/*
	var halfEdgePoint = new Vertex( sharedVertex.x + (edgePoint.x-sharedVertex.x)/2,
					sharedVertex.y + (edgePoint.y-sharedVertex.y)/2 );
	//console.log( 'edgePoint=' + edgePoint );
	
	var thirdPoint = tri.getThirdVertex( sharedVertex, edgePoint );
	console.log( 'thirdVertex=' + thirdPoint );
	// Flip third point around outer edge
	var openEdgePoint = new Vertex( halfEdgePoint.x - (thirdPoint.x-halfEdgePoint.x)*10000,
					halfEdgePoint.y - (thirdPoint.y-halfEdgePoint.y)*10000 );
	*/

	var perpendicular = _perpendicularLinePoint( sharedVertex, edgePoint, center );
	var openEdgePoint = null;
	//console.log( "triangles determinant is: " + tri.determinant() );
	if( new Triangle(sharedVertex,center,edgePoint).determinant() <= 0 ) // false && tri.containsPoint(center) )
	    openEdgePoint = new Vertex( perpendicular.x + (center.x-perpendicular.x)*1000,
					perpendicular.y + (center.y-perpendicular.y)*1000 );
	else
	    openEdgePoint = new Vertex( perpendicular.x + (perpendicular.x-center.x)*1000,
					perpendicular.y + (perpendicular.y-center.y)*1000 );
	
	console.log( 'open edge point: ' + JSON.stringify(openEdgePoint) );
	//arr.push( openEdgePoint );
	return openEdgePoint;
    };
    
    // +---------------------------------------------------------------------------------
    // | Find the outer (not adjacent) vertex in triangle 'tri' which has triangle 'neighbour'.
    // |
    // | This function is used to determine outer hull points.
    // |
    // | @return Vertex
    // +-------------------------------
    var _findOuterEdgePoint = function( tri, neighbour, sharedVertex ) {
	if( tri.a.equals(sharedVertex) ) {
	    if( neighbour.a.equals(tri.b) || neighbour.b.equals(tri.b) || neighbour.c.equals(tri.b) ) return tri.c;
	    else return tri.b;
	}
	if( tri.b.equals(sharedVertex) ) {
	    if( neighbour.a.equals(tri.a) || neighbour.b.equals(tri.a) || neighbour.c.equals(tri.a) ) return tri.c;
	    else return tri.a;
	}
	// Here:
	//    tri.c.equals(sharedVertex) 
	if( neighbour.a.equals(tri.a) || neighbour.b.equals(tri.a) || neighbour.c.equals(tri.a) ) return tri.b;
	else return tri.a;
    };

    
    var _perpendicularLinePoint = function( lineA, lineB, point ) {
	// Found at
	//    https://stackoverflow.com/questions/1811549/perpendicular-on-a-line-from-a-given-point?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
	// first convert line to normalized unit vector
	// double dx = x2 - x1;
	// double dy = y2 - y1;
	// double mag = sqrt(dx*dx + dy*dy);
	// dx /= mag;
	// dy /= mag;
	// 
	// translate the point and get the dot product
	// double lambda = (dx * (x3 - x1)) + (dy * (y3 - y1));
	// x4 = (dx * lambda) + x1;
	// y4 = (dy * lambda) + y1;

	// first convert line to normalized unit vector
	var dx = lineB.x - lineA.x;
	var dy = lineB.y - lineA.y;
	var mag = Math.sqrt(dx*dx + dy*dy);
	dx /= mag;
	dy /= mag;

	// translate the point and get the dot product
	var lambda = (dx * (point.x - lineA.x)) + (dy * (point.y - lineA.y));
	x4 = (dx * lambda) + lineA.x;
	y4 = (dy * lambda) + lineA.y;
	return new Vertex(x4,y4);
    }
    
    
})(window ? window : module.export);
