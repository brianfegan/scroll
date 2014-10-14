/**
 * @fileOverview Scroll: Subscribe DOM elements to Scroll and get the scrollTop and scrollBottom of the element when window.onscroll events fire.
 * @author <a href="mailto:brianfegan@gmail.com">Brian Fegan</a>
 * @version 1.0
 */

/**
 * @name Scroll
 * @namespace A module that provides extra functionality on top of scroll events.
 * @description A module that provides extra functionality on top of scroll events.
 * @requires <a href="http://www.jquery.com">jQuery 1.7.2+</a>
 * @requires <a href="https://github.com/akqany/AKQA_NY_Internal/tree/master/js-utils/pubsub">PubSub.js</a>
 * @requires <a href="http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/">rAF Polyfill (modified)</a>
 */
window.Scroll = (function(self, PubSub, window, undefined){

	var config = {
		initialized: false
	}
	
	/**
	 * @name Scroll-_getScrollBottom
	 * @exports KCVP-_getScrollBottom as KCVP.getScrollBottom
	 * @function
	 * @description Using the scrollTop and winInnerHeight, calculate the scroll bottom.
	 * @param {number} [scrollTop]
	 * @returns {number} 
	 */
	_getScrollBottom = function(scrollTop) {
		scrollTop = (scrollTop) ? scrollTop : config.$document.scrollTop();
		var winInnerHeight = (typeof(window.innerHeight) == 'number') ? window.innerHeight : document.documentElement.clientHeight;
		return (winInnerHeight + scrollTop);
	},
	
	/**
	 * @name Scroll-_doScrollUpdate
	 * @function
	 * @description Notify subscribers of the scroll event, passing on scrollTop and scrollBottom.
	 */
	_doScrollUpdate = function() {
		config.SCROLL_TICKING = false;
		PubSub.publish('scroll', {scrollTop:config.SCROLL_TOP, scrollBottom:_getScrollBottom(config.SCROLL_TOP)});
	},
	
	/**
	 * @name Scroll-_requestScrollTick
	 * @function
	 * @description Used to monitor whether a user is scrolling and if we should use a rAF callback.
	 */
	_requestScrollTick = function() {
		if (!config.SCROLL_TICKING) {
			window.requestAnimationFrame(_doScrollUpdate);
		}
		config.SCROLL_TICKING = true;
	},
			
	/**
	 * @name Scroll-_scroll
	 * @function
	 * @description When a user has scrolled, if the browser supports native requestFrameAnimations,
	 * use them to notify scroll subscribers. If not, notify subscribers immediately via _doScrollUpdate.
	 * NOTE: We purposely do NOT use the polyfill here so the manual scroll animations work in iOS.
	 */
	_scroll = function() {
		config.SCROLL_TOP = config.$document.scrollTop();
		if (window.native_rAF) {
			_requestScrollTick();
		} else {
			_doScrollUpdate();
		}
	},
	
	/**
	 * @name Scroll-_unsubscribe
	 * @exports Scroll-_unsubscribe as Scroll.unsubscribe
	 * @function
	 * @description Remove a subscriber from the scroll list.
	 * @param {number} uid
	 */
	_unsubscribe = function(uid) {
		if (typeof uid === 'number') {
			PubSub.unsubscribe('scroll', uid);
		}
	},
	
	/**
	 * @name Scroll-_subscribe
	 * @exports Scroll-_subscribe as Scroll.subscribe
	 * @function
	 * @description Used to proxy the subscribe method of the PubSub module.
	 * @param {function} fn The callback for a resize event.
	 * @param {object} [instance] Optional instance to be used in callback.
	 */
	_subscribe = function(fn, instance) {
		if (typeof fn === 'function') {
			return PubSub.subscribe('scroll', fn, instance);
		}
	},
	
	/**
	 * @name RwdResize-_initialize
	 * @exports RwdResize-_initialize as RwdResize.initialize
	 * @function
	 * @description The initialize method that kicks off all Resize functionality
	 */
	_initialize = function(breakpoints, $parent) {
	
		// only proceed if we have jQuery, PubSub, and we only init once
		if (!jQuery || !PubSub || config.initialized) {
			return;
		}
			
		// save a window reference and set up the scroll listener
		config.$window = $(window);
		config.$document = $(document);
		config.$window.on('scroll', _scroll);
		
		config.initialized = true;
	
	};
	
	// Resize public variables & methods
	return {
		initialize: _initialize,
		subscribe: _subscribe,
		unsubscribe: _unsubscribe
	};
	
}({}, PubSub, window, undefined));