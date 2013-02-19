/*!
 * nodeclub - user controller test
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var should = require('should');
var app = require('../../app');

describe('controllers/user.js', function () {
  before(function (done) {
    app.listen(0, done);
  });
  after(function () {
    app.close();
  });

  it('/user/testuser1 should 200', function (done) {
    app.request().get('/user/testuser1').end(function (res) {
      res.should.status(200);
      done();
    });
  });

  it('/stars should 200', function (done) {
    app.request().get('/stars').end(function (res) {
      res.should.status(200);
      done();
    });
  });

  it('/users/top100 should 200', function (done) {
    app.request().get('/users/top100').end(function (res) {
      res.should.status(200);
      done();
    });
  });

  it('/setting should 302 when not login', function (done) {
    app.request().get('/setting').end(function (res) {
      res.should.status(302);
      done();
    });
  });
});
