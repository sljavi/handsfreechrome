$(function(){
	var isMac = navigator.platform.toLowerCase().indexOf('mac') > -1;
	var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	if (isChrome) {
		$('#install-button').css('display', 'inline-block');
		$('.quick-start').css('display', 'inline-block');
		if (isMac) {
			$('.mac-warning').css('display', 'inline-block');
		}
	} else {
		$('#not-using-chrome').css('display', 'inline-block');
	}

	$('#install-button').on('click', function(){
		if (isChrome) {
			chrome.webstore.install("https://chrome.google.com/webstore/detail/ddgmnkioeodkdacpjblmihodjgmebnld");
		} else {
			window.alert("You're not using the Chrome browser!")
		}
	});
});