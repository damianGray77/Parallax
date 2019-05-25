'use strict';

(function() {
	var raf = window.requestAnimationFrame;
	var caf = window.cancelAnimationFrame;
	
	function Draw() {
		var self = this;
		
		var load_buffer;
		var run_buffer;
		var len;
		var request_id;
		var requested;
		
		self.loaded = true;
		
		function init() {
			load_buffer = [];
			run_buffer = [];
			len = 0;
			request_id = 0;
			requested = false;
			
			self.loaded = true;
		}
		
		function process() {
			var nlen = len;
			var temp = run_buffer;
			run_buffer = load_buffer;
			load_buffer = temp;
			len = 0;
			requested = false;
			
			for(var i = 0; i < nlen; ++i) {
				run_buffer[i]();
			}
		}
		
		self.render = function(func) {
			load_buffer[len] = func;
			++len;

			if(!requested) {
				window.requestAnimationFrame(process);
				requested = true;
			}
			
			return ++request_id % 1000;
		}
		
		self.cancel = function(request_id) {
			// todo if the request still exists in the buffer, then remove it.
		}
		
		init();
	}
	
	window.Draw = new Draw();
})();