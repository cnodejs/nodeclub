var nock = require('nock');
var redis = require('../common/redis');

nock.enableNetConnect(); // 允许真实的网络连接

redis.flushdb(); // 清空 db 里面的所有内容
