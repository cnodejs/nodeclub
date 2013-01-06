# nodeclub [![Build Status](https://secure.travis-ci.org/cnodejs/nodeclub.png?branch=master)](http://travis-ci.org/cnodejs/nodeclub)

基于nodejs的社区系统

## 介绍

Node Club 是用 **Node.js** 和 **MongoDB** 开发的新型社区软件，界面优雅，功能丰富，小巧迅速，
已在Node.js 中文技术社区 [CNode](http://cnodejs.org) 得到应用，但你完全可以用它搭建自己的社区。

## 安装部署

```bash
// install node npm mongodb
// run mongod
$ npm install
$ cp config.default.js config.js
// modify the config file as yours
$ node app.js
```

## TEST

```bash
$ make test
```

jscoverage

```bash
$ make test-cov
```

* jscoverage: [**31%**](http://fengmk2.github.com/coverage/nodeclub.html)
    
## 其它

小量修改了两个依赖模块：node-markdown，express
 
* node-markdown/lib/markdown.js  

allowedTags 添加：

```
embed  //支持 flash 视频
table|thead|tbody|tr|td|th|caption  //支持表格
```
   
allowedAttributes 添加：

```
embed:'src|quality|width|height|align|allowScriptAccess|allowFullScreen|mode|type'
table: 'class'
```

* express/node_modules/connect/lib/middleware/csrf.js 添加：

```javascript
if (req.body && req.body.user_action === 'upload_image') return next();
```

## 关于pull request

从现在开始，所有提交都要严格遵循[代码规范](https://github.com/windyrobin/iFrame/blob/master/style.md)。

## Authors

Below is the output from `git-summary`.

```
 project: nodeclub
 commits: 201
 active : 81 days
 files  : 267
 authors: 
    94  fengmk2                 46.8%
    20  Jackson Tian            10.0%
    15  dead-horse              7.5%
    13  jiyinyiyong             6.5%
    10  Kenny Zhao              5.0%
     9  muyuan                  4.5%
     7  young40                 3.5%
     6  aisk                    3.0%
     6  Lei Zongmin             3.0%
     5  ericzhang               2.5%
     4  spout                   2.0%
     3  Json Shen               1.5%
     2  chang                   1.0%
     1  张洋                  0.5%
     1  LeToNode                0.5%
     1  leizongmin              0.5%
     1  roymax                  0.5%
     1  sunwenchao              0.5%
     1  thebrecht               0.5%
     1  Xiang Gao               0.5%
```

## License

( The MIT License )

Copyright (c) 2012 - 2013 muyuan, fengmk2 and other nodeclub contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
