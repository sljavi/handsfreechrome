var speakToMe = function() {
	if ('webkitSpeechRecognition' in window) {
		//alert("progress");
		var recognition = new webkitSpeechRecognition();
		var result = null;
		recognition.onresult = function(event) {
		  if (event.results.length > 0) {
			q.value = event.results[0][0].transcript;
			result = event.results[0][0].transcript;
		  }
		  if (result == "map"){
			// var n = 1;
			// $('a').each(function(){
				// if (isScrolledIntoView(this)){
					// var id = n;
					// var a = $(this).offset();
					// $('body').append('<span id="' + id + '" style="background:white; position:absolute; z-index:999;">' + id + '</span>');
					// $('#'+id).css({left: a.left, top: a.top});
					// n++;
				// }
			// });
		  }
		}
		recognition.start();
	}
	else {
		alert("nope");
	}
};

$(function() {
	$('#speaker').click(function(){
		speakToMe();
	});
});