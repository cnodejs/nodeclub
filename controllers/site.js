/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var _ = require('lodash');
var User = require('../proxy').User;
var Relation = require('../proxy').Relation;
var Topic = require('../proxy').Topic;
var config = require('../config').config;
var EventProxy = require('eventproxy');
var mcache = require('memory-cache');

// 主页的缓存工作
setInterval(function () {
  var limit = config.list_topic_count;
  // 只缓存第一页, page = 1
  var options = { skip: (1 - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  var cacheKey = JSON.stringify([{}, options]);
  Topic.getTopicsByQuery({}, options, function (err, topics) {
    mcache.put(cacheKey, topics);
    return topics;
  });
}, 1000 * 5); // 五秒更新一次
// END 主页的缓存工作

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;
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
        site_links: config.site_links
      });
    });
  proxy.fail(next);

  proxy.on('blockings', function(blockIds) {
    var query = {};
    if (blockIds && blockIds.length > 0) {
      query = {author_id: {$nin: blockIds}};
    }

    // 取主题
    var options = { skip: (page - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
    var topicsCacheKey = JSON.stringify([query, options]);
    if (mcache.get(topicsCacheKey)) {
      proxy.emit('topics', mcache.get(topicsCacheKey));
    } else {
      Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
        return topics;
      }));
    }

    // 取分页数据
    var pagesCacheKey = JSON.stringify([query, 'pages']);
    if (mcache.get(pagesCacheKey)) {
      proxy.emit('pages', mcache.get(pagesCacheKey));
    } else {
      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        mcache.put(pagesCacheKey, pages, 1000 * 60 * 1);
        proxy.emit('pages', pages);
      }));
    }

    // 取0回复的主题
    if (mcache.get('no_reply_topics')) {
      proxy.emit('no_reply_topics', mcache.get('no_reply_topics'));
    } else {
      Topic.getTopicsByQuery(
        _.assign({ reply_count: 0 }, query),
        { limit: 5, sort: [ [ 'create_at', 'desc' ] ] },
        proxy.done('no_reply_topics', function (no_reply_topics) {
          mcache.put('no_reply_topics', no_reply_topics, 1000 * 60 * 1);
          return no_reply_topics;
        }));
    }
  });

  if (req.session.user) {
    Relation.getBlockings(
      req.session.user._id,
      proxy.done('blockings', function(rels) {
        return _.pluck(rels, 'block_id');
      })
    );
  } else {
    proxy.emit('blockings');
  }

  // 取排行榜上的用户
  if (mcache.get('tops')) {
    proxy.emit('tops', mcache.get('tops'));
  } else {
    User.getUsersByQuery(
      {'$or': [{is_block: {'$exists': false}}, {is_block: false}]},
      { limit: 10, sort: [ [ 'score', 'desc' ] ] },
      proxy.done('tops', function (tops) {
        mcache.put('tops', tops, 1000 * 60 * 1);
        return tops;
      })
    );
  }
};
