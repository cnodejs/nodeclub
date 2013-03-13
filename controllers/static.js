// static page
// About
exports.about = function (req, res, next) {
  res.render('static/about');
};

// FAQ
exports.faq = function (req, res, next) {
  res.render('static/faq');
};
