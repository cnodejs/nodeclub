
var should = require('should');
var app = require('../../app');
var request = require('supertest')(app);
var support = require('../support/support');
var mm = require('mm');
var store = require('../../common/store');
var pedding = require('pedding');

describe('test/controllers/topic.test.js', function () {

  before(function (done) {
    support.ready(done);
  });

  afterEach(function () {
    mm.restore();
  });

  describe('#index', function () {
    it('should get /topic/:tid 200', function (done) {
      request.get('/topic/' + support.testTopic._id)
      .expect(200, function (err, res) {
        res.text.should.containEql('test topic content');
        res.text.should.containEql('alsotang');
        done(err);
      });
    });

    it('should get /topic/:tid 200 when login in', function (done) {
      request.get('/topic/' + support.testTopic._id)
      .set('Cookie', support.normalUser2Cookie)
      .expect(200, function (err, res) {
        res.text.should.containEql('test topic content');
        res.text.should.containEql('alsotang');
        done(err);
      });
    });
  });

  describe('#create', function () {
    it('should show a create page', function (done) {
      request.get('/topic/create')
        .set('Cookie', support.normalUserCookie)
        .expect(200, function (err, res) {
          res.text.should.containEql('发布话题');
          done(err);
        });
    });
  });

  describe('#put', function () {
    it('should not create a topic when no title', function (done) {
      request.post('/topic/create')
      .send({
        title: '',
        tab: 'share',
        t_content: '木耳敲回车',
      })
      .set('Cookie', support.normalUserCookie)
      .expect(422, function (err, res) {
        res.text.should.containEql('标题不能是空的。');
        done(err);
      });
    });

    it('should not create a topic when no tab', function (done) {
      request.post('/topic/create')
      .send({
        title: '呵呵复呵呵',
        tab: '',
        t_content: '木耳敲回车',
      })
      .set('Cookie', support.normalUserCookie)
      .expect(422, function (err, res) {
        res.text.should.containEql('必须选择一个版块。');
        done(err);
      });
    });

    it('should not create a topic when no content', function (done) {
      request.post('/topic/create')
      .send({
        title: '呵呵复呵呵',
        tab: 'share',
        t_content: '',
      })
      .set('Cookie', support.normalUserCookie)
      .expect(422, function (err, res) {
        res.text.should.containEql('内容不可为空');
        done(err);
      });
    });

    it('should create a topic', function (done) {
      request.post('/topic/create')
      .send({
        title: '呵呵复呵呵' + new Date(),
        tab: 'share',
        t_content: '木耳敲回车',
      })
      .set('Cookie', support.normalUserCookie)
      .expect(302, function (err, res) {
        res.headers.location.should.match(/^\/topic\/\w+$/);
        done(err);
      });
    });
  });

  describe('#showEdit', function () {
    it('should show a edit page', function (done) {
      request.get('/topic/' + support.testTopic._id + '/edit')
      .set('Cookie', support.normalUserCookie)
      .expect(200, function (err, res) {
        res.text.should.containEql('编辑话题');
        done(err);
      });
    });
  });

  describe('#update', function () {
    it('should update a topic', function (done) {
      request.post('/topic/' + support.testTopic._id + '/edit')
      .send({
        title: '修改后的呵呵复呵呵',
        tab: 'share',
        t_content: '修改后的木耳敲回车',
      })
      .set('Cookie', support.normalUserCookie)
      .expect(302, function (err, res) {
        res.headers.location.should.match(/^\/topic\/\w+$/);
        done(err);
      });
    });
  });

  describe('#delete', function () {
    var wouldBeDeleteTopic;
    before(function (done) {
      support.createTopic(support.normalUser._id, function (err, topic) {
        wouldBeDeleteTopic = topic;
        done(err);
      });
    });

    it('should not delete a topic when not author', function (done) {
      request.post('/topic/' + wouldBeDeleteTopic._id + '/delete')
      .set('Cookie', support.normalUser2Cookie)
      .expect(403, function (err, res) {
        res.body.should.eql({success: false, message: '无权限'});
        done(err);
      });
    });

    it('should delele a topic', function (done) {
      request.post('/topic/' + wouldBeDeleteTopic._id + '/delete')
      .set('Cookie', support.normalUserCookie)
      .expect(200, function (err, res) {
        res.body.should.eql({ success: true, message: '话题已被删除。' });
        done(err);
      });
    });
  });

  describe('#top', function () {
    it('should top a topic', function (done) {
      request.post('/topic/' + support.testTopic._id + '/top/1')
      .set('Cookie', support.adminUserCookie)
      .expect(200, function (err, res) {
        res.text.should.containEql('此话题已经被置顶。');
        done(err);
      });
    });

    it('should untop a topic', function (done) {
      request.post('/topic/' + support.testTopic._id + '/top/0')
      .set('Cookie', support.adminUserCookie)
      .expect(200, function (err, res) {
        res.text.should.containEql('此话题已经被取消置顶。');
        done(err);
      });
    });
  });

  describe('#good', function () {
    it('should good a topic', function (done) {
      request.post('/topic/' + support.testTopic._id + '/good/1')
      .set('Cookie', support.adminUserCookie)
      .expect(200, function (err, res) {
        res.text.should.containEql('此话题已加精。');
        done(err);
      });
    });

    it('should ungood a topic', function (done) {
      request.post('/topic/' + support.testTopic._id + '/good/0')
      .set('Cookie', support.adminUserCookie)
      .expect(200, function (err, res) {
        res.text.should.containEql('此话题已经取消加精。');
        done(err);
      });
    });
  });

  describe('#collect', function () {
    it('should collect a topic', function (done) {
      request.post('/topic/collect')
      .send({
        topic_id: support.testTopic._id,
      })
      .set('Cookie', support.normalUser2Cookie)
      .expect(200, function (err, res) {
        res.body.should.eql({status: 'success'});
        done(err);
      })
    })
  })

  describe('#de_collect', function () {
    it('should decollect a topic', function (done) {
      request.post('/topic/de_collect')
      .send({
        topic_id: support.testTopic._id,
      })
      .set('Cookie', support.normalUser2Cookie)
      .expect(200, function (err, res) {
        res.body.should.eql({status: 'success'});
        done(err);
      });
    });
  });

  describe('#upload', function () {
    it('should upload a file', function (done) {

      mm(store, 'upload', function (file, options, callback) {
        callback(null, {
          url: 'upload_success_url'
        });
      });
      request.post('/upload')
      .attach('selffile', __filename)
      .set('Cookie', support.normalUser2Cookie)
      .end(function (err, res) {
        res.body.should.eql({"success": true, "url": "upload_success_url"});
        done(err);
      });
    });
  });

});
