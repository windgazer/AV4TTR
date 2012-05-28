describe("AVSpot", function() {

	it ('Should be able to and get taken', function () {
		var spot = AVSpot();
		var s = spot.setTaken(true);
		var g = spot.getTaken();
		expect(g).toBeTruthy();
	});

});