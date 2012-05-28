var AVBoard = (function (window) {
	'use strict';
	return function (context) {

		//	Private members
		var _spots = [];

		//	Public members
		return {
			addSpot: function (spot) {
				_spots.push(spot);
				return true;
			},
			getSpots: function () {
				return _spots;
			},
			draw: function () {
				for (var i = 0, l = _spots.length; i < l; i++) {
					var spot = _spots[i];
					context.fillStyle = '#003344';
					context.strokeStyle = '#000000';
					context.strokeRect(spot.x, spot.y, spot.width, spot.height);
					if (spot.getTaken()) {
						context.fillRect(spot.x, spot.y, spot.width, spot.height);
					}					
				}
			}
		}
	};
}(window));