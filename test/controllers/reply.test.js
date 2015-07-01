var app = require('../../app');
var request = require('supertest')(app);
var support = require('../support/support');
var ReplyProxy = require('../../proxy/reply');

describe('test/controllers/reply.test.js', function () {
  before(function (done) {
    support.ready(done);
  });

  var reply1Id;

  describe('reply1', function () {
    it('should add a reply1', function (done) {
      var topic = support.testTopic;
      request.post('/' + topic._id + '/reply')
      .set('Cookie', support.normalUserCookie)
      .send({
        r_content: 'test reply 1'
      })
      .expect(302)
      .end(function (err, res) {
        res.headers['location'].should.match(new RegExp('/topic/' + topic.id + '#\\w+'));

        // 记录下这个 reply1 的 id
        reply1Id = res.headers['location'].match(/#(\w+)/)[1];

        done(err);
      });
    });

    it('should 422 when add a empty reply1', function (done) {
      var topic = support.testTopic;
      request.post('/' + topic._id + '/reply')
      .set('Cookie', support.normalUserCookie)
      .send({
        r_content: ''
      })
      .expect(422)
      .end(done);
    });

    it('should not add a reply1 when not login', function (done) {
      request.post('/' + support.testTopic._id + '/reply')
      .send({
        r_content: 'test reply 1'
      })
      .expect(403)
      .end(done);
    });
  });

  describe('edit reply', function () {
    it('should not show edit page when not author', function (done) {
      request.get('/reply/' + reply1Id + '/edit')
      .set('Cookie', support.normalUser2Cookie)
      .expect(403)
      .end(done);
    });

    it('should show edit page when is author', function (done) {
      request.get('/reply/' + reply1Id + '/edit')
      .set('Cookie', support.normalUserCookie)
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('test reply 1');
        done(err);
      });
    });

    it('should update edit', function (done) {
      var topic = support.testTopic;
      request.post('/reply/' + reply1Id + '/edit')
      .send({
        t_content: 'been update',
      })
      .set('Cookie', support.normalUserCookie)
      .end(function (err, res) {
        res.status.should.equal(302);
        res.headers['location'].should.match(new RegExp('/topic/' + topic.id + '#\\w+'));
        done(err);
      });
    });
  });

  describe('upvote reply', function () {
    var reply1, reply1UpCount;
    before(function (done) {
      ReplyProxy.getReply(reply1Id, function (err, reply) {
        reply1 = reply;
        reply1UpCount = reply1.ups.length;
        done(err);
      });
    });

    it('should increase', function (done) {
      request.post('/reply/' + reply1Id + '/up')
      .send({replyId: reply1Id})
      .set('Cookie', support.normalUser2Cookie)
      .end(function (err, res) {
        res.status.should.equal(200);
        res.body.should.eql({
          success: true,
          action: 'up',
        });
        done(err);
      });
    });

    it('should decrease', function (done) {
      request.post('/reply/' + reply1Id + '/up')
      .send({replyId: reply1Id})
      .set('Cookie', support.normalUser2Cookie)
      .end(function (err, res) {
        res.status.should.equal(200);
        res.body.should.eql({
          success: true,
          action: 'down',
        });
        done(err);
      });
    });

  });

  describe('delete reply', function () {
    it('should should not delete when not author', function (done) {
      request.post('/reply/' + reply1Id + '/delete')
      .send({
        reply_id: reply1Id
      })
      .expect(403)
      .end(done);
    });

    it('should delete reply when author', function (done) {
      request.post('/reply/' + reply1Id + '/delete')
      .send({
        reply_id: reply1Id
      })
      .set('Cookie', support.normalUserCookie)
      .expect(200)
      .end(function (err, res) {
        res.body.should.eql({status: 'success'});
        done(err);
      });
    });
  });
});

