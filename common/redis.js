var config = require('../config');
var Redis = require('ioredis');

var client = new Redis({
  port: config.redis_port,
  host: config.redis_host,
  db: config.redis_db,
});

client.on('error', function (err) {
  if (err) {
    console.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
})

exports = module.exports = client;
