describe("AVBoard", function() {

	it ('Should be able to add spots', function () {
		var board = AVBoard();
		var a = board.addSpot(AVSpot(20, 20, 20, 20));
		expect(a).toBeTruthy();
	});
	
	it ('Should be able to get spots', function() {
		var board = AVBoard();
		board.addSpot(AVSpot(20, 20, 20, 20));
		board.addSpot(AVSpot(40, 40, 20, 20));
		s = board.getSpots();
		expect(board.getSpots()).toEqual({ x: 20, y: 20, width: 20, height: 20, setTaken: Function, getTaken: Function },
			{x: 40, y  40, width: 20, height: 20, setTaken: Function, getTaken: Function });
	});

});