//用逗号分隔用户名
var userarray = "guxizhao,zou-dao-kou,xiaodaoren,cai-tong,xu-xiang-nan,unogzx,shenbin,PeterDeng,namiheike,wu-si-yang-32,yskin,jixin";
//回答数限制
var answerlimit = 10;
//赞同数限制
var agreelimit = 1000;
//赞同回答比数限制
var ratiolimit = 10;
//关注者数限制
var followerlimit = 10;

var users = userarray.split(',');
var usercursor = 0;
var result = new Array();
var showtable = true;
var cardcount = 0;

function showmsg(msg) { $("#msg").html(msg); }
function showresult() {
  $("#switchshowtable").show(0);
  $("#sorttype").show(0);
  var rsdiv = $("#result");
  if (showtable) {
    var tablehtm = "<table border='1' cellpadding='2' style='border-collapse: collapse;'>" +
                      "<tr>" +
                        "<td>编号</td>" +
                        "<td>用户名</td>" +
                        "<td>关注者</td>" +
                        "<td>提问</td>" +
                        "<td>回答</td>" +
                        "<td>赞同</td>" +
                        "<td>赞同/回答比</td>" +
                      "</tr>";
    for (i in result) {
      tablehtm += "<tr><td>" + (parseInt(i) + 1) + "</td><td><a href='/people/" + result[i].id + "/' target='_blank'>" + result[i].name + "</a></td><td>" + result[i].follower + "</td><td>" + result[i].ask + "</td><td>" + result[i].answer + "</td><td>" + result[i].agree + "</td><td>" + result[i].ratio + "</td></tr>";
    }
    tablehtm += "</table>";
    rsdiv.html(tablehtm);
  }
  else {
    rsdiv.html("编号,用户名,关注者,提问,回答,赞同,赞同/回答比");
    for (i in result) {
      rsdiv.append("<br/>" + (parseInt(i) + 1) + ",<a href='/people/" + result[i].id + "/' target='_blank'>" + result[i].name + "</a>," + result[i].follower + "," + result[i].ask + "," + result[i].answer + "," + result[i].agree + "," + result[i].ratio);
    }
  }
}

function loadmore() {
  var content = $("#tempframe").contents();
  var name = content.find(".title-section.ellipsis a").html();
  if (content.find('.zu-button-more[aria-role]').length < 1) {
    showmsg(name + "的" + cardcount + "个关注者加载完成");
    showratio();
  }
  else {
    content.find('.zu-button-more[aria-role]').get(0).click();
    var total = content.find(".zm-profile-side-following strong").html();
    cardcount = content.find('.zh-general-list .zm-profile-card .zm-list-content-medium').length;
    showmsg("正在加载" + name + "的关注者:" + cardcount + "/" + total + "... <img style='vertical-align: text-bottom;' src='http://static.zhihu.com/static/img/spinner/grey-loading.gif'/>");
    setTimeout(loadmore, 100);
  }
}

function showratio() {
  var cards = $("#tempframe").contents().find('.zh-general-list .zm-profile-card .zm-list-content-medium');
  cards.each(function () {
    var name = $(this).find('a.zg-link').html();
    var id = $(this).find('a.zg-link').attr("href").replace("http://www.zhihu.com/people/", "");
    var detail = $(this).find('.details');
    var follower = Number(detail.eq(0).children().eq(0).html().split(' ')[0]);
    var ask = Number(detail.eq(0).children().eq(1).html().split(' ')[0]);
    var answer = Number(detail.eq(0).children().eq(2).html().split(' ')[0]);
    var agree = Number(detail.eq(0).children().eq(3).html().split(' ')[0]);
    if (answer >= answerlimit && agree >= agreelimit && agree / answer >= ratiolimit && follower > followerlimit) {
      var r = new Object();
      r.name = name;
      r.id = id;
      r.follower = follower;
      r.ask = ask;
      r.agree = agree;
      r.answer = answer;
      r.ratio = (agree / answer).toFixed(2);
      addresult(r);
    }
  });
  sortresult();
  showresult();
  usercursor++;
  loaduser();
}

function loaduser() {
  if (usercursor < users.length) {
    showmsg("共" + users.length + "个用户，准备扫描第" + (usercursor + 1) + "个... <img style='vertical-align: text-bottom;' src='http://static.zhihu.com/static/img/spinner/grey-loading.gif'/>");
    $("#tempframe").attr("src", "/people/" + users[usercursor] + "/followers");
  }
  else {
    showmsg("所有" + users.length + "名用户的关注者已经全部扫描完成，共找到" + result.length + "个符合条件的用户");
  }
}

function addresult(r) {
  var exist = false;
  for (i in result) { if (r.id == result[i].id) { exist = true; break; } }
  if (!exist) result.push(r);
}

function sortresult() {
  if (result.length > 0) {
    var type = $("#sorttype").val();
    switch (type) {
      case "ratio":
        result = result.sort(function (a, b) { return b.ratio - a.ratio; });
        break;
      case "agree":
        result = result.sort(function (a, b) { return b.agree - a.agree; });
        break;
      case "answer":
        result = result.sort(function (a, b) { return b.answer - a.answer; });
        break;
      case "ask":
        result = result.sort(function (a, b) { return b.ask - a.ask; });
        break;
      case "follower":
        result = result.sort(function (a, b) { return b.follower - a.follower; });
        break;
      default:
        break;
    }
  }
}

$("body").prepend('' +
  '<div id="mask" style="width:100%;height:100%;top:0px;left:0px;position:fixed;z-index: 998;background-color: rgba(0, 0, 0, 0.4);text-align:center;">' +
  '  <div id="container" style="width:600px;height:400px;margin:80px auto 0px auto;position: relative;z-index: 999; padding: 5px;">' +
  '    <iframe id="tempframe" style="width:1px;height:1px;top:-999px;left:-999px;position:absolute;"></iframe>' +
  '    <div id="msg" style="height: 30px;background-color: #C4D299;line-height: 30px;text-align: left;padding-left: 5px;"></div>' +
  '    <div id="result" style="height: 350px;background-color: #F0F0F0;text-align: left;padding: 5px;margin-top: 5px;overflow-y: auto;"></div>' +
  '    <input id="switchshowtable" style="display:none;position: absolute;width: 100px;top: 10px;right: 25px;" type="button" value="改为逗号分隔"/>' +
  '    <select id="sorttype" name="sorttype" style="display:none;position: absolute;width: 100px;top: 45px;right: 25px;">' +
  '      <option value="ratio" selected>赞同/回答比</option>' +
  '      <option value="agree">赞同</option>' +
  '      <option value="answer">回答</option>' +
  '      <option value="ask">提问</option>' +
  '      <option value="follower">关注</option>' +
  '    </select>' +
  '  </div>' +
  '</div>');
$("#switchshowtable").click(function () { showtable = !showtable; $(this).val(showtable ? "改为逗号分隔" : "改为表格显示"); showresult(); });
$("#sorttype").change(function () { sortresult(); showresult(); });
$("#tempframe").load(function () { loadmore(); });
loaduser();

/**
 * Created by Administrator on 14-2-28.
 */
