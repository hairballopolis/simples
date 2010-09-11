var t_start_anim = [], t_stop_anim = [], anim_id, test_now;

function setUpStartTime( animation, frame, frameRate ){
	animation._startTime = start = new Date().getTime() - ( animation._duration * frame / frameRate );
	return animation;
}

function clone( obj ){
	var nobj = {};
	for( var name in obj ){
		nobj[ name ] = obj[ name ];
	}
	return nobj;
}

module("Animation",{
	setup : function(){
		window.__AnimationController__ = clone( window.AnimationController ); 
		t_start_anim = []; t_stop_anim = [];
		
		window.AnimationController.start = function( animation, frame ){
			test_now = new Date().getTime();
			animation._startTime = test_now;
			animation._calledFrame = frame;
			t_start_anim.push( animation );
		};
		window.AnimationController.stop = function( animation ){
			t_stop_anim.push( animation );
		};
	},
	teardown : function(){   
		t_start_anim = []; t_stop_anim = [];
		Simples('#test-area').css('opacity', 1 );
		window.AnimationController = clone( window.__AnimationController__ );
		window.__AnimationController__ = null;
	}
});

test("Animation contructor checks defaults", 8, function() {                                                 
	
	equal( Animation( Simples('#test-area')[0] ), null, "should not return a animation object" );
	
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
	
	equal( anim._duration, 600, "should have x frames" );
	ok( !anim._reverse, "should set to reverse to false" );
	ok( anim._autoStart, "should autoStart animation" );
	equal( typeof anim._callback, "function", "should always set a callback function" );
	same( anim._start, {opacity:1}, "should have the start state as first frame" );
	same( anim._finish, {opacity:0}, "should have the start state as first frame" );
	equal( anim._id, AnimationController.guid - 1, "should have an id" );
});

test("Animation contructor checks opts", 7, function() {                                                 

	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {reverse:true, manualStart:true, duration:1000});
	
	equal( anim._duration, 1000, "should have duration" );
	ok( anim._reverse, "should set to reverse to false" );
	ok( !anim._autoStart, "should autoStart animation" );
	equal( typeof anim._callback, "function", "should always set a callback function" );
	same( anim._start, {opacity:1}, "should have the start state as first frame" );
	same( anim._finish, {opacity:0}, "should have the start state as first frame" );  
	equal( anim._id, AnimationController.guid - 1, "should have an id" );
});

test("Animation.start()", 5, function() {
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
 
   	// set correct context
	anim._startTime = undefined; t_start_anim = [];
	anim.start();
	equal( anim._startTime, test_now, "should set the startTime");
	same( anim, t_start_anim[0], "should call AnimationController.start");
	
	anim._startTime = undefined; t_start_anim = [];
	anim.start( 6 );
	equal( anim._startTime, Math.round( test_now - ( anim._duration/1000 * 6 / AnimationController.frameRate)) , "should set the startTime minus current Frame");
	equal( anim._calledFrame, 6, "should call AnimationController.start with frame");
	same( anim, t_start_anim[0], "should call AnimationController.start with animation");
});
	
test("Animation.stop()", 9, function() {
	var start, anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {
		callback:function( animation ){
			ok( true, "should call callback");
			same( this, anim[0], "this should be the element" );
			same( anim, animation, "this should be the animation" );
		}
	});
	
    anim.reverse = function(){
		ok( false, 'should not call reverse' );
	};
   	// set correct context
	anim = setUpStartTime( anim, 12, 24 );
	start = anim._startTime;
	t_stop_anim = [];
	anim.stop();
	equal( anim._startTime, start, "should set the frame to 0");
	same( anim, t_stop_anim[0], "should call AnimationController.start");
	
	anim = Animation( Simples('#test-area')[0], {'opacity': 0}, { reverse:true } );
	anim.reverse = function(){
		ok( true, 'should call reverse' );
	};
   	// set correct context
	anim = setUpStartTime( anim, 4, 24 );
	start = anim._startTime;
	t_stop_anim = [];
	anim.stop();	
	
	equal( anim._startTime, start, "should set the frame to 0");
	same( anim, t_stop_anim[0], "should call AnimationController.start");
	
	ok( false, "Add test to jumpToEnd when specified.")
});

