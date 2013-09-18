var map_is_on = false;

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
	if (command == "map") {
		if (!map_is_on){
			var n = 1;
			$('a').each(function(){
				if (isScrolledIntoView(this) /*&& isn't hidden slash is visible*/){
					var id = n;
					var a = $(this).offset();
					var destination = $(this).attr('href');
					$('body').append('<span class="numTag" id="' + id + '" style="background:white; position:absolute; z-index:999;">' + id + '</span>');
					$('#'+id).css({left: a.left, top: a.top});
					$('#'+id).click(function(){
						window.location.href = destination;
					});
					n++;
				}
			});
			map_is_on = true;
		}
		else {
			clearMapTags();
		}
	}
	if (command == "down") {
		clearMapTags();
		console.log("scrollin'");
		window.scrollBy(0,200);
	}
	if (command == "up") {
		clearMapTags();
		console.log("scrollin' up");
		window.scrollBy(0,-200);
	}
	if (command == "fall") {
		clearMapTags();
		console.log("falling");
		window.scrollBy(0, window.innerHeight);
	}
	if (command == "rise" || command == "frys") {
		clearMapTags();
		console.log("rising");
		window.scrollBy(0, -window.innerHeight);
	}
	if (command == "back") {
		window.history.back();
	}
	if (command == "top") {
		clearMapTags();
		window.scrollTo(0, 0);
	}
	if (command == "bottom") {
		clearMapTags();
		window.scrollTo(0, document.body.scrollHeight);
	}
	else {
		$('#'+command).trigger("click");
	}
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	console.log(request);
	speakToMe(request);
  });