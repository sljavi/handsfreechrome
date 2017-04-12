var DEV_MODE = true;
var inputWindowId = null;
var time_of_last_request = 0;
var dictation_mode = false;
var last_message = null;
var input_url = DEV_MODE ? 'https://localhost:8000/html' : 'https://handsfreechrome.com/html';
var keep_showing = false;

////////////////  Utility functions ////////////////////////

// Check whether an object is present in an array, returns bool
var contains = function(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
};

// Add startsWith method to String type, returns bool
if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) === str;
    };
}
// Add endsWith method to String type, returns bool
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) === str;
    };
}

////////////////////////////////////////////////////


// Open input.html in a separate window by default.
// Users can adjust options so that it opens in a separate tab instead.
var openInputWindow = function() {
    chrome.storage.sync.get({
        'openInTab': false
    }, function(items) {
        if(items.openInTab) {
            chrome.tabs.create(
                {
                    'url': input_url + '/input.html',
                },
                function(window) {
                    inputWindowId = window.id;
                }
            );
        } else {
            chrome.windows.create(
                {
                    'url': input_url + '/input.html',
                    'height': 300,
                    'width': 400,
                    'left': screen.width - 400,
                    'top': -10
                },
                function(window) {
                    inputWindowId = window.id;
                });
        }
    });
};

// Add click handler to extension icon.
chrome.browserAction.onClicked.addListener(openInputWindow);

// send a command to the browser; also handles the "close tab" command
var sendCommandToControlScript = function( message ) {
    chrome.tabs.query({
                    active: true,
                    windowId: window.id
                }, function( array_of_one_tab ){
                    var tab = array_of_one_tab[0];
                    var id = tab.id;
                    if (message === 'close tab' || message === 'close time') {
                        chrome.tabs.remove(id);
                        return;
                    }
                    // if we've gotten here, it's a non-dictation DOM-level
                    // command, so send it to control.js.
                    chrome.tabs.sendMessage(id, message);
                });
};

