

var app = require('../../../app');
var request = require('supertest')(app);
var support = require('../../support/support');
var should = require('should');

describe('test/api/v1/user.test.js', function () {
  it('should return user info', function (done) {
    support.createUser(function (err, user) {
      should.not.exists(err);
      request.get('/api/v1/user/' + user.loginname)
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.loginname.should.equal(user.loginname);
          done();
        });
    });
  });
});
