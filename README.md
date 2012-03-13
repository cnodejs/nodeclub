# nodeclub

基于nodejs的社区系统

## 介绍

Node Club 是用 **Node.js** 和 **MongoDb** 开发的新型社区软件，界面优雅，功能丰富，小巧迅速，
已在Node.js 中文技术社区 [CNode](http://cnodejs.org) 得到应用，但你完全可以用它搭建自己的社区。

## 安装部署

```
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

```
if (req.body && req.body.user_action === 'upload_image') return next();
```

## 关于pull request

从现在开始，所有提交都要严格遵循[代码规范](https://github.com/windyrobin/iFrame/blob/master/style.md)。

## Authors
Below is the output from git-summary.

```
 project: nodeclub
 commits: 43
 files  : 242
 authors: 
    20  fengmk2                 46.5%
     9  muyuan                  20.9%
     7  dead-horse              16.3%
     3  Kenny Zhao              7.0%
     1  LeToNode                2.3%
     1  roymax                  2.3%
     1  thebrecht               2.3%
     1  张洋                  2.3%
```