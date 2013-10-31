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
 repo age : 1 year, 3 months
 active   : 140 days
 commits  : 335
 files    : 267
 authors  : 
   159  fengmk2                 47.5%
    42  jiyinyiyong             12.5%
    34  Jackson Tian            10.1%
    30  dead-horse              9.0%
    10  Lei Zongmin             3.0%
    10  Kenny Zhao              3.0%
     9  muyuan                  2.7%
     7  young40                 2.1%
     6  aisk                    1.8%
     5  ericzhang               1.5%
     4  spout                   1.2%
     3  Json Shen               0.9%
     2  Cong Ding               0.6%
     2  chang                   0.6%
     1  张洋                  0.3%
     1  hhuai                   0.3%
     1  Xiang Gao               0.3%
     1  kerngven                0.3%
     1  leizongmin              0.3%
     1  Liu Xing                0.3%
     1  roymax                  0.3%
     1  LeToNode                0.3%
     1  sunwenchao              0.3%
     1  thebrecht               0.3%
     1  Finian                  0.3%
     1  Zongmin Lei             0.3%
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
