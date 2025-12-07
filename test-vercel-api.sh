#!/bin/bash

# Vercel Token
VERCEL_TOKEN="fwJcv18rK5gHUdvOz31FHk8y"

echo "=== 测试 Vercel API 调试 ==="
echo ""

# 1. 测试获取项目列表
echo "1. 获取项目列表..."
PROJECTS_RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects")

echo "API Response:"
echo "$PROJECTS_RESPONSE" | jq '.'
echo ""

# 2. 尝试从 v9 API 获取部署 ID
echo "2. 从 v9 API 获取部署 ID..."
DEPLOYMENT_ID=$(echo "$PROJECTS_RESPONSE" | \
  jq -r '.projects[] | select(.name=="vgbp") | .latestDeployments[0]')

echo "Deployment ID: $DEPLOYMENT_ID"

# 3. 如果 v9 没找到，尝试 v10 API
if [ -z "$DEPLOYMENT_ID" ] || [ "$DEPLOYMENT_ID" = "null" ]; then
  echo "v9 API 没找到，尝试 v10 API..."
  PROJECTS_RESPONSE_V10=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v10/projects")

  echo "v10 API Response:"
  echo "$PROJECTS_RESPONSE_V10" | jq '.projects[] | {name, id}'

  DEPLOYMENT_ID=$(echo "$PROJECTS_RESPONSE_V10" | \
    jq -r '.projects[] | select(.name=="vgbp") | .latestDeployments[0]')

  echo "Deployment ID from v10: $DEPLOYMENT_ID"
fi

# 4. 检查项目 ID
echo ""
echo "3. 获取项目 ID..."
PROJECT_ID=$(echo "$PROJECTS_RESPONSE" | \
  jq -r '.projects[] | select(.name=="vgbp") | .id')

echo "Project ID: $PROJECT_ID"

# 5. 如果有部署 ID，测试部署状态
if [ -n "$DEPLOYMENT_ID" ] && [ "$DEPLOYMENT_ID" != "null" ]; then
  echo ""
  echo "4. 检查部署状态..."
  DEPLOYMENT_RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID")

  echo "Deployment Status:"
  echo "$DEPLOYMENT_RESPONSE" | jq '.'
fi

echo ""
echo "=== 调试完成 ==="