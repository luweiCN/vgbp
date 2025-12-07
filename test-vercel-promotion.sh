#!/bin/bash

# 设置环境变量
export VERCEL_TOKEN="fwJcv18rK5gHUdvOz31FHk8y"
export VERCEL_ORG_ID="team_a3D6DLejMClojs4gKaFvDat8"
export VERCEL_PROJECT_ID="prj_SiwSlBMVGfB40XVxSYaKPeh9ObsU"

# 要查找的 commit hash（从 workflow log 中获取）
COMMIT_SHA="4e5019e83fde8497eb6691306964f4eff6976fe1"
SHORT_SHA=${COMMIT_SHA:0:7}

echo "=== Vercel Promotion 测试 ==="
echo "Commit SHA: $COMMIT_SHA"
echo "Short SHA: $SHORT_SHA"
echo ""

# 1. 安装 Vercel CLI（如果还没有）
echo "1. 检查/安装 Vercel CLI..."
npm list -g vercel || npm install -g vercel@latest

# 2. 设置项目配置
echo ""
echo "2. 设置项目配置..."
mkdir -p .vercel
cat > .vercel/project.json << EOF
{
  "orgId": "$VERCEL_ORG_ID",
  "projectId": "$VERCEL_PROJECT_ID"
}
EOF

# 3. 拉取项目信息
echo ""
echo "3. 拉取项目信息..."
vercel pull --yes --environment=production --token=$VERCEL_TOKEN

# 4. 获取部署列表
echo ""
echo "4. 获取部署列表..."
echo "运行: vercel ls --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID --yes"
echo ""

# 获取完整的部署列表
vercel ls --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID --yes > vercel-deployments.txt

echo "完整部署列表："
cat vercel-deployments.txt
echo ""

# 查找包含 commit 的部署
echo "查找包含 commit $SHORT_SHA 的部署："
grep "$SHORT_SHA" vercel-deployments.txt || echo "未找到包含该 commit 的部署"

# 5. 尝试不同的搜索方式
echo ""
echo "5. 尝试不同的搜索方式..."

# 方式1: 直接搜索短 hash
echo "方式1: 搜索短 hash"
DEPLOYMENT_URL=$(grep "$SHORT_SHA" vercel-deployments.txt | head -1 | awk '{print $2}')
if [ -n "$DEPLOYMENT_URL" ]; then
  echo "找到部署 URL: $DEPLOYMENT_URL"
else
  echo "未找到"
fi

# 方式2: 使用 API 获取最新部署
echo ""
echo "方式2: 使用 API 获取最新部署"
echo "API 请求: curl -s -H \"Authorization: Bearer \$VERCEL_TOKEN\" \"https://api.vercel.com/v6/deployments?limit=10&projectId=\$VERCEL_PROJECT_ID\""

# 获取 API 响应
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?limit=10&projectId=$VERCEL_PROJECT_ID" | \
  jq '.deployments[] | {uid: .uid, readyState: .readyState, created: .createdAt, commit: .meta.githubCommitSha}' > api-deployments.json

echo ""
echo "API 返回的部署列表："
cat api-deployments.json | jq .

# 查找匹配的部署
echo ""
echo "查找匹配 commit $SHORT_SHA 的部署："
MATCHING_DEPLOYMENT=$(cat api-deployments.json | jq -r ".deployments[] | select(.commit | test(\"$SHORT_SHA\")) | .uid" 2>/dev/null || jq -r ".[] | select(.commit | test(\"$SHORT_SHA\")) | .uid" api-deployments.json)

if [ -n "$MATCHING_DEPLOYMENT" ] && [ "$MATCHING_DEPLOYMENT" != "null" ]; then
  echo "找到部署 ID: $MATCHING_DEPLOYMENT"

  # 获取部署的 URL
  DEPLOY_URL=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v13/deployments/$MATCHING_DEPLOYMENT" | \
    jq -r '.url')

  echo "部署 URL: $DEPLOY_URL"

  # 6. 尝试 promotion
  echo ""
  echo "6. 尝试 promotion..."
  if vercel promote $DEPLOY_URL --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID; then
    echo "✅ Promotion 成功！"
  else
    echo "❌ Promotion 失败"
  fi
else
  echo "未找到匹配的部署"
fi

# 清理
rm -f vercel-deployments.txt api-deployments.json
rm -rf .vercel

echo ""
echo "=== 测试完成 ==="