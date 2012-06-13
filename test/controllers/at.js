/*!
 * nodeclub - mention controller test
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var rewire = require("rewire");
var should = require('should');
var Message = require('../../controllers/message');
var config = require('../../config').config;
var createUsers = require('../support/create_test_users').createUsers;

describe('controllers/at.js', function () {

  before(function (done) {
    createUsers(done);
  });

  var text = '@testuser1 哈哈, hellowprd testuser1 testuser2 \
    testuser3 @testuser2你好 \
    @testuser1@testuser3\
    @testuser2@testuser123 oh my god';
  var linkedText = '@<a href="/user/testuser1">testuser1</a> 哈哈, hellowprd testuser1 testuser2 \
    testuser3 @<a href="/user/testuser2">testuser2</a>你好 \
    @<a href="/user/testuser1">testuser1</a>@<a href="/user/testuser3">testuser3</a>\
    @<a href="/user/testuser2">testuser2</a>@<a href="/user/testuser1">testuser1</a>23 oh my god';

  describe('searchUsers()', function () {
    var mentionUser = rewire('../../controllers/at');
    var searchUsers = mentionUser.__get__('searchUsers');
    it('should found 3 test users', function (done) {
      searchUsers(text, function (err, users) {
        should.not.exist(err);
        should.exist(users);
        users.should.length(3);
        for (var i = 0; i < users.length; i++) {
          var user = users[i];
          user.name.should.match(/^testuser\d$/);
        }
        done();
      });
    });

    it('should found 0 user in text', function (done) {
      searchUsers('no users match in text @ @@@@ @ @@@ @哈哈 @ testuser1', function (err, users) {
        should.not.exist(err);
        should.exist(users);
        users.should.length(0);
        done();
      });
    });

    it('should found 0 user in db', function (done) {
      searchUsers('@testuser123 @suqian2012 @ testuser1 no users match in db @ @@@@ @ @@@', 
      function (err, users) {
        should.not.exist(err);
        should.exist(users);
        users.should.length(0);
        done();
      });
    });
  });

  describe('linkUsers()', function () {
    var mentionUser = rewire('../../controllers/at');
    it('should link all mention users', function (done) {
      mentionUser.linkUsers(text, function (err, text2) {
        should.not.exist(err);
        text2.should.equal(linkedText);
        done();
      });
    });

    describe('mock searchUsers() error', function () {
      before(function () {
        mentionUser.__set__({
          searchUsers: function () {
            var callback = arguments[arguments.length - 1];
            process.nextTick(function () {
              callback(new Error('mock searchUsers() error'));
            });
          }
        });
      });

      it('should return error', function (done) {
        mentionUser.linkUsers(text, function (err, text2) {
          should.exist(err);
          err.message.should.equal('mock searchUsers() error');
          should.not.exist(text2);
          done();
        });
      });
    });
  });

  describe('sendMessageToMentionUsers()', function () {
    var mentionUser = rewire('../../controllers/at');
    it('should send message to all mention users', function (done) {
      mentionUser.sendMessageToMentionUsers(text, '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003', 
      function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should not send message to no mention users', function (done) {
      mentionUser.sendMessageToMentionUsers('abc no mentions', '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003', 
      function (err) {
        should.not.exist(err);
        done();
      });
    });

    describe('mock Message.send_at_message() error', function () {
      var send_at_message = Message.send_at_message;
      before(function () {
        Message.send_at_message = function () {
          var callback = arguments[arguments.length - 1];
          process.nextTick(function () {
            callback(new Error('mock send_at_message() error'));
          });
        };
      });
      after(function () {
        Message.send_at_message = send_at_message;
      });
      it('should return error', function (done) {
        mentionUser.sendMessageToMentionUsers(text, '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003', 
        function (err) {
          should.exist(err);
          err.message.should.equal('mock send_at_message() error');
          done();
        });
      });
    });

  });
});