var User = require('../proxy').User;
var UserModel = require('../models').User;
var Tag = require('../proxy').Tag;
var Topic = require('../proxy').Topic;
var TopicModel = require('../models').Topic;
var Reply = require('../proxy').Reply;
var ReplyModel = require('../models').Reply;
var Relation = require('../proxy').Relation;
var TopicCollect = require('../proxy').TopicCollect;
var TagCollect = require('../proxy').TagCollect;
var utility = require('utility');

var message = require('../services/message');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');

exports.index = function (req, res, next) {
  var user_name = req.params.name;
  User.getUserByName(user_name, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (recent_topics, recent_replies, relation) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      // 如果用户没有激活，那么管理员可以帮忙激活
      var token = '';
      if (!user.active && req.session.user && req.session.user.is_admin) {
        token = utility.md5(user.email + config.session_secret);
      }
      res.render('user/index', {
        user: user,
        recent_topics: recent_topics,
        recent_replies: recent_replies,
        relation: relation,
        token: token,
      });
    };

    var proxy = new EventProxy();
    proxy.assign('recent_topics', 'recent_replies', 'relation', render);
    proxy.fail(next);

    var query = {author_id: user._id};
    var opt = {limit: 5, sort: [
      ['create_at', 'desc']
    ]};
    Topic.getTopicsByQuery(query, opt, proxy.done('recent_topics'));

    Reply.getRepliesByAuthorId(user._id, {limit: 20, sort: [
        ['create_at', 'desc']
      ]},
      proxy.done(function (replies) {
        var topic_ids = [];
        for (var i = 0; i < replies.length; i++) {
          if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
            topic_ids.push(replies[i].topic_id.toString());
          }
        }
        var query = {_id: {'$in': topic_ids}};
        var opt = {limit: 5, sort: [
          ['create_at', 'desc']
        ]};
        Topic.getTopicsByQuery(query, opt, proxy.done('recent_replies'));
      }));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }
  });
};

exports.show_stars = function (req, res, next) {
  User.getUsersByQuery({is_star: true}, {}, function (err, stars) {
    if (err) {
      return next(err);
    }
    res.render('user/stars', {stars: stars});
  });
};

exports.showSetting = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  User.getUserById(req.session.user._id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (req.query.save === 'success') {
      user.success = '保存成功。';
    }
    user.error = null;
    return res.render('user/setting', user);
  });
};

exports.setting = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  // 显示出错或成功信息
  function showMessage(msg, data, isSuccess) {
    var data = data || req.body;
    var data2 = {
      name: data.name,
      email: data.email,
      url: data.url,
      location: data.location,
      signature: data.signature,
      weibo: data.weibo,
      githubUsername: data.github || data.githubUsername,
    };
    if (isSuccess) {
      data2.success = msg;
    } else {
      data2.error = msg;
    }
    res.render('user/setting', data2);
  }

  // post
  var action = req.body.action;
  if (action === 'change_setting') {
    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    var email = sanitize(req.body.email).trim();
    email = sanitize(email).xss();
    var url = sanitize(req.body.url).trim();
    url = sanitize(url).xss();
    var location = sanitize(req.body.location).trim();
    location = sanitize(location).xss();
    var signature = sanitize(req.body.signature).trim();
    signature = sanitize(signature).xss();
    var weibo = sanitize(req.body.weibo).trim();
    weibo = sanitize(weibo).xss();
    var github = sanitize(req.body.github).trim();
    github = sanitize(github).xss();
    if (github.indexOf('@') === 0) {
      github = github.slice(1);
    }

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.url = url;
      user.location = location;
      user.signature = signature;
      user.weibo = weibo;
      // create gravatar
      user.avatar = User.makeGravatar(user.email);
      user.githubUsername = github;
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        req.session.user = user.toObject({virtual: true});
        return res.redirect('/setting?save=success');
      });
    });

  }
  if (action === 'change_password') {
    var old_pass = sanitize(req.body.old_pass).trim();
    var new_pass = sanitize(req.body.new_pass).trim();
    if (!old_pass || !new_pass) {
      return res.send('旧密码或新密码不得为空');
    }

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      var md5sum = crypto.createHash('md5');
      md5sum.update(old_pass);
      old_pass = md5sum.digest('hex');

      if (old_pass !== user.pass) {
        return showMessage('当前密码不正确。', user);
      }

      md5sum = crypto.createHash('md5');
      md5sum.update(new_pass);
      new_pass = md5sum.digest('hex');

      user.pass = new_pass;
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        return showMessage('密码已被修改。', user, true);

      });
    });
  }
};

exports.follow = function (req, res, next) {
  var follow_id = req.body.follow_id;
  User.getUserById(follow_id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({status: 'failed'});
    }

    var proxy = EventProxy.create('relation_saved', 'message_saved', function () {
      res.json({status: 'success'});
    });
    proxy.fail(next);
    Relation.getRelation(req.session.user._id, user._id, proxy.done(function (doc) {
      if (doc) {
        return proxy.emit('relation_saved');
      }

      // 新建关系并保存
      Relation.newAndSave(req.session.user._id, user._id);
      proxy.emit('relation_saved');

      User.getUserById(req.session.user._id, proxy.done(function (me) {
        me.following_count += 1;
        me.save();
      }));

      user.follower_count += 1;
      user.save();

      req.session.user.following_count += 1;
    }));

    message.sendFollowMessage(follow_id, req.session.user._id);
    proxy.emit('message_saved');
  });
};

