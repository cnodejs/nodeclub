$(document).ready(function () {
  // pretty code
  prettyPrint();

  //fancy image
  $('.topic_content img,.reply_content img').each(function () {
    if ($(this).width > 500) {
      $(this).width(500);
    }
    var elem = $('<a class="content_img"></a>');
    elem.attr('href', $(this).attr('src'));
    $(this).wrap(elem);
  });
  $('.content_img').fancybox({
    transitionIn: 'elastic',
    transitionOut: 'elastic'
  });
});
