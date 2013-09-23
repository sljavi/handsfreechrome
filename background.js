var inputWindowId;

chrome.browserAction.onClicked.addListener(function() {
   chrome.windows.create(
   {
	   'url': 'https://handsfreechrome.com/input.html',
	   'height': 50, 
	   'width': 50,
	   'left': screen.width - 400,
	   'top': -10
   },
   function(window) {
		inputWindowId = window.id;
   });
   //after creating the window, use chrome.windows.update ({focus:true")
   //(or something like that) to go back to main window
   //apparently we can still take mic input with the window in the background
});

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
	console.log("got one");
    if (sender.url != "https://www.handsfreechrome.com/input.html"
		&& sender.url != "https://handsfreechrome.com/input.html") {
		alert("Nevermind, bad URL from message sender.");
		console.log("Nevermind, bad URL from message sender.");
		console.log(sender.url);
		return;  // don't allow access from other pages
	}
    if (request.message) {
		//send it to the control script
		//var n = 1;
		chrome.windows.getAll({populate:true},function(windows){
				windows.forEach(function(window){
					if (request.message == "new tab") {
						chrome.tabs.create({ url: 'http://www.google.com', windowId: window.id });
						return;
					}
					if (request.message == "close tab") {
						chrome.tabs.remove();
						return;
					}
					//console.log(n);
					//console.log(window.id);
					//n++;					
					chrome.tabs.query({
							active: true,
							windowId: window.id
						}, function( array_of_one_tab ){
							var tab = array_of_one_tab[0];
							var url = tab.url;
							var id = tab.id;
							console.log("Active: " + url + " Id: " + id);
							chrome.tabs.sendMessage(id, request.message);
						});
					// window.tabs.forEach(function(tab){
						// console.log(tab.url);
					// });
				});
			});
	}
  });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(sender.tab){
		console.log("Sender URL: " + sender.tab.url);
		if(sender.tab.url == "https://www.handsfreechrome.com"){
			//send message to active tab of other window.
			//var n = 1;
			chrome.windows.getAll({populate:true},function(windows){
				windows.forEach(function(window){
					//console.log(n);
					//console.log(window.id);
					//n++;
					chrome.tabs.query({
							active: true,
							windowId: window.id
						}, function( array_of_one_tab ){
							var tab = array_of_one_tab[0];
							var url = tab.url;
							var id = tab.id;
							console.log("Active: " + url + " Id: " + id);
							chrome.tabs.sendMessage(id, "did you get my message, dear?");
						});
					// window.tabs.forEach(function(tab){
						// console.log(tab.url);
					// });
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