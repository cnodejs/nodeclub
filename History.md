
0.3.6 / 2013-11-22 
==================

  * fix #237 if topic not exists, do not modified it.
  * Merge pull request #230 from JacksonTian/fix_null
  * 修复给空值设置属性的错误
  * Merge pull request #224 from JacksonTian/config_ga
  * 将Google tracker可配置化
  * Merge pull request #223 from jiyinyiyong/ga
  * add Google Analytics
  * Merge pull request #217 from leizongmin/master
  * 编辑器进入全屏模式时，调整一下样式
  * hotfix sendAtMail
  * fixed "TypeError: Cannot read property author_id of null"
  * 使用七牛 gravatar.qiniudn.com 镜像
  * Merge pull request #212 from tjwudi/master
  * Fix 'title' textarea layout problem.
  * Merge pull request #211 from tjwudi/master
  * Add OS regular files to .gitignore
  * Merge pull request #209 from leizongmin/master
  * 解决打开Topic时自动跳到输入框问题
  * Merge pull request #205 from jiyinyiyong/master
  * Merge pull request #208 from leizongmin/master
  * 帖子内容页面，增加表格样式
  * 发布帖子使用 EpicEditor 编辑器
  * xss白名单 增加thead标签
  * Merge pull request #204 from JacksonTian/assets_issue
  * limit the length of message to 20
  * 兼容未启用压缩功能的情况
  * Merge pull request #193 from dead-horse/fix-block-count
  * fix block count
  * Merge pull request #190 from leizongmin/master
  * 修正用户收藏的话题页面，页码链接不正确问题
  * Merge pull request #186 from phoenixlzx/master
  * Fixed mongoose version
  * Merge pull request #182 from JacksonTian/assets_mini
  * 替换debug为mini
  * Merge pull request #181 from JacksonTian/assets
  * 用config.debug判断是否线上状态
  * Merge pull request #180 from JacksonTian/assets
  * 升级data2xml
  * 静态资源重构
  * Merge pull request #178 from JacksonTian/typo
  * Node.JS => Node.js
  * Merge pull request #177 from JacksonTian/style
  * 文章页面的样式
  * Fix几个样式问题
  * fixed #175 stars max size
  * fixed require package.json nae not support bug
  * Merge pull request #174 from JacksonTian/style
  * 去除用标签来制造空格的行为
  * 更新样式
  * Merge pull request #171 from jiyinyiyong/markdown-p
  * limit image height
  * limit pre-wrap inside p
  * Merge pull request #165 from VitoLau/master
  * 更新about faq页面结构
  * 调整about和faq页面 padding大小
  * Merge pull request #164 from jiyinyiyong/master
  * fix: markdown-text use pre-wrap
  * format indentations to 2
  * limit the with of message links to prevent line breaks
  * 修复文字过长没有换行的问题

0.3.5 / 2013-05-30 
==================

  * Update logo based on the new official one (@finian)
  * UI more flatter; use "white-space:pre" to show spaces (@jiyinyiyong)
  * fixed #161 xss process after markdown transfer
  * 修复reply2的逻辑；暂时屏蔽标签功能
  * use fixed-width font in reply
  * a text align and a padding
  * add padding to the read messages
  * 点击回复数直接跳到最后一个回复
  * 支持html
  * fixed #154 消息跳转没有直接跳转到回复
  * fixed #146 修复tag编辑bug
  * 增加nae config
  * 增加邮件提示内容
  * read file sync package.json

0.3.4 / 2013-05-27 
==================

  * user markd instead showdown, use ace (@fengmk2)
  * 使用加粗的边缘线; 过滤粉红色的边缘线; 加深 panel header 颜色; 去掉 scrollbar 定制 (@jiyinyiyong)
  * 指定xss模块的配置信息，禁止HTML标签的style和class属性 (@lezongmin)
  * shanzhai'd Github T3T (@jiyinyiyong)
  * @jiyinyiyong 修改界面布局 fixed #139
  * 添加话题详情主要内容的行高 (@kerngven)
  * 增加POST提交时间间隔限制 (@leizongmin)
  * 中英文间用空格
  * 发帖页面优化
  * 文本框高度不要闪烁
  * use bootstrap 2; hide tags
  * see the demo of new UI
  * 搜索页面，如果回复时间过长，会产生断行的情况
  * unit test cases
  * #132 Add https:// validate on user.js cnodejs/nodeclub#132 (@meteormatt)
  * Add 0.10 for travis
  * fixed #107 update user links

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
