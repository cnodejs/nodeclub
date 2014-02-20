$(document).ready(function () {
  $('#search_form').submit(function (e) {
	//e.preventDefault();
	search();
  });

  function search() {
	var q = document.getElementById('q');
	if (q.value) {
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

  var $wrapper = $('#wrapper');
  var $backtotop = $('#backtotop');
  var $sidebar = $('#sidebar');
  var top = $(window).height() - $backtotop.height() - 200;
  function moveBacktotop() {
	$backtotop.css({ top: top, right: 0});
  }
  $backtotop.click(function () {
	$('html,body').animate({ scrollTop: 0 });
	return false;
  });
  $(window).scroll(function () {
	var windowHeight = $(window).scrollTop();
	if (windowHeight > 200) {
	  $backtotop.fadeIn();
	} else {
	  $backtotop.fadeOut();
	}
  });

  moveBacktotop();
  $(window).resize(moveBacktotop);

  $('.topic_content a,.reply_content a').attr('target', '_blank');
  //ajax获取新通知并在有新通知时显示消息到页面上
  function GetNotice(){
    var _=this,
      n=0;
    this.refresh=function(){
      console.log(++n);
      $.ajax({
        url: "/notice",
        dataType:"json",
        timeout:1000*60*30,//长连接设置超时时间为半小时
        type:'POST',
        /*期望数据格式：
        * {
        *   newNotice:0,
        *   url:""
        * }
        * 若是未登录或者出现错误，则返回null
        * */
        success: function(data){
          if(data&&data!==null&&data.newNotice>0){
            var html='<a target="_blank" style="color: #005580;" href="'+data.url+'">您有'+data.newNotice+'条新消息</a>',
              _html=$("#notice_box").html();
            if(html!=_html){
              $("#notice_box").html(html).fadeIn();
            }
          }else{
            $("#notice_box").fadeOut(function(){$(this).empty()});
          }
          _.refresh();
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){
          _.refresh();
        },
        complete:function (XMLHttpRequest, textStatus) {
          XMLHttpRequest=null;
        }
      });

    }
    this.refresh();
  }
  new GetNotice();
});
