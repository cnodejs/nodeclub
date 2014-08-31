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
var at = require('../../services/at');
var message = require('../../services/message');
var createUsers = require('../support/create_test_users').createUsers;

describe('services/at.js', function () {

  before(function (done) {
    createUsers(done);
  });

  var text = '@testuser1 哈哈, hellowprd testuser1 testuser2 \
    testuser3 @testuser2你好 \
    @testuser1@testuser3\
    @testuser2@testuser123 oh my god';
  var linkedText = '[@testuser1](/user/testuser1) 哈哈, hellowprd testuser1 testuser2 \
    testuser3 [@testuser2](/user/testuser2)你好 \
    [@testuser1](/user/testuser1)[@testuser3](/user/testuser3)\
    [@testuser2](/user/testuser2)[@testuser1](/user/testuser1)23 oh my god';

  describe('fetchUsers()', function () {
    var mentionUser = rewire('../../services/at');
    var fetchUsers = mentionUser.__get__('fetchUsers');
    it('should found 6 users', function () {
      var users = fetchUsers(text);
      should.exist(users);
      users.should.length(6);
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        user.should.match(/^testuser\d*$/);
      }
    });

    it('should found 0 user in text', function () {
      var users = fetchUsers('no users match in text @ @@@@ @ @@@ @哈哈 @ testuser1');
      should.exist(users);
      users.should.length(0);
    });
  });

  describe('linkUsers()', function () {
    it('should link all mention users', function (done) {
      at.linkUsers(text, function (err, text2) {
        should.not.exist(err);
        text2.should.equal(linkedText);
        done();
      });
    });

    // TODO: mock User.getUsersByNames
    // describe('mock searchUsers() error', function () {
    //   before(function () {
    //     mentionUser.__set__({
    //       searchUsers: function () {
    //         var callback = arguments[arguments.length - 1];
    //         process.nextTick(function () {
    //           callback(new Error('mock searchUsers() error'));
    //         });
    //       }
    //     });
    //   });

    //   it('should return error', function (done) {
    //     mentionUser.linkUsers(text, function (err, text2) {
    //       should.exist(err);
    //       err.message.should.equal('mock searchUsers() error');
    //       should.not.exist(text2);
    //       done();
    //     });
    //   });
    // });
  });

  describe('sendMessageToMentionUsers()', function () {
    it('should send message to all mention users', function (done) {
      at.sendMessageToMentionUsers(text, '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003',
        function (err) {
          should.not.exist(err);
          done();
        });
    });

    it('should not send message to no mention users', function (done) {
      at.sendMessageToMentionUsers('abc no mentions', '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003',
        function (err) {
          should.not.exist(err);
          done();
        });
    });

    describe('mock message.sendAtMessage() error', function () {
      var sendAtMessage = message.sendAtMessage;
      before(function () {
        message.sendAtMessage = function () {
          var callback = arguments[arguments.length - 1];
          process.nextTick(function () {
            callback(new Error('mock sendAtMessage() error'));
          });
        };
      });
      after(function () {
        message.sendAtMessage = sendAtMessage;
      });
      it('should return error', function (done) {
        at.sendMessageToMentionUsers(text, '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003',
          function (err) {
            should.exist(err);
            err.message.should.equal('mock sendAtMessage() error');
            done();
          });
      });
    });

  });
});
