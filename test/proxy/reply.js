var Reply = require('../../proxy/reply');
var support = require('../support/support');
var should = require('should');

describe('proxy/reply.js', function () {
  var reply;
  before(function (done) {
    support.createUser(function (err, user) {
      // support.createTopic();
      // Reply.newAndSave(done);
      done();
    });
  });

  describe('getReplyById', function () {
    it('should ok', function (done) {
      // Reply.getReplyById('');
      done();
    });
  });
});
