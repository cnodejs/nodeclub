var Topic = require('../../proxy/topic');
var support = require('../support/support');
var should = require('should');

describe('proxy/topic.js', function () {
  var user;
  var topic;
  before(function (done) {
    support.createUser(function (err, _user) {
      should.not.exist(err);
      user = _user;
      support.createTopic(_user._id, function (err, _topic) {
        should.not.exist(err);
        topic = _topic;
        done();
      });
    });
  });

  describe('updateLastReply()', function () {
    it('should update a topic reply count success when topic not exists', function (done) {
      Topic.updateLastReply('aaaaaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaa', function (err, result) {
        should.not.exist(err);
        should.not.exist(result);
        done();
      });
    });
  });

  describe('newAndSave', function () {
    it('should ok', function (done) {
      Topic.newAndSave('title', 'content', user._id, function (err, topic) {
        should.not.exist(err);
        topic.title.should.equal('title');
        topic.content.should.equal('content');
        done();
      });
    });
  });

  describe('getTopicById', function () {
    it('should empty', function (done) {
      Topic.getTopicById(null, function (err, topic, author, lastReply) {
        should.not.exist(err);
        should.not.exist(topic);
        should.not.exist(author);
        should.not.exist(lastReply);
        done();
      });
    });

    it('should ok', function (done) {
      Topic.getTopicById(topic._id, function (err, topic, author, lastReply) {
        should.not.exist(err);
        should.exist(topic);
        author.loginname.should.equal(user.loginname);
        should.not.exist(lastReply);
        done();
      });
    });
  });

  describe('getFullTopic', function () {
    it('should empty', function (done) {
      Topic.getFullTopic(null, function (err, message, topic, author, replies) {
        should.not.exist(err);
        message.should.be.equal("此话题不存在或已被删除。");
        done();
      });
    });

    it('should ok', function (done) {
      Topic.getFullTopic(topic._id, function (err, message, topic, author, replies) {
        should.not.exist(err);
        message.should.be.equal("");
        topic.author_id.should.eql(user._id);
        author.loginname.should.be.equal(user.loginname);
        replies.should.have.length(0);
        done();
      });
    });
  });

  describe('getTopic', function () {
    it('should empty', function (done) {
      Topic.getTopic(null, function (err, topic) {
        should.not.exist(err);
        should.not.exist(topic);
        done();
      });
    });

    it('should ok', function (done) {
      Topic.getTopic(topic._id, function (err, topic) {
        should.not.exist(err);
        topic.author_id.should.eql(user._id);
        done();
      });
    });
  });

  describe('reduceCount', function () {
    it('should empty', function (done) {
      Topic.reduceCount(null, function (err, topic) {
        should.exist(err);
        err.should.have.property('message', '该主题不存在');
        should.not.exist(topic);
        done();
      });
    });

    it('should ok', function (done) {
      var count = topic.reply_count;
      Topic.reduceCount(topic._id, function (err, topic) {
        should.not.exist(err);
        topic.reply_count.should.equal(count - 1);
        done();
      });
    });
  });
});
