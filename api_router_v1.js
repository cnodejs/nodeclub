var express = require('express');

var topicController = require('./api/v1/topic');
var userController = require('./api/v1/user');
var toolsController = require('./api/v1/tools');
var replyController = require('./api/v1/reply');
var middleware = require('./api/v1/middleware');

var router = express.Router();

router.get('/topics', topicController.index);
router.get('/topic/:id', topicController.show);
router.post('/topics', middleware.auth, topicController.create);

router.get('/user/:loginname', userController.show);

router.post('/accesstoken', middleware.auth, toolsController.accesstoken);

router.post('/topic/:topic_id/replies', middleware.auth, replyController.create);

module.exports = router;
