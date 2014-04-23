/*!
 * nodeclub - site controller test
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var should = require('should');
var config = require('../../config').config;
var app = require('../../app');


describe('controllers/site.js', function () {
  before(function (done) {
    app.listen(0, done);
  });
  after(function () {
    app.close();
  });

  it('should /index 200', function (done) {
    app.request().get('/').end(function (res) {
      res.should.status(200);
      done();
    });
  });

});