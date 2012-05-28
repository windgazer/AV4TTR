var AVLib = (function (window) {
	'use strict';
	return function (app, canvasId, snapshotCanvasId, blobCanvasId) {
		//	Private members
		var _doc = window.document,
			_nav = window.navigator,
			_debugMode = false,
			_video = null,
			_snapshotImageData = false,
			_canvas = null,
			_snapshotCanvas = null,
			_blobCanvas = null,
			_blobs = [],
			_board = null,
			_debug = function (message) {
				var debugDiv = _doc.getElementById('debug');
				if (!debugDiv) {
					debugDiv = _doc.createElement('div');
					debugDiv.id = 'debug';
				}
				debugDiv.innerHTML = message;
			},
			_getVideo = function(id, width, height) {
				var video = _doc.createElement('video');
				video.id = id;
				video.width = width;
				video.height = height;
				video.autoplay = true;
				return video;
			},
			_createCanvas = function(id, width, height) {
				var canvas = _doc.createElement('canvas');
				canvas.id = id || 'unnamed canvas';
				canvas.width = parseInt(width) || 640;
				canvas.height = parseInt(height) || 480;
				_doc.body.appendChild(canvas);
				return canvas;
			},
			_hasGetUserMedia = function () {
				return (navigator.getUserMedia ||
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia);
			},
			_getUserMediaError = function () {
				alert('Your browser doesn\'t support getUserMedia.\n' +
					'Please use a recent version of Google Chrome');
			},
			_webcamError = function () {
				alert('A webcam error occurred.')
			},
			_setupWebcam = function () {
				if (_hasGetUserMedia()) {
					_video = _getVideo('video', _canvas.width, _canvas.height);
					if (_nav.getUserMedia) {
						_nav.getUserMedia(
							{audio: true, video: true},
							function(stream) {
								_video.src = stream;
							},
							_webcamError
						);
					}
					else if (_nav.webkitGetUserMedia) {
						navigator.webkitGetUserMedia(
							'audio, video',
							function(stream) {
								_video.src = window.webkitURL.createObjectURL(stream);
							},
							_webcamError
						);
					}
					else {
						//	video.src = 'fallbackmovie';
					}
				}
				else {
					_getUserMediaError();
				}
			},
			_setupBoard = function () {
				//	Create a virtual play board
				_board = AVBoard(_canvas.ctx);
				//	Add some test spots to the board
				_board.addSpot(AVSpot(50, 30, 20, 20));
				_board.addSpot(AVSpot(100, 30, 20, 20));
				_board.addSpot(AVSpot(150, 30, 20, 20));
				_board.addSpot(AVSpot(200, 30, 20, 20));
				_board.addSpot(AVSpot(250, 30, 20, 20));
				
				_board.addSpot(AVSpot(250, 30, 20, 20));
				_board.addSpot(AVSpot(250, 80, 20, 20));
				_board.addSpot(AVSpot(250, 130, 20, 20));
				_board.addSpot(AVSpot(250, 180, 20, 20));
				
				_board.addSpot(AVSpot(250, 180, 20, 20));
				_board.addSpot(AVSpot(200, 180, 20, 20));
				_board.addSpot(AVSpot(150, 180, 20, 20));
				_board.addSpot(AVSpot(100, 180, 20, 20));
				_board.addSpot(AVSpot(50, 180, 20, 20));
				
				_board.addSpot(AVSpot(50, 80, 20, 20));
				_board.addSpot(AVSpot(50, 130, 20, 20));
			},
			_fastAbs = function (value) {
				return (value ^ (value >> 31)) - (value >> 31);
			},
			_threshold = function (value) {
				return (value > 0x15) ? 0xFF : 0;
			},
			_differenceAccuracy = function (target, data1, data2) {
				if (data1.length != data2.length) {
					return null;
				}	
				var i = 0, x = 0, y = 0;
				while (i < (data1.length * 0.25)) {
					var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
					var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
					var diff = _threshold(_fastAbs(average1 - average2));
					target[4*i] = diff;
					target[4*i+1] = diff;
					target[4*i+2] = diff;
					target[4*i+3] = 0xFF;
					++i;
					
					if (diff == 255) {
						y = Math.floor(i / 320);
						x = i - (y * 320);
						var matched = false;
						for (var j = 0, l = _blobs.length; j < l && matched == false; j++) {
							var blob = _blobs[j];
							matched = blob.add(x, y);
						}
						if (!matched) {
							var blob = AVBlob();
							blob.add(x, y);
							_blobs.push(blob);
						}
					}
				}
			},
			_randomRange = function (min, max) {
				return Math.floor((Math.random()*max)+min);
			},			
			_snapshot = function () {
				//	Clear our previously found blobs
				_blobs = [];
				//	Clear the snapshot canvas
				_snapshotCanvas.ctx.clearRect(0, 0, _snapshotCanvas.width, _snapshotCanvas.height);
				//	Clear the blob canvas
				_blobCanvas.ctx.clearRect(0, 0, _blobCanvas.width, _blobCanvas.height);				
				//	Use the same dimensions as the canvas dimensions
				var width = _canvas.width,
					height = _canvas.height;
				// Create an image if the previous image doesn’t exist
				if (!_snapshotImageData) {
					_snapshotImageData = _canvas.ctx.getImageData(0, 0, width, height);
					_debug('Snapshot taken, press again to see blended results.');
				}
				else {
					//	Get webcam image data
					var sourceData = _canvas.ctx.getImageData(0, 0, width, height);
					//	Create a ImageData instance to receive the blended result
					var blendedData = _canvas.ctx.createImageData(width, height);
					//	Perform the blending
					_differenceAccuracy(blendedData.data, sourceData.data, _snapshotImageData.data);
					//	Put the blend result (between two snapshots) to the snapshot canvas
					_snapshotCanvas.ctx.putImageData(blendedData, 0, 0);
					//	Reset snapshot image data
					_snapshotImageData = false;
					//	Log our found blobs
					if (_blobs.length) {
						console.log('Found blog data:')
						for (var i = 0, l = _blobs.length; i < l; i++) {
							//	Log the blobs info
							var blob = _blobs[i].getInfo();
							//	If a blob contains less then 50 pixels,
							//	we don''t take it seriously (can't be a marker)
							if (blob.pixelCount < 50) {
								continue;
							}
							console.log(blob);
							//	Draw the blog to the blog canvas for debugging
							_blobCanvas.ctx.fillStyle = 'rgb(' + _randomRange(0, 255) + ', ' + _randomRange(0, 255) + ', ' + _randomRange(0, 255) + ')';
							_blobCanvas.ctx.fillRect(blob.x, blob.y, blob.width, blob.height);															
						}
						//	Check if one of the blobs overlaps a spot
						//	Get the pixels in the spot areas
						var spots = _board.getSpots();
						for (var j = 0, l = spots.length; j < l; j++) {
							var spot = spots[j];
							var snapshotData = _snapshotCanvas.ctx.getImageData(spot.x, spot.y, spot.width, spot.height);
							var i = 0; var average = 0;
							//	loop over the pixels
							while (i < (snapshotData.data.length / 4)) {
								//	Make an average between the color channel
								average += (snapshotData.data[i*4] + snapshotData.data[i*4+1] + snapshotData.data[i*4+2]) / 3;
								++i;
							}
							//	Calculate an average between of the color values of the spot area
							average = Math.round(average / (snapshotData.data.length / 4));
							if (average > 10) {
								//	When the average is bigger then the threshold, the spot is taken
								spot.setTaken(true);
							}
							else {
								spot.setTaken(false);
							}
						}						
					}
					_debug('');
				}		
			},
			_update = function () {
				_draw();
				_board.draw();
				setTimeout(_update, 1000/60);
			},
			_draw = function () {
				_canvas.ctx.drawImage(_video, 0, 0, _video.width, _video.height);
			};
		// Public members
		app.apply({
			//	Naming
			name: 'AVLib',
			fullName: 'Augmented Virtuality Library',
			version: '1.0 alpha',
			developers: 'Martin- and Jeroen Reurings',
			init: function () {
				//	Create canvas or get it by id
				if (!canvasId) {
					_canvas = _createCanvas('main-canvas', 320, 240);
				}
				else {
					_canvas = _doc.getElementById(canvasId);
				}
				_canvas.ctx = _canvas.getContext('2d');
				
				//	Create snapshot canvas or get it by id
				if (!snapshotCanvasId) {
					_snapshotCanvas = _createCanvas('snapshot-canvas', _canvas.width, _canvas.height);
				}
				else {
					_snapshotCanvas = _doc.getElementById(snapshotCanvasId);
				}
				_snapshotCanvas.ctx = _snapshotCanvas.getContext('2d');
				
				//	Create blob canvas or get it by id
				if (!blobCanvasId) {
					_blobCanvas = _createCanvas('blob-canvas', _canvas.width, _canvas.height);
				}
				else {
					_blobCanvas = _doc.getElementById(blobCanvasId);
				}
				_blobCanvas.ctx = _blobCanvas.getContext('2d');
				
				//	Create a video tag and fetch the webcam stream
				_setupWebcam();
				//	Setup the virtual (for now) board
				_setupBoard();
				//	Start the update sequence
				_update();				
			},
			setDebug: function (value) {
				_debugMode = value == true ? true : false;
			},
			takeSnapshot: function () {
				_snapshot();
			}
		});
	};
}(window));