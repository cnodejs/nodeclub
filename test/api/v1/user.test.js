var app = require('../../../app');
var request = require('supertest')(app);
var support = require('../../support/support');
var should = require('should');

describe('test/api/v1/user.test.js', function () {

  var mockUser;

  before(function (done) {
    support.createUser(function (err, user) {
      mockUser = user;
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
