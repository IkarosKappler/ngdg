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
	this.path = new BezierPath([]);
	this.path.addCurve( this.baseCurve );
	this.path.addCurve( this.glansCurve );

	this.baseTopCurve = _baseCurve.clone();
	this.glansTopCurve = _glansCurve.clone();
	this.topPath = new BezierPath([]);
	this.topPath.addCurve( this.baseTopCurve );
	this.topPath.addCurve( this.glansTopCurve );

	this.baseBottomCurve = _baseCurve.clone();
	this.glansBottomCurve = _glansCurve.clone();
	this.bottomPath = new BezierPath([]);
	this.bottomPath.addCurve( this.baseBottomCurve );
	this.bottomPath.addCurve( this.glansBottomCurve );

	this._construct();
	this._installListeners();
    };

    Dildo.prototype._construct = function() {
	console.log( 'constructing dildo ...' );
	var perpBaseTopStart = this.baseTopCurve.getPerpendicular(0.1);
	//perpBaseTopStart.x -= this.baseTopCurve.startPoint.x;
	//perpBaseTopStart.y -= this.baseTopCurve.startPoint.y;
	var perpBaseTopEnd = this.baseTopCurve.getPerpendicular(1);
	console.log( perpBaseTopStart );

	// this.baseTopCurve.moveCurvePoint( this.baseTopCurve.START_POINT, perpBaseTopStart, true, true );
	// this.baseTopCurve.moveCurvePoint( this.baseTopCurve.END_POINT, perpBaseTopEnd, true, true );

	this.baseTopCurve.moveCurvePoint( this.baseTopCurve.START_POINT, { x : -5, y : -15 }, true, true );
	this.baseTopCurve.moveCurvePoint( this.baseTopCurve.END_POINT, { x : -5, y : -15 }, true, true );
	this.baseBottomCurve.moveCurvePoint( this.baseTopCurve.START_POINT, { x : 5, y : 15 }, true, true );
	this.baseBottomCurve.moveCurvePoint( this.baseTopCurve.END_POINT, { x : 5, y : 15 }, true, true );

	
    };

    Dildo.prototype._installListeners = function() {
	var _self = this;
	this.baseCurve.startPoint.listeners.addDragListener( function(e) {
	    _self.baseTopCurve.translate( e.params.dragAmount );
	    _self.baseBottomCurve.translate( e.params.dragAmount );
	} );
	this.baseCurve.startControlPoint.listeners.addDragListener( function(e) {
	    _self.baseTopCurve.moveCurvePoint( CubicBezierCurve.START_CONTROL_POINT, e.params.dragAmount, true, true );
	    _self.baseBottomCurve.moveCurvePoint( CubicBezierCurve.START_CONTROL_POINT, e.params.dragAmount, true, true );
	} );
	this.baseCurve.endControlPoint.listeners.addDragListener( function(e) {
	    //_self.baseTopCurve.moveCurvePoint( CubicBezierCurve.END_CONTROL_POINT, e.params.dragAmount, true, true );
	    //_self.baseBottomCurve.moveCurvePoint( CubicBezierCurve.END_CONTROL_POINT, e.params.dragAmount, true, true );
	    _self.topPath.moveCurvePoint( 0, CubicBezierCurve.END_CONTROL_POINT, e.params.dragAmount, true, true );
	    _self.bottomPath.moveCurvePoint( 0, CubicBezierCurve.END_CONTROL_POINT, e.params.dragAmount, true, true );
	} );
	this.baseCurve.endPoint.listeners.addDragListener( function(e) {
	    //_self.baseTopCurve.moveCurvePoint( CubicBezierCurve.END_POINT, e.params.dragAmount, true, true );
	    //_self.baseBottomCurve.moveCurvePoint( CubicBezierCurve.END_POINT, e.params.dragAmount, true, true );
	    _self.topPath.moveCurvePoint( 0, CubicBezierCurve.END_POINT, e.params.dragAmount, true, true );
	    _self.bottomPath.moveCurvePoint( 0, CubicBezierCurve.END_POINT, e.params.dragAmount, true, true );
	    _self.topPath.moveCurvePoint( 1, CubicBezierCurve.END_POINT, e.params.dragAmount, true, true );
	    _self.bottomPath.moveCurvePoint( 1, CubicBezierCurve.END_POINT, e.params.dragAmount, true, true );
	} );
    };

    Dildo.prototype.toJSON = function() {
	/*var buf = [];
	buf.push( '{' );
	buf.push( ' baseCurve : ' );
	buf.push( this.baseCurve.toJSON(false) ); // No pretty format
	buf.push( ', glansCurve : ' );
	buf.push( this.glansCurve.toJSON(false) ); // No pretty format
	buf.push( ', name : ' );
	buf.push( JSON.stringify(this.name) ); // No pretty format
	buf.push( '}' );
	*/
	
	var buf = [];
	buf.push( '{' );
	buf.push( ' path : ' );
	buf.push( this.path.toJSON(false) ); // No pretty format
	buf.push( ', topPath : ' );
	buf.push( this.topPath.toJSON(false) ); // No pretty format
	buf.push( ', bottomPath : ' );
	buf.push( this.bottomPath.toJSON(false) ); // No pretty format
	buf.push( ', name : ' );
	buf.push( JSON.stringify(this.name) ); // No pretty format
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

	// Version 0.0.1
	/*
	if( !obj.baseCurve || typeof obj.baseCurve == 'undefined' )
	    throw "Cannot create dildo from object: 'baseCurve' is missing.";
	if( !obj.glansCurve || typeof obj.glansCurve == 'undefined' )
	    throw "Cannot create dildo from object: 'glansCurve' is missing.";
	if( !obj.name || typeof obj.name == 'undefined' )
	    throw "Cannot create dildo from object: 'name' is missing.";
	return new Dildo( CubicBezierCurve.fromObject(obj.baseCurve),
			  CubicBezierCurve.fromObject(obj.glansCurve),
			  obj.name );
	*/
	

	// Version 0.0.1
	if( !obj.path || typeof obj.path == 'undefined' )
	    throw "Cannot create dildo from object: 'path' is missing.";
	if( !obj.topPath || typeof obj.topPath == 'undefined' )
	    throw "Cannot create dildo from object: 'path' is missing.";
	if( !obj.bottomPath || typeof obj.bottomPath == 'undefined' )
	    throw "Cannot create dildo from object: 'path' is missing.";
	if( !obj.name || typeof obj.name == 'undefined' )
	    throw "Cannot create dildo from object: 'name' is missing.";

	var path = BezierPath.fromArray( obj.path );
	var dildo = new Dildo( path.bezierCurves[0], path.bezierCurves[1], obj.name );
	
	dildo.topPath = BezierPath.fromArray( obj.topPath );
	dildo.baseTopCurve = dildo.topPath.bezierCurves[0];
	dildo.glansTopCurve = dildo.topPath.bezierCurves[1];
	
	dildo.bottomPath = BezierPath.fromArray( obj.bottomPath );
	dildo.baseBottomPath = dildo.bottomPath.bezierCurves[0];
	dildo.glansTopPath = dildo.bottomPath.bezierCurves[1];

	return dildo;
	
    };

    
    
    // Export constructor to context.
    _context.Dildo = Dildo;

})(window);
