chrome.browserAction.onClicked.addListener(function() {
   chrome.windows.create({'url': 'http://www.google.com'}, function(window) {
   });
});