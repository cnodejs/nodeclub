
var should = require('should');
var mm = require('mm');
var support = require('../support/support');
var eventproxy = require('eventproxy');
var _ = require('lodash');

var at = require('../../common/at');
var message = require('../../common/message');
var multiline = require('multiline');
var pedding = require('pedding');

describe('test/common/at.test.js', function () {
  var testTopic, normalUser, normalUser2;
  before(function (done) {
    support.ready(function () {
      testTopic = support.testTopic;
      normalUser = support.normalUser;
      normalUser2 = support.normalUser2;
      done();
    });
  });

  afterEach(function () {
    mm.restore();
  });

  var text = '@testuser1 哈哈, hellowprd testuser1 testuser2 \
    testuser3 @testuser2你好 \
    @testuser1@testuser3\
    @testuser2@testuser123 oh my god';
  var linkedText = '[@testuser1](/user/testuser1) 哈哈, hellowprd testuser1 testuser2 \
    testuser3 [@testuser2](/user/testuser2)你好 \
    [@testuser1](/user/testuser1)[@testuser3](/user/testuser3)\
    [@testuser2](/user/testuser2)[@testuser1](/user/testuser1)23 oh my god';

  describe('#fetchUsers()', function () {
    var fetchUsers = at.fetchUsers;
    it('should found 6 users', function () {
      var users = fetchUsers(text);
      should.exist(users);
      users.should.length(6);
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        user.should.match(/^testuser\d+$/);
      }
    });

    it('should found 0 user in text', function () {
      var users = fetchUsers('no users match in text @ @@@@ @ @@@ @哈哈 @ testuser1');
      users.should.length(0);
    });
  });

  describe('#linkUsers()', function () {
    it('should link all mention users', function (done) {
      at.linkUsers(text, function (err, text2) {
        should.not.exist(err);
        text2.should.equal(linkedText);
        done();
      });
    });
  });

  describe('sendMessageToMentionUsers()', function () {
    it('should send message to all mention users', function (done) {
      done = pedding(done, 2);
      var atUserIds = [String(normalUser._id), String(normalUser2._id)];

      var ep  = new eventproxy();
      ep.after('user_id', atUserIds.length, function (user_ids) {
        user_ids.sort().should.eql(atUserIds.sort());
        done();
      });
      mm(message, 'sendAtMessage',
        function (atUserId, authorId, topicId, replyId, callback) {
          // String(atUserId).should.equal(String(atUserIds[count++]));
          ep.emit('user_id', String(atUserId));
          callback();
        });

      var text = '@' + normalUser.loginname + ' @' + normalUser2.loginname + ' @notexitstuser 你们好';
      at.sendMessageToMentionUsers(text,
        testTopic._id,
        normalUser._id,
        function (err) {
          should.not.exist(err);
          done();
        });
    });

    it('should not send message to no mention users', function (done) {
      mm(message, 'sendAtMessage', function () {
        throw new Error('should not call me');
      });
      at.sendMessageToMentionUsers('abc no mentions', testTopic._id, normalUser._id,
        function (err) {
          should.not.exist(err);
          done();
        });
    });

    describe('mock message.sendAtMessage() error', function () {
      beforeEach(function () {
        mm(message, 'sendAtMessage', function () {
          var callback = arguments[arguments.length - 1];
          process.nextTick(function () {
            callback(new Error('mock sendAtMessage() error'));
          });
        });
      });
      it('should return error', function (done) {
        var text = '@' + normalUser.loginname + ' @' + normalUser2.loginname + ' @notexitstuser 你们好';

        at.sendMessageToMentionUsers(text, testTopic._id, normalUser._id,
          function (err) {
            should.exist(err);
            err.message.should.equal('mock sendAtMessage() error');
            done();
          });
      });
    });

  });
});
