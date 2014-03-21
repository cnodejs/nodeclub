var TagCollect = require('../../proxy/tag_collect');
var support = require('../support/support');
var should = require('should');
var pedding = require('pedding');

describe('proxy/tag.js', function () {
  var user;
  var tag;
  before(function (done) {
    done = pedding(2, done);
    support.createUser(function (err, _user) {
      should.not.exist(err);
      should.exist(_user);
      user = _user;
      done();
    });
    support.createTag(function (err, _tag) {
      should.not.exist(err);
      should.exist(_tag);
      tag = _tag;
      done();
    });
  });

  describe('newAndSave', function () {
    it('should ok', function (done) {
      TagCollect.newAndSave(user._id, tag._id, function (err, collect) {
        should.not.exist(err);
        collect.should.have.property('user_id', user._id);
        collect.should.have.property('tag_id', tag._id);
        done();
      });
    });
  });

  describe('getTagCollect', function () {
    it('should ok', function (done) {
      TagCollect.getTagCollect(user._id, tag._id, function (err, collect) {
        should.not.exist(err);
        collect.user_id.should.be.eql(user._id);
        collect.tag_id.should.be.eql(tag._id);
        done();
      });
    });
  });

  describe('getTagCollectsByUserId', function () {
    it('should ok', function (done) {
      TagCollect.getTagCollectsByUserId(user._id, function (err, list) {
        should.not.exist(err);
        list.should.have.length(1);
        var collect = list[0];
        collect.user_id.should.be.eql(user._id);
        collect.tag_id.should.be.eql(tag._id);
        done();
      });
    });
  });

  describe('remove', function () {
    it('should ok', function (done) {
      TagCollect.remove(user._id, tag._id, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);
        done();
      });
    });
  });

  describe('removeAllByTagId', function () {
    var user;
    var user2;
    var tag;
    before(function (done) {
      var next = pedding(3, function () {
        var next = pedding(2, done);
        TagCollect.newAndSave(user._id, tag._id, function (err, collect) {
          should.not.exist(err);
          next();
        });
        TagCollect.newAndSave(user2._id, tag._id, function (err, collect) {
          should.not.exist(err);
          next();
        });
      });
      support.createUser(function (err, _user) {
        should.not.exist(err);
        should.exist(_user);
        user = _user;
        next();
      });
      support.createUser(function (err, _user) {
        should.not.exist(err);
        should.exist(_user);
        user2 = _user;
        next();
      });
      support.createTag(function (err, _tag2) {
        should.not.exist(err);
        should.exist(_tag2);
        tag = _tag2;
        next();
      });
    });

    it('should ok', function (done) {
      TagCollect.removeAllByTagId(tag._id, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);
        done();
      });
    });
  });
});
