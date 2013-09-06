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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	// console.log(chrome.tabs);
	console.log(chrome.windows.getAll());
	
	chrome.tabs.getAllInWindow(null, function(tabs){
		for (var i = 0; i < tabs.length; i++) {
			//chrome.tabs.sendRequest(tabs[i].id, { action: "xxx" });
			console.log(tabs[i]);
		}
	});
	
    // console.log(sender.tab ?
                // "from a content script:" + sender.tab.url :
                // "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye2"});
  });