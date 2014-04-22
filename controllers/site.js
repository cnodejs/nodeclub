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
var Tag = require('../proxy').Tag;
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

  var proxy = EventProxy.create('topics', 'tops', 'no_reply_topics', 'pages',
    function (topics, tops, no_reply_topics, pages) {
      res.render('index', {
        topics: topics,
        current_page: page,
        list_topic_count: limit,
        tops: tops,
        no_reply_topics: no_reply_topics,
        pages: pages,
        keyword: keyword
      });
    });
  proxy.fail(next);

  var options = { skip: (page - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  var query = {};
  if (keyword) {
    keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g, '');
    query.title = new RegExp(keyword, 'i');
  }
  // 取主题
  Topic.getTopicsByQuery(query, options, proxy.done('topics'));
  // 取排行榜上的用户
  User.getUsersByQuery({'$or': [
    {is_block: {'$exists': false}},
    {is_block: false},
  ]},
  { limit: 10, sort: [ [ 'score', 'desc' ] ] }, proxy.done('tops'));
  // 取0回复的主题
  Topic.getTopicsByQuery({ reply_count: 0 }, { limit: 5, sort: [ [ 'create_at', 'desc' ] ] },
  proxy.done('no_reply_topics'));
  // 取分页数据
  Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
    var pages = Math.ceil(all_topics_count / limit);
    proxy.emit('pages', pages);
  }));
};
