$(function() {

    var commandAliases = {};
    var timeoutDuration = 180000;
    
    // dev id, different for every developer since it's randomly assigned by Chrome when loaded locally
    const extensionId = 'hjlgjkkmkialmidaegfgnnflmoglkkek';

    // prod id -- replaces above value for production releases
    // const extensionId = 'ddgmnkioeodkdacpjblmihodjgmebnld';

    chrome.runtime.sendMessage(extensionId, {getAliases: true},
                               function(response) {
                                   commandAliases = response.commandAliases;
                               });

    chrome.runtime.sendMessage(extensionId, {getTimeoutDuration: true},
                               function(response) {
                                   timeoutDuration = response.timeoutDuration;
                               });

    // for inputting text to forms
    var dictationMode = false;
    $('#dictationEnable').click(function() {
        console.log('dictation mode enabled in input.js');
        dictationMode = true;
    });

    $('#dictationDisable').click(function() {
        console.log('dictation mode disabled in input.js');
        dictationMode = false;
    });
    
    var validSingleCommands = [
        'play',     // unpauses a youtube video
        'pause',    // pauses a youtube video
        'paws',     // misheard word for "pause"
        'pawn',     // misheard word for "pause"
        'mute',     // mutes a youtube video
        'unmute',   // unmutes a youtube video
        'restart',  // restarts a youtube video
        'one',      // for map mode, since all other numbers are rendered as digits but these 10 as words
        'two',
        'to',       // misheard word for "2"
        'three',
        'four',
        'for',      // misheard word for "4"
        'five',
        'six',
        'sex',      // misheard word for "6"
        'seven',
        'eight',
        'att',      // misheard word for "8"
        'nine',
        'ten',
        'map',      // paints numbers next to anchor tags, images, forms, and buttons
        'guide',    // paints numbers next to spans and images
        'show',     // paints numbers next to anchor tags, forms, buttons, images, and spans, regardless of whether they're visible
        'home',     // navigates directly to your homepage
        'up',       // scrolls up 200 pixels
        'app',      // misheard word for "up"
        'op',       // misheard word for "up"
        'down',     // scrolls down 200 pixels
        'town',     // misheard word for "down"
        'right',    // scrolls right 200 pixels
        'left',     // scrolls left 200 pixels
        'rise',     // page up
        'frys',     // misheard word for "rise"
        'rice',     // misheard word for "rise"
        'fall',     // page down
        'full',     // misheard word for "fall"
        'song',     // misheard word for "fall"
        'all',      // misheard word for "fall"
        'back',     // last page in history
        'forward',  // next page in history
        'top',      // scroll to top of page
        'bottom',   // scroll to bottom of page
        'reload',   // refresh page
        'refresh',  // refresh page
        'zoom',     // zoom in
        'resume',   // misheard word for "zoom"
        'zoomin',   // misheard word for "zoom in"
        'enhance',  // only works in bladeRunnerMode; removes zoom blur
        'switch',   // changes to the next tab in the queue
        'exit',     // closes all Chrome windows
        'quit',     // closes all Chrome windows
        'done',     // close help, or turn off extension
        'don',      // misheard word for "done"
        'dunn',     // misheard word for "done"
        'faster',   // increases speed of continuous scrolling
        'slower',   // decreases speed of continuous scrolling
        'flower',   // misheard word for "slower"
        'stop',     // stops continuous scrolling
        'help',     // brings up help page, or hides it
        'minimize', // minimize main chrome window
        'maximize', // maximize main chrome window
        'newtown',  // misheard word for "new tab"
        'skip',     // seek forward 15 seconds in youtube video
        'jump',     // seek forward 60 seconds in youtube video
        'leap',     // seek forward 5 minutes in youtube video
        'rewind',   // seek backward 30 seconds in youtube video
        'silence',   // toggle tab mute on/off
        'silent'    // misheard word for "silence"
    ];
    
    var validDoubleCommands = [
        'full screen',      // toggle full screen mode
        'zoom in',          // zoom in
        'zoom out',         // zoom out WHOA WAIT WHAT DO YOU MEAN
        'zoom normal',      // return to standard level of no zoom
        'new tab',          // opens a new tab
        'close tab',        // closes current tab
        'close time',       // misheard command for "close tab"
        'increase volume',  // increases volume on youtube video by 20%
        'decrease volume',  // decreases volume on youtube video by 20%
        'keep showing',
        'stop showing',
    ];
    
    var validTripleCommands = [
        'keep scrolling down',  // sets browser scrolling continuously down until the end of the page
        'keep scrolling up',    // sets browser scrolling continuously up until the end of the page
        'keep scrolling left',  // sets browser scrolling continuously left until the end of the page
        'keep scrolling right', // sets browser scrolling continuously right until the end of the page
        'blade runner mode'     // toggles zoom/enhance functionality
    ];
    
    for (var i = 1; i <= 400; i++) {
        validSingleCommands.push( i.toString() );
    }
    
    /* Checks to see if command is valid. */
    /* Checks against three word commands first, then against two word commands, then against single word commands */
    var matchesValidCommands = function(threeCommands) {
        var command = commandAliases[threeCommands.join(' ')] || threeCommands.join(' ');
        for (var i = 0; i < validTripleCommands.length; i++) {
            if (command === validTripleCommands[i] ||
                threeCommands[0] + ' ' + threeCommands[1] === 'go to') {
                return 3;
            }
        }
        command = commandAliases[threeCommands.slice(0, 2).join(' ')] || threeCommands.slice(0, 2).join(' ');
        for (var i = 0; i < validDoubleCommands.length; i++) {
            if (command === validDoubleCommands[i]) {
                return 2;
            }
        }
        command = commandAliases[threeCommands[0]] || threeCommands[0];
        for (var i = 0; i < validSingleCommands.length; i++) {
            if (command === validSingleCommands[i]) {
                return 1;
            }
        }
        return 0;
    };
    
    // sends spoken command to extension's background script (background.js), which sends it to
    // the active tab, where it is executed by an injected content script (control.js)
    var sendCommand = function(command) {
        document.title = command;
        console.log('sending command: ' + command);
        chrome.runtime.sendMessage(extensionId, {message: command});
    };
    
    // handles spoken input, verifying validity before sending it to the extension
    var receiveInput = function(input) {
        if (!dictationMode) {
            console.log(input);
            organizedInput = input.trim().split(' ');
            inputsArray = [];

            // trim whitespace and transform to all lowercase before populating array
            for (var i = 0; i < organizedInput.length; i++) {
                if ( !(organizedInput[i].trim() === '') ) {
                    inputsArray.push(organizedInput[i].trim().toLowerCase());
                }
            }

            // detect "go to" commands
            for (var i = 0; i < inputsArray.length; i++) {
                var m = inputsArray[i];
                if ( m.endsWith('.com') || m.endsWith('.gov') || m.endsWith('.org') || m.endsWith('.edu') ) {
                    sendCommand('go to ' + m);
                    return;
                }
            }

            var match = matchesValidCommands( inputsArray.slice(0, 3) );

            if ( !match ) {
                return;
            } else {
                if (match === 1) {
                    console.log('Valid command recognized: ' + inputsArray[0]);
                    sendCommand(inputsArray[0]);
                    return;
                }
                if (match === 2) {
                    console.log('Valid command recognized: ' + inputsArray[0] + ' ' + inputsArray[1]);
                    sendCommand(inputsArray[0] + ' ' + inputsArray[1]);
                    return;
                }
                if (match === 3) {
                    console.log('Valid command recognized: ' + inputsArray[0] + ' ' + inputsArray[1] + ' ' + inputsArray[2]);
                    sendCommand(inputsArray[0] + ' ' + inputsArray[1] + ' ' + inputsArray[2]);
                    return;
                }
                return;
            }
        } else {
            // Take input until the word "go" or "stop" or "next" is found.
            // Send all input to the background window.
            organizedInput = input.trim().split(' ');
            inputsArray = [];
            for (var i = 0; i < organizedInput.length; i++) {
                if ( !(organizedInput[i].trim() === '') ) {
                    inputsArray.push(organizedInput[i].trim());
                }
            }   
            // submit current form, end dictation mode
            if (inputsArray[inputsArray.length - 1] === 'go'){
                if(inputsArray.length > 1) {
                    sendCommand(inputsArray.slice(0, inputsArray.length - 1).join(' '));
                }
                sendCommand('CHROME_DICTATION_SUBMIT');
                console.log('dictation mode ended in input window');
                dictationMode = false;
            // move on to next input in form, or cycle back to first input if there are no more
            } else if (inputsArray[inputsArray.length - 1] === 'next' ) {
                if(inputsArray.length > 1) {
                    sendCommand(inputsArray.slice(0, inputsArray.length - 1).join(' '));
                }
                sendCommand('CHROME_DICTATION_NEXT');
            // stop dictation mode without submitting form, switch back to control mode
            } else if (inputsArray[inputsArray.length - 1] === 'stop' ) {
                if(inputsArray.length > 1) {
                    sendCommand(inputsArray.slice(0, inputsArray.length - 1).join(' '));
                }
                sendCommand('CHROME_DICTATION_STOP');
                console.log('dictation mode ended in input window');
                dictationMode = false;
            } else if (inputsArray[inputsArray.length - 1] === 'backspace' ) {
                if(inputsArray.length > 1) {
                    sendCommand(inputsArray.slice(0, inputsArray.length - 1).join(' '));
                }
                sendCommand('CHROME_DICTATION_BACKSPACE');
            } else {
                sendCommand(inputsArray.join(' '));
                console.log('sent as dictation: ' + input);
            }
            return;
        }
    };

    var lastStartedAt = 0;
    var lastInputAt = new Date().getTime();
    var recognizing = false;

    var addLastInputToPreviousInputsDisplay = function(input) {
        $('#previousInputsDisplay').prepend('<div>' + input + '</div>');
    };

    // starts up and maintains the WebSpeech speech recognition engine, dispatches its output to receiveInput
    var start = function() {
        if ('webkitSpeechRecognition' in window) {
            var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onstart = function() {
                recognizing = true;
                lastStartedAt = new Date().getTime();
            };
            
            recognition.onerror = function(event) {
                if (event.error === 'no-speech') {
                    // console.log('no speech');
                }
                if (event.error === 'audio-capture') {
                    console.log('audio capture');
                }
                if (event.error === 'not-allowed') {
                    console.log('not allowed');
                }
            };
            
            recognition.onend = function() {
                // console.log('recognition ended');
                recognizing = false;
                var timeSinceLastStart = new Date().getTime() - lastStartedAt;
                if (timeSinceLastStart < 1000) {
                    console.log('setting timeout');
                    setTimeout(recognition.start, 1000 - timeSinceLastStart);
                } else if (new Date().getTime() - lastInputAt < timeoutDuration) {
                    // console.log('starting immediately');
                    recognition.start();
                } else {
                    alert('No speech detected for ' + timeoutDuration / 60000 +
                        ' minutes, turning off. Refresh input window to reactivate.')
                }
            };
            
            recognition.onresult = function(event) {
                lastInputAt = new Date().getTime();
                var interimTranscript = '';

                if (event.results === undefined) {
                    recognition.onend = null;
                    recognition.stop();
                    alert('results were undefined');
                    return;
                }

                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (dictationMode) {
                        if (event.results[i].isFinal) {
                            receiveInput(event.results[i][0].transcript);
                            addLastInputToPreviousInputsDisplay(event.results[i][0].transcript);
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    } else {
                        if (event.results[i].isFinal) {
                            addLastInputToPreviousInputsDisplay(event.results[i][0].transcript);
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                            receiveInput(event.results[i][0].transcript);
                        }
                    }
                }

                if (interimTranscript !== '') {
                    document.getElementById('interimDisplay').innerHTML = interimTranscript;
                } else {
                    document.getElementById('interimDisplay').innerHTML = '<br>';
                }
                if(interimTranscript) document.title = interimTranscript;
            }
            recognition.start();
        }
    };

    start();
});