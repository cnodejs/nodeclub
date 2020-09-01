exports.index = function (req, res, next) {
  var q = req.query.q;
  q = encodeURIComponent(q);
  if(req.query.notGG){
    res.redirect('https://cn.bing.com/search?q=site:cnodejs.org+' + q)
  }else{
    res.redirect('https://www.google.com.hk/#hl=zh-CN&q=site:cnodejs.org+' + q);
  }
};
