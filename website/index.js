$(function(){
	var is_mac = navigator.platform.toLowerCase().indexOf('mac') > -1;
	var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	if(is_chrome){
		$('#install_button').css('display', 'inline-block');
		$('.quick_start').css('display', 'inline-block');
		if(is_mac){
			$('.mac_warning').css('display', 'inline-block');
		}
	} else {
		$('#not_using_chrome').css('display', 'inline-block');
	}

	$('#install_button').on('click', function(){
		if(is_chrome){
			chrome.webstore.install("https://chrome.google.com/webstore/detail/ddgmnkioeodkdacpjblmihodjgmebnld");
		} else {
			window.alert("You're not using the Chrome browser!")
		}
	});
});