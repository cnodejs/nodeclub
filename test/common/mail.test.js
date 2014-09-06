var mail = require('../../common/mail');

describe('test/common/mail.test.js', function () {
  describe('sendActiveMail', function () {
    it('should ok', function () {
      mail.sendActiveMail('shyvo1987@gmail.com', 'token', 'jacksontian');
    });
  });

  describe('sendResetPassMail', function () {
    it('should ok', function () {
      mail.sendResetPassMail('shyvo1987@gmail.com', 'token', 'jacksontian');
    });
  });

});
