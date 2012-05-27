function addOnload (method) {
	var oldOnload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = method;
	}
	else {
		window.onload = function() {
			if (oldOnload) {
				oldOnload();
			};
			method();
		};
	};
};

var debug = function (message) {
	var debugDiv = document.getElementById('debug');
	debugDiv.innerHTML = message;
};

//	Init AV Project
addOnload(function () {
	
	//	AVLib core
	AVLib(function () {
		var _this = this;
		_this.setDebug(true);
		_this.init();
		
		//	Add event listeners
		document.getElementById('btn-snapshot').addEventListener('click', function () {_this.takeSnapshot();});
		
	}, 'main-canvas', 'snapshot-canvas', 'blob-canvas');
	
});