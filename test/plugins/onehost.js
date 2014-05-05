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
var request = require('supertest');


describe('plugins/onehost.js', function() {

  var bindHost = 'test.localhost.onehost.com';
  var app = express();
  var server;
  app.use(onehost({
    host: bindHost
  }));
  app.use(function(req, res) {
    res.send(req.method + ' ' + req.url);
  });
  before(function(done) {
    server = app.listen(0, done);
  });
  after(function() {
    server.close();
  });

  it('should 301 redirect all `GET` to ' + bindHost, function(done) {
    request(app).get('/foo/bar').end(function(err, res) {
      res.should.status(301);
      res.header.location.should.equal('http://' + bindHost + '/foo/bar');
      done();
    });
  });

  it('should 301 when GET request 127.0.0.1:port', function(done) {
    request(app).get('/foo/bar').end(function(err, res) {
      res.should.status(301);
      res.header.location.should.equal('http://' + bindHost + '/foo/bar');
      done();
    });
  });

  [ 'post', 'put', 'delete', 'head' ].forEach(function(method) {
    it('should no redirect for `' + method + '`', function(done) {
      request(app)[method]('/foo/bar').end(function(err, res) {
        res.should.status(200);
        res.header.should.not.have.property('location');
        if (method === 'head') {
          res.text.should.length(0);
        } else {
          res.text.should.equal(method.toUpperCase() + ' /foo/bar');
        }
        done();
      });
    });
  });

  describe('exclude options', function() {
    var server;
    var app2 = express();
    app2.use(onehost({
      host: bindHost,
      exclude: '127.0.0.1:58964'
    }));
    app2.use(function(req, res) {
      res.send(req.method + ' ' + req.url);
    });
    before(function(done) {
      server = app2.listen(58964, done);
    });
    after(function() {
      server.close();
    });

    it('should 301 redirect all `GET` to ' + bindHost, function(done) {
      request('http://' + bindHost + ':58964').get('/foo/bar').end(function(err, res) {
        res.should.status(301);
        res.header.location.should.equal('http://' + bindHost + '/foo/bar');
        done(err);
      });
    });

    it('should 200 when request GET exclude host', function(done) {
      request('http://127.0.0.1:58964').get('/foo/bar').end(function(err, res) {
        res.statusCode.should.equal(200);
        res.text.should.equal('GET /foo/bar');
        done();
      });
    });
  });
});
