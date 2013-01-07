/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Util = require('../libs/util');

var JobSchema = new Schema({
  title: String,
  owner_id: ObjectId,
  content: String,
  contact: String,
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

JobSchema.virtual('createAt').get(function () {
  return Util.format_date(this.create_at, true);
});

JobSchema.virtual('updateAt').get(function () {
  return Util.format_date(this.update_at, true);
});

/**
 * 取得建立者
 * @param {function} cb callback function
 */
JobSchema.methods.getOwner = function (cb) {
  var _self = this;
  
  if (!this.owner_id) {
    cb(null, null);
    return;
  }
  
  User.findOne({_id: _self.owner_id}, function (err, user) {
    if (err) {
      cb(err);
      return;
    }
    if (!user) {
      cb(new Error('找不到使用者'));
      return;
    }
    _self.owner = user;
    cb(null, user);
  });
};

/**
 * 取得工作資訊
 * @param {object} query Mongodb 查詢條件
 * @param {object} fields 顯示/不顯示的欄位, ex: {_id: 0, content: 0}.（可選）
 * @param {object} opts Mongodb 查詢時的可選項目, ex: {limit: 10}. （可選）
 * @param {function} cb callback function
 */
JobSchema.statics.getJobs = function () {
  var args = arguments;
  var query;
  var fields = {};
  var opts = {};
  var cb;

  switch (args.length) {
  case 2:
    query = args[0];
    cb = args[1];
    break;
  case 4:
    query = args[0];
    fields = args[1];
    opts = args[2];
    cb = args[3];
    break;
  default:
    throw new Error('參數數目不對');
  }

  this.find(query, fields, opts, function (err, jobs) {
    if (err) {
      cb(err);
      return;
    }

    var getUserFailed = false;
    var length = jobs.length - 1;
    
    if (length < 0) {
      cb(null, []);
      return;
    }

    jobs.forEach(function (job, i) {
      jobs[i].getOwner(function (err) {
        if (err) {
          getUserFailed = err;
        }
        if (i === length) {
          if (getUserFailed) {
            cb(getUserFailed);
            return;
          }
          cb(null, jobs);
        }
      });
    });
  });
};

/**
 * 用 id 取得工作資料
 * @param {object} fields 顯示/不顯示的欄位, ex: {_id: 0, content: 0}.（可選）
 * @param {function} cb callback function
 */
JobSchema.statics.getJobById = function (id, fields, cb) {
  if (!cb) {
    cb = fields;
    fields = {};
  }
  this.findOne({_id: id}, fields, function (err, job) {
    if (err) {
      cb(err);
      return;
    }
    job.getOwner(function (err) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, job);
    });
  });
};

/**
 * 取得查詢總頁頁數
 * @param {object} query Mongodb 查詢條件
 * @param {number} perPage 每頁工作個數, 預設 10. （可選） 
 * @param {function} cb callback function
 */
JobSchema.statics.totalPages = function (query, perPage, cb) {
  if (!cb) {
    cb = perPage;
    perPage = 10;
  }
  this.count(query, function (err, count) {
    if (err) {
      cb(err);
      return;
    }
    cb(null, Math.ceil(count / perPage));
  });
};

mongoose.model('Job', JobSchema);
