# TOC
   - [app.js](#appjs)
   - [controllers/at.js](#controllersatjs)
     - [searchUsers()](#controllersatjs-searchusers)
     - [linkUsers()](#controllersatjs-linkusers)
       - [mock searchUsers() error](#controllersatjs-linkusers-mock-searchusers-error)
     - [sendMessageToMentionUsers()](#controllersatjs-sendmessagetomentionusers)
       - [mock Message.send_at_message() error](#controllersatjs-sendmessagetomentionusers-mock-messagesend_at_message-error)
   - [controllers/rss.js](#controllersrssjs)
     - [/rss](#controllersrssjs-rss)
       - [mock `config.rss` not set](#controllersrssjs-rss-mock-configrss-not-set)
       - [mock `topic.get_topics_by_query()` error](#controllersrssjs-rss-mock-topicget_topics_by_query-error)
   - [controllers/site.js](#controllerssitejs)
   - [controllers/status.js](#controllersstatusjs)
   - [controllers/upload.js](#controllersuploadjs)
     - [uploadImage()](#controllersuploadjs-uploadimage)
   - [controllers/user.js](#controllersuserjs)
   - [plugins/onehost.js](#pluginsonehostjs)
     - [exclude options](#pluginsonehostjs-exclude-options)
<a name="" />
 
<a name="appjs" />
# app.js
should / status 200.

```js
app.request().get('/').end(function (res) {
  res.should.status(200);
  done();
});
```

<a name="controllersatjs" />
# controllers/at.js
<a name="controllersatjs-searchusers" />
## searchUsers()
should found 3 test users.

```js
searchUsers(text, function (err, users) {
  should.not.exist(err);
  should.exist(users);
  users.should.length(3);
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    user.name.should.match(/^testuser\d$/);
  }
  done();
});
```

should found 0 user in text.

```js
searchUsers('no users match in text @ @@@@ @ @@@ @哈哈 @ testuser1', function (err, users) {
  should.not.exist(err);
  should.exist(users);
  users.should.length(0);
  done();
});
```

should found 0 user in db.

```js
searchUsers('@testuser123 @suqian2012 @ testuser1 no users match in db @ @@@@ @ @@@', 
function (err, users) {
  should.not.exist(err);
  should.exist(users);
  users.should.length(0);
  done();
});
```

<a name="controllersatjs-linkusers" />
## linkUsers()
should link all mention users.

```js
mentionUser.linkUsers(text, function (err, text2) {
  should.not.exist(err);
  text2.should.equal(linkedText);
  done();
});
```

<a name="controllersatjs-linkusers-mock-searchusers-error" />
### mock searchUsers() error
should return error.

```js
mentionUser.linkUsers(text, function (err, text2) {
  should.exist(err);
  err.message.should.equal('mock searchUsers() error');
  should.not.exist(text2);
  done();
});
```

<a name="controllersatjs-sendmessagetomentionusers" />
## sendMessageToMentionUsers()
should send message to all mention users.

```js
mentionUser.sendMessageToMentionUsers(text, '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003', 
function (err) {
  should.not.exist(err);
  done();
});
```

should not send message to no mention users.

```js
mentionUser.sendMessageToMentionUsers('abc no mentions', '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003', 
function (err) {
  should.not.exist(err);
  done();
});
```

<a name="controllersatjs-sendmessagetomentionusers-mock-messagesend_at_message-error" />
### mock Message.send_at_message() error
should return error.

```js
mentionUser.sendMessageToMentionUsers(text, '4fb9db9c1dc2160000000005', '4fcae41e1eb86c0000000003', 
function (err) {
  should.exist(err);
  err.message.should.equal('mock send_at_message() error');
  done();
});
```

<a name="controllersrssjs" />
# controllers/rss.js
<a name="controllersrssjs-rss" />
## /rss
should return `application/xml` Content-Type.

```js
app.request().get('/rss').end(function (res) {
  res.should.status(200);
  res.should.header('content-type', 'application/xml');
  var body = res.body.toString();
  body.indexOf('<?xml version="1.0" encoding="utf-8"?>').should.equal(0);
  body.should.include('<rss version="2.0">');
  body.should.include('<channel><title>' + config.rss.title + '</title>');
  done();
});
```

<a name="controllersrssjs-rss-mock-configrss-not-set" />
### mock `config.rss` not set
should return waring message.

```js
app.request().get('/rss').end(function (res) {
  res.should.status(404);
  res.body.toString().should.equal('Please set `rss` in config.js');
  done();
});
```

<a name="controllersrssjs-rss-mock-topicget_topics_by_query-error" />
### mock `topic.get_topics_by_query()` error
should return error.

```js
app.request().get('/rss').end(function (res) {
  res.should.status(500);
  res.body.toString().should.include('mock get_topics_by_query() error');
  done();
});
```

<a name="controllerssitejs" />
# controllers/site.js
should /index 200.

```js
app.request().get('/').end(function (res) {
  res.should.status(200);
  done();
});
```

should /?q=neverexistskeyword 200.

```js
app.request().get('/?q=neverexistskeyword').end(function (res) {
  res.should.status(200);
  res.body.toString().should.include('无话题');
  done();
});
```

should /?q=neverexistskeyword&q=foo2 200.

```js
app.request().get('/?q=neverexistskeyword&q=foo2').end(function (res) {
  res.should.status(200);
  res.body.toString().should.include('无话题');
  done();
});
```

<a name="controllersstatusjs" />
# controllers/status.js
should /status 200.

```js
app.request().get('/status').end(function (res) {
  res.should.status(200);
  res.should.header('content-type', 'application/json; charset=utf-8');
  var json;
  try {
    json = JSON.parse(res.body.toString());
  } catch (e) {
    done(e);
  }
  json.should.have.property("status", "success");
  json.should.have.property("now");
  done();
});
```

<a name="controllersuploadjs" />
# controllers/upload.js
<a name="controllersuploadjs-uploadimage" />
## uploadImage()
should forbidden when user not login.

```js
upload.uploadImage({}, {
  send: function (data) {
    data.should.have.property('status', 'forbidden');
    done();
  }
}, function () {
  throw new Error('should not call this method');
});
```

should failed when no file upload.

```js
upload.uploadImage(mockRequest, {
  send: function (data) {
    data.should.have.property('status', 'failed');
    data.should.have.property('message', 'no file');
    done();
  }
}, function () {
  throw new Error('should not call this method');
});
```

should upload file success.

```js
upload.uploadImage(mockLoginedRequest, {
  send: function (data) {
    data.should.have.property('status', 'success');
    data.should.have.property('url');
    data.url.should.match(/^\/upload\/mock_user_id\/\d+\_tmp_test_file\.png$/);
    var uploadfile = path.join(tmpdirpath, data.url.replace('/upload/', ''));
    should.ok(path.existsSync(uploadfile));
    done();
  }
}, function () {
  throw new Error('should not call this method');
});
```

should return mock ndir.mkdir() error.

```js
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
```

should return mock fs.rename() error.

```js
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
```

<a name="controllersuserjs" />
# controllers/user.js
/user/testuser1 should 200.

```js
app.request().get('/user/testuser1').end(function (res) {
  res.should.status(200);
  done();
});
```

/stars should 200.

```js
app.request().get('/stars').end(function (res) {
  res.should.status(200);
  done();
});
```

/users/top100 should 200.

```js
app.request().get('/users/top100').end(function (res) {
  res.should.status(200);
  done();
});
```

/setting should 302 when not login.

```js
app.request().get('/setting').end(function (res) {
  res.should.status(302);
  done();
});
```

<a name="pluginsonehostjs" />
# plugins/onehost.js
should 301 redirect all `GET` to test.localhost.onehost.com.

```js
app.request().get('/foo/bar').end(function (res) {
  res.should.status(301);
  res.headers.location.should.equal('http://' + bindHost + '/foo/bar');
  done();
});
```

should 301 when GET request 127.0.0.1:port.

```js
app.request({ address: '127.0.0.1', port: app.address().port }).get('/foo/bar').end(function (res) {
  res.should.status(301);
  res.headers.location.should.equal('http://' + bindHost + '/foo/bar');
  done();
});
```

should no redirect for `post`.

```js
app.request()[method]('/foo/bar').end(function (res) {
  res.should.status(200);
  res.headers.should.not.have.property('location');
  if (method === 'head') {
    res.body.should.length(0);
  } else {
    res.body.toString().should.equal(method.toUpperCase() + ' /foo/bar');
  }
  done();
});
```

should no redirect for `put`.

```js
app.request()[method]('/foo/bar').end(function (res) {
  res.should.status(200);
  res.headers.should.not.have.property('location');
  if (method === 'head') {
    res.body.should.length(0);
  } else {
    res.body.toString().should.equal(method.toUpperCase() + ' /foo/bar');
  }
  done();
});
```

should no redirect for `delete`.

```js
app.request()[method]('/foo/bar').end(function (res) {
  res.should.status(200);
  res.headers.should.not.have.property('location');
  if (method === 'head') {
    res.body.should.length(0);
  } else {
    res.body.toString().should.equal(method.toUpperCase() + ' /foo/bar');
  }
  done();
});
```

should no redirect for `head`.

```js
app.request()[method]('/foo/bar').end(function (res) {
  res.should.status(200);
  res.headers.should.not.have.property('location');
  if (method === 'head') {
    res.body.should.length(0);
  } else {
    res.body.toString().should.equal(method.toUpperCase() + ' /foo/bar');
  }
  done();
});
```

<a name="pluginsonehostjs-exclude-options" />
## exclude options
should 301 redirect all `GET` to test.localhost.onehost.com.

```js
app.request().get('/foo/bar').end(function (res) {
  res.should.status(301);
  res.headers.location.should.equal('http://' + bindHost + '/foo/bar');
  done();
});
```

should 200 when request GET exclude host.

```js
app2.request({ address: '127.0.0.1', port: 58964 }).get('/foo/bar').end(function (res) {
  res.should.status(200);
  res.body.toString().should.equal('GET /foo/bar');
  done();
});
```

