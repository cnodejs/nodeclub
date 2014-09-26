/*!
 * nodeclub - app.js
 */

/**
 * Module dependencies.
 */

var config = require('./config');

if (!config.debug) {
  require('newrelic');
}

var path = require('path');
var Loader = require('loader');
var express = require('express');
var session = require('express-session');
var passport = require('passport');
require('./models');
var GitHubStrategy = require('passport-github').Strategy;
var githubStrategyMiddleware = require('./middlewares/github_strategy');
var routes = require('./routes');
var auth = require('./middlewares/auth');
var MongoStore = require('connect-mongo')(session);
var _ = require('lodash');
var csurf = require('csurf');
var compress = require('compression');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var errorhandler = require('errorhandler');

// 静态文件目录
var staticDir = path.join(__dirname, 'public');

// assets
var assets = {};
if (config.mini_assets) {
  try {
    assets = require('./assets.json');
  } catch (e) {
    console.log('You must execute `make build` before start app when mini_assets is true.');
    throw e;
  }
}

var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;

var app = express();

// configuration in all env
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
app.locals._layoutFile = 'layout.html';

app.use(require('response-time')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(require('method-override')());
app.use(require('cookie-parser')(config.session_secret));
app.use(compress());
app.use(session({
  secret: config.session_secret,
  key: 'sid',
  store: new MongoStore({
    url: config.db
  }),
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());

// custom middleware
app.use(auth.authUser);
app.use(auth.blockUser());

app.use(Loader.less(__dirname));
app.use('/public', express.static(staticDir));

if (!config.debug) {
  app.use(csurf());
  app.set('view cache', true);
}

// for debug
// app.get('/err', function (req, res, next) {
//   next(new Error('haha'))
// });

// set static, dynamic helpers
_.extend(app.locals, {
  config: config,
  Loader: Loader,
  assets: assets
});

_.extend(app.locals, require('./common/render_helpers'));
app.use(function (req, res, next) {
  res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
  next();
});

// github oauth
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(new GitHubStrategy(config.GITHUB_OAUTH, githubStrategyMiddleware));

app.use(busboy({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}));

// routes
routes(app);

// error handler
if (config.debug) {
  app.use(errorhandler());
} else {
  app.use(function (err, req, res, next) {
    return res.send(500, '500 status');
  });
}

app.listen(config.port, function () {
  console.log("NodeClub listening on port %d in %s mode", config.port, app.settings.env);
  console.log("God bless love....");
  console.log("You can debug your app with http://" + config.hostname + ':' + config.port);
});


module.exports = app;
