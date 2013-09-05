		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
		<script type="text/javascript">
			function isScrolledIntoView(elem)
			{
				var docViewTop = $(window).scrollTop();
				var docViewBottom = docViewTop + $(window).height();

				var elemTop = $(elem).offset().top;
				var elemBottom = elemTop + $(elem).height();

				return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
				  && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
			}
		</script>
		
		/*
		*
		* You're going to have to user the browser action to set the initial
		* speech object running...how the hell are you going to set it running
		* again on each successive page load? FUCK. when a link is loaded, open
		* new tab...send message to that tab to start that tab's speech object...
		* then end current speech object. when we switch tab, same thing. we just
		* need that initial push from the browser action. :) although, with this
		* scheme, any manual link clicking would cancel out the chain. hmm.
		*
		*/
		
		<script type="text/javascript">
			if ('webkitSpeechRecognition' in window) {			
				var recognition = new webkitSpeechRecognition();
				var result = null;
				recognition.onresult = function(event) {
				  if (event.results.length > 0) {
					q.value = event.results[0][0].transcript;
					result = event.results[0][0].transcript;
				  }
				  if (result == "map"){
					var n = 1;
					$('a').each(function(){
						if (isScrolledIntoView(this)){
							var id = n;
							var a = $(this).offset();
							$('body').append('<span id="' + id + '" style="background:white; position:absolute; z-index:999;">' + id + '</span>');
							$('#'+id).css({left: a.left, top: a.top});
							n++;
						}
					});
				  }
				}
			}
		</script>