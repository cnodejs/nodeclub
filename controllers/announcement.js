var tag_ctrl = require('./tag');
var user_ctrl = require('./user');
var topic_ctrl = require('./topic');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;


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
    // 計算最熱標簽
    tags.sort(function (tag_a, tag_b) {
      return tag_b.topic_count - tag_a.topic_count;
    });
    var hot_tags = tags.slice(0, 5); 

    // 計算最新標簽
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
  proxy.once('error', function (err) {
    proxy.unbind();
    next(err);
  });
  tag_ctrl.get_all_tags(function (err, tags) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('tags', tags);
  });

  var options = { skip: (page - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  var query = {};
  if (keyword) {
    keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g, '');
    query.title = new RegExp(keyword, 'i');
  }
  topic_ctrl.get_announcements_by_query(query, options, function (err, topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('topics', topics);
  });
  topic_ctrl.get_topics_by_query({}, { limit: 5, sort: [ [ 'visit_count', 'desc' ] ] }, function (err, hot_topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('hot_topics', hot_topics);
  });
  user_ctrl.get_users_by_query({ is_star: true }, { limit: 5 }, function (err, users) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('stars', users);
  }); 
  user_ctrl.get_users_by_query({}, { limit: 10, sort: [ [ 'score', 'desc' ] ] }, function (err, tops) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('tops', tops);
  });
  topic_ctrl.get_topics_by_query({ reply_count: 0 }, { limit: 5, sort: [ [ 'create_at', 'desc' ] ] }, 
  function (err, no_reply_topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('no_reply_topics', no_reply_topics);
  });
  topic_ctrl.get_count_by_query(query, function (err, all_topics_count) {
    if (err) {
      return proxy.emit('error', err);
    }
    var pages = Math.ceil(all_topics_count / limit);
    proxy.emit('pages', pages);
  });
};

