$(function() {
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
    
    var commandAliases;
    var timeoutDuration = 180000;
    var extensionId = 'gakmidkmfmcgonnichkbaggmfofpical';
    // prod id = 'ddgmnkioeodkdacpjblmihodjgmebnld'
    chrome.runtime.sendMessage(extensionId, {getAliases: true},
                               function(response) {
                                   commandAliases = response.commandAliases;
                               });

    chrome.runtime.sendMessage(extensionId, {getTimeoutDuration: true},
                               function(response) {
                                   timeoutDuration = response.timeoutDuration;
                               });
    // for inputting text to forms
    var dictation_mode = false;
    $('#modeSwitch').click(function() {
        console.log("Switched");
        dictation_mode = !dictation_mode;
    });
    
    var valid_single_commands = [
        "map",      // paints numbers next to anchor tags, images, forms, and buttons
        "guide",    // paints numbers next to spans and images
        "show",     // paints numbers next to anchor tags, forms, buttons, images, and spans, regardless of whether they're visible
        "home",     // navigates directly to your homepage
        "att",      // misheard word for "8"
        "sex",      // sheard word for "6"
        "up",       // scrolls up 200 pixels
        "app",      // misheard word for "up"
        "op",       // misheard word for "up"
        "down",     // scrolls down 200 pixels
        "town",     // misheard word for "down"
        "right",    // scrolls right 200 pixels
        "left",     // scrolls left 200 pixels
        "rise",     // page up
        "frys",     // misheard word for "rise"
        "rice",     // misheard word for "rise"
        "fall",     // page down
        "full",     // misheard word for "fall"
        "song",     // misheard word for "fall"
        "all",      // misheard word for "fall"
        "back",     // last page in history
        "forward",  // next page in history
        "top",      // scroll to top of page
        "bottom",   // scroll to bottom of page
        "reload",   // refresh page
        "refresh",  // refresh page
        "zoom",     // zoom in
        "enhance",  // only works in bladeRunnerMode; removes zoom blur
        "switch",   // changes to the next tab in the queue
        "exit",     // closes all Chrome windows
        "quit",     // closes all Chrome windows
        "done",     // close help, or turn off extension
        "Don",      // misheard word for "done"
        "Dunn",     // misheard word for "done"
        "faster",   // increases speed of continuous scrolling
        "slower",   // decreases speed of continuous scrolling
        "flower",   // misheard word for "slower"
        "stop",     // stops continuous scrolling
        "help",     // brings up help page, or hides it
        "minimize", // minimize main chrome windows
        "Newtown"   // misheard word for "new tab"
    ];
    
    var valid_double_commands = [
        "full screen",  // toggle full screen mode
        "zoom in",      // zoom in
        "zoom out",     // zoom out WHOA WAIT WHAT DO YOU MEAN
        "zoom normal",  // return to standard level of zoom
        "new tab",      // opens a new tab
        "close tab"     // closes current tab
    ];
    
    var valid_triple_commands = [
        "keep scrolling down",  // sets browser scrolling continuously down until the end of the page
        "keep scrolling up",    // sets browser scrolling continuously up until the end of the page
        "keep scrolling left",  // sets browser scrolling continuously left until the end of the page
        "keep scrolling right", // sets browser scrolling continuously right until the end of the page
        "Blade Runner mode"     // toggles zoom/enhance functionality
    ];
    
    
    
    for (var i = 1; i <= 400; i++) {
        valid_single_commands.push( i.toString() );
    }
    
    /* Checks to see if command is valid. */
    /* Checks against three word commands first, then against two word commands, then against single word commands */
    var matchesValidCommands = function(three_commands) {
        var command = commandAliases[three_commands.join(' ')] || three_commands.join(' ');
        for (var i = 0; i < valid_triple_commands.length; i++) {
            if (command === valid_triple_commands[i] ||
                three_commands[0] + " " + three_commands[1] === "go to") {
                console.log(three_commands.join(' '));
                return 3;
            }
        }
        command = commandAliases[three_commands.slice(0,2).join(' ')] || three_commands.slice(0,2).join(' ');
        for (var i = 0; i < valid_double_commands.length; i++) {
            if (command === valid_double_commands[i]) {
                console.log(three_commands.slice(0,2).join(' '));
                return 2;
            }
        }
        command = commandAliases[three_commands[0]] || three_commands[0];
        for (var i = 0; i < valid_single_commands.length; i++) {
            if (command === valid_single_commands[i]) {
                return 1;
            }
        }
        return 0;
    };
    
    // sends spoken command to extension's background script, which sends it to
    // the active tab, where it is executed by an injected content script (control.js)
    var sendCommand = function(command) {
        document.title = command;
        console.log("sending: " + command);
        chrome.runtime.sendMessage(extensionId, {message: command});
    };
    
    // handles spoken input, verifying validity before sending it to the extension
    var receiveInput = function(input) {
        if (!dictation_mode) {
            organizedInput = input.trim().split(" ");
            non_empty_oi = [];
            for (var i = 0; i < organizedInput.length; i++) {
                if ( !(organizedInput[i].trim() === "") ) {
                    non_empty_oi.push(organizedInput[i].trim());
                }
            }
            for (var i = 0; i < 3; i++) {
                m = non_empty_oi[i];
                if ( typeof m === "string" && (m.endsWith(".com") || m.endsWith(".gov") || m.endsWith(".org") || m.endsWith(".edu")) ) {
                    sendCommand("go to " + m);
                    return;
                }
            }
            var match = matchesValidCommands( non_empty_oi.slice(0,3) );
            if ( !match ) {
                return;
            } else {
                if (match === 1) {
                    console.log("Valid command recognized: " + non_empty_oi[0]);
                    sendCommand(non_empty_oi[0]);
                    return;
                }
                if (match === 2) {
                    console.log("Valid command recognized: " + non_empty_oi[0] + " " + non_empty_oi[1]);
                    sendCommand(non_empty_oi[0] + " " + non_empty_oi[1]);
                    return;
                }
                if (match === 3) {
                    console.log("Valid command recognized: " + non_empty_oi[0] + " " + non_empty_oi[1] + " " + non_empty_oi[2]);
                    sendCommand(non_empty_oi[0] + " " + non_empty_oi[1] + " " + non_empty_oi[2]);
                    return;
                }
                return;
            }
        } else {
            /*
              Take input until the word "go" or "stop" or "next" is found.
              Send all input to the background window.
            */
            organizedInput = input.trim().split(" ");
            non_empty_oi = [];
            for (var i = 0; i < organizedInput.length; i++) {
                if ( !(organizedInput[i].trim() === "") ) {
                    non_empty_oi.push(organizedInput[i].trim());
                }
            }   
            // submit current form, end dictation mode
            if (non_empty_oi[non_empty_oi.length - 1] === 'go'){
                if(non_empty_oi.length > 1) {
                    sendCommand(non_empty_oi.slice(0, non_empty_oi.length - 1).join(" "));
                }
                sendCommand("CHROME_DICTATION_SUBMIT");
                console.log("dictation mode ended in input window");
                dictation_mode = false;
                // move on to next input in form, or cycle back to first input if there are no more
            } else if (non_empty_oi[non_empty_oi.length - 1] === 'next' ) {
                if(non_empty_oi.length > 1) {
                    sendCommand(non_empty_oi.slice(0, non_empty_oi.length - 1).join(" "));
                }
                sendCommand("CHROME_DICTATION_NEXT");
                // stop dictation mode without submitting form, switch back to control mode
            } else if (non_empty_oi[non_empty_oi.length - 1] === 'stop' ) {
                if(non_empty_oi.length > 1) {
                    sendCommand(non_empty_oi.slice(0, non_empty_oi.length - 1).join(" "));
                }
                sendCommand("CHROME_DICTATION_STOP");
                console.log("dictation mode ended in input window");
                dictation_mode = false;
            } else if (non_empty_oi[non_empty_oi.length - 1] === 'undo' ) {
                if(non_empty_oi.length > 1) {
                    sendCommand(non_empty_oi.slice(0, non_empty_oi.length - 1).join(" "));
                }
                sendCommand("CHROME_DICTATION_UNDO");
            } else {
                sendCommand(non_empty_oi.join(" "));
                console.log("sent as dictation: " + input);
            }
            return;
        }
    };
    var final_transcript = '';
    var lastStartedAt = 0;
    var lastInputAt = new Date().getTime();
    var recognizing = false;
    var start = function() {
        if ('webkitSpeechRecognition' in window) {
            var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onstart = function() {
                recognizing = true;
                lastStartedAt = new Date().getTime();
                document.getElementById('inputDisplay').innerHTML = "Started";
            };
            
            recognition.onerror = function(event) {
                if (event.error === 'no-speech') {
                    console.log("no speech");
                }
                if (event.error === 'audio-capture') {
                    console.log("audio capture");
                }
                if (event.error === 'not-allowed') {
                    console.log("not allowed");
                }
            };
            
            recognition.onend = function() {
                console.log("recognition ended");
                recognizing = false;
                var timeSinceLastStart = new Date().getTime() - lastStartedAt;
                if (timeSinceLastStart < 1000) {
                    console.log("setting timeout");
                    setTimeout(recognition.start, 1000 - timeSinceLastStart);
                } else if (new Date().getTime() - lastInputAt < timeoutDuration) {
                    console.log("starting immediately");
                    recognition.start();
                } else {
                    alert("No speech detected for " + timeoutDuration / 60000 +
                        " minutes, turning off. Refresh input window to reactivate.")
                }
            };
            
            recognition.onresult = function(event) {
                lastInputAt = new Date().getTime();
                var interim_transcript = '';
                if (typeof event.results === 'undefined') {
                    recognition.onend = null;
                    recognition.stop();
                    alert("results were undefined");
                    return;
                }
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (dictation_mode) {
                        if (event.results[i].isFinal) {
                            final_transcript += event.results[i][0].transcript;
                            receiveInput(event.results[i][0].transcript);
                        } else {
                            interim_transcript += event.results[i][0].transcript;
                        }
                    } else {
                        if (event.results[i].isFinal) {
                            final_transcript += event.results[i][0].transcript;
                        } else {
                            interim_transcript += event.results[i][0].transcript;
                            receiveInput(event.results[i][0].transcript);
                        }
                    }
                }
                document.getElementById('inputDisplay').innerHTML = final_transcript;
                document.getElementById('interimDisplay').innerHTML = interim_transcript;
                if(interim_transcript) document.title = interim_transcript;
            }
            recognition.start();
        }
    };
    start();
});