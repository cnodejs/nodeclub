
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
    })
  })

  it('should response with loginname', function (done) {
    request.post('/api/v1/accesstoken')
      .send({
        accesstoken: mockUser.accessToken
      })
      .end(function (err, res) {
        should.not.exists(err);
        res.status.should.equal(200);
        res.body.loginname.should.equal(mockUser.loginname);
        done();
      })
  })

  it('should 403 when accessToken is wrong', function (done) {
    request.post('/api/v1/accesstoken')
      .send({
        accesstoken: 'not_exists'
      })
      .end(function (err, res) {
        should.not.exists(err);
        res.status.should.equal(403);
        res.body.error_msg.should.containEql('wrong accessToken');
        done();
      })
  })
})
