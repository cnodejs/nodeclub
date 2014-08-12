var sanitize = require('validator').sanitize;

var Topic = require('../proxy').Topic;
var TagCollect = require('../proxy').TagCollect;
var Tag = require('../proxy').Tag;
var TopicTag = require('../proxy').TopicTag;
var User = require('../proxy').User;

var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.list_topic = function (req, res, next) {
  var tag_name = req.params.name;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  Tag.getTagByName(tag_name, function (err, tag) {
    if (err) {
      return next(err);
    }
    if (!tag) {
      return res.render('notify/notify', {error: '没有这个标签。'});
    }
    var done = function (topic_ids, collection, hot_topics, no_reply_topics, pages) {
      var query = {'_id': {'$in': topic_ids}};
      var opt = {skip: (page - 1) * limit, limit: limit, sort: [
        ['create_at', 'desc']
      ]};

      Topic.getTopicsByQuery(query, opt, function (err, topics) {
        for (var i = 0; i < topics.length; i++) {
          for (var j = 0; j < topics[i].tags.length; j++) {
            if (topics[i].tags[j].id === tag.id) {
              topics[i].tags[j].highlight = true;
            }
          }
        }

        var style = tag.background === '' ? null : '#wrapper {background-image: url("' + tag.background + '")}';

        res.render('tag/list_topic', {
          tag: tag,
          topics: topics,
          current_page: page,
          list_topic_count: limit,
          in_collection: collection,
          hot_topics: hot_topics,
          no_reply_topics: no_reply_topics,
          pages: pages,
          extra_style: style
        });
      });
    };

    var proxy = new EventProxy();
    proxy.assign('topic_ids', 'collection', 'hot_topics', 'no_reply_topics', 'pages', done);
    proxy.fail(next);

    TopicTag.getTopicTagByTagId(tag._id, proxy.done(function (docs) {
      var topic_ids = [];

      for (var i = 0; i < docs.length; i++) {
        topic_ids.push(docs[i].topic_id);
      }
      proxy.emit('topic_ids', topic_ids);

      Topic.getCountByQuery({'_id': {'$in': topic_ids}}, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);
      }));
    }));

    if (!req.session.user) {
      proxy.emit('collection', null);
    } else {
      TagCollect.getTagCollect(req.session.user._id, tag._id, proxy.done('collection'));
    }

    var opt = {limit: 5, sort: [
      ['visit_count', 'desc']
    ]};
    Topic.getTopicsByQuery({}, opt, proxy.done('hot_topics'));

    opt = {limit: 5, sort: [
      ['create_at', 'desc']
    ]};
    Topic.getTopicsByQuery({reply_count: 0}, opt, proxy.done('no_reply_topics'));
  });
};

exports.edit_tags = function (req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '你还没有登录。'});
    return;
  }
  if (!req.session.user.is_admin) {
    res.render('notify/notify', {error: '管理员才能编辑标签。'});
    return;
  }
  Tag.getAllTags(function (err, tags) {
    if (err) {
      return next(err);
    }
    res.render('tag/edit_all', {tags: tags});
  });
};

exports.add = function (req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.is_admin) {
    res.send('fobidden!');
    return;
  }

  var name = sanitize(req.body.name).trim();
  name = sanitize(name).xss();
  var description = sanitize(req.body.description).trim();
  description = sanitize(description).xss();
  var background = sanitize(req.body.background).trim();
  background = sanitize(background).xss();
  var order = req.body.order;

  if (name === '') {
    res.render('notify/notify', {error: '信息不完整。'});
    return;
  }

  Tag.getTagByName(name, function (err, tags) {
    if (err) {
      return next(err);
    }
    if (tags && tags.length > 0) {
      res.render('notify/notify', {error: '这个标签已存在。'});
      return;
    }
    Tag.newAndSave(name, background, order, description, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/tags/edit');
    });
  });
};

exports.edit = function (req, res, next) {
  var tag_name = req.params.name;
  Tag.getTagByName(tag_name, function (err, tag) {
    if (err) {
      return next(err);
    }
    if (!tag) {
      res.render('notify/notify', {error: '没有这个标签。'});
      return;
    }

    Tag.getAllTags(function (err, tags) {
      if (err) {
        return next(err);
      }
      res.render('tag/edit', {tag: tag, tags: tags});
      return;
    });
  });
};

exports.update = function (req, res, next) {
  var id = req.params.id;
  Tag.getTagById(id, function (err, tag) {
    if (err) {
      return next(err);
    }
    if (!tag) {
      res.render('notify/notify', {error: '没有这个标签。'});
      return;
    }

    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    var order = req.body.order;
    var background = sanitize(req.body.background).trim();
    background = sanitize(background).xss();
    var description = sanitize(req.body.description).trim();
    description = sanitize(description).xss();
    if (name === '') {
      res.render('notify/notify', {error: '信息不完整。'});
      return;
    }
    tag.name = name;
    tag.order = order;
    tag.background = background;
    tag.description = description;
    tag.save(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/tags/edit');
    });
  });
};

exports.delete = function (req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '你还没有登录。'});
    return;
  }
  if (!req.session.user.is_admin) {
    res.render('notify/notify', {error: '管理员才能编辑标签。'});
    return;
  }
  var tag_name = req.params.name;
  Tag.getTagByName(tag_name, function (err, tag) {
    if (err) {
      return next(err);
    }
    if (!tag) {
      res.render('notify/notify', {error: '没有这个标签。'});
      return;
    }
    var proxy = new EventProxy();
    var done = function () {
      tag.remove(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    };
    proxy.assign('topic_tag_removed', 'tag_collect_removed', done);
    proxy.fail(next);
    // 删除带该标签的主题标签关系
    TopicTag.removeByTagId(tag._id, proxy.done('topic_tag_removed'));
    // 删除带该表前的收藏关系
    TagCollect.removeAllByTagId(tag._id, proxy.done('tag_collect_removed'));
  });
};

exports.collect = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('fobidden!');
    return;
  }
  var tag_id = req.body.tag_id;
  Tag.getTagById(tag_id, function (err, tag) {
    if (err) {
      return next(err);
    }
    if (!tag) {
      res.json({status: 'failed'});
    }

    TagCollect.getTagCollect(req.session.user._id, tag._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 'success'});
        return;
      }
      TagCollect.newAndSave(req.session.user._id, tag._id, function (err) {
        if (err) {
          return next(err);
        }
        //用户更新collect_tag_count
        User.getUserById(req.session.user._id, function (err, user) {
          if (err) {
            return next(err);
          }
          user.collect_tag_count += 1;
          user.save();
          req.session.user.collect_tag_count += 1;
          //标签更新collect_count
          tag.collect_count += 1;
          tag.save();
          res.json({status: 'success'});
        });
      });
    });
  });
};

exports.de_collect = function (req, res, next) {
  var tag_id = req.body.tag_id;
  Tag.getTagById(tag_id, function (err, tag) {
    if (err) {
      return next(err);
    }
    if (!tag) {
      res.json({status: 'failed'});
    }
    TagCollect.remove(req.session.user._id, tag._id, function (err) {
      if (err) {
        return next(err);
      }
      //用户更新collect_tag_count
      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_tag_count -= 1;
        user.save();
        req.session.user.collect_tag_count -= 1;
        tag.collect_count -= 1;
        tag.save();
        res.json({status: 'success'});
      });
    });
  });
};
