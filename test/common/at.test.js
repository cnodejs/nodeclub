
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
  var testTopic, normalUser, normalUser2, adminUser;
  before(function (done) {
    support.ready(function () {
      testTopic = support.testTopic;
      normalUser = support.normalUser;
      normalUser2 = support.normalUser2;
      adminUser = support.adminUser;
      done();
    });
  });

  afterEach(function () {
    mm.restore();
  });

  var text = multiline.stripIndent(function(){/*
    @A-aZ-z0-9_
    @中文
      @begin_with_spaces @multi_in_oneline
    Text More Text @around_text ![Pic](/public/images/cnode_icon_32.png)
    @end_with_no_space中文
    Text 中文@begin_with_no_spaces
    @end_with_no_space2@begin_with_no_spaces2

    jysperm@gmail.com @alsotang

    @alsotang2


    ```
    呵呵 ```
    @alsotang3
    ```

    ```js
       @flow
    ```

    ```@alsotang4```

    @
    @@

    `@code_begin_with_no_space`
    code: `@in_code`

        @in_pre

    ```
    @in_oneline_pre
    ```

    ```
      Some Code
      Code @in_multi_line_pre
    ```

    [@be_link](/user/be_link) [@be_link2](/user/be_link2)

    @alsotang @alsotang
    aldjf
    @alsotang @tangzhanli

    [@alsotang](/user/alsotang)

    @liveinjs 没事儿，能力和热情更重要，北京雍和宫，想的就邮件给我i5ting@126.com
  */});

  var matched_users = ['A-aZ-z0-9_', 'begin_with_spaces',
    'multi_in_oneline', 'around_text', 'end_with_no_space',
    'begin_with_no_spaces', 'end_with_no_space2',
    'begin_with_no_spaces2', 'alsotang', 'alsotang2',
    'tangzhanli', 'liveinjs'];

  var linkedText = multiline.stripIndent(function(){/*
[@A-aZ-z0-9_](/user/A-aZ-z0-9_)
@中文
  [@begin_with_spaces](/user/begin_with_spaces) [@multi_in_oneline](/user/multi_in_oneline)
Text More Text [@around_text](/user/around_text) ![Pic](/public/images/cnode_icon_32.png)
[@end_with_no_space](/user/end_with_no_space)中文
Text 中文[@begin_with_no_spaces](/user/begin_with_no_spaces)
[@end_with_no_space2](/user/end_with_no_space2)[@begin_with_no_spaces2](/user/begin_with_no_spaces2)

jysperm@gmail.com [@alsotang](/user/alsotang)

[@alsotang2](/user/alsotang2)


```
呵呵 ```
@alsotang3
```

```js
   @flow
```

```@alsotang4```

@
@@

`@code_begin_with_no_space`
code: `@in_code`

    @in_pre

```
@in_oneline_pre
```

```
  Some Code
  Code @in_multi_line_pre
```

[@be_link](/user/be_link) [@be_link2](/user/be_link2)

[@alsotang](/user/alsotang) [@alsotang](/user/alsotang)
aldjf
[@alsotang](/user/alsotang) [@tangzhanli](/user/tangzhanli)

[@alsotang](/user/alsotang)

[@liveinjs](/user/liveinjs) 没事儿，能力和热情更重要，北京雍和宫，想的就邮件给我i5ting@126.com
  */});

  describe('#fetchUsers()', function () {
    var fetchUsers = at.fetchUsers;
    it('should found 6 users', function () {
      var users = fetchUsers(text);
      should.exist(users);
      users.should.eql(matched_users);
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
      var atUserIds = [String(adminUser._id), String(normalUser2._id)];

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

      var text = '@' + adminUser.loginname + ' @' + normalUser2.loginname + ' @notexitstuser 你们好';
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

    it('should not send at msg to author', function (done) {
      mm(message, 'sendAtMessage', function () {
        throw new Error('should not call me');
      });

      at.sendMessageToMentionUsers('@' + normalUser.loginname + ' hello',
        testTopic._id, normalUser._id,
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
