var should = require('should');
var app = require('../../app');
var config = require('../../config').config;
var request = require('supertest');

var agent = request.agent(app);

describe('test/controllers/sign.test.js', function () {
  // it('should visit sign in page', function (done) {
  // request.get('/signin').end(function (err, res) {
  //   res.should.status(200);
  //   res.text.should.include('登陆');
  //   res.text.should.include('密码');
  //   done(err);
  // });
  // });
});