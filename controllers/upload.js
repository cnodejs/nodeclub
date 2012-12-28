/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

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
  var uid;
  var userDir;
  
  if (!file) {
    res.send({ status: 'failed', message: 'no file' });
    return;
  }
  
  uid = req.session.user._id.toString();
  userDir = path.join(config.upload_dir, uid);
  ndir.mkdir(userDir, function (err) {
    if (err) {
      return next(err);
    }
    
    var filename = Date.now() + '_' + file.name;
    var savepath = path.resolve(path.join(userDir, filename));
    
    if (savepath.indexOf(path.resolve(userDir)) !== 0) {
      return res.send({status: 'forbidden'});
    }
    fs.rename(file.path, savepath, function (err) {
      if (err) {
        return next(err);
      }
      var url = '/upload/' + uid + '/' + encodeURIComponent(filename);
      res.send({ status: 'success', url: url });
    });
  });
};
