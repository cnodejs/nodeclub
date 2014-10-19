var express = require('express');

var topicController = require('./api/v1/topic');

var router = express.Router();

router.get('/topics', topicController.index);
router.get('/topic/:id', topicController.show);

module.exports = router;
