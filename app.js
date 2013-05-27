/*!
 * nodeclub - app.js
 */

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var ndir = require('ndir');
var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
var config = require('./config').config;
config.version = pkg.version;

// host: http://127.0.0.1
var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;
var routes = require('./routes');

config.upload_dir = config.upload_dir || path.join(__dirname, 'public', 'user_data', 'images');
// ensure upload dir exists
ndir.mkdir(config.upload_dir, function (err) {
  if (err) {
    throw err;
  }
});

var app = express.createServer();

// configuration in all env
app.configure(function () {
  var viewsRoot = path.join(__dirname, 'views');
  app.set('view engine', 'html');
  app.set('views', viewsRoot);
  app.register('.html', require('ejs'));
  app.use(express.bodyParser({
    uploadDir: config.upload_dir
  }));
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.session_secret
  }));
  // custom middleware
  app.use(require('./controllers/sign').auth_user);

  var csrf = express.csrf();
  app.use(function (req, res, next) {
    // ignore upload image
    if (req.body && req.body.user_action === 'upload_image') {
      return next();
    }
    csrf(req, res, next);
  });
});

if (process.env.NODE_ENV !== 'test') {
  // plugins
  var plugins = config.plugins || [];
  for (var i = 0, l = plugins.length; i < l; i++) {
    var p = plugins[i];
    app.use(require('./plugins/' + p.name)(p.options));
  }
}

// set static, dynamic helpers
app.helpers({
  config: config
});
app.dynamicHelpers(require('./common/render_helpers'));

var maxAge = 3600000 * 24 * 30;
app.use('/upload/', express.static(config.upload_dir, { maxAge: maxAge }));
// old image url: http://host/user_data/images/xxxx
app.use('/user_data/', express.static(path.join(__dirname, 'public', 'user_data'), { maxAge: maxAge }));

var staticDir = path.join(__dirname, 'public');
app.configure('development', function () {
  app.use(express.static(staticDir));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.static(staticDir, { maxAge: maxAge }));
  app.use(express.errorHandler());
  app.set('view cache', true);
});

// routes
routes(app);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port);

  console.log("NodeClub listening on port %d in %s mode", config.port, app.settings.env);
  console.log("God bless love....");
  console.log("You can debug your app with http://" + config.hostname + ':' + config.port);
}

module.exports = app;
