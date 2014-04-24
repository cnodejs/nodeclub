/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var config = require('../config').config;
var EventProxy = require('eventproxy');

// 主页的缓存工作
var queryCache = {};
setInterval(function () {
  queryCache = {};
}, 1000 * 60 * 1); // 一分钟更新一次

var topicsCache;
setInterval(function () {
  topicsCache = null;
}, 1000 * 5); // 五秒更新一次
// END 主页的缓存工作

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  var limit = config.list_topic_count;

  var proxy = EventProxy.create('topics', 'tops', 'no_reply_topics', 'pages',
    function (topics, tops, no_reply_topics, pages) {
      res.render('index', {
        topics: topics,
        current_page: page,
        list_topic_count: limit,
        tops: tops,
        no_reply_topics: no_reply_topics,
        pages: pages,
      });
    });
  proxy.fail(next);

  var query = {};
  // 取主题
  var options = { skip: (page - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  if (topicsCache) {
    proxy.emit('topics', topicsCache);
  } else {
    Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
      topicsCache = topics;
      return topics;
    }));
  }
  // 取排行榜上的用户
  if (queryCache.tops) {
    proxy.emit('tops', queryCache.tops);
  } else {
    User.getUsersByQuery(
      {'$or': [{is_block: {'$exists': false}}, {is_block: false}]},
      { limit: 10, sort: [ [ 'score', 'desc' ] ] },
      proxy.done('tops', function (tops) {
        queryCache.tops = tops;
        return tops;
      })
    );
  }
  // 取0回复的主题
  if (queryCache.no_reply_topics) {
    proxy.emit('no_reply_topics', queryCache.no_reply_topics);
  } else {
    Topic.getTopicsByQuery(
      { reply_count: 0 },
      { limit: 5, sort: [ [ 'create_at', 'desc' ] ] },
      proxy.done('no_reply_topics', function (no_reply_topics) {
        queryCache.no_reply_topics = no_reply_topics;
        return no_reply_topics;
      }));
  }
  // 取分页数据
  if (queryCache.pages) {
    proxy.emit('pages', queryCache.pages);
  } else {
    Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
      var pages = Math.ceil(all_topics_count / limit);
      queryCache.pages = pages;
      proxy.emit('pages', pages);
    }));
  }
};
