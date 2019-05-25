'use strict';

(function() {
	var xform_arr = {
		  'transform': 'transform'
		, 'webkitTransform': '-webkit-transform'
		, 'MozTransform': '-moz-transform'
		, 'OTransform': '-o-transform'
		, 'msTransform': '-ms-transform'
	};
	
	function Transforms() {
		var self = this;
		
		var onload = [];
		
		self.is_3d = false;
		self.xform = 'transform';
		self.css_xform = 'transform';
		self.translate_pre = 'translate(';
		self.translate_suf = ')';
		self.loaded = false;
		
		function init() {
			if (undefined === document.body || null === document.body) {
				setTimeout(init, 10);
				return;
			}
			
			for (var key in xform_arr) {
				if (undefined !== document.body.style[key]) {
					self.xform = key;
					self.css_xform = xform_arr[key];
					break;
				}
			}

			if (!window.getComputedStyle) {
				return false;
			}

			var el = document.createElement('p');
			el.style[self.xform] = 'translate3d(1px, 1px, 1px)';

			document.body.insertBefore(el, null);

			var matrix = window.getComputedStyle(el).getPropertyValue(self.xform);
			self.is_3d = undefined !== matrix && 0 !== matrix.length && 'none' !== matrix;
			
			document.body.removeChild(el);

			if (self.is_3d) {
				self.translate_pre = 'translate3d(';
				self.translate_suf = ', 0px)';
			}
			
			self.loaded = true;
			
			for(var i = 0, len = onload.length; i < len; ++i) {
				onload[i]();
			}
		}
		
		self.after_load = function(callback) {
			if(self.loaded) {
				callback();
			} else {
				onload.push(callback);
			}
		}
		
		init();
	}
	
	window.Transforms = new Transforms();
})();