/**
 * This builder constructs 3D models from dildo settings.
 *
 * @require THREE
 * 
 * @author  Ikaros Kappler
 * @date    2018-08-28
 * @version 1.0.0
 **/

(function(_context) {
    "use strict";


    // +---------------------------------------------------------------------------------
    // | The constructor.
    // +-------------------------------
    var DildoBuilder = function( dildo ) {
	this.dildo = dildo;
    };

    DildoBuilder.prototype.build = function() {
	throw "Not yet implemented."
    };


    _context.DildoBuilder = DildoBuilder;

})(window);
