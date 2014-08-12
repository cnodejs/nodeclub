var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config').config;
var utility = require('utility');

var UserSchema = new Schema({
  name: { type: String},
  loginname: { type: String},
  pass: { type: String },
  email: { type: String},
  url: { type: String },
  profile_image_url: {type: String},
  location: { type: String },
  signature: { type: String },
  profile: { type: String },
  weibo: { type: String },
  avatar: { type: String },
  githubId: { type: String},
  githubUsername: {type: String},
  is_block: {type: Boolean, default: false},

  score: { type: Number, default: 0 },
  topic_count: { type: Number, default: 0 },
  reply_count: { type: Number, default: 0 },
  follower_count: { type: Number, default: 0 },
  following_count: { type: Number, default: 0 },
  collect_tag_count: { type: Number, default: 0 },
  collect_topic_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  is_star: { type: Boolean },
  level: { type: String },
  active: { type: Boolean, default: true },

  receive_reply_mail: {type: Boolean, default: false },
  receive_at_mail: { type: Boolean, default: false },
  from_wp: { type: Boolean },

  retrieve_time: {type: Number},
  retrieve_key: {type: String}
});

UserSchema.virtual('avatar_url').get(function () {
  var url = this.avatar || ('http://www.gravatar.com/avatar/' + utility.md5(this.email.toLowerCase()) + '?size=48');
  return url;
});

UserSchema.index({name: 1});
UserSchema.index({loginname: 1}, {unique: true});
UserSchema.index({email: 1}, {unique: true});
UserSchema.index({score: -1});
UserSchema.index({githubId: 1});

mongoose.model('User', UserSchema);
