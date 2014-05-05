/*!
 * nodeclub - user controller test
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var request = require('supertest');
var should = require('should');
var app = require('../../app');

describe('controllers/user.js', function() {
  var server;

  before(function(done) {
    server = app.listen(0, done);
  });
  after(function() {
    server.close();
  });

  it('/user/testuser1 should 200', function(done) {
    request(app).get('/user/testuser1').end(function(err, res) {
      res.should.status(200);
      done();
    });
  });

  it('/stars should 200', function(done) {
    request(app).get('/stars').end(function(err, res) {
      res.should.status(200);
      done();
    });
  });

  it('/users/top100 should 200', function(done) {
    request(app).get('/users/top100').end(function(err, res) {
      res.should.status(200);
      done();
    });
  });

  it('/setting should 302 when not login', function(done) {
    request(app).get('/setting').end(function(err, res) {
      res.should.status(302);
      done();
    });
  });
});
