Nodeclub
=

[![build status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]

[travis-image]: https://img.shields.io/travis/cnodejs/nodeclub.svg?style=flat-square
[travis-url]: https://travis-ci.org/cnodejs/nodeclub
[coverage-image]: https://img.shields.io/coveralls/cnodejs/nodeclub.svg?style=flat-square
[coverage-url]: https://coveralls.io/r/cnodejs/nodeclub?branch=master
[david-image]: https://img.shields.io/david/cnodejs/nodeclub.svg?style=flat-square
[david-url]: https://david-dm.org/cnodejs/nodeclub
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

## 介绍

Nodeclub 是使用 **Node.js** 和 **MongoDB** 开发的社区系统，界面优雅，功能丰富，小巧迅速，
已在Node.js 中文技术社区 [CNode(http://cnodejs.org)](http://cnodejs.org) 得到应用，但你完全可以用它搭建自己的社区。

## 安装部署

*不保证 Windows 系统的兼容性*

线上跑的是 Node.js v1.5，MongoDB 是 v2.6。

```
1. install `node.js[必须]` `mongodb[必须]`
2. run mongod
3. `$ make install` 安装 Nodeclub 的依赖包
4. `cp config.default.js config.js` 请根据需要修改配置文件
5. `$ make test` 确保各项服务都正常
6. `$ node app.js`
7. visit `localhost:3000`
8. done!
```

## 其他

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
