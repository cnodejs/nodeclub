$(document).ready(function () {
  $("#say-sentence").click(function() {
    if($("#zh-sentence").css("display") === "none")  {
      // 说英文
      $.say($("#en-sentence").text());
      //console.log($("#en-sentence").text());
    }
  });
});
