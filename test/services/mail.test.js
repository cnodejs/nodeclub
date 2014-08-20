var mail = require('../../services/mail');

describe('services/mail.js', function () {
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

  describe('sendAtMail', function () {
    it('should ok', function () {
      mail.sendAtMail();
    });
  });
});
