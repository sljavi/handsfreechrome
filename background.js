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
	
	if(sender.tab){
		console.log("Sender URL: " + sender.tab.url);
		if(sender.tab.url == "https://www.google.com/"){
			//send message to active tab of other window.
			var n = 1;
			chrome.windows.getAll({populate:true},function(windows){
				windows.forEach(function(window){
					console.log(n);
					console.log(window.id);
					n++;
					window.tabs.forEach(function(tab){
						console.log(tab.url);
						chrome.tabs.query({
							active: true,
							windowId: window.id
						}, function( array_of_one_tab ){
							var tab = array_of_one_tab[0];
							var url = tab.url;
							console.log("Active: " + url);
						});
					});
				});
			});
		}
	}
	
	// chrome.tabs.getAllInWindow(null, function(tabs){
		// for (var i = 0; i < tabs.length; i++) {
		//	chrome.tabs.sendRequest(tabs[i].id, { action: "xxx" });
			// console.log(tabs[i]);
		// }
	// });

    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye2"});
  });
  
  
  
  
  
  
  
  