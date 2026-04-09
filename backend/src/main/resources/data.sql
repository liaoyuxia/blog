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

INSERT IGNORE INTO posts (
    id, slug, title, excerpt, content, cover, reading_time, recommended_for_zh, recommended_for_en,
    starter_recommended, homepage_selected, sort_weight, published_at, featured, status, category_id
) VALUES
    (
        1,
        'designing-a-calm-digital-garden',
        '个人博客首页的信息架构与视觉节奏设计',
        '围绕首屏定位、内容分层、精选区与阅读动线，梳理一个正式博客首页应该具备的核心结构。',
        '一个成熟的博客首页，不应该只是文章列表，而应该首先解决“身份、主题、入口”三个问题。\n\n首页首屏负责建立作者定位，精选文章负责传达内容重心，分类与标签承担快速浏览，而详情页与留言模块则分别承接深度阅读和互动反馈。\n\n当这些结构被放到同一个页面中时，视觉语言就不再只是装饰，而是在帮助读者理解站点的内容秩序。\n\n一个真正可长期运营的博客，往往先赢在结构，再赢在表达。',
        'linear-gradient(135deg, #0f3d3e 0%, #145c5f 55%, #f2b880 100%)',
        '6 分钟',
        '适合第一次了解整体结构',
        'Best if you want the overall structure first',
        true,
        false,
        90,
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
        '适合准备搭建后台时参考',
        'Useful when you are about to build the backend',
        true,
        true,
        80,
        '2026-03-18',
        false,
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
        '适合建立内容更新节奏',
        'A good starting point for editorial cadence',
        false,
        true,
        50,
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
        '适合优化首屏与阅读体验时参考',
        'Helpful when polishing the first screen and reading flow',
        true,
        false,
        70,
        '2026-02-24',
        false,
        'PUBLISHED',
        4
    );

UPDATE posts
SET
    recommended_for_zh = CASE id
        WHEN 1 THEN IFNULL(NULLIF(recommended_for_zh, ''), '适合第一次了解整体结构')
        WHEN 2 THEN IFNULL(NULLIF(recommended_for_zh, ''), '适合准备搭建后台时参考')
        WHEN 3 THEN IFNULL(NULLIF(recommended_for_zh, ''), '适合建立内容更新节奏')
        WHEN 4 THEN IFNULL(NULLIF(recommended_for_zh, ''), '适合优化首屏与阅读体验时参考')
        ELSE recommended_for_zh
    END,
    recommended_for_en = CASE id
        WHEN 1 THEN IFNULL(NULLIF(recommended_for_en, ''), 'Best if you want the overall structure first')
        WHEN 2 THEN IFNULL(NULLIF(recommended_for_en, ''), 'Useful when you are about to build the backend')
        WHEN 3 THEN IFNULL(NULLIF(recommended_for_en, ''), 'A good starting point for editorial cadence')
        WHEN 4 THEN IFNULL(NULLIF(recommended_for_en, ''), 'Helpful when polishing the first screen and reading flow')
        ELSE recommended_for_en
    END,
    starter_recommended = CASE id
        WHEN 1 THEN starter_recommended OR TRUE
        WHEN 2 THEN starter_recommended OR TRUE
        WHEN 4 THEN starter_recommended OR TRUE
        ELSE starter_recommended
    END,
    homepage_selected = CASE id
        WHEN 2 THEN homepage_selected OR TRUE
        WHEN 3 THEN homepage_selected OR TRUE
        ELSE homepage_selected
    END,
    sort_weight = CASE id
        WHEN 1 THEN IF(sort_weight = 0, 90, sort_weight)
        WHEN 2 THEN IF(sort_weight = 0, 80, sort_weight)
        WHEN 3 THEN IF(sort_weight = 0, 50, sort_weight)
        WHEN 4 THEN IF(sort_weight = 0, 70, sort_weight)
        ELSE sort_weight
    END
