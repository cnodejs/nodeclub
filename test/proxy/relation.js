var relation = require('../../proxy/relation');
var support = require('../support/support');
var should = require('should');

describe('proxy/relation.js', function () {
  var user, following, blocking;
  before(function (done) {
    support.createUser(function (err, user1) {
      should.not.exist(err);
      user = user1;

      support.createUser(function (err, user2) {
        should.not.exist(err);
        relation.newAndSaveFollowRelation(user._id, user2._id, function (err) {
          should.not.exist(err);
          following = user2;

          support.createUser(function (err, user3) {
            should.not.exist(err);
            relation.newAndSaveBlockRelation(user._id, user3._id, function (err) {
              blocking = user3;
              done(err);
            });
          });
        });
      });
    });
  });

  describe('getRelation', function() {
    it('should ok when get follow relation', function(done) {
      relation.getRelation(user._id, following._id, function (err, rel) {
        should.not.exist(err);
        should(rel.block_id).be.undefined;
        rel.follow_id.toString().should.be.equal(following._id.toString());
        rel.user_id.toString().should.be.equal(user._id.toString());
        done();
      });
    });
    it('should ok when get block relation', function(done) {
      relation.getRelation(user._id, blocking._id, function (err, rel) {
        should.not.exist(err);
        should(rel.follow_id).be.undefined;
        rel.block_id.toString().should.be.equal(blocking._id.toString());
        rel.user_id.toString().should.be.equal(user._id.toString());
        done();
      });
    });
  });

  describe('getFollowRelation', function () {
    it('should ok', function (done) {
      relation.getFollowRelation(user._id, following._id, function (err, rel) {
        should.not.exist(err);
        rel.follow_id.toString().should.be.equal(following._id.toString());
        rel.user_id.toString().should.be.equal(user._id.toString());
        done();
      });
    });
  });

  describe('getFollowers', function () {
    it('should ok', function (done) {
      relation.getFollowers(following._id, function (err, list) {
        should.not.exist(err);
        list.should.have.length(1);
        var rel = list[0];
        rel.follow_id.toString().should.be.equal(following._id.toString());
        rel.user_id.toString().should.be.equal(user._id.toString());
        done();
      });
    });
  });

  describe('getFollowings', function () {
    it('should ok', function (done) {
      relation.getFollowings(user._id, function (err, list) {
        should.not.exist(err);
        list.should.have.length(1);
        var rel = list[0];
        rel.follow_id.toString().should.be.equal(following._id.toString());
        rel.user_id.toString().should.be.equal(user._id.toString());
        done();
      });
    });
  });

  describe('getBlockRelation', function () {
    it('should ok', function (done) {
      relation.getBlockRelation(user._id, blocking._id, function (err, rel) {
        should.not.exist(err);
        rel.block_id.toString().should.be.equal(blocking._id.toString());
        rel.user_id.toString().should.be.equal(user._id.toString());
        done();
      });
    });
  });

  describe('getBlockings', function () {
    it('should ok', function (done) {
      relation.getBlockings(user._id, function (err, list) {
        should.not.exist(err);
        list.should.have.length(1);
        var rel = list[0];
        rel.block_id.toString().should.be.equal(blocking._id.toString());
        rel.user_id.toString().should.be.equal(user._id.toString());
        done();
      });
    });
  });

  describe('remove', function () {
    it('should ok', function (done) {
      relation.remove(user._id, following._id, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);
        done();
      });
    });
  });
});
