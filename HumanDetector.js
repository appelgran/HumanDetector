//

function HumanDetector(options) {
	this._storage = options === undefined || options.storage === false ? undefined : options.storage;
	this.hasDetected = {
		mouse: false,
		keyboard: false,
		touch: false,
		any: false
	};
	this._subscribers = [];
	if (options !== undefined && options.subscriber !== undefined) {
		this._subscribers.push(options.subscriber);
	}

	if (this._storage !== undefined) {
		this._readStorage();
		if (this.hasDetected.any) {
			this._broadcast();
		}
	}
	
	//
	// these event handlers requires the _this variable (their this will be document)
	
	var _this = this;
	
	this._mouseDetected = function() {
		_this.hasDetected.mouse = true;
		_this._newDetection();
		_this._removeEventListener(document, "mousemove", _this._mouseDetected);
	};

	this._keyboardDetected = function() {
		_this.hasDetected.keyboard = true;
		_this._newDetection();
		_this._removeEventListener(document, "keydown", _this._keyboardDetected);
	};

	this._touchDetected = function() {
		_this.hasDetected.touch = true;
		_this._newDetection();
		_this._removeEventListener(document, "touchmove", _this._touchDetected);
		_this._removeEventListener(document, "touchstart", _this._touchDetected);
	};
	
	//
	
	this._start();
}

HumanDetector.prototype._readStorage = function() {
	if (this._storage && this._storage["HumanDetector"]) {
		this.hasDetected.mouse = this._storage["HumanDetector"][0] === "1";
		this.hasDetected.keyboard = this._storage["HumanDetector"][1] === "1";
		this.hasDetected.touch = this._storage["HumanDetector"][2] === "1";
		this.hasDetected.any = this.hasDetected.mouse || this.hasDetected.keyboard || this.hasDetected.touch;
	}
};

HumanDetector.prototype._writeToStorage = function() {
	if (this._storage) {
		this._storage["HumanDetector"] = (this.hasDetected.mouse ? "1" : "0") +
			(this.hasDetected.keyboard ? "1" : "0") + 
			(this.hasDetected.touch ? "1" : "0");
	}
};

HumanDetector.prototype._broadcast = function() {
	for (var x = 0; x < this._subscribers.length; x++) {
		this._subscribers[x](this);
	}
};

HumanDetector.prototype._newDetection = function() {
	this.hasDetected.any = this.hasDetected.mouse || this.hasDetected.keyboard || this.hasDetected.touch;
	this._writeToStorage();
	this._broadcast();
};

HumanDetector.prototype._start = function() {
	if (!this.hasDetected.mouse) {
		this._addEventListener(document, "mousemove", this._mouseDetected);
	}
	if (!this.hasDetected.keyboard) {
		this._addEventListener(document, "keydown", this._keyboardDetected);
	}
	if (!this.hasDetected.touch) {
		this._addEventListener(document, "touchmove", this._touchDetected);
		this._addEventListener(document, "touchstart", this._touchDetected);
	}
};
	
HumanDetector.prototype._addEventListener = function(element, event, handler) {
	if (element.addEventListener) {
		element.addEventListener(event, handler, false);
	}
	else {
		element.attachEvent("on" + event, handler);
	}
};
	
HumanDetector.prototype._removeEventListener = function(element, event, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(event, handler);
	}
	else {
		element.detachEvent("on" + event, handler);
	}
};
