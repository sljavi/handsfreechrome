$(function(){
	var menu_items = $('#menu li');
	menu_items.eq(0).on('click', function(){
		document.location.href = '/usage.html';
	});
	menu_items.eq(1).on('click', function(){
		document.location.href = '/development.html';
	});
	menu_items.eq(2).on('click', function(){
		document.location.href = '/donate.html';
	});
	menu_items.eq(3).on('click', function(){
		document.location.href = '/contact.html';
	});

	var is_mac = navigator.platform.toLowerCase().indexOf('mac') > -1;
	var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	if(is_chrome){
		$('#install_button').css('display', 'block');
		$('.quick_start').show();
		if(is_mac){
			$('.mac_warning').show();
		}
	} else {
		$('.not_using_chrome').show();
	}

	$('#install_button').on('click', function(){
		if(is_chrome){
			chrome.webstore.install("https://chrome.google.com/webstore/detail/ddgmnkioeodkdacpjblmihodjgmebnld");
		} else {
			window.alert("You're not using the Chrome browser!")
		}
	});
});