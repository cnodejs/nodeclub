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

小量修改了两个依赖模块：node-markdown

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

## 关于pull request

从现在开始，所有提交都要严格遵循[代码规范](https://github.com/windyrobin/iFrame/blob/master/style.md)。

## Contributors

Below is the output from `git-summary`.

```bash
$ git summary

project  : nodeclub
repo age : 2 years
active   : 205 days
commits  : 471
files    : 260
authors  :
 203  fengmk2                 43.1%
  49  jiyinyiyong             10.4%
  48  Jackson Tian            10.2%
  44  Alsotang                9.3%
  30  dead-horse              6.4%
  10  Kenny Zhao              2.1%
  10  Lei Zongmin             2.1%
   9  muyuan                  1.9%
   8  Zongmin Lei             1.7%
   7  young40                 1.5%
   6  AlsoTang                1.3%
   6  aisk                    1.3%
   5  ericzhang               1.1%
   4  spout                   0.8%
   3  Json Shen               0.6%
   3  Yazhong Liu             0.6%
   2  chang                   0.4%
   2  Cong Ding               0.4%
   2  John Wu                 0.4%
   2  VitoLau                 0.4%
   1  张洋                  0.2%
   1  Xiang Gao               0.2%
   1  Phoenix Nemo            0.2%
   1  fundon                  0.2%
   1  hhuai                   0.2%
   1  Liu Xing                0.2%
   1  kerngven                0.2%
   1  leizongmin              0.2%
   1  LeToNode                0.2%
   1  roymax                  0.2%
   1  Finian                  0.2%
   1  sunwenchao              0.2%
   1  superRaytin             0.2%
   1  thebrecht               0.2%
   1  xyz2k8                  0.2%
   1  Eric                    0.2%
   1  不四                  0.2%
   1  beforeload              0.2%
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
