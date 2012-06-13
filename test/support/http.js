// codes from https://github.com/senchalabs/connect/blob/master/test/support/http.js

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var methods = ['get', 'post', 'put', 'delete', 'head'];
// var connect = require('../../node_modules/connect');
var express = require('express');
var connect = null;
try {
  connect = require('connect');
} catch (e) {

}
var http = require('http');
var querystring = require('querystring');


// need to change > 0.3.x
express.HTTPServer.prototype.request = function (address) {
  return new Request(this, address);
};

if (connect && connect.HTTPServer) {
  connect.HTTPServer.prototype.request = express.HTTPServer.prototype.request;
}

// not support < 0.2.0
// connect.proto.request = function(){
//   return request(this);
// };

function Request(app, address) {
  this.data = [];
  this.header = {};
  this.app = app;
  this.server = app;
  this.addr = address || this.server.address();
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

methods.forEach(function (method) {
  Request.prototype[method] = function (path) {
    return this.request(method, path);
  };
});

Request.prototype.set = function (field, val) {
  this.header[field] = val;
  return this;
};

Request.prototype.setBody = function (body) {
  this.set('Content-Type', 'application/x-www-form-urlencoded');
  this.write(querystring.stringify(body));
  return this;
};

Request.prototype.write = function (data) {
  this.data.push(data);
  return this;
};

Request.prototype.request = function (method, path) {
  this.method = method;
  this.path = path;
  return this;
};

Request.prototype.expect = function (body, fn) {
  var args = arguments;
  this.end(function (res) {
    if (args.length === 3) {
      res.headers.should.have.property(body.toLowerCase(), args[1]);
      args[2]();
    } else {
      if ('number' === typeof body) {
        res.statusCode.should.equal(body);
      } else {
        res.body.toString().should.equal(body);
      }
      fn();
    }
  });
};

Request.prototype.end = function (fn) {
  var self = this;
  var req = http.request({
    method: this.method,
    port: this.addr.port, 
    host: this.addr.address, 
    path: this.path,
    headers: this.header
  });

  this.data.forEach(function (chunk) {
    req.write(chunk);
  });
  
  req.on('response', function (res) {
    var chunks = [], size = 0;
    res.on('data', function (chunk) { 
      chunks.push(chunk); 
      size += chunk.length;
    });
    res.on('end', function () {
      var buf = null;
      switch (chunks.length) {
      case 0: 
        buf = new Buffer(0); 
        break;
      case 1: 
        buf = chunks[0]; 
        break;
      default:
        buf = new Buffer(size);
        var pos = 0;
        for (var i = 0, l = chunks.length; i < l; i++) {
          var chunk = chunks[i];
          chunk.copy(buf, pos);
          pos += chunk.length;
        }
        break;
      }
      res.body = buf;
      res.bodyJSON = function () {
        return JSON.parse(res.body);
      };
      res.shouldRedirect = function (status, url) {
        res.should.status(status);
        var addr = self.app.address();
        res.headers.location.should.equal('http://' + addr.address + ':' + addr.port + url);
      };
      fn(res);
    });
  });

  req.end();

  return this;
};