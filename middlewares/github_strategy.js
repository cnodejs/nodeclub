module.exports = function (accessToken, refreshToken, profile, done) {
  profile.accessToken = accessToken;
  done(null, profile);
};
