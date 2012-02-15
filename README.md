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
