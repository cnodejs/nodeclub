/*!
 * nodeclub - onehost plugins unit tests.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var onehost = require('../../plugins/onehost');
var express = require('express');
var should = require('should');


describe('plugins/onehost.js', function () {

  var bindHost = 'test.localhost.onehost.com';
  var app = express.createServer();
  app.use(onehost({
    host: bindHost
  }));
  app.use(function (req, res) {
    res.send(req.method + ' ' + req.url);
  });
  before(function (done) {
    app.listen(0, done);
  });
  after(function () {
    app.close();
  });

  it('should 301 redirect all `GET` to ' + bindHost, function (done) {
    app.request().get('/foo/bar').end(function (res) {
      res.should.status(301);
      res.headers.location.should.equal('http://' + bindHost + '/foo/bar');
      done();
    });
  });

  it('should 301 when GET request 127.0.0.1:port', function (done) {
      app.request({ address: '127.0.0.1', port: app.address().port }).get('/foo/bar').end(function (res) {
        res.should.status(301);
        res.headers.location.should.equal('http://' + bindHost + '/foo/bar');
        done();
      });
    });

  [ 'post', 'put', 'delete', 'head' ].forEach(function (method) {
    it('should no redirect for `' + method + '`', function (done) {
      app.request()[method]('/foo/bar').end(function (res) {
        res.should.status(200);
        res.headers.should.not.have.property('location');
        if (method === 'head') {
          res.body.should.length(0);
        } else {
          res.body.toString().should.equal(method.toUpperCase() + ' /foo/bar');
        }
        done();
      });
    });
  });

  describe('exclude options', function () {
    var app2 = express.createServer();
    app2.use(onehost({
      host: bindHost,
      exclude: '127.0.0.1:58964'
    }));
    app2.use(function (req, res) {
      res.send(req.method + ' ' + req.url);
    });
    before(function (done) {
      app2.listen(58964, done);
    });
    after(function () {
      app2.close();
    });

    it('should 301 redirect all `GET` to ' + bindHost, function (done) {
      app.request().get('/foo/bar').end(function (res) {
        res.should.status(301);
        res.headers.location.should.equal('http://' + bindHost + '/foo/bar');
        done();
      });
    });

    it('should 200 when request GET exclude host', function (done) {
      app2.request({ address: '127.0.0.1', port: 58964 }).get('/foo/bar').end(function (res) {
        res.should.status(200);
        res.body.toString().should.equal('GET /foo/bar');
        done();
      });
    });
  });
});
