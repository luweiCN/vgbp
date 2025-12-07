#!/bin/bash

# Vercel Token
VERCEL_TOKEN="fwJcv18rK5gHUdvOz31FHk8y"

echo "=== 测试 Vercel Promotion ==="
echo ""

# 获取最新的预览部署 ID
echo "1. 获取最新预览部署 ID..."
PROJECT_ID="prj_SiwSlBMVGfB40XVxSYaKPeh9ObsU"

# 获取最新部署
DEPLOYMENT_ID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/deployments?limit=1" | \
  jq -r '.deployments[0].uid')

echo "Latest Deployment ID: $DEPLOYMENT_ID"

# 检查部署状态
if [ -n "$DEPLOYMENT_ID" ] && [ "$DEPLOYMENT_ID" != "null" ]; then
  echo ""
  echo "2. 检查部署状态..."
  DEPLOYMENT_RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID")

  READY_STATE=$(echo "$DEPLOYMENT_RESPONSE" | jq -r '.readyState')
  READY_SUBSTATE=$(echo "$DEPLOYMENT_RESPONSE" | jq -r '.readySubstate')
  TARGET=$(echo "$DEPLOYMENT_RESPONSE" | jq -r '.target')

  echo "Ready State: $READY_STATE"
  echo "Ready Substate: $READY_SUBSTATE"
  echo "Target: $TARGET"

  # 如果是 preview 环境且已就绪，则进行 promotion
  if [ "$READY_STATE" = "READY" ] && [ "$TARGET" = "null" ]; then
    echo ""
    echo "3. Promotion 到生产环境..."

    # 使用正确的 API 端点
    PROMOTE_RESPONSE=$(curl -s -X POST \
      -H "Authorization: Bearer $VERCEL_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{}" \
      "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID/promote")

    echo "Promotion Response:"
    echo "$PROMOTE_RESPONSE" | jq .

    if [ "$(echo "$PROMOTE_RESPONSE" | jq -r '.ready')" = "true" ]; then
      echo "✅ Promotion 成功!"
      echo "🌐 Production URL: https://vgbp.luwei.host"
    else
      echo "❌ Promotion 失败"
    fi
  elif [ "$TARGET" = "production" ]; then
    echo ""
    echo "✅ 已经在生产环境"
  else
    echo ""
    echo "⚠️  部署未就绪，无法 promotion"
  fi
else
  echo ""
  echo "❌ 无法获取部署 ID"
fi