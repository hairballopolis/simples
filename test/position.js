module("Position");

var supportsScroll = false;

function testoffset(name, expects, fn) {
	
	test(name, expects, function() {
		// pause execution for now
		stop();
		
		// load fixture in iframe
		var iframe = loadFixture(),
			win = iframe.contentWindow,
			interval = setInterval( function() {
				if ( win && win.Simples && win.Simples.isReady ) {
					clearInterval( interval );
					// continue
					start();
					// call actual tests passing the correct Simples isntance to use
					fn.call( this, win.Simples, win );
					document.body.removeChild( iframe );
					iframe = null;
				}
			}, 15 );
	});
	
	function loadFixture() {
		var src = './data/offset/' + name + '.html?' + parseInt( Math.random()*1000, 10 ),
			iframe = Simples('<iframe />').css({
				width: 500, height: 500, position: 'absolute', top: -600, left: -600, visiblity: 'hidden'
			})[0];

		document.body.appendChild( iframe );
		iframe.contentWindow.location = src;
		return iframe;
	}
}

testoffset("absolute"/* in iframe */, 4, function($, iframe) {
	
	var doc = iframe.document, tests;
	
	// force a scroll value on the main window
	// this insures that the results will be wrong
	// if the offset method is using the scroll offset
	// of the parent window
	var forceScroll = Simples('<div/>').css({height:2000, width:2000});
	document.body.appendChild( forceScroll[0] );
	window.scrollTo(200, 200);

	if ( document.documentElement.scrollTop || document.body.scrollTop ) {
		supportsScroll = true;
	}

	window.scrollTo(1, 1);
	
	// get offset
	tests = [
		{ id: '#absolute-1', top: 1, left: 1 }
	];
    for( var i=0,l=tests.length;i<l;i++)(function(that){
     	equals( Simples( that.id, doc ).offset().top,  that.top,  "Simples('" + that.id + "').offset().top" );
		equals( Simples( that.id, doc ).offset().left, that.left, "Simples('" + that.id + "').offset().left" );
	})(tests[i]);

	// get position
	tests = [
		{ id: '#absolute-1', top: 0, left: 0 }
	];
	for( var i=0,l=tests.length;i<l;i++)(function(that){
     	equals( Simples( that.id, doc ).position().top,  that.top,  "Simples('" + that.id + "').offset().top" );
		equals( Simples( that.id, doc ).position().left, that.left, "Simples('" + that.id + "').offset().left" );
	})(tests[i]);
	
	forceScroll.html("remove");
});

