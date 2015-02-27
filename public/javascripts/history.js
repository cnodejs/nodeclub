(function ($) {
  if (!!window.ActiveXObject && !window.XMLHttpRequest && (location.href=='http://www.orgsc.com' || location.href=='http://www.orgsc.com/')) return;
  $(function () {
    bnrSilder();
    helpToggle();
    systole();
  });

//滚动
  function bnrSilder() {
    if (!$("#head").length && !$("#bnr").length) {
      return;
    }
    (function () {
      if (navigator.userAgent.toLocaleLowerCase().indexOf('opera') >= 0) return;
      var sstag = document.createElement('script');
      sstag.type = 'text/javascript';
      sstag.async = true;
      sstag.src = 'script/SmoothScroll.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(sstag, s);
    })();
    $(window).scroll(function () {
      var bTop = $(this).scrollTop();
      $('.bnr-box').css({
        'margin-top':-bTop * 0.48
      });
      $('.bnr-txt').css({
        'margin-top':-bTop * 0.68
      });
      $('.bnr-btn').css({
        'margin-top':-bTop * 0.68
      });
      $('.warper').css({
        "background-position":"50% " + bTop * 0.2 + "px"
      });
      if (bTop < 200) {
        $(".txt-warp").css({
          'margin-top':-bTop * 1.5
        });
        $(".txt-nav-warp").removeAttr("style");
      } else {
        $(".txt-warp").css({
          'margin-top':-240
        });
        $(".txt-nav-warp").css({
          "position":"fixed",
          "top":0,
          "left":0,
          "box-shadow":"0 2px 6px #eee"
        });

      }
      var idxs = 0;
      if (bTop >= 200 && bTop < 577) {
        idxs;
      } else if (bTop >= 577 && bTop < 1072) {
        idxs = 1;
      } else if (bTop >= 1072 && bTop < 1165) {
        idxs = 2;
      } else if (bTop >= 1165) {
        idxs = 3;
      }
      $('.txt-nav li a').eq(idxs).addClass('on').parent().siblings().children().removeClass

        ('on');
      if (bTop < 200) {
        $('.txt-nav li a').removeClass('on');
      }
    });
  };

  function helpToggle() {
    if (!$(".help-cont dl dt a").length) {
      return;
    }
    var $targetEle = $(".help-cont dl dt a");
    $targetEle.toggle(function () {
      $(this).parent().css({
        "background-position":"0 -20px"
      }).siblings().slideDown();
      return false;
    }, function () {
      $(this).parent().removeAttr("style").siblings().slideUp();
      return false;
    });
  }

  ;

  function systole() {
    if (!$(".history").length) {
      return;
    }
    var $warpEle = $(".history-date"),
      $targetA = $warpEle.find("h2 a,ul li dl dt a"),
      parentH,
      eleTop = [];
    parentH = $warpEle.parent().height();
    $warpEle.parent().css({
      "height":59
    });
    setTimeout(function () {

      $warpEle.find("ul").children(":not('h2:first')").each(function (idx) {
        eleTop.push($(this).position().top);
        $(this).css({
          "margin-top":-eleTop[idx]
        }).children().hide();
      }).animate({
          "margin-top":0
        }, 1600).children().fadeIn();
      $warpEle.parent().animate({
        "height":parentH
      }, 2600);

      $warpEle.find("ul").children(":not('h2:first')").addClass("bounceInDown").css({
        "-webkit-animation-duration":"2s",
        "-webkit-animation-delay":"0",
        "-webkit-animation-timing-function":"ease",
        "-webkit-animation-fill-mode":"both"
      }).end().children("h2").css({
          "position":"relative"
        });
    }, 600);

    $targetA.click(function () {
      $(this).parent().css({
        "position":"relative"
      });
      $(this).parent().siblings().slideToggle();
      $warpEle.parent().removeAttr("style");
      return false;
    });

  }

  ;


})(jQuery);
