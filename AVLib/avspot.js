var AVSpot = (function (window) {
	'use strict';
	return function (x, y, width, height) {

		//	Private members
		var _taken = false;

		//	Public members
		//	TODO: Create getters later on
		return {
			x: x,
			y: y,
			width: width,
			height: height,
			setTaken: function(value) {
				_taken = value;	
			},
			getTaken: function () {
				return _taken;
			}
		}
	};
}(window));