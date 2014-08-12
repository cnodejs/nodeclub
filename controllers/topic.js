/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var sanitize = require('validator').sanitize;

var at = require('../services/at');
var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Tag = require('../proxy').Tag;
var TopicTag = require('../proxy').TopicTag;
var TopicCollect = require('../proxy').TopicCollect;
var Relation = require('../proxy').Relation;
var EventProxy = require('eventproxy');
var Util = require('../libs/util');

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.index = function (req, res, next) {
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.render('notify/notify', {
      error: '此话题不存在或已被删除。'
    });
  }
  var events = ['topic', 'other_topics', 'no_reply_topics', 'relation'];
  var ep = EventProxy.create(events, function (topic, other_topics, no_reply_topics, relation) {
    res.render('topic/index', {
      topic: topic,
      author_other_topics: other_topics,
      no_reply_topics: no_reply_topics,
      relation: relation
    });
  });

  ep.fail(next);

  Topic.getFullTopic(topic_id, ep.done(function (message, topic, author, replies) {
    if (message) {
      ep.unbind();
      return res.render('notify/notify', { error: message });
    }

    topic.visit_count += 1;
    topic.save();

    // format date
    topic.friendly_create_at = Util.format_date(topic.create_at, true);
    topic.friendly_update_at = Util.format_date(topic.update_at, true);

    topic.author = author;
    topic.replies = replies;

    if (!req.session.user) {
      ep.emit('topic', topic);
      ep.emit('relation', null);
    } else {
      TopicCollect.getTopicCollect(req.session.user._id, topic._id, ep.done(function (doc) {
        topic.in_collection = doc;
        ep.emit('topic', topic);
      }));
      Relation.getRelation(req.session.user._id, author._id, ep.done('relation'));
    }

    // get author other topics
    var options = { limit: 5, sort: [
      [ 'last_reply_at', 'desc' ]
    ]};
    var query = { author_id: topic.author_id, _id: { '$nin': [ topic._id ] } };
    Topic.getTopicsByQuery(query, options, ep.done('other_topics'));

    // get no reply topics
    var options2 = { limit: 5, sort: [
      ['create_at', 'desc']
    ] };
    Topic.getTopicsByQuery({reply_count: 0}, options2, ep.done('no_reply_topics'));
  }));
};

exports.create = function (req, res, next) {
  res.render('topic/edit');
};

exports.put = function (req, res, next) {
  var title = sanitize(req.body.title).trim();
  title = sanitize(title).xss();
  var content = req.body.t_content;
  var topic_tags = [];
  if (req.body.topic_tags !== '') {
    topic_tags = req.body.topic_tags.split(',');
  }

  var edit_error =
      title === '' ?
    '标题不能是空的。' :
    (title.length >= 10 && title.length <= 100 ? '' : '标题字数太多或太少。');
  if (edit_error) {
    Tag.getAllTags(function (err, tags) {
      if (err) {
        return next(err);
      }
      for (var i = 0; i < topic_tags.length; i++) {
        for (var j = 0; j < tags.length; j++) {
          if (topic_tags[i] === tags[j]._id) {
            tags[j].is_selected = true;
          }
        }
      }
      res.render('topic/edit', {tags: tags, edit_error: edit_error, title: title, content: content});
    });
  } else {
    Topic.newAndSave(title, content, req.session.user._id, function (err, topic) {
      if (err) {
        return next(err);
      }

      var proxy = new EventProxy();
      var render = function () {
        res.redirect('/topic/' + topic._id);
      };

      proxy.assign('tags_saved', 'score_saved', render);
      proxy.fail(next);
      // 话题可以没有标签
      if (topic_tags.length === 0) {
        proxy.emit('tags_saved');
      }
      var tags_saved_done = function () {
        proxy.emit('tags_saved');
      };
      proxy.after('tag_saved', topic_tags.length, tags_saved_done);
      //save topic tags
      topic_tags.forEach(function (tag) {
        TopicTag.newAndSave(topic._id, tag, proxy.done('tag_saved'));
        Tag.getTagById(tag, proxy.done(function (tag) {
          tag.topic_count += 1;
          tag.save();
        }));
      });
      User.getUserById(req.session.user._id, proxy.done(function (user) {
        user.score += 5;
        user.topic_count += 1;
        user.save();
        req.session.user = user;
        proxy.emit('score_saved');
      }));

      //发送at消息
      at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
    });
  }
};

