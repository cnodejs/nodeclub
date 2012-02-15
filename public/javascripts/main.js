$(document).ready(function(){
	$('#search_form').submit(function(e){
		e.preventDefault();
		search();	
	});
	
	function search(){
		var q = document.getElementById('q');
		if (q.value != '') {
			window.open('http://www.google.com/search?q=site:%20' + q.value, '_blank');
			return false;
		} else {
			return false;
		}		
	}	

	var $wrapper = $('#wrapper');
	var $backtotop = $('#backtotop');
	var top = $(window).height() - $backtotop.height() - 90;
	$backtotop.css({top:top,right:100});
	$backtotop.click(function(){
		$('html,body').animate({scrollTop:0});
		return false;
	});
	$(window).scroll(function() {
		var windowHeight = $(window).scrollTop();
		if(windowHeight > 200) {
			$backtotop.fadeIn();
		}else{
			$backtotop.fadeOut();
		}
	});

	$('.topic_content a,.reply_content a').attr('target','_blank');
});
