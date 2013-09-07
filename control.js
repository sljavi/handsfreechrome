var map_is_on = false;

function isScrolledIntoView(elem)
{
	var docViewTop = $(window).scrollTop();
	var docViewBottom = docViewTop + $(window).height();

	var elemTop = $(elem).offset().top;
	var elemBottom = elemTop + $(elem).height();

	return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
	  && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
}

var speakToMe = function() {

	chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
	console.log(response.farewell);
	});

	// if (!map_is_on){
		// var n = 1;
		// $('a').each(function(){
			// if (isScrolledIntoView(this) /*&& isn't hidden slash is visible*/){
				// var id = n;
				// var a = $(this).offset();
				// var destination = $(this).attr('href');
				// $('body').append('<span class="numTag" id="' + id + '" style="background:white; position:absolute; z-index:999;">' + id + '</span>');
				// $('#'+id).css({left: a.left, top: a.top});
				// $('#'+id).click(function(){
					// window.location.href = destination;
				// });					
				// n++;
			// }
		// });
		// map_is_on = true;
	// }
	// else {
		// $('.numTag').remove();
		// map_is_on = false;
	// }
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	console.log(request);
  });
/*
if that works, messaging is next. background.js picks up the messages and
distributes them. try to establish communication between background.js
and the content script. this is the hardest part.
*/
/*once that works, try detecting what page we're on.
background.js needs to be in some sort of continuous event loop,
picking up messages from handsfree.com window and alerting them.
*/
/*
write handsfree.com
*/
/*
debug and polish
*/
/*
publish
*/

$(function() {
	$('body').prepend('<button id="speaker">CLICK ME</button>');
	
	$('#speaker').click(function(){
		speakToMe();
	});
});