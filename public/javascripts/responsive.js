$(document).ready(function () {
  var $responsiveBtn = $('#responsive-sidebar-trigger'),
    $sidebarMask = $('#sidebar-mask'),
    $sidebar = $('#sidebar'),
    $main = $('#main'),
    winWidth = $(window).width(),
    startX = 0,
    startY = 0,
    delta = {
      x: 0,
      y: 0
    },
    swipeThreshold = winWidth / 3,
    toggleSideBar = function () {
      var isShow = $responsiveBtn.data('is-show'),
        mainHeight = $main.height(),
        sidebarHeight = $sidebar.outerHeight();
      $sidebar.css({right: isShow ? -300 : 0});
      $responsiveBtn.data('is-show', !isShow);
      if (!isShow && mainHeight < sidebarHeight) {
        $main.height(sidebarHeight);
      }
      $sidebarMask[isShow ? 'fadeOut' : 'fadeIn']().height($('body').height());
      $sidebar[isShow ? 'hide' : 'show']()
    },
    touchstart = function (e) {
      var touchs = e.targetTouches;
      startX = +touchs[0].pageX;
      startY = +touchs[0].pageY;
      delta.x = delta.y = 0;
      document.body.addEventListener('touchmove', touchmove, false);
      document.body.addEventListener('touchend', touchend, false);
    },
    touchmove = function (e) {
      var touchs = e.changedTouches;
      delta.x = +touchs[0].pageX - startX;
      delta.y = +touchs[0].pageY - startY;
      //当水平距离大于垂直距离时，才认为是用户想滑动打开右侧栏
      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        e.preventDefault();
      }
    },
    touchend = function (e) {
      var touchs = e.changedTouches,
        isShow = $responsiveBtn.data('is-show');
      delta.x = +touchs[0].pageX - startX;
      //右侧栏未显示&&用户touch点在屏幕右侧1/4区域内&&move距离大于阀值时，打开右侧栏
      if (!isShow && (startX > winWidth * 3 / 4) && Math.abs(delta.x) > swipeThreshold) {
        $responsiveBtn.trigger('click');
      }
      //右侧栏显示中&&用户touch点在屏幕左侧侧1/4区域内&&move距离大于阀值时，关闭右侧栏
      if (isShow && (startX < winWidth * 1 / 4) && Math.abs(delta.x) > swipeThreshold) {
        $responsiveBtn.trigger('click');
      }
      startX = startY = 0;
      delta.x = delta.y = 0;
      document.body.removeEventListener('touchmove', touchmove, false);
      document.body.removeEventListener('touchend', touchend, false);
    };

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    document.body.addEventListener('touchstart', touchstart);
  }

  $responsiveBtn.on('click', toggleSideBar);

  $sidebarMask.on('click', function () {
    $responsiveBtn.trigger('click');
  });

});
