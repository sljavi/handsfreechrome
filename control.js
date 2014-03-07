$(function() {
	var map_is_on = false;
	var zoomLevel = 1.0;
	var dictation_mode = false;
	var bladeRunnerMode = false;
	
	var scrollSpeed = 800;
	var scrollContainer = $('html, body');
	var currentDirection = null;
	var currentSpeed = null;
	
	var lastMessage = null;
	var lastTime = (new Date()).getTime();
	var commandDelay = null;
	
	$('body').css({ '-webkit-transition': '0.3s ease-in-out' });
	var blurred = false;

	function contains(a, obj) {
	    for (var i = 0; i < a.length; i++) {
	        if (a[i] === obj) {
	            return true;
	        }
	    }
	    return false;
	}	

	if (typeof String.prototype.startsWith !== 'function') {
		String.prototype.startsWith = function (str){
			return this.slice(0, str.length) === str;
		};
	}
	if (typeof String.prototype.endsWith !== 'function') {
		String.prototype.endsWith = function (str){
			return this.slice(-str.length) === str;
		};
	}

	function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
		  && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
	}

	function clearMapTags() {
		$('.numTag').remove();
		map_is_on = false;
	}
	
	function startScrolling( direction, speed ) {
		if ( direction === "up" ) {operator = "-=";}
		if ( direction === "down" ) {operator = "+=";}
		currentDirection = direction;
		currentSpeed = speed;
		scrollContainer.stop();
		scrollContainer.animate(
			{scrollTop: operator + document.body.scrollHeight},
			{
				duration: speed * document.body.scrollHeight / 50,
				easing: 'linear',
				complete: function() { currentSpeed = null; }
			}
		);
	}
	
	function switch_mode(turn_on) {
		console.log("mode switched");
		if (turn_on) {
			dictation_mode = true;
		} else {
			dictation_mode = false;
		}
		chrome.runtime.sendMessage({greeting: {dictModeOn : dictation_mode} }, function(response) {
			console.log(response);
		});
	}
			
	function inform_input_page(turn_on) {
		document.getElementById('modeSwitch').click();
	}

	//encapsulates all user command functionality involving DOM manipulation
	var commandCenter = new (function () {
		var map = function() {
			if (!map_is_on){
				var n = 1;
				$('a,button,input,img').each(function(){
					if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
						var id = n;
						var a = $(this).offset();									
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: a.left - 25, top: a.top});
						
						var self = this;
						switch( this.tagName)
						{
						case 'A':
							$('#'+id).click(function(){
								setTimeout(function() { self.click(); }, 10);
							});
							break;
						case 'IMG':
							$('#'+id).click(function(){
								setTimeout(function() { self.click(); }, 10);
							});
							break;
						case 'BUTTON':
							$('#'+id).click(function(){
								self.click();
							});
							break;
						//needs to only switch_mode on certain types of input, not all
						case 'INPUT':
							$('#'+id).click(function(){
								self.focus();
								switch_mode(true);
							});
							break;
						}
						n++;
					}
				});
				map_is_on = true;
				return;
			}
			else {
				clearMapTags();
				return;
			}
		};
		//change to 'guide' or something
		var other = function() {
			if (!map_is_on){
				var n = 1;
				$('span, li').each(function(){
					if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
						var id = n;
						var offset = $(this).offset();
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: offset.left - 25, top: offset.top});
						var span = this;
						$('#'+id).click(function(){
							setTimeout(function() { span.click(); }, 10);
						});
						n++;
					}
				});
				map_is_on = true;
				return;
			}
			else {
				clearMapTags();
				return;
			}
		};
		//we're going to have to make it an added function of this extension that whenever chrome says "oops did you mean..." it auto-redirects to google or something
		//otherwise the extension stops working completely because there's no control script because we're not on an http page
		var go_to = function(destination) {
			if (destination === "undefined") {
				console.log("skipping a fake");
				return;
			}
			if ( !destination.endsWith(".com") && !destination.endsWith(".edu") && !destination.endsWith(".gov") && !destination.endsWith(".org") ) {
				if (destination.endsWith(".") ) {
					destination = destination.slice(0,-1);
				}
				destination += ".com";
			}
			console.log("about to go to " + destination);
			window.location.href = "http://www." + destination;
		};
		var home = function() {
			window.location.href = "https://www.google.com";
		}
		var down = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var up = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var right = function() {
			clearMapTags();
			var amount = '+=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var left = function() {
			clearMapTags();
			var amount = '-=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var fall = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var rise = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var back = function() {
			window.history.back();
			return;
		};
		var forward = function() {
			window.history.forward();
			return;
		};
		//top1 instead of 'top' because 'top' is kind of
		//like a semi-reserved word...using it causes issues.
		var top1 = function() {
			console.log("called top!");
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $('html,body').offset().top },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		var bottom = function() {
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $(document).height() },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		var reload = function() {
			location.reload();
			return;
		};
		var zoom = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(5px)' });
			}
			$('html, body').animate(
				{ zoom: zoomLevel + 0.2 },
				{ duration: 'slow', easing: 'linear' }
			);
			zoomLevel = zoomLevel + 0.2;
			return;
		};
		var zoom_out = function() {
			$('body').css({ '-webkit-filter': 'blur(0px)' });
			$('html, body').animate(
				{ zoom: zoomLevel - 0.2 },
				{ duration: 'slow', easing: 'swing' }
			);
			//document.body.style.zoom = zoomLevel - 0.2;
			zoomLevel = zoomLevel - 0.2;
			return;
		};
		var zoom_normal = function() {
			$('body').css({ '-webkit-filter': 'blur(0px)' });
			$('html, body').animate(
				{ zoom: 1.0 },
				{ duration: 'slow', easing: 'swing' }
			);
			zoomLevel = 1.0;
			return;
		};
		var enhance = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			return;
		};
		var help = function() {
			console.log("not implemented");
		};
		var slower = function() {
			if (currentSpeed) {
				currentSpeed += 250;
			}
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		var faster = function() {
			if (currentSpeed) {
				currentSpeed -= 250;
			}
			if (currentSpeed <= 0) { currentSpeed = 5; }
			console.log(currentSpeed);
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		var stop = function() {
			scrollContainer.stop();
		};
		var toggle_BR_mode = function() {
			bladeRunnerMode = !bladeRunnerMode;
		};
		var keep_scrolling_down = function() {
			startScrolling( "down", scrollSpeed );
		};
		var keep_scrolling_up = function() {
			startScrolling( "up", scrollSpeed );
		};
		var keep_scrolling_right = function() {
			console.log("not implemented");
		};
		var keep_scrolling_left = function() {
			console.log("not implemented");
		};

		this.call = function( command ){
			var key = {
				'map'			: map,
				'other'			: other,
				'go_to'			: go_to,
				'home'			: home,
				'down'			: down,
				'up'			: up,
				'op'			: up,   //misheard word
				'right'			: right,
				'left'			: left,
				'fall'			: fall,
				'full'			: fall, //misheard word
				'song'			: fall, //misheard word
				'rise'			: rise,
				'frys'			: rise, //misheard word
				'back'			: back,
				'forward'		: forward,
				'top'			: top1,
				'bottom'		: bottom,
				'reload'		: reload,
				'refresh'		: reload,
				'zoom'			: zoom,
				'zoom in'		: zoom,
				'zoom out'		: zoom_out,
				'zoom normal'	: zoom_normal,
				'enhance'		: enhance,
				'help'			: help,
				'slower'		: slower,
				'faster'		: faster,
				'stop'			: stop,
				'Blade Runner mode'		: toggle_BR_mode,
				'keep scrolling down'	: keep_scrolling_down,
				'keep scrolling up'		: keep_scrolling_up,
				'keep scrolling right'	: keep_scrolling_right,
				'keep scrolling left'	: keep_scrolling_left
			};
			console.log("Page has received command: " + command);
			if (window.location.origin === 'https://handsfreechrome.com/input.html') {
				return -1;
			}
			if ( command.split(" ")[0] + command.split(" ")[1] === "goto" ) {
				console.log("calling goto");
				console.log(command.split(" ")[2]);
				key.go_to(command.split(" ")[2]);
			}
			if ( typeof key[command]  === 'function' ) {
					console.log("calling it");
					key[command]();
				return 1;
			}
			return 0;
		};
	})();

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log("got a message: " + request);
			if (request === lastMessage && (new Date()).getTime() - lastTime < 1000 ) {
				return;
			}
			lastMessage = request;
			lastTime = (new Date()).getTime();
			if (window.location.href === 'https://handsfreechrome.com/input.html') {
				inform_input_page(request.dictModeOn);
				return;
			}
			if (request === "CHROME_DICTATION_END") {
				dictation_mode = false;
				console.log("trying to submit");
				$(document.activeElement).parents('form:first').submit();
			}
			if (!dictation_mode) {
				if (request.startsWith("zoom")) {
					clearTimeout(commandDelay);
					commandDelay = setTimeout(function(){
						commandCenter.call(request);
					}, 1000);
				}
				if (commandCenter.call(request) === 0) {
					if (request === "att") request = "8";
					if (request === "sex") request = "6";
					clearTimeout(commandDelay);
					commandDelay = setTimeout(function(){
						$('#'+request).trigger("click");
						clearMapTags();
					}, 1000);
				}
			} else {
				console.log(document.activeElement);
				console.log("the request is: " + request);
				console.log("the value is: " + document.activeElement.value);
				if (document.activeElement.value === undefined) {
					document.activeElement.value = "" + request;
				} else {
					document.activeElement.value +=  " " + request;
				}
			}
		}
	);
});