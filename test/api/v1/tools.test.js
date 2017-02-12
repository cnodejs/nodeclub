var app = require('../../../app');
var request = require('supertest')(app);
var support = require('../../support/support');
var should = require('should');

describe('test/api/v1/tools.test.js', function () {

  var mockUser;

  before(function (done) {
    support.createUser(function (err, user) {
      mockUser = user;
      done();
    });
  });

  it('should response with loginname', function (done) {
    request.post('/api/v1/accesstoken')
      .send({
        accesstoken: mockUser.accessToken
      })
      .end(function (err, res) {
        should.not.exists(err);
        res.status.should.equal(200);
        res.body.success.should.true();
        res.body.loginname.should.equal(mockUser.loginname);
        res.body.id.should.equal(mockUser.id);
        done();
      });
  });

  it('should 401 when accessToken is wrong', function (done) {
    request.post('/api/v1/accesstoken')
      .send({
        accesstoken: 'not_exists'
      })
      .end(function (err, res) {
        should.not.exists(err);
        res.status.should.equal(401);
        res.body.success.should.false();
        done();
      });
  });

});
