var inputWindowId = null;
var time_of_last_request = 0;
var dictation_mode = false;
var last_message = null;
var input_url = 'https://127.0.0.1:8000';

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) === str;
    };
}
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) === str;
    };
}

function openInputWindow() {
    chrome.tabs.create(
        {
            'url': input_url + '/input.html',
        },
        function(window) {
            inputWindowId = window.id;
        }
    );
}

chrome.browserAction.onClicked.addListener(function() {
    openInputWindow();
    //after creating the window, use chrome.windows.update ({focus:true")
    //(or something like that) to go back to main window
    //apparently we can still take mic input with the window in the background
});

function executeMessage( message, dictation_message ) {
    if (last_message && last_message.startsWith("keep") && last_message.endsWith(message)){
        return;
    }
    if (last_message === "Newtown" && message === "new tab"){
        return;
    }
    //don't double execute commands that are sent twice by mistake
    if ( !parseInt(message) && message === last_message && (new Date()).getTime() - time_of_last_request < 1000 ) {
        console.log("noticed time");
        return;
    }
    last_message = message;
    if ( !dictation_message && message.endsWith(".com") ) {
        message = message.slice(0, -4);
    }
    if ( !dictation_message && !message.startsWith("go to") ) {
        time_of_last_request = (new Date()).getTime();
    }
    if (!dictation_message) {
        console.log("executing: " + message);
        //send it to the control script
        chrome.windows.getAll( {populate:true}, function(windows){
            windows.forEach(function(window){
                if (message === "quit" || message === "exit") {
                    chrome.windows.remove( window.id );
                    return;
                }
                if (message === "done" || message === "Don") {
                    chrome.windows.remove( inputWindowId );
                    return;
                }
                //don't let any other commands reach the input window
                if (window.tabs[0].url === input_url + '/input.html') {
                    return;
                }
                if (message === "full screen") {
                    if (window.state !== "fullscreen") {
                        chrome.windows.update( window.id, { state: "fullscreen" } );
                    }
                    else if (window.state === "fullscreen") {
                        chrome.windows.update( window.id, { state: "maximized" } );
                    }
                    return;
                }
                if (message === "minimize") {
                    chrome.windows.update( window.id, {state: "minimized" } );
                    return;
                }
                if (message === "new tab" || message === "Newtown") {
                    chrome.tabs.create({ windowId: window.id });
                    return;
                }
                if (message === "switch") {
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
                    if (message === "close tab") {
                        chrome.tabs.remove(id);
                        return;
                    }
                    chrome.tabs.sendMessage(id, message);
                });
            });
        });
    } else {
        chrome.windows.getAll( {populate:true}, function(windows){
            windows.forEach(function(window){
                if (window.tabs[0].url === input_url + '/input.html') {
                    return;
                }
                chrome.tabs.query({
                    active: true,
                    windowId: window.id
                }, function( array_of_one_tab ){
                    var tab = array_of_one_tab[0];
                    var url = tab.url;
                    var id = tab.id;
                    chrome.tabs.sendMessage(id, message);
                });
            });
        });
    }
}

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        // don't allow access from other pages
        if (sender.url !== input_url + "/input.html"
            && sender.url !== input_url + "/input.html") {
            alert("Nevermind, bad URL from message sender.");
            console.log("Nevermind, bad URL from message sender.");
            console.log("URL: " + sender.url);
            return;
        }
        if (request.getAliases) {
            chrome.storage.sync.get({
                commandAliases: {}
            }, function(items) {
                sendResponse({commandAliases: items.commandAliases});
            });
            return true;
        }
        if (request.getTimeoutDuration) {
            chrome.storage.sync.get({
                timeoutDuration: 180000
            }, function(items) {
                sendResponse({timeoutDuration: items.timeoutDuration});
            });
            return true;
        }
        //check that message is not empty
        if (!request.message) {
            return;
        }
        if (request.message === "CHROME_DICTATION_STOP" || request.message === "CHROME_DICTATION_SUBMIT") {
            dictation_mode = false;
        }
        if (!dictation_mode) {
            console.log("called as command: " + request.message);
            executeMessage( request.message, false );
        } else {
            console.log("called as dictation: " + request.message);
            executeMessage( request.message, true );
        }
    }
);

//toggle dictation mode on background and input scripts
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(sender.tab){
            if(sender.tab.url !== input_url){
                if (request.greeting.dictModeOn) {
                    console.log("turning on dictation mode in the background window");
                    dictation_mode = true;
                    //send message to input window
                    chrome.windows.get(inputWindowId, {populate:true},function(window){
                        chrome.tabs.query({
                            active: true,
                            windowId: window.id
                        }, function( array_of_one_tab ){
                            var tab = array_of_one_tab[0];
                            var url = tab.url;
                            var id = tab.id;
                            console.log("Active: " + url + " Id: " + id);
                            chrome.tabs.sendMessage(id, {dictModeOn : true});
                        });
                    });
                } else if (request.greeting === "TOGGLE_EXTENSION_ON_OFF") {
                    var open = true;
                    chrome.windows.getAll( {populate:true}, function(windows){
                        windows.forEach(function(window){
                            if (window.tabs[0].url === input_url + '/input.tml') {
                                consolelog("bang");
                                chrome.windows.remove( window.id );
                                open = false;
                            }
                        });
                        if (open) {
                            openInputWindow();
                        }
                    });
                }
            }
        }
    }
);