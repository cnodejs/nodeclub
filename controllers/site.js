/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

'use strict';

var tag_ctrl = require('./tag');
var user_ctrl = require('./user');
var topic_ctrl = require('./topic');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;


exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  var keyword = req.query.q || ''; // in-site search
  var limit;
  var render;
  var proxy;
  var options;
  var query;
  
  if (Array.isArray(keyword)) {
    keyword = keyword.join(' ');
  }
  
  keyword = keyword.trim();
  limit = config.list_topic_count;

  // 當所有資料查詢完成時執行 render
  render = function (tags, announcements, topics, hot_topics, stars, tops, no_reply_topics, pages) {
    var all_tags = tags.slice(0);
    var hot_tags;
    var recent_tags;

    // 計算最熱標簽
    tags.sort(function (tag_a, tag_b) {
      return tag_b.topic_count - tag_a.topic_count;
    });
    hot_tags = tags.slice(0, 5);

    // 計算最新標簽
    tags.sort(function (tag_a, tag_b) {
      return tag_b.create_at - tag_a.create_at;
    });
    recent_tags = tags.slice(0, 5);
    
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
      announcement: announcements[0],
      keyword: keyword
    });
  };

  proxy = EventProxy.create('tags', 'announcements', 'topics', 'hot_topics', 'stars', 'tops', 'no_reply_topics', 'pages', render);
  proxy.once('error', function (err) {
    proxy.unbind();
    next(err);
  });
  
  // 取得標籤
  tag_ctrl.get_all_tags(function (err, tags) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('tags', tags);
  });

  options = { skip: (page - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  query = {};
  
  if (keyword) {
    keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g, '');
    query.title = new RegExp(keyword, 'i');
  }
  
  // 取得最新公告
  topic_ctrl.get_announcements_by_query({}, {limit: 1, sort: [['update_at', 'desc']]}, function (err, announcements) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('announcements', announcements);
  });
  
  // 取得主題
  topic_ctrl.get_topics_by_query(query, options, function (err, topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('topics', topics);
  });

  // 取得熱門主題
  topic_ctrl.get_topics_by_query({}, { limit: 5, sort: [ [ 'visit_count', 'desc' ] ] }, function (err, hot_topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('hot_topics', hot_topics);
  });
  
  // 達人
  user_ctrl.get_users_by_query({ is_star: true }, { limit: 5 }, function (err, users) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('stars', users);
  });
  
  // 積分榜
  user_ctrl.get_users_by_query({}, { limit: 10, sort: [ [ 'score', 'desc' ] ] }, function (err, tops) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('tops', tops);
  });

  // 無人回覆主題
  topic_ctrl.get_topics_by_query({ reply_count: 0 }, { limit: 5, sort: [ [ 'create_at', 'desc' ] ] }, function (err, no_reply_topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('no_reply_topics', no_reply_topics);
  });

  // 計算頁數
  topic_ctrl.get_count_by_query(query, function (err, all_topics_count) {
    if (err) {
      return proxy.emit('error', err);
    }
    var pages = Math.ceil(all_topics_count / limit);
    proxy.emit('pages', pages);
  });
};
