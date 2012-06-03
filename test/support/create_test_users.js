/*!
 * nodeclub - Create test users for unit tests.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User = require('../../models').User;

var names = [ 'testuser1', 'testuser2', 'testuser3' ];

names.forEach(function (name) {
  var user = new User({
    loginname: name,
    name: name,
    pass: name + '123',
    email: name + '@localhost.cnodejs.org'
  });
  user.save(function () {
    // console.log(arguments)
  });
});