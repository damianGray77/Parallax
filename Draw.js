'use strict';

(function() {
	var raf = window.requestAnimationFrame;
	var caf = window.cancelAnimationFrame;
	
	function Draw() {
		var self = this;
		
		var buffer;
		var len;
		var request_id;
		
		function init() {
			buffer = [];
			len = 0;
			request_id = 0;
		}
		
		/*function _render1() {
			if(process()) {
				raf(_render2);
			}
		}
		
		function _render2() {
			if(process()) {
				raf(_render1);
			}
		}*/
		
		function process() {
			if(0 === len) { return; }

			for(var i = 0; i < len; ++i) {
				buffer[i]();
			}
			
			len = 0;
		}
		
		self.render = function(func) {
			buffer[len] = func;

			if(1 === ++len) {
				raf(process);
			}
			
			if(++request_id >= 1000) { request_id = 0; }
			
			return request_id;
		}
		
		self.cancel = function(request_id) {
			// todo if the request still exists in the buffer, then remove it.
		}
		
		init();
	}
	
	window.Draw = new Draw();
})();