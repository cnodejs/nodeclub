/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var tag_ctrl = require('./tag');
var user_ctrl = require('./user');
var topic_ctrl = require('./topic');
var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  var keyword = req.query.q || ''; // in-site search
  if (Array.isArray(keyword)) {
    keyword = keyword.join(' ');
  }
  keyword = keyword.trim();
  var limit = config.list_topic_count;

  var render = function (tags, topics, hot_topics, stars, tops, no_reply_topics, pages) {
    var all_tags = tags.slice(0);

    // 计算最热标签
    tags.sort(function (tag_a, tag_b) {
      return tag_b.topic_count - tag_a.topic_count;
    });

    // 计算最新标签
    tags.sort(function (tag_a, tag_b) {
      return tag_b.create_at - tag_a.create_at;
    });
    var recent_tags = tags.slice(0, 5);
    res.render('index', {
      tags: all_tags,
      topics: topics,
      current_page: page,
      list_topic_count: limit,
      recent_tags: recent_tags,
      hot_topics: hot_topics,
      stars: stars,
      tops: tops,
      no_reply_topics: no_reply_topics,
      pages: pages,
      keyword: keyword
    });
  };

  var proxy = EventProxy.create('tags', 'topics', 'hot_topics', 'stars', 'tops', 'no_reply_topics', 'pages', render);
  proxy.fail(next);
  // 取标签
  tag_ctrl.get_all_tags(proxy.done('tags'));

  var options = { skip: (page - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  var query = {};
  if (keyword) {
    keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g, '');
    query.title = new RegExp(keyword, 'i');
  }
  // 取主题
  topic_ctrl.get_topics_by_query(query, options, proxy.done('topics'));
  // 取热门主题
  topic_ctrl.get_topics_by_query({}, { limit: 5, sort: [ [ 'visit_count', 'desc' ] ] }, proxy.done('hot_topics'));
  // 取星标用户
  user_ctrl.get_users_by_query({ is_star: true }, { limit: 5 }, proxy.done('stars'));
  // 取排行榜上的用户
  user_ctrl.get_users_by_query({}, { limit: 10, sort: [ [ 'score', 'desc' ] ] }, proxy.done('tops'));
  // 取0回复的主题
  topic_ctrl.get_topics_by_query({ reply_count: 0 }, { limit: 5, sort: [ [ 'create_at', 'desc' ] ] },
  proxy.done('no_reply_topics'));
  // 取分页数据
  topic_ctrl.get_count_by_query(query, proxy.done(function (all_topics_count) {
    var pages = Math.ceil(all_topics_count / limit);
    proxy.emit('pages', pages);
  }));
};
