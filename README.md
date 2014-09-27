Nodeclub
=

[![build status][travis-image]][travis-url]
[![Coverage Status](https://img.shields.io/coveralls/cnodejs/nodeclub.svg?style=flat-square)](https://coveralls.io/r/cnodejs/nodeclub?branch=master)
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]

[travis-image]: https://img.shields.io/travis/cnodejs/nodeclub.svg?style=flat-square
[travis-url]: https://travis-ci.org/cnodejs/nodeclub
[david-image]: https://img.shields.io/david/cnodejs/nodeclub.svg?style=flat-square
[david-url]: https://david-dm.org/cnodejs/nodeclub
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

## 介绍

Nodeclub 是使用 **Node.js** 和 **MongoDB** 开发的社区系统，界面优雅，功能丰富，小巧迅速，
已在Node.js 中文技术社区 [CNode(http://cnodejs.org)](http://cnodejs.org) 得到应用，但你完全可以用它搭建自己的社区。

## 安装部署

```
1. install `node.js` `mongodb`
2. run mongod
3. `$ make install` 安装 Nodeclub 的依赖包
4. `$ make test` 确保各项服务都正常
5. `$ node app.js`
6. visit `localhost:3000`
7. done!
```

## 贡献

跑测试

```bash
$ make test
```

跑覆盖率测试

```bash
$ make test-cov
```

## License

MIT
