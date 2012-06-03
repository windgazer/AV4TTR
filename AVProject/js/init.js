var addOnload = (function (window) {
    return function (method) {
        var oldOnload = window.onload;
        if (typeof window.onload != 'function') {
            window.onload = method;
        }
        else {
            window.onload = function() {
                if (oldOnload) {
                    oldOnload();
                }
                method();
            };
        }
    };
}(window));

var debug = function (message) {
	var debugDiv = document.getElementById('debug');
	debugDiv.innerHTML = message;
};

//	Init AV Project
addOnload(function () {

	//	AVLib core
	AVLib(function () {
		var _this = this;
		_this.init();

	}, document.getElementById('main-canvas'), document.getElementById('video'));

});