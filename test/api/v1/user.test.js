var app = require('../../../app');
var request = require('supertest')(app);
var support = require('../../support/support');
var should = require('should');
var async = require('async');

describe('test/api/v1/user.test.js', function () {

  var mockUser;

  before(function (done) {
    async.auto({
      create_user: function(callback){
        support.createUser(function (err, user) {
          mockUser = user;
          callback(null, user);
        });
      },
      create_topic: ['create_user', function(callback, result){
        support.createTopic(result['create_user']._id, function(err, topic){
          callback(null, topic);
        });
      }],
      create_replies: ['create_topic', function(callback, result){
        support.createReply(result['create_topic']._id, result['create_topic'].author_id, function(err, replay){
          callback(null, replay);
        });
      }]
    }, function(err, results){
      done();
    });
  });
  
  describe('get /api/v1/user/:loginname', function () {

    it('should return user info', function (done) {
      request.get('/api/v1/user/' + mockUser.loginname)
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true();
          res.body.data.loginname.should.equal(mockUser.loginname);
          should(res.body.data.recent_topics.length).be.exactly(1);
          should(res.body.data.recent_replies.length).be.exactly(1); 
          done();
        });
    });

    it('should fail when user is not found', function (done) {
      request.get('/api/v1/user/' + mockUser.loginname + 'not_found')
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(404);
          res.body.success.should.false();
          done();
        });
    });

  });
  
});
