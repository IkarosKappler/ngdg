/**
 * The vertex class for point set.
 *
 * @author    Ikaros Kappler
 * @date_init 2012-10-17
 * @date      2018-04-03
 * @modified  2018-04-28 Added some documentation.
 * @modified  2018-08-16 Added the set() function.
 * @version   2.0.2
 **/


(function(_context) {

    // An epsilon for comparison
    var EPSILON = 1.0e-6;


    // +------------------------------------------------------------
    // | Vertex class
    // +------------------------------------------------------------
    var Vertex = _context.Vertex = function( x, y ) {
	this.x = x;
	this.y = y;
    };


    // +------------------------------------------------------------
    // | Set the x- and y- component of this vertex.
    // |
    // | @return Vertex
    // +-------------------------------------------------------
    Vertex.prototype.set = function( x, y ) {
	this.x = x;
	this.y = y;
	return this;
    };


    // +------------------------------------------------------------
    // | Add the passed amount to x- and y- component of this vertex.
    // |
    // | @param amount:Vertex
    // |
    // | @return Vertex
    // +-------------------------------------------------------
    Vertex.prototype.add = function( amount ) {
	this.x += amount.x;
	this.y += amount.y;
	return this;
    };
    
    
    // +------------------------------------------------------------
    // | Check if this vertex equals the passed one.
    // |
    // | This function uses the epsilon as tolerance.
    // |
    // | @param vertex:Vertex The vertex to compare this with.
    // |
    // | @return boolean
    // +-------------------------------------------------------
    Vertex.prototype.equals = function( vertex ) {
	var eqX =  (Math.abs(this.x-vertex.x) < EPSILON);
	var eqY =  (Math.abs(this.y-vertex.y) < EPSILON);
	var result = eqX && eqY;
	return result;
    };


    
    // +------------------------------------------------------------
    // | Create a copy of this vertex.
    // |
    // | @return Vertex
    // +-------------------------------------------------------
    Vertex.prototype.clone = function() {
	return new Vertex(this.x,this.y);
    };


    // +------------------------------------------------------------
    // | This is a vector-like behavior and 'scales' this vertex
    // | towards/from a given center.
    // |
    // | @param factor:float The scale factor; 1.0 means no change.
    // | @param center:Vertex The origin of scaling; default is (0,0).
    // |
    // | @return Vertex This vector for chaining.
    // +-------------------------------------------------------
    Vertex.prototype.scale = function( factor, center ) { //console.log('scale='+factor+', center=' + JSON.stringify(center) );
	if( !center || typeof center === "undefined" )
	    center = new Vertex(0,0);
	this.x = center.x + (this.x-center.x)*factor;
	this.y = center.y + (this.y-center.y)*factor; //console.log( 'after scale: ' + this );
	return this;
    };


    // +------------------------------------------------------------
    // | Convert this vertex into a human-readable format.
    // |
    // | @return string
    // +-------------------------------------------------------
    Vertex.prototype.toString = function() {
	return '('+this.x+','+this.y+')';
    };
    // END Vertex

})( window ? window : module.exports );
