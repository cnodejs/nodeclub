@ECHO OFF
npm install && npm install mongodb --mongodb:native && node ./bin/combo views . && cp config.default.js config.js