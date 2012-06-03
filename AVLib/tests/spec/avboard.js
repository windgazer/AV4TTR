describe("AVBoard", function() {

	it ('Should be able to set and get board info', function() {
		var board = AVBoard();
		board.setX(10);
		board.setY(12);
		board.setWidth(510);
		board.setHeight(463);
		expect(board.getInfo()).toEqual({x: 10, y: 12, width: 510, height: 463});
	});

	it ('Should be able to set and get positionmarker info', function() {
		var board = AVBoard();
		board.setPmLB(682);
		board.setPmRT(213);
		expect(board.getPmLB()).toEqual(682);
		expect(board.getPmRT()).toEqual(213);
	});

});