# AGENTS.md

## 作用

这份文件只记录当前项目独有的上下文，避免和全局 `AGENTS.md` 重复。

优先放这里的内容：

- 这个项目的运行前置条件
- 目录结构和关键入口
- 当前功能边界
- 容易踩坑、但知道后能显著提高效率的约定

机器级环境、通用工具链和通用文档约定，统一看全局文件：

- `/Users/liaowubing/.codex/AGENTS.md`

## 项目概况

这是一个前后端分离的个人博客项目。

- 后端：`Spring Boot 2.7 + Spring Data JPA + MySQL`
- 前端：`React 18 + Vite`
- 当前形态：博客前台 + 管理后台，共用同一个前端工程

目录分工：

- `backend`：后端服务、数据库初始化、管理员接口
- `frontend`：博客前台与 `/admin` 管理页

## 运行前置条件

### 数据库

后端启动依赖 MySQL，否则 Spring Boot 会在启动阶段直接失败。

当前默认连接配置：

- 数据库名：`lin_blog`
- 默认用户：`root`
- 默认密码：空

对应配置文件：

- `backend/src/main/resources/application.yml`

如果本机 MySQL 账号密码不是这组默认值，启动后端前需要显式传环境变量：

```bash
export DB_USERNAME=你的用户名
export DB_PASSWORD=你的密码
```

### 构建

后端建议始终使用项目内 Maven 仓库，避免依赖落到系统目录：

```bash
mvn -Dmaven.repo.local=.m2/repository -DskipTests package
```

这是当前项目特有的高频命令，能明显减少权限和环境差异带来的问题。

## 启动方式

### 后端

```bash
cd /Users/liaowubing/Documents/codex_workspace/demo/backend
mvn -Dmaven.repo.local=.m2/repository -DskipTests package
java -jar target/blog-backend-1.0.0.jar
```

健康检查：

```bash
curl http://localhost:8080/api/health
```

### 前端

```bash
cd /Users/liaowubing/Documents/codex_workspace/demo/frontend
npm run dev
```

访问地址：

- 前台：`http://localhost:5173`
- 后台：`http://localhost:5173/admin`

## 当前功能边界

### 前台

- 中英文切换
- 顶部展开式搜索
- 首页封面与文章推荐
- 文章归档排序与分页
- 独立文章详情页
- 点赞、评论、相关推荐、上一篇 / 下一篇
- 留言提交与留言展示
- 订阅说明页

### 后台

- 基于 `Spring Security` 的管理员鉴权
- 文章新建、编辑、删除
- 文章草稿、预览、首页置顶与首页推荐控制
- 正文图片上传与粘贴上传
- 留言查看、删除
- 评论查看、删除
- 站点设置维护

默认管理员账号仅用于本地开发验证：

- 用户名：`admin`
- 密码：`admin123456`

如果需要覆盖，使用环境变量：

```bash
export ADMIN_USERNAME=你的账号
export ADMIN_PASSWORD=你的密码
```

## 高效定位入口

### 后端关键文件

- `backend/src/main/java/com/linstudio/blog/config/SecurityConfig.java`
  管理员鉴权配置，后台接口是否可访问先看这里。
- `backend/src/main/java/com/linstudio/blog/controller/AdminController.java`
  后台文章和留言管理接口入口。
- `backend/src/main/java/com/linstudio/blog/service/PostService.java`
  文章查询和后台文章 CRUD 的核心逻辑。
- `backend/src/main/java/com/linstudio/blog/service/MessageService.java`
  留言查询、创建和后台删除逻辑。
- `backend/src/main/resources/application.yml`
  数据库、管理员账号密码等默认配置来源。
- `backend/src/main/resources/data.sql`
  初始化示例文章、分类、标签和留言数据。

### 前端关键文件

- `frontend/src/App.jsx`
  前台与后台路由入口，按路径切换页面。
- `frontend/src/BlogHome.jsx`
  博客前台主页面。
- `frontend/src/AdminApp.jsx`
  后台管理页。
- `frontend/src/ArticlePage.jsx`
  独立文章详情页。
- `frontend/src/BlogJournal.jsx`
  文章归档、留言页、订阅说明页。
- `frontend/src/utils/articleContent.js`
  正文解析逻辑，前台文章页和后台预览共用。
- `frontend/src/i18n.js`
  前后台中英文文案，以及示例内容的展示层翻译。
