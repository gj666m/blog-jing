#!/bin/bash
# 部署脚本：构建并同步到 VPS
# 用法：./deploy/deploy.sh

set -e

SERVER_IP="106.52.244.190"
REMOTE_PATH="/var/www/blog-jing"

echo "🔨 构建站点..."
pnpm build

echo "📤 同步到服务器（先传到临时目录）..."
rsync -avz --delete dist/ ubuntu@${SERVER_IP}:/tmp/blog-jing-deploy/

echo "📋 移动到网站目录..."
ssh ubuntu@${SERVER_IP} "sudo rm -rf ${REMOTE_PATH}/* && sudo cp -r /tmp/blog-jing-deploy/* ${REMOTE_PATH}/ && sudo rm -rf /tmp/blog-jing-deploy"

echo "✅ 部署完成！访问 http://blog.gjinggg.art"
