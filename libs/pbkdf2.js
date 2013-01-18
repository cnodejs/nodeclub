/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var crypto = require('crypto');
// Bcrypt Adoptions:
// bcrypt.genSalt(rounds, seed_length, callback(err, salt))
// bcrypt.hash(data, salt, callback(err, encrypted))
// bcrypt.compare(data, encrypted, function(err, same))

module.exports = {
  keylen: 256,
  iterations: 4096,
  genSalt: function (size, callback) {
    crypto.randomBytes(size, function (err, buf) {
      if (err) {
        return callback(err);
      }
      return callback(null, buf.toString('base64'));
    });
  },
  hash: function (data, salt, callback) {
    // For iteration count settings, see:
    // http://security.stackexchange.com/questions/3959/recommended-of-iterations-when-using-pkbdf2-sha256
    crypto.pbkdf2(data, salt, this.iterations, this.keylen, function (err, derivedKey) {
      if (err) {
        return callback(err);
      }
      // derivedKey is string, but stores binary data
      var buffer = new Buffer(derivedKey);
      return callback(null, buffer.toString('hex'), salt);
    });
  },
  compare: function (data, encrypted, salt, callback) {
    this.hash(data, salt, function (err, hash) {
      if (err) {
        return callback(err);
      }
      return callback(null, (encrypted === hash));
    });
  }
};
