/*!
 * nodeclub - rss controller test
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var request = require('supertest');
var should = require('should');
var app = require('../../app');
var config = require('../../config').config;

describe('test/controllers/rss.test.js', function() {
  var server;

  before(function(done) {
    server = app.listen(0, done);
  });
  after(function() {
    server.close();
  });

  describe('/rss', function() {
    it('should return `application/xml` Content-Type', function(done) {
      request(app).get('/rss').end(function(err, res) {
        res.should.status(200);
        res.should.header('content-type', 'application/xml');
        var body = res.text;
        body.indexOf('<?xml version="1.0" encoding="utf-8"?>').should.equal(0);
        body.should.include('<rss version="2.0">');
        body.should.include('<channel><title>' + config.rss.title + '</title>');
        done();
      });
    });

    describe('mock `config.rss` not set', function() {
      var rss = config.rss;
      before(function() {
        config.rss = null;
      });
      after(function() {
        config.rss = rss;
      });

      it('should return waring message', function(done) {
        request(app).get('/rss').end(function(err, res) {
          res.should.status(404);
          res.text.should.equal('Please set `rss` in config.js');
          done();
        });
      });
    });

    describe('mock `topic.getTopicsByQuery()` error', function() {
      var topic = require('../../proxy').Topic;
      var getTopicsByQuery = topic.getTopicsByQuery;
      before(function() {
        topic.getTopicsByQuery = function() {
          var callback = arguments[arguments.length - 1];
          process.nextTick(function() {
            callback(new Error('mock getTopicsByQuery() error'));
          });
        };
      });
      after(function() {
        topic.getTopicsByQuery = getTopicsByQuery;
      });

      it('should return error', function(done) {
        request(app).get('/rss').end(function(err, res) {
          res.should.status(500);
          res.text.should.include('mock getTopicsByQuery() error');
          done();
        });
      });
    });
  });
});
