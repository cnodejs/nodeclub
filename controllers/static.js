var multiline = require('multiline');
// static page
// About
exports.about = function (req, res, next) {
  res.render('static/about', {
    pageTitle: '关于我们'
  });
};


// timeline
exports.timeline = function (req, res, next) {
  res.render('static/timeline', {
    pageTitle: '时间线'
  });
};

// FAQ
exports.faq = function (req, res, next) {
  res.render('static/faq');
};

exports.getstart = function (req, res) {
  res.render('static/getstart');
};

exports.robots = function (req, res, next) {
  res.type('text/plain');
  res.send(multiline(function () {;
/*
# See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
#
# To ban all spiders from the entire site uncomment the next two lines:
# User-Agent: *
# Disallow: /
*/
User-agent: *
Sitemap: http://ionichina.com/sitemap.xml
  }));
};

exports.api = function (req, res, next) {
  res.render('static/api');
};
