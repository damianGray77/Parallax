'use strict';

(function() {
	var trans_pre;
	var trans_suf;
	var xform;
	
	Transforms.after_load(function() {
		trans_pre = Transforms.is_3d ? 'rotate(0.0001deg) translate3d(0, ' : 'translate(0, ';
		trans_suf = Transforms.is_3d ? 'px, 0)' : 'px)';
		xform = Transforms.xform;
	});

	function Parallax(o) {
		var self = this;
		
		var element;
		var image;
		var style;
		var amount;
		
		var max_scroll_dist;
		var scroll_off;
		
		var pos_arr;
		
		function init() {
			element = o.element;
			image = element.getElementsByClassName('img')[0];
			style = image.style;
			
			var a_attr = element.attributes['data-amount'];
			amount = !a_attr ? 1 : parseFloat(a_attr.value) * 0.01;
			style.height = ((1 + amount * 2) * 100) + '%';

			pos_arr = [];
		}
		
		self.pre_calc = function(body_top, wind_height) {
			var rect = element.getBoundingClientRect();
			var img_rect = image.getBoundingClientRect();
			
			var height = rect.bottom - rect.top;
			var img_height = img_rect.bottom - img_rect.top;
			var img_diff = img_height - height;
			
			var page_pos = rect.top - body_top;
			
			scroll_off = page_pos - wind_height;
			max_scroll_dist = wind_height + height;
			
			var move_scale = clamp(img_diff / (wind_height - height), 0, 1);
			var img_off = max_scroll_dist * 0.5 * move_scale + img_diff * 0.5;
			
			pos_arr.length = 0;
			for(var i = 0; i <= max_scroll_dist; ++i) {
				var pos = move_scale * i - img_off;
				pos_arr[i] = pos + 'px'; //trans_pre + pos + trans_suf;
			}
		}
		
		self.parallax = function(scroll) {
			scroll = clamp(scroll - scroll_off | 0, 0, max_scroll_dist);
			style['top'] = pos_arr[scroll];
		}
		
		init();
	}
	
	function ParallaxHandler() {
		var body_rect;
		var p_arr = [];
		var len = 0;
		
		var ie_projected_scroll = 0;
		window.addEventListener('load', function window_load() {
			ie_projected_scroll = WindowUpdateHandler.y;
		});
		
		function init() {
			if(!Transforms.loaded) {
				setTimeout(init, 100);
				return;
			}
			
			var e_arr = document.querySelectorAll('.parallax');
			len = e_arr.length;
			
			if(0 === len) { return; }
			
			for(var i = 0; i < len; ++i) {
				p_arr[i] = new Parallax({ element: e_arr[i] });
			}
			
			if(detect_ie()) {
				document.body.addEventListener('mousewheel', mousewheel, false);
			}
			
			WindowUpdateHandler.on('resize', pre_calc);
			WindowUpdateHandler.on('scroll', parallax);
		}
		
		function parallax(e, off) {
			var scroll = WindowUpdateHandler.y - (off || 0);
			
			for(var i = 0; i < len; ++i) {
				p_arr[i].parallax(scroll);
			}
			
			ie_projected_scroll = scroll;
		}
		
		function pre_calc(e) {
			body_rect = document.body.getBoundingClientRect();
			
			var top = body_rect.top;
			var scroll = WindowUpdateHandler.y;
			var height = WindowUpdateHandler.h;
			
			for(var i = 0; i < len; ++i) {
				var p = p_arr[i];
				p.pre_calc(top, height);
				p.parallax(scroll);
			}
		}
		
		function mousewheel(e) {
			e.preventDefault();

			var off = event.wheelDelta * 0.5;
			if(isNaN(parseInt(off))) { off = 0; }

			var sy = WindowUpdateHandler.y;
			if (sy != ie_projected_scroll) {
				off += sy - ie_projected_scroll;
			}
			sy -= off;
			if (sy < 0 || sy > body_rect.height - WindowUpdateHandler.h) { return false; }

			ie_projected_scroll = sy;

			parallax(null, off);
			
			window.scrollTo(0, sy);

			return false;
		}
		
		init();
	}
	
	document.addEventListener('DOMContentLoaded', function(e) {
		new ParallaxHandler();
	});
})();