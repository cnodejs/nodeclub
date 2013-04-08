var Tag = require('../../proxy/tag');
var support = require('../support/support');
var should = require('should');

describe('proxy/tag.js', function () {
  describe('newAndSave', function () {
    it('should ok', function (done) {
      Tag.newAndSave('name', 'background', 1, 'description', function (err, tag) {
        should.not.exist(err);
        tag.should.have.property('name', 'name');
        tag.should.have.property('description', 'description');
        tag.should.have.property('background', 'background');
        tag.should.have.property('topic_count');
        tag.should.have.property('collect_count');
        tag.should.have.property('order');
        done();
      });
    });
  });

  describe('getTagByName', function () {
    var tag;
    before(function (done) {
      support.createTag(function (err, tag1) {
        should.not.exist(err);
        tag = tag1;
        done();
      });
    });

    it('should ok', function (done) {
      Tag.getTagByName(tag.name, function (err, tag1) {
        should.not.exist(err);
        tag1.should.have.property('name', tag.name);
        tag1.should.have.property('description', tag.description);
        tag1.should.have.property('background', tag.background);
        tag1.should.have.property('topic_count');
        tag1.should.have.property('collect_count');
        tag1.should.have.property('order');
        done();
      });
    });
  });

  describe('getTagsByIds', function () {
    var tag;
    before(function (done) {
      support.createTag(function (err, tag1) {
        should.not.exist(err);
        tag = tag1;
        done();
      });
    });

    it('should ok with empty', function (done) {
      Tag.getTagsByIds([], function (err, tags) {
        should.not.exist(err);
        tags.should.have.length(0);
        done();
      });
    });

    it('should ok', function (done) {
      Tag.getTagsByIds([tag._id], function (err, tags) {
        should.not.exist(err);
        tags.should.have.length(1);
        var tag1 = tags[0];
        tag1.should.have.property('name', tag.name);
        tag1.should.have.property('description', tag.description);
        tag1.should.have.property('background', tag.background);
        tag1.should.have.property('topic_count');
        tag1.should.have.property('collect_count');
        tag1.should.have.property('order');
        done();
      });
    });
  });

  describe('getAllTags', function () {
    it('should ok', function (done) {
      Tag.getAllTags(function (err, list) {
        should.not.exist(err);
        list.length.should.be.above(0);
        done();
      });
    });
  });

  describe('getTagById', function () {
    var tag;
    before(function (done) {
      support.createTag(function (err, tag1) {
        should.not.exist(err);
        tag = tag1;
        done();
      });
    });

    it('should ok', function (done) {
      Tag.getTagById(tag._id, function (err, tag1) {
        should.not.exist(err);
        tag1.should.have.property('name', tag.name);
        tag1.should.have.property('description', tag.description);
        tag1.should.have.property('background', tag.background);
        tag1.should.have.property('topic_count');
        tag1.should.have.property('collect_count');
        tag1.should.have.property('order');
        done();
      });
    });
  });

  describe('update', function () {
    var tag;
    before(function (done) {
      support.createTag(function (err, tag1) {
        should.not.exist(err);
        tag = tag1;
        done();
      });
    });

    it('should ok', function (done) {
      Tag.update(tag, "newname", "newbackground", 10, "newdescription", function (err, tag1) {
        should.not.exist(err);
        tag1.should.have.property('name', "newname");
        tag1.should.have.property('description', "newdescription");
        tag1.should.have.property('background', "newbackground");
        tag1.should.have.property('topic_count');
        tag1.should.have.property('collect_count');
        tag1.should.have.property('order');
        done();
      });
    });
  });
});
