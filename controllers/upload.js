var fs = require('fs');
var path = require('path');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;

var mod = require('express/node_modules/connect/node_modules/formidable');
var upload_path = process.cwd() + '/public/user_data/images/';
mod.IncomingForm.UPLOAD_DIR = upload_path;

exports.upload_image = function(req,res,next){
	if(!req.session || !req.session.user){
		res.send('forbidden!');
		return;
	}

	var file = req.files.userfile;
	// sould use async
	if(file){
		var name = file.name;
		var ext = name.substr(name.lastIndexOf('.'),4);
		var uid = req.session.user._id.toString();
		var time = new Date().getTime();
		var new_name = uid + time + ext;
		var proxy = new EventProxy();
		function ensureDir(){
			path.exists(upload_path + uid, function(exists){
				if(!exists){
					fs.mkdir(upload_path + uid, function(err){
						if(err){
							return next(err);
						}
						proxy.fire('ensureDir');
					})
				}else{
					proxy.fire('ensureDir');
				}
			})
		}
		function moveImg(){
			var new_path = upload_path + uid +'/' +new_name;
			fd.rename(file.path, new_path, function(err){
				if(err){
					return next(err);
				}
				var url = config.host + '/user_data/images/'+ uid + '/' +new_name;
				res.json({status:'success',url: url});
			})
		}
		proxy.once('ensureDir', moveImg);
		ensureDir();
	}else{
		res.json({status:'failed'});
		return;
	}
};
