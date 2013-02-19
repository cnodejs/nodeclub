var topic_ctrl = require('./topic');

var config = require('../config').config;
var data2xml = require('data2xml');
var markdown = require('node-markdown').Markdown;

exports.index = function (req, res, next) {
  if (!config.rss) {
    res.statusCode = 404;
    return res.send('Please set `rss` in config.js');
  }
  var opt = { limit: config.rss.max_rss_items, sort: [ [ 'create_at', 'desc' ] ] };

  topic_ctrl.getTopicsByQuery({}, opt, function (err, topics) {
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

    var rss_content = data2xml('rss', rss_obj);

    res.contentType('application/xml');
    res.send(rss_content);
  });
};
