# nodeclub [![Build Status](https://secure.travis-ci.org/cnodejs/nodeclub.png?branch=master)](http://travis-ci.org/cnodejs/nodeclub) [![依赖模块状态](https://david-dm.org/cnodejs/nodeclub.png)](http://david-dm.org/cnodejs/nodeclub)

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

## Contributors

Below is the output from `git-summary`.

```
 $ git summary 

 project  : nodeclub
 repo age : 1 year, 1 month
 active   : 113 days
 commits  : 270
 files    : 280
 authors  : 
   129  fengmk2                 47.8%
    31  Jackson Tian            11.5%
    30  dead-horse              11.1%
    16  jiyinyiyong             5.9%
    10  Kenny Zhao              3.7%
     9  Lei Zongmin             3.3%
     9  muyuan                  3.3%
     7  young40                 2.6%
     6  aisk                    2.2%
     5  ericzhang               1.9%
     4  spout                   1.5%
     3  Json Shen               1.1%
     2  Cong Ding               0.7%
     2  chang                   0.7%
     1  sunwenchao              0.4%
     1  roymax                  0.4%
     1  Xiang Gao               0.4%
     1  leizongmin              0.4%
     1  thebrecht               0.4%
     1  LeToNode                0.4%
     1  张洋                  0.4%
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
