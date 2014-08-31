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
var request = require('supertest')(app);


describe('test/controllers/site.test.js', function () {

  it('should / 200', function (done) {
    request.get('/').end(function (err, res) {
      res.status.should.equal(200);
      res.text.should.containEql('当前话题');
      done(err);
    });
  });

  it('should /?page=-1 200', function (done) {
    request.get('/?page=-1').end(function (err, res) {
      res.status.should.equal(200);
      res.text.should.containEql('当前话题');
      done(err);
    });
  });

});