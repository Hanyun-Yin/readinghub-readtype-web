#!/usr/bin/env bash
# 部署 readinghub 阅读人格测试 → Vercel（纯静态站，零构建）
# 用法：代理开启后  bash deploy.sh
# 首次会引导浏览器登录（vercel login），之后直接 prod 上线
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")"

PROJ="readinghub-readtype"

echo "▶ 登录态检查 (vercel whoami)"
vercel whoami || true

echo "▶ 关联项目 (vercel link)"
vercel link --yes >/dev/null 2>&1 || vercel link --yes

echo "▶ 生产部署 (vercel deploy --prod)"
vercel deploy --prod --yes --name "$PROJ"

echo "✅ 完成。URL: https://${PROJ}.vercel.app"
