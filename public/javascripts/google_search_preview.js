$(function () {
  if (typeof __google_search_domain === 'string' && __google_search_domain !== '') {
    var siteHost = __google_search_domain;
  }
  else if (['127.0.0.1', 'localhost'].indexOf(location.hostname) !== -1) {
    var siteHost = 'cnodejs.org';
  }
  else {
    var siteHost = location.hostname;
  }
  var id = -1;
  var start = function () {
    id = setInterval(check, 1000);
  };
  var old = '';
  var check = function () {
    var q = $in.val().trim();
    if (q === '' || old === q) {
      return;
    }
    old = q;
    var url = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=site:' + siteHost + '+' + q + '&callback=?';
    $.getJSON(url, function (d) {
      if (!(d.responseData && Array.isArray(d.responseData.results))) {
        return;
      }
      var list = d.responseData.results;
      showList(list);
    });
  };
  var stop = function () {
    clearInterval(id);
    $list.slideUp(500);
  };
  var $in = $('input#q');
  $in.attr('autocomplete', 'off');
  $in.focusin(start).focusout(stop);
  $in.after('<div id="__quick_search_list" style="display:none; z-index:1000; position:fixed; padding:8px; background-color:white; opacity:0.95; color:black; font-size:14px; line-height:1.8em; border:1px solid #AAA; width:500px; box-shadow:2px 2px 4px #AAA;"></div>')
    .after('<style>.__quick_search_list_item { border-bottom:1px solid #EEE; padding:4px 0px; }\n.__quick_search_list_item:last-child { border-bottom:none; }\n.__quick_search_list_item:hover { background-color:#EEE; }\n.__quick_search_list_item span { font-size:10px ;margin-left:20px; color:#333; }\n.__quick_search_list_item b { color:#DD4B39; font-weight:normal; margin:2px; }</style>');
  var $list = $('#__quick_search_list');
  var showList = function (list) {
    var html = '';
    list.forEach(function (line) {
      html += '<div class="__quick_search_list_item"><a href="' + line.url + '">' + line.title + '</a>' +
        '<span style="font-size:12px;">' + line.content + '</span></div>';
    });
    if (!html) {
      html = '暂时没有相关结果。';
    }
    var o1 = $in.offset();
    var o2 = {top: o1.top + $in.height() + 10, left: o1.left};
    $list.offset(o2).html(html).show();
  };
});