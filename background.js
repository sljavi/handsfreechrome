var inputWindowId;
var time_of_last_request = 0;

chrome.browserAction.onClicked.addListener(function() {
   chrome.windows.create(
   {
	   'url': 'https://handsfreechrome.com/input.html',
	   'height': 300,//50, 
	   'width': 400,//50,
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
	if ( (new Date()).getTime() - time_of_last_request < 1000 ) {
		return;
	}
	time_of_last_request = (new Date()).getTime();
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
		chrome.windows.getAll( {populate:true}, function(windows){
				windows.forEach(function(window){
					if (request.message == "quit" || request.message == "exit") {
						chrome.windows.remove( window.id );
						return;
					}
					if (request.message == "done") {
						chrome.windows.remove( inputWindowId );
						return;
					}
					//don't let any other commands reach the input window
					if (window.tabs[0].url == 'https://handsfreechrome.com/input.html') {
						return;
					}
					if (request.message == "new tab") {
						chrome.tabs.create({ windowId: window.id });
						return;
					}
					if (request.message == "switch") {
						now = false;
						chrome.tabs.query(
							{windowId: window.id},
							function( all_tabs ){
								for (var i = 0; i < all_tabs.length; i++) {
									if (now) {
										chrome.tabs.update(all_tabs[i].id, {active: true});
										break;
									}
									if (all_tabs[i].active) {
										now = true;
										if (i == all_tabs.length - 1) {
											chrome.tabs.update(all_tabs[0].id, {active: true});
											break;
										}
									}
								}							
							}
						);
					}				
					chrome.tabs.query({
							active: true,
							windowId: window.id
						}, function( array_of_one_tab ){
							var tab = array_of_one_tab[0];
							var url = tab.url;
							var id = tab.id;
							if (request.message == "close tab") {
								chrome.tabs.remove(id);
								return;
							}
							chrome.tabs.sendMessage(id, request.message);
						});
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