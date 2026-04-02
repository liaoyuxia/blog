# 个人博客正式版

这是一个前后端分离的个人博客正式版骨架，技术栈为：

- 后端：Spring Boot 2.7 + Spring Data JPA + MySQL
- 前端：React 18 + Vite

项目目录保持为两层：

```text
demo
├── backend   # Spring Boot 后端
└── frontend  # React 前端
```

## 已完成功能

- 个人简介展示
- 站点统计展示
- 精选文章展示
- 文章列表展示
- 按关键词搜索文章
- 按分类筛选文章
- 按标签筛选文章
- 文章详情弹层
- 留言列表展示
- 留言提交

## 后端结构

后端采用标准 Spring Boot 分层：

- `entity`：文章、分类、标签、留言实体
- `repository`：JPA 数据访问层
- `service`：业务逻辑层
- `controller`：REST 接口层
- `specification`：文章筛选查询逻辑

主要文件：

- [backend/pom.xml](/Users/liaowubing/Documents/codex_workspace/demo/backend/pom.xml)
- [backend/src/main/java/com/linstudio/blog/BlogApplication.java](/Users/liaowubing/Documents/codex_workspace/demo/backend/src/main/java/com/linstudio/blog/BlogApplication.java)
- [backend/src/main/resources/application.yml](/Users/liaowubing/Documents/codex_workspace/demo/backend/src/main/resources/application.yml)
- [backend/src/main/resources/schema.sql](/Users/liaowubing/Documents/codex_workspace/demo/backend/src/main/resources/schema.sql)
- [backend/src/main/resources/data.sql](/Users/liaowubing/Documents/codex_workspace/demo/backend/src/main/resources/data.sql)

### 后端接口

- `GET /api/health`
- `GET /api/profile`
- `GET /api/stats`
- `GET /api/categories`
- `GET /api/tags`
- `GET /api/posts`
- `GET /api/posts/{slug}`
- `GET /api/messages`
- `POST /api/messages`

## MySQL 准备

先创建数据库：

```sql
CREATE DATABASE lin_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

默认连接配置在 [backend/src/main/resources/application.yml](/Users/liaowubing/Documents/codex_workspace/demo/backend/src/main/resources/application.yml)：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lin_blog?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
    username: root
    password:
```

也可以用环境变量覆盖：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=lin_blog
export DB_USERNAME=root
export DB_PASSWORD=
```

应用启动时会自动执行：

- `schema.sql` 建表
- `data.sql` 初始化演示数据

### MySQL 常用命令

安装完成后，常用操作可以直接参考下面这些命令：

```bash
# 启动 / 停止 / 重启 MySQL 服务
brew services start mysql
brew services stop mysql
brew services restart mysql

# 连接本地 MySQL
mysql -u root

# 创建博客数据库
mysql -u root -e "CREATE DATABASE IF NOT EXISTS lin_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 查看数据库
mysql -u root -e "SHOW DATABASES;"

# 查看博客数据库中的表
mysql -u root -D lin_blog -e "SHOW TABLES;"

# 进入博客数据库
mysql -u root lin_blog

# 如果你后面给 root 设置了密码
mysql -u root -p
```

## 启动方式

### 1. 启动后端

需要本机已安装：

- JDK 8+
- Maven 3.8+
- MySQL 8+

执行：

```bash
cd backend
mvn spring-boot:run
```

或：

```bash
./run.sh
```

后端默认地址：

```text
http://localhost:8080
```

### 2. 启动前端

需要本机已安装：

- Node.js 18+
- npm 9+

执行：

```bash
cd frontend
npm install
npm run dev
```

或：

```bash
./run.sh
```

前端默认地址：

```text
http://localhost:5173
```

Vite 已配置开发代理，前端访问 `/api` 时会自动转发到后端 `8080` 端口。

## 部署到云服务器

下面给出一套适合当前项目的部署方式，默认场景为：

- 云服务器系统：Ubuntu 22.04 / 24.04
- Web 服务：Nginx
- 后端：Spring Boot Jar
- 前端：React 打包后静态资源
- 数据库：MySQL

### 1. 服务器初始化

先登录服务器：

```bash
ssh root@你的服务器IP
```

更新系统并安装基础依赖：

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip nginx mysql-server openjdk-17-jdk maven
```

安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

验证版本：

```bash
java -version
mvn -v
node -v
npm -v
mysql --version
nginx -v
```