test("Animation.reverse()", 6, function() { 
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} ),
		states = [ anim._start, anim._finish ];

	anim._autoStart = true;
	t_start_anim = [];
	anim.reverse();
	same( [ anim._finish, anim._start ], states, "frames are reversed" );
	same( t_start_anim[0], anim, "should automatically call start" );
	
	anim._autoStart = false;
	t_start_anim = [];
	anim.reverse();
	same( [ anim._start, anim._finish ], states, "frames are reversed" );
	same( t_start_anim[0], undefined, "should automatically call start" );
	
	t_start_anim = [];
	anim.reverse( true );
	same( [ anim._finish, anim._start ], states, "frames are reversed" );
	same( t_start_anim[0], anim, "should automatically call start" );
});   

function testStep( anim, frameNumber, frameMax, factor ){
	var stop = false, now = new Date().getTime(), frameTime = now + ( ( frameNumber / frameMax ) * anim._duration );
	anim.stop = function(){
		ok( stop, "should "+(stop ? "": "not ")+"call stop");
	};

	if( frameNumber > frameMax ){
		stop = true;
	}
	
	anim._startTime = now;
	anim.step( frameTime );    
    
	var opacity = AnimationController.tweens.easing( Math.min( frameNumber / frameMax, 1 ) * anim._duration, anim._duration, anim._start.opacity, anim._finish.opacity - anim._start.opacity );
	equal( Math.floor( opacity * factor ) / factor, Math.floor( anim[0].style.opacity * factor ) / factor, "should set to frame opacity - "+frameNumber+" of "+frameMax );			
}

test("Animation.step()", 27, function() { 
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, { manualStart:true, duration:1000 } ), max = 24;
	for(var i=0;i<=max+1;i++){
		testStep( anim, i, max, 1000 );
	}
});

test("Animation.reset()", 3, function() {    
	
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, { manualStart:true, duration:1000 } ), factor = 1000;
	
	testStep( anim, 8, 24, factor );
	 
	anim.stop = Animation.prototype.stop;
	anim.reset();
	
	equal( t_stop_anim[0], anim, "should call stop, as not on first frame");
	equal( anim._start.opacity, anim[0].style.opacity, "set back to first frame");
});

var prefix_ = 't_comp_';

function testObject( Obj, name, type ){
 	equal( typeof Obj[ name ], type, "should have "+name+" of type "+type );
}

function createCA( count ){
	count = count > 0 ? count : 6;
	var anims = [];
	for(var i=0;i<count;i++){
		anims.push( createAnim( i ) );
	}
	return new CompositeAnimation( anims );	
}

function createAnim( id ){
	var anim = { _id: id };
	for( var name in Animation.prototype ){ (function( n, a ){
		a[n] = function(){
			window._test[ prefix_ + n ].push( a );
		};
	})( name, anim ); }
	return anim;	
} 

module("CompositeAnimation", {
	setup : function(){     
		window._test = {};
		for( var name in Animation.prototype ){
			window._test[ prefix_ + name ] = [];
		} 
	},
	teardown : function(){
		for( var name in Animation.prototype ){
			window._test[ prefix_ + name ] = null;
		}
		delete window._test;
	}
}); 

test("properly setup", 7, function(){
   	var ca = createCA( 2 );
	
	for( var name in Animation.prototype ){
		testObject( ca, name, 'function' );
	}
	testObject( ca, '0', 'object');
	testObject( ca, '1', 'object');
});

test("without passing array of animations", 6, function(){
   	var ca = new CompositeAnimation();
	
	for( var name in Animation.prototype ){
		testObject( ca, name, 'function' );
	}
	testObject( ca, '0', 'undefined');
});                                      

test("with passing Animation", 7, function(){
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
   	var ca = new CompositeAnimation( anim );
	
	for( var name in Animation.prototype ){
		testObject( ca, name, 'function' );
	}
	testObject( ca, '0', 'object');
	equal( ca[0]._id, anim._id, "should be the animation" );
});

test("functions", 15,function(){
   	var ca = createCA( 2 );

	for( var name in Animation.prototype ){
		ca[ name ]();
		equal( window._test[ prefix_ + name ].length, 2, name+" should have 2 animation calls" );
		for(var i=0;i<2;i++){
			equal( window._test[ prefix_ + name ][ i ]._id, i, name+" should have same id" );
		}  
	}
});

