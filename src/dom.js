var STRIP_TAB_NEW_LINE = /\n|\t|\r/g,
	SINGLE_ARG_READ = /^outer$|^inner$|^text$/,
	IMMUTABLE_ATTR = /(button|input)/i,
	SPECIAL_URL = /href|src|style/,
	VALID_ELEMENTS = /^<([A-Z][A-Z0-9]*)([^>]*)>(.*)<\/\1>/i, 
	SPLIT_ATTRIBUTE = /([A-Z]*\s*=\s*['|"]?[A-Z0-9:;#\s]*['|"]?)/i,
	TAG_LIST = {'UL':'LI','DL':'DT','TR':'TD'},
	QUOTE_MATCHER = /(["']?)/g,
	/**
	 * @private - Borrowed from XUI project
	 * Wraps the HTML in a TAG, Tag is optional. If the html starts with a Tag, it will wrap the context in that tag.
	 */
	wrapHelper = function(xhtml, el) {
		// insert into documentFragment to ensure insert occurs without messing up order
		if( xhtml.toString === UNDEF || xhtml.toString().indexOf("[object ") > -1 || ( xhtml && !!xhtml.nodeType ) ){
			if( xhtml && xhtml.length !== UNDEF ){
				var docFrag = DOC.createDocumentFragment();
				xhtml = Simples.makeArray( xhtml, 0 );
				for(var p=0,r=xhtml.length;p<r;p++){
					docFrag.appendChild( xhtml[p] );
				}
				xhtml = docFrag;
			}
		
			return xhtml;
		}
	    var attributes = {}, element, x, i = 0, attr, node, attrList, result, tag;
	    xhtml = "" + xhtml;
	    if ( VALID_ELEMENTS.test(xhtml) ) {
	        result = VALID_ELEMENTS.exec(xhtml);
			tag = result[1];

	        // if the node has any attributes, convert to object
	        if (result[2] !== "") {
	            attrList = result[2].split( SPLIT_ATTRIBUTE );

	            for (var l=attrList.length; i < l; i++) {
	                attr = Simples.trim( attrList[i] );
	                if (attr !== "" && attr !== " ") {
	                    node = attr.split('=');
	                    attributes[ node[0] ] = node[1].replace( QUOTE_MATCHER, "");
	                }
	            }
	        }
	        xhtml = result[3];
	    } else {
			tag = (el.firstChild === null) ? TAG_LIST[el.tagName] || el.tagName : el.firstChild.tagName;
		}

	    element = DOC.createElement(tag);

	    for( x in attributes ){
			Simples.attr( element, x, attributes[x] );
		}

	    element.innerHTML = xhtml;
	    return element;
	};

Simples.merge( /** @lends Simples */ {
	/**
	 * @description to read the html from a elem
	 * @param {Element} elem the element to read the dom html from
	 * @param {String} location to specify how to return the dom options are [ outer, text, inner/undefined ] use outer for outerHTML, text to read all the textNodes and inner or no argument for innerHTML
	 */
	domRead : function( elem, location ){
		if( elem && elem.nodeType ){
			switch( location ){
				case "outer" :
					html = elem.outerHTML;

					if ( !html ) {
						var div = elem.ownerDocument.createElement("div");
						div.appendChild( elem.cloneNode(true) );
						html = div.innerHTML;
					}

					return html;
				case "text" :
					var str = "", elems = elem.childNodes;
					for ( var i = 0; elems[i]; i++ ) {
						elem = elems[i];

						// Get the text from text nodes and CDATA nodes
						if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
							str += elem.nodeValue;
						// Traverse everything else, except comment nodes
						} else if ( elem.nodeType !== 8 ) {
							str += Simples.domRead( elem, "text" );
						}
					}
					return str;
				default :
					return elem.innerHTML;
			}
		}
	},
	/**
	 * @description to write the dom new html string or dom elements
	 * @param {Element} elem the element to read the dom html from
	 * @param {String} location to specify how to return the dom options are desctructive: [remove, empty, outer, text, inner/undefined ], non-destructive: [top, bottom, unwrap, before, after, wrap ]
	 * @param {String|Elements} html the string or Elements to put into the dom
	 */	
	domManip : function( elem, location, html ){
		var el, parent = elem.parentNode;
		if( !elem || !elem.nodeType ){ return; }
		
		switch( location ){
			case 'text' :
				Simples.cleanData( elem );
				while ( elem.firstChild ) {
					elem.removeChild( elem.firstChild );
				}
				elem.appendChild( (elem && elem.ownerDocument || DOC).createTextNode( html.toString() ) );
				break;
			case 'remove' :
				if( parent ){
					Simples.cleanData( elem );     
					parent.removeChild(elem);
				}
				break;
			default :  
				if( elem.nodeType === 3 || elem.nodeType === 8 ){
					return;
				}
				switch( location ){
					case 'outer' :
						if( parent ){ 
							el = wrapHelper(html, elem);
							Simples.cleanData( elem );
					        parent.replaceChild( el, elem );						
						}
						break;
					case 'top' :
						elem.insertBefore( wrapHelper(html, elem), elem.firstChild);
						break;
					case 'bottom' : 
						elem.insertBefore( wrapHelper(html, elem), null);
						break;
					case 'unwrap' :
						if( parent ){
							var docFrag = wrapHelper( elem.childNodes, elem );
							Simples.cleanData( elem );
							el = docFrag.childNodes;
							parent.insertBefore( docFrag, elem );
							parent.removeChild( elem );
						}
						break;
					case 'empty' :
						Simples.cleanData( elem, false ); 
						while ( elem.firstChild ) {
							elem.removeChild( elem.firstChild );
						}
						break;
					case 'before' :
						if( parent ){
							parent.insertBefore( wrapHelper(html, parent), elem);
						}
						break;
					case 'after' :
						if( parent ){ 
							parent.insertBefore( wrapHelper(html, parent), elem.nextSibling);
						}
						break;
					case 'wrap' :
						if( parent ){ 
							var elems = wrapHelper( html, parent );           
							var wrap = ( elems.nodeType === 11 ? elems.firstChild : elems );
							parent.insertBefore( elems, elem );
							wrap.appendChild( elem );						
						}
						break;
					default :  
						Simples.cleanData( this, false );
						html = html != null ? html : location;
						var list, len, i = 0, testStringIndex = html.toString().indexOf("[object");
						if ( testStringIndex === -1 ) {
							elem.innerHTML = ""+html;
							list = elem.getElementsByTagName('SCRIPT');
							len = list.length;
							for (; i < len; i++) {
								eval(list[i].text);
							}
						} else if( testStringIndex > -1 ) {
							elem.innerHTML = "";
							elem.appendChild( wrapHelper( html, elem ) );
						}					
				}
		}
		return el;
	},
	/**
	 * @description to either check for a className, add or remove a className
	 * @param {Element} elem the element to manipulate the className on
	 * @param {String} className the class to work with
	 * @param {String} action to perform the step [ add, remove, has/undefined ]
	 */
	className : function( elem, className, action ){
		if( elem && elem.nodeType && elem.nodeType != ( 3 || 8 ) ){
			className = " "+className+" ";
			var hasClassName = (" " + elem.className + " ").replace( STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1;
			if( action === "add" ){
				if( !hasClassName ){
					elem.className = Simples.trim( Simples.trim( elem.className.replace( STRIP_TAB_NEW_LINE, " ") ) + className );
				}
			} else if( action === "remove" ){
				if( hasClassName ){
					elem.className = Simples.trim( (' ' + elem.className.replace( STRIP_TAB_NEW_LINE, " ") +' ').replace( className, ' ' ) );
				}
			} else {
				return hasClassName;
			}
		}
	},
	/**
	 * @description read / write the attribute on an element
	 * @param {Element} elem the element to manipulate the attribute
	 * @param {String} name the name of the attribute
	 * @param {String} value the value to specify, if undefined will read the attribute, if null will remove the attribute, else will add the value as a string
	 */
	attr : function( elem, name, value ){
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return UNDEF;
		}

		if( value === UNDEF ){
			if ( elem.nodeName.toUpperCase() === "FORM" && elem.getAttributeNode(name) ) {
				// browsers index elements by id/name on forms, give priority to attributes.				
				return elem.getAttributeNode( name ).nodeValue;
			} else if ( name === "style" && !Simples.support.style ){
				// get style correctly
				return elem.style.cssText;				
			} else if( elem.nodeType === 1 && !SPECIAL_URL.test( name ) && name in elem ){
				// These attributes don't require special treatment
				return elem[ name ];
			} else {
				// it must be this
				return elem.getAttribute( name );
			}
			return null;  
		} else if( value === null ){
			if ( elem.nodeType === 1 ) {
				elem.removeAttribute( name );
			}
		} else { 
			if ( ( typeof value == ( "function" || 'object' ) ) || ( name === "type" && IMMUTABLE_ATTR.test( elem.nodeName ) ) ) {
				return UNDEF;
			}

			if( name === "style" && !Simples.support.style ){
				// get style correctly
				elem.style.cssText = "" + value;
			} else if ( elem.nodeType === 1 && !SPECIAL_URL.test( name ) && name in elem ) { 
				// These attributes don't require special treatment 
				elem[ name ] = ""+value;
			} else { 
				// it must be this
				elem.setAttribute(name, ""+value);
			}
		}
	}
});

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * @description to read or write to the dom basd on the elements on the Simples object
	 * @param {String} location to specify how to return the dom options are desctructive: [remove, empty, outer, text, inner/undefined ], non-destructive: [top, bottom, unwrap, before, after, wrap ]
	 * @param {String|Elements} html the string or Elements to put into the dom, if not specfied where location is [ outer, text, inner/undefined ] will read
	 * @returns {Simples|String} if writing to the dom will return this, else will return string of dom
	 */
	html : function( location, html ){

		if ( arguments.length === 0 || ( arguments.length === 1 && SINGLE_ARG_READ.test( location ) ) ) {
			return Simples.domRead( this[0], location );
		}
		location = location != null ? location : "";

		var c=0,i=0,l=this.length, results;
		while(i<l){
			Simples.domManip( this[i++], location, html );
		}

		return this;
	},
	/**
	 * @description to determine whether any of the elements on the Simples object has the specified className
	 * @params {String} className the exact className to test for
	 * @returns {Boolean} indicating whether className is on elements of Simples object
	 */
	hasClass : function( className ){
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( Simples.className( this[i], className ) ) {
				return true;
			}
		}
		return false;
	},
	/**
	 * @description to add the specified className to the elements on the Simples object with the specified className
	 * @params {String} className the className to add to the elements
	 */
	addClass : function( className ){
		var l = this.length;
		while ( l ) {
			Simples.className( this[ --l ], className, "add" );
		}
		return this;
	},
	/**
	 * @description to remove the specified className to the elements on the Simples object with the specified className
	 * @params {String} className the className to remove to the elements
	 */
	removeClass : function( className ){
		var l = this.length;
		while ( l ) {
			Simples.className( this[ --l ], className, "remove" );
		}
		return this;		
	},
	/**
	 * @description to read / write the given attribute to the elements on the Simples object
	 * @param {String} name the name of the attribute
	 * @param {String} value the value to specify, if undefined will read the attribute, if null will remove the attribute, else will add the value as a string
	 */
	attr : function(name, value){
		var klass = Simples.getConstructor( name );
			
		if( klass === "Object" ){
			for( var key in name ){
				var i=0,l=this.length,val = name[key];
				while(i<l){
					Simples.attr( this[i++], key, val );
				}
			}
		} else if( klass === "String" ){
			if( value === UNDEF ){
				return Simples.attr( this[0], name );
			} else { 
				for(var m=0,n=this.length;m<n;m++){
					Simples.attr( this[m], name, value );
				}
			}
		}
		return this;
	},
	/* TODO: Rename me as I don't indicate functionality */
	/**
	 * @description to select a new set of elements off of the elements in the Simples object
	 * @params {String|Function} name the string to specify the traversing, i.e. childNodes, parentNode, etc or a function to walk 
	 */
	traverse : function( name ){
		var isWhat = Simples.getConstructor( name ), results = new Simples(), i=0,l = this.length;
		while( i<l ){
			var current = this[i++], elem = ( isWhat === "String" ) ? current[ name ] : ( isWhat === "Function" ) ? name.call( current, current ) : null;
			if( elem ){
				results.push.apply( results, ( elem.item || elem.length ) ? Simples.makeArray( elem ) : [ elem ] );
			}
		}
		
		return results;
	},
	/**
	 * @description to return a subset of the selected elements
	 * @params {Number} i the first element to start slicing
	 * @params {Number} len the last element to finish slicing this is optional if not specified then the slice is to the last element
	 */	
	slice : function( i, len ){
		len = ( 0 < len ) ? len : 1 ;
		return Simples( slice.apply( this, i < 0 ? [ i ] : [+i, i+len]  ), true );
	}
});