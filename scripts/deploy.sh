#!/usr/bin/env bash
#
# 家庭规划 — 一键上线脚本
# 用法: npm run deploy
#       npm run deploy -- --seed    # 上线并刷新演示数据
#       npm run deploy -- --check   # 仅本地构建检查，不上线
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${ROOT_DIR}/scripts/deploy.config"

# 默认配置（可被 scripts/deploy.config 覆盖）
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-41326}"
DEPLOY_SSH_USER="${DEPLOY_SSH_USER:-root}"
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-193.134.211.194}"
DEPLOY_REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/var/www/family-planning}"
DEPLOY_PM2_NAME="${DEPLOY_PM2_NAME:-family-planning}"
DEPLOY_HEALTH_URL="${DEPLOY_HEALTH_URL:-https://yangxizhe.com/family-planning/login/}"

RUN_SEED=false
CHECK_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --seed) RUN_SEED=true ;;
    --check) CHECK_ONLY=true ;;
    -h|--help)
      cat <<'EOF'
用法: npm run deploy [-- [选项]]

选项:
  --check   仅本地 npm run build，不同步服务器
  --seed    上线后在生产库执行 npm run db:seed（演示账号）
  -h, --help  显示帮助

配置: 复制 scripts/deploy.config.example 为 scripts/deploy.config 可覆盖 SSH 等默认值
EOF
      exit 0
      ;;
    *)
      echo "未知参数: $arg（使用 --help 查看帮助）"
      exit 1
      ;;
  esac
done

if [[ -f "$CONFIG_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

SSH_TARGET="${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"
SSH_CMD=(ssh -p "$DEPLOY_SSH_PORT" -o ConnectTimeout=20 -o ServerAliveInterval=10)
RSYNC_SSH="ssh -p ${DEPLOY_SSH_PORT} -o ConnectTimeout=20 -o ServerAliveInterval=10"

TAR_EXCLUDES=(
  --exclude=node_modules
  --exclude=.next
  --exclude=.git
  --exclude=.env
  --exclude=.env.local
  --exclude=prisma/dev.db
  --exclude=prisma/dev.db-journal
  --exclude=prisma/prod.db
  --exclude=prisma/prod.db-journal
  --exclude=.DS_Store
)

log() { echo "[deploy] $*"; }

# 同步代码到远程（优先 rsync；远程无 rsync 时改用 tar+ssh）
sync_code() {
  if command -v rsync >/dev/null 2>&1 &&
    "${SSH_CMD[@]}" "$SSH_TARGET" "command -v rsync" >/dev/null 2>&1; then
    log "使用 rsync 同步..."
    rsync -avz --delete \
      --exclude node_modules/ \
      --exclude .next/ \
      --exclude .git/ \
      --exclude .env \
      --exclude .env.local \
      --exclude .env*.local \
      --exclude prisma/dev.db \
      --exclude prisma/dev.db-journal \
      --exclude prisma/prod.db \
      --exclude prisma/prod.db-journal \
      --exclude .DS_Store \
      -e "$RSYNC_SSH" \
      "${ROOT_DIR}/" "${SSH_TARGET}:${DEPLOY_REMOTE_DIR}/"
    return
  fi

  log "远程未安装 rsync，使用 tar+ssh 同步..."
  "${SSH_CMD[@]}" "$SSH_TARGET" "mkdir -p '${DEPLOY_REMOTE_DIR}'"
  # macOS 打包时禁用 xattr，避免 Linux 解压刷屏警告
  run_tar() {
    COPYFILE_DISABLE=1 COPY_EXTENDED_ATTRIBUTES_DISABLE=1 tar "$@" czf - \
      "${TAR_EXCLUDES[@]}" -C "${ROOT_DIR}" .
  }
  if tar --help 2>&1 | grep -q 'disable-copyfile'; then
    run_tar --disable-copyfile | \
      "${SSH_CMD[@]}" "$SSH_TARGET" "cd '${DEPLOY_REMOTE_DIR}' && tar xzf - 2>/dev/null"
  else
    run_tar | \
      "${SSH_CMD[@]}" "$SSH_TARGET" "cd '${DEPLOY_REMOTE_DIR}' && tar xzf - 2>/dev/null"
  fi
}

# 等待 URL 返回 HTTP 200（PM2 重启后 Next.js 约需 1–3 秒就绪）
wait_for_health() {
  local url="$1"
  local max_attempts="${2:-20}"
  local attempt=1
  local http_code="000"

  while [[ "$attempt" -le "$max_attempts" ]]; do
    http_code="$(curl -sI -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")"
    if [[ "$http_code" == "200" ]]; then
      log "上线成功 (HTTP ${http_code}) → ${url}"
      return 0
    fi
    log "健康检查 ${attempt}/${max_attempts}: HTTP ${http_code}，等待应用就绪..."
    sleep 2
    attempt=$((attempt + 1))
  done

  log "警告: 健康检查失败 (最后 HTTP ${http_code})，请查看 pm2 logs ${DEPLOY_PM2_NAME}"
  return 1
}

cd "$ROOT_DIR"

log "本地构建检查..."
npm run build

if [[ "$CHECK_ONLY" == true ]]; then
  log "仅检查模式，跳过上线。"
  exit 0
fi

log "同步代码 → ${SSH_TARGET}:${DEPLOY_REMOTE_DIR}"
sync_code

log "远程安装依赖、迁移、构建、重启..."
"${SSH_CMD[@]}" "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
cd "${DEPLOY_REMOTE_DIR}"

if [[ ! -f .env ]]; then
  echo "错误: 服务器缺少 .env，请先配置 DATABASE_URL 与 SESSION_SECRET"
  exit 1
fi

npm ci --include=dev
npx prisma migrate deploy
npm run build

if pm2 describe "${DEPLOY_PM2_NAME}" >/dev/null 2>&1; then
  pm2 restart "${DEPLOY_PM2_NAME}"
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

if [[ "${RUN_SEED}" == "true" ]]; then
  npm run db:seed
fi

echo "等待应用就绪..."
ready=false
for i in \$(seq 1 30); do
  if curl -sf "http://127.0.0.1:3042/family-planning/login/" >/dev/null; then
    ready=true
    break
  fi
  sleep 1
done
if [[ "\$ready" != "true" ]]; then
  echo "警告: 本地端口 3042 未在 30 秒内响应"
  exit 1
fi

echo "远程部署完成"
REMOTE

log "健康检查 ${DEPLOY_HEALTH_URL}"
wait_for_health "${DEPLOY_HEALTH_URL}" 15
