/**
 * 另一个落地页主题
 */
const CONFIG = {
  PROXIO_WELCOME_COVER_ENABLE: false, //是否显示页面进入的欢迎文字
  PROXIO_WELCOME_TEXT: '欢迎来到此网站，点击任意位置进入', // 欢迎文字，留空则不启用
  PROXIO_CURSOR_DOT_ENABLE: false, // 鼠标跟随圆点效果开关

  // 英雄区块导航
  PROXIO_HERO_ENABLE: true, // 开启英雄区
  PROXIO_HERO_TITLE_1: '肤动能FawnPower', // 英雄区文字
  PROXIO_HERO_TITLE_2: '射频抗衰新宠 风靡明星圈的抗衰答案', // 英雄区文字
  // 英雄区两个按钮，如果TEXT留空则隐藏按钮
  PROXIO_HERO_BUTTON_1_TEXT: '中国区官网', // 英雄区按钮
  PROXIO_HERO_BUTTON_1_URL: 'http://wwww.xiaolumed.com', // 英雄区按钮
  PROXIO_HERO_BUTTON_2_TEXT: '了解射频抗衰原理', // 英雄区按钮
  PROXIO_HERO_BUTTON_2_URL: '/article/RFkangshai', // 英雄区按钮
  PROXIO_HERO_BUTTON_2_ICON: '/images/starter/github-mark.svg', // 英雄区按钮2的图标，不需要则留空

  // 英雄区配图，如需隐藏，改为空值即可 ''
  PROXIO_HERO_BANNER_IMAGE: '', // hero区背景，默认是获取Notion背景，如需另外配置图片可以填写在这里
  PROXIO_HERO_BANNER_IFRAME_URL: '', // hero背景区内嵌背景网页 ，可以配置一个网页地址，例如动画网页https://my.spline.design/untitled-b0c6e886227646c34afc82cdc6de4ca2/

  // 文章区块
  PROXIO_BLOG_ENABLE: true, // 首页博文区块开关
  PROXIO_BLOG_TITLE: 'SHOWLOOK NEWS',
  PROXIO_BLOG_COUNT: 4, // 首页博文区块展示前4篇文章
  PROXIO_BLOG_TEXT_1: 'SHOWLOOK最新动态',

  // 区块默认内容显示文章的summary文本，但也支持用自定义图片或logo德国替换掉占位显示内容
  PROXIO_BLOG_PLACEHOLDER_IMG_URL_1: '', // 填写要替换成的图片，支持图床或直接上传到项目中，示例  /images/feature-1.webp
  PROXIO_BLOG_PLACEHOLDER_IMG_URL_2: '',
  PROXIO_BLOG_PLACEHOLDER_IMG_URL_3: '',
  PROXIO_BLOG_PLACEHOLDER_IMG_URL_4: '',

  PROXIO_ANNOUNCEMENT_ENABLE: false, //公告文字区块

  // 特性区块
  PROXIO_FEATURE_ENABLE: true, // 特性区块开关
  PROXIO_FEATURE_TITLE: '把每一次选择，交给更清晰的记录',
  PROXIO_FEATURE_TEXT_1: '把体验写成证据',
  PROXIO_FEATURE_TEXT_2: '不夸张、不滤镜，整理真实感受、公开反馈与对比过程',

  // 特性1
  PROXIO_FEATURE_1_ICON_CLASS: 'fa-solid fa-stopwatch', // fas图标
  PROXIO_FEATURE_1_ICON_IMG_URL: '', // 图片图标选填，默认是fas图标，如果需要图片图标可以填写图片地址，示例/avatar.png
  PROXIO_FEATURE_1_TITLE_1: '顾客体验',
  PROXIO_FEATURE_1_TEXT_1: '到店流程与当次体感，一次一页。',

  PROXIO_FEATURE_2_ICON_CLASS: 'fa-solid fa-comments',
  PROXIO_FEATURE_2_ICON_IMG_URL: '',
  PROXIO_FEATURE_2_TITLE_1: '用户反馈',
  PROXIO_FEATURE_2_TEXT_1: '用户发来的回访与私信，精选归档呈现。',

  PROXIO_FEATURE_3_ICON_CLASS: 'fa-solid fa-search',
  PROXIO_FEATURE_3_ICON_IMG_URL: '',
  PROXIO_FEATURE_3_TITLE_1: '案例/对比/过程记录',
  PROXIO_FEATURE_3_TEXT_1: '统一标准拍摄，时间轴复盘变化。',

  PROXIO_FEATURE_BUTTON_TEXT: '查看全部记录', // 按钮文字
  PROXIO_FEATURE_BUTTON_URL: '/category/真人体验', // 按钮跳转

  // 首页生涯区块
  PROXIO_CAREER_ENABLE: true, // 区块开关
  PROXIO_CAREER_TITLE: '热玛吉Thermage低价平替方案',
  PROXIO_CAREER_TEXT: '肤动能FawnPower FP01入坑指南',

  // 生涯内容卡牌 ，title是标题 ，bio是备注，text是详情
  PROXIO_CAREERS: [
    {
      title: '认识她',
      bio: '把好奇变成清晰',
      text: '抗衰不是一场冲刺，更像一次缓慢但有方向的整理。射频的意义，在于以温和、可控的射频热效应唤醒皮肤深层的支撑逻辑，让胶原在时间里收缩、重排、再生。先理解“它能做什么”，也理解“它不会承诺什么”，你就不会被情绪带着走，而能把选择握在手里。'
    },
    {
      title: '体验她',
      bio: '把感觉变成感受',
      text: '第一次到店，别急着追结论。把诉求说清楚，把部位选清楚，把对比照拍清楚——同光线、同角度、同表情。热感、痛感、即时紧致感，都不是答案本身，它们只是你与皮肤对话的第一句。真正重要的是：让每一次体验都能被记录、被比较、被复盘。'
    },
    {
      title: '感受她',
      bio: '把变化交给时间',
      text: '术后不需要“用力”，只需要“温柔而坚定”：保湿、防晒、避免刺激与高温，把皮肤的节奏还给皮肤。之后你会发现，真正可贵的不是某一刻的惊喜，而是轮廓线慢慢变得利落、质地慢慢变得细腻——那种从容，是你自己一点点养出来的。'
    }
  ],

  // 首页用户测评区块
  PROXIO_TESTIMONIALS_ENABLE: false, // 测评区块开关
  PROXIO_TESTIMONIALS_TITLE: '用户反馈',
  PROXIO_TESTIMONIALS_TEXT_1: '我们的用户怎么说',
  PROXIO_TESTIMONIALS_TEXT_2:
    '数千位站长选择用ShowlookFans搭建他们的网站,通过帮助手册、交流社群以及技术咨询，大家成功上线了自己的网站',

  // 用户测评处的跳转按钮
  PROXIO_TESTIMONIALS_BUTTON_URL: '/about',
  PROXIO_TESTIMONIALS_BUTTON_TEXT: '联系我',

  // 这里不支持CONFIG和环境变量，需要一一修改此处代码。
  PROXIO_TESTIMONIALS_ITEMS: [
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '感谢大佬的方法。之前尝试过Super、Potion等国外的第三方平台，实现效果一般，个性化程度远不如这个方法，已经用起来了！ ',
      PROXIO_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F22de3fcb-d90d-4271-bc01-f815f476122b%2F4FE0A0C0-E487-4C74-BF8E-6F01A27461B8-14186-000008094BC289A6.jpg?table=collection&id=a320a2cc-6ebe-4a8d-95cc-ea94e63bced9&width=200',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'Ryan_G',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'Ryan`Log 站长',
      PROXIO_TESTIMONIALS_ITEM_URL: 'https://blog.gaoran.xyz/'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '很喜欢这个主题，本代码小白用三天台风假期搭建出来了，还根据大佬的教程弄了自定义域名，十分感谢，已请喝咖啡~',
      PROXIO_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F0d33d169-f932-41ff-ac6b-88a923c08e02%2F%25E5%25A4%25B4%25E5%2583%258F.jfif?table=collection&id=7787658d-d5c0-4f34-8e32-60c523dfaba3&width=400',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'Asenkits',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: '阿森的百宝袋 站长',
      PROXIO_TESTIMONIALS_ITEM_URL: 'https://asenkits.top/'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '呜呜呜，经过一个下午的努力，终于把博客部署好啦，非常感谢Tangly1024大佬的框架和教程，这是我有生之年用过的最好用的博客框架┭┮﹏┭┮。从今之后，我就可以在自己的博客里bb啦，( •̀ ω •́ )y ',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: '/avatar.png',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'DWIND',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: '且听风吟 站长',
      PROXIO_TESTIMONIALS_ITEM_URL: 'https://www.dwind.top/'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '感谢提供这么好的项目哈哈 之前一直不知道怎么部署(别的项目好难好复杂)这个相对非常简单 新手非常友好哦',
      PROXIO_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fd52f6766-3e32-4c3d-8529-46e1f214360f%2Ffavicon.svg?table=collection&id=7d76aad5-a2c4-4d9a-887c-c7913fae4eed&width=400',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: '迪升disheng ',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'AI资源分享 Blog',
      PROXIO_TESTIMONIALS_ITEM_URL: 'https://blog.disheng.org/'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '灰常感谢大佬的博客项目，能将博客和notion结合起来，这一直是我挺期待的博客模式。',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: '/avatar.png',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'AnJhon',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'Anjhon`s Blog 站长',
      PROXIO_TESTIMONIALS_ITEM_URL: 'https://www.anjhon.top'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT: '用好久了，太感谢了',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: '/avatar.png',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'LUCEN',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'LUCEN考验辅导 站长',
      PROXIO_TESTIMONIALS_ITEM_URL: 'https://www.lucenczz.top/'
    }
  ],

  //   FAQ 常见问题模块
  PROXIO_FAQ_ENABLE: false, // 常见问题模块开关
  PROXIO_FAQ_TITLE: '常见问题解答',
  PROXIO_FAQ_TEXT_1: '有任何问题吗？请看这里',
  PROXIO_FAQ_TEXT_2: '我们收集了常见的用户疑问',
  PROXIO_FAQS: [
    {
      q: 'ShowlookFans有帮助文档吗？',
      a: 'ShowlookFans提供了<a href="https://xiaolu.love" className="underline">帮助文档</a>，操作<a href="https://www.bilibili.com/video/BV1fM4y1L7Qi/" className="underline">演示视频</a>，以及<a href="https://xiaolu.love" className="underline">交流社群</a>来协助您完成网站的搭建部署'
    },
    {
      q: '部署后要如何编写文章？',
      a: '您可以在Notion中之间添加或修改类型为Post的页面，内容将被实时同步在站点中，详情参考<a className="underline" href="https://xiaolu.love">《帮助文档》</a>'
    },
    {
      q: '站点部署失败，更新失败？',
      a: '通常是配置修改错误导致，请检查配置或者重试操作步骤，或者通过Vercel后台的Deployments中找到错误日志，并向网友求助'
    },
    {
      q: '文章没有实时同步？',
      a: '先检查Notion_Page_ID是否正确配置，其次由于博客的每个页面都有独立缓存，刷新网页后即可解决'
    }
  ],

  // 关于作者区块
  PROXIO_ABOUT_ENABLE: true, // 关于作者区块区块开关
  PROXIO_ABOUT_TITLE: '射频抗衰新答案',
  PROXIO_ABOUT_TEXT_1: 'FawnPower肤动能 FP01',
  PROXIO_ABOUT_TEXT_2:
    '肤动能(FawnPower FP01)通过温和热效应刺激胶原蛋白收缩与新生，从肌底重构胶原支架。得益于重新架构的高效射频方案，成本较热玛吉大幅降低，目前已在亚洲多个城市，成为大家优选的热玛吉低价平替方案。',
  PROXIO_ABOUT_PHOTO_URL: 'https://gitee.com/jz391/img-host/raw/master/avat-cg3.webp',
  PROXIO_ABOUT_KEY_1: '核心频段',
  PROXIO_ABOUT_VAL_1: '6.78MHZ',
  PROXIO_ABOUT_KEY_2: '单次时长',
  PROXIO_ABOUT_VAL_2: '60-90min',
  PROXIO_ABOUT_KEY_3: '适应部位',
  PROXIO_ABOUT_VAL_3: '6+',
  PROXIO_ABOUT_KEY_4: '恢复期',
  PROXIO_ABOUT_VAL_4: '0天',

  PROXIO_ABOUT_BUTTON_URL: '/about',
  PROXIO_ABOUT_BUTTON_TEXT: '详细了解 Showlook肤动能',

  // 横向滚动文字
  PROXIO_BRANDS_ENABLE: false, // 滚动文字
  PROXIO_BRANDS: [
    'Web Design',
    'Logo Design',
    'Mobile App Design',
    'Product Design'
  ],

  PROXIO_FOOTER_SLOGAN: '我们通过技术为品牌和公司创造数字体验。',

  // 页脚三列菜单组
  // 页脚菜单
  PROXIO_FOOTER_LINKS: [
    {
      name: '友情链接',
      menus: [
        {
          title: 'SHOWLOOK中国',
          href: 'https://showlook.pro',
        },
        {
          title: '医美315',
          href: 'https://yimei315.com',
        },
       {
          title: '中国卫健委',
          href: 'https://www.nhc.gov.cn',
        }
      ]
    },
    {
      name: 'SHOWLOOK小鹿医疗',
      menus: [
        { title: 'SHOWLOOK品牌介绍', href: '/article/showlook' },
        {
          title: 'FawnPower肤动能 FP01',
          href: '/article/FP01',
        },
        {
          title: '顾客体验',
          href: '/tag/%E9%A1%BE%E5%AE%A2%E4%BD%93%E9%AA%8C'
        },
        {
          title: '案例/对比/记录',
          href: '/tag/%E6%A1%88%E4%BE%8B%2F%E5%AF%B9%E6%AF%94%2F%E8%BF%87%E7%A8%8B%E8%AE%B0%E5%BD%95'
        },
        {
          title: '相关报道',
          href: '/tag/%E5%AA%92%E4%BD%93%E6%91%98%E8%A6%81',
        }
      ]
    }
  ],

  PROXIO_FOOTER_BLOG_LATEST_TITLE: '最新文章',

  PROXIO_FOOTER_PRIVACY_POLICY_TEXT: '隐私政策',
  PROXIO_FOOTER_PRIVACY_POLICY_URL: '/privacy-policy',

  PROXIO_FOOTER_PRIVACY_LEGAL_NOTICE_TEXT: '法律声明',
  PROXIO_FOOTER_PRIVACY_LEGAL_NOTICE_URL: '/legacy-notice',

  PROXIO_FOOTER_PRIVACY_TERMS_OF_SERVICE_TEXT: '服务协议',
  PROXIO_FOOTER_PRIVACY_TERMS_OF_SERVICE_URL: '/terms-of-use',

  // 404页面的提示语
  PROXIO_404_TITLE: '我们似乎找不到您要找的页面。',
  PROXIO_404_TEXT: '抱歉！您要查找的页面不存在。可能已经移动或删除。',
  PROXIO_404_BACK: '回到主页',

  // 页面底部的行动呼吁模块
  PROXIO_CTA_ENABLE: true,
  PROXIO_CTA_TITLE: '让合适的项目，遇见合适的机构',
  PROXIO_CTA_TITLE_2: '获取FP01引进方案',
  PROXIO_CTA_DESCRIPTION:
    '如果有意引进FawnPower FP01，可点击下方按钮联系SHOWLOOK市场专员。他们将提供产品资料、培训与交付流程说明',
  PROXIO_CTA_BUTTON: true, // 是否显示按钮
  PROXIO_CTA_BUTTON_URL: '/BM',
  PROXIO_CTA_BUTTON_TEXT: '与SHOWLOOK市场专员聊一聊',

  PROXIO_POST_REDIRECT_ENABLE: true, // 默認開啟重定向
  PROXIO_POST_REDIRECT_URL: 'https://xiaolu.love',// 重定向域名
  PROXIO_NEWSLETTER: process.env.NEXT_PUBLIC_THEME_PROXIO_NEWSLETTER || false // 是否开启邮件订阅 请先配置mailchimp功能 https://xiaolu.love
}
export default CONFIG
