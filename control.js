$(function() {
	var map_is_on = false;
	var zoomLevel = 1.0;
	var bladeRunnerMode = false;
	var scrollSpeed = 800;
	var scrollContainer = $('html, body');
	
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

	var speakToMe = function(command) {
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
			clearMapTags();
			var amount = '+=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "up" || command == "op") {
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
		if (command == "fall") {
			clearMapTags();
			var amount = '+=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		}
		if (command == "rise" || command == "frys") {
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
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $('html,body').offset().top },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		}
		if (command == "bottom") {
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
			scrollContainer.animate(
				{scrollTop: '+=' + document.body.scrollHeight},
				{
					duration: 800 * document.body.scrollHeight / 50,
					easing: 'linear'
				}
			);
		}
		if (command == "keep scrolling up") {
			scrollContainer.animate(
				{scrollTop: '-=' + document.body.scrollHeight},
				{
					duration: 800 * document.body.scrollHeight / 50,
					easing: 'linear'
				}
			);
		}
		if (command == "keep scrolling right") {
		
		}
		if (command == "keep scrolling left") {
		
		}
		if (command == "faster" && scrolling) {
			scrollContainer.stop();
		}
		if (command == "slower" && scrolling) {
			scrollSpeed += 250;
			if (scrollSpeed >= 9000) {
				alert("IT'S OVER 9000!!!! YOU CAN'T SCROLL THAT SLOW!!");
				scrolling = false;
			}
		}
		if (command == "stop") {
			scrollContainer.stop();
			//use to cancel page load/reload OR to stop scrolling
		}
		if (command == "help") {
		
		}
		if (command == "minimize") {
		
		}
		$('#'+command).trigger("click");
		clearMapTags();
		return;
	};

	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
		speakToMe(request);
	  });
});