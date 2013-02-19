/*!
 * nodeclub - rss controller test
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var should = require('should');
var app = require('../../app');
var config = require('../../config').config;

describe('controllers/rss.js', function () {
  before(function (done) {
    app.listen(0, done);
  });
  after(function () {
    app.close();
  });

  describe('/rss', function () {
    it('should return `application/xml` Content-Type', function (done) {
      app.request().get('/rss').end(function (res) {
        res.should.status(200);
        res.should.header('content-type', 'application/xml');
        var body = res.body.toString();
        body.indexOf('<?xml version="1.0" encoding="utf-8"?>').should.equal(0);
        body.should.include('<rss version="2.0">');
        body.should.include('<channel><title>' + config.rss.title + '</title>');
        done();
      });
    });

    describe('mock `config.rss` not set', function () {
      var rss = config.rss;
      before(function () {
        config.rss = null;
      });
      after(function () {
        config.rss = rss;
      });

      it('should return waring message', function (done) {
        app.request().get('/rss').end(function (res) {
          res.should.status(404);
          res.body.toString().should.equal('Please set `rss` in config.js');
          done();
        });
      });
    });

    describe('mock `topic.getTopicsByQuery()` error', function () {
      var topic = require('../../controllers/topic');
      var getTopicsByQuery = topic.getTopicsByQuery;
      before(function () {
        topic.getTopicsByQuery = function () {
          var callback = arguments[arguments.length - 1];
          process.nextTick(function () {
            callback(new Error('mock getTopicsByQuery() error'));
          });
        };
      });
      after(function () {
        topic.getTopicsByQuery = getTopicsByQuery;
      });

      it('should return error', function (done) {
        app.request().get('/rss').end(function (res) {
          res.should.status(500);
          res.body.toString().should.include('mock getTopicsByQuery() error');
          done();
        });
      });
    });
  });
});
