$(document).ready(function(){
  var $responsiveBtn = $('#responsive-sidebar-trigger'),
      $sidebarMask = $('#sidebar-mask'),
      $sidebar = $('#sidebar'),
      $main = $('#main'),
      startX = 0,
      swipeThreshold = 10,
      toggleSideBar = function(){
        var isShow = $responsiveBtn.data('is-show'),
            mainHeight = $main.height(),
            sidebarHeight = $sidebar.outerHeight();
        $sidebar.css({right:isShow?-300:0});
        $responsiveBtn.data('is-show', !isShow);
        if(!isShow && mainHeight < sidebarHeight){
          $main.height(sidebarHeight);
        }
        $sidebarMask[isShow?'fadeOut':'fadeIn']().height($('body').height());
      },
      touchstart = function(e){
        var touchs = e.targetTouches;
        startX = +touchs[0].pageX;
      },
      touchmove = function(e){
        var touchs = e.changedTouches;
        if(Math.abs(+touchs[0].pageX - startX) > swipeThreshold){
          e.preventDefault();
        }
      },
      touchend = function(e){
        var touchs = e.changedTouches,
            x = +touchs[0].pageX,
            winWidth = $(window).width(),
            isShow = $responsiveBtn.data('is-show');
        if(!isShow && (startX > winWidth*3/4) && Math.abs(startX - x) > swipeThreshold){
          $responsiveBtn.trigger('click');
        }
        if(isShow && (startX < winWidth*1/4) && Math.abs(startX - x) > swipeThreshold){
          $responsiveBtn.trigger('click');
        }
        startX = 0;
      };

  if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
    document.body.addEventListener('touchstart', touchstart);
    document.body.addEventListener('touchmove', touchmove);
    document.body.addEventListener('touchend', touchend);
  }

  $responsiveBtn.on('click', toggleSideBar);

  $sidebarMask.on('click', function() {
    $responsiveBtn.trigger('click');
  });

});