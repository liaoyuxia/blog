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

- 云服务器系统：CentOS / Alibaba Cloud Linux
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
sudo yum update -y
sudo yum install -y git curl unzip nginx java-17-openjdk-devel maven
```

安装 Node.js 20：

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

说明：

- 如果你的系统使用的是 `dnf` 而不是 `yum`，把上面的 `yum` 替换成 `dnf` 即可
- MySQL 在 CentOS / Alibaba Cloud Linux 上的安装方式差异较大，本文下面默认你已经装好 MySQL 8 并能正常执行 `mysql --version`
- 如果你还没装 MySQL，建议优先按云厂商文档或 MySQL 官方仓库文档安装，再继续后面的数据库配置步骤

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

说明：

- 上面示例使用的是 `git clone 你的仓库地址 .`，含义是“把仓库内容直接拉到当前目录”，这样项目根目录就是 `/srv/lin-blog`
- 如果你执行的是 `git clone 你的仓库地址`，Git 会自动再创建一层仓库名目录，例如 `/srv/lin-blog/blog`
- 这两种方式都可以，但后续所有路径必须和你的真实项目根目录保持一致
- 可以先执行 `pwd` 和 `ls` 确认当前项目根目录，再继续配置 `systemd` 和 `Nginx`
- 后文默认项目根目录记为“实际项目根目录”，请按你的机器真实路径替换

### 3. 配置 MySQL

启动 MySQL：

```bash
sudo systemctl enable mysqld
sudo systemctl start mysqld
```

说明：

- 在 RPM 系发行版里，MySQL 服务名通常是 `mysqld`
- 如果你的环境里实际服务名是 `mysql`，把上面命令里的 `mysqld` 替换掉即可

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

如果你的仓库是拉到带仓库名的子目录里，例如：

```text
/srv/lin-blog/blog
```

那这里应该改成：

```bash
cd /srv/lin-blog/blog/backend
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
# [Unit] 区块：描述服务本身，以及它和其他系统服务的启动顺序
[Unit]
# 服务名称说明，执行 systemctl status 时会显示这段描述
Description=Lin Blog Spring Boot Backend
# 表示网络和 MySQL 就绪后，再启动当前服务
After=network.target mysqld.service

# [Service] 区块：定义服务如何启动、以什么身份运行、异常后如何处理
[Service]
# simple 表示直接把 ExecStart 启动的主进程作为服务进程
Type=simple
# 这里演示用 root 启动；生产环境更建议改成专用用户，例如 blog
User=root
# 服务运行目录，等价于先 cd 到该目录再执行启动命令。这里一定要改成你的真实后端目录
WorkingDirectory=/srv/lin-blog/backend
# 读取外部环境变量文件，数据库账号密码建议放这里，不要写死在 service 文件中
EnvironmentFile=/etc/lin-blog-backend.env
# 真正的启动命令：用 Java 启动 Spring Boot 打包后的 jar。jar 路径也必须和真实目录一致
ExecStart=/usr/bin/java -jar /srv/lin-blog/backend/target/blog-backend-1.0.0.jar
# 143 一般表示进程被正常终止，避免 systemd 误判为异常退出
SuccessExitStatus=143
# 服务异常退出后自动重启
Restart=always
# 每次重启前等待 5 秒，避免频繁拉起
RestartSec=5

# [Install] 区块：定义这个服务被 systemd 纳入哪一种启动目标
[Install]
# 挂到多用户运行级别，配合 enable 后可实现开机自启
WantedBy=multi-user.target
EOF
```

重要：

- 如果你的真实项目根目录不是 `/srv/lin-blog`，这里的 `WorkingDirectory` 和 `ExecStart` 必须一起改
- 例如你是用 `git clone 仓库地址` 拉下来的，实际目录可能是 `/srv/lin-blog/blog`
- 那么应该写成：

```ini
WorkingDirectory=/srv/lin-blog/blog/backend
ExecStart=/usr/bin/java -jar /srv/lin-blog/blog/backend/target/blog-backend-1.0.0.jar
```

- 如果这里路径写错，`systemd` 常见报错就是 `status=200/CHDIR`，表示工作目录切换失败，服务其实还没真正启动

加载并启动：

```bash
# 重新加载 systemd 配置文件。只要你修改了 .service 文件，就要执行一次
sudo systemctl daemon-reload
# 设置开机自启
sudo systemctl enable lin-blog-backend
# 立刻启动服务
sudo systemctl start lin-blog-backend
```

查看状态和日志：

```bash
# 查看当前服务状态、最近日志和退出码
sudo systemctl status lin-blog-backend
# 实时跟踪这个服务的日志输出，排查启动失败时很常用
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

如果你的仓库是拉到带仓库名的子目录里，例如：

```text
/srv/lin-blog/blog
```

那这里应该改成：

```bash
cd /srv/lin-blog/blog/frontend
npm install
npm run build
```

打包完成后，静态文件默认在：

```text
frontend/dist
```

### 8. 配置 Nginx

CentOS / Alibaba Cloud Linux 常见目录结构不是 `sites-available` / `sites-enabled`，而是直接使用 `conf.d/*.conf`。

创建站点配置：

```bash
sudo tee /etc/nginx/conf.d/lin-blog.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name 你的域名或服务器IP;

    # 前端静态文件目录。这里必须改成你的真实 dist 目录
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

重要：

- 如果你的真实项目根目录不是 `/srv/lin-blog`，这里的 `root` 路径也必须一起改
- 例如你是用 `git clone 仓库地址` 拉下来的，实际目录可能是 `/srv/lin-blog/blog`
- 那么这里应该写成：

```nginx
root /srv/lin-blog/blog/frontend/dist;
```

- 如果 `root` 路径写错，常见现象是：
  - 打开首页返回 `404`
  - Nginx 欢迎页没有被替换
  - 前端静态资源 `js`、`css` 返回 `404`

- 改完后一定执行下面两步：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

检查并重载 Nginx：

```bash
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
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名
```

如果你的系统使用的是 `dnf`，同样把 `yum` 替换成 `dnf`。

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

如果你的服务器目录里已经拉好仓库，也可以直接使用仓库内脚本一键发布：

```bash
cd /srv/lin-blog/blog
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

说明：

- `scripts/deploy.sh` 会自动执行 `git pull --ff-only origin main`
- 脚本会依次完成后端打包、重启 `lin-blog-backend`、本机健康检查、前端构建，以及 `nginx -t` 和 `systemctl reload nginx`
- 脚本会自动补一次 `git safe.directory`，避免服务器上出现“可疑的仓库所有权”报错
- 如果你已经手动拉过代码，可用 `./scripts/deploy.sh --skip-pull` 跳过 `git pull`
- 如果你的服务名、分支名或部署目录不同，可以通过环境变量覆盖，执行 `./scripts/deploy.sh --help` 查看完整说明

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
