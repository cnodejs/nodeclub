exports.index = function (req, res, next) {
  var q = req.query.q;
  res.redirect('http://www.baidu.com/s?wd=site:cnodejs.org+' + q);
};
