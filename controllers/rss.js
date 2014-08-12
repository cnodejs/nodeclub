var config = require('../config').config;
var convert = require('data2xml')();
var markdown = require('node-markdown').Markdown;
var Topic = require('../proxy').Topic;
var mcache = require('memory-cache');

exports.index = function (req, res, next) {
  if (!config.rss) {
    res.statusCode = 404;
    return res.send('Please set `rss` in config.js');
  }
  res.contentType('application/xml');
  if (!config.debug && mcache.get('rss')) {
    res.send(mcache.get('rss'));
  } else {
    var opt = { limit: config.rss.max_rss_items, sort: [
      [ 'create_at', 'desc' ]
    ] };
    Topic.getTopicsByQuery({}, opt, function (err, topics) {
      if (err) {
        return next(err);
      }
      var rss_obj = {
        _attr: { version: '2.0' },
        channel: {
          title: config.rss.title,
          link: config.rss.link,
          language: config.rss.language,
          description: config.rss.description,
          item: []
        },
      };

      topics.forEach(function (topic) {
        rss_obj.channel.item.push({
          title: topic.title,
          link: config.rss.link + '/topic/' + topic._id,
          guid: config.rss.link + '/topic/' + topic._id,
          description: markdown(topic.content, true),
          author: topic.author.name,
          pubDate: topic.create_at.toUTCString()
        });
      });

      var rssContent = convert('rss', rss_obj);

      mcache.put('rss', rssContent, 1000 * 60 * 5); // 五分钟
      res.send(rssContent);
    });
  }
};
