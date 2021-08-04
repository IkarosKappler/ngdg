/**
 * Original source: https://www.w3schools.com/howto/howto_css_modals.asp
 *
 * @requires modal.css
 *
 * Converted to a class by
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2020-09-14
 **/


( function() {

    var modalCounter = 0;
    
    /*
      <!-- The Modal -->
      <div id="myModal" class="modal">

      <!-- Modal content -->
      <div class="modal-content">
      <div class="modal-header">
      <span class="close">&times;</span>
      <h2>Modal Header</h2>
      </div>
      <div class="modal-body">
      <p>Some text in the Modal Body</p>
      <p>Some other text...</p>
      </div>
      <div class="modal-footer">
      <h3>Modal Footer</h3>
      </div>
      </div>

      </div>
    */


    var Modal = function() {
	this.modalElements = this.buildDOMNode( "myModal-"+(modalCounter++) );
    };

    Modal.prototype.setTitle = function( title ) {
	this.modalElements.modal.header.content.innerHTML = title;
    };

    Modal.prototype.setBody = function( bodyContent ) {
	if( isDOMNode(bodyContent) ) {
	    removeChildNodes( this.modalElements.modal.body.content );
	    this.modalElements.modal.body.content.append( bodyContent );
	} else {
	    this.modalElements.modal.body.content.innerHTML = bodyContent;
	}
    };

    Modal.prototype.setFooter = function( title ) {
	if( typeof title === "string" ) {
	    this.modalElements.modal.footer.content.innerHTML = title.length == 0 ? "&nbsp;" : title;
	} else {
	    console.log('Footer elements?');
	}
    };

    Modal.prototype.setActions = function( actions ) {
	var _self = this;
	removeChildNodes( this.modalElements.modal.footer.actions );
	if( Array.isArray(actions) ) {
	    for( var i in actions ) {
		var a = actions[i];
		var cmd = null;
		var btn = document.createElement('button');
		btn.innerHTML = a.label;
		if( typeof a.action === 'function' ) {
		    btn.addEventListener( 'click', a.action );
		} else if( (typeof a === 'string' && (cmd = a) != null ) || (typeof a.action === 'string' && (cmd = a.action) != null) ) {
		    if( cmd === 'cancel' || cmd === 'ok' || cmd === 'close' )
			btn.addEventListener( 'click', function() { _self.close(); } );
		}
		this.modalElements.modal.footer.actions.appendChild( btn );
	    }
	}
    };
    
    Modal.prototype.close = function() {
	// this.modalElements.modal.parent.style.display = "none";
	this.modalElements.modal.parent.classList.remove( 'modal-opened' );
	this.modalElements.modal.parent.classList.add( 'modal-closed' );
    };

    Modal.prototype.open = function() {
	// console.log( this.modalElements.modal.parent );
	// this.modalElements.modal.parent.style.display = "block";
	// document.getElementById( this.modalElements.modal.id ).style.display = "block";
	this.modalElements.modal.parent.classList.remove( 'modal-closed' );
	this.modalElements.modal.parent.classList.add( 'modal-opened' );
    };

    Modal.prototype.buildDOMNode = function( id ) {
	var _self = this;
	
	var modal = document.createElement('div');
	modal.setAttribute('id', id );
	modal.classList.add('modal');
	modal.classList.add('modal-closed');

	var content = document.createElement('div');
	content.classList.add('modal-content');

	var header = document.createElement('div');
	header.classList.add('modal-header');

	var closeBtn = document.createElement('span');
	closeBtn.classList.add('modal-close');
	closeBtn.innerHTML = "&times;";

	var h2 = document.createElement('h2');
	h2.innerHTML = "Modal Header";

	var body = document.createElement('div');
	body.classList.add('modal-body');

	// Body contents?
	var bodyContent = document.createElement('p');
	bodyContent.innerHTML = "Some text in the Modal Body";

	var footer = document.createElement('div');
	footer.classList.add('modal-footer');

	var footerContent = document.createElement('h3');
	var footerActions = document.createElement('div');
	footerContent.innerHTML = "Modal Footer";
	footerActions.classList.add('modal-actions');
	footer.appendChild( footerContent );
	footer.appendChild( footerActions );
	
	
	header.appendChild( closeBtn );
	header.appendChild( h2 );
	content.appendChild( header );
	body.appendChild( bodyContent );
	content.appendChild( body );
	content.appendChild( footer );
	modal.appendChild( content );


	// When the user clicks on <span> (x), close the modal
	closeBtn.onclick = function() {
	    _self.close();
	}

	// Append new modal to body
	document.getElementsByTagName('body')[0].appendChild( modal );

	return {
	    modal : {
		id : id,
		parent : modal,
		header : {
		    closeBtn : closeBtn,
		    content : h2,
		},
		body : { content : bodyContent },
		footer : {
		    content : footerContent,
		    actions : footerActions
		}
	    }
	};
    };

    // https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object
    function isDOMNode(obj) {
	try {
	    //Using W3 DOM2 (works for FF, Opera and Chrome)
	    return obj instanceof HTMLElement;
	}
	catch(e){
	    //Browsers not supporting W3 DOM2 don't have HTMLElement and
	    //an exception is thrown and we end up here. Testing some
	    //properties that all elements have (works on IE7)
	    return (typeof obj==="object") &&
		(obj.nodeType===1) && (typeof obj.style === "object") &&
		(typeof obj.ownerDocument ==="object");
	}
    }

    var removeChildNodes = function( node ) {
	// Remove all current actions
	while( node.firstChild ) {
	    node.removeChild( node.lastChild );
	}
    };

    Modal.ACTION_CLOSE  = { label : "Close",  action : "close" };
    Modal.ACTION_CANCEL = { label : "Cancel", action : "close" };
    Modal.ACTION_OK     = { label : "OK",     action : "close" };

    window.Modal = Modal;
})();
