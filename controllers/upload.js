var fs = require('fs');
var path = require('path');
var ndir = require('ndir');
var config = require('../config').config;

exports.uploadImage = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send({ status: 'forbidden' });
    return;
  }
  var file = req.files && req.files.userfile;
  if (!file) {
    res.send({ status: 'failed', message: 'no file' });
    return;
  }
  var uid = req.session.user._id.toString();
  var filename = Date.now() + '_' + file.name;
  var userDir = path.join(config.upload_dir, uid);
  ndir.mkdir(userDir, function (err) {
    if (err) {
      return next(err);
    }
    var savepath = path.join(userDir, filename);
    fs.rename(file.path, savepath, function (err) {
      if (err) {
        return next(err);
      }
      var url = '/upload/' + uid + '/' + encodeURIComponent(filename);
      res.send({ status: 'success', url: url });
    });
  });
};
