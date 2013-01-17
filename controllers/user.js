/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var models = require('../models');
var User = models.User;
var Reply = models.Reply;
var Relation = models.Relation;
var Message = models.Message;
var TagCollect = models.TagCollect;
var TopicCollect = models.TopicCollect;
var tag_ctrl = require('./tag');
var topic_ctrl = require('./topic');
var message_ctrl = require('./message');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');
var bcrypt = require('bcrypt');

function get_user_by_id(id, cb) {
  User.findOne({_id: id}, cb);
}
function get_user_by_name(name, cb) {
  User.findOne({name: name}, cb);
}
function get_user_by_loginname(name, cb) {
  User.findOne({loginname: name}, cb);
}

function get_users_by_ids(ids, cb) {
  User.find({'_id': {'$in': ids}}, cb);
}
function get_users_by_query(query, opt, cb) {
  User.find(query, [], opt, cb);
}

exports.index = function (req, res, next) {
  var user_login = req.params.login;
  
  get_user_by_loginname(user_login, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '這個用戶不存在。'});
      return;
    }

    var render;
    var proxy;
    var query;
    var opt;

    render = function (recent_topics, recent_replies, relation) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/index', {
        user: user,
        recent_topics: recent_topics,
        recent_replies: recent_replies,
        relation: relation
      });
    };

    proxy = new EventProxy();
    proxy.assign('recent_topics', 'recent_replies', 'relation', render);

    query = {author_id: user._id};
    opt = {limit: 5, sort: [['create_at', 'desc']]};
    
    topic_ctrl.get_topics_by_query(query, opt, function (err, recent_topics) {
      if (err) {
        return next(err);
      }
      proxy.trigger('recent_topics', recent_topics);
    });

    Reply.find({author_id: user._id}, function (err, replies) {
      if (err) {
        return next(err);
      }
      
      var topic_ids = [];
      var i;
      var len;
      var query;
      var opt;

      for (i = 0, len = replies.length; i < len; i += 1) {
        if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
          topic_ids.push(replies[i].topic_id.toString());
        }
      }
      
      query = {_id: {'$in': topic_ids}};
      opt = {limit: 5, sort: [['create_at', 'desc']]};
      
      topic_ctrl.get_topics_by_query(query, opt, function (err, topics) {
        if (err) {
          return next(err);
        }
        proxy.trigger('recent_replies', topics);
      });
    });

    if (!req.session.user) {
      proxy.trigger('relation', null);
    } else {
      Relation.findOne({user_id: req.session.user._id, follow_id: user._id}, function (err, doc) {
        if (err) {
          return next(err);
        }
        proxy.trigger('relation', doc);
      });
    }
  });
};

exports.show_stars = function (req, res, next) {
  get_users_by_query({is_star: true}, {}, function (err, stars) {
    if (err) {
      return next(err);
    }
    res.render('user/stars', {stars: stars});
  });
};