testoffset("absolute", 82, function( Simples ) {
	
	// get offset tests
	var tests = [
		{ id: '#absolute-1',     top:  1, left:  1 }, 
		{ id: '#absolute-1-1',   top:  5, left:  5 },
		{ id: '#absolute-1-1-1', top:  9, left:  9 },
		{ id: '#absolute-2',     top: 20, left: 20 }
	];
	
	for( var i=0,l=tests.length;i<l;i++ ) (function(i){
     	equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset().top" );
		equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset().left" );
	})(i);
	
	// get position
	tests = [
		{ id: '#absolute-1',     top:  0, left:  0 },
		{ id: '#absolute-1-1',   top:  1, left:  1 },
		{ id: '#absolute-1-1-1', top:  1, left:  1 },
		{ id: '#absolute-2',     top: 19, left: 19 }
	];
	
	for( var i=0,l=tests.length;i<l;i++)(function(i){
     	equals( Simples( tests[i].id ).position().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset().top" );
		equals( Simples( tests[i].id ).position().left, tests[i].left, "Simples('" + tests[i].id + "').offset().left" );
	})(i);
	
	// test #5781
	var offset = Simples( '#positionTest' ).offset({ top: 10, left: 10 }).offset();
	equals( offset.top,  10, "Setting offset on element with position absolute but 'auto' values." );
	equals( offset.left, 10, "Setting offset on element with position absolute but 'auto' values." );
	
	
	// set offset
	tests = [
		{ id: '#absolute-2',     top: 30, left: 30 },
		{ id: '#absolute-2',     top: 10, left: 10 },
		{ id: '#absolute-2',     top: -1, left: -1 },
		{ id: '#absolute-2',     top: 19, left: 19 },
		{ id: '#absolute-1-1-1', top: 15, left: 15 },
		{ id: '#absolute-1-1-1', top:  5, left:  5 },
		{ id: '#absolute-1-1-1', top: -1, left: -1 },
		{ id: '#absolute-1-1-1', top:  9, left:  9 },
		{ id: '#absolute-1-1',   top: 10, left: 10 },
		{ id: '#absolute-1-1',   top:  0, left:  0 },
		{ id: '#absolute-1-1',   top: -1, left: -1 },
		{ id: '#absolute-1-1',   top:  5, left:  5 },
		{ id: '#absolute-1',     top:  2, left:  2 },
		{ id: '#absolute-1',     top:  0, left:  0 },
		{ id: '#absolute-1',     top: -1, left: -1 },
		{ id: '#absolute-1',     top:  1, left:  1 }
	]; 
	for( var i=0,l=tests.length;i<l;i++)(function(i){
		Simples( tests[i].id ).offset({ top: tests[i].top, left: tests[i].left });
		equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset({ top: "  + tests[i].top  + " })" );
		equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset({ left: " + tests[i].left + " })" );
		
		Simples( tests[i].id ).offset({ left: tests[i].left + 2 }).offset({ top:  tests[i].top  + 2 });
		equals( Simples( tests[i].id ).offset().top,  tests[i].top  + 2, "Setting one property at a time." );
		equals( Simples( tests[i].id ).offset().left, tests[i].left + 2, "Setting one property at a time." );
	})(i);
});

testoffset("relative", 36, function( Simples ) {
	// IE is collapsing the top margin of 1px
	var ie = Simples.browser.msie && parseInt( Simples.browser.version, 10 ) < 8;
	
	// get offset
	var tests = [
		{ id: '#relative-1',   top: ie ?   6 :   7, left:  7 },
		{ id: '#relative-1-1', top: ie ?  13 :  15, left: 15 },
		{ id: '#relative-2',   top: ie ? 141 : 142, left: 27 }
	];
	for( var i=0,l=tests.length;i<l;i++)(function(i){
		equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset().top" );
		equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset().left" );
	})(i);
	
	
	// get position
	tests = [
		{ id: '#relative-1',   top: ie ?   5 :   6, left:  6 },
		{ id: '#relative-1-1', top: ie ?   4 :   5, left:  5 },
		{ id: '#relative-2',   top: ie ? 140 : 141, left: 26 }
	];
	for( var i=0,l=tests.length;i<l;i++)(function(i){
		equals( Simples( tests[i].id ).position().top,  tests[i].top,  "Simples('" + tests[i].id + "').position().top" );
		equals( Simples( tests[i].id ).position().left, tests[i].left, "Simples('" + tests[i].id + "').position().left" );
	})(i);
	
	
	// set offset
	tests = [
		{ id: '#relative-2',   top: 200, left:  50 },
		{ id: '#relative-2',   top: 100, left:  10 },
		{ id: '#relative-2',   top:  -5, left:  -5 },
		{ id: '#relative-2',   top: 142, left:  27 },
		{ id: '#relative-1-1', top: 100, left: 100 },
		{ id: '#relative-1-1', top:   5, left:   5 },
		{ id: '#relative-1-1', top:  -1, left:  -1 },
		{ id: '#relative-1-1', top:  15, left:  15 },
		{ id: '#relative-1',   top: 100, left: 100 },
		{ id: '#relative-1',   top:   0, left:   0 },
		{ id: '#relative-1',   top:  -1, left:  -1 },
		{ id: '#relative-1',   top:   7, left:   7 }
	];
	for( var i=0,l=tests.length;i<l;i++)(function(i){
		Simples( tests[i].id ).offset({ top: tests[i].top, left: tests[i].left });
		equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset({ top: "  + tests[i].top  + " })" );
		equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset({ left: " + tests[i].left + " })" );
	})(i);
});

testoffset("static", 48, function( Simples ) {
	// IE is collapsing the top margin of 1px
	var ie = Simples.browser.msie && parseInt( Simples.browser.version, 10 ) < 8;
	
	// get offset
	var tests = [
		{ id: '#static-1',     top: ie ?   6 :   7, left:  7 },
		{ id: '#static-1-1',   top: ie ?  13 :  15, left: 15 },
		{ id: '#static-1-1-1', top: ie ?  20 :  23, left: 23 },
		{ id: '#static-2',     top: ie ? 121 : 122, left:  7 }
	];
	for( var i=0,l=tests.length;i<l;i++)(function(i){
		equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset().top" );
		equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset().left" );
	})(i);
	
	
	// get position
	tests = [
		{ id: '#static-1',     top: ie ?   5 :   6, left:  6 },
		{ id: '#static-1-1',   top: ie ?  12 :  14, left: 14 },
		{ id: '#static-1-1-1', top: ie ?  19 :  22, left: 22 },
		{ id: '#static-2',     top: ie ? 120 : 121, left:  6 }
	];
	for( var i=0,l=tests.length;i<l;i++)(function(i){
		equals( Simples( tests[i].id ).position().top,  tests[i].top,  "Simples('" + tests[i].top  + "').position().top" );
		equals( Simples( tests[i].id ).position().left, tests[i].left, "Simples('" + tests[i].left +"').position().left" );
	})(i);
	
	
	// set offset
	tests = [
		{ id: '#static-2',     top: 200, left: 200 },
		{ id: '#static-2',     top: 100, left: 100 },
		{ id: '#static-2',     top:  -2, left:  -2 },
		{ id: '#static-2',     top: 121, left:   6 },
		{ id: '#static-1-1-1', top:  50, left:  50 },
		{ id: '#static-1-1-1', top:  10, left:  10 },
		{ id: '#static-1-1-1', top:  -1, left:  -1 },
		{ id: '#static-1-1-1', top:  22, left:  22 },
		{ id: '#static-1-1',   top:  25, left:  25 },
		{ id: '#static-1-1',   top:  10, left:  10 },
		{ id: '#static-1-1',   top:  -3, left:  -3 },
		{ id: '#static-1-1',   top:  14, left:  14 },
		{ id: '#static-1',     top:  30, left:  30 },
		{ id: '#static-1',     top:   2, left:   2 },
		{ id: '#static-1',     top:  -2, left:  -2 },
		{ id: '#static-1',     top:   7, left:   7 }
	];
	for( var i=0,l=tests.length;i<l;i++)(function(i){
		Simples( tests[i].id ).offset({ top: tests[i].top, left: tests[i].left });
		equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset({ top: "  + tests[i].top  + " })" );
		equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset({ left: " + tests[i].left + " })" );
	})(i);
});

testoffset("fixed", 16, function( Simples ) {

	Simples.offset.init();
	
	var tests = [
		{ id: '#fixed-1', top: 1001, left: 1001 },
		{ id: '#fixed-2', top: 1021, left: 1021 }
	];

	for( var i=0,l=tests.length;i<l;i++)(function(i){
		if ( !supportsScroll ) {
			ok( true, "Browser doesn't support scroll position." );
			ok( true, "Browser doesn't support scroll position." );

		} else if ( Simples.offset.supportsFixedPosition ) {
			equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset().top" );
			equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset().left" );
		} else {
			// need to have same number of assertions
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
		}
	})(i);
	
	tests = [
		{ id: '#fixed-1', top: 100, left: 100 },
		{ id: '#fixed-1', top:   0, left:   0 },
		{ id: '#fixed-1', top:  -4, left:  -4 },
		{ id: '#fixed-2', top: 200, left: 200 },
		{ id: '#fixed-2', top:   0, left:   0 },
		{ id: '#fixed-2', top:  -5, left:  -5 }
	];
	
	for( var i=0,l=tests.length;i<l;i++)(function(i){ 
		if ( Simples.offset.supportsFixedPosition ) {
			Simples( tests[i].id ).offset({ top: tests[i].top, left: tests[i].left });
			equals( Simples( tests[i].id ).offset().top,  tests[i].top,  "Simples('" + tests[i].id + "').offset({ top: "  + tests[i].top  + " })" );
			equals( Simples( tests[i].id ).offset().left, tests[i].left, "Simples('" + tests[i].id + "').offset({ left: " + tests[i].left + " })" );
		} else {
			// need to have same number of assertions
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
		}
	})(i);
});

testoffset("table", 4, function( Simples ) {
	
	equals( Simples('#table-1').offset().top, 6, "Simples('#table-1').offset().top" );
	equals( Simples('#table-1').offset().left, 6, "Simples('#table-1').offset().left" );
	
	equals( Simples('#th-1').offset().top, 10, "Simples('#th-1').offset().top" );
	equals( Simples('#th-1').offset().left, 10, "Simples('#th-1').offset().left" );
});

testoffset("scroll", 16, function( Simples, win ) {
	
	var ie = Simples.browser.msie && parseInt( Simples.browser.version, 10 ) < 8;
	
	// IE is collapsing the top margin of 1px
	equals( Simples('#scroll-1').offset().top, ie ? 6 : 7, "Simples('#scroll-1').offset().top" );
	equals( Simples('#scroll-1').offset().left, 7, "Simples('#scroll-1').offset().left" );
	
	// IE is collapsing the top margin of 1px
	equals( Simples('#scroll-1-1').offset().top, ie ? 9 : 11, "Simples('#scroll-1-1').offset().top" );
	equals( Simples('#scroll-1-1').offset().left, 11, "Simples('#scroll-1-1').offset().left" );
	
	
	// scroll offset tests .scrollTop/Left
	equals( Simples('#scroll-1').scroll("top"), 5, "Simples('#scroll-1').scrollTop()" );
	equals( Simples('#scroll-1').scroll("left"), 5, "Simples('#scroll-1').scrollLeft()" );
	
	equals( Simples('#scroll-1-1').scroll("top"), 0, "Simples('#scroll-1-1').scrollTop()" );
	equals( Simples('#scroll-1-1').scroll("left"), 0, "Simples('#scroll-1-1').scrollLeft()" );
	
	// equals( Simples('body').scrollTop(), 0, "Simples('body').scrollTop()" );
	// equals( Simples('body').scrollLeft(), 0, "Simples('body').scrollTop()" );   
	
	win.name = "test";

	if ( !supportsScroll ) {
		ok( true, "Browser doesn't support scroll position." );
		ok( true, "Browser doesn't support scroll position." );

		ok( true, "Browser doesn't support scroll position." );
		ok( true, "Browser doesn't support scroll position." );
	} else {   
		equals( Simples(win).scroll("top"), 1000, "Simples(window).scrollTop()" );
		equals( Simples(win).scroll("left"), 1000, "Simples(window).scrollLeft()" );
	
		equals( Simples(win.document).scroll("top"), 1000, "Simples(document).scrollTop()" );
		equals( Simples(win.document).scroll("left"), 1000, "Simples(document).scrollLeft()" );
	}
	
	// test Simples using parent window/document
	// Simples reference here is in the iframe
	window.scrollTo(0,0);
	equals( Simples(window).scroll("top"), 0, "Simples(window).scrollTop() other window" );
	equals( Simples(window).scroll("left"), 0, "Simples(window).scrollLeft() other window" );
	equals( Simples(document).scroll("top"), 0, "Simples(window).scrollTop() other document" );
	equals( Simples(document).scroll("left"), 0, "Simples(window).scrollLeft() other document" );
});

testoffset("body", 2, function( Simples ) {
	
	equals( Simples('body').offset().top, 1, "Simples('#body').offset().top" );
	equals( Simples('body').offset().left, 1, "Simples('#body').offset().left" );
});

test("Chaining offset(coords) returns Simples object", 2, function() {

	var coords = { top:  1, left:  1 };
	equals( Simples("#absolute-1").offset(coords).selector, "#absolute-1", "offset(coords) returns Simples object" );
	equals( Simples("#non-existent").offset(coords).selector, "#non-existent", "offset(coords) with empty Simples set returns Simples object" );
});

test("offsetParent", 11, function(){

	var body = Simples("body").offsetParent();
	equals( body.length, 1, "Only one offsetParent found." );
	equals( body[0], document.body, "The body is its own offsetParent." );

	var header = Simples("#qunit-banner").offsetParent();
	equals( header.length, 1, "Only one offsetParent found." );
	equals( header[0], document.body, "The body is the offsetParent." );

	var div = Simples("#nothiddendivchild").offsetParent();
	equals( div.length, 1, "Only one offsetParent found." );
	equals( div[0], document.body, "The body is the offsetParent." );

	Simples("#nothiddendiv").css("position", "relative");

	div = Simples("#nothiddendivchild").offsetParent();
	equals( div.length, 1, "Only one offsetParent found." );
	equals( div[0], Simples("#nothiddendiv")[0], "The div is the offsetParent." );

	div = Simples("body, #nothiddendivchild").offsetParent();
	equals( div.length, 2, "Two offsetParent found." );
	equals( div[0], document.body, "The body is the offsetParent." );
	equals( div[1], Simples("#nothiddendiv")[0], "The div is the offsetParent." );
});
