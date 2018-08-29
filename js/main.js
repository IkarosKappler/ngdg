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
	    fitToParent           : true,
	    backgroundColor       : '#ffffff',
	    rebuild               : function() { rebuild(); },
	    loadImage             : function() { var elem = document.getElementById('file'); elem.setAttribute('data-type','image-upload'); triggerClickEvent(elem); },
	    showJSON              : function() { window.dialog.show( dildo.toJSON(), 'NG-DG', null, { messageClass : 'monospace' } ); },
	    pasteJSON             : function() { window.dialog.showTextArea( dildo.toJSON(), 'NG-DG',
									     { paste : { label : 'Paste',
											 onclick : function() { console.log(window.dialog._textArea.value);
														window.dialog.hide();
														window.alert('Sorry, pasting JSON is not yet implemented');
													      }
										       },
									       cancel : { label : 'Cancel', action : 'close' }
									     },
									     { messageClass : 'monospace' }
									   );
					       }
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
	var draw                = new drawutils(ctx,false);
	var fill                = new drawutils(ctx,true);
	var activePointIndex    = 1;
	var image               = null; // An image.
	var imageBuffer         = null; // A canvas to read the pixel data from.
	var canvasSize          = { width : DEFAULT_CANVAS_WIDTH, height : DEFAULT_CANVAS_HEIGHT };

	var paths               = [];
	var vertices            = [];
	// { type : 'bcurve', pindex : <int>, cindex : <int>, pid : <int> }
	// { type : 'vertex', vindex : <int> } 
	var selectedElements    = []; 
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
        // | Construct the dildo.
        // +-------------------------------
	// Version 0.0.1
	/*
	var dildo = Dildo.fromObject(
	    { baseCurve : { "startPoint" : [81,248], "endPoint" : [473.5,142], "startControlPoint": [265,233], "endControlPoint" : [418.12150699905914,161.62408392414605] }, glansCurve : { "startPoint" : [473.5,142], "endPoint" : [544,80], "startControlPoint": [503.0451483760694,131.5302952488526], "endControlPoint" : [517,123] }, name : 'dildo#20180827-171705' }
	);
	*/
	var dildo = Dildo.fromObject(
	    { path : [ { "startPoint" : [81,248], "endPoint" : [473.5,142], "startControlPoint": [193,226], "endControlPoint" : [418.12150699905914,161.62408392414605] }, { "startPoint" : [473.5,142], "endPoint" : [544,80], "startControlPoint": [503.0451483760694,131.5302952488526], "endControlPoint" : [512,129] } ], topPath : [ { "startPoint" : [65,217], "endPoint" : [439.5,96], "startControlPoint": [156,120], "endControlPoint" : [445.9188520420132,115.49607216973386] }, { "startPoint" : [439.5,96], "endPoint" : [544,80], "startControlPoint": [414.40977312088575,19.793090915865974], "endControlPoint" : [489,90] } ], bottomPath : [ { "startPoint" : [81,357], "endPoint" : [500.5,184], "startControlPoint": [82,319], "endControlPoint" : [457.9876805919407,191.55985058492269] }, { "startPoint" : [500.5,184], "endPoint" : [544,80], "startControlPoint": [567.9324290080199,172.008673839085], "endControlPoint" : [604,85] } ], name : "dildo#20180827-171705"}
	);
	/*var path = new BezierPath([]);
	path.addCurve( dildo.baseCurve ); 
	path.addCurve( dildo.glansCurve );
	*/
	paths.push( dildo.path ); // path );
	/*
	var baseTopPath = new BezierPath([]);
	baseTopPath.addCurve( dildo.baseTopCurve );
	paths.push( baseTopPath );
	var baseBottomPath = new BezierPath([]);
	baseBottomPath.addCurve( dildo.baseBottomCurve );
	paths.push( baseBottomPath );
	*/
	paths.push( dildo.topPath );
	paths.push( dildo.bottomPath );
	console.log( 'dildo.name: ' + dildo.name );


	vertices.push( new Vertex(100,100) );
	
	
	// +---------------------------------------------------------------------------------
        // | Install drag listeners.
        // +-------------------------------
	dildo.baseCurve.startPoint.listeners.addDragListener( function(e) {
	    console.log('baseCurve.startPoint dragged.');
	    path.translate( e.params.dragAmount );
	    path.bezierCurves[0].moveCurvePoint( path.START_POINT, new Vertex(-e.params.dragAmount.x,-e.params.dragAmount.y), true, true );
	} );
	dildo.baseCurve.endPoint.listeners.addDragListener( function(e) {
	    console.log('baseCurve.endPoint dragged.');
	    dildo.glansCurve.moveCurvePoint( dildo.glansCurve.END_POINT, e.params.dragAmount, true, true );
	} );
	dildo.glansCurve.endPoint.listeners.addDragListener( function(e) {
	    console.log('glansCurve.endPoint dragged.');
	} );
	

	// +---------------------------------------------------------------------------------
        // | Locates the point (index) at the passed position. Using an internal tolerance of 7 pixels.
	// |
	// | The result is an object { type : 'bpath', pindex, cindex, pid }
	// |
        // | Returns false if no point is near the passed position.
        // +-------------------------------
        var locatePointNear = function( x, y ) {
            var tolerance = 7;
	    var point = { x : x, y : y };
	    // Search in vertices
	    for( var vindex in vertices ) {
		var vert = vertices[vindex];
		if( vert.distance(point) < tolerance ) {
		    // console.log( 'vertex found.' );
		    return { type : 'vertex', vindex : vindex };
		}
	    }
	    
	    // Search in paths
	    for( var pindex = 0; pindex < paths.length; pindex++ ) {
		var path = paths[pindex];
		for( var cindex = 0; cindex < path.bezierCurves.length; cindex++ ) {
		    var curve = path.bezierCurves[cindex];
		    let p = curve.startControlPoint;
                    let dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.START_CONTROL_POINT };
		    p = curve.endControlPoint;
                    dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.END_CONTROL_POINT };
		    p = curve.startPoint;
                    dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.START_POINT };
		    p = curve.endPoint;
                    dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
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
	    // dildo.update();
	    
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

	    // Draw the inner base circle
	    draw.circle( dildo.baseCurve.startPoint,
			 dildo.baseCurve.startPoint.distance( dildo.baseCurve.endPoint ),
			 '#e0e0e0' );
	    // Draw the glans circle  
	    draw.circle( dildo.glansCurve.startPoint,
			 dildo.glansCurve.startPoint.distance( dildo.glansCurve.endPoint ),
			 '#e0e0e0' );
	    // Draw the inner 'bones'
	    draw.line( dildo.baseCurve.startPoint,  dildo.baseCurve.endPoint,  '#e0e0ff' );
	    draw.line( dildo.glansCurve.startPoint, dildo.glansCurve.endPoint, '#e0e0ff' );
	    
	    
	    // Draw all paths (and curves)
	    for( var p in paths ) {
		var path = paths[p];
		for( var c in path.bezierCurves ) {
		    draw.cubicBezierHandleLines(path.bezierCurves[c]);
		    draw.cubicBezierCurve(path.bezierCurves[c]);
		    fill.cubicBezierHandles(path.bezierCurves[c]);
		}
	    }

	    // Draw all vertices
	    for( var v in vertices ) {
		var vert = vertices[v];
		draw.crosshair( vert, 8, 'green' );
	    }
	    
	    // Draw dragged elements
	    for( var i in draggedElements ) {
		var p = draggedElements[i];
		if( p.type == 'bpath' ) {
		    fill.circle( paths[p.pindex].bezierCurves[p.cindex].getPointByID( p.pid ),
				 7, 'rgba(255,0,0,0.5)' );
		} else if( p.type == 'vertex' ) {
		    var vert = vertices[p.vindex];
		    draw.crosshair( vert, Math.max(canvasSize.width,canvasSize.height)*2 , 'lightgrey' );
		    fill.circle( vert,
				 7, 'rgba(255,0,0,0.5)' );
		    draw.string( vert.toString(), vert.x+10, vert.y );
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
	    if( config.fullSize && !config.fitToParent ) {
		    var width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		    _setSize( width, height );
	    } else if( config.fitToParent ) {
		var width  = canvas.parentNode.clientWidth - 2; // 1px border
		var height = canvas.parentNode.clientHeight - 2; // 1px border
		_setSize( width, height );
	    } else {
                _setSize( DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT );
	    }
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
	    f3.add(config, 'fitToParent').onChange( resizeCanvas ).title("Toggles the fit-to-parent mode (overrides fullsize).");
	    f3.addColor(config, 'backgroundColor').onChange( redraw ).title("Choose a background color.");
	    f3.add(config, 'loadImage').name('Load Image').title("Load a background image to pick triangle colors from.");

	    var f4 = gui.addFolder('Data');
	    f4.add(config, 'showJSON').name('Show JSON').title("Show the current configuration as JSON.");
	    f4.add(config, 'pasteJSON').name('Paste JSON').title("Import some JSON data via dialog."); 	    
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
		//p.listeners.fireDragStartEvent( e );
		if( p.type == 'bpath' )
		    paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragStartEvent( e );
		else if( p.type == 'vertex' )
		    vertices[p.vindex].listeners.fireDragStartEvent( e );
		redraw();
	    } )
	    .drag( function(e) {
		for( var i in draggedElements ) {
		    var p = draggedElements[i];
		    // console.log( 'i', i, 'pid', p.pid, 'pindex', p.pindex, 'cindex', p.cindex );
		    if( p.type == 'bpath' ) {
			paths[p.pindex].moveCurvePoint( p.cindex, p.pid, e.params.dragAmount );
			paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragEvent( e );
		    } else if( p.type == 'vertex' ) {
			vertices[p.vindex].add( e.params.dragAmount );
			vertices[p.vindex].listeners.fireDragEvent( e );
		    }
		}
		redraw();
	    } )
	    .mouseup( function(e) {
		if( e.which != 1 )
		    return; // Only react on eft mouse;
		if( !e.params.wasDragged )
		    handleTap( e.params.pos.x, e.params.pos.y );
		for( var i in draggedElements ) {
		    var p = draggedElements[i];
		    // console.log( 'i', i, 'pid', p.pid, 'pindex', p.pindex, 'cindex', p.cindex );
		    if( p.type == 'bpath' ) {
			paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragEndEvent( e );
		    } else if( p.type == 'vertex' ) {
			vertices[p.vindex].listeners.fireDragEndEvent( e );
		    }
		}
		draggedElements = [];
		redraw();
	    } );


	// Initialize the dialog
	window.dialog = new overlayDialog('dialog-wrapper');
	// window.dialog.show( 'Inhalt', 'NG-DG' );

	// Init	
	redraw();
	rebuild();
	
    } ); // END document.ready / window.onload
    
})(); 




