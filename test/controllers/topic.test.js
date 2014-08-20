/*!
 * nodeclub - test/controllers/topic.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var request = require('supertest');
var app = require('../../app');

describe('controllers/topic.js', function () {

  describe('/topic', function () {
    it('should ok', function (done) {
      request(app)
        .get('/topic/inexist')
        .expect(200)
        .expect(/此话题不存在或已被删除/, done);
    });
  });

  describe('/user/$name/replies', function () {
    it('should GET /user/lzghades/replies?page=1 %27%27%29%29%28%27%27%29%27%28 status 200', function (done) {
      request(app)
        .get('/user/lzghades/replies?page=1 %27%27%29%29%28%27%27%29%27%28 ')
        .expect(200, function (err, res) {
          res.text.should.match(/这个用户不存在/);
          done(err);
        });
    });
  });
});
