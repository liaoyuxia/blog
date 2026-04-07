#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ROOT="${APP_ROOT:-$ROOT_DIR}"
BACKEND_DIR="${BACKEND_DIR:-$APP_ROOT/backend}"
FRONTEND_DIR="${FRONTEND_DIR:-$APP_ROOT/frontend}"
DEPLOY_REMOTE="${DEPLOY_REMOTE:-origin}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
BACKEND_SERVICE="${BACKEND_SERVICE:-lin-blog-backend}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-http://127.0.0.1:8080/api/health}"
MAVEN_REPO_LOCAL="${MAVEN_REPO_LOCAL:-$BACKEND_DIR/.m2/repository}"
NPM_INSTALL_MODE="${NPM_INSTALL_MODE:-always}"
RUN_GIT_PULL=1
RUN_NGINX_RELOAD=1

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  printf '\n[ERROR] %s\n' "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "缺少命令: $1"
}

run_privileged() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
    return
  fi

  if ! command -v sudo >/dev/null 2>&1; then
    fail "当前用户不是 root，且系统里没有 sudo，无法执行: $*"
  fi

  sudo "$@"
}

usage() {
  cat <<'EOF'
用法:
  ./scripts/deploy.sh [选项]

选项:
  --skip-pull          跳过 git pull
  --skip-nginx-reload  跳过 nginx 校验和重载
  --help               查看帮助

常用环境变量:
  APP_ROOT             项目根目录，默认脚本所在仓库根目录
  DEPLOY_REMOTE        Git 远程名，默认 origin
  DEPLOY_BRANCH        部署分支，默认 main
  BACKEND_SERVICE      systemd 后端服务名，默认 lin-blog-backend
  NGINX_SERVICE        systemd nginx 服务名，默认 nginx
  BACKEND_HEALTH_URL   后端健康检查地址，默认 http://127.0.0.1:8080/api/health
  NPM_INSTALL_MODE     npm 安装模式，always 或 missing，默认 always

示例:
  ./scripts/deploy.sh
  DEPLOY_BRANCH=release ./scripts/deploy.sh
  NPM_INSTALL_MODE=missing ./scripts/deploy.sh --skip-pull
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --skip-pull)
      RUN_GIT_PULL=0
      ;;
    --skip-nginx-reload)
      RUN_NGINX_RELOAD=0
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "未知参数: $1"
      ;;
  esac
  shift
done

need_cmd git
need_cmd mvn
need_cmd curl
need_cmd npm

[ -d "$APP_ROOT/.git" ] || fail "目录不是 Git 仓库: $APP_ROOT"
[ -f "$BACKEND_DIR/pom.xml" ] || fail "找不到后端 pom.xml: $BACKEND_DIR/pom.xml"
[ -f "$FRONTEND_DIR/package.json" ] || fail "找不到前端 package.json: $FRONTEND_DIR/package.json"

if ! git config --global --get-all safe.directory | grep -Fx "$APP_ROOT" >/dev/null 2>&1; then
  log "写入 Git safe.directory，避免服务器仓库所有权告警"
  git config --global --add safe.directory "$APP_ROOT"
fi

if [ "$RUN_GIT_PULL" -eq 1 ]; then
  log "更新代码: git pull $DEPLOY_REMOTE $DEPLOY_BRANCH"
  git -C "$APP_ROOT" pull --ff-only "$DEPLOY_REMOTE" "$DEPLOY_BRANCH"
else
  log "跳过 git pull，使用当前工作区代码部署"
fi

log "构建后端"
mkdir -p "$MAVEN_REPO_LOCAL"
(
  cd "$BACKEND_DIR"
  mvn -Dmaven.repo.local="$MAVEN_REPO_LOCAL" -DskipTests package
)

log "重启后端服务: $BACKEND_SERVICE"
run_privileged systemctl restart "$BACKEND_SERVICE"
run_privileged systemctl is-active --quiet "$BACKEND_SERVICE" || fail "后端服务未成功启动: $BACKEND_SERVICE"

log "检查后端健康"
curl -fsS "$BACKEND_HEALTH_URL"
printf '\n'

log "构建前端"
(
  cd "$FRONTEND_DIR"
  if [ "$NPM_INSTALL_MODE" = "always" ]; then
    npm install
  elif [ "$NPM_INSTALL_MODE" = "missing" ]; then
    [ -d node_modules ] || npm install
  else
    fail "NPM_INSTALL_MODE 仅支持 always 或 missing，当前值: $NPM_INSTALL_MODE"
  fi

  npm run build
)

if [ "$RUN_NGINX_RELOAD" -eq 1 ]; then
  log "校验并重载 Nginx"
  run_privileged nginx -t
  run_privileged systemctl reload "$NGINX_SERVICE"
else
  log "跳过 Nginx 重载"
fi

log "部署完成"
printf '项目目录: %s\n' "$APP_ROOT"
printf '后端健康检查: %s\n' "$BACKEND_HEALTH_URL"
