'use strict';

(function() {
	var support_passive = false;
	try {
		window.addEventListener('test', null, Object.defineProperty({ }, 'passive', { get: function() { support_passive = { passive: true, capture: false }; } }));
	} catch(err) { }
	
	var raf =
		   window.requestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
	;
	
	function CallBack(func, handle) {
		this.handle = handle;
		this.func = func;
	}
	
	function WindowUpdateHandler() {
		var self = this;
		
		var request_id = null;
		var updating = false;
		var resized = false;
		var scrolled = false;
		
		var resize_hooks;
		var scroll_hooks;
		var resize_len;
		var scroll_len;
		
		self.x = null; self.y = null;
		self.h = null; self.w = null;
		
		var w, h;
		var x, y;
		
		var cur_handle = 0;
		var handle_arr = [];
		
		self.loaded = false;
		
		var update_size;
		if(undefined !== window.innerWidth) {
			update_size = function() {
				w = window.innerWidth;
				h = window.innerHeight;
			}
		} else {
			update_size = function() {
				w = document.documentElement.clientWidth;
				h = document.documentElement.clientHeight;
			}
		}
		
		var update_scroll;
		if(undefined !== window.pageXOffset) {
			update_scroll = function() {
				x = window.pageXOffset;
				y = window.pageYOffset;
			}
		} else if('CSS1Compat' === (document.compatMode || '')) {
			update_scroll = function() {
				x = document.documentElement.scrollLeft;
				y = document.documentElement.scrollTop;
			}
		} else {
			update_scroll = function update_scroll() {
				x = document.body.scrollLeft;
				y = document.body.scrollTop;
			}
		}
		
		function resize() {
			update_size();
			
			resized = true;
			request();
		}
		
		function scroll() {
			update_scroll();
			
			scrolled = true;
			request();
		}
		
		function init() {
			resize_hooks = [];
			scroll_hooks = [];
			
			resize_len = 0;
			scroll_len = 0;
			
			init_events();
			
			update_size();
			self.w = w; self.h = h;
			
			self.loaded = true;
		}
		
		function init_events() {
			if(null === document.body) {
				setTimeout(init_events, 100);
				return;
			}
			
			window.addEventListener('scroll', scroll, support_passive);
			window.addEventListener('resize', resize, support_passive);
			
			// scroll position happens after the dom is loaded so it needs to be set later
			scroll();
		}
		
		function request() {
			if(updating) { return; }
			
			updating = true;
				
			if(null !== request_id) {
				Draw.cancel(request_id);
				request_id = null;
			}
			
			request_id = Draw.render(update);
		}
		
		function update() {
			if(resized) {
				self.w = w; self.h = h;
				
				for(var i = 0; i < resize_len; ++i) {
					resize_hooks[i].func(self);
				}
				
				resized = false;
			}
			
			if(scrolled) {
				self.x = x; self.y = y;
				
				for(var i = 0; i < scroll_len; ++i) {
					scroll_hooks[i].func(self);
				}
				
				scrolled = false;
			}
			
			request_id = null;
			updating = false;
		}
		
		self.on = function(e, func) {
			++cur_handle;
			
			switch(e) {
				case 'resize':
					resize_hooks.push(new CallBack(func, cur_handle));
					resize_len = resize_hooks.length;
					handle_arr[cur_handle] = 'resize';
					break;
				case 'scroll':
					scroll_hooks.push(new CallBack(func, cur_handle));
					scroll_len = scroll_hooks.length;
					handle_arr[cur_handle] = 'scroll';
					break;
				default: throw 'Unsupported event';
			}
			
			func(self);
			
			return cur_handle;
		}
		
		function get_buffer(e) {
			switch(e) {
				case 'resize': return resize_hooks;
				case 'scroll': return scroll_hooks;
				default: throw 'Unsupported event';
			}
		}
		
		self.off = function(e, func) {
			if(undefined === func) { return; }
			
			var arr = get_buffer(e);

			for(var i = 0, len = arr.length; i < len; ++i) {
				if(arr[i].func === func) {
					remove_at(arr, i);
					break;
				}
			}
			
			switch(e) {
				case 'resize': resize_len = arr.length; break;
				case 'scroll': scroll_len = arr.length; break;
			}
		}
		
		self.clear_handle = function(handle) {
			if(undefined === handle_arr[handle]) { return; }

			var arr = get_buffer(handle_arr[handle]);

			for(var i = 0, len = arr.length; i < len; ++i) {
				if(arr[i].handle === handle) {
					remove_at(arr, i);
					break;
				}
			}
			
			handle_arr[handle] = undefined;
			
			switch(e) {
				case 'resize': resize_len = arr.length; break;
				case 'scroll': scroll_len = arr.length; break;
			}
		}
		
		self.clear = function(e) {
			var arr = get_buffer(e);
			
			arr.length = 0;
			
			switch(e) {
				case 'resize': resize_len = 0; break;
				case 'scroll': scroll_len = 0; break;
			}
		}
		
		init();
	}
	
	window.WindowUpdateHandler = new WindowUpdateHandler();
})();