### 2. 拉取项目代码

创建部署目录并拉代码：

```bash
sudo mkdir -p /srv/lin-blog
sudo chown -R $USER:$USER /srv/lin-blog
cd /srv/lin-blog
git clone 你的仓库地址 .
```

### 3. 配置 MySQL

启动 MySQL：

```bash
sudo systemctl enable mysql
sudo systemctl start mysql
```

进入 MySQL：

```bash
sudo mysql
```

执行下面的 SQL，创建生产数据库和独立用户：

```sql
CREATE DATABASE lin_blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY '请替换成强密码';
GRANT ALL PRIVILEGES ON lin_blog.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

说明：

- 生产环境不要继续使用 `root`
- 生产环境也不要把数据库密码直接写死在代码里

### 4. 构建后端

进入后端目录并打包：

```bash
cd /srv/lin-blog/backend
mvn -Dmaven.repo.local=.m2/repository -DskipTests package
```

打包产物默认会生成在：

```text
backend/target/blog-backend-1.0.0.jar
```

### 5. 配置后端环境变量

建议把数据库连接单独写到环境文件中，例如：

```bash
sudo tee /etc/lin-blog-backend.env > /dev/null <<'EOF'
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=lin_blog
DB_USERNAME=blog_user
DB_PASSWORD=请替换成强密码
EOF
```

### 6. 配置 systemd 管理 Spring Boot

创建服务文件：

```bash
sudo tee /etc/systemd/system/lin-blog-backend.service > /dev/null <<'EOF'
[Unit]
Description=Lin Blog Spring Boot Backend
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/srv/lin-blog/backend
EnvironmentFile=/etc/lin-blog-backend.env
ExecStart=/usr/bin/java -jar /srv/lin-blog/backend/target/blog-backend-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

加载并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable lin-blog-backend
sudo systemctl start lin-blog-backend
```

查看状态和日志：

```bash
sudo systemctl status lin-blog-backend
sudo journalctl -u lin-blog-backend -f
```

如果后端成功启动，先本机检查一次：

```bash
curl http://127.0.0.1:8080/api/health
```

### 7. 构建前端

进入前端目录：

```bash
cd /srv/lin-blog/frontend
npm install
npm run build
```

打包完成后，静态文件默认在：

```text
frontend/dist
```

### 8. 配置 Nginx

创建站点配置：

```bash
sudo tee /etc/nginx/sites-available/lin-blog > /dev/null <<'EOF'
server {
    listen 80;
    server_name 你的域名或服务器IP;

    root /srv/lin-blog/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

启用配置并重载 Nginx：

```bash
sudo ln -sf /etc/nginx/sites-available/lin-blog /etc/nginx/sites-enabled/lin-blog
sudo nginx -t
sudo systemctl restart nginx
```

### 9. 开放云服务器安全组端口

至少放行这些端口：

- `22`：SSH
- `80`：HTTP
- `443`：HTTPS

说明：

- 不建议直接把 `3306` 暴露到公网
- 后端 `8080` 也建议仅本机开放，由 Nginx 反代

### 10. 配置 HTTPS

如果你有域名，建议继续安装 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名
```

### 11. 更新部署

后续更新代码时，常见流程如下：

```bash
cd /srv/lin-blog
git pull

cd backend
mvn -Dmaven.repo.local=.m2/repository -DskipTests package
sudo systemctl restart lin-blog-backend

cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

### 12. 部署注意点

- 生产环境建议把 `DB_PASSWORD` 放到环境变量或单独的 env 文件中
- 生产环境建议使用独立数据库用户，不要使用 `root`
- 如果你启用了防火墙，记得同步放行 `80` 和 `443`
- 如果你的 MySQL 不和应用部署在同一台机器上，需要把 `DB_HOST` 改成数据库服务器地址

## 当前环境说明

这次项目已经完成了本机验证：

- Spring Boot 后端已成功编译并可连接本地 MySQL
- 本机 MySQL 已安装并创建了 `lin_blog` 数据库
- 如果前端还没启动，通常只需要确保本机已安装 Node.js 并执行 `npm install`

## 后续建议

下一步很适合继续做这些：

- 增加后台管理系统
- 增加文章分页和归档页
- 给文章增加封面图上传
- 接入 Markdown 编辑器
- 增加管理员登录与鉴权
- 做生产环境部署配置
