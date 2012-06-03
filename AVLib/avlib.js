var AVLib = (function (window) {
	'use strict';
	return function (app, canvas, video) {
		//	Private members
		var _doc = window.document,
			_nav = window.navigator,
			_video = null,
			_canvas = null,
			_detector = null,
			_markers = null,
			_board = new AVBoard(),
			_debug = function (message) {
				var debugDiv = _doc.getElementById('debug');
				if (!debugDiv) {
					debugDiv = _doc.createElement('div');
					debugDiv.id = 'debug';
				}
				debugDiv.innerHTML = message;
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
				alert('A webcam error occurred.');
			},
			_setupWebcam = function () {
				if (_hasGetUserMedia()) {
					_video = video;
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
				} else {
					_getUserMediaError();
				}
			},
			_setupAR = function () {
                _detector = new AR.Detector();
			},
			_setupBoard = function () {
				_board.setPmLB(682);
				_board.setPmRT(213);
			},
			_randomRange = function (min, max) {
				return Math.floor((Math.random()*max)+min);
			},
			_draw = function () {
				_canvas.ctx.drawImage(_video, 0, 0, _video.width, _video.height);
			},
			_drawMarkers = function (markers, context, pm) {
				var corners, corner, i, j;
				context.lineWidth = 3;

				for (i = 0; i !== markers.length; ++ i) {
					if (markers[i].id == pm[0] || markers[i].id == pm[1] ) {
						continue;
					}
					corners = markers[i].corners;

					context.strokeStyle = "red";
					context.beginPath();

					for (j = 0; j !== corners.length; ++ j){
					  corner = corners[j];
					  context.moveTo(corner.x, corner.y);
					  corner = corners[(j + 1) % corners.length];
					  context.lineTo(corner.x, corner.y);
					}

					context.stroke();
					context.closePath();

					context.fillStyle = "green";
					context.fillRect(corners[0].x - 3, corners[0].y - 3, 6, 6);

					context.fillStyle = "yellow";
					context.fillRect(corners[1].x - 3, corners[1].y - 3, 6, 6);

					context.fillStyle = "blue";
					context.fillRect(corners[2].x - 3, corners[2].y - 3, 6, 6);

					context.fillStyle = "purple";
					context.fillRect(corners[3].x - 3, corners[3].y - 3, 6, 6);
				}
		    },
            _update = function () {
                _draw();
                var pm = [_board.getPmLB(), _board.getPmRT()];
                _markers = _detector.detect(_canvas.ctx.getImageData(0, 0, _canvas.width, _canvas.height));
                //	Visualise the found markers (excluding the position ones)
                //	Use canvas for now, SVG later on...
                _drawMarkers(_markers, _canvas.ctx, pm);
                if (_markers.length) {
					var found = 0,
						pmLB = null,
						pmRT = null;
                    for (var i=0, l=_markers.length; i<l; ++i) {
                        var marker = _markers[i];
						//	Left bottom
						if (marker.id == pm[0]) {
							pmLB = marker;
							++found;
						}
						//	Right top
						if (marker.id == pm[1]) {
							pmRT = marker;
							++found;
						}
						//	Break the loop if both position markers are found
						if (found == 2) {
							break;
						}
                    }
                    if (pmLB != null && pmRT != null) {
	                    _board.setX(pmLB.corners[1].x);
	                    _board.setY(pmRT.corners[0].y);
	                    _board.setWidth(pmRT.corners[0].x - pmLB.corners[1].x);
	                    _board.setHeight(pmLB.corners[1].y - pmRT.corners[0].y);
	                    _board.draw(_canvas.ctx);
                    }
                }
                setTimeout(_update, 1000/60);
            };
		// Public members
		app.apply({
			name: 'AVLib',
			fullName: 'Augmented Virtuality Library',
			version: '1.0 alpha',
			developers: 'Martin- and Jeroen Reurings',
			init: function () {
				_canvas = canvas;
				_canvas.ctx = _canvas.getContext('2d');
				//_canvas.ctx.translate(_canvas.width, _canvas.height);
				//_canvas.ctx.scale(-1, -1);
				_setupWebcam();
				_setupAR();
				_setupBoard();
				_update();
			},
			showInfo: function () {
				console.log(_board.getInfo());
			}
		});
	};
}(window));