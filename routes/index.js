var site_ctrl = require('../controllers/site');
exports.index = site_ctrl.index;
exports.list_page = site_ctrl.list_page;

var sign_ctrl = require('../controllers/sign');
exports.signup = sign_ctrl.signup;
exports.signin = sign_ctrl.signin;
exports.signout = sign_ctrl.signout;
exports.search_pass = sign_ctrl.search_pass;
exports.reset_pass = sign_ctrl.reset_pass;
exports.active_account = sign_ctrl.active_account;
// as one middleware
exports.auth_user = sign_ctrl.auth_user;

var user_ctrl = require('../controllers/user');
exports.user_index = user_ctrl.index;
exports.user_setting = user_ctrl.setting;
exports.show_stars = user_ctrl.show_stars
exports.users_top100 = user_ctrl.top100;
exports.follow_user = user_ctrl.follow;
exports.un_follow_user = user_ctrl.un_follow;
exports.set_star = user_ctrl.toggle_star;
exports.cancel_star = user_ctrl.toggle_star; 
exports.get_followers = user_ctrl.get_followers;
exports.get_followings = user_ctrl.get_followings;
exports.get_collect_tags = user_ctrl.get_collect_tags;
exports.get_collect_topics = user_ctrl.get_collect_topics;
exports.list_user_topics = user_ctrl.list_topics;
exports.list_user_replies = user_ctrl.list_replies;

var message_ctrl = require('../controllers/message');
exports.get_messages = message_ctrl.index;
exports.mark_message_read = message_ctrl.mark_read;
exports.mark_all_messages_read = message_ctrl.mark_all_read;

var tag_ctrl = require('../controllers/tag');
exports.list_topic_by_tag = tag_ctrl.list_topic;
exports.add_tag = tag_ctrl.add;
exports.edit_tag = tag_ctrl.edit;
exports.delete_tag = tag_ctrl.delete;
exports.edit_tags = tag_ctrl.edit_tags;
exports.collect_tag = tag_ctrl.collect;
exports.de_collect_tag = tag_ctrl.de_collect;

var topic_ctrl = require('../controllers/topic');
exports.topic_index = topic_ctrl.index;
exports.create_topic = topic_ctrl.create;
exports.edit_topic = topic_ctrl.edit;
exports.delete_topic = topic_ctrl.delete;
exports.collect_topic = topic_ctrl.collect;
exports.de_collect_topic = topic_ctrl.de_collect;

var reply_ctrl = require('../controllers/reply');
exports.reply_topic = reply_ctrl.add;
exports.reply2_topic = reply_ctrl.add_reply2;
exports.delete_reply = reply_ctrl.delete;

var upload_ctrl = require('../controllers/upload');
exports.upload_image = upload_ctrl.upload_image;

var static_ctrl = require('../controllers/static');
exports.about = static_ctrl.about;
exports.faq = static_ctrl.faq;

var tools_ctrl =require('../controllers/tools');
exports.site_tools = tools_ctrl.run_site_tools;