WHERE id IN (1, 2, 3, 4);

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
    hero_eyebrow_zh,
    hero_eyebrow_en,
    hero_title_zh,
    hero_title_en,
    hero_description_zh,
    hero_description_en,
    onboarding_title_zh,
    onboarding_title_en,
    onboarding_description_zh,
    onboarding_description_en,
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
    subscribe_title_zh,
    subscribe_title_en,
    subscribe_description_zh,
    subscribe_description_en,
    subscribe_link_label_zh,
    subscribe_link_label_en,
    subscribe_link_url,
    journal_title_zh,
    journal_title_en,
    journal_description_zh,
    journal_description_en,
    message_title_zh,
    message_title_en,
    message_description_zh,
    message_description_en,
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
    '内容系统 · 技术实践 · 阅读体验',
    'Content systems · Technical practice · Reading experience',
    '把内容站点做成可持续增长的产品',
    'Turn a content site into a product that keeps compounding',
    '这里整理内容架构、后台实现、阅读体验和持续运营方法，帮助你更快搭建、优化和迭代自己的内容站点。',
    'Find practical notes on content architecture, backend delivery, reading experience, and editorial operations so you can ship and improve your own content site faster.',
    '第一次来，建议从这几篇开始',
    'Start here if this is your first visit',
    '如果你想快速理解这个站点关注的问题和方法，这 3 篇最适合作为起点。',
    'These three articles give you the fastest path into the problems and methods this site focuses on.',
    '你能在这里获得什么',
    'What you can get from this site',
    '这里的内容重点不是展示，而是把从搭建到运营的关键方法拆清楚，方便你直接理解和参考。',
    'The focus here is not self-display. It is to break the important steps from setup to operations into usable patterns you can apply directly.',
    '核心内容方向',
    'Core content tracks',
    '搭建方法｜从信息架构、分类标签到后台字段设计，梳理完整搭建路径。\n优化经验｜从首屏理解、阅读动线到转化承接，持续沉淀可复用的体验方案。\n运营思路｜关注更新节奏、回访机制和内容效率，而不只停留在页面展示。',
    'Build systems｜Map the full setup path from information architecture and taxonomy to backend fields.\nExperience tuning｜Capture reusable interface patterns for first-screen clarity, reading flow, and conversion handoffs.\nEditorial operations｜Focus on publishing cadence, return loops, and content efficiency instead of surface polish alone.',
    '阅读路径',
    'Reading path',
    '先看新手导读，再按主题筛选、继续延伸阅读，最后通过更新提醒形成回访习惯。',
    'Start with the guided entry points, continue with topic-based browsing, and return later through a lightweight update reminder.',
    '有新内容时提醒我',
    'Let me know when something new is published',
    '如果你对内容系统、技术实践和阅读体验优化感兴趣，可以在更新时收到提醒。',
    'If you care about content systems, technical practice, and reading experience, you can get a lightweight update reminder when new work is published.',
    '查看订阅方式',
    'See subscription options',
    'mailto:hello@bingstudio.dev?subject=Bing%20Studio%20Updates',
    '文章与专题',
    'Articles and topics',
    '按主题浏览已经发布的内容，快速找到你当前最关心的问题。',
    'Browse published articles by theme and quickly find the question you care about most right now.',
    '交流与反馈',
    'Feedback and conversation',
    '如果你对内容结构、后台设计或阅读体验优化有问题，可以直接在这里交流。',
    'If you have questions about content structure, backend design, or reading experience improvements, you can leave them here directly.',
    'Bing Studio Blog',
    'Bing Studio Blog',
    'React + Spring Boot + MySQL',
    'React + Spring Boot + MySQL',
    0
);

