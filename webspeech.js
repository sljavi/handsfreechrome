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