module("AnimationController", {
	setup:function(){     
		AnimationController.frameRate = 24;
		AnimationController.interval = Math.round( 1000 / 24 );
		
		for( var name in Animation.prototype ){
			Animation.prototype[ '_' + name ] = Animation.prototype[ name ];
			Animation.prototype[ name ] = function(){
				ok( true, name + " called" );
			};
		}
	},
	teardown:function(){                                                    
		for( var name in Animation.prototype ){
			Animation.prototype[ name ] = Animation.prototype[ '_' + name ];
			delete Animation.prototype[ '_' + name ];
		}
		
		window.clearInterval( AnimationController.timerID );
		AnimationController.timerID = null;
		AnimationController.animations = {};
		AnimationController.length = 0;
	}
});
test("test singleton", 8, function(){
	
	testObject( AnimationController, 'animations', 'object' );
	testObject( AnimationController, 'frameRate', 'number' );
	testObject( AnimationController, 'length', 'number' );
	testObject( AnimationController, 'interval', 'number' );
	testObject( AnimationController, 'tweens', 'object' );		
	testObject( AnimationController, 'start', 'function' );
	testObject( AnimationController, 'step', 'function' );
	testObject( AnimationController, 'stop', 'function' );
});

test("start() basics", 9, function(){
	//setup
	AnimationController._step = AnimationController.step;
	// test setup
	AnimationController.step = function(){
		ok( false, "Should not have called step" );
	};

	AnimationController.frameRate = 1;
	AnimationController.start();

	equal( AnimationController.interval, Math.round( 1000 / 24 ), "should have a default interval" );
	equal( AnimationController.timerID, undefined, "should have a frameRate of undefined" );

	var anim = Animation( Simples('#test-area')[0], {'opacity': 0 }, { manualStart:true } ),
		id = AnimationController.timerID;

	AnimationController.start( anim );

	equal( AnimationController.length, 1, "should have one animation" );
	ok( AnimationController.timerID > id, "should start the timer" );
	equal( AnimationController.interval, 1000, "should have set the interval correctly" );   
	ok( anim._startTime > ( new Date().getTime() - 100 ), "should have correctly set the start time" );  
    
	AnimationController.frameRate = 12;
	id = AnimationController.timerID;
	AnimationController.start( anim );

	equal( AnimationController.length, 1, "should have one animation" );
	equal( AnimationController.timerID, id, "should have one timer" );
	equal( AnimationController.interval, 1000, "should have one animation" );	
	
	// cleanup	
	AnimationController.step = AnimationController._step;
});

test("start() with frame", 4, function(){
	
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0 }, { manualStart:true } ),
		id = AnimationController.timerID;

	AnimationController.step = function(){
		ok( true, "Should have called step" );
	};
		
	AnimationController.start( anim, 3 );

	equal( AnimationController.length, 1, "should have one animation" );
	ok( AnimationController.timerID > id, "should start the timer" );
	var time = new Date().getTime() - ( anim._duration / 24 * 3 );
	ok( anim._startTime > time - 100 && anim._startTime < time + 100, "should have correctly set the start time" );
	
	// cleanup	
	AnimationController.step = AnimationController._step;
});

test("step() thorough", 12, function(){
	window.__clearInterval__ = window.clearInterval;
	window.clearInterval = function( id ){
		ok( true, "should call clearInterval" );
		window.__clearInterval__( id );
	};
	
	AnimationController.timerID = 34324;
 	AnimationController.step();

	equal( AnimationController.timerID, undefined, "when timerID but no animations should stop timer");
   
	window.clearInterval = window.__clearInterval__; 
	
	for( var id=0;id<10;id++){
		AnimationController.animations[ id ] = createAnim( id );
		AnimationController.length = id+1;
		AnimationController.animations[ id ].step = (function(id){
			return function( now ){ 
				var current = new Date().getTime();
				ok( current+10 > now && current - 10 < now, "should call and pass now "+id );
			};
		})( id );
	}
	
	AnimationController.step();
});

test("stop() thorough", 30, function(){

	for( var id=0;id<10;id++){
		AnimationController.animations[ id ] = createAnim( id );
		AnimationController.length = id+1;
		AnimationController.animations[ id ]._startTime = new Date().getTime();
	}
	var length = 10;
	for( var i=0;i<10;i++){
		var animation = AnimationController.animations[ i ];
		AnimationController.stop( animation );
		equal( animation._startTime, undefined, "should not have a startTime" );
		equal( AnimationController.animations[ i ], undefined, "should not have a record of the animation - "+animation._id );
		equal( AnimationController.length, --length, "should decrement length" );
	}
	
});

