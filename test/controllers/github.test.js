var app = require('../../app');
var request = require('supertest')(app);
var mm = require('mm');
var passport = require('passport');
var path = require('path');
var github = require('../../controllers/github');
var Models = require('../../models');
var User = Models.User;
var config = require('../../config');

describe('test/controllers/github.test.js', function () {
  afterEach(function () {
    mm.restore();
  });

  it('should 302 when get /auth/github', function (done) {
    var _clientID = config.GITHUB_OAUTH.clientID;
    config.GITHUB_OAUTH.clientID = 'aldskfjo2i34j2o3';
    request.get('/auth/github')
      .expect(302, function (err, res) {
        if (err) {
          return done(err);
        }
        res.headers.should.have.property('location')
          .with.startWith('https://github.com/login/oauth/authorize?');
        config.GITHUB_OAUTH.clientID = _clientID;
        done();
      });
  });

  describe('get /auth/github/callback', function () {
    before(function () {
      app.get('/auth/github/test_callback',
        function (req, res, next) {
          req.user = {id: 'notexists'};
          next();
        },
        github.callback);
    });
    it('should redirect to /auth/github/new when the github id not in database', function (done) {
      request.get('/auth/github/test_callback?code=123456')
        .expect(302, function (err, res) {
          if (err) {
            return done(err);
          }
          res.headers.should.have.property('location')
            .with.endWith('/auth/github/new');
          done();
        });
    });

    it('should redirect to / when the user is registed', function (done) {
      mm.data(User, 'findOne', {save: function (callback) {
        process.nextTick(callback);
      }});

      request.get('/auth/github/test_callback?code=123456')
        .expect(302, function (err, res) {
          if (err) {
            return done(err);
          }
          res.headers.should.have.property('location')
            .with.endWith('/');
          done();
        });
    });
  });

  describe('get /auth/github/new', function () {
    it('should 200', function (done) {
      request.get('/auth/github/new')
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          res.text.should.containEql('/auth/github/create');
          done();
        });
    });
  });

  describe('post /auth/github/create', function () {
    before(function () {
      app.post('/auth/github/test_create', function (req, res, next) {
        req.session.profile = {
          displayName: 'alsotang' + new Date(),
          username: 'alsotang' + new Date(),
          accessToken: 'a3l24j23lk5jtl35tkjglfdsf',
          emails: [
            {value: 'alsotang@gmail.com' + new Date()}
          ],
          _json: {avatar_url: 'http://avatar_url.com/1.jpg'},
          id: 22,
        };
        next();
      }, github.create);
    });
    it('should create a new user', function (done) {
      var userCount;
      User.count(function (err, count) {
        userCount = count;
        request.post('/auth/github/test_create')
          .send({isnew: '1'})
          .expect(302, function (err, res) {
            if (err) {
              return done(err);
            }
            res.headers.should.have.property('location')
              .with.endWith('/');
            User.count(function (err, count) {
              count.should.equal(userCount + 1);
              done();
            });
          });
      });
    });

    it('should not create a new user when loginname or email conflict', function (done) {
      request.post('/auth/github/test_create')
        .send({isnew: '1'})
        .expect(500, function (err, res) {
          if (err) {
            return done(err);
          }
          res.text.should.match(/您 GitHub 账号的.*与之前在 CNodejs 注册的.*重复了/);
          done();
        });
    });

    it('should link a old user', function (done) {
      var username = 'Alsotang';
      var pass = 'hehe';
      mm(User, 'findOne', function (loginInfo, callback) {
        loginInfo.loginname.should.equal(username.toLowerCase());
        callback(null, {save: function () {
          done();
        }});
      });
      request.post('/auth/github/test_create')
        .send({name: username, pass: pass})
        .end();
    });
  });
});