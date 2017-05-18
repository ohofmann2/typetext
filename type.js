;
(function($) {
	$.fn.typetext.defaults = {
		"callback": null,
		"stop-cursor-after": 0,

		"text": [ "" ],
		"start-delay": [ 0 ],
		"speed": [ 35 ],
		"pause": [ 500 ],
		"delete-speed": [ 60 ],
	};

	$.fn.typetext = function(options) {
		var obj = $(this);
		var self = this;
		var opts = $.extend( {}, $.fn.typetext.defaults, options );

		if (Array.isArray(opts.text) == false) {
			opts.text = [opts.text];
		}

		if (opts.text.length == 1 && (opts.text[0] == undefined || opts.text[0].length==0)) {
			opts.text = [ obj.data('typetext-text') || obj.html() ];
		} else if (Array.isArray(opts.text) == false) {
			opts.text = [opts.text];
		}

		//Override values with values from the dom (if applicable)
		if (value = obj.data('typetext-start-delay')) { opts['start-delay'] = value; }
		if (value = obj.data('typetext-speed')) { opts['speed'] = value; }
		if (value = obj.data('typetext-pause')) { opts['pause'] = value; }
		if (obj.data('typetext-stop-cursor-after') == 1) { opts['stop-cursor-after'] = 1; }

		//Make sure all options relevant to typing match the text count
		//First - turn them into arrays if they are not
		opts['start-delay'] = (Array.isArray(opts['start-delay'])) ? opts['start-delay'] : [opts['start-delay']];
		opts['speed'] = (Array.isArray(opts['speed'])) ? opts['speed'] : [opts['speed']];
		opts['pause'] = (Array.isArray(opts['pause'])) ? opts['pause'] : [opts['pause']];
		opts['delete-speed'] = (Array.isArray(opts['delete-speed'])) ? opts['delete-speed'] : [opts['delete-speed']];

		//Now check length of text - if > 1 need to make sure each option matches count
		//	Using element 0 to fill in extras
		if ((correctCount = opts.text.length) > 1) {
			for (i = opts['speed'].length; i < correctCount; i++) opts['speed'].push(opts['speed'][0]);
			for (i = opts['pause'].length; i < correctCount; i++) opts['pause'].push(opts['pause'][0]);
			for (i = opts['delete-speed'].length; i < correctCount; i++) opts['delete-speed'].push(opts['delete-speed'][0]);
		}

		//Make sure within reasonable values
		for (var i in opts['speed'])
			if (opts['speed'][i] <= 5) opts['speed'][i] = 5;

		for (var i in opts['delete-speed'])
			if (opts['delete-speed'][i] <= 5) opts['delete-speed'][i] = 5;

		//CURSOR VARIABLES AND FUNCTIONS
		this.cursorBlink = function() { obj.addClass("typetext-cursor-blink"); obj.removeClass("typetext-cursor-on"); }
		this.cursorStop = function() { obj.removeClass("typetext-cursor-blink"); obj.removeClass("typetext-cursor-on"); }
		this.cursorOn = function() { obj.removeClass("typetext-cursor-blink"); obj.addClass("typetext-cursor-on"); }

		//Should be blinking by default
		this.cursorBlink();

		//TYPING VARIABLES AND FUNCTIONS
		var runObjects = [];
		for (var i in opts.text) {
			runObjects[i] = {
				'text': opts.text[i],
				'start-delay': opts['start-delay'][i],
				'speed': opts.speed[i],
				'pause': opts.pause[i],
				'delete-speed': opts['delete-speed'][i],
			};
		};

		var pointer = 0;
		var lastPointer = runObjects.length - 1;
		var mode = 'type';

		this.manageTyping = function() {
			var object = runObjects[pointer];
			if (mode == 'type') {
				mode = 'clean';
				self.typeText(object);
			} else {
				if (pointer < lastPointer) {
					mode = 'type';
					self.deleteText(object);
					pointer++;
				} else {
					setTimeout(function() {
						if (opts['stop-cursor-after'] == 1)
							self.cursorStop();

						if (typeof opts['callback'] === 'function')
							opts['callback']();
					}, object['pause']);
				}
			}
		}

		this.typeText = function(object) {
			setTimeout(function() {
				self.cursorOn();
				typeInterval = setInterval(function() {
					var curVal = obj.html();
					var newLength = curVal.length + 1;
					obj.html(object.text.substr(0, newLength));

					if (newLength == object.text.length) {
						clearInterval(typeInterval);
						self.cursorBlink();
						self.manageTyping();
					}
				}, object['speed']);
			}, object['start-delay']);
		}

		this.deleteText = function(object) {
			setTimeout(function() {
				self.cursorOn();
				var deleteInterval = setInterval(function() {
					var curVal = obj.html();
					var newLength = curVal.length-1;
					obj.html(curVal.substr(0, newLength));
					if (newLength == 0) {
						clearInterval(deleteInterval);
						self.cursorBlink();
						self.manageTyping();
					}
				}, object['delete-speed']);
			}, object['pause'])
		}

		this.manageTyping();

		return this;
	};
})(jQuery);
