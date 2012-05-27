describe("AVBlob", function() {

it ('Should be able to add pixels', function () {
	var blob = AVBlob();
	
	blob.add(0, 0);
});

it ('Should reject pixels not adjacent to existing pixel(s) in blob', function() {
	var blob = AVBlob();
	
	var r = blob.add(0,0);
	
	expect (r).toBeTruthy();
	
	//Check diagonal
	r = blob.add(1,1);
	
	expect(r).toBeTruthy();
	
	//Check Straight
	r = blob.add(1,0);
	
	expect(r).toBeTruthy();
	
	//Check Straight again
	r = blob.add(1,2);
	
	expect(r).toBeTruthy();

	r = blob.add(5,5);
	
	expect(r).toBeFalsy();
});

it ('Should be able to return location', function () {
	var blob = AVBlob();
	blob.add(4, 4);
	blob.add(5, 5);
	blob.add(6, 5);
	
	expect(blob.getInfo()).toEqual({x:4, y:4, width:2, height:1, pixelCount:3});
});

it ('Should be able to return dimension of blob', function () {
	var blob = AVBlob();
	blob.add(4, 4);
	blob.add(5, 5);
	blob.add(6, 5);
	
	expect(blob.getInfo()).toEqual({x:4, y:4, width:2, height:1, pixelCount:3});
});

});