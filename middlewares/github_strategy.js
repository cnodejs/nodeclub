var Models = require('../models');

module.exports = function (accessToken, refreshToken, profile, done) {
  profile.accessToken = accessToken;
  done(null, profile);
};