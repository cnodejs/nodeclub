var express = require('express');

var postController = require('./api/v1/post');

var router = express.Router();

router.get('/posts', postController.index);

module.exports = router;