UPDATE site_settings
SET
    hero_eyebrow_zh = IFNULL(NULLIF(hero_eyebrow_zh, ''), '内容系统 · 技术实践 · 阅读体验'),
    hero_eyebrow_en = IFNULL(NULLIF(hero_eyebrow_en, ''), 'Content systems · Technical practice · Reading experience'),
    hero_title_zh = IFNULL(NULLIF(hero_title_zh, ''), '把内容站点做成可持续增长的产品'),
    hero_title_en = IFNULL(NULLIF(hero_title_en, ''), 'Turn a content site into a product that keeps compounding'),
    hero_description_zh = IFNULL(NULLIF(hero_description_zh, ''), '这里整理内容架构、后台实现、阅读体验和持续运营方法，帮助你更快搭建、优化和迭代自己的内容站点。'),
    hero_description_en = IFNULL(NULLIF(hero_description_en, ''), 'Find practical notes on content architecture, backend delivery, reading experience, and editorial operations so you can ship and improve your own content site faster.'),
    onboarding_title_zh = IFNULL(NULLIF(onboarding_title_zh, ''), '第一次来，建议从这几篇开始'),
    onboarding_title_en = IFNULL(NULLIF(onboarding_title_en, ''), 'Start here if this is your first visit'),
    onboarding_description_zh = IFNULL(NULLIF(onboarding_description_zh, ''), '如果你想快速理解这个站点关注的问题和方法，这 3 篇最适合作为起点。'),
    onboarding_description_en = IFNULL(NULLIF(onboarding_description_en, ''), 'These three articles give you the fastest path into the problems and methods this site focuses on.'),
    home_about_title_zh = IFNULL(NULLIF(home_about_title_zh, ''), '你能在这里获得什么'),
    home_about_title_en = IFNULL(NULLIF(home_about_title_en, ''), 'What you can get from this site'),
    home_about_description_zh = IFNULL(NULLIF(home_about_description_zh, ''), '这里的内容重点不是展示，而是把从搭建到运营的关键方法拆清楚，方便你直接理解和参考。'),
    home_about_description_en = IFNULL(NULLIF(home_about_description_en, ''), 'The focus here is not self-display. It is to break the important steps from setup to operations into usable patterns you can apply directly.'),
    home_pillars_title_zh = IFNULL(NULLIF(home_pillars_title_zh, ''), '核心内容方向'),
    home_pillars_title_en = IFNULL(NULLIF(home_pillars_title_en, ''), 'Core content tracks'),
    home_pillars_zh = IFNULL(NULLIF(home_pillars_zh, ''), '搭建方法｜从信息架构、分类标签到后台字段设计，梳理完整搭建路径。\n优化经验｜从首屏理解、阅读动线到转化承接，持续沉淀可复用的体验方案。\n运营思路｜关注更新节奏、回访机制和内容效率，而不只停留在页面展示。'),
    home_pillars_en = IFNULL(NULLIF(home_pillars_en, ''), 'Build systems｜Map the full setup path from information architecture and taxonomy to backend fields.\nExperience tuning｜Capture reusable interface patterns for first-screen clarity, reading flow, and conversion handoffs.\nEditorial operations｜Focus on publishing cadence, return loops, and content efficiency instead of surface polish alone.'),
    home_journey_title_zh = IFNULL(NULLIF(home_journey_title_zh, ''), '阅读路径'),
    home_journey_title_en = IFNULL(NULLIF(home_journey_title_en, ''), 'Reading path'),
    home_journey_description_zh = IFNULL(NULLIF(home_journey_description_zh, ''), '先看新手导读，再按主题筛选、继续延伸阅读，最后通过更新提醒形成回访习惯。'),
    home_journey_description_en = IFNULL(NULLIF(home_journey_description_en, ''), 'Start with the guided entry points, continue with topic-based browsing, and return later through a lightweight update reminder.'),
    subscribe_title_zh = IFNULL(NULLIF(subscribe_title_zh, ''), '有新内容时提醒我'),
    subscribe_title_en = IFNULL(NULLIF(subscribe_title_en, ''), 'Let me know when something new is published'),
    subscribe_description_zh = IFNULL(NULLIF(subscribe_description_zh, ''), '如果你对内容系统、技术实践和阅读体验优化感兴趣，可以在更新时收到提醒。'),
    subscribe_description_en = IFNULL(NULLIF(subscribe_description_en, ''), 'If you care about content systems, technical practice, and reading experience, you can get a lightweight update reminder when new work is published.'),
    subscribe_link_label_zh = IFNULL(NULLIF(subscribe_link_label_zh, ''), '查看订阅方式'),
    subscribe_link_label_en = IFNULL(NULLIF(subscribe_link_label_en, ''), 'See subscription options'),
    subscribe_link_url = IFNULL(NULLIF(subscribe_link_url, ''), 'mailto:hello@bingstudio.dev?subject=Bing%20Studio%20Updates'),
    journal_title_zh = IFNULL(NULLIF(journal_title_zh, ''), '文章与专题'),
    journal_title_en = IFNULL(NULLIF(journal_title_en, ''), 'Articles and topics'),
    journal_description_zh = IFNULL(NULLIF(journal_description_zh, ''), '按主题浏览已经发布的内容，快速找到你当前最关心的问题。'),
    journal_description_en = IFNULL(NULLIF(journal_description_en, ''), 'Browse published articles by theme and quickly find the question you care about most right now.'),
    message_title_zh = IFNULL(NULLIF(message_title_zh, ''), '交流与反馈'),
    message_title_en = IFNULL(NULLIF(message_title_en, ''), 'Feedback and conversation'),
    message_description_zh = IFNULL(NULLIF(message_description_zh, ''), '如果你对内容结构、后台设计或阅读体验优化有问题，可以直接在这里交流。'),
    message_description_en = IFNULL(NULLIF(message_description_en, ''), 'If you have questions about content structure, backend design, or reading experience improvements, you can leave them here directly.')
WHERE id = 1;
