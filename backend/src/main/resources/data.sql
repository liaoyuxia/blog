INSERT IGNORE INTO categories (id, name, description) VALUES
    (1, '设计灵感', '关于个人品牌、视觉系统与博客气质的思考'),
    (2, '后端开发', 'Spring Boot、MySQL 与接口设计实践'),
    (3, '创作方法', '持续输出、写作系统与内容工作流'),
    (4, '前端体验', '界面审美、交互节奏与组件表达');

INSERT IGNORE INTO tags (id, name) VALUES
    (1, 'UI'),
    (2, '品牌感'),
    (3, '博客设计'),
    (4, 'Spring Boot'),
    (5, 'MySQL'),
    (6, '工程化'),
    (7, '写作'),
    (8, '效率'),
    (9, '内容策略'),
    (10, 'React'),
    (11, '交互'),
    (12, '视觉设计');

INSERT IGNORE INTO posts (id, slug, title, excerpt, content, cover, reading_time, published_at, featured, status, category_id) VALUES
    (
        1,
        'designing-a-calm-digital-garden',
        '个人博客首页的信息架构与视觉节奏设计',
        '围绕首屏定位、内容分层、精选区与阅读动线，梳理一个正式博客首页应该具备的核心结构。',
        '一个成熟的博客首页，不应该只是文章列表，而应该首先解决“身份、主题、入口”三个问题。\n\n首页首屏负责建立作者定位，精选文章负责传达内容重心，分类与标签承担快速浏览，而详情页与留言模块则分别承接深度阅读和互动反馈。\n\n当这些结构被放到同一个页面中时，视觉语言就不再只是装饰，而是在帮助读者理解站点的内容秩序。\n\n一个真正可长期运营的博客，往往先赢在结构，再赢在表达。',
        'linear-gradient(135deg, #0f3d3e 0%, #145c5f 55%, #f2b880 100%)',
        '6 分钟',
        '2026-03-12',
        true,
        'PUBLISHED',
        1
    ),
    (
        2,
        'spring-boot-blog-architecture',
        '基于 Spring Boot 的个人博客后端架构实践',
        '从领域建模、接口拆分到查询策略，整理一套适合持续演进的博客后端结构。',
        'Spring Boot 博客后端的价值，不在于能否快速启动，而在于是否具备持续演进的结构基础。\n\n文章、分类、标签与留言应被视为同一个内容域中的核心对象，Repository 聚焦数据访问，Service 负责业务组合，Controller 则保持清晰的接口边界。\n\n当搜索、筛选、详情查询与留言提交共享统一的数据模型后，分页、后台管理、鉴权与发布工作流都会更容易接入。\n\n所谓正式项目，往往不是功能更多，而是变化来临时结构依然清楚。',
        'linear-gradient(135deg, #183a5a 0%, #245c7a 50%, #9ed8db 100%)',
        '7 分钟',
        '2026-03-18',
        true,
        'PUBLISHED',
        2
    ),
    (
        3,
        'content-workflow-that-keeps-moving',
        '建立可持续写作系统的四个关键环节',
        '把选题池、速记笔记、成稿发布与复盘整理拆成四个动作，降低长期输出的阻力。',
        '持续写作最大的阻碍，通常不是表达能力，而是流程过重。\n\n将内容生产拆成选题收集、素材记录、草稿整理与发布复盘四个环节之后，每一步的启动成本都会明显下降。\n\n这意味着内容不必一次完成，而可以在更轻的节奏中持续推进。\n\n对于个人博客来说，长期稳定的更新系统，往往比偶发的高强度冲刺更有价值。',
        'linear-gradient(135deg, #483c46 0%, #6b4c7b 45%, #d4a5a5 100%)',
        '4 分钟',
        '2026-03-01',
        false,
        'PUBLISHED',
        3
    ),
    (
        4,
        'shipping-polished-react-blog-ui',
        'React 博客前端的阅读体验与组件组织',
        '从视觉层级、信息密度与交互入口出发，整理一个更接近正式环境的博客前端页面。',
        '一个正式博客前端的目标，不只是把接口数据显示出来，而是让内容更容易被理解与阅读。\n\n首页需要先建立作者定位，再建立浏览路径：首屏说明是谁在写，精选内容突出重点，列表区支持扫描式阅读，详情层则承接更长的正文。\n\n当颜色、排版、留白与交互共同服务于阅读时，界面才会呈现出稳定的作者意识。\n\n真正耐看的博客页面，通常不是特效更多，而是内容更容易进入。',
        'linear-gradient(135deg, #5d2a42 0%, #fb6376 50%, #ffdccc 100%)',
        '5 分钟',
        '2026-02-24',
        false,
        'PUBLISHED',
        4
    );

INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 4), (2, 5), (2, 6),
    (3, 7), (3, 8), (3, 9),
    (4, 10), (4, 11), (4, 12);

INSERT IGNORE INTO messages (id, name, email, content, created_at) VALUES
    (1, 'Lina', 'lina@example.com', '当前结构已经比较清晰，继续补齐后台能力后会更接近正式项目形态。', '2026-03-28 09:30:00'),
    (2, 'Martin', 'martin@example.com', '如果把发布管理和状态管理一并补上，这个博客系统的闭环会完整很多。', '2026-03-26 18:12:00');

INSERT IGNORE INTO post_comments (id, post_id, name, email, content, created_at) VALUES
    (1, 1, 'Jade', 'jade@example.com', '首页结构比单纯堆文章更清晰，特别适合长期经营个人博客。', '2026-03-29 10:18:00'),
    (2, 2, 'Leo', 'leo@example.com', '后端分层的解释很清楚，如果后面再补上草稿流会更完整。', '2026-03-30 21:06:00');

INSERT IGNORE INTO site_settings (
    id,
    brand_name,
    avatar_url,
    role_zh,
    role_en,
    bio_zh,
    bio_en,
    location_zh,
    location_en,
    email,
    specialties_zh,
    specialties_en,
    home_about_title_zh,
    home_about_title_en,
    home_about_description_zh,
    home_about_description_en,
    home_pillars_title_zh,
    home_pillars_title_en,
    home_pillars_zh,
    home_pillars_en,
    home_journey_title_zh,
    home_journey_title_en,
    home_journey_description_zh,
    home_journey_description_en,
    footer_product_zh,
    footer_product_en,
    footer_stack_zh,
    footer_stack_en,
    visit_count
) VALUES (
    1,
    'Bing Studio',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    '独立开发者 / 内容系统设计实践者',
    'Independent developer / content system practitioner',
    '围绕个人博客、内容平台与前端体验，记录一个正式项目从信息架构到工程落地的过程。',
    'A running record of personal blog architecture, backend implementation, frontend experience, and sustainable publishing workflows.',
    '中国·上海',
    'Shanghai, China',
    'hello@bingstudio.dev',
    '个人博客信息架构\nSpring Boot 内容后台\nReact 阅读体验设计',
    'Personal blog information architecture\nSpring Boot publishing backend\nReact reading experience design',
    '一个更像作品封面的首页',
    'A homepage designed like a cover',
    '首页更像博客封面，负责建立作者气质和阅读入口，完整文章浏览则集中在文章归档中。',
    'The homepage behaves more like a cover: it sets the tone first, then hands deeper reading over to the archive.',
    '首页保留的内容',
    'What stays on the homepage',
    '作者身份、博客气质与整体方向\n精选文章预告与站点状态信号\n即时搜索入口与搜索结果展开区\n跳转到文章归档继续阅读与留言',
    'Author identity, tone, and editorial framing\nFeatured story previews and site pulse\nInstant search with in-place result expansion\nClear entry points into the article archive',
    '阅读路径',
    'Reading flow',
    '先在首页建立兴趣，再进入文章归档阅读、筛选主题或留下反馈，首页与归档页的职责会更清晰。',
    'Start on the homepage, then move into the article archive for browsing, filtering, and reader feedback.',
    'Bing Studio Blog',
    'Bing Studio Blog',
    'React + Spring Boot + MySQL',
    'React + Spring Boot + MySQL',
    0
);
