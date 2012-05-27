var AVBlob = (function (window) {
	'use strict';
	return function () {

		//	Private members
		var _pixels = [],
			_min = {x: -1, y: -1},
			_max = {x: -1, y: -1},
			_check = function ( x, y ) {
				for ( var i = 0, l = _pixels.length; i < l; i++ ) {
					var p = _pixels[i];
					var difx = Math.abs( p.x - x );
					var dify = Math.abs( p.y - y );
					if (difx < 2 && dify < 2) {
						return true;
					}
				}
			};

		return {
			add: function(x, y) {

				if ( _pixels.length < 1 || _check( x, y ) ) {

					_pixels.push({x: x, y: y});
					return true;

				};
				
				return false;
			},
			getInfo: function () {
				var c;
				for ( var i = 0, l = _pixels.length; i < l; i++ ) {
					var p = _pixels[i];
					if (p.x < _min.x || _min.x === -1) {
						_min.x = p.x;
					}
					if (p.y < _min.y || _min.y === -1) {
						_min.y = p.y;
					}
					if (p.x > _max.x) {
						_max.x = p.x;
					}
					if (p.y > _max.y) {
						_max.y = p.y;
					}
				}
				return {
					x: _min.x,
					y: _min.y,
					width: _max.x - _min.x,
					height: _max.y - _min.y,
					pixelCount: _pixels.length
				}
			}
		};
	};
}(window));