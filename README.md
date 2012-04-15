<<<<<<< HEAD
##Node Club

###### 介绍
Node Club 是用 **Node.js** 和 **MongoDB** 开发的新型社区软件，界面优雅，功能丰富，已在Node.js 中文技术社区 [CNode](http://cnodejs.org) 得到应用，但你完全可以用它搭建自己的社区。

###### 安装部署
    // Please install node & mongodb first.  
    // run mongod
    git clone git://github.com/muyuan/nodeclub.git
    // or git clone https://github.com/muyuan/nodeclub.git
    cd nodeclub
    npm install .
    cp config.default.js config.js
    // modify the config file as yours
    node app.js

###### 其它
小量修改了两个依赖模块：node-markdown，express
 
   1. node-markdown/lib/markdown.js allowedTags 添加 `embed` 标签以支持 flash 视频，allowedAttributes 添加 `embed:'src|quality|width|height|align|allowScriptAccess|allowFullScreen|mode|type'` 
   2. express/node_modules/connect/lib/middleware/csrf.js 添加 `if (req.xhr === true) return next();if (req.body.user_action && req.body.user_action == 'upload_image') return next();`
=======
# nodeclub

基于nodejs的社区系统

## 介绍

Node Club 是用 **Node.js** 和 **MongoDb** 开发的新型社区软件，界面优雅，功能丰富，小巧迅速，
已在Node.js 中文技术社区 [CNode](http://cnodejs.org) 得到应用，但你完全可以用它搭建自己的社区。

## 安装部署

```bash
// install node npm mongodb  
// run mongod
cd nodeclub
npm install ./
cp config.default.js config.js
// modify the config file as yours
node app.js
```
    
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
 commits: 53
 files  : 244
 authors: 
    25  fengmk2                 47.2%
     9  muyuan                  17.0%
     8  dead-horse              15.1%
     4  ericzhang               7.5%
     3  Kenny Zhao              5.7%
     1  LeToNode                1.9%
     1  roymax                  1.9%
     1  thebrecht               1.9%
     1  张洋                  1.9%
```
>>>>>>> ebb79ba80cf1356a268d3ada3663c4fd0563b1a0