test("reset()", 4, function(){ 
	window.__clearInterval__ = window.clearInterval;
	window.clearInterval = function( id ){
		ok( true, "should call clearInterval" );
		window.__clearInterval__( id );
	};
	  
	for( var id=0;id<10;id++){
		AnimationController.animations[ id ] = createAnim( id );
		AnimationController.length = id+1;
		AnimationController.animations[ id ]._startTime = new Date().getTime();
	}
	
	AnimationController.timerID = 3434;
	
	AnimationController.reset();
	
	ok( !AnimationController.timerID, "should clear timerID");
	equal( AnimationController.length, 0, "should reset the length to 0");
	same( AnimationController.animations, {}, "should have an empty list of animations");
	
	window.clearInterval = window.__clearInterval__; 
}); 

module( "Simples( element ).animate()", {
   setup : function(){
		AnimationController.frameRate = 24;
		AnimationController.interval = Math.round( 1000 / 24 );
		AnimationController.guid = 1e6;
	},
	teardown: function(){
		window.clearInterval( AnimationController.timerID );
		AnimationController.timerID = null;
		AnimationController.animations = {};
		AnimationController.length = 0;
	}
});

test("with no properties", 2, function() {

	var divs = Simples("div"), count = 0;

	divs.animate({}, {callback: function(){
		count++;
	}});

	equals( 0, count, "Make sure that callback is called for each element in the set." );

	stop();

	var foo = Simples("#foo");

	foo.animate({});
	foo.animate({top: 10}, { duration : 100, callback:function(){
		ok( true, "Animation was properly dequeued." );
		QUnit.start();
	}});
});

test("animate(Hash, Object, Function)", 2, function() { 

	stop();
	var hash = {opacity: 'show'},
		hashCopy = clone( hash ),
		startOpacity = Simples('#foo').css('opacity');
		
	var anim = Simples('#foo').animate({opacity: 'show'}, {
		callback: function( animate ) {
			ok( !animate._start.opacity, 'Should not set opacity' ); 
			equal( Simples('#foo').css('opacity'), startOpacity, "shouldn't change the opacity");
			QUnit.start();
		},
		duration:100
	}); 
	
	
}); 

test("animate negative height", 1, function() {
	
    stop();
    Simples("#foo").animate({ height: -100 }, {
        callback: function() {
            equals( this.offsetHeight, 0, "Verify height.");
            QUnit.start();
        },
		duration : 100
    });	
});

test("animate duration 0", 10, function() {
	stop();
	
	var $elems = Simples('#test-area, #nothiddendiv'), counter = 0;
	
	equals( AnimationController.length, 0, "Make sure no animation was running from another test" );

	var anim = $elems.slice(0).animate( {a:1}, { duration: 0, callback : function(){
		ok( true, "Animate a simple property." );
		counter++;
	}});
	
	equals( anim._duration, 0, "should not set default duration" );
	
	// Failed until [6115]
	equals( AnimationController.length, 0, "Make sure synchronic animations are not left on AnimationController.length" );
	
	equals( counter, 1, "One synchronic animations" );
	
	$elems.animate( { a:2 }, { duration: 0, callback : function(){
		ok( true, "Animate a second simple property." );
		counter++;
	}});
	
	equals( counter, 3, "Multiple synchronic animations" );
	
	$elems.slice(0).animate( {a:3}, { duration: 0, callback : function(){
		ok( true, "Animate a third simple property." );
		counter++;
	}});
	$elems.slice(1).animate( {a:3}, { duration: 200, callback : function(){
		counter++;
		// Failed until [6115]
		equals( counter, 5, "One synchronic and one asynchronic" );
		QUnit.start();
	}});
});

test("animate hyphenated properties", 1, function(){
	stop();
	var elem = Simples("#nothiddendiv")
		.css("font-size", 10)
		.animate({"font-size": 20}, { duration:200, callback:function(){
				equals( this.style.fontSize, "20px", "The font-size property was animated." );
				QUnit.start();                                         
			}
		});
}); 
