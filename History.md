
0.3.3 / 2013-03-11 
==================

  * Merge pull request #126 from cnodejs/updateSignFlow
  * 修复topic更新bug；修复@某人 bug
  * reply2也可以定位到
  * 修复node 0.6 test cases
  * 修复删除评论异常
  * 修复 exports.updateLastReply 没有callback的bug
  * 管理员可以帮忙激活账号
  * Merge pull request #125 from JacksonTian/refine
  * Fix http to https
  * 重构注册和发帖以及发邮件的部分
  * Merge pull request #117 from JacksonTian/get_post
  * 去除掉req.method的判断，分拆方法
  * Merge pull request #122 from JacksonTian/proxy
  * 分离controller和数据操作业务逻辑
  * 改完下划线驼峰为小驼峰式风格
  * Merge pull request #116 from JacksonTian/codingstyle
  * Coding style refine.
  * Merge pull request #113 from JacksonTian/master
  * 添加依赖服务状态图标
  * Merge pull request #112 from JacksonTian/refine
  * 修正rewire.reset()导致的单元测试异常
  * Refine coding style
  * Merge pull request #111 from JacksonTian/master
  * Merge pull request #110 from JacksonTian/reset_history
  * Update Authors
  * 恢复History.md文件
  * Merge pull request #104 from ccding/master
  * fix issue #27: lower case email address for gravatar
  * Merge pull request #103 from ccding/master
  * fix issue #92: email address with gmail label ("+" encode)
  * fixed topic delete not post method security problem.
  * empty author
  * fixed author empty bug
  * Merge pull request #99 from leizongmin/master
  * 将Markdown中的H标题解析放到代码块解析后面
  * Merge pull request #96 from leizongmin/master
  * 修正无法正确解析http://127.0.0.1这样的IP地址链接
  * fixed font
  * fixed color style
  * Merge pull request #87 from jiyinyiyong/rebased
  * Merge pull request #91 from leizongmin/master
  * 使用xss模块来过滤主题及回复内容
  * update to 0.3.2
  * Merge remote branch 'cnode/master'
  * fix escape
  * Merge pull request #89 from dead-horse/master
  * fix test
  * use  in node-validator
  * Merge remote branch 'cnode/master'
  * support block code
  * Merge pull request #88 from dead-horse/master
  * fix
  * change @me to markdown
  * fix @ bug in topic content
  * Merge pull request #86 from dead-horse/master
  * not escape html in
  * add preview
  * remove tags in topics of home page
  * some css
  * 合并通知按钮
  * use escape replace of xss()
  * fixed test cases
  * Merge pull request #85 from dead-horse/master
  * 过滤url允许绝对路径

0.3.2 / 2012-03-04 
==================

  * ensure IncomingForm.UPLOAD_DIR
  * ensure upload image dir exists
  * fixed csrf bug in mark message read
  * remove customHost
  * add .naeignore files
  * * merge cnodeclub to nodeclub; * add more settings for custom site; * fixed upload.js not worked bug;
  * Merge pull request #4 from dead-horse/master
  * Merge pull request #11 from thebrecht/master
  * 话题回复数纳入二级回复，样式调整
  * 支持table,邮件提醒
  * 加入亂數產生新密碼
  * fix style
  * bugs fixed
  * Merge pull request #3 from LeToNode/master
  * Merge pull request #6 from ericzhang-cn/master
  * markdown语法粗体应为两个星号，原描述有误
  * Merge pull request #2 from roymax/master
  * change to async
  * change to async
  * Update README.md
  * 修复`abc+label@gmail.com`格式的注册邮箱不能成功激活的问题
  * commit
  * project init
  * first commit
