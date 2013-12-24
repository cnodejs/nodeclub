var Models = require('../models');
var User = Models.User;

module.exports = function (accessToken, refreshToken, profile, done) {
  User.findOne({loginame: profile.username}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      user = new User({
        name: profile.displayName,
        loginame: profile.username,
        pass: accessToken,
        email: profile.emails[0].value,
        avatar: profile._json.avatar_url,
      });
      user.save(function (err) {
        if (err) {
          return done(err);
        }
        done(null, user);
      });
    } else {
      done(null, user);
    }
  });
};