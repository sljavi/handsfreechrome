chrome.browserAction.onClicked.addListener(function() {
   chrome.windows.create(
   {
	   'url': 'http://www.google.com',
	   'height': 50, 
	   'width': 50,
	   'left': screen.width - 100,
	   'top': -10
   },
   function(window) {
   });
});