exports.setting = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }
  
  var method = req.method.toLowerCase();
  var action;
  var name;
  var email;
  var url;
  var location;
  var signature;
  var profile;
  var weibo;
  var receive_at_mail;
  var receive_reply_mail;
  var profile_image_url;
  var old_pass;
  var new_pass;

  if (method !== 'post') {
    get_user_by_id(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      if (req.query.save === 'success') {
        user.success = '保存成功。';
      }
      user.error = null;
      return res.render('user/setting', user);
    });
    return;
  }
  
  // post
  action = req.body.action;
  if (action === 'change_setting') {
    name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    email = sanitize(req.body.email).trim();
    email = sanitize(email).xss();
    url = sanitize(req.body.url).trim();
    url = sanitize(url).xss();
    profile_image_url = sanitize(sanitize(req.body.profile_image_url).trim()).xss();
    location = sanitize(req.body.location).trim();
    location = sanitize(location).xss();
    signature = sanitize(req.body.signature).trim();
    signature = sanitize(signature).xss();
    profile = sanitize(req.body.profile).trim();
    profile = sanitize(profile).xss();
    weibo = sanitize(req.body.weibo).trim();
    weibo = sanitize(weibo).xss();
    receive_at_mail = req.body.receive_at_mail === 'on' ? true : false;
    receive_reply_mail = req.body.receive_reply_mail === 'on' ? true : false;

    if (url !== '') {
      try {
        if (url.indexOf('http://') < 0) {
          url = 'http://' + url;
        }
        check(url, '不正確的個人網站。').isUrl();
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          location: location,
          signature: signature,
          profile: profile,
          weibo: weibo,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }
    if (weibo) {
      try {
        if (weibo.indexOf('http://') < 0) {
          weibo = 'http://' + weibo;
        }
        check(weibo, '不正確的微博地址。').isUrl();
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          location: location,
          signature: signature,
          profile: profile,
          weibo: weibo,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }

    get_user_by_id(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }

      user.url = url;
      user.profile_image_url = profile_image_url;
      user.location = location;
      user.signature = signature;
      user.profile = profile;
      user.weibo = weibo;
      user.receive_at_mail = receive_at_mail;
      user.receive_reply_mail = receive_reply_mail;
      
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/setting?save=success');
      });
    });

  }
  if (action === 'change_password') {
    old_pass = sanitize(req.body.old_pass).trim();
    new_pass = sanitize(req.body.new_pass).trim();

    get_user_by_id(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      
      bcrypt.compare(old_pass, user.pass, function (err, equal) {
        if (err) {
          return next(err);
        }
        if (!equal) {
          res.render('user/setting', {
            error: '當前密碼不正確。',
            name: user.name,
            email: user.email,
            url: user.url,
            profile_image_url: user.profile_image_url,
            location: user.location,
            signature: user.signature,
            profile: user.profile,
            weibo: user.weibo,
            receive_at_mail: user.receive_at_mail,
            receive_reply_mail: user.receive_reply_mail
          });
          return;
        }

        bcrypt.genSalt(config.genSalt, function (err, salt) {
          if (err) {
            return next(err);
          }
          bcrypt.hash(new_pass, salt, function (err, hash) {
            user.pass = hash;
            user.save(function (err) {
              if (err) {
                return next(err);
              }
              res.render('user/setting', {
                success: '密碼已被修改。',
                name: user.name,
                email: user.email,
                url: user.url,
                profile_image_url: user.profile_image_url,
                location: user.location,
                signature: user.signature,
                profile: user.profile,
                weibo: user.weibo,
                receive_at_mail: user.receive_at_mail,
                receive_reply_mail: user.receive_reply_mail
              });
              return;

            });
          });
        });
      });
    });
  }
};

exports.follow = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  
  var follow_id = req.body.follow_id;
  
  get_user_by_id(follow_id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({status: 'failed'});
    }
    
    var proxy = new EventProxy();
    var done;
    
    done = function () {
      res.json({ status: 'success' });
    };

    proxy.assign('relation_saved', 'message_saved', done);
    Relation.findOne({user_id: req.session.user._id, follow_id: user._id}, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({ status: 'success' });
        return;
      }
        
      var relation = new Relation();
      
      relation.user_id = req.session.user._id;
      relation.follow_id = user._id;
      relation.save();
      proxy.trigger('relation_saved');
        
      get_user_by_id(req.session.user._id, function (err, me) {
        if (err) {
          return next(err);
        }
        me.following_count += 1;
        me.save();
      });

      user.follower_count += 1;
      user.save();

      req.session.user.following_count += 1;
    });

    message_ctrl.send_follow_message(follow_id, req.session.user._id);
    proxy.trigger('message_saved');
  });
};

exports.un_follow = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var follow_id = req.body.follow_id;
  
  get_user_by_id(follow_id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({status: 'failed'});
      return;
    }
    Relation.remove({user_id: req.session.user._id, follow_id: user._id}, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    get_user_by_id(req.session.user._id, function (err, me) {
      if (err) {
        return next(err);
      }
      me.following_count -= 1;
      me.save();
    });

    user.follower_count -= 1;
    user.save();

    req.session.user.following_count -= 1;
  });
};

exports.toggle_star = function (req, res, next) {
  if (!req.session.user || !req.session.user.is_admin) {
    res.send('forbidden!</strong>');
    return;
  }

  var user_id = req.body.user_id;
  
  get_user_by_id(user_id, function (err, user) {
    if (err) {
      return next(err);
    }
    user.is_star = !!user.is_star;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.json({ status: 'success' });
    });
  });
};

exports.get_collect_tags = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }
  TagCollect.find({ user_id: req.session.user._id }, function (err, docs) {
    if (err) {
      return next(err);
    }
    
    var ids = [];
    var i;
    var len;

    for (i = 0, len = docs.length; i < len; i += 1) {
      ids.push(docs[i].tag_id);
    }
    tag_ctrl.get_tags_by_ids(ids, function (err, tags) {
      if (err) {
        return next(err);
      }
      res.render('user/collect_tags', { tags: tags });
    });
  });
};

