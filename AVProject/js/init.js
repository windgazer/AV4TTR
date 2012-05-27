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
		
		//	Add event module
		var Event = {};
		Event.listeners = [],
		Event.listen = function (name, callback) {
			Event.listeners.push({"name": name, "callback": callback});
			return [name,callback];
		},
		Event.forget = function (eventname) {
			for (x=0;x<Event.listeners.length;x++) {
				if (Event.listeners[x].name == eventname) {
					Event.listeners.splice(x, 1);
				}
			}
		},
		Event.call = function (name, args) {
			var temp = [];
			if (Event.listeners.length > 0) {
				for (var x=0;x<Event.listeners.length;x++) {
					if(Event.listeners[x].name == name) {
						temp.push({"fn":Event.listeners[x].callback});
					}
				}
				for (x=0;x<temp.length;x++) {
					temp[x].fn.apply(this,[args]);
				}
			}
		};
		AVLib.addModule('event', Event );
		
		document.getElementById('btn-snapshot').addEventListener('click', function () {_this.takeSnapshot();});
		
	}, 'main-canvas', 'blend-canvas', 'snapshot-canvas');
	
});