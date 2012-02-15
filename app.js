var express = require('express'),
	routes = require('./routes'),
	config = require('./config').config;

var app = express.createServer();

var static_dir = __dirname+'/public';

// configuration in all env
app.configure(function(){
	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');
	app.register('.html',require('ejs'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret:config.session_secret,
	}));
	// custom middleware
	app.use(routes.auth_user);
	app.use(express.csrf());
});

//set static,dynamic helpers
app.helpers({
	config:config
});
app.dynamicHelpers({
	csrf: function(req,res){
		return req.session ? req.session._csrf : '';
	},
});

app.configure('development', function(){
	app.use(express.static(static_dir));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	var one_year=1000*60*60*24*365;
	app.use(express.static(static_dir,{maxAge:one_year}));
	app.use(express.errorHandler()); 
	app.set('view cache',true);
});

// routes
app.get('/signup', routes.signup);
app.get('/signin', routes.signin);
app.get('/signout', routes.signout);
app.post('/signup', routes.signup);
app.post('/signin', routes.signin);

app.get('/user/:name', routes.user_index);
app.get('/setting', routes.user_setting);
app.get('/stars', routes.show_stars);
app.get('/users/top100', routes.users_top100);
app.get('/my/tags', routes.get_collect_tags);
app.get('/my/topics', routes.get_collect_topics);
app.get('/my/messages', routes.get_messages);
app.get('/my/follower', routes.get_followers);
app.get('/my/following', routes.get_followings);
app.get('/user/:name/topics', routes.list_user_topics);
app.get('/user/:name/replies', routes.list_user_replies);
app.post('/setting', routes.user_setting);
app.post('/user/follow', routes.follow_user);
app.post('/user/un_follow', routes.un_follow_user);
app.post('/user/set_star', routes.set_star);
app.post('/user/cancel_star', routes.cancel_star);
app.post('/messages/mark_read', routes.mark_message_read);
app.post('/messages/mark_all_read', routes.mark_all_messages_read);

app.get('/tags/edit', routes.edit_tags);
app.get('/tag/:name', routes.list_topic_by_tag);
app.get('/tag/:name/edit', routes.edit_tag);
app.get('/tag/:name/delete', routes.delete_tag);
app.post('/tag/add', routes.add_tag);
app.post('/tag/:name/edit', routes.edit_tag);
app.post('/tag/collect', routes.collect_tag);
app.post('/tag/de_collect', routes.de_collect_tag);

app.get('/topic/create', routes.create_topic);
app.get('/topic/:tid', routes.topic_index);
app.get('/topic/:tid/edit', routes.edit_topic);
app.get('/topic/:tid/delete', routes.delete_topic);
app.post('/topic/create', routes.create_topic);
app.post('/topic/:tid/edit', routes.edit_topic);
app.post('/topic/collect', routes.collect_topic);
app.post('/topic/de_collect', routes.de_collect_topic);

app.post('/:topic_id/reply',routes.reply_topic);
app.post('/:topic_id/reply2',routes.reply2_topic);
app.post('/reply/:reply_id/delete', routes.delete_reply);

app.get('/', routes.index);

app.post('/upload/image', routes.upload_image);
app.post('/search_pass', routes.search_pass);
app.get('/active_account', routes.active_account);
app.get('/search_pass', routes.search_pass);
app.get('/reset_pass',routes.reset_pass);
app.get('/site_tools', routes.site_tools);
app.get('/about', routes.about);
app.get('/faq', routes.faq);

app.listen(config.port);
console.log("NodeClub listening on port %d in %s mode", app.address().port, app.settings.env);
console.log("God bless love....");
