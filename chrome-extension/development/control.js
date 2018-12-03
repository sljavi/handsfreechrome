$(function() {
    var DEV_MODE = true;
    var inputDomain = DEV_MODE ? 'https://localhost:8000' : 'https://handsfreechrome.com';
    // production uses .htaccess to hide subfolder and file ending in url
    var inputWindowURL = DEV_MODE ? inputDomain + '/html/input.html' : inputDomain + '/input';
    var mapIsOn = false;
    var guideIsOn = false;
    var showIsOn = false;
    var keepShowIsOn = false;
    var zoomLevel = 1.0;
    var dictationMode = false;
    var bladeRunnerMode = false;
    
    // used for all scrolling commands
    var scrollContainer = $('html, body');
    
    // used for the "keep scrolling up/down" commands
    var scrollSpeed = 800;
    var currentDirection = null;
    var currentSpeed = null;
    
    // stops commands from being double-executed....the voice recognition often registers input 2-3 times
    // This check is in place in background.js too. To do: test if it's necessary in both places.
    var lastMessage = null;
    var lastTime = (new Date()).getTime();
    var commandDelay = null;
    
    // stops the maptag number from being placed into a text input at the moment it is selected
    var inputNumberBugFix = false;

    // used for YouTube commands
    var mainVideo = document.getElementsByTagName('video')[0];

    // `mainVideo` becomes unpredictably undefined due to interference from youtube's JS code,
    // so we reset before using it
    var checkMainVideo = function() {
        mainVideo = mainVideo || document.getElementsByTagName('video')[0];
    };
    
    // used for blade runner mode....'zoom...enhance'
    $('body').css({ '-webkit-transition': '0.6s ease-in-out' });
    var blurred = false;
    
    // if users have created any custom command aliases, fetch those now
    var commandAliases = {};
    chrome.storage.sync.get({
        commandAliases: {}
    }, function(items) {
        commandAliases = items.commandAliases;
    });

    // ctrl + space to turn extension on/off
    window.onkeydown = function(e) {
        if (e.ctrlKey === true && e.keyCode === 32) {
            chrome.runtime.sendMessage({ greeting: 'TOGGLE_EXTENSION_ON_OFF' });
            return !(e.keyCode === 32);
        }
    };
    
    // embedded help page...identical HTML but fully expanded can be found in commands.html
    $('body').append('<div id="hfc-help" style="display:none;"><h2>Hands Free Chrome Command Guide</h2><p>Say <kbd>help</kbd> to bring up a copy of this command guide.</p> <p style="font-style: italic">Note: the most common problem is a command being misheard by the speech engine. By observing the Hands Free input window, you can see what it thinks you said. This may help you learn the proper enunciations necessary in order to be understood more readily.</p> <p style="font-style: italic">Also note that the wording for many commands was chosen based on what the speech recognition engine recognized most consistently and accurately. Many common mishearings have been hardcoded to be recognized, so for instance when you say "pause" and it hears "paws," it will still work.</p> <h3>Scrolling</h3> <p>To scroll up a small amount, say <kbd>up</kbd>.<br> To scroll down a small amount, say <kbd>down</kbd>.<br> To scroll a small amount to the right, say <kbd>right</kbd>.<br> To scroll a small amount to the left, say <kbd>left</kbd>.</p> <p>To page up, say <kbd>rise</kbd>.<br> To page down, say <kbd>fall</kbd>.</p> <p>To scroll to the bottom of the page, say <kbd>bottom</kbd>.<br> To scroll to the top of the page, say <kbd>top</kbd>.</p> <p>To set the page scrolling continuously up, say <kbd>keep scrolling up</kbd>.<br> To set the page scrolling continuously down, say <kbd>keep scrolling down</kbd>.<br> To stop the page from continously scrolling, say <kbd>stop</kbd>.<br> To control the speed of scrolling, say <kbd>faster</kbd> or <kbd>slower</kbd>. The changes will be small, but you can issue these commands repeatedly for incremental gains.</p> <h3>Clicking</h3> <p>To see numbered tags alongside clickable elements on the page, say <kbd>map</kbd>. If <kbd>map</kbd> does not place a numbered tag next to the element you wish to click, try <kbd>guide</kbd> or <kbd>show</kbd> instead. These commands do the same thing, but they select different items for numbering. Using one after another will hide the previous command\'s tags before creating new ones.</p> <p>The tags will appear near the upper left corner of the corresponding item. Although the exact spacing can be unpredictable, a given number tag will always be to the immediate left of the element it corresponds to.</p> <p>To click a numbered element, simply speak the number.</p> <p>If you decide not to click anything, saying <kbd>map</kbd>/<kbd>guide</kbd>/<kbd>show</kbd> a second time will hide the number tags, as will using any of the scrolling commands.</p> <p><i>Note: There is currently no support for dropdown menus.</i></p> <h3>Dictation Mode</h3> <p>If you’ve clicked a text input, Hands Free will switch into dictation mode, and anything you say will be written as text into the selected text input.</p> <p>To turn off dictation mode and return to the normal control functionality, say <kbd>stop</kbd>.<br> To submit the textbox you’re typing in (the equivalent of pressing ‘enter’), say <kbd>go</kbd>. This is what you want when you finish typing in a searchbox, for example.<br> To move the cursor to the next input in the form (for example, from username to password), say <kbd>next</kbd>.<br> <br> To remove the last word you entered from the textbox, say <kbd>backspace</kbd>.</p> <h3>Navigation</h3> <p>To go to ANY website, say the name of the website on its own with the domain specified. There is no need to say “www.”<br> Examples: <kbd>google.com</kbd>, <kbd>en.wikipedia.org</kbd> (pronounced E-N-dot-wikipedia-dot-org), <kbd>mit.edu</kbd> (pronounced M-I-T-dot-E-D-U), <kbd>fr.wikipedia.org</kbd> (pronounced F-R-dot-wikipedia-dot-org)</p> <p>To go to a particular .com website, say <kbd>go to [website name]</kbd>. You can include the .com or omit it.<br> Examples: <kbd>go to google</kbd>, <kbd>go to google.com</kbd>, <kbd>go to amazon</kbd>, <kbd>go to facebook</kbd></p> <p style="font-style: italic">Note: there are some websites with longer names which will register erroneously with the engine. For example, there is no way to reach freecreditreport.com, which will be heard as “free credit report.com”, and will consequently send you to report.com.</p> <p>To go back one page in your history, say <kbd>back</kbd>.<br> To go forward one page in your history, say <kbd>forward</kbd>.</p> <p>To go to google.com, say <kbd>home</kbd>. This will also automatically put the extension into dictation mode, and is the fastest way to search for things.</p> <p style="font-style: italic">Note: Google can be used to indirectly reach almost any website that you can\'t navigate to directly via Hands Free. For instance, going to Google and searching for "free credit report.com" will correctly bring up as a result the actual "freecreditreport.com", which you can then click on.</p> <h3>Controlling Tabs</h3> <p>To open a new tab, say <kbd>new tab</kbd>.</p> <p style="font-style: italic">Note: There is another Chrome extension which will automatically direct new tabs to a page of your choosing. That extension can be found on <a href="https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna?hl=en">the Chrome Web Store.</a></p> <p>To close the current tab, say <kbd>close tab</kbd>.<br> To switch the active tab to the next tab in the window, say <kbd>switch</kbd>.</p> <p>To toggle mute on the current tab (muting/unmuting the entire tab), say <kbd>silence</kbd>.</p> <h3>Controlling the Window</h3> <p>To enter or exit full screen mode, say <kbd>full screen</kbd>. All commands work just the same in full screen mode.<br> To minimize, say <kbd>minimize</kbd>.<br> To maximize, say <kbd>maximize</kbd>.</p> <p>To close all Chrome windows entirely, say <kbd>exit</kbd> or <kbd>quit</kbd>.</p> <h3>Zooming</h3> <p>To zoom in, say <kbd>zoom in</kbd><br> To zoom out, say <kbd>zoom out</kbd>.<br> To restore the zoom level to normal, say <kbd>zoom normal</kbd>.</p> <h3>Refreshing</h3> <p>To reload the page, say <kbd>reload</kbd> or <kbd>refresh</kbd>.</p> <h3>YouTube</h3> <p>These commands are only applicable if you are viewing a video on youtube.com. They may work on videos playing on other websites, but success is not guaranteed.</p> <p>To pause the video, say <kbd>pause</kbd>.<br> To unpause the video, say <kbd>play</kbd>.</p> <p>To seek forward 15 seconds in the video, say <kbd>skip</kbd>.<br> To seek forward 60 seconds in the video, say <kbd>jump</kbd>.<br> To seek forward 5 minutes in the video, say <kbd>leap</kbd>.<br> To seek backward 30 seconds in the video, say <kbd>rewind</kbd>.</p> <p>To increase the video\'s volume by 20% or to max (whichever comes first), say <kbd>increase volume</kbd>.<br> To decrease the video\'s volume by 20% or to minimum (whichever comes first), say <kbd>decrease volume</kbd>.</p> <p>To mute the video, say <kbd>mute</kbd>.<br> To unmute the video, say <kbd>unmute</kbd>.</p> <p>To restart the video, say <kbd>restart</kbd>.</p> <h3>Closing Hands Free</h3> <p>Lastly, to turn off Hands Free, say <kbd>done</kbd>.</p></div>');
    
    // styling for embedded help page
    $('#hfc-help').css({
        'background': '#EDE5A4',
        'overflow-y':'scroll',
        'padding':'10px 25px',
        'border-style':'solid',
        'border-width':'3px',
        'border-color':'black',
        'z-index':'9999',
        'position':'fixed',
        'top':'30px',
        'left':'5%',
        'width': '88%',
        'height':'88%',
        'margin':'6% 10'
    });

    $('#hfc-help h2').css({
        'font-family': 'arial, sans-serif',
        'font-size': '20px',
        'height': '25px',
        'color': 'black'
    });

    $('#hfc-help h3').css({
        'font-family': 'arial, sans-serif',
        'font-size': '15px',
        'height': '18px',
        'color': 'black'
    });

    $('#hfc-help p').css({
        'font-size': '17px',
        'text-align':'left',
        'margin-top': '17px',
        'margin-bottom': '17px',
        'color': 'black'
    });

    $('#hfc-help kbd').css({
        'padding': '0.03em 0.3em',
        'border': '1px solid #ccc',
        'font-size': '14px',
        'font-family': 'Arial,Helvetica,sans-serif',
        'font-weight': 'bold',
        'background-color': '#f7f7f7',
        'color': '#333',
        '-webkit-box-shadow': '0 1px 0px rgba(0, 0, 0, 0.2),0 0 0 2px #ffffff inset',
        'border-radius': '3px',
        'display': 'inline-block',
        'margin': '0 0.1em',
        'text-shadow': '0 1px 0 #fff',
        'line-height': '1.4',
        'white-space': 'nowrap'
    });

    // adds CSS to map tags, overriding any in-page css resets
    var styleMapTags = function() {
        $('span.numTag').css({
            'background': 'white',
            'border': '1px solid black',
            'color': 'black',
            'font-size': '10pt',
            'position': 'absolute',
            'z-index': '999'
        });
    };

    // Checks if a DOM element is in the visible portion of the document
    var isScrolledIntoView = function(elem) {
        var $win = $(window);
        var $elem = $(elem);
        var docViewTop = $win.scrollTop();
        var docViewBottom = docViewTop + $win.height();
        
        var elemTop = $elem.offset().top;
        var elemBottom = elemTop + $elem.height();
        
        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
                && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
    };
    
    // Removes the numbered tags created by the map, guide, and show commands.
    var clearMapTags = function() {
        $('.numTag').remove();
        mapIsOn = false;
        guideIsOn = false;
        if (!keepShowIsOn) {
            $('.numTag').remove();
            showIsOn = false;
        }
    };
    
    // Used for the "keep scrolling [up/down]" commands
    var startScrolling = function( direction, speed ) {
        if ( direction === 'up' ) {operator = '-=';}
        if ( direction === 'down' ) {operator = '+=';}
        currentDirection = direction;
        currentSpeed = speed;
        scrollContainer.stop();
        scrollContainer.animate(
            {
                scrollTop: operator + document.body.scrollHeight
            },
            {
                duration: speed * document.body.scrollHeight / 50,
                easing: 'linear',
                complete: function() {
                    currentSpeed = null;
                }
            }
        );
    };

    // Switch from control mode to dictation mode. Inform background.js of the change,
    // who will in turn pass the message on to input.js.
    var switchDictationModeOnAndPropagate = function() {
        dictationMode = true;
        chrome.runtime.sendMessage({ greeting: {dictModeOn: true} });
    };
    
    // Used to directly inform input.js that we have switched modes.
    // Only used in the instance of control.js embedded in the input window.
    var toggleInputWindowDictationMode = function(dictationMode) {
        if (dictationMode) {
            document.getElementById('dictationEnable').click();
        } else {
            document.getElementById('dictationDisable').click();
        }
    };

    // make sure to switch all scripts out of dictation mode whenever a page changes or refreshes.
    // this is mainly to avoid unexpected behavior if user is using manual page manipulation in addition to voice
    window.onbeforeunload = function() {
        // have to distinguish between input window and main window so background.js knows who's left to inform
        if (window.location.href !== inputWindowURL) {
            chrome.runtime.sendMessage({ greeting: {dictModeOn: false, origin: 'mainWindow'} });
        } else {
            chrome.runtime.sendMessage({ greeting: {dictModeOn: false, origin: 'inputWindow'} });
        }
    };
    
    // encapsulates all user command functionality involving DOM manipulation
    var commandCenter = new (function () {

        // paints numtags next to <a>, <button>, <input>, <img>, and <textarea> elements
        var map = function() {
            if (!mapIsOn){
                clearMapTags();
                var n = 1;
                $('a, button, input, img, textarea').each(function() {
                    if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
                        var id = n;
                        var a = $(this).offset();                                   
                        $('body').append('<span class="numTag" id="' + id + '">' + id + '</span>');
                        $('#' + id).css({left: a.left - 25, top: a.top});
                        styleMapTags();
                        
                        var self = this;
                        switch( this.tagName ) {
                            case 'A':
                            case 'IMG':
                                $('#' + id).click(function() {
                                    setTimeout(function() { self.click(); }, 10);
                                });
                                break;
                            case 'BUTTON':
                                $('#' + id).click(function() {
                                    self.click();
                                });
                                break;
                            case 'INPUT':
                                if (['checkbox', 'radio', 'submit'].includes(self.type)) {
                                    $('#' + id).click(function() {
                                        self.click();
                                    });
                                    break;
                                } else if (['text', 'password', 'number'].includes(self.type)) {
                                    $('#' + id).click(function() {
                                        self.focus();
                                        switchDictationModeOnAndPropagate();
                                    });
                                }   
                                break;
                            case 'TEXTAREA':
                                $('#' + id).click(function() {
                                    self.focus();
                                    switchDictationModeOnAndPropagate();
                                });
                                break;
                        }
                        n++;
                    }
                });
                mapIsOn = true;
                return;
            }
            else {
                clearMapTags();
                return;
            }
        };

        // paints numtags next to <span> and <li> elements
        var guide = function() {
            if (!guideIsOn){
                clearMapTags();
                var n = 1;
                $('span, li').each(function(){
                    if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
                        var id = n;
                        var offset = $(this).offset();
                        $('body').append('<span class="numTag" id="' + id + '">' + id + '</span>');
                        $('#' + id).css({left: offset.left - 25, top: offset.top});
                        styleMapTags();

                        var span = this;
                        $('#' + id).click(function(){
                            setTimeout(function() { span.click(); }, 10);
                        });
                        n++;
                    }
                });
                guideIsOn = true;
                return;
            }
            else {
                clearMapTags();
                return;
            }
        };

        // same as 'map' command, but doesn't try to check whether elements are visible first,
        // so long as they're scrolled into view.
        var show = function() {
            if (!showIsOn){
                clearMapTags();
                var n = 1;
                $('a, button, input, img, textarea').each(function(){
                    if ( isScrolledIntoView(this) ) {
                        var id = n;
                        var a = $(this).offset();                                   
                        $('body').append('<span class="numTag" id="' + id + '">' + id + '</span>');
                        $('#' + id).css({left: a.left - 25, top: a.top});
                        styleMapTags();
                        
                        var self = this;
                        switch( this.tagName ) {
                            case 'A':
                            case 'IMG':
                            case 'SPAN':
                                $('#' + id).click(function(){
                                    setTimeout(function() { self.click(); }, 10);
                                });
                                break;
                            case 'BUTTON':
                                $('#' + id).click(function(){
                                    self.click();
                                });
                                break;
                            case 'INPUT':
                                if (['checkbox', 'radio', 'submit'].includes(self.type)) {
                                    $('#' + id).click(function(){
                                        self.click();
                                    });
                                    break;
                                } else if (['text', 'password', 'number'].includes(self.type)) {
                                    $('#' + id).click(function(){
                                        self.focus();
                                        switchDictationModeOnAndPropagate();
                                    });
                                }
                                break;
                            case 'TEXTAREA':
                                $('#' + id).click(function(){
                                    self.focus();
                                    switchDictationModeOnAndPropagate();
                                });
                                break;
                        }
                        n++;
                    }
                });
                showIsOn = true;
                return;
            }
            else {
                clearMapTags();
                return;
            }
        };

        var keepShowing = function() {
            chrome.runtime.sendMessage({greeting: 'KEEP_SHOWING'});
            keepShowIsOn = true;
            show();
        };

        var stopShowing = function() {
            chrome.runtime.sendMessage({greeting: 'STOP_SHOWING'});
            keepShowIsOn = false;
            clearMapTags();
        };
        
        // sends active tab to the requested webpage. currently only works with .com, .org, .edu, .gov
        var goTo = function(destination) {
            if (destination === 'undefined') {
                // sometimes webspeech sends 'go to undefined' before fully registering the input
                // so we check for those incomplete messages here and ignore them
                return;
            }
            if ( !destination.endsWith('.com') && !destination.endsWith('.edu') && 
                !destination.endsWith('.gov') && !destination.endsWith('.org') ) {
                if (destination.endsWith('.') ) {
                    destination = destination.slice(0, -1);
                }
                destination += '.com';
            }
            // sigh
            if (destination === 'readit.com' || destination === 'read.com') destination = 'reddit.com';

            window.location.href = 'http://www.' + destination;
        };

        // sends active tab straight to google.com, puts everything into dictation mode for easy googling
        var home = function() {
            /* We want to start in dictation mode when someone says home, but we can't just
              switch mode right here because the control script is about to be reloaded when
              we switch to Google, so it would immediately be set back to control mode.
              So instead we add some arbitrary hashtags to the URL, which are valid but ignored,
              and tell the control script to automatically go into dictation mode if it finds itself
              loading at that URL, where it would never otherwise be. That bit is the last thing in this file. */
            var needsRefresh = false;
            if (location.hostname === 'www.google.com') {
                needsRefresh = true;
            }
            window.location.href = 'https://www.google.com/###';
            if (needsRefresh) setDelay(function(){location.reload();}, 500);
        };

        // scrolls down 200 pixels
        var down = function() {
            scrollContainer.stop();
            clearMapTags();
            var amount = '+=' + 200;
            scrollContainer.animate(
                { scrollTop: amount }, 
                { duration: 'slow', easing: 'swing' }
            );
        };

        // scrolls up 200 pixels
        var up = function() {
            scrollContainer.stop();
            clearMapTags();
            var amount = '-=' + 200;
            scrollContainer.animate(
                { scrollTop: amount }, 
                { duration: 'slow', easing: 'swing' }
            );
        };

        // scrolls right 200 pixels
        var right = function() {
            clearMapTags();
            var amount = '+=' + 200;
            $('html, body').animate(
                { scrollLeft: amount }, 
                { duration: 'slow', easing: 'swing' }
            );
        };

        // scrolls left 200 pixels
        var left = function() {
            clearMapTags();
            var amount = '-=' + 200;
            $('html, body').animate(
                { scrollLeft: amount }, 
                { duration: 'slow', easing: 'swing' }
            );
        };

        // page down
        var fall = function() {
            scrollContainer.stop();
            clearMapTags();
            var amount = '+=' + window.innerHeight;
            scrollContainer.animate(
                { scrollTop: amount }, 
                { duration: 'slow', easing: 'swing' }
            );
        };

        // page up
        var rise = function() {
            scrollContainer.stop();
            clearMapTags();
            var amount = '-=' + window.innerHeight;
            scrollContainer.animate(
                { scrollTop: amount }, 
                { duration: 'slow', easing: 'swing' }
            );
        };

        // navigate to previous page in browser history
        var back = function() {
            window.history.back();
        };

        // navigate to next page in browser history
        var forward = function() {
            window.history.forward();
        };

        // scroll to top of page
        var top = function() {
            scrollContainer.stop();
            clearMapTags();
            scrollContainer.animate(
                { scrollTop: $('html,body').offset().top },
                { duration: 'fast', easing: 'swing'}
            );
        };

        // scroll to bottom of page
        var bottom = function() {
            scrollContainer.stop();
            clearMapTags();
            scrollContainer.animate(
                { scrollTop: scrollContainer[0].scrollHeight },
                { duration: 'fast', easing: 'swing'}
            );
        };

        // reload/refresh page
        var reload = function() {
            location.reload();
        };

        // zoom in
        var zoom = function() {
            if (bladeRunnerMode) {
                $('body').css({ '-webkit-filter': 'blur(5px)' });
            }
            $('html, body').animate(
                { zoom: zoomLevel + 0.2 },
                { duration: 'slow', easing: 'linear' }
            );
            zoomLevel = zoomLevel + 0.2;
        };

        // zoom out
        var zoomOut = function() {
            $('body').css({ '-webkit-filter': 'blur(0px)' });
            $('html, body').animate(
                { zoom: zoomLevel - 0.2 },
                { duration: 'slow', easing: 'swing' }
            );
            zoomLevel = zoomLevel - 0.2;
        };

        // reset to default zoom level (no zoom)
        var zoomNormal = function() {
            $('body').css({ '-webkit-filter': 'blur(0px)' });
            $('html, body').animate(
                { zoom: 1.0 },
                { duration: 'slow', easing: 'swing' }
            );
            zoomLevel = 1.0;
        };

        // remove blur in Blade Runner mode...zoom, enhance. zoom, enhance.
        var enhance = function() {
            if (bladeRunnerMode) {
                $('body').css({ '-webkit-filter': 'blur(0px)' });
            }
        };

        // bring up embedded help page
        var help = function() {
            if ($('#hfc-help').css('display') === 'none'){
                $('#hfc-help').fadeIn(125);
                scrollContainer = $('#hfc-help');
            } else {
                scrollContainer.fadeOut(125);
                scrollContainer.scrollTop(0);
                scrollContainer = $('html, body');
            }
        };

        // hides help page; used when extension is closed via "done" command
        var hideHelp = function() {
            if ($('#hfc-help').css('display') !== 'none') {
                $('#hfc-help').fadeOut(125);
                scrollContainer = $('html, body');
            }
        };

        // reduces speed of scrolling for "keep scrolling up/down" commands
        var slower = function() {
            if (currentSpeed) {
                currentSpeed += 250;
            }
            if (currentDirection) {
                startScrolling( currentDirection, currentSpeed );
            }
        };

        // increases speed of scrolling for "keep scrolling up/down" commands
        var faster = function() {
            if (currentSpeed) {
                currentSpeed -= 250;
            }
            if (currentSpeed <= 0) {
                currentSpeed = 5;
            }
            if (currentDirection) {
                startScrolling( currentDirection, currentSpeed );
            }
        };

        // stops scrolling, used in conjuction with "keep scrolling up/down" commands
        var stop = function() {
            scrollContainer.stop();
        };

        // toggles Blade Runner mode for zoom functions
        var toggleBRMode = function() {
            bladeRunnerMode = !bladeRunnerMode;
        };

        // starts page continuously scrolling down until it hits the end or is told to stop
        var keepScrollingDown = function() {
            startScrolling('down', scrollSpeed );
        };

        // starts page continuously scrolling up until it hits the end or is told to stop
        var keepScrollingUp = function() {
            startScrolling('up', scrollSpeed );
        };

        // starts page continuously scrolling right until it hits the end or is told to stop
        var keepScrollingRight = function() {
            console.log('not implemented');
        };

        // starts page continuously scrolling left until it hits the end or is told to stop
        var keepScrollingLeft = function() {
            console.log('not implemented');
        };

        // play main youtube video
        var play = function() {
            checkMainVideo();
            mainVideo.play();
        };

        // pause main youtube video
        var pause = function() {
            checkMainVideo();
            mainVideo.pause();
        };

        // restart main youtube video
        var restart = function() {
            checkMainVideo();
            mainVideo.currentTime = 0;
        };

        // increase volume on main youtube video
        var increaseVolume = function() {
            checkMainVideo();
            if (mainVideo.volume > 0.8) {
                mainVideo.volume = 1.0;
            } else {
                mainVideo.volume += 0.2;
            }
        };

        // decrease volume on main youtube video
        var decreaseVolume = function() {
            checkMainVideo();
            if (mainVideo.volume < 0.2) {
                mainVideo.volume = 0;
            } else {
                mainVideo.volume -= 0.2;
            }
        };

        // mute main youtube video
        var muteVideo = function() {
            checkMainVideo();
            mainVideo.muted = true;
        };

        // unmute main youtube video
        var unmuteVideo = function() {
            checkMainVideo();
            mainVideo.muted = false;
        };

        // skip forward 15 seconds or to end of main youtube video
        var skipForward = function() {
            checkMainVideo();
            if (mainVideo.currentTime + 15 >= mainVideo.duration) {
                mainVideo.currentTime = mainVideo.duration;
            } else {
                mainVideo.currentTime += 15;
            }
        };

        // skip backward 15 seconds or to beginning of main youtube video
        var skipBack = function() {
            checkMainVideo();
            if (mainVideo.currentTime - 15 <= 0) {
                mainVideo.currentTime = 0;
            } else {
                mainVideo.currentTime -= 15;
            }
        };

        // skip forward 60 seconds or to end of main youtube video
        var jumpForward = function() {
            checkMainVideo();
            if (mainVideo.currentTime + 60 >= mainVideo.duration) {
                mainVideo.currentTime = mainVideo.duration;
            } else {
                mainVideo.currentTime += 60;
            }
        };

        // skip forward 5 minutes or to end of main youtube video
        var leapForward = function() {
            checkMainVideo();
            if (mainVideo.currentTime + 300 >= mainVideo.duration) {
                mainVideo.currentTime = mainVideo.duration;
            } else {
                mainVideo.currentTime += 300;
            }
        };

        var key = {
            'map'           : map,
            'guide'         : guide,
            'show'          : show,
            'keep showing'  : keepShowing,
            'stop showing'  : stopShowing,
            'go to'         : goTo,
            'home'          : home,
            'down'          : down,
            'town'          : down, // misheard word
            'up'            : up,
            'op'            : up,   // misheard word
            'app'           : up,   // misheard word
            'right'         : right,
            'left'          : left,
            'fall'          : fall,
            'full'          : fall, // misheard word
            'song'          : fall, // misheard word
            'all'           : fall, // misheard word
            'rise'          : rise,
            'rice'          : rise, // misheard word
            'frys'          : rise, // misheard word
            'back'          : back,
            'forward'       : forward,
            'top'           : top,
            'bottom'        : bottom,
            'reload'        : reload,
            'refresh'       : reload,
            'zoom'          : zoom,
            'resume'        : zoom, // misheard word
            'zoomin'        : zoom, // misheard word
            'zoom in'       : zoom,
            'zoom out'      : zoomOut,
            'zoom normal'   : zoomNormal,
            'enhance'       : enhance,
            'help'          : help,
            'slower'        : slower,
            'flower'        : slower, // misheard word
            'faster'        : faster,
            'stop'          : stop,
            'hidehelp'      : hideHelp,
            'play'          : play,
            'pause'         : pause,
            'paws'          : pause, // misheard word
            'pawn'          : pause, // misheard word
            'mute'          : muteVideo,
            'unmute'        : unmuteVideo,
            'restart'       : restart,
            'skip'          : skipForward,
            'rewind'        : skipBack,
            'jump'          : jumpForward,
            'leap'          : leapForward,
            'increase volume'       : increaseVolume,
            'decrease volume'       : decreaseVolume,
            'blade runner mode'     : toggleBRMode,
            'keep scrolling down'   : keepScrollingDown,
            'keep scrolling up'     : keepScrollingUp,
            'keep scrolling right'  : keepScrollingRight,
            'keep scrolling left'   : keepScrollingLeft
        };
        
        this.callCommand = function( command ){
            command = commandAliases[command] || command;
            console.log('Page has received a command from Hands Free: ' + command);

            if (window.location.origin === inputWindowURL) {
                return;
            } else if ( command.split(' ')[0] + ' ' + command.split(' ')[1] === 'go to' ) {
                key['go to'](command.split(' ')[2]);
                return;
            } else if ( typeof key[command]  === 'function' ) {
                key[command]();
                return;
            }

            // 0 signifies to the caller that this is a most likely a number command for the map
            return 0;
        };
    })();
    
    // Listen for messages from background.js and handle them appropriately
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            // this time-checking thing to skip redundant requests...I think we're already doing
            // this in background.js....can we remove this here?
            if (request === lastMessage && (new Date()).getTime() - lastTime < 1000 ) {
                return;
            }

            lastMessage = request;
            lastTime = (new Date()).getTime();

            // The ONLY message that background.js allows to reach the instance of control.js in the input window
            // is the message telling it to toggle dictation mode for input.js. If this evaluates to true, then
            // that's what the message is.
            if (window.location.href === inputWindowURL) {
                console.log(request);
                toggleInputWindowDictationMode(request.dictModeOn);
                return;
            }

            // end dictation mode without submitting active form
            if (request === 'CHROME_DICTATION_STOP') {
                dictationMode = false;
                $(document.activeElement).blur();
                return;
            }

            // submit active form, end dictation mode
            if (request === 'CHROME_DICTATION_SUBMIT') {
                dictationMode = false;
                $(document.activeElement).parents('form:first').submit();
                return;
            }

            // remove last dictated word from input element
            if (request === 'CHROME_DICTATION_BACKSPACE') {
                var words = document.activeElement.value.split(' ');
                if (words.length === 1){
                    document.activeElement.value = '';
                }
                else {
                    document.activeElement.value = words.slice(0, words.length - 1).join(' ');
                }
                return;
            }

            if (request === 'CHROME_DICTATION_NEXT') {
                // move focus to next text input in current form. if we're on the last one, go back to the first one.
                var inputs = $(document.activeElement).closest('form').find(':input');
                if (inputs.length <= 1) return;
                var n = inputs.index(document.activeElement) + 1;
                var start = n;
                var pass = false;
                while (!['password', 'text', 'number', 'search'].includes(inputs.eq(n).attr('type'))) {
                    if (n === inputs.length) { 
                        n = 0;
                        pass = true;
                        continue;
                    }
                    if (pass && n === start) {
                        return;
                    }
                    n++;
                }
                inputs.eq(n).focus();
                return;
            }

            if (dictationMode) {
                // handles inserting dictated text into active input element
                if (!inputNumberBugFix && (!!parseInt(request) || request === 'att' || 
                        request === 'home') && ['', undefined].includes(document.activeElement.value)) {
                    inputNumberBugFix = true;
                    return;
                }
                if (['', undefined].includes(document.activeElement.value)) {
                    document.activeElement.value = '' + request;
                    inputNumberBugFix = false;
                } else {
                    document.activeElement.value += ' ' + request;
                    inputNumberBugFix = false;
                }
            } else {
                // handles non-dictation commands; also some cushioning against incorrect commands
                if ( !mapIsOn && !guideIsOn && !showIsOn && request === '4' ) {
                    request = 'fall';
                }

                // outside of bladeRunnerMode, only 'zoom in/out/normal' are allowed....'zoom' is ignored.
                // 'resume' is a misheard word for 'zoom', so it is also ignored.
                if ( !bladeRunnerMode && (request === 'zoom' || request === 'resume') ) {
                    return;
                }

                if (commandCenter.callCommand(request) === 0) {
                    if (request === 'att') request = '8';
                    if (request === 'sex') request = '6';
                    if (request === 'for') request = '4';
                    if (request === 'to')  request = '2';

                    var textToDigitKey = {
                        'one':      '1',
                        'two':      '2',
                        'three':    '3',
                        'four':     '4',
                        'five':     '5',
                        'six':      '6',
                        'seven':    '7',
                        'eight':    '8',
                        'nine':     '9',
                        'ten':      '10'
                    };

                    // map command uses numeric keys but WebSpeech renders first
                    // ten numbers as words rather than digits. this normalizes it.
                    request = textToDigitKey[request] || request;

                    clearTimeout(commandDelay);
                    commandDelay = setTimeout(function(){
                        $('#' + request).trigger('click');
                        clearMapTags();
                    }, 1000);
                }
            }
        }
    );
    
    // If we've just executed the 'home' command, control.js will find itself loading
    // at this URL, and therefore we should automatically start dictation mode.
    if(document.location.href === 'https://www.google.com/###') {
        switchDictationModeOnAndPropagate();
    }

    chrome.runtime.sendMessage({greeting: 'SHOW?'}, function(response) {
        if (response) {
            keepShowIsOn = true;
            commandCenter.callCommand('show');
        }
    });
});