/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var path = require('path');

exports.config = {
  debug: true,
  name: 'Node.js Taiwan',
  description: 'nodeJS 台灣社群，由一群熱心開發者聚集而成，主力在於蒐集及建立nodeJS 相關中文資訊，提供最佳的學習管道，讓更多人體會javascript 的好處。 nodeJS Taiwan group. We are a group of people who love nodejs. There are collect nodejs tutorial in Chinese about...',
  version: '0.2.2',
  genSalt: 10,
    // site settings
  site_headers: [
    '<meta name="author" content="admin@nodejs.tw" />'
  ],
  host: 'localhost',
  site_logo: '', // default is `name`
  site_navs: [
    // [ path, title, [target=''] ]
    [ '/about', '關於' ],
    [ '/job', '工作' ],
    [ '/announcement', '公告' ]
  ],
  site_static_host: '', // 静态文件存储域名
  site_enable_search_preview: false, // 开启google search preview
  site_google_search_domain:  'nodejs.tw',  // google search preview中要搜索的域名

  upload_dir: path.join(__dirname, 'public', 'user_data', 'images'),

  db: 'mongodb://127.0.0.1/node_club_dev',
  session_secret: 'node_club',
  auth_cookie_name: 'node_club',
  port: 3000,

  // 话题列表显示的话题数量
  list_topic_count: 20,

  // RSS
  rss: {
    title: 'Node.js Taiwan',
    link: 'http://nodejs.tw',
    language: 'zh-tw',
    description: 'nodeJS 台灣社群，由一群熱心開發者聚集而成，主力在於蒐集及建立nodeJS 相關中文資訊，提供最佳的學習管道，讓更多人體會javascript 的好處。 nodeJS Taiwan group. We are a group of people who love nodejs. There are collect nodejs tutorial in Chinese about...',

    //最多获取的RSS Item数量
    max_rss_items: 50
  },

  // site links
  site_links: [
    {
      'text': 'Node 官方網站',
      'url': 'http://nodejs.org/'
    },
    {
      'text': 'Node.js 台灣社群協作電子書',
      'url': 'http://book.nodejs.tw/'
    }
  ],

  // sidebar ads
  side_ads: [
  ],

  // mail SMTP
  mail_port: 25,
  mail_user: 'club',
  mail_pass: 'club',
  mail_host: 'smtp.126.com',
  mail_sender: 'club@126.com',
  mail_use_authentication: true,

  //weibo app key
  weibo_key: 10000000,

  // admin 可删除话题，编辑标签，设某人为达人
  admins: { admin: true },

  // [ { name: 'plugin_name', options: { ... }, ... ]
  plugins: [
  // { name: 'onehost', options: { host: 'localhost.cnodejs.org' } },
  // { name: 'wordpress_redirect', options: {} }
  ],

  // Facebook
  facebook: {
    api_key: 'your api key',
    secret: 'your secret',
    redirect: 'http://localhost:3000/facebook/redirect'
  }
};
