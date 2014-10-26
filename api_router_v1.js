var express = require('express');

var topicController = require('./api/v1/topic');
var userController = require('./api/v1/user');
var toolsController = require('./api/v1/tools');

var router = express.Router();

router.get('/topics', topicController.index);
router.get('/topic/:id', topicController.show);
router.get('/user/:loginname', userController.show);
router.post('/accesstoken', toolsController.accesstoken);

module.exports = router;
