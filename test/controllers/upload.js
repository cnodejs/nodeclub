var upload = require('../../controllers/upload');
var config = require('../../config').config;
var path = require('path');
var fs = require('fs');
var ndir = require('ndir');
var exec = require('child_process').exec;
var should = require('should');
var rewire = require("rewire");
fs.existsSync = fs.existsSync || path.existsSync;

describe('controllers/upload.js', function () {

  describe('uploadImage()', function () {

    var mockRequest;
    var mockLoginedRequest;
    var mockLoginedRequestForbidden;

    beforeEach(function () {
      mockRequest = {
        session: {
          user: {
            _id: 'mock_user_id'
          }
        }
      };
      mockLoginedRequest = {
        session: {
          user: {
            _id: 'mock_user_id'
          }
        },
        files: {
          userfile: {
            name: path.basename(tmpFile),
            path: tmpFile
          }
        }
      };

      mockLoginedRequestForbidden = {
        session: {
          user: {
            _id: 'mock_user_id'
          }
        },
        files: {
          userfile: {
            name: '/../../' + path.basename(tmpFile),
            path: tmpFile
          }
        }
      };
    });

    var oldUploadDir = config.upload_dir;
    var tmpdirpath = path.join(path.dirname(oldUploadDir), '__testdir__');
    var tmpFile = path.join(tmpdirpath, 'tmp_test_file.png');
    before(function (done) {
      config.upload_dir = tmpdirpath;
      ndir.mkdir(tmpdirpath, function (err) {
        fs.writeFileSync(tmpFile, fs.readFileSync(path.join(__dirname, '../fixtures', 'logo.png')));
        done(err);
      });
    });

    after(function (done) {
      config.upload_dir = oldUploadDir;
      exec('rm -rf ' + tmpdirpath, function (error) {
        if (error) {
          console.log('exec error: ' + error);
        }
        done(error);
      });
    });

    it('should forbidden when user not login', function (done) {
      upload.uploadImage({}, {
        send: function (data) {
          data.should.have.property('status', 'forbidden');
          done();
        }
      }, function () {
        throw new Error('should not call this method');
      });
    });

    it('should failed when no file upload', function (done) {
      upload.uploadImage(mockRequest, {
        send: function (data) {
          data.should.have.property('status', 'failed');
          data.should.have.property('message', 'no file');
          done();
        }
      }, function () {
        throw new Error('should not call this method');
      });
    });

    it('should forbidden when path err', function (done) {
      upload.uploadImage(mockLoginedRequestForbidden, {
        send: function (data) {
          data.should.have.property('status', 'forbidden');
          done();
        }
      }, function () {
        throw new Error('should not call this method');
      });
    });

    it('should upload file success', function (done) {
      upload.uploadImage(mockLoginedRequest, {
        send: function (data) {
          data.should.have.property('status', 'success');
          data.should.have.property('url');
          data.url.should.match(/^\/upload\/mock_user_id\/\d+\_tmp_test_file\.png$/);
          var uploadfile = path.join(tmpdirpath, data.url.replace('/upload/', ''));
          should.ok(fs.existsSync(uploadfile));
          done();
        }
      }, function () {
        throw new Error('should not call this method');
      });
    });

    it('should return mock ndir.mkdir() error', function (done) {
      var upload2 = rewire('../../controllers/upload');
      upload2.__set__({
        ndir: {
          mkdir: function (dir, callback) {
            process.nextTick(function () {
              callback(new Error('mock ndir.mkdir() error'));
            });
          }
        }
      });

      upload2.uploadImage(mockLoginedRequest, {
        send: function (data) {
          throw new Error('should not call this method');
        }
      }, function (err) {
        should.exist(err);
        err.message.should.equal('mock ndir.mkdir() error');
        done();
      });
    });

    it('should return mock fs.rename() error', function (done) {
      var upload3 = rewire('../../controllers/upload');
      upload3.__set__({
        fs: {
          rename: function (from, to, callback) {
            process.nextTick(function () {
              callback(new Error('mock fs.rename() error'));
            });
          }
        }
      });

      upload3.uploadImage(mockLoginedRequest, {
        send: function (data) {
          throw new Error('should not call this method');
        }
      }, function (err) {
        should.exist(err);
        err.message.should.equal('mock fs.rename() error');
        done();
      });
    });

  });

});
