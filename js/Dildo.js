/**
 * All settings that define a next-generation dildo.
 *
 * @require CubicBezierCurve
 *
 * @author  Ikaros Kappler
 * @date    2018-08-26
 * @version 1.0.0
 **/


(function(_context) {

    
    // +---------------------------------------------------------------------------------
    // | The constructor.
    // |
    // | @param _baseCurve
    // | @param _glansCurve
    // | @param _name:string
    // +-------------------------------
    var Dildo = function( _baseCurve, _glansCurve, _name ) {
	this.name = _name;
	this.baseCurve = _baseCurve;
	this.glansCurve = _glansCurve;

	this.baseTopCurve = _baseCurve.clone();

	this.update();
    };

    Dildo.prototype.update = function() {
	console.log( 'updating dildo ...' );
	var perpBaseTopStart = this.baseTopCurve.getPerpendicular(0.1);
	//perpBaseTopStart.x -= this.baseTopCurve.startPoint.x;
	//perpBaseTopStart.y -= this.baseTopCurve.startPoint.y;
	var perpBaseTopEnd = this.baseTopCurve.getPerpendicular(1);
	console.log( perpBaseTopStart );

	this.baseTopCurve.moveCurvePoint( this.baseTopCurve.START_POINT, perpBaseTopStart, true, true );
	// this.baseTopCurve.moveCurvePoint( this.baseTopCurve.END_POINT, perpBaseTopEnd, true, true );
    };

    Dildo.prototype.toJSON = function() {
	var buf = [];
	buf.push( '{' );
	buf.push( ' baseCurve : ' );
	buf.push( this.baseCurve.toJSON(false) ); // No pretty format
	buf.push( ', glansCurve : ' );
	buf.push( this.glansCurve.toJSON(false) ); // No pretty format
	buf.push( '}' );
	return buf.join('');
    };

    Dildo.fromJSON = function( json ) {
	if( json == null || typeof json == 'undefined' )
	    throw "Cannot parse dildo from null string.";
	return Dildo.fromObject( JSON.parse(json) );
    };

    Dildo.fromObject = function( obj ) {
	if( obj == null || typeof obj == 'undefinded' )
	    throw "Cannot create dildo from null object.";
	if( !obj.baseCurve || typeof obj.baseCurve == 'undefined' )
	    throw "Cannot create dildo from object: 'baseCurve' is missing.";
	if( !obj.glansCurve || typeof obj.glansCurve == 'undefined' )
	    throw "Cannot create dildo from object: 'glansCurve' is missing.";
	if( !obj.name || typeof obj.name == 'undefined' )
	    throw "Cannot create dildo from object: 'name' is missing.";
	return new Dildo( CubicBezierCurve.fromObject(obj.baseCurve),
			  CubicBezierCurve.fromObject(obj.glansCurve),
			  obj.name );
    };

    
    
    // Export constructor to context.
    _context.Dildo = Dildo;

})(window);