- `frontend/src/api/blog.js`
  所有前后端请求封装，包括管理员 Basic Auth。
- `frontend/src/styles.css`
  样式入口，真实样式已拆到 `frontend/src/styles/` 下。

## 当前高频注意点

- 后端只要连不上 MySQL，就不会启动成功；前端出现“没有任何返回”时，先查后端健康检查，不要先怀疑前端交互。
- 后台登录依赖 `/api/admin/session`、`/api/admin/posts`、`/api/admin/messages` 三个接口都能正常返回；不是只要账号密码对就一定能进。
- 前端 `/admin` 不是独立项目，而是同一个 React 应用里的管理页面；改样式时要注意不要误伤前台和后台共用类名。
- `frontend/src/i18n.js` 不只是按钮文字字典，还承担部分示例内容的前台展示翻译；改示例文章标题时要同时检查这里和 `data.sql`。
- 当前前台搜索已经移到顶栏，文章归档页只保留排序和分页，不再保留分类 / 主题筛选。

## 可复用逻辑

- 首页“文章推荐”不是手写排序，而是由后台文章配置控制：
  - 只展示前 `3` 篇
  - `首页置顶` 固定占第 `1` 篇，而且始终只保留 `1` 篇
  - 另外 `2` 篇由后台的 `首页推荐` 明确指定
  - `首页推荐` 最多只能选择 `2` 篇，避免首页出现不确定顺序
- 文章正文解析统一走 `frontend/src/utils/articleContent.js`：
  - 支持普通段落
  - 支持 `##` / `###` 标题
  - 支持列表
  - 支持 Markdown 图片
  - 前台文章页和后台预览共用同一套解析结果
- 后台文章编辑默认是“大弹框 + 编辑 / 预览切换”：
  - 默认进入编辑态
  - 点预览后只显示预览，不和编辑表单并排
  - `保存草稿` 留在当前编辑态
  - `发布文章 / 更新文章` 保存后返回列表
- 正文图片支持两种复用路径：
  - 手动上传
  - `Ctrl+V / Cmd+V` 粘贴上传
  最终都会插入 Markdown 图片语法
- 样式已经按页面拆分到 `frontend/src/styles/`，新增样式时优先放到对应页面文件，不要再把大段样式回写进入口文件。

## 开发验证约定

- 只要发生代码修改，默认都要做全流程验证，不能只停留在静态阅读或单点构建通过。
- 前端改动至少执行 `frontend` 下的 `npm run build`，后端改动至少执行 `backend` 下的 `mvn -Dmaven.repo.local=.m2/repository -DskipTests package`。
- 涉及接口、页面交互、路由、筛选、分页、表单、登录、上传、渲染结果等用户可见行为时，除了构建，还要做运行态验证。
- 需要页面验证时，优先使用 skill 浏览器能力进入页面实际检查；当前环境下优先使用 [$agent-browser](/Users/liaowubing/.codex/skills/agent-browser/SKILL.md) 做访问、点击、截图和结果确认。
- 如果因为环境原因无法完成某一层验证，需要在最终说明里明确写出“已验证什么、未验证什么、为什么未验证”。

## 数据库变更约定

- 只要修改涉及数据库结构、初始化数据或线上需要补的数据，除了更新项目代码，还必须额外生成一份单独的上线 SQL 文件。
- 这份 SQL 文件用于服务器上线时人工执行，不能只把变更留在 `schema.sql`、`data.sql` 或 Java 代码里。
- SQL 文件应放在项目内固定目录，建议使用 `docs/sql/`，并用日期或版本号命名，方便追溯和重复执行前检查。
- 最终说明里需要明确指出：
  - 本次是否涉及数据库变更
  - 对应 SQL 文件路径
  - 上线时是否需要执行这份 SQL

## 推荐排查顺序

### 后端起不来

1. 先看 MySQL 是否可用
2. 再看 `application.yml` 或环境变量里的数据库账号密码
3. 再看 `curl http://localhost:8080/api/health`

### 后台登录无响应

1. 先确认后端已重启到最新代码
2. 再测：

```bash
curl -i -u admin:admin123456 http://localhost:8080/api/admin/session
```

3. 如果这里不通，前端 `/admin` 一定不会正常

### 页面文案或样例内容不对

优先检查这两个位置是否同时更新：

- `backend/src/main/resources/data.sql`
- `frontend/src/i18n.js`
