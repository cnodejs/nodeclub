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
var config = require('../config');
var eventproxy = require('eventproxy');
var mcache = require('memory-cache');
var xmlbuilder = require('xmlbuilder');
var renderHelpers = require('../common/render_helpers');

// 主页的缓存工作。主页是需要主动缓存的
function indexCache() {
  var limit = config.list_topic_count;
  // 为所有版块（tab）做缓存
  [['', '全部']].concat(config.tabs).forEach(function (pair) {
    // 只缓存第一页, page = 1。options 之所以每次都生成是因为 mongoose 查询时，
    // 会改动它
    var options = { skip: (1 - 1) * limit, limit: limit, sort: '-top -last_reply_at'};
    var tabValue = pair[0];
    var query = {};
    if (tabValue) {
      query.tab = tabValue;
    }
    var optionsStr = JSON.stringify(query) + JSON.stringify(options);
    Topic.getTopicsByQuery(query, options, function (err, topics) {
      mcache.put(optionsStr, topics);
      return topics;
    });
  });
}
setInterval(indexCache, 1000 * 5); // 五秒更新一次
indexCache();
// END 主页的缓存工作

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;
  var tab = req.query.tab || req.session.tab || 'all';
  req.session.tab = tab;
  var limit = config.list_topic_count;

  var tabName = renderHelpers.tabName(tab);
  var proxy = eventproxy.create('topics', 'tops', 'no_reply_topics', 'pages',
    function (topics, tops, no_reply_topics, pages) {
      res.render('index', {
        topics: topics,
        current_page: page,
        list_topic_count: limit,
        tops: tops,
        no_reply_topics: no_reply_topics,
        pages: pages,
        tabs: config.tabs,
        tab: tab,
        pageTitle: tabName && (tabName + '版块'),
      });
    });
  proxy.fail(next);

  // 取主题
  var query = {};
  if (tab && tab !== 'all') {
    query.tab = tab;
  }
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};
  var optionsStr = JSON.stringify(query) + JSON.stringify(options);
  if (mcache.get(optionsStr)) {
    proxy.emit('topics', mcache.get(optionsStr));
  } else {
    Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
      return topics;
    }));
  }
  // END 取主题

  // 取排行榜上的用户
  if (mcache.get('tops')) {
    proxy.emit('tops', mcache.get('tops'));
  } else {
    User.getUsersByQuery(
      {'$or': [
        {is_block: {'$exists': false}},
        {is_block: false}
      ]},
      { limit: 10, sort: '-score'},
      proxy.done('tops', function (tops) {
        mcache.put('tops', tops, 1000 * 60 * 1);
        return tops;
      })
    );
  }
  // 取0回复的主题
  if (mcache.get('no_reply_topics')) {
    proxy.emit('no_reply_topics', mcache.get('no_reply_topics'));
  } else {
    Topic.getTopicsByQuery(
      { reply_count: 0 },
      { limit: 5, sort: '-create_at'},
      proxy.done('no_reply_topics', function (no_reply_topics) {
        mcache.put('no_reply_topics', no_reply_topics, 1000 * 60 * 1);
        return no_reply_topics;
      }));
  }
  // 取分页数据
  if (mcache.get('pages')) {
    proxy.emit('pages', mcache.get('pages'));
  } else {
    Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
      var pages = Math.ceil(all_topics_count / limit);
      mcache.put(JSON.stringify(query) + 'pages', pages, 1000 * 60 * 1);
      proxy.emit('pages', pages);
    }));
  }
};

exports.sitemap = function (req, res, next) {
  var urlset = xmlbuilder.create('urlset',
    {version: '1.0', encoding: 'UTF-8'});
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  var ep = new eventproxy();
  ep.fail(next);

  ep.all('sitemap', function (sitemap) {
    res.type('xml');
    res.send(sitemap);
  });

  var sitemapData = mcache.get('sitemap');
  if (sitemapData) {
    ep.emit('sitemap', sitemapData);
  } else {
    Topic.getLimit5w(function (err, topics) {
      if (err) {
        return next(err);
      }
      topics.forEach(function (topic) {
        urlset.ele('url').ele('loc', 'http://cnodejs.org/topic/' + topic._id);
      });

      var sitemapData = urlset.end();
      // 缓存一天
      mcache.put('sitemap', sitemapData, 1000 * 3600 * 24);
      ep.emit('sitemap', sitemapData);
    });
  }
};
