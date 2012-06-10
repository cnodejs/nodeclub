/*!
 * nodeclub - app.js
 */

/**
 * Module dependencies.
 */

var path = require('path');
var express = require('express');
var config = require('./config').config;
// 兼容旧版本的 host: http://127.0.0.1
var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;
var routes = require('./routes');

var app = express.createServer();

// configuration in all env
app.configure(function () {
  var viewsRoot = path.join(__dirname, 'views');
  app.set('view engine', 'html');
  app.set('views', viewsRoot);
  app.register('.html', require('ejs'));
  app.use(express.bodyParser());
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
app.dynamicHelpers({
  csrf: function (req, res) {
    return req.session ? req.session._csrf : '';
  }
});

var static_dir = path.join(__dirname, 'public');
app.configure('development', function () {
  app.use(express.static(static_dir));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function () {
  var maxAge = 3600000 * 24 * 30;
  app.use(express.static(static_dir, { maxAge: maxAge }));
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