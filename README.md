# Bing Studio 博客

这是一个前后端分离的个人博客项目，当前已经从“演示骨架”收成了可继续演进的正式版本。

- 前端：`React 18 + Vite`
- 后端：`Spring Boot 2.7 + Spring Data JPA + MySQL`
- 形态：前台博客 + `/admin` 管理后台，共用同一个前端工程

## 当前功能

### 前台

- 首页品牌封面、交互式像素猫视觉、推荐文章区
- 顶栏即时搜索
- 独立文章详情页，不再使用弹层阅读
- 文章正文分段渲染，支持标题、列表、图片和目录
- 文章点赞 / 取消点赞
- 相关推荐、上一篇 / 下一篇、订阅入口
- 文章归档页排序：`最新发布 / 最受欢迎 / 适合新读者`
- 文章列表分页，支持每页 `10 / 20`
- 留言页独立展示，留言列表分页，支持每页 `10 / 20`
- 中英文切换

### 后台

- 基于 `Spring Security` 的管理员鉴权
- 文章列表搜索、筛选、状态展示、首页推荐控制
- 大尺寸文章编辑弹框
- 编辑 / 预览切换
- 草稿保存、发布、更新、删除
- 正文图片上传
- 支持直接 `Ctrl+V / Cmd+V` 粘贴图片到正文，自动插入 Markdown 图片语法
- 站点设置维护
- 留言与评论管理

## 内容控制规则

### 首页文章推荐

首页“文章推荐”区域由后台文章配置直接控制：

- 固定展示 `3` 篇
- `首页置顶` 固定占第 `1` 篇，而且始终只保留 `1` 篇
- 另外 `2` 篇由后台的 `首页推荐` 直接指定
- `首页推荐` 最多只能选择 `2` 篇，避免首页出现不确定顺序

对应后台字段：

- `设为首页置顶`
- `设为首页推荐`

## 项目结构

```text
demo
├── backend
│   ├── src/main/java/com/linstudio/blog
│   └── src/main/resources
├── docs/product
└── frontend
    └── src
```

### 关键目录

- `backend`：接口、鉴权、分页、文章与留言服务
- `frontend/src`：前台页面、后台页面、请求封装与样式
- `frontend/src/styles`：按页面拆分后的样式文件
- `docs/product`：产品文档和实现清单

## 前端关键入口

- [frontend/src/App.jsx](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/App.jsx)
  路由入口，负责首页、文章归档、独立文章页和后台切换
- [frontend/src/BlogHome.jsx](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/BlogHome.jsx)
  首页
- [frontend/src/BlogJournal.jsx](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/BlogJournal.jsx)
  文章归档、留言页、订阅说明页
- [frontend/src/ArticlePage.jsx](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/ArticlePage.jsx)
  独立文章详情页
- [frontend/src/AdminApp.jsx](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/AdminApp.jsx)
  后台管理页
- [frontend/src/utils/articleContent.js](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/utils/articleContent.js)
  正文解析逻辑，负责把 Markdown 风格内容转换成前台和后台预览共用的结构

## 样式拆分

样式已经按页面拆分，不再集中在一个超大文件里：

- [frontend/src/styles/common.css](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/styles/common.css)
- [frontend/src/styles/home.css](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/styles/home.css)
- [frontend/src/styles/journal.css](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/styles/journal.css)
- [frontend/src/styles/article.css](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/styles/article.css)
- [frontend/src/styles/admin-base.css](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/styles/admin-base.css)
- [frontend/src/styles/admin-editor.css](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/styles/admin-editor.css)

统一入口：

- [frontend/src/styles.css](/Users/liaowubing/Documents/codex_workspace/demo/frontend/src/styles.css)

## 运行前准备

### MySQL

先创建数据库：

```sql
CREATE DATABASE lin_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

默认配置在 [backend/src/main/resources/application.yml](/Users/liaowubing/Documents/codex_workspace/demo/backend/src/main/resources/application.yml)：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lin_blog?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
    username: root
    password:
```

如需覆盖：

```bash
export DB_USERNAME=你的用户名
export DB_PASSWORD=你的密码
```

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
npm install
npm run dev
```

访问地址：

- 前台：`http://localhost:5173`
- 后台：`http://localhost:5173/admin`

开发环境下，Vite 会把 `/api` 和 `/uploads` 代理到后端 `8080`。

## 默认后台账号

仅用于本地验证：

- 用户名：`admin`
- 密码：`admin123456`

如需覆盖：

```bash
export ADMIN_USERNAME=你的账号
export ADMIN_PASSWORD=你的密码
```

## 产品文档

- [docs/product/blog-redesign-prd.md](/Users/liaowubing/Documents/codex_workspace/demo/docs/product/blog-redesign-prd.md)
- [docs/product/blog-redesign-implementation-checklist.md](/Users/liaowubing/Documents/codex_workspace/demo/docs/product/blog-redesign-implementation-checklist.md)

## 验证约定

项目默认要求代码修改后做完整验证：

- 前端：`npm run build`
- 后端：`mvn -Dmaven.repo.local=.m2/repository -DskipTests package`
- 页面和交互：优先用 [$agent-browser](/Users/liaowubing/.codex/skills/agent-browser/SKILL.md) 做运行态验证