// Decide what to do with a command sent from input.js.
//
// If it's a browser level command (new tab, close tab, exit, done, full screen, minimize, switch),
// then it handles it itself. Otherwise it's a dictation or a DOM level command and 
// it gets sent to control.js.
//
// Also does a lot of checking to prevent command doubling.
var executeMessage = function( message, is_dictation_message ) {
    if (last_message && last_message.startsWith('keep') && last_message.endsWith(message)){
        return;
    }

    if (last_message === 'newtown' && message === 'new tab' && (new Date()).getTime() - time_of_last_request < 1000 ){
        return;
    }

    // don't double execute commands that are sent twice by mistake
    if ( !parseInt(message) && message === last_message && (new Date()).getTime() - time_of_last_request < 1000 ) {
        console.log('noticed time');
        return;
    }

    last_message = message;

    if ( !is_dictation_message && message.endsWith('.com') ) {
        message = message.slice(0, -4);
    }

    if ( !is_dictation_message && !message.startsWith('go to') ) {
        time_of_last_request = (new Date()).getTime();
    }

    if (!is_dictation_message) {
        console.log('executing: ' + message);
        // handles execution of message
        chrome.windows.getAll( {populate:true}, function(windows){
            windows.forEach(function(window){
                if (message === 'quit' || message === 'exit') {
                    chrome.windows.remove( window.id );
                    return;
                }
                if (message === 'done' || message === 'Don' || message === 'Dunn') {
                    chrome.windows.remove( inputWindowId );
                    // hide help when extension is closed
                    sendCommandToControlScript('hidehelp');
                    return;
                }
                // don't let any other commands reach the input window
                if (window.tabs[0].url === input_url + '/input.html') {
                    return;
                }
                if (message === 'full screen') {
                    if (window.state !== 'fullscreen') {
                        chrome.windows.update( window.id, { state: 'fullscreen' } );
                    }
                    else if (window.state === 'fullscreen') {
                        chrome.windows.update( window.id, { state: 'maximized' } );
                    }
                    return;
                }
                if (message === 'minimize') {
                    chrome.windows.update( window.id, {state: 'minimized' } );
                    return;
                }
                if (message === 'new tab' || message === 'newtown') {
                    chrome.tabs.create({ windowId: window.id });
                    return;
                }
                if (message === 'switch') {
                    var now = false;
                    chrome.tabs.query(
                        {windowId: window.id},
                        // find current active tab and switch to the next one
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

                sendCommandToControlScript(message);
            });
        });
    } else {
        // send dictation command to active tab of window
        chrome.windows.getAll( {populate:true}, function(windows){
            windows.forEach(function(window){
                // but don't send dictation to input.html
                if (window.tabs[0].url === input_url + '/input.html') {
                    return;
                }
                chrome.tabs.query({
                    active: true,
                    windowId: window.id
                }, function( array_of_one_tab ){
                    var tab = array_of_one_tab[0];
                    chrome.tabs.sendMessage(tab.id, message);
                });
            });
        });
    }
};

// Listen for messages from input.js
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        console.log('received something');
        // ignore messages from all other pages
        if (sender.url !== input_url + '/input.html'
            && sender.url !== input_url + '/input.html') {
            alert('Nevermind, bad URL from message sender.');
            console.log('Nevermind, bad URL from message sender.');
            console.log('URL: ' + sender.url);
            return;
        }
        // if request is asking for the user's custom aliases,
        // get them and send them back.
        if (request.getAliases) {
            chrome.storage.sync.get({
                commandAliases: {}
            }, function(items) {
                sendResponse({commandAliases: items.commandAliases});
            });
            return true;
        }
        // if request is asking for the user's custom "auto-inactivity-shut-off time",
        // get it and send it back.
        if (request.getTimeoutDuration) {
            chrome.storage.sync.get({
                timeoutDuration: 180000
            }, function(items) {
                sendResponse({timeoutDuration: items.timeoutDuration});
            });
            return true;
        }
        // check that message is not empty
        if (!request.message) {
            return;
        }
        if (request.message === 'CHROME_DICTATION_STOP' || request.message === 'CHROME_DICTATION_SUBMIT') {
            dictation_mode = false;
        }
        if (dictation_mode) {
            console.log('called as dictation: ' + request.message);
            executeMessage( request.message, true );
        } else {
            console.log('called as command: ' + request.message);
            executeMessage( request.message, false );
        }
    }
);

// Listen for messages from control.js -- used to activate dictation mode
// when control.js detects that it has been asked to click on a form input.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(sender.tab && sender.tab.url !== input_url){
            if (request.greeting.dictModeOn) {
                console.log('turning on dictation mode in the background window');
                dictation_mode = true;
                // send message to input window to let it know
                chrome.windows.get(inputWindowId, {populate:true}, function(window){
                    chrome.tabs.query({
                        active: true,
                        windowId: window.id
                    }, function( array_of_one_tab ){
                        var tab = array_of_one_tab[0];
                        chrome.tabs.sendMessage(tab.id, {dictModeOn : true});
                    });
                });
            } else if (request.greeting === 'TOGGLE_EXTENSION_ON_OFF') {
                var open = true;
                chrome.windows.getAll( {populate: true}, function(windows){
                    windows.forEach(function(window){
                        if (window.tabs[0].url === input_url + '/input.tml') {
                            chrome.windows.remove( window.id );
                            open = false;
                        }
                    });
                    if (open) {
                        openInputWindow();
                    }
                });
            } else if (request.greeting === 'KEEP_SHOWING') {
                keep_showing = true;
            } else if (request.greeting === 'STOP_SHOWING') {
                keep_showing = false;
            } else if (request.greeting === 'SHOW?') {
                sendResponse(keep_showing);
            }
        }
    }
);