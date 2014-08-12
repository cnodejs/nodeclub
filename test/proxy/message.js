var Message = require('../../proxy/message');
var should = require('should');

describe('proxy/message.js', function () {
  xdescribe('getMessagesCount', function () {
    it('should ok', function (done) {
      Message.getMessagesCount('4fd5efe5dbf01e466c000002', function (err, count) {
        should.not.exist(err);
        count.should.be.above(0);
        done();
      });
    });
  });

  xdescribe('getMessageById', function () {
    it('should ok with at', function (done) {
      Message.getMessageById('5123c4a34cbcd5cc9300000d', function (err, message) {
        should.not.exist(err);
        message.type.should.be.equal('at');
        message.topic_id.toString().should.be.equal('4fb9db9c1dc2160000000005');
        message.author_id.toString().should.be.equal('4fcae41e1eb86c0000000003');
        done();
      });
    });

    it('should ok with follow', function (done) {
      // TODO: follow message
      // message.getMessageById('5123c4a34cbcd5cc9300000d', function (err, message) {
      //   should.not.exist(err);
      //   message.type.should.be.equal('');
      //   message.topic_id.toString().should.be.equal('4fb9db9c1dc2160000000005');
      //   message.author_id.toString().should.be.equal('4fcae41e1eb86c0000000003');
      done();
      // });
    });

    describe('mock User.getUserById', function () {

    });

    describe('mock Topic.getTopicById', function () {

    });
  });

  xdescribe('getMessagesByUserId', function () {
    it('should ok', function (done) {
      Message.getMessagesByUserId('4fd5efe5dbf01e466c000002', function (err, messages) {
        should.not.exist(err);
        messages.length.should.be.above(10);
        messages.forEach(function (message) {
          message.should.have.property('topic_id');
          message.should.have.property('author_id');
          message.should.have.property('master_id');
          message.should.have.property('type');
        });
        done();
      });
    });
  });

  xdescribe('getUnreadMessageByUserId', function () {
    it('should ok', function (done) {
      Message.getUnreadMessageByUserId('4fd5efe5dbf01e466c000002', function (err, messages) {
        should.not.exist(err);
        messages.length.should.be.above(10);
        messages.forEach(function (message) {
          message.should.have.property('topic_id');
          message.should.have.property('author_id');
          message.should.have.property('master_id');
          message.should.have.property('type');
        });
        done();
      });
    });
  });
});
