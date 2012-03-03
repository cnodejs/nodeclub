var fs = require('fs');
var path = require('path');
var ndir = require('ndir');

var mod = require('express/node_modules/connect/node_modules/formidable');
var upload_path = path.join(path.dirname(__dirname), 'public/user_data/images');
mod.IncomingForm.UPLOAD_DIR = upload_path;

exports.upload_image = function(req, res, next) {
	if (!req.session || !req.session.user) {
		res.send('forbidden!');
		return;
	}
	var host = req.headers.host;
	var file = req.files.userfile;
	// sould use async
	if (file) {
		var name = file.name;
		var ext = name.substr(name.lastIndexOf('.'),4);
		var uid = req.session.user._id.toString();
		var time = new Date().getTime();
		var new_name = uid + time + ext;
		var userDir = path.join(upload_path, uid);
		ndir.mkdir(userDir, function(err) {
			if (err) return next(err);
			var new_path = path.join(userDir, new_name);
			fs.rename(file.path, new_path, function(err) {
				if (err) {
					return next(err);
				}
				var url = 'http://' + host + '/user_data/images/' + uid + '/' + new_name;
				res.json({ status: 'success', url: url });
			});
		});
	} else {
		res.json({ status: 'failed' });
		return;
	}
};
