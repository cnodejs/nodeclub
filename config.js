/**
 * config
 */

var path = require('path');

exports.config = {
  debug: true,
  name: '实验室',
  description: '专注于数据分析展示',
  version: '0.2.2',

  // site settings
  site_headers: [
    '<meta name="author" content="sunxiang@JIUQI" />',
  ],
  host: 'localhost',
  site_logo: '', // default is `name`
  site_navs: [
    // [ path, title, [target=''] ]
    [ '/about', '关于' ],
  ],
  site_static_host: '', // 静态文件存储域名
  site_enable_search_preview: false, // 开启google search preview
  site_google_search_domain:  'microacup.tk',  // google search preview中要搜索的域名

  upload_dir: path.join(__dirname, 'public', 'user_data', 'images'),

  db: 'mongodb://127.0.0.1/node_club_dev',
  session_secret: 'node_club',
  auth_cookie_name: 'node_club',
  port: 3000,

  // 话题列表显示的话题数量
  list_topic_count: 20,

  // RSS
  rss: {
    title: 'CNode：Node.js专业中文社区',
    link: 'http://microacup.tk',
    language: 'zh-cn',
    description: '实验室：基于Node.js的中文社区',

    //最多获取的RSS Item数量
    max_rss_items: 50
  },
 
  // site links
  site_links: [
    {
      'text': 'Node 官方网站',
      'url': 'http://nodejs.org/'
    },
    {
      'text': 'Node Party',
      'url': 'http://party.cnodejs.net/'
    },
    {
      'text': 'Node 入门',
      'url': 'http://nodebeginner.org/index-zh-cn.html'
    },
    {
      'text': 'Node 中文文档',
      'url': 'http://docs.cnodejs.net/cman/'
    }
  ],

  // sidebar ads
  side_ads: [
  ],

  // mail SMTP
  mail_opts: {
    host: 'smtp.126.com',
    port: 25,
    auth: {
      user: 'club@126.com',
      pass: 'club'
    }
  },

  //weibo app key
  weibo_key: 10000000,

  // admin 可删除话题，编辑标签，设某人为达人
  admins: { admin: true },

  // [ { name: 'plugin_name', options: { ... }, ... ]
  plugins: [
    // { name: 'onehost', options: { host: 'localhost.cnodejs.org' } },
    // { name: 'wordpress_redirect', options: {} }
  ]
};
