$(document).ready(function() {
	$('#search_form').submit(function(e) {
		//e.preventDefault();
		search();	
	});
	
	function search() {
		var q = document.getElementById('q');
		if (q.value != '') {
			/*
			var hostname = window.location.hostname;			
			var url = 'http://www.google.com/search?q=site:' + hostname + '%20';
			window.open(url + q.value, '_blank');
			*/
			return true;
		} else {
			return false;
		}		
	}	
  
  // 搜索预览
  (function () {
    var id = -1;
    var start = function () {
      id = setInterval(check, 1000);
    };
    var old = '';
    var check = function () {
      var q = $in.val().trim();
      if (q === '' || old === q)
        return;
      old = q; console.log(q);
      $.getJSON('http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=site:cnodejs.org+' + q + '&callback=?', function (d) {
        if (!(d.responseData && Array.isArray(d.responseData.results)))
          return;
        var list = d.responseData.results
        console.log(list);
        showList(list);
      });
    };
    var stop = function () {
      clearInterval(id);
      $list.slideUp(500);
    };
    var $in = $('input#q');
    $in.focusin(start).focusout(stop);
    $in.after('<div id="__quick_search_list" style="display:none; z-index:1000; position:fixed; padding:8px; background-color:white; opacity:0.95; color:black; font-size:14px; line-height:1.8em; border:1px solid #AAA; width:500px; box-shadow:2px 2px 4px #AAA;"></div>')
       .after('<style>.__quick_search_list_item { border-bottom:1px solid #EEE; padding:4px 0px; }\n.__quick_search_list_item:last-child { border-bottom:none; }\n.__quick_search_list_item:hover { background-color:#EEE; }\n.__quick_search_list_item span { font-size:10px ;margin-left:20px; color:#333; }\n.__quick_search_list_item b { color:#DD4B39; font-weight:normal; margin:2px; }</style>');
    var $list = $('#__quick_search_list');
    var showList = function (list) {
      var html = '';
      list.forEach(function (line) {
        html += '<div class="__quick_search_list_item"><a href="' + line.url + '">' + line.title + '</a>'
              + '<span style="font-size:12px;">' + line.content + '</span></div>';
      });
      if (html === '')
        html = '暂时没有相关结果。';
      var o1 = $in.offset();
      var o2 = {top: o1.top + $in.height() + 10, left: o1.left};
      $list.offset(o2).html(html).show();
    };
  })();

	var $wrapper = $('#wrapper');
	var $backtotop = $('#backtotop');
	var top = $(window).height() - $backtotop.height() - 90;
	$backtotop.css({ top: top, right: 100 });
	$backtotop.click(function() {
		$('html,body').animate({ scrollTop: 0 });
		return false;
	});
	$(window).scroll(function() {
		var windowHeight = $(window).scrollTop();
		if (windowHeight > 200) {
			$backtotop.fadeIn();
		} else {
			$backtotop.fadeOut();
		}
	});

	$('.topic_content a,.reply_content a').attr('target', '_blank');
});
