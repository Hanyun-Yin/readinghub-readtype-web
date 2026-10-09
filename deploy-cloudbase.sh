#!/usr/bin/env bash
# 部署 readinghub 阅读人格测试 → CloudBase 静态托管（境内直连，无需代理）
# 用法：代理变量清理后  bash deploy-cloudbase.sh
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")"
ENV_ID="reading-hub-test-d9ec9ie9641f06b"

# 清掉可能残留的失效 proxy 变量（境内裸直连即可）
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy NO_PROXY no_proxy

echo "▶ 检查 tcb 登录态"
tcb whoami >/dev/null 2>&1 || {
  echo "未登录，需要临时凭证（从 CloudBase MCP 拿）"
  echo "请运行：tcb login --apiKeyId <SID> --apiKey <SCK> --token <TOKEN> --env-id $ENV_ID"
  exit 1
}

echo "▶ 上传静态站到 CloudBase 托管"
tcb hosting deploy "$PWD/index.html" /index.html -e "$ENV_ID" 2>&1 | grep -E 'Deployment completed|✔|✖' || true
tcb hosting deploy "$PWD/app.js" /app.js -e "$ENV_ID" 2>&1 | grep -E 'Deployment completed|✔|✖' || true

URL=$(tcb hosting info -e "$ENV_ID" --json 2>/dev/null | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try{const j=JSON.parse(d);console.log(j.data?.url||j.url||'');}catch{console.log('')}
});")
echo "✅ 部署完成。访问地址：https://${ENV_ID}-1501426309.tcloudbaseapp.com/index.html"
