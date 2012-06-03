var AVBoard = (function (window) {
	'use strict';
	return function (context) {

		//	Private members
		var _x = 0,
			_y = 0,
			_width = 640,
			_height = 480,
			_pmLB = 0,
			_pmRT = 0;

		//	Public members
		return {
			getInfo: function () {
				return {
					x: _x,
					y: _y,
					width: _width,
					height: _height
				};
			},
			setX: function(value) {
				if (isNaN(value) || value > 640) {
					alert('\'x\' input value of ' + value + ' doesn\'t meet the input requirements:\nMust be a positive number and smaller then the FOV width.');
				} else {
					_x = value;
				}
			},
			setY: function(value) {
				if (isNaN(value) || value > 480) {
					alert('\'y\' input value of ' + value + ' doesn\'t meet the input requirements:\nMust be a positive number and smaller then the FOV height.');
				} else {
					_y = value;
				}
			},
			setWidth: function(value) {
				if (isNaN(value) || value > 640) {
					alert('\'width\' input value of ' + value + ' doesn\'t meet the input requirements:\nMust be a positive number and smaller then the FOV width.');
				} else {
					_width = value;
				}
			},
			setHeight: function(value) {
				if (isNaN(value) || value > 480) {
					alert('\'height\' input value of ' + value + ' doesn\'t meet the input requirements:\nMust be a positive number and smaller then the FOV height.');
				} else {
					_height = value;
				}
			},
			setPmLB: function (value) {
				if (isNaN(value)) {
					alert('\'position marker left bottom\' input value doesn\'t meet the input requirements:\nMust be a positive number.');
				} else {
					_pmLB = value;
				}
			},
			setPmRT: function (value) {
				if (isNaN(value)) {
					alert('\'position marker right top\' input value doesn\'t meet the input requirements:\nMust be a positive number.');
				} else {
					_pmRT = value;
				}
			},
			getPmLB: function () {
				return _pmLB;
			},
			getPmRT: function () {
				return _pmRT;
			},
			draw: function (ctx) {
				ctx.strokeStyle = '#0000ff';
				ctx.strokeRect(_x, _y, _width, _height);
			}
		}
	};
}(window));