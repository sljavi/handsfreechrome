$(function(){
	var menu_items = $('#menu li');
	menu_items.eq(0).on('click', function(){
		document.location.href = '/usage.html';
	})
	menu_items.eq(1).on('click', function(){
		document.location.href = '/development.html';
	})
	menu_items.eq(2).on('click', function(){
		document.location.href = '/donate.html';
	})
	menu_items.eq(3).on('click', function(){
		document.location.href = '/contact.html';
	})
	$('.install_button').on('click', function(){
		chrome.webstore.install("https://chrome.google.com/webstore/detail/ddgmnkioeodkdacpjblmihodjgmebnld");
	});
});