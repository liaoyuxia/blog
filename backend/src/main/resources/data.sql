SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM post_tags;
DELETE FROM messages;
DELETE FROM posts;
DELETE FROM tags;
DELETE FROM categories;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categories (id, name, description) VALUES
    (1, '设计灵感', '关于个人品牌、视觉系统与博客气质的思考'),
    (2, '后端开发', 'Spring Boot、MySQL 与接口设计实践'),
    (3, '创作方法', '持续输出、写作系统与内容工作流'),
    (4, '前端体验', '界面审美、交互节奏与组件表达');

INSERT INTO tags (id, name) VALUES
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

INSERT INTO posts (id, slug, title, excerpt, content, cover, reading_time, published_at, featured, category_id) VALUES
    (
        1,
        'designing-a-calm-digital-garden',
        '设计一个有呼吸感的个人博客',
        '从版式、节奏、留白到信息层级，拆解一个能长期陪伴创作者的博客首页应该长成什么样。',
        '一个成熟的个人博客，不只是文章列表，而是一种长期输出的空间。\n\n首页要先回答三个问题：你是谁、你在写什么、读者为什么要继续往下看。\n\n正式版博客系统除了视觉表达，更重要的是把内容组织做清楚。精选文章用于建立第一印象，分类与标签负责帮助浏览，详情页承接深度阅读，而留言与联系模块则让站点真正形成互动。\n\n当设计气质和内容结构同时成立，博客就不再只是作品容器，而是一套持续生长的个人表达系统。',
        'linear-gradient(135deg, #0f3d3e 0%, #145c5f 55%, #f2b880 100%)',
        '6 分钟',
        '2026-03-12',
        true,
        1
    ),
    (
        2,
        'spring-boot-blog-architecture',
        '把个人博客升级成可继续开发的 Spring Boot 项目',
        '从实体建模、接口拆分、JPA 查询到初始化数据，整理一套适合个人博客演进的后端结构。',
        'Spring Boot 版本的博客后端，重点不只是“能跑起来”，而是后续能继续扩展。\n\n实体层负责定义文章、分类、标签和留言之间的关系；Repository 层负责数据读取；Service 层聚焦业务组合；Controller 层则只暴露清晰的接口边界。\n\n当搜索、分类筛选、标签筛选和留言提交都围绕同一套数据模型建立后，后续加后台管理、分页、鉴权和内容发布流就会顺畅很多。\n\n正式项目的价值，正在于它给未来留出了空间。',
        'linear-gradient(135deg, #183a5a 0%, #245c7a 50%, #9ed8db 100%)',
        '7 分钟',
        '2026-03-18',
        true,
        2
    ),
    (
        3,
        'content-workflow-that-keeps-moving',
        '个人写作系统，比灵感更重要的是节奏',
        '把选题池、速记卡片、成稿发布和复盘拆成四个动作，降低内容生产的心理门槛。',
        '长期更新博客，最大的敌人通常不是不会写，而是不知道从哪里开始。\n\n把写作过程拆成轻量环节之后，内容就不会卡在某一个节点上。灵感先简短记录，素材持续积累，成稿先完成 70 分版本，最后再回头精修节奏和结构。\n\n这套工作流同样适用于个人博客的内容运营：稳定比偶发爆发更重要。',
        'linear-gradient(135deg, #483c46 0%, #6b4c7b 45%, #d4a5a5 100%)',
        '4 分钟',
        '2026-03-01',
        false,
        3
    ),
    (
        4,
        'shipping-polished-react-blog-ui',
        '让 React 博客页面看起来像认真设计过',
        '从背景层、信息密度、动线和内容卡片入手，避免“后台模板”式的平庸视觉。',
        '一个正式版博客前端，不应该只把接口数据显示出来。\n\n页面需要先建立气质，再建立阅读节奏。比如首页 Hero 区负责传达个人定位，精选文章负责体现代表作，卡片列表承担信息浏览，而模态详情则照顾深度阅读。\n\n当颜色、字体、留白和动效都服务于内容时，整个博客才会显得有作者意识，而不是只有功能堆叠。',
        'linear-gradient(135deg, #5d2a42 0%, #fb6376 50%, #ffdccc 100%)',
        '5 分钟',
        '2026-02-24',
        false,
        4
    );

INSERT INTO post_tags (post_id, tag_id) VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 4), (2, 5), (2, 6),
    (3, 7), (3, 8), (3, 9),
    (4, 10), (4, 11), (4, 12);

INSERT INTO messages (id, name, email, content, created_at) VALUES
    (1, 'Lina', 'lina@example.com', '新版结构很清晰，已经有正式项目的样子了。', '2026-03-28 09:30:00'),
    (2, 'Martin', 'martin@example.com', '如果后面补一个后台发布页，这个项目就很完整了。', '2026-03-26 18:12:00');
