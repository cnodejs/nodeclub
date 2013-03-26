var User = require('../../proxy/user');
var should = require('should');
var support = require('../support/support');

describe('proxy/user.js', function () {
  describe('getUserByLoginName', function () {
    it('should ok', function (done) {
      User.getUserByLoginName('jacksontian', function (err, user) {
        should.not.exist(err);
        // TODO: check user
        done();
      });
    });
  });

  describe('getUserByMail', function () {
    it('should ok', function (done) {
      User.getUserByMail('shyvo1987@gmail.com', function (err, user) {
        should.not.exist(err);
        // TODO: check user
        done();
      });
    });
  });

  describe('getUsersByIds', function () {
    var user;
    before(function (done) {
      support.createUser(function (err, user1) {
        should.not.exist(err);
        user = user1;
        done();
      });
    });

    it('should ok with empty list', function (done) {
      User.getUsersByIds([], function (err, list) {
        should.not.exist(err);
        list.should.have.length(0);
        done();
      });
    });

    it('should ok', function (done) {
      User.getUsersByIds([user._id], function (err, list) {
        should.not.exist(err);
        list.should.have.length(1);
        var user1 = list[0];
        user1.name.should.be.equal(user.name);
        done();
      });
    });
  });

  describe('getUserByQuery', function () {
    var user;
    before(function (done) {
      support.createUser(function (err, user1) {
        should.not.exist(err);
        user = user1;
        done();
      });
    });

    it('should not exist', function (done) {
      User.getUserByQuery('name', 'key', function (err, user) {
        should.not.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should exist', function (done) {
      User.getUserByQuery(user.name, null, function (err, user1) {
        should.not.exist(err);
        should.exist(user1);
        user1.name.should.be.equal(user.name);
        done();
      });
    });
  });
});