exports.showEdit = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    if (String(topic.author_id) === req.session.user._id || req.session.user.is_admin) {
      Tag.getAllTags(function (err, all_tags) {
        if (err) {
          return next(err);
        }
        for (var i = 0; i < tags.length; i++) {
          for (var j = 0; j < all_tags.length; j++) {
            if (tags[i].id === all_tags[j].id) {
              all_tags[j].is_selected = true;
            }
          }
        }

        res.render('topic/edit', {action: 'edit', topic_id: topic._id, title: topic.title, content: topic.content, tags: all_tags});
      });
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.update = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }

  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }

    if (String(topic.author_id) === req.session.user._id || req.session.user.is_admin) {
      var title = sanitize(req.body.title).trim();
      title = sanitize(title).xss();
      var content = req.body.t_content;
      var topic_tags = [];
      if (req.body.topic_tags !== '') {
        topic_tags = req.body.topic_tags.split(',');
      }

      if (title === '') {
        Tag.getAllTags(function (err, all_tags) {
          if (err) {
            return next(err);
          }
          for (var i = 0; i < topic_tags.length; i++) {
            for (var j = 0; j < all_tags.length; j++) {
              if (topic_tags[i] === all_tags[j]._id) {
                all_tags[j].is_selected = true;
              }
            }
          }
          res.render('topic/edit', {action: 'edit', edit_error: '标题不能是空的。', topic_id: topic._id, content: content, tags: all_tags});
        });
      } else {
        //保存话题
        //删除topic_tag，标签topic_count减1
        //保存新topic_tag
        topic.title = title;
        topic.content = content;
        topic.update_at = new Date();
        topic.save(function (err) {
          if (err) {
            return next(err);
          }

          var proxy = new EventProxy();
          var render = function () {
            res.redirect('/topic/' + topic._id);
          };
          proxy.assign('tags_removed_done', 'tags_saved_done', render);
          proxy.fail(next);

          // 删除topic_tag
          var tags_removed_done = function () {
            proxy.emit('tags_removed_done');
          };
          TopicTag.getTopicTagByTopicId(topic._id, function (err, docs) {
            if (docs.length === 0) {
              proxy.emit('tags_removed_done');
            } else {
              proxy.after('tag_removed', docs.length, tags_removed_done);
              // delete topic tags
              docs.forEach(function (doc) {
                doc.remove(proxy.done(function () {
                  Tag.getTagById(doc.tag_id, proxy.done(function (tag) {
                    proxy.emit('tag_removed');
                    tag.topic_count -= 1;
                    tag.save();
                  }));
                }));
              });
            }
          });
          // 保存topic_tag
          var tags_saved_done = function () {
            proxy.emit('tags_saved_done');
          };
          //话题可以没有标签
          if (topic_tags.length === 0) {
            proxy.emit('tags_saved_done');
          } else {
            proxy.after('tag_saved', topic_tags.length, tags_saved_done);
            //save topic tags
            topic_tags.forEach(function (tag) {
              TopicTag.newAndSave(topic._id, tag, proxy.done('tag_saved'));
              Tag.getTagById(tag, proxy.done(function (tag) {
                tag.topic_count += 1;
                tag.save();
              }));
            });
          }
          //发送at消息
          at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
        });
      }
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.delete = function (req, res, next) {
  //删除话题, 话题作者topic_count减1
  //删除回复，回复作者reply_count减1
  //删除topic_tag，标签topic_count减1
  //删除topic_collect，用户collect_topic_count减1
  if (!req.session.user || !req.session.user.is_admin) {
    return res.send({success: false, message: '无权限'});
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.send({ success: false, error: '此话题不存在或已被删除。' });
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    if (!topic) {
      return res.send({ success: false, message: '此话题不存在或已被删除。' });
    }
    topic.remove(function (err) {
      if (err) {
        return res.send({ success: false, message: err.message });
      }
      res.send({ success: true, message: '话题已被删除。' });
    });
  });
};

exports.top = function (req, res, next) {
  if (!req.session.user.is_admin) {
    res.redirect('/');
    return;
  }
  var topic_id = req.params.tid;
  var is_top = req.params.is_top;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    topic.top = is_top;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.top ? '此话题已经被置顶。' : '此话题已经被取消置顶。';
      res.render('notify/notify', {success: msg});
    });
  });
};

exports.collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }

    TopicCollect.getTopicCollect(req.session.user._id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 'success'});
        return;
      }

      TopicCollect.newAndSave(req.session.user._id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 'success'});
      });
      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_topic_count += 1;
        user.save();
      });

      req.session.user.collect_topic_count += 1;
      topic.collect_count += 1;
      topic.save();
    });
  });
};

exports.de_collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }
    TopicCollect.remove(req.session.user._id, topic._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.collect_topic_count -= 1;
      user.save();
    });

    topic.collect_count -= 1;
    topic.save();

    req.session.user.collect_topic_count -= 1;
  });
};
