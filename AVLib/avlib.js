var AVLib = (function (window) {
	'use strict';
	return function (app, canvasId, blendCanvasId, snapshotCanvasId) {
		//	Private members
		var _doc = window.document,
			_nav = window.navigator,
			_debugMode = false,
			_video = null,
			_canvas = null,
			_blendCanvas = null,
			_snapshotCanvas = null,
			_snapshotImageData = false,
			_lastImageData = false,
			_arDetector = new AR.Detector(),
			_arMarkers = null,
			_blobs = [],
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
			_fastAbs = function (value) {
				return (value ^ (value >> 31)) - (value >> 31);
			},
			_threshold = function (value) {
				return (value > 0x15) ? 0xFF : 0;
			},
			_differenceAccuracy1 = function (target, data1, data2) {
				if (data1.length != data2.length) {
					return null;
				}	
				var i = 0;
				while (i < (data1.length * 0.25)) {
					var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
					var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
					var diff = _threshold(_fastAbs(average1 - average2));
					target[4*i] = diff;
					target[4*i+1] = diff;
					target[4*i+2] = diff;
					target[4*i+3] = 0xFF;
					++i;
				}
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

					//console.log(diff);
					if (diff == 255) {

						y = Math.floor(i / 640);
						x = i - (y * 640);
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
			_blend = function () {
				var width = _canvas.width;
				var height = _canvas.height;
				// get webcam image data
				var sourceData = _canvas.ctx.getImageData(0, 0, width, height);
				// create an image if the previous image doesn’t exist
				if (!_lastImageData) {
					_lastImageData = _canvas.ctx.getImageData(0, 0, width, height);
				}
				// create a ImageData instance to receive the blended result
				var blendedData = _canvas.ctx.createImageData(width, height);
				// blend the 2 images
				_differenceAccuracy(blendedData.data, sourceData.data, _lastImageData.data);
				// draw the result in a canvas
				_blendCanvas.ctx.putImageData(blendedData, 0, 0);
				// store the current webcam image
				_lastImageData = sourceData;
			},
			_snapshot = function () {
				//	Clear the snapshot canvas
				_snapshotCanvas.ctx.clearRect(0, 0, _snapshotCanvas.width, _snapshotCanvas.height);
				
				var width = _canvas.width;
				var height = _canvas.height;

				// create an image if the previous image doesn’t exist
				if (!_snapshotImageData) {
					_snapshotImageData = _canvas.ctx.getImageData(0, 0, width, height);
				}
				else {
					// get webcam image data
					var sourceData = _canvas.ctx.getImageData(0, 0, width, height);
					// create a ImageData instance to receive the blended result
					var blendedData = _canvas.ctx.createImageData(width, height);
					// perform the blending
					_differenceAccuracy(blendedData.data, sourceData.data, _snapshotImageData.data);
					// put the blend result (between two snapshots) to the snapshot canvas
					_snapshotCanvas.ctx.putImageData(blendedData, 0, 0);
					// reset snapshot image data
					_snapshotImageData = false;
					
					console.log(_blobs[0].getInfo());
					console.log(_blobs[1].getInfo());
					console.log(_blobs[2].getInfo());
				}		
			},
			_getMarkers = function () {
				_arMarkers = _arDetector.detect(_canvas.ctx.getImageData(0, 0, _canvas.width, _canvas.height));
				if (_debugMode) {
					_debugMarkers();
				}
			},
			_debugMarkers = function () {
				var debug = _doc.getElementById('debug');
				var tableHTML = "";
				tableHTML += '<table border="1" cellspacing="0" cellpadding="5">';
				tableHTML += '<tr><th>Marker ID</th><th>Corner pos</th></tr>';
				for (var i = 0, ln = _arMarkers.length; i < ln; ++i) {
					tableHTML += '<tr>';
					tableHTML += '<td>' + _arMarkers[i].id + '</td>';
					tableHTML += '<td>' + _arMarkers[i].corners[0].x + ', ' + _arMarkers[i].corners[0].y + '</td>';
					tableHTML += '</tr>';
				}
				tableHTML += '</table>';
				debug.innerHTML = tableHTML;
			},
			_update = function () {
				_draw();
				//_blend();
				//_getMarkers();
				
				//	Use get animationtimer?
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
			log: function (message) {
				if (window.console) {
					console.log(message);
				}
				else {
					_debug(message);
				}
			},
			init: function () {
				if (!canvasId) {
					_canvas = _createCanvas('main-canvas', 640, 480);
				}
				else {
					_canvas = _doc.getElementById(canvasId);
				}
				_canvas.ctx = _canvas.getContext('2d');				
				if (_debugMode) {
					if (!blendCanvasId) {
						_blendCanvas = _createCanvas('blend-canvas', _canvas.width, _canvas.height);
					}
					else {
						_blendCanvas = _doc.getElementById(blendCanvasId);
					}
					_blendCanvas.ctx = _blendCanvas.getContext('2d');
					if (!snapshotCanvasId) {
						_snapshotCanvas = _createCanvas('snapshot-canvas', _canvas.width, _canvas.height);
					}
					else {
						_snapshotCanvas = _doc.getElementById(snapshotCanvasId);
					}
					_snapshotCanvas.ctx = _snapshotCanvas.getContext('2d');
				}
				_canvas.ctx.translate(_canvas.width, 0); _canvas.ctx.scale(-1, 1);
				_setupWebcam();
				_update();
			},
			setDebug: function (value) {
				_debugMode = value == true ? true : false;
			},
			takeSnapshot: function () {
				_snapshot();
				//	console.log(_arMarkers);
			}
		});
	};
}(window));

//	Additional AVLib modules
AVLib.modules = {};
AVLib.addModule = function (name, module) {
	AVLib.modules[name] = module;
};