exports.un_follow = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  var follow_id = req.body.follow_id;
  User.getUserById(follow_id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({status: 'failed'});
      return;
    }
    // 删除关系
    Relation.remove(req.session.user._id, user._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    User.getUserById(req.session.user._id, function (err, me) {
      if (err) {
        return next(err);
      }
      me.following_count -= 1;
      if (me.following_count < 0) {
        me.following_count = 0;
      }
      me.save();
    });

    user.follower_count -= 1;
    if (user.follower_count < 0) {
      user.follower_count = 0;
    }
    user.save();

    req.session.user.following_count -= 1;
    if (req.session.user.following_count < 0) {
      req.session.user.following_count = 0;
    }
  });
};

exports.toggle_star = function (req, res, next) {
  if (!req.session.user || !req.session.user.is_admin) {
    res.send('forbidden!');
    return;
  }
  var user_id = req.body.user_id;
  User.getUserById(user_id, function (err, user) {
    if (err) {
      return next(err);
    }
    user.is_star = !user.is_star;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.json({ status: 'success' });
    });
  });
};

exports.get_collect_tags = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }
    TagCollect.getTagCollectsByUserId(user._id, function (err, docs) {
      if (err) {
        return next(err);
      }
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].tag_id);
      }
      Tag.getTagsByIds(ids, function (err, tags) {
        if (err) {
          return next(err);
        }
        res.render('user/collect_tags', { tags: tags, user: user });
      });
    });
  });
};

exports.get_collect_topics = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }

    var page = Number(req.query.page) || 1;
    var limit = config.list_topic_count;

    var render = function (topics, pages) {
      res.render('user/collect_topics', {
        topics: topics,
        current_page: page,
        pages: pages,
        user: user
      });
    };

    var proxy = EventProxy.create('topics', 'pages', render);
    proxy.fail(next);

    TopicCollect.getTopicCollectsByUserId(user._id, proxy.done(function (docs) {
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].topic_id);
      }
      var query = { _id: { '$in': ids } };
      var opt = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: [
          [ 'create_at', 'desc' ]
        ]
      };
      Topic.getTopicsByQuery(query, opt, proxy.done('topics'));
      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);
      }));
    }));
  });
};

exports.get_followings = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }
    Relation.getFollowings(user._id, function (err, docs) {
      if (err) {
        return next(err);
      }
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].follow_id);
      }
      User.getUsersByIds(ids, function (err, users) {
        if (err) {
          return next(err);
        }
        res.render('user/followings', { users: users, user: user });
      });
    });
  });
};

exports.get_followers = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }
    var proxy = new EventProxy();
    proxy.fail(next);
    Relation.getRelationsByUserId(user._id, proxy.done(function (docs) {
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].user_id);
      }
      User.getUsersByIds(ids, proxy.done(function (users) {
        res.render('user/followers', {users: users, user: user});
      }));
    }));
  });
};

exports.top100 = function (req, res, next) {
  var opt = {limit: 100, sort: [
    ['score', 'desc']
  ]};
  User.getUsersByQuery({'$or': [
    {is_block: {'$exists': false}},
    {is_block: false},
  ]}, opt, function (err, tops) {
    if (err) {
      return next(err);
    }
    res.render('user/top100', {users: tops});
  });
};

exports.list_topics = function (req, res, next) {
  var user_name = req.params.name;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  User.getUserByName(user_name, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/topics', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    var proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);
    proxy.fail(next);

    var query = {'author_id': user._id};
    var opt = {skip: (page - 1) * limit, limit: limit, sort: [
      ['create_at', 'desc']
    ]};
    Topic.getTopicsByQuery(query, opt, proxy.done('topics'));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }

    Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
      var pages = Math.ceil(all_topics_count / limit);
      proxy.emit('pages', pages);
    }));
  });
};

exports.list_replies = function (req, res, next) {
  var user_name = req.params.name;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  User.getUserByName(user_name, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/replies', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    var proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);
    proxy.fail(next);

    Reply.getRepliesByAuthorId(user._id, proxy.done(function (replies) {
      // 获取所有有评论的主题
      var topic_ids = [];
      for (var i = 0; i < replies.length; i++) {
        if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
          topic_ids.push(replies[i].topic_id);
        }
      }
      var query = {'_id': {'$in': topic_ids}};
      var opt = {skip: (page - 1) * limit, limit: limit, sort: [
        ['create_at', 'desc']
      ]};
      Topic.getTopicsByQuery(query, opt, proxy.done('topics'));

      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);
      }));
    }));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }
  });
};

exports.block = function (req, res, next) {
  var userName = req.params.name;

  var ep = EventProxy.create();
  ep.fail(next);

  User.getUserByName(userName, ep.done(function (user) {
    if (req.body.action === 'set_block') {
      ep.all('block_user', 'del_topics', 'del_replys',
        function (user, topics, replys) {
          res.json({status: 'success'});
        });
      user.is_block = true;
      user.save(ep.done('block_user'));

      // 防止误操作
      // TopicModel.remove({author_id: user._id}, ep.done('del_topics'));
      // ReplyModel.remove({author_id: user._id}, ep.done('del_replys'));
      ep.emit('del_topics');
      ep.emit('del_replys');
      // END 防止误操作

    } else if (req.body.action === 'cancel_block') {
      user.is_block = false;
      user.save(ep.done(function () {

        res.json({status: 'success'});
      }));
    }
  }));
};
