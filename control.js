$(function() {
	var map_is_on = false;
	var zoomLevel = 1.0;
	var bladeRunnerMode = false;
	var scrollSpeed = 800;
	var scrollContainer = $('html, body');
	var currentDirection = null;
	var currentSpeed = null;
	
	$('body').css({ '-webkit-transition': '0.3s ease-in-out' });
	var blurred = false;

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
		if ( direction == "up" ) {operator = "-=";}
		if ( direction == "down" ) {operator = "+=";}
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
	
	var commandCenter = (function () {
		//verifies that method exists before calling it
		this.call = function( command ){ 
			console.log("Page has received command: " + command);
			// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
			// console.log(response.farewell);
			// });
			if (window.location.origin == 'https://handsfreechrome.com/input.html') {
				return -1;
			}
			if ( typeof( this[command] ) === 'function' ) {
				this[command]();
				return 1;
			}
			return 0;
		};
		this.map = function() {
			if (!map_is_on){
				var n = 1;
				$('a').each(function(){
					if ( isScrolledIntoView(this) ) {
						var id = n;
						var a = $(this).offset();
						var destination = $(this).attr('href');
						console.log(destination, n);
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: a.left - 25, top: a.top});
						$('#'+id).click(function(){
							window.location.href = destination;
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
		this.down = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.up = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.right = function() {
			clearMapTags();
			var amount = '+=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.left = function() {
			clearMapTags();
			var amount = '-=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.fall = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.rise = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.back = function() {
			window.history.back();
			return;
		};
		this.forward = function() {
			window.history.forward();
			return;
		};
		this.top1 = function() {
			console.log("called top!");
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $('html,body').offset().top },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		this.bottom = function() {
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $(document).height() },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		this.reload = function() {
			location.reload();
			return;
		};
		this.zoom = function() {
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
		this.zoom_out = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			$('html, body').animate(
				{ zoom: zoomLevel - 0.2 },
				{ duration: 'slow', easing: 'swing' }
			);
			//document.body.style.zoom = zoomLevel - 0.2;
			zoomLevel = zoomLevel - 0.2;
			return;
		};
		this.zoom_normal = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			$('html, body').animate(
				{ zoom: 1.0 },
				{ duration: 'slow', easing: 'swing' }
			);
			zoomLevel = 1.0;
			return;
		};
		this.enhance = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			return;
		};
		this.help = function() {
			console.log("not implemented");
		};
		this.slower = function() {
			if (currentSpeed) {
				currentSpeed += 250;
			}
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		this.faster = function() {
			if (currentSpeed) {
				currentSpeed -= 250;
			}
			if (currentSpeed <= 0) { currentSpeed = 5; }
			console.log(currentSpeed);
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		this.stop = function() {
			scrollContainer.stop();
		};
		this.toggle_BR_mode = function() {
			bladeRunnerMode = !bladeRunnerMode;
		};
		this.keep_scrolling_down = function() {
			startScrolling( "down", scrollSpeed );
		};
		this.keep_scrolling_up = function() {
			startScrolling( "up", scrollSpeed );
		};
		this.keep_scrolling_right = function() {
			console.log("not implemented");
		};
		this.keep_scrolling_left = function() {
			console.log("not implemented");
		};
		return {
			'call'			: call,
			'map'			: map,
			'down'			: down,
			'up'			: up,
			'op'			: up, //misheard word
			'right'			: right,
			'left'			: left,
			'fall'			: fall,
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
	}());
	/*var speakToMe = function(command) {
		console.log("Page has received command: " + command);
		// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
		// console.log(response.farewell);
		// });
		if (window.location.origin == 'https://handsfreechrome.com/input.html') {
			return;
		}
		if (command == "map") {
			if (!map_is_on){
				var n = 1;
				$('a').each(function(){
					if ( isScrolledIntoView(this) ) {
						var id = n;
						var a = $(this).offset();
						var destination = $(this).attr('href');
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: a.left - 25, top: a.top});
						$('#'+id).click(function(){
							window.location.href = destination;
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
		}
		if (command == "down") {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "up" || command == "op") {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "right") {
			clearMapTags();
			var amount = '+=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "left") {
			clearMapTags();
			var amount = '-=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "fall" || command == "song") {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "rise" || command == "frys") {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "back") {
			window.history.back();
			return;
		}
		if (command == "forward") {
			window.history.forward();
			return;
		}
		if (command == "top") {
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $('html,body').offset().top },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		}
		if (command == "bottom") {
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $(document).height() },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		}
		if (command == "reload" || command == "refresh") {
			location.reload();
			return;
		}
		if (command == "zoom") {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(5px)' });
			}
			$('html, body').animate(
				{ zoom: zoomLevel + 0.2 },
				{ duration: 'slow', easing: 'linear' }
			);
			zoomLevel = zoomLevel + 0.2;
			return;
		}
		if (command == "zoom in") {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(5px)' });
			}
			$('html, body').animate(
				{ zoom: zoomLevel + 0.2 },
				{ duration: 'slow', easing: 'swing' }
			);
			zoomLevel = zoomLevel + 0.2;
			return;
		}
		if (command == "zoom out") {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			$('html, body').animate(
				{ zoom: zoomLevel - 0.2 },
				{ duration: 'slow', easing: 'swing' }
			);
			//document.body.style.zoom = zoomLevel - 0.2;
			zoomLevel = zoomLevel - 0.2;
			return;
		}
		if (command == "zoom normal") {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			$('html, body').animate(
				{ zoom: 1.0 },
				{ duration: 'slow', easing: 'swing' }
			);
			zoomLevel = 1.0;
			return;
		}
		if (bladeRunnerMode && command == "enhance") {
			$('body').css({ '-webkit-filter': 'blur(0px)' });
			return;
		}
		if (command == "Blade Runner mode") {
			bladeRunnerMode = !bladeRunnerMode;
		}
		if (command == "keep scrolling down") {
			startScrolling( "down", scrollSpeed );
		}
		if (command == "keep scrolling up") {
			startScrolling( "up", scrollSpeed );
		}
		if (command == "keep scrolling right") {
		
		}
		if (command == "keep scrolling left") {
		
		}
		if (command == "faster") {
			if (currentSpeed) {
				currentSpeed -= 250;
			}
			if (currentSpeed <= 0) { currentSpeed = 5; }
			console.log(currentSpeed);
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		}
		if (command == "slower" || command == "flower") {
			if (currentSpeed) {
				currentSpeed += 250;
			}
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		}
		if (command == "stop") {
			scrollContainer.stop();
			//use to cancel page load/reload OR to stop scrolling
		}
		if (command == "help") {
			//show help page with various commands
		}
		$('#'+command).trigger("click");
		clearMapTags();
		return;
	};*/

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (commandCenter.call(request) == 0) {
				$('#'+request).trigger("click");
				clearMapTags();
			}
			return;
		});
});