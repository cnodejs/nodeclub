var urllib  = require('url');
var request = require('request');


var ALLOW_HOSTNAME = [
  'avatars.githubusercontent.com', 'www.gravatar.com',
  'gravatar.com', 'www.google-analytics.com',
];
exports.proxy = function (req, res, next) {
  var url = decodeURIComponent(req.query.url);
  var hostname = urllib.parse(url).hostname;

  if (ALLOW_HOSTNAME.indexOf(hostname) === -1) {
    return res.send(hostname + ' is not allowed');
  }

  request.get({
      url: url,
      headers: {
        'If-Modified-Since': req.header('If-Modified-Since') || ''
      }
    })
    .on('response', function (response) {
      res.set(response.headers);
    })
    .on('error', function (err) {
      console.error(err);
    })
    .pipe(res);
};