exports.get_collect_topics = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;
  var render;
  var proxy;

  render = function (topics, pages) {
    res.render('user/collect_topics', {
      topics: topics,
      current_page: page,
      pages: pages
    });
  };

  proxy = new EventProxy();
  proxy.assign('topics', 'pages', render);

  TopicCollect.find({ user_id: req.session.user._id }, function (err, docs) {
    if (err) {
      return next(err);
    }
    
    var ids = [];
    var i;
    var len;
    var query;
    var opt;

    for (i = 0, len = docs.length; i < len; i += 1) {
      ids.push(docs[i].topic_id);
    }
    
    query = { _id: { '$in': ids } };
    opt = {
      skip: (page - 1) * limit,
      limit: limit,
      sort: [ [ 'create_at', 'desc' ] ]
    };

    topic_ctrl.get_topics_by_query(query, opt, function (err, topics) {
      if (err) {
        return next(err);
      }
      proxy.trigger('topics', topics);
    });
    
    topic_ctrl.get_count_by_query(query, function (err, all_topics_count) {
      if (err) {
        return next(err);
      }
      var pages = Math.ceil(all_topics_count / limit);
      proxy.trigger('pages', pages);
    });
  });
};

exports.get_followings = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }
  Relation.find({user_id: req.session.user._id}, function (err, docs) {
    if (err) {
      return next(err);
    }
    
    var ids = [];
    var i;
    var len;

    for (i = 0, len = docs.length; i < len; i += 1) {
      ids.push(docs[i].follow_id);
    }
    get_users_by_ids(ids, function (err, users) {
      if (err) {
        return next(err);
      }
      res.render('user/followings', {users: users});
    });
  });
};

exports.get_followers = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }
  Relation.find({follow_id: req.session.user._id}, function (err, docs) {
    if (err) {
      return next(err);
    }
    
    var ids = [];
    var i;
    var len;

    for (i = 0, len = docs.length; i < len; i += 1) {
      ids.push(docs[i].user_id);
    }
    
    get_users_by_ids(ids, function (err, users) {
      if (err) {
        return next(err);
      }
      res.render('user/followers', {users: users});
    });
  });
};

exports.top100 = function (req, res, next) {
  var opt = {limit: 100, sort: [['score', 'desc']]};
  get_users_by_query({}, opt, function (err, tops) {
    if (err) {
      return next(err);
    }
    res.render('user/top100', {users: tops});
  });
};

exports.list_topics = function (req, res, next) {
  var user_login = req.params.login;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  get_user_by_loginname(user_login, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '這個用戶不存在。'});
      return;
    }
    
    var render;
    var proxy;
    var query;
    var opt;

    render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/topics', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);

    query = {'author_id': user._id};
    opt = {skip: (page - 1) * limit, limit: limit, sort: [['create_at', 'desc']]};
    
    topic_ctrl.get_topics_by_query(query, opt, function (err, topics) {
      if (err) {
        return next(err);
      }
      proxy.trigger('topics', topics);
    });

    if (!req.session.user) {
      proxy.trigger('relation', null);
    } else {
      Relation.findOne({user_id: req.session.user._id, follow_id: user._id}, function (err, doc) {
        if (err) {
          return next(err);
        }
        proxy.trigger('relation', doc);
      });
    }

    topic_ctrl.get_count_by_query(query, function (err, all_topics_count) {
      if (err) {
        return next(err);
      }
      var pages = Math.ceil(all_topics_count / limit);
      proxy.trigger('pages', pages);
    });
  });
};

exports.list_replies = function (req, res, next) {
  var user_login = req.params.login;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  get_user_by_loginname(user_login, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '這個用戶不存在。'});
      return;
    }
    
    var render;
    var proxy;
    
    render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/replies', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);

    Reply.find({author_id: user._id}, function (err, replies) {
      if (err) {
        return next(err);
      }
     
      var topic_ids = [];
      var i;
      var len;
      var query;
      var opt;

      for (i = 0, len = replies.length; i < len; i += 1) {
        if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
          topic_ids.push(replies[i].topic_id);
        }
      }
      
      query = {'_id': {'$in': topic_ids}};
      opt = {skip: (page - 1) * limit, limit: limit, sort: [['create_at', 'desc']]};
      
      topic_ctrl.get_topics_by_query(query, opt, function (err, topics) {
        if (err) {
          return next(err);
        }
        proxy.trigger('topics', topics);
      });

      topic_ctrl.get_count_by_query(query, function (err, all_topics_count) {
        if (err) {
          return next(err);
        }
        var pages = Math.ceil(all_topics_count / limit);
        proxy.trigger('pages', pages);
      });
    });

    if (!req.session.user) {
      proxy.trigger('relation', null);
    } else {
      Relation.findOne({user_id: req.session.user._id, follow_id: user._id}, function (err, doc) {
        if (err) {
          return next(err);
        }
        proxy.trigger('relation', doc);
      });
    }
  });
};

exports.get_user_by_id = get_user_by_id;
exports.get_user_by_name = get_user_by_name;
exports.get_user_by_loginname = get_user_by_loginname;
exports.get_users_by_ids = get_users_by_ids;
exports.get_users_by_query = get_users_by_query;
