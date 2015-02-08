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
var cache = require('../common/cache');
var xmlbuilder = require('xmlbuilder');
var renderHelper = require('../common/render_helper');

// 主页的缓存工作。主页是需要主动缓存的
function indexCache() {
  if (config.debug) {
    return;
  }
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
      cache.set(optionsStr, topics);
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

  var proxy = new eventproxy();
  proxy.fail(next);

  // 取主题
  var query = {};
  if (tab && tab !== 'all') {
    if (tab === 'good') {
      query.good = true;
    } else {
      query.tab = tab;
    }
  }

  var limit = config.list_topic_count;
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};
  var optionsStr = JSON.stringify(query) + JSON.stringify(options);

  cache.get(optionsStr, proxy.done(function (topics) {
    if (topics) {
      return proxy.emit('topics', topics);
    }
    Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
      return topics;
    }));
  }));
  // END 取主题

  // 取排行榜上的用户
  cache.get('tops', proxy.done(function (tops) {
    if (tops) {
      proxy.emit('tops', tops);
    } else {
      User.getUsersByQuery(
        {'$or': [
          {is_block: {'$exists': false}},
          {is_block: false}
        ]},
        { limit: 10, sort: '-score'},
        proxy.done('tops', function (tops) {
          cache.set('tops', tops, 1000 * 60 * 1);
          return tops;
        })
      );
    }
  }));

  // 取0回复的主题
  cache.get('no_reply_topics', proxy.done(function (no_reply_topics) {
    if (no_reply_topics) {
      proxy.emit('no_reply_topics', no_reply_topics);
    } else {
      Topic.getTopicsByQuery(
        { reply_count: 0 },
        { limit: 5, sort: '-create_at'},
        proxy.done('no_reply_topics', function (no_reply_topics) {
          cache.set('no_reply_topics', no_reply_topics, 1000 * 60 * 1);
          return no_reply_topics;
        }));
    }
  }));

  // 取分页数据
  cache.get('pages', proxy.done(function (pages) {
    if (pages) {
      proxy.emit('pages', pages);
    } else {
      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        cache.set(JSON.stringify(query) + 'pages', pages, 1000 * 60 * 1);
        proxy.emit('pages', pages);
      }));
    }
  }));

  var tabName = renderHelper.tabName(tab);
  proxy.all('topics', 'tops', 'no_reply_topics', 'pages',
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

  cache.get('sitemap', ep.done(function (sitemapData) {
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
        cache.set('sitemap', sitemapData, 1000 * 3600 * 24);
        ep.emit('sitemap', sitemapData);
      });
    }
  }));
};

exports.appDownload = function (req, res, next) {
  if (/Android/i.test(req.headers['user-agent'])) {
    res.redirect('http://fir.im/ks4u');
  } else {
    res.redirect('https://itunes.apple.com/cn/app/id954734793');
  }
};
