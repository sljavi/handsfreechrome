$(function() {
	var map_is_on = false;
	var zoomLevel = 1.0;
	var dictation_mode = false;
	var bladeRunnerMode = false;
	
	var scrollSpeed = 800;
	var scrollContainer = $('html, body');
	var currentDirection = null;
	var currentSpeed = null;
	
	var lastMessage = null;
	var lastTime = (new Date()).getTime();
	var commandDelay = null;

	var inputNumberBugFix = false;
	
	$('body').css({ '-webkit-transition': '0.3s ease-in-out' });
	var blurred = false;

	//embedded help page...non-compact HTML/CSS in help.html and help.css
	$('body').append('<div id="hfc_help" style="display:none;"><h2>Hands Free Chrome Command Guide</h2><hr><p>Say <kbd>help</kbd> again to hide this guide. Use the scrolling commands to scroll around the guide.</p><h3>Scrolling</h3><p>To scroll up a small amount, say <kbd>up</kbd>.<br>To scroll down a small amount, say <kbd>down</kbd>.<br>To scroll a small amount to the right, say <kbd>right</kbd>.<br>To scroll a small amount to the left, say <kbd>left</kbd>.</p><p>To page up, say <kbd>rise</kbd>.<br>To page down, say <kbd>fall</kbd>.</p><p>To scroll to the bottom of the page, say <kbd>bottom</kbd>.<br>To scroll to the top of the page, say <kbd>top</kbd>.</p><p>To set the page scrolling continuously up, say <kbd>keep scrolling up</kbd>.<br>To set the page scrolling continuously down, say <kbd>keep scrolling down</kbd>.<br>To stop the page from continously scrolling, say <kbd>stop</kbd>.<br>To control the speed of scrolling, say <kbd>faster</kbd> or <kbd>slower</kbd>. The changes will besmall, but you can issue these commands repeatedly for incremental gains.</p><h3>Clicking</h3><p>To paint number tags alongside what are most likely visible, clickable elements on the page, say <kbd>map</kbd>. <br>Saying <kbd>map</kbd> a second time will hide the number tags, as will using any of the scrolling commands.</p><p>If the element you wish to click is not numbered by map, try hiding the numbers and using <kbd>guide</kbd> instead.</p><p><i>Note: The system by which clickable elements are numbered will be heavily improved in the future, but for the time being there will be many frustrations in the placement of the numbers.</i></p><p>To click a numbered element, simply speak the number. Enunciate very clearly— the speech engine will readily confuse numbers like 15 and 50, or 16 and 60. If the number consists of multiple words, it may help to say it a little faster—if you say “fifty five” too slowly, the engine will register “fifty” before you finish speaking. Again, enunciate as clearly as possible.</p><h3>Dictation Mode</h3><p>If you’ve clicked a text input, Hands Free will switch into dictation mode, and anything you say will be written as text into the selected text input.</p><p>To turn off dictation mode and return to the normal control functionality, say <kbd>stop</kbd>.<br>To submit the textbox you’re typing in (the equivalent of pressing ‘enter’), say <kbd>go</kbd>. This is what you want when you finish typing in a searchbox, for example.<br>To move the cursor to the next input in the form (for example, from username to password), say <kbd>next</kbd>.<br><br><i>Note: Buttons in forms count as inputs, so you may inadvertently move to a button first. Simply continue to say next until the input you desire is selected.</i><br><br>To remove the last word you entered from the textbox, say <kbd>undo</kbd>.</p><h3>Navigation</h3><p>To go to ANY website, say the name of the website on its own with the domain specified. There is no need to say “www.”<br>Examples: <kbd>google.com</kbd>, <kbd>en.wikipedia.org</kbd>, <kbd>mit.edu</kbd>, <kbd>fr.wikipedia.org</kbd></p><p>To go to a particular .com website, say <kbd>go to [website name]</kbd>. You can include the .com or omit it.<br>Examples: <kbd>go to google</kbd>, <kbd>go to google.com</kbd>, <kbd>go to amazon</kbd>, <kbd>go to facebook</kbd></p><p><i>Note: there are some websites with longer names which will register erroneously with the engine. For example, there is no way to reach freecreditreport.com, which will be heard as “free credit report.com”, and will consequently send you to report.com.</i></p><p>To go back one page in your history, say <kbd>back</kbd>.<br>To go forward on page in your history, say <kbd>forward</kbd>.</p><p>To go to google.com, say <kbd>home</kbd>.</p><h3>Controlling Tabs</h3><p>To open a new tab, say <kbd>new tab</kbd>.</p><p><i>Note: When opening a new tab, this extension will stop working unless you have installed the new tab redirect extension, which will direct new tabs to default to a page of your choosing. That extension can be found at https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna?hl=en</i></p><p>To close the current tab, say <kbd>close tab</kbd>.<br>To switch the active tab to the next tab in the window, say <kbd>switch</kbd>.</p><h3>Controlling the Window</h3><p>To enter or exit full screen mode, say <kbd>full screen</kbd>. All commands work just the same in full screen mode.<br>To minimize, say <kbd>minimize</kbd>. </p><p><i>Note: Unfortunately the ‘maximize’ command is broken in Chrome. You may be able to restore your window from a minimized state by using the full screen command and then toggling it off, but this has lately proved unreliable. Using the minimize command is currently not recommended.</i></p><p>To close all Chrome windows entirely, say <kbd>exit</kbd> or <kbd>quit</kbd>.</p><h3>Zooming</h3><p>To zoom in, say <kbd>zoom in</kbd>, or just <kbd>zoom</kbd>.<br>To zoom out, say <kbd>zoom out</kbd>.<br>To restore the zoom level to normal, say <kbd>zoom normal</kbd>.<br><br><i>Note: The zoom normal command oftentimes fails once or twice. Try repeating it after a moment.</i></p><h3>Refreshing</h3><p>To reload the page, say <kbd>reload</kbd> or <kbd>refresh</kbd>.</p><h3>Closing Hands Free</h3><p>Lastly, to turn off Hands Free, say <kbd>done</kbd>.</p></div>');
	$('div#hfc_help').css({'background': '#EDE5A4', 'overflow-y':'scroll', 'padding':'10px 25px', 'border-style':'solid', 'border-width':'3px', 'border-color':'black', 'z-index':'9999','position':'fixed', 'top':'30px', 'left':'5%', 'width': '88%', 'height':'88%', 'margin':'6% 10'});
	$('div#hfc_help p').css({'font-size': '17px', 'text-align':'left'});
	$('div#hfc_help kbd').css({'padding': '0.03em 0.3em','border': '1px solid #ccc','font-size': '14px','font-family': 'Arial,Helvetica,sans-serif','font-weight': 'bold','background-color': '#f7f7f7','color': '#333','-webkit-box-shadow': '0 1px 0px rgba(0, 0, 0, 0.2),0 0 0 2px #ffffff inset','border-radius': '3px','display': 'inline-block','margin': '0 0.1em','text-shadow': '0 1px 0 #fff','line-height': '1.4','white-space': 'nowrap'});

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

	function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
		  && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
	}

	function clearMapTags() {
		$('.numTag').remove();
		map_is_on = false;
	}
	
	function startScrolling( direction, speed ) {
		if ( direction === "up" ) {operator = "-=";}
		if ( direction === "down" ) {operator = "+=";}
		currentDirection = direction;
		currentSpeed = speed;
		scrollContainer.stop();
		scrollContainer.animate(
			{scrollTop: operator + document.body.scrollHeight},
			{
				duration: speed * document.body.scrollHeight / 50,
				easing: 'linear',
				complete: function() { currentSpeed = null; }
			}
		);
	}
	
	function switch_mode(turn_on) {
		console.log("mode switched");
		if (turn_on) {
			dictation_mode = true;
		} else {
			dictation_mode = false;
		}
		chrome.runtime.sendMessage({greeting: {dictModeOn : dictation_mode} }, function(response) {
			console.log(response);
		});
	}
			
	function inform_input_page(turn_on) {
		document.getElementById('modeSwitch').click();
	}

	//encapsulates all user command functionality involving DOM manipulation
	var commandCenter = new (function () {
		var map = function() {
			if (!map_is_on){
				var n = 1;
				$('a,button,input,img').each(function(){
					if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
						var id = n;
						var a = $(this).offset();									
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: a.left - 25, top: a.top});
						
						var self = this;
						switch( this.tagName)
						{
						case 'A':
							$('#'+id).click(function(){
								setTimeout(function() { self.click(); }, 10);
							});
							break;
						case 'IMG':
							$('#'+id).click(function(){
								setTimeout(function() { self.click(); }, 10);
							});
							break;
						case 'BUTTON':
							$('#'+id).click(function(){
								self.click();
							});
							break;
						//needs to only switch_mode on certain types of input, not all
						case 'INPUT':
							$('#'+id).click(function(){
								self.focus();
								switch_mode(true);
							});
							break;
						}
						n++;
					}
				});
				map_is_on = true;
				return;
			}
			else {
				clearMapTags();
				return;
			}
		};
		var guide = function() {
			if (!map_is_on){
				var n = 1;
				$('span, li').each(function(){
					if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
						var id = n;
						var offset = $(this).offset();
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: offset.left - 25, top: offset.top});
						var span = this;
						$('#'+id).click(function(){
							setTimeout(function() { span.click(); }, 10);
						});
						n++;
					}
				});
				map_is_on = true;
				return;
			}
			else {
				clearMapTags();
				return;
			}
		};
		//we're going to have to make it an added function of this extension that whenever chrome says "oops did you mean..." it auto-redirects to google or something
		//otherwise the extension stops working completely because there's no control script because we're not on an http page
		var go_to = function(destination) {
			if (destination === "undefined") {
				console.log("skipping a fake");
				return;
			}
			if ( !destination.endsWith(".com") && !destination.endsWith(".edu") && !destination.endsWith(".gov") && !destination.endsWith(".org") ) {
				if (destination.endsWith(".") ) {
					destination = destination.slice(0,-1);
				}
				destination += ".com";
			}
			console.log("about to go to " + destination);
			window.location.href = "http://www." + destination;
		};
		var home = function() {
			window.location.href = "https://www.google.com";
		}
		var down = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + 200;
			scrollContainer.animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var up = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + 200;
			scrollContainer.animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var right = function() {
			clearMapTags();
			var amount = '+=' + 200;
			$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var left = function() {
			clearMapTags();
			var amount = '-=' + 200;
			$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var fall = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + window.innerHeight;
			scrollContainer.animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var rise = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + window.innerHeight;
			scrollContainer.animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		var back = function() {
			window.history.back();
			return;
		};
		var forward = function() {
			window.history.forward();
			return;
		};
		var top = function() {
			scrollContainer.stop();
			clearMapTags();
			scrollContainer.animate(
				{ scrollTop: $('html,body').offset().top },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		var bottom = function() {
			scrollContainer.stop();
			clearMapTags();
			scrollContainer.animate(
				{ scrollTop: $(document).height() },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		var reload = function() {
			location.reload();
			return;
		};
		var zoom = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(5px)' });
			}
			$('html, body').animate(
				{ zoom: zoomLevel + 0.2 },
				{ duration: 'slow', easing: 'linear' }
			);
			zoomLevel = zoomLevel + 0.2;
			return;
		};
		var zoom_out = function() {
			$('body').css({ '-webkit-filter': 'blur(0px)' });
			$('html, body').animate(
				{ zoom: zoomLevel - 0.2 },
				{ duration: 'slow', easing: 'swing' }
			);
			zoomLevel = zoomLevel - 0.2;
			return;
		};
		var zoom_normal = function() {
			$('body').css({ '-webkit-filter': 'blur(0px)' });
			$('html, body').animate(
				{ zoom: 1.0 },
				{ duration: 'slow', easing: 'swing' }
			);
			zoomLevel = 1.0;
			return;
		};
		var enhance = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			return;
		};
		var help = function() {
			if ($('#hfc_help').css('display') === 'none'){
				$('#hfc_help').fadeIn(125);
				scrollContainer = $('#hfc_help');
			} else {
				scrollContainer.fadeOut(125);
				scrollContainer.scrollTop(0);
				scrollContainer = $('html, body');
			}
		};
		var slower = function() {
			if (currentSpeed) {
				currentSpeed += 250;
			}
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		var faster = function() {
			if (currentSpeed) {
				currentSpeed -= 250;
			}
			if (currentSpeed <= 0) {
				currentSpeed = 5;
			}
			console.log(currentSpeed);
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		var stop = function() {
			scrollContainer.stop();
		};
		var toggle_BR_mode = function() {
			bladeRunnerMode = !bladeRunnerMode;
		};
		var keep_scrolling_down = function() {
			startScrolling( "down", scrollSpeed );
		};
		var keep_scrolling_up = function() {
			startScrolling( "up", scrollSpeed );
		};
		var keep_scrolling_right = function() {
			console.log("not implemented");
		};
		var keep_scrolling_left = function() {
			console.log("not implemented");
		};

		this.call = function( command ){
			var key = {
				'map'			: map,
				'guide'			: guide,
				'go_to'			: go_to,
				'home'			: home,
				'down'			: down,
				'town'			: down, //misheard word
				'up'			: up,
				'op'			: up,   //misheard word
				'right'			: right,
				'left'			: left,
				'fall'			: fall,
				'full'			: fall, //misheard word
				'song'			: fall, //misheard word
				'all'			: fall, //misheard word
				'rise'			: rise,
				'frys'			: rise, //misheard word
				'back'			: back,
				'forward'		: forward,
				'top'			: top,
				'bottom'		: bottom,
				'reload'		: reload,
				'refresh'		: reload,
				'zoom'			: zoom,
				'zoom in'		: zoom,
				'zoom out'		: zoom_out,
				'zoom normal'	: zoom_normal,
				'enhance'		: enhance,
				'help'			: help,
				'slower'		: slower,
				'faster'		: faster,
				'stop'			: stop,
				'Blade Runner mode'		: toggle_BR_mode,
				'keep scrolling down'	: keep_scrolling_down,
				'keep scrolling up'		: keep_scrolling_up,
				'keep scrolling right'	: keep_scrolling_right,
				'keep scrolling left'	: keep_scrolling_left
			};
			console.log("Page has received command: " + command);
			if (window.location.origin === 'https://handsfreechrome.com/input.html') {
				return -1;
			}
			if ( command.split(" ")[0] + command.split(" ")[1] === "goto" ) {
				console.log(command.split(" ")[2]);
				key.go_to(command.split(" ")[2]);
			}
			if ( typeof key[command]  === 'function' ) {
					key[command]();
				return 1;
			}
			return 0;
		};
	})();

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log("got a message: " + request);
			if (request === lastMessage && (new Date()).getTime() - lastTime < 1000 ) {
				return;
			}
			lastMessage = request;
			lastTime = (new Date()).getTime();
			if (window.location.href === 'https://handsfreechrome.com/input.html') {
				inform_input_page(request.dictModeOn);
				return;
			}
			if (request === "CHROME_DICTATION_STOP") {
				dictation_mode = false;
				$(document.activeElement).blur();
			}
			if (request === "CHROME_DICTATION_SUBMIT") {
				dictation_mode = false;
				$(document.activeElement).parents('form:first').submit();
			}
			if (request === "CHROME_DICTATION_UNDO") {
				var words = document.activeElement.value.split(" ");
				if (words.length === 1){
					document.activeElement.value = "";
				}
				else {
					document.activeElement.value = words.slice(0, words.length - 1).join(" ");
				}
			}
			if (request === "CHROME_DICTATION_NEXT") {
				console.log("attempting to next");
				var inputs = $(document.activeElement).closest('form').find(':input');
				if ( inputs.index(document.activeElement) === inputs.length - 1) {
					inputs.eq(0).focus();
				}
				else if (inputs.length > 1) {
					inputs.eq(inputs.index(document.activeElement) + 1).focus();
				}
			}
			if (!dictation_mode) {
				if (request.startsWith("zoom")) {
					clearTimeout(commandDelay);
					commandDelay = setTimeout(function(){
						commandCenter.call(request);
					}, 1000);
				} else if (commandCenter.call(request) === 0) {
					if (request === "att") request = "8";
					if (request === "sex") request = "6";
					clearTimeout(commandDelay);
					commandDelay = setTimeout(function(){
						$('#'+request).trigger("click");
						clearMapTags();
					}, 1000);
				}
			} else {
				if (!inputNumberBugFix && !!parseInt(request) && contains(["", undefined], document.activeElement.value)) {
					inputNumberBugFix = true;
					return;
				}
				if (contains(["", undefined], document.activeElement.value)) {
					document.activeElement.value = "" + request;
				} else {
					document.activeElement.value +=  " " + request;
				}
			}
		}
	);
});