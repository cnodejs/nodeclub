var fs = require('fs');
var config = require('../config').config;

var mod = require('express/node_modules/connect/node_modules/formidable');
var upload_path = process.cwd() + '/public/user_data/images/';
mod.IncomingForm.UPLOAD_DIR = upload_path;

exports.upload_image = function(req,res,next){
	if(!req.session || !req.session.user){
		res.send('forbidden!');
		return;
	}

	var file = req.files.userfile;
	if(file){
		var name = file.name;
		var ext = name.substr(name.lastIndexOf('.'),4);
		var uid = req.session.user._id.toString();
		var time = new Date().getTime();
		var new_name = uid + time + ext;
		try{
			fs.realpathSync(upload_path + uid)
		}catch(err){
			fs.mkdirSync(upload_path + uid);
		}
		var new_path = upload_path + uid +'/' +new_name;
		fs.renameSync(file.path, new_path);
		var url = config.host + '/user_data/images/'+ uid + '/' +new_name;
		res.json({status:'success',url: url});
	}else{
		res.json({status:'failed'});
		return;
	}
};
