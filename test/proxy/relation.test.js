var relation = require('../../proxy/relation');
var support = require('../support/support');
var should = require('should');

describe('proxy/relation.js', function () {
  var star, fan;
  before(function (done) {
    support.createUser(function (err, user1) {
      should.not.exist(err);
      support.createUser(function (err, user2) {
        should.not.exist(err);
        relation.newAndSave(user1._id, user2._id, function (err) {
          star = user1;
          fan = user2;
          done(err);
        });
      });
    });
  });

  describe('getRelation', function () {
    it('should ok', function (done) {
      relation.getRelation(star._id, fan._id, function (err, rel) {
        should.not.exist(err);
        rel.follow_id.toString().should.be.equal(fan._id.toString());
        rel.user_id.toString().should.be.equal(star._id.toString());
        done();
      });
    });
  });

  describe('getRelationsByUserId', function () {
    it('should ok', function (done) {
      relation.getRelationsByUserId(fan._id, function (err, list) {
        should.not.exist(err);
        list.should.have.length(1);
        var rel = list[0];
        rel.follow_id.toString().should.be.equal(fan._id.toString());
        rel.user_id.toString().should.be.equal(star._id.toString());
        done();
      });
    });
  });

  describe('getFollowings', function () {
    it('should ok', function (done) {
      relation.getFollowings(star._id, function (err, list) {
        should.not.exist(err);
        list.should.have.length(1);
        var rel = list[0];
        rel.follow_id.toString().should.be.equal(fan._id.toString());
        rel.user_id.toString().should.be.equal(star._id.toString());
        done();
      });
    });
  });

  describe('remove', function () {
    it('should ok', function (done) {
      relation.remove(star._id, fan._id, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);
        done();
      });
    });
  });
});
