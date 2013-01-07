/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var tag_ctrl = require('./tag');
var user_ctrl = require('./user');
var topic_ctrl = require('./topic');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var models = require('../models');
var Job = models.Job;

/**
 * Jobs 首頁
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function index(req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  var limit = config.list_topic_count;
  var proxy;
  var options;
  var query;
  var fields;

  function render(tags, jobs, hot_topics, stars, tops, no_reply_topics, pages) {
    var all_tags = tags.slice(0);
    var hot_tags;
    var recent_tags;
    
    // 計算最熱標簽
    tags.sort(function (tag_a, tag_b) {
      return tag_b.topic_count - tag_a.topic_count;
    });
    hot_tags = tags.slice(0, 5);

    // 計算最新標簽
    tags.sort(function (tag_a, tag_b) {
      return tag_b.create_at - tag_a.create_at;
    });
    recent_tags = tags.slice(0, 5);
    
    res.render('job/index', {
      jobs: jobs,
      recent_tags: recent_tags,
      current_page: page,
      hot_topics: hot_topics,
      stars: stars,
      tops: tops,
      no_reply_topics: no_reply_topics,
      pages: pages
    });
  }

  proxy = EventProxy.create('tags', 'jobs', 'hot_topics', 'stars', 'tops', 'no_reply_topics', 'pages', render);
  proxy.once('error', function (err) {
    proxy.unbind();
    next(err);
  });
  
  // 取得標籤
  tag_ctrl.get_all_tags(function (err, tags) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('tags', tags);
  });

  options = { skip: (page - 1) * limit, limit: limit, sort: [ [ 'update_at', 'desc' ] ] };
  fields = {_v: 0, content: 0};
  query = {};

  // 取得工作資料
  Job.getJobs(query, fields, options, function (err, jobs) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('jobs', jobs);
  });

  // 取得總頁數
  Job.totalPages(query, limit, function (err, pages) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('pages', pages);
  });

  // 取得熱門主題
  topic_ctrl.get_topics_by_query({}, { limit: 5, sort: [ [ 'visit_count', 'desc' ] ] }, function (err, hot_topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('hot_topics', hot_topics);
  });
  
  // 達人
  user_ctrl.get_users_by_query({ is_star: true }, { limit: 5 }, function (err, users) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('stars', users);
  });
  
  // 積分榜
  user_ctrl.get_users_by_query({}, { limit: 10, sort: [ [ 'score', 'desc' ] ] }, function (err, tops) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('tops', tops);
  });

  // 無人回覆主題
  topic_ctrl.get_topics_by_query({ reply_count: 0 }, { limit: 5, sort: [ [ 'create_at', 'desc' ] ] }, function (err, no_reply_topics) {
    if (err) {
      return proxy.emit('error', err);
    }
    proxy.emit('no_reply_topics', no_reply_topics);
  });

}

/**
 * 發布工作頁面
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function create(req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用戶不能發布工作。'});
    return;
  }
  res.render('job/edit');
}

/**
 * 處理發布工作頁面 POST 資料
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function _create(req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用戶不能發布工作。'});
    return;
  }
  
  var title;
  var contact;
  var content;
  var job;

  title = sanitize(req.body.title).trim();
  title = sanitize(title).xss();
  content = req.body.t_content;
  contact = sanitize(req.body.contact).trim();
  contact = sanitize(contact).xss();

  if (title === '') {
    res.render('job/edit', {edit_error: '標題不能是空的。', content: content, contact: contact});
    return;
  }
  
  if (title.length < 10 || title.length > 100) {
    res.render('job/edit', {edit_error: '標題字數太多或太少', title: title, content: content, contact: contact});
    return;
  }
  
  if (contact === '') {
    res.render('job/edit', {edit_error: '說明不能是空的。', content: content, contact: contact});
    return;
  }
  
  if (contact.length < 10 || contact.length > 100) {
    res.render('job/edit', {edit_error: '說明字數太多或太少', title: title, content: content, contact: contact});
    return;
  }

  job = new Job();
  job.title = title;
  job.content = content;
  job.contact = contact;
  job.owner_id = req.session.user._id;
  job.create_at = new Date();
  job.update_at = new Date();

  job.save(function (err, job) {
    if (err) {
      return next(err);
    }
    res.redirect('/job/' + job._id);
  });
}

/**
 * 特定工作資料頁面
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function single(req, res, next) {
  var id = req.params.id;

  if (id.length !== 24) {
    return res.render('notify/notify', {
      error: '此工作不存在或已被刪除。'
    });
  }

  Job.getJobById(id, function (err, job) {
    if (err) {
      return next(err);
    }
    res.render('job/single', {
      job: job
    });
    return;
  });
}

/**
 * 編輯工作資料
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function edit(req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用戶不能修改工作。'});
    return;
  }
  
  var id = req.params.id;
  
  if (id.length !== 24) {
    return res.render('notify/notify', {
      error: '此工作不存在或已被刪除。'
    });
  }
  
  Job.getJobById(id, {_id: 0}, function (err, job) {
    if (err) {
      return next(err);
    }
    
    if (!job) {
      res.render('notify/notify', {
        error: '此工作不存在或已被刪除。'
      });
      return;
    }
    
    if (job.owner_id.toString() !== req.session.user._id.toString() && !req.session.user.is_admin) {
      res.render('notify/notify', {
        error: '你不是發布者，你不是發布者！(打滾'
      });
      return;
    }

    res.render('job/edit', {
      job: job,
      job_id: id,
      title: job.title,
      content: job.content,
      contact: job.contact,
      action: 'edit'
    });
    return;
  });
}

/**
 * 處理修改工作頁面 POST 資料
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function _edit(req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用戶不能修改工作。'});
    return;
  }
  
  var id = req.params.id;
  
  if (id.length !== 24) {
    return res.render('notify/notify', {
      error: '此工作不存在或已被刪除。'
    });
  }
  
  Job.getJobById(id, function (err, job) {
    if (err) {
      return next(err);
    }
    
    if (!job) {
      res.render('notify/notify', {
        error: '此工作不存在或已被刪除。'
      });
      return;
    }

    if (job.owner_id.toString() !== req.session.user._id.toString() && !req.session.user.is_admin) {
      res.render('notify/notify', {
        error: '你不是發布者，你不是發布者！(打滾'
      });
      return;
    }

    var title;
    var contact;
    var content;

    title = sanitize(req.body.title).trim();
    title = sanitize(title).xss();
    content = req.body.t_content;
    contact = sanitize(req.body.contact).trim();
    contact = sanitize(contact).xss();
    
    if (title === '') {
      res.render('job/edit', {edit_error: '標題不能是空的。', content: content, contact: contact});
      return;
    }
    
    if (title.length < 10 || title.length > 100) {
      res.render('job/edit', {edit_error: '標題字數太多或太少', title: title, content: content, contact: contact});
      return;
    }
    
    if (contact === '') {
      res.render('job/edit', {edit_error: '說明不能是空的。', title: title, contact: contact});
      return;
    }
    
    if (contact.length < 10 || contact.length > 100) {
      res.render('job/edit', {edit_error: '說明字數太多或太少', title: title, content: content, contact: contact});
      return;
    }

    job.title = title;
    job.content = content;
    job.contact = contact;
    job.owner_id = req.session.user._id;
    job.update_at = new Date();

    job.save(function (err, job) {
      if (err) {
        return next(err);
      }
      res.redirect('/job/' + job._id);
    });

  });
}

/**
 * 刪除工作
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function del(req, res, next) {
  var id = req.params.id;
  
  if (id.length !== 24) {
    return res.render('notify/notify', {
      error: '此工作不存在或已被刪除。'
    });
  }
  
  res.render('notify/action', {
    action: '#',
    message: '確定要要刪除嗎？'
  });
  return;
}

/**
 * 處理刪除工作 POST 資料
 * @param {object} req express req
 * @param {object} res express res
 * @param {function} next express next function
 */
function _del(req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用戶不能修改工作。'});
    return;
  }
  
  var id = req.params.id;
  
  if (id.length !== 24) {
    return res.render('notify/notify', {
      error: '此工作不存在或已被刪除。'
    });
  }
  
  Job.getJobById(id, function (err, job) {
    if (err) {
      return next(err);
    }
    
    if (!job) {
      res.render('notify/notify', {
        error: '此工作不存在或已被刪除。'
      });
      return;
    }

    if (job.owner_id.toString() !== req.session.user._id.toString() && !req.session.user.is_admin) {
      res.render('notify/notify', {
        error: '你不是發布者，你不是發布者！(打滾'
      });
      return;
    }

    job.remove();
    res.redirect('/job');
  });
}

exports.index = index;
exports.single = single;
exports.create = create;
exports._create = _create;
exports.edit = edit;
exports._edit = _edit;
exports.del = del;
exports._del = _del;
