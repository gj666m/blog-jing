# VPS 部署与运维

## 部署架构

```
本地开发 → pnpm build → rsync 到 VPS /tmp/ → sudo cp 到 /var/www/blog-jing/
                                                      ↓
                                              Nginx (8080 端口)
                                                      ↓
                                            http://IP:8080 访问
```

## 部署脚本（deploy/deploy.sh）

```bash
#!/bin/bash
set -e

SERVER_IP="106.52.244.190"
REMOTE_PATH="/var/www/blog-jing"

# 1. 本地构建
pnpm build

# 2. rsync 到临时目录（非 root 用户避免权限问题）
rsync -avz --delete dist/ ubuntu@${SERVER_IP}:/tmp/blog-jing-deploy/

# 3. 移动到网站目录
ssh ubuntu@${SERVER_IP} \
  "sudo rm -rf ${REMOTE_PATH}/* && \
   sudo cp -r /tmp/blog-jing-deploy/* ${REMOTE_PATH}/ && \
   sudo rm -rf /tmp/blog-jing-deploy"
```

关键点：
- rsync 用非 root 用户，先传到 `/tmp/` 再 `sudo cp` 到目标目录
- `--delete` 确保服务器目录与本地构建产物完全一致
- 每次部署是全量替换，简单可靠

## Nginx 配置要点

```nginx
server {
    listen 8080;
    server_name blog.gjinggg.art 106.52.244.190;
    root /var/www/blog-jing;
    index index.html;

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # 静态资源缓存 30 天
    location /_astro/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # HTML 不缓存（确保内容更新立即生效）
    location / {
        try_files $uri $uri/ $uri/index.html =404;
        add_header Cache-Control "no-cache";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### Nginx 配置步骤

```bash
# 1. 创建配置文件
sudo nano /etc/nginx/sites-available/blog-jing

# 2. 创建软链接启用
sudo ln -sf /etc/nginx/sites-available/blog-jing /etc/nginx/sites-enabled/

# 3. 验证配置
sudo nginx -t

# 4. 重载
sudo nginx -s reload
```

注意：`ln -sf` 创建软链接后要 `ls -la /etc/nginx/sites-enabled/` 确认实际生效。

## DNS 配置

- 添加 A 记录：`blog` → 服务器 IP
- 主域名备案后所有子域名自动生效
- DNS 生成通常需要几分钟到几小时

## 备案流程

- 国内服务器绑定域名需先完成 ICP 备案
- 在云服务商（腾讯云/阿里云）控制台提交备案申请
- 主域名备案一次，所有子域名通用
- 备案周期通常 1-2 周
- 备案通过后：域名访问 → 配 SSL（Certbot）→ Nginx 切 80/443 端口

## 备案通过后操作

1. Certbot 申请 SSL 证书
2. Nginx 配置 443 端口 + HTTP→HTTPS 重定向
3. 更新 Umami 跟踪脚本地址为 https://
4. 防火墙放行 80/443 端口
