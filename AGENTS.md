# AGENTS.md

## 项目概况

这是一个前后端分离的个人博客正式版项目。

- 后端：Spring Boot 2.7 + Spring Data JPA + MySQL
- 前端：React 18 + Vite
- 目录结构：
  - `backend`：Spring Boot 后端
  - `frontend`：React 前端

当前项目已经从早期的零依赖 demo 升级为正式工程结构，并完成过本机联调验证。

## 已完成状态

- Spring Boot 后端已成功编译并打包
- 本机 MySQL 已通过 Homebrew 安装
- MySQL 服务已启动，数据库 `lin_blog` 已创建
- React 前端依赖已安装
- Vite 前端开发服务已成功启动
- 前后端接口链路已验证可用

## 当前运行地址

- 后端：`http://localhost:8080`
- 前端：`http://localhost:5173`

后端健康检查：

- `GET /api/health`

已验证返回：

```json
{"status":"ok"}
```

## 关键配置

### Java / Maven

本机已配置：

- `JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_202.jdk/Contents/Home`
- `MAVEN_HOME=/Users/liaowubing/Documents/settings/apache-maven-3.9.14`

相关 shell 配置文件：

- `/Users/liaowubing/.zprofile`
- `/Users/liaowubing/.zshrc`
- `/Users/liaowubing/.profile`

如果新开终端后发现命令没生效，先执行：

```bash
source ~/.zprofile
source ~/.zshrc
```

### MySQL

当前本机 MySQL 由 Homebrew 安装：

- 可执行文件：`/opt/homebrew/bin/mysql`
- 服务名：`mysql`
- 版本：`9.6.0`

数据库：

- 名称：`lin_blog`
- 默认用户：`root`
- 当前默认密码：空密码

后端默认数据库配置见：

- `backend/src/main/resources/application.yml`

注意：

- 项目当前默认使用空密码连接本机 `root`
- 如果后续给 MySQL `root` 设置了密码，需要同步更新环境变量 `DB_PASSWORD` 或 `application.yml`

## 常用命令

### 后端

进入目录：

```bash
cd /Users/liaowubing/Documents/codex_workspace/demo/backend
```

打包：

```bash
mvn -Dmaven.repo.local=.m2/repository -DskipTests package
```

说明：

- 建议继续使用 `-Dmaven.repo.local=.m2/repository`
- 这样依赖会落在项目本地目录，避免写入系统目录带来的权限问题

启动：

```bash
java -jar target/blog-backend-1.0.0.jar
```

或：

```bash
./run.sh
```

### 前端

进入目录：

```bash
cd /Users/liaowubing/Documents/codex_workspace/demo/frontend
```

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev -- --host 0.0.0.0
```

或：

```bash
./run.sh
```

### MySQL

启动 / 停止 / 重启：

```bash
brew services start mysql
brew services stop mysql
brew services restart mysql
```

连接：

```bash
mysql -u root
```

创建博客数据库：

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS lin_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

查看数据库：

```bash
mysql -u root -e "SHOW DATABASES;"
```

查看博客表：

```bash
mysql -u root -D lin_blog -e "SHOW TABLES;"
```

## 后端代码结构

后端采用标准 Spring Boot 分层：

- `entity`：文章、分类、标签、留言实体
- `repository`：JPA 数据访问
- `service`：业务逻辑
- `controller`：REST 接口
- `specification`：文章筛选逻辑
- `resources/schema.sql`：建表脚本
- `resources/data.sql`：初始化数据

重要文件：

- `backend/pom.xml`
- `backend/src/main/java/com/linstudio/blog/BlogApplication.java`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/schema.sql`
- `backend/src/main/resources/data.sql`

## 前端代码结构

前端是 React + Vite 单页应用。

重要文件：

- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/src/App.jsx`
- `frontend/src/api/blog.js`
- `frontend/src/styles.css`

说明：

- Vite 已配置开发代理
- 前端访问 `/api` 时会自动转发到 `http://localhost:8080`

## 已实现功能

- 个人简介展示
- 站点统计展示
- 精选文章展示
- 文章列表展示
- 关键词搜索
- 分类筛选
- 标签筛选
- 文章详情弹层
- 留言列表
- 留言提交

## 已知注意点

- 后端依赖 MySQL，本机数据库未启动时 Spring Boot 会启动失败
- 当前默认数据库密码为空，和这台机器上的 Homebrew MySQL 安装方式一致
- Maven 在这台机器上建议显式使用项目本地 `.m2/repository`
- 早期零依赖 demo 已被正式工程替换，不要再沿用旧的原生 `HttpServer` 方案

## 建议的下一步

- 增加后台管理系统
- 增加文章分页和归档页
- 接入 Markdown 编辑器
- 增加鉴权和管理员登录
- 做生产环境部署配置
- 前端增加独立文章详情页和 SEO 支持
