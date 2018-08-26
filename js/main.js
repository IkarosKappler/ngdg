/**
 * The main script of the next generation DG.
 *
 * @requires Vertex, Triangle, 
 *
 * @author   Ikaros Kappler
 * @date     2018-08-16
 * @version  1.0.0
 **/


(function() {
    "use strict";

    // Fetch the GET params
    let GUP = gup();
    
    const DEFAULT_CANVAS_WIDTH = 1024;
    const DEFAULT_CANVAS_HEIGHT = 768;


    // +---------------------------------------------------------------------------------
    // | A helper function to trigger fake click events.
    // +----------------------------
    var triggerClickEvent = function(element) {
	console.log('dispatching custom event');
	element.dispatchEvent( new MouseEvent('click', {
	    view: window,
	    bubbles: true,
	    cancelable: true
	} ) );
    };

    

    // +---------------------------------------------------------------------------------
    // | Initialize everything.
    // +----------------------------
    window.addEventListener('load',function() {
	
	// +---------------------------------------------------------------------------------
	// | A global config that's attached to the dat.gui control interface.
	// +-------------------------------
	var config = {
	    fullSize              : true,
	    backgroundColor       : '#ffffff',
	    rebuild               : function() { rebuild(); },
	    loadImage             : function() { var elem = document.getElementById('file'); elem.setAttribute('data-type','image-upload'); triggerClickEvent(elem); } 
	};
	// Merge GET params into config
	for( var k in config ) {
	    if( !GUP.hasOwnProperty(k) )
		continue;
	    var type = typeof config[k];
	    if( type == 'boolean' ) config[k] = !!JSON.parse(GUP[k]);
	    else if( type == 'number' ) config[k] = JSON.parse(GUP[k])*1;
	    else if( type == 'function' ) ;
	    else config[k] = GUP[k];
	}

	
	var canvas              = document.getElementById('my-canvas'); 
	var ctx                 = canvas.getContext('2d');
	var draw                = new drawutils(ctx);
	var activePointIndex    = 1;
	var image               = null; // An image.
	var imageBuffer         = null; // A canvas to read the pixel data from.
	var canvasSize          = { width : DEFAULT_CANVAS_WIDTH, height : DEFAULT_CANVAS_HEIGHT };

	var paths               = []; 
	var selectedElements    = []; // { type : 'bcurve', pindex : <int>, cindex : <int>, pid : <int> }
	var draggedElements     = []; // ...
	
	// +---------------------------------------------------------------------------------
        // | Generates a random point inside the canvas bounds.
        // +-------------------------------
        var randomPoint = function() {
            return new Vertex( randomInt(canvasSize.width), randomInt(canvasSize.height) );
        };
	
	// +---------------------------------------------------------------------------------
	// | Generates a random int value between 0 and max (both inclusive).
	// +-------------------------------
	var randomInt = function(max) {
	    return Math.round( Math.random()*max );
	};

	// +---------------------------------------------------------------------------------
	// | Generates a random web color object.
	// +-------------------------------
	var randomWebColor = function() {
	    return WebColors[ Math.floor(Math.random()*WebColors.length) ];
	};

	// +---------------------------------------------------------------------------------
	// | Generates a random color object with r=g=b.
	// +-------------------------------
	var randomGreyscale = function() {
	    var v = 32 + randomInt(255-32);
	    return Color.makeRGB( v, v, v );
	};


	// +---------------------------------------------------------------------------------
        // | Locates the point (index) at the passed position. Using an internal tolerance of 7 pixels.
	// |
	// | The result is an object { type : 'bpath', pindex, cindex, pid }
	// |
        // | Returns false if no point is near the passed position.
        // +-------------------------------
        var locatePointNear = function( x, y ) {
            var tolerance = 7;
	    for( var pindex = 0; pindex < paths.length; pindex++ ) {
		var path = paths[pindex];
		for( var cindex = 0; cindex < path.bezierCurves.length; cindex++ ) {
		    var curve = path.bezierCurves[cindex];
		    let p = curve.startControlPoint;
                    let dist = Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.START_CONTROL_POINT };
		    p = curve.endControlPoint;
                    dist = Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.END_CONTROL_POINT };
		    p = curve.startPoint;
                    dist = Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.START_POINT };
		    p = curve.endPoint;
                    dist = Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.END_POINT };
		}
            }
            return false;
        }
	
	
	// +---------------------------------------------------------------------------------
	// | The re-drawing function.
	// +-------------------------------
	var redraw = function() {
	    // Note that the image might have an alpha channel. Clear the scene first.
	    ctx.fillStyle = config.backgroundColor; 
	    ctx.fillRect(0,0,canvasSize.width,canvasSize.height);

	    // Draw the background image?
	    if( image ) {
		if( config.fitImage ) {
		    ctx.drawImage(image,0,0,image.width,image.height,0,0,canvasSize.width,canvasSize.height);
		} else {
		    ctx.drawImage(image,0,0);
		}
	    } 

	    // Draw all paths (and curves)
	    for( var p in paths ) {
		var path = paths[p];
		for( var c in path.bezierCurves ) {
		    draw.cubicBezierCurve(path.bezierCurves[c]);
		}
	    }

	    // Draw dragged elements
	    for( var i in draggedElements ) {
		var p = draggedElements[i];
		if( p.type == 'bpath' ) {
		    draw.circle( paths[p.pindex].bezierCurves[p.cindex].getPointByID( p.pid ),
				 7, 'rgba(255,0,0,0.5)' );
		}
	    }
	    
	    // ...
	};
	
	
	// +---------------------------------------------------------------------------------
	// | Handle a dropped image: initially draw the image (to fill the background).
	// +-------------------------------
	var handleImage = function(e) {
	    var validImageTypes = "image/gif,image/jpeg,image/jpg,image/gif,image/png";
	    if( validImageTypes.indexOf(e.target.files[0].type) == -1 ) {
		if( !window.confirm('This seems not to be an image ('+e.target.files[0].type+'). Continue?') )
		    return;
	    }	    
	    var reader = new FileReader();
	    reader.onload = function(event){
		image = new Image();
		image.onload = function() {
		    if( !config.fullSize ) {
			//canvas.width = image.width;
			//canvas.height = image.height;
			//canvasSize.width = image.width;
			//canvasSize.height = image.height;
		    }
		    // Create image buffer
		    imageBuffer        = document.createElement('canvas');
		    imageBuffer.width  = image.width;
		    imageBuffer.height = image.height;
		    imageBuffer.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
		    redraw();
		}
		image.src = event.target.result;
	    }
	    reader.readAsDataURL(e.target.files[0]);     
	}

	
	// +---------------------------------------------------------------------------------
	// | Decide which file type should be handled:
	// |  - image for the background or
	// |  - JSON (for the point set)
	// +-------------------------------
	var handleFile = function(e) {
	    var type = document.getElementById('file').getAttribute('data-type');
	    if( type == 'image-upload' ) {
		handleImage(e);
	    } else if( type == 'pointset-upload' ) {
		handlePointset(e);
	    } else {
		console.warn('Unrecognized upload type: ' + type );
	    }   
	}
	document.getElementById( 'file' ).addEventListener('change', handleFile );


	
	// +---------------------------------------------------------------------------------
	// | The rebuild function just evaluates the input and
	// |  - triangulate the point set?
	// |  - build the voronoi diagram?
	// +-------------------------------
	var rebuild = function() {
	    // ...
	};
	

	// +---------------------------------------------------------------------------------
	// | This function resizes the canvas to the requied settings (toggles fullscreen).
	// +-------------------------------
	var resizeCanvas = function() {
	    var _setSize = function(w,h) {
		ctx.canvas.width  = w;
		ctx.canvas.height = h;		
		canvas.width      = w;
		canvas.height     = h;		
		canvasSize.width  = w;
		canvasSize.height = h;
	    };
	    var width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	    if( config.fullSize ) _setSize( width, height );
	    else                  _setSize( DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT );
	    redraw();
	};
	window.addEventListener( 'resize', resizeCanvas );
	resizeCanvas();


	// +---------------------------------------------------------------------------------
	// | Initialize dat.gui
	// +-------------------------------
        { 
	    var gui = new dat.gui.GUI();
	    gui.remember(config);

	    gui.add(config, 'rebuild').name('Rebuild all').title("Rebuild all.");

	    var f3 = gui.addFolder('Settings');
	    f3.add(config, 'fullSize').onChange( resizeCanvas ).title("Toggles the fullpage mode.");
	    f3.addColor(config, 'backgroundColor').onChange( redraw ).title("Choose a background color.");
	    f3.add(config, 'loadImage').name('Load Image').title("Load a background image to pick triangle colors from.");

	    /*
	    var f4 = gui.addFolder('Import & Export');
	    f4.add(config, 'exportSVG').name('Export SVG').title("Export the current triangulation as a vector image.");
	    f4.add(config, 'exportPointset').name('Export point set').title("Export the point set as JSON.");
	    f4.add(config, 'importPointset').name('Import point set').title("Import the point set from JSON.");	    
	    */
	}


	// +---------------------------------------------------------------------------------
	// | Handle left-click and tap event
	// +-------------------------------
	function handleTap(x,y) {
	    //pointList.push( new Vertex(x,y) );
	    //if( config.autoUpdateOnChange ) rebuild();
	    //else    		            redraw();
	}
	


	// +---------------------------------------------------------------------------------
	// | Install a mouse handler on the canvas.
	// +-------------------------------
	new MouseHandler(canvas)
	    .mousedown( function(e) {
		if( e.which != 1 )
		    return; // Only react on left mouse
		var p = locatePointNear( e.params.pos.x, e.params.pos.y );
		if( !p ) return;
		draggedElements.push( p );
		redraw();
	    } )
	    .drag( function(e) {
		for( var i in draggedElements ) {
		    var p = draggedElements[i];
		    // console.log( 'i', i, 'pid', p.pid, 'pindex', p.pindex, 'cindex', p.cindex );
		    if( p.type == 'bpath' ) {
			paths[p.pindex].moveCurvePoint( p.cindex, p.pid, e.params.dragAmount );
		    }
		}
		redraw();
	    } )
	    .mouseup( function(e) {
		if( e.which != 1 )
		    return; // Only react on eft mouse;
		if( !e.params.wasDragged )
		    handleTap( e.params.pos.x, e.params.pos.y );
		draggedElements = [];
		redraw();
	    } );

	// Init

	var path = new BezierPath([]);
	path.addCurve( new CubicBezierCurve( randomPoint(), randomPoint(), randomPoint(), randomPoint() ) );
	path.addCurve( new CubicBezierCurve( randomPoint(), randomPoint(), randomPoint(), randomPoint() ) );
	paths.push( path );
	redraw();
	rebuild();
	
    } ); // END document.ready / window.onload
    
})(); 




