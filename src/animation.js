// ======= ANIMATION ========== //
// Regexp used in this file
var REGEX_PIXEL = /px\s?$/,
	ALLOW_TYPES = /padding|margin|height|width|top|left|right|bottom|fontSize/,
	TIMER_ID;
/**
 * @namespace Simples.Animation
 */
Simples.Animation = {
	/* animations: currently active animations being run */
	animations : {},
	/* frameRate: global frame rate for animations */
	frameRate : 24,
	/* length: count of current active animations */
	length : 0,
	/* guid: unique identifier for animations */
	guid : 1e6,
	/* tweens: default tweens for animation 
	 * @param frame: current frame
	 * @param frameCount: total frames for animations
	 * @param start: start value for tween
	 * @param delta: difference to end value		
	 */
	tweens : {
		easing : function( frame, frameCount, start, delta ) {
			return ((frame /= frameCount / 2) < 1) ? delta / 2 * frame * frame + start : -delta / 2 * ((--frame) * (frame - 2) - 1) + start;
		},
		linear : function( frame, frameCount, start, delta ){
			return start + ( delta * ( frame/frameCount ));
		},
		quadratic : function( frame, frameCount, start, delta ){
			return start + (((Math.cos((frame/frameCount)*Math.PI) )/2) * delta );
		}
	},
	interval : Math.round( 1000 / this.frameRate ),
	/**
	 * Simples.Animation.create: used to to create an animation object which can be used by the animation queue runner
	 * @param elem {Element} DOM Element to animate
	 * @param setStyle {Object} CSS to use in animation, final position 
	 * @param opts {Object}
	 * @param opts.callback {Function} when animation complete
	 * @param opts.tween {Function} tween to use when animating
	 * @param opts.duration {Object} the time to elapse during animation
	 */
	create : function( elem, setStyle, opts ){
		opts = opts || {};
		if ( !( elem && elem.nodeType ) || Simples.isEmptyObject( setStyle ) ) {
			if (typeof opts.callback === FUNC) {
				opts.callback.call(elem);
			}
			return null;
		}

		var anim = {
			0 : elem,
			id : Simples.Animation.guid++,
			callback : ( typeof opts.callback === FUNC ) ? opts.callback : Simples.noop,
			duration : ( typeof opts.duration === NUMBER && opts.duration > -1 ) ? opts.duration : 600,
			tween : ( typeof opts.tween === FUNC ) ? opts.tween : ( Simples.Animation.tweens[ opts.tween ] || Simples.Animation.tweens.easing ),
			start : {},
			finish : {}
		};

		// check for supported css animated features and prep for animation
		for( var key in setStyle ){
			var cKey = key.replace( RDASH_ALPHA, fcamelCase ),
				opacity = ( cKey === OPACITY && setStyle[ key ] >= 0 && setStyle[ key ] <= 1 );

			if( opacity || ALLOW_TYPES.test( cKey ) ){
				anim.start[ cKey ] = ( Simples.getStyle( elem, cKey ) + EMPTY_STRING ).replace(REGEX_PIXEL,EMPTY_STRING) * 1;
				anim.finish[ cKey ] = ( setStyle[ key ] + EMPTY_STRING ).replace(REGEX_PIXEL,EMPTY_STRING) * 1;
			}                                        
		}

		var data = Simples.data(elem);
		data.animations = data.animations || {};
		data.animations[ anim.id ] = anim;

		if( opts.manualStart !== true ){
			Simples.Animation.start( anim );
		}
		return anim;
	},
	/**
	 * Simples.Animation.start: used to add the animation to the animation runner queue
	 * @param animation {Object} animation to perform action on
	 */
	start : function( animation ){

		if( animation && animation.id ){
			if( !hasOwn.call( this.animations, animation.id ) ){
				this.length++;
				this.animations[ animation.id ] = animation;
				if( animation.duration === 0 ){
					this.stop( animation );
				} else if( !animation.startTime ){
					animation.startTime = new Date().getTime();
				}
			}
			
			if( !TIMER_ID ){
				this.interval = Math.round( 1000/ this.frameRate );
				TIMER_ID = window.setInterval(function(){ Simples.Animation._step(); }, this.interval );
			}
		}
	},
	/**
	 * Simples.Animation.reverse: used to take an animation in its current position and reverse and run
	 * @param animation {Object} animation to perform action on
	 */
	reverse : function( animation ){
		var start = animation.start, finish = animation.finish;

		animation.start = finish;
		animation.finish = start;
		
		if( this.animations[ animation.id ] && animation.startTime ){
			var now = new Date().getTime(),
				diff = now - animation.startTime;

			animation.startTime = now - ( animation.duration - diff );
		} else {
			delete this.animations[ animation.id ];
			this.start( animation );
		}
	}, 
	/**
	 * Simples.Animation.reset: used to reset an animation to either the start or finish position
	 * @param animation {Object} animation to perform action on
	 * @param resetToEnd {Boolean} whether to reset to finish (true) or start (false||undefined) state
	 */
	reset : function( animation, resetToEnd ){

		var cssObj = resetToEnd ? animation.finish : animation.start,
			elem = animation[0];
			
		for( var name in cssObj ){
			Simples.setStyle( elem, name, cssObj[ name ] );
		}
		
		if( animation.startTime ){
			this.stop( animation );
		}
	},
	/**
	 * @private
	 * Simples.Animation._step: a private method used by the queue runner to iterate over queued animations and update each postion
	 */
	_step : function(){
		if( this.length ){ 
			var now = new Date().getTime();    
			for( var id in this.animations ){
				var anim = this.animations[ id ],
					diff = now - anim.startTime,
					elem = anim[0],
					duration = anim.duration;
					
				if ( diff > duration ) {
					this.stop( anim, true );
				} else {
					for( var name in anim.start ){
						var start = anim.start[ name ];
						Simples.setStyle( elem, name, anim.tween( diff, duration, start, anim.finish[ name ] - start ) );
					
					}
				}
			}
		} else if( TIMER_ID ){
			window.clearInterval( TIMER_ID );
			TIMER_ID = null;
		}
	},
	/**
	 * Simples.Animation.stop: used to stop a supplied animation and cleanup after itsef
	 * @param animation {Object} the animation object to use and work on.
	 * @param jumpToEnd {Boolean} whether to leave in current position or set css to finish position
	 */
	stop : function( animation, jumpToEnd ){
		if( animation && hasOwn.call( this.animations, animation.id ) ){

			animation.startTime = null;

			if ( jumpToEnd ){
				this.reset( animation, true );
			}

			var data = Simples.data( animation[0] );
			data.animations = data.animations || {};
			delete data.animations[ animation.id ];

			animation.callback.call(animation[0], animation);
			delete this.animations[ animation.id ];
			this.length--;
		}
	}
};

Simples.extend({
	/**
	 * Simples( '*' ).animations: From the instance of the Simples object used to bridge to the Simples.Animation functionality
	 * @param action {String} the name of the action to be performed, excluding create && _step
	 */
	animations: function(action) {
		if( action != ("create" || "_step") && Simples.Animation[ action ] ){
			var i = this.length;
			while (i) {
				var anims = Simples.data( this[--i], "animation" );
				Simples.Animation[ action ]( anim, arguments[2] );
			}
		}
		return this;
	},
	/**
	 * Simples( '*' ).aniamte: Used to create animations off the elements in the instance of the Simples object
	 * @param action {String} the name of the action to be performed, excluding create && _step
	 * @param css {Object} CSS to use in animation, final position 
	 * @param opts {Object}
	 * @param opts.callback {Function} when animation complete
	 * @param opts.tween {Function} tween to use when animating
	 * @param opts.duration {Object} the time to elapse during animation
	 */
	animate: function(css, opts) {
		var i = this.length;
		while (i) {
			Simples.animate( this[--i], css, opts );
		}
		return this;